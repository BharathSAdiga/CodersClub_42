import pytest
from decimal import Decimal
from datetime import datetime, timezone

from backend.app.schemas.resilience import (
    DebtObligation,
    ShockScenarioInput,
    ShockSimulationResult
)
from backend.app.schemas.transaction import Transaction
from backend.app.modules.resilience_engine import (
    reconstruct_monthly_cashflow,
    match_debt_obligations,
    calculate_affordability,
    calculate_standard_amortization_emi,
    calculate_max_affordable_principal_from_emi,
    compare_repayment_structures,
    evaluate_stress_scenarios_suite,
    run_cashflow_stress_simulation
)

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

# 1. Test: Healthy business
def test_healthy_business():
    turnover = Decimal("500000.00")
    expenses = Decimal("320000.00")  # 64% operating ratio
    buffer = Decimal("200000.00")
    
    result = run_cashflow_stress_simulation(
        business_id="msme_healthy",
        monthly_turnover=turnover,
        operating_expense_ratio=Decimal("0.64"),
        liquidity_buffer_inr=buffer
    )
    assert result.resilience_classification in ["HIGHLY_RESILIENT", "MODERATELY_RESILIENT"]
    assert result.affordability.unencumbered_monthly_cash_surplus > Decimal("100000.00")
    assert result.affordability.maximum_affordable_loan_principal > Decimal("500000.00")
    assert len(result.scenario_suite_evaluations) == 7

# 2. Test: Low-revenue business
def test_low_revenue_business():
    # Micro Kirana with 35,000 monthly turnover
    turnover = Decimal("35000.00")
    result = run_cashflow_stress_simulation(
        business_id="msme_micro",
        monthly_turnover=turnover,
        operating_expense_ratio=Decimal("0.75"),
        liquidity_buffer_inr=Decimal("10000.00")
    )
    surplus = result.affordability.unencumbered_monthly_cash_surplus
    assert surplus == Decimal("8750.00")
    # Max EMI is capped at 50% FOIR = 4375
    assert result.affordability.maximum_affordable_monthly_emi == Decimal("4375.00")
    assert result.affordability.maximum_affordable_loan_principal > Decimal("0.0")
    assert result.affordability.maximum_affordable_loan_principal <= Decimal("50000.00")

# 3. Test: Negative cash-flow business
def test_negative_cashflow_business():
    turnover = Decimal("80000.00")
    # Operating expenses exceed revenues (Loss making)
    result = run_cashflow_stress_simulation(
        business_id="msme_loss",
        monthly_turnover=turnover,
        operating_expense_ratio=Decimal("1.25"),  # 100,000 expenses
        liquidity_buffer_inr=Decimal("15000.00")
    )
    assert result.affordability.net_operating_surplus_pre_debt == Decimal("-20000.00")
    assert result.affordability.unencumbered_monthly_cash_surplus == Decimal("-20000.00")
    # Strict boundary: Zero affordable debt capacity
    assert result.affordability.maximum_affordable_monthly_emi == Decimal("0.0")
    assert result.affordability.maximum_affordable_loan_principal == Decimal("0.0")
    assert result.resilience_classification == "CRITICAL_ILLIQUIDITY"

# 4. Test: Seasonal business
def test_seasonal_business():
    turnover = Decimal("250000.00")
    # Seasonality index 1.8x
    result = run_cashflow_stress_simulation(
        business_id="msme_seasonal",
        monthly_turnover=turnover,
        operating_expense_ratio=Decimal("0.70"),
        liquidity_buffer_inr=Decimal("80000.00"),
        seasonality_index=1.80
    )
    # Check scenario suite seasonal downturn evaluation
    seasonal_eval = next(s for s in result.scenario_suite_evaluations if s.scenario_id == "SEASONAL_DOWNTURN")
    assert seasonal_eval is not None
    assert seasonal_eval.projected_monthly_cash_surplus < result.affordability.unencumbered_monthly_cash_surplus
    
    # Check repayment structure comparisons
    comparisons = result.affordability.repayment_comparisons
    seasonal_struct = next(c for c in comparisons if c.structure_type == "SEASONALITY_ADJUSTED")
    assert seasonal_struct.peak_monthly_payment > seasonal_struct.average_monthly_payment
    assert seasonal_struct.trough_monthly_payment < seasonal_struct.average_monthly_payment

