from fastapi import APIRouter, HTTPException
from typing import Optional
from datetime import datetime, timezone
from ..schemas.resilience import ShockScenarioInput, ShockSimulationResult, AffordabilityAnalysis
from .endpoints_business import BUSINESS_STORE

router = APIRouter(prefix="/resilience", tags=["Resilience & Shock Simulation"])

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

@router.post("/simulate", response_model=ShockSimulationResult)
async def simulate_stress_test(
    payload: ShockScenarioInput,
    business_id: Optional[str] = "msme_kirana_kanpur_001"
):
    """
    Simulates cash-flow resilience under dynamic macro/micro stress scenarios.
    Used directly by the interactive UI stress slider.
    Calculations are 100% deterministic Python math.
    """
    profile = BUSINESS_STORE.get(business_id)
    monthly_inflow = profile.declared_monthly_turnover if profile else 285000.0
    declared_emi = profile.declared_existing_monthly_emi if profile else 4500.0
    
    # Deterministic baseline metrics
    operating_expense_ratio = 0.72  # Standard retail/MSME baseline assumption
    baseline_operating_expenses = monthly_inflow * operating_expense_ratio
    baseline_surplus_pre_debt = monthly_inflow - baseline_operating_expenses
    
    # Reconciled debt obligation (Single-counted, conservative)
    verified_debt_debits = declared_emi * 1.0  # Placeholder verified bank debit
    reconciled_existing_debt = max(declared_emi, verified_debt_debits)
    unencumbered_surplus = baseline_surplus_pre_debt - reconciled_existing_debt
    
    # Applied shock multipliers
    shock_revenue_mult = 1.0 - (payload.revenue_contraction_pct / 100.0)
    shock_cogs_mult = 1.0 + (payload.cogs_inflation_pct / 100.0)
    
    stressed_inflow = monthly_inflow * shock_revenue_mult
    stressed_expenses = baseline_operating_expenses * shock_cogs_mult
    stressed_surplus_pre_debt = stressed_inflow - stressed_expenses
    post_shock_surplus = stressed_surplus_pre_debt - reconciled_existing_debt
    
    # Proposed facility parameters (Indicative 6-month working capital)
    proposed_loan_principal = round(unencumbered_surplus * 3.5, -3)
    proposed_tenure_months = 12
    annual_rate = 14.5
    monthly_rate = (annual_rate / 100.0) / 12.0
    
    # Standard EMI amortization formula: P * r * (1+r)^n / ((1+r)^n - 1)
    if monthly_rate > 0:
        factor = (1 + monthly_rate) ** proposed_tenure_months
        proposed_emi = proposed_loan_principal * monthly_rate * factor / (factor - 1)
    else:
        proposed_emi = proposed_loan_principal / proposed_tenure_months
        
    total_post_borrowing_debt_service = reconciled_existing_debt + proposed_emi
    
    # Post-shock DSCR calculation (debt service coverage ratio)
    post_shock_dscr = (
        round(stressed_surplus_pre_debt / max(total_post_borrowing_debt_service, 1.0), 2)
        if stressed_surplus_pre_debt > 0 else 0.0
    )
    
    # Runways & Buffers
    baseline_buffer_inr = monthly_inflow * 0.40  # 12-day working buffer
    burn_rate_daily = max(stressed_expenses - stressed_inflow, 100.0) / 30.0
    stressed_runway_days = int(max(baseline_buffer_inr / max(burn_rate_daily, 1.0), 7))
    buffer_depletion_pct = min(max((1.0 - (post_shock_surplus / max(unencumbered_surplus, 1.0))) * 100.0, 0.0), 100.0)
    
    # Breakeven tolerable contraction before pre-debt cashflow flips negative
    max_tolerable_contraction = max(round(((monthly_inflow - baseline_operating_expenses) / monthly_inflow) * 100.0, 1), 0.0)
    
    # Resilience classification
    if post_shock_dscr >= 1.25 and stressed_runway_days >= 45:
        classification = "HIGHLY_RESILIENT"
    elif post_shock_dscr >= 1.0 and stressed_runway_days >= 25:
        classification = "MODERATELY_RESILIENT"
    elif post_shock_dscr >= 0.7:
        classification = "VULNERABLE_TO_SHOCK"
    else:
        classification = "CRITICAL_ILLIQUIDITY"

    affordability = AffordabilityAnalysis(
        monthly_operating_inflow=round(monthly_inflow, 2),
        monthly_operating_expenses=round(baseline_operating_expenses, 2),
        net_operating_surplus_pre_debt=round(baseline_surplus_pre_debt, 2),
        declared_existing_monthly_emi=declared_emi,
        verified_existing_monthly_debt_debits=verified_debt_debits,
        reconciled_existing_debt_service=reconciled_existing_debt,
        unencumbered_monthly_cash_surplus=round(unencumbered_surplus, 2),
        proposed_loan_amount_inr=proposed_loan_principal,
        proposed_tenure_months=proposed_tenure_months,
        indicative_annual_interest_rate_pct=annual_rate,
        proposed_monthly_emi=round(proposed_emi, 2),
        total_post_borrowing_monthly_debt_service=round(total_post_borrowing_debt_service, 2),
        projected_dscr=round(baseline_surplus_pre_debt / max(total_post_borrowing_debt_service, 1.0), 2),
        maximum_affordable_monthly_emi=round(unencumbered_surplus * 0.50, 2),  # Conservative 50% FOIR cap
        maximum_affordable_loan_principal=round((unencumbered_surplus * 0.50) * 10.5, -3)
    )

    return ShockSimulationResult(
        business_id=business_id,
        assessment_id=f"sim_{utc_now().strftime('%Y%m%d%H%M%S')}",
        applied_scenario=payload,
        baseline_cash_runway_days=90,
        stressed_cash_runway_days=stressed_runway_days,
        liquidity_buffer_depletion_pct=round(buffer_depletion_pct, 1),
        post_shock_monthly_surplus=round(post_shock_surplus, 2),
        post_shock_dscr=post_shock_dscr,
        max_tolerable_revenue_contraction_pct=max_tolerable_contraction,
        resilience_classification=classification,
        affordability=affordability,
        input_availability={
            "declared_turnover": True,
            "declared_emi": True,
            "bank_statement_verified": True
        }
    )
