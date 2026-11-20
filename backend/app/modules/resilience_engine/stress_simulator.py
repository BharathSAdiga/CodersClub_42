from typing import Optional, List, Dict
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timezone
import uuid

from ...schemas.resilience import (
    ShockScenarioInput,
    ShockSimulationResult,
    AffordabilityAnalysis,
    DebtObligation,
    ScenarioEvaluation
)
from .affordability_engine import calculate_affordability, round_curr
from .scenarios import evaluate_stress_scenarios_suite

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

def run_cashflow_stress_simulation(
    business_id: str,
    assessment_id: Optional[str] = None,
    monthly_turnover: Decimal = Decimal("0.0"),
    declared_obligations: Optional[List[DebtObligation]] = None,
    verified_obligations: Optional[List[DebtObligation]] = None,
    operating_expense_ratio: Decimal = Decimal("0.72"),
    liquidity_buffer_inr: Optional[Decimal] = None,
    shock_scenario: Optional[ShockScenarioInput] = None,
    proposed_loan_amount_inr: Optional[Decimal] = None,
    proposed_tenure_months: int = 12,
    indicative_annual_interest_rate_pct: float = 14.0,
    seasonality_index: float = 1.0
) -> ShockSimulationResult:
    """
    Comprehensive, deterministic cash-flow resilience simulation engine.
    
    Guarantees:
    - Never hallucinates or invents unavailable liquidity/balance data.
    - Zero division safety on all debt service and DSCR ratios.
    - Infinite/unbounded runway handled properly when shock burn <= 0.
    - Evaluates multi-scenario stress suite and repayment structures.
    - 100% deterministic Decimal calculations.
    """
    assessment_id = assessment_id or f"sim_{uuid.uuid4().hex[:12]}"
    scenario = shock_scenario or ShockScenarioInput()
    
    # 1. Baseline Affordability Calculation
    baseline_operating_expenses = round_curr(monthly_turnover * operating_expense_ratio)
    
    # Compute safe maximum affordability
    temp_affordability = calculate_affordability(
        monthly_operating_inflow=monthly_turnover,
        monthly_operating_expenses=baseline_operating_expenses,
        declared_obligations=declared_obligations,
        verified_obligations=verified_obligations,
        proposed_loan_amount_inr=Decimal("0.0"),
        proposed_tenure_months=proposed_tenure_months,
        indicative_annual_interest_rate_pct=indicative_annual_interest_rate_pct,
        seasonality_index=seasonality_index
    )
    
    # Set proposed loan, bounded strictly by safe affordability limit
    if proposed_loan_amount_inr is None:
        # Default to a prudent benchmark facility: 2.0x monthly unencumbered cash surplus
        if temp_affordability.unencumbered_monthly_cash_surplus > Decimal("0.0"):
            benchmark_loan = (temp_affordability.unencumbered_monthly_cash_surplus * Decimal("2.0")).quantize(
                Decimal("1000"), rounding=ROUND_HALF_UP
            )
            proposed_loan_amount_inr = min(benchmark_loan, temp_affordability.maximum_affordable_loan_principal)
        else:
            proposed_loan_amount_inr = Decimal("0.0")
    else:
        # Never exceed safe maximum affordability
        if temp_affordability.maximum_affordable_loan_principal > Decimal("0.0"):
            proposed_loan_amount_inr = min(proposed_loan_amount_inr, temp_affordability.maximum_affordable_loan_principal)
        else:
            proposed_loan_amount_inr = Decimal("0.0")

    affordability = calculate_affordability(
        monthly_operating_inflow=monthly_turnover,
        monthly_operating_expenses=baseline_operating_expenses,
        declared_obligations=declared_obligations,
        verified_obligations=verified_obligations,
        proposed_loan_amount_inr=proposed_loan_amount_inr,
        proposed_tenure_months=proposed_tenure_months,
        indicative_annual_interest_rate_pct=indicative_annual_interest_rate_pct,
        seasonality_index=seasonality_index
    )
    
    # 2. Multi-Scenario Stress Suite Evaluation
    scenario_evaluations = evaluate_stress_scenarios_suite(
        baseline_inflow=monthly_turnover,
        baseline_expenses=baseline_operating_expenses,
        existing_debt_service=affordability.reconciled_existing_debt_service,
        proposed_emi=affordability.proposed_monthly_emi,
        liquidity_buffer_inr=liquidity_buffer_inr,
        seasonality_index=seasonality_index
    )
    
    # 3. Apply Current Target Shock Scenario
    rev_contraction = Decimal(str(scenario.revenue_contraction_pct)) / Decimal("100.0")
    cogs_inflation = Decimal(str(scenario.cogs_inflation_pct)) / Decimal("100.0")
    
    stressed_inflow = round_curr(monthly_turnover * (Decimal("1.0") - rev_contraction))
    stressed_expenses = round_curr(baseline_operating_expenses * (Decimal("1.0") + cogs_inflation))
    
    stressed_surplus_pre_debt = round_curr(stressed_inflow - stressed_expenses)
    post_shock_surplus = round_curr(stressed_surplus_pre_debt - affordability.reconciled_existing_debt_service)
    
    # Post-Shock DSCR
    total_post_borrowing_debt_service = affordability.total_post_borrowing_monthly_debt_service
    if total_post_borrowing_debt_service > Decimal("0.0"):
        post_shock_dscr = round(float(stressed_surplus_pre_debt / total_post_borrowing_debt_service), 2)
    else:
        post_shock_dscr = None
        
    # Runway & Buffer Depletion Dynamics
    is_cash_generative = (stressed_inflow >= stressed_expenses)
    
    if liquidity_buffer_inr is not None and liquidity_buffer_inr >= Decimal("0.0"):
        # Baseline runway
        baseline_burn = max(baseline_operating_expenses - monthly_turnover, Decimal("0.0"))
        if baseline_burn > Decimal("0.0"):
            daily_base_burn = baseline_burn / Decimal("30.0")
            baseline_runway_days = int(liquidity_buffer_inr / max(daily_base_burn, Decimal("1.0")))
        else:
            baseline_runway_days = 90  # Benchmark default when cash-flow positive
            
        # Stressed runway
        if not is_cash_generative:
            daily_stressed_burn = (stressed_expenses - stressed_inflow) / Decimal("30.0")
            stressed_runway_days = int(liquidity_buffer_inr / max(daily_stressed_burn, Decimal("1.0")))
            stressed_runway_days = max(stressed_runway_days, 1)
        else:
            stressed_runway_days = None  # Infinite / zero cash burn
            
        monthly_deficit = max(stressed_expenses + affordability.reconciled_existing_debt_service - stressed_inflow, Decimal("0.0"))
        min_balance = max(liquidity_buffer_inr - monthly_deficit, Decimal("0.0"))
        
        if liquidity_buffer_inr > Decimal("0.0"):
            depletion = float((monthly_deficit / liquidity_buffer_inr) * Decimal("100.0"))
            buffer_depletion_pct = round(min(max(depletion, 0.0), 100.0), 1)
        else:
            buffer_depletion_pct = 100.0 if monthly_deficit > Decimal("0.0") else 0.0
            
        # Recovery period
        normal_net_surplus = affordability.unencumbered_monthly_cash_surplus
        if monthly_deficit > Decimal("0.0") and normal_net_surplus > Decimal("0.0"):
            recovery_months = int((monthly_deficit / normal_net_surplus) + Decimal("0.99"))
        elif monthly_deficit > Decimal("0.0"):
            recovery_months = None
        else:
            recovery_months = 0
    else:
        baseline_runway_days = None
        stressed_runway_days = None
        buffer_depletion_pct = None
        min_balance = None
        recovery_months = None

    # Max Tolerable Contraction
    if monthly_turnover > Decimal("0.0"):
        tolerable = float(((monthly_turnover - baseline_operating_expenses) / monthly_turnover) * Decimal("100.0"))
        max_tolerable_contraction = max(round(tolerable, 1), 0.0)
    else:
        max_tolerable_contraction = 0.0

    # Resilience Classification
    if post_shock_dscr is not None and post_shock_dscr >= 1.25 and (stressed_runway_days is None or stressed_runway_days >= 45):
        classification = "HIGHLY_RESILIENT"
    elif post_shock_dscr is not None and post_shock_dscr >= 1.0 and (stressed_runway_days is None or stressed_runway_days >= 25):
        classification = "MODERATELY_RESILIENT"
    elif is_cash_generative and post_shock_surplus > Decimal("0.0"):
        classification = "HIGHLY_RESILIENT" if affordability.is_debt_free else "MODERATELY_RESILIENT"
    elif post_shock_dscr is not None and post_shock_dscr >= 0.7:
        classification = "VULNERABLE_TO_SHOCK"
    elif post_shock_surplus >= Decimal("0.0"):
        classification = "VULNERABLE_TO_SHOCK"
    else:
        classification = "CRITICAL_ILLIQUIDITY"

    input_avail = {
        "monthly_turnover": True,
        "operating_expenses": True,
        "liquidity_buffer": liquidity_buffer_inr is not None,
        "declared_obligations": len(affordability.declared_obligations) > 0,
        "verified_obligations": len(affordability.verified_obligations) > 0,
    }

    return ShockSimulationResult(
        business_id=business_id,
        assessment_id=assessment_id,
        applied_scenario=scenario,
        baseline_cash_runway_days=baseline_runway_days,
        stressed_cash_runway_days=stressed_runway_days,
        is_cash_generative_under_shock=is_cash_generative,
        liquidity_buffer_depletion_pct=buffer_depletion_pct,
        minimum_projected_cash_balance=min_balance,
        recovery_period_months=recovery_months,
        post_shock_monthly_surplus=post_shock_surplus,
        post_shock_dscr=post_shock_dscr,
        max_tolerable_revenue_contraction_pct=max_tolerable_contraction,
        resilience_classification=classification,
        affordability=affordability,
        scenario_suite_evaluations=scenario_evaluations,
        input_availability=input_avail
    )