# 5. Test: Existing debt obligations (Matching & single-counting)
def test_existing_debt_obligations():
    decl_1 = DebtObligation(obligation_id="d1", lender_name="SBI", monthly_payment=Decimal("5000.00"), source="DECLARED")
    decl_2 = DebtObligation(obligation_id="d2", lender_name="HDFC", monthly_payment=Decimal("3000.00"), source="DECLARED")
    verif_1 = DebtObligation(obligation_id="v1", lender_name="SBI Auto-Debit", monthly_payment=Decimal("5000.00"), source="VERIFIED_BANK_DEBIT")
    
    matched, unmatched_decl, unmatched_verif, total = match_debt_obligations(
        declared_obligations=[decl_1, decl_2],
        verified_obligations=[verif_1]
    )
    # d1 and v1 match (5000 counted once) + d2 (3000 unmatched) = 8000
    assert len(matched) == 1
    assert len(unmatched_decl) == 1
    assert total == Decimal("8000.00")

# 6. Test: Zero-debt business
def test_zero_debt_business():
    affordability = calculate_affordability(
        monthly_operating_inflow=Decimal("120000.00"),
        monthly_operating_expenses=Decimal("80000.00"),
        declared_obligations=[],
        verified_obligations=[],
        proposed_loan_amount_inr=Decimal("0.0")
    )
    assert affordability.is_debt_free is True
    assert affordability.projected_dscr is None
    assert affordability.reconciled_existing_debt_service == Decimal("0.0")

# 7. Test: Revenue shock scenarios
def test_revenue_shock_scenarios():
    turnover = Decimal("200000.00")
    expenses = Decimal("140000.00")
    buffer = Decimal("80000.00")
    
    suite = evaluate_stress_scenarios_suite(
        baseline_inflow=turnover,
        baseline_expenses=expenses,
        existing_debt_service=Decimal("5000.00"),
        proposed_emi=Decimal("10000.00"),
        liquidity_buffer_inr=buffer
    )
    
    # 15% drop
    drop_15 = next(s for s in suite if s.scenario_id == "REVENUE_DROP_15")
    assert drop_15.projected_monthly_cash_surplus == (turnover * Decimal("0.85") - expenses - Decimal("5000.00"))
    
    # 30% drop for 2 months
    drop_30 = next(s for s in suite if s.scenario_id == "REVENUE_DROP_30_TWO_MONTHS")
    assert drop_30.minimum_cash_balance is not None
    assert drop_30.minimum_cash_balance < buffer

# 8. Test: Operating expense inflation scenario
def test_expense_inflation_scenario():
    turnover = Decimal("100000.00")
    expenses = Decimal("70000.00")
    suite = evaluate_stress_scenarios_suite(
        baseline_inflow=turnover,
        baseline_expenses=expenses,
        existing_debt_service=Decimal("0.0"),
        proposed_emi=Decimal("5000.00"),
        liquidity_buffer_inr=Decimal("30000.00")
    )
    exp_shock = next(s for s in suite if s.scenario_id == "EXPENSE_INFLATION_15")
    # Stressed expenses = 70,000 * 1.15 = 80,500
    expected_surplus = Decimal("100000.00") - Decimal("80500.00")
    assert exp_shock.projected_monthly_cash_surplus == expected_surplus

# 9. Test: Customer payments delayed by 30 days
def test_delayed_receivables_scenario():
    turnover = Decimal("150000.00")
    expenses = Decimal("100000.00")
    buffer = Decimal("60000.00")
    suite = evaluate_stress_scenarios_suite(
        baseline_inflow=turnover,
        baseline_expenses=expenses,
        existing_debt_service=Decimal("5000.00"),
        proposed_emi=Decimal("8000.00"),
        liquidity_buffer_inr=buffer
    )
    delay_shock = next(s for s in suite if s.scenario_id == "DELAYED_RECEIVABLES_30_DAYS")
    # 50% revenue realized in delayed month = 75,000, expenses = 100,000
    assert delay_shock.is_cash_generative is False
    assert delay_shock.cash_runway_days is not None
    assert delay_shock.liquidity_buffer_depletion_pct is not None
    assert delay_shock.liquidity_buffer_depletion_pct > 0.0

# 10. Test: Combined revenue and expense shock
def test_combined_shock_scenario():
    turnover = Decimal("200000.00")
    expenses = Decimal("150000.00")
    suite = evaluate_stress_scenarios_suite(
        baseline_inflow=turnover,
        baseline_expenses=expenses,
        existing_debt_service=Decimal("10000.00"),
        proposed_emi=Decimal("10000.00"),
        liquidity_buffer_inr=Decimal("50000.00")
    )
    combined = next(s for s in suite if s.scenario_id == "COMBINED_REVENUE_EXPENSE_SHOCK")
    # Inflow = 160,000, Expenses = 172,500 (150,000 * 1.15)
    # Stressed operating cashflow is negative
    assert combined.is_cash_generative is False
    assert combined.post_borrowing_dscr is not None
    assert combined.post_borrowing_dscr < 1.0

# 11. Test: Missing balance data
def test_missing_balance_data():
    result = run_cashflow_stress_simulation(
        business_id="msme_no_balance",
        monthly_turnover=Decimal("180000.00"),
        operating_expense_ratio=Decimal("0.70"),
        liquidity_buffer_inr=None  # Balance data missing
    )
    assert result.baseline_cash_runway_days is None
    assert result.stressed_cash_runway_days is None
    assert result.liquidity_buffer_depletion_pct is None
    assert result.minimum_projected_cash_balance is None
    assert result.recovery_period_months is None
    assert result.input_availability["liquidity_buffer"] is False

# 12. Test: Loan affordability boundaries & amortization
def test_loan_affordability_boundaries():
    # Test formula for 12 months at 14% APR
    principal = Decimal("100000.00")
    emi = calculate_standard_amortization_emi(
        principal=principal,
        tenure_months=12,
        annual_interest_rate_pct=14.0
    )
    # Approximate monthly EMI for 1L @ 14% for 12m is ~8,979
    assert emi == Decimal("8978.71")
    
    # Invert back to max principal
    max_p = calculate_max_affordable_principal_from_emi(
        max_safe_emi=emi,
        tenure_months=12,
        annual_interest_rate_pct=14.0
    )
    assert max_p == Decimal("100000.00")
    
    # Engine enforces that recommended loan never exceeds calculated safe limit
    res = run_cashflow_stress_simulation(
        business_id="msme_cap_test",
        monthly_turnover=Decimal("100000.00"),
        operating_expense_ratio=Decimal("0.80"),  # Surplus = 20,000, Max EMI = 10,000
        proposed_loan_amount_inr=Decimal("5000000.00")  # Requested huge loan (50L)
    )
    # Proposed loan must be clamped strictly to maximum safe principal
    assert res.affordability.proposed_loan_amount_inr <= res.affordability.maximum_affordable_loan_principal
    assert res.affordability.proposed_loan_amount_inr > Decimal("0.0")

# 13. Test: Decimal precision
def test_decimal_precision():
    # Empirical cashflow reconstruction with cents/paise
    txs = [
        Transaction(
            transaction_id="tx_p1",
            business_id="msme_p",
            timestamp=utc_now(),
            amount=Decimal("10000.33"),
            direction="CREDIT",
            channel="UPI_QR",
            category="CUSTOMER_REVENUE"
        ),
        Transaction(
            transaction_id="tx_p2",
            business_id="msme_p",
            timestamp=utc_now(),
            amount=Decimal("4999.67"),
            direction="CREDIT",
            channel="UPI_QR",
            category="CUSTOMER_REVENUE"
        ),
        Transaction(
            transaction_id="tx_p3",
            business_id="msme_p",
            timestamp=utc_now(),
            amount=Decimal("7500.50"),
            direction="DEBIT",
            channel="UPI_QR",
            category="SUPPLIER_PURCHASE"
        )
    ]
    recon = reconstruct_monthly_cashflow(transactions=txs)
    assert recon["monthly_operating_inflow"] == Decimal("15000.00")
    assert recon["monthly_operating_expenses"] == Decimal("7500.50")
    assert recon["net_operating_surplus_pre_debt"] == Decimal("7499.50")
    assert isinstance(recon["net_operating_surplus_pre_debt"], Decimal)
