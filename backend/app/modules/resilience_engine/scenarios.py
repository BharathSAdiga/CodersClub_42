from typing import List, Optional, Dict
from decimal import Decimal, ROUND_HALF_UP
from ...schemas.resilience import ScenarioEvaluation
from .repayment_structures import round_curr

def evaluate_stress_scenarios_suite(
    baseline_inflow: Decimal,
    baseline_expenses: Decimal,
    existing_debt_service: Decimal,
    proposed_emi: Decimal,
    liquidity_buffer_inr: Optional[Decimal] = None,
    seasonality_index: float = 1.0
) -> List[ScenarioEvaluation]:
    """
    Evaluates the standard UDYOGA 7-scenario resilience stress testing suite:
    1. Normal business conditions
    2. Revenue decreases by 15%
    3. Revenue decreases by 30% for two months
    4. Operating expenses increase by 15%
    5. Customer payments delayed by 30 days
    6. Combined revenue and expense shock
    7. Seasonal business downturn

    Guarantees:
    - Calculates projected surplus, DSCR, minimum balance, runway, depletion %, and recovery period.
    - Zero division safety: returns None for DSCR when total debt is zero.
    - Cash runway is None when cash-generative (burn <= 0).
    - Liquidity buffer fields are None when bank balance is unavailable.
    - Pure Decimal arithmetic.
    """
    total_debt_service = round_curr(existing_debt_service + proposed_emi)
    normal_surplus_pre_debt = baseline_inflow - baseline_expenses
    normal_net_surplus = normal_surplus_pre_debt - existing_debt_service
    
    scenario_configs = [
        {
            "id": "NORMAL_CONDITIONS",
            "name": "Normal Business Conditions",
            "desc": "Baseline trading conditions with current revenue and expense levels.",
            "rev_mult": Decimal("1.0"),
            "exp_mult": Decimal("1.0"),
            "months_window": 1,
            "delay_revenue_drop": Decimal("0.0")
        },
        {
            "id": "REVENUE_DROP_15",
            "name": "Moderate Revenue Contraction (-15%)",
            "desc": "15% reduction in top-line monthly customer receipts.",
            "rev_mult": Decimal("0.85"),
            "exp_mult": Decimal("1.0"),
            "months_window": 1,
            "delay_revenue_drop": Decimal("0.0")
        },
        {
            "id": "REVENUE_DROP_30_TWO_MONTHS",
            "name": "Severe Revenue Shock (-30% for 2 Months)",
            "desc": "30% drop in revenue sustained over a 60-day operational dip.",
            "rev_mult": Decimal("0.70"),
            "exp_mult": Decimal("1.0"),
            "months_window": 2,
            "delay_revenue_drop": Decimal("0.0")
        },
        {
            "id": "EXPENSE_INFLATION_15",
            "name": "Operating Expense Inflation (+15%)",
            "desc": "15% surge in vendor purchases, utility tariffs, or logistical costs.",
            "rev_mult": Decimal("1.0"),
            "exp_mult": Decimal("1.15"),
            "months_window": 1,
            "delay_revenue_drop": Decimal("0.0")
        },
        {
            "id": "DELAYED_RECEIVABLES_30_DAYS",
            "name": "Customer Payment Delay (30 Days)",
            "desc": "Delayed customer settlements deferring 50% of the month's realized collections.",
            "rev_mult": Decimal("0.50"),
            "exp_mult": Decimal("1.0"),
            "months_window": 1,
            "delay_revenue_drop": Decimal("0.0")
        },
        {
            "id": "COMBINED_REVENUE_EXPENSE_SHOCK",
            "name": "Combined Economic Shock (-20% Rev, +15% Exp)",
            "desc": "Simultaneous demand contraction and supplier cost escalation.",
            "rev_mult": Decimal("0.80"),
            "exp_mult": Decimal("1.15"),
            "months_window": 1,
            "delay_revenue_drop": Decimal("0.0")
        },
        {
            "id": "SEASONAL_DOWNTURN",
            "name": "Seasonal Trough Downturn",
            "desc": "Off-season lean cycle reflecting enterprise seasonality index.",
            "rev_mult": Decimal(str(max(round(1.0 / max(seasonality_index, 1.0), 2), 0.50))),
            "exp_mult": Decimal("0.90"),  # Slight expense curtailment in lean season
            "months_window": 3,
            "delay_revenue_drop": Decimal("0.0")
        }
    ]
    
    results: List[ScenarioEvaluation] = []
    
    for cfg in scenario_configs:
        stressed_inflow = round_curr(baseline_inflow * cfg["rev_mult"])
        stressed_expenses = round_curr(baseline_expenses * cfg["exp_mult"])
        
        stressed_surplus_pre_debt = round_curr(stressed_inflow - stressed_expenses)
        projected_monthly_surplus = round_curr(stressed_surplus_pre_debt - existing_debt_service)
        
        # Post-borrowing DSCR (Safe handling for zero debt service)
        if total_debt_service > Decimal("0.0"):
            dscr_val = float(stressed_surplus_pre_debt / total_debt_service)
            post_dscr = round(dscr_val, 2)
        else:
            post_dscr = None
            
        is_cash_generative = (stressed_inflow >= stressed_expenses)
        
        # Liquidity buffer & runway calculations
        if liquidity_buffer_inr is not None and liquidity_buffer_inr >= Decimal("0.0"):
            window = Decimal(str(cfg["months_window"]))
            # Monthly cash deficit (operating deficit + existing debt)
            monthly_deficit = max(stressed_expenses + existing_debt_service - stressed_inflow, Decimal("0.0"))
            total_window_drain = monthly_deficit * window
            
            min_cash_balance = max(liquidity_buffer_inr - total_window_drain, Decimal("0.0"))
            
            if liquidity_buffer_inr > Decimal("0.0"):
                depletion = float((total_window_drain / liquidity_buffer_inr) * Decimal("100.0"))
                buffer_depletion_pct = round(min(max(depletion, 0.0), 100.0), 1)
            else:
                buffer_depletion_pct = 100.0 if total_window_drain > Decimal("0.0") else 0.0
                
            # Runway days
            if not is_cash_generative:
                daily_burn = (stressed_expenses - stressed_inflow) / Decimal("30.0")
                runway = int(liquidity_buffer_inr / max(daily_burn, Decimal("1.0")))
                runway_days = max(runway, 1)
            else:
                runway_days = None  # Infinite / zero cash burn
                
            # Recovery period: months of normal cash surplus to restore drained buffer
            if total_window_drain > Decimal("0.0") and normal_net_surplus > Decimal("0.0"):
                recovery_months = int((total_window_drain / normal_net_surplus) + Decimal("0.99"))
            elif total_window_drain > Decimal("0.0"):
                recovery_months = None  # Cannot recover if normal surplus is <= 0
            else:
                recovery_months = 0
        else:
            min_cash_balance = None
            buffer_depletion_pct = None
            runway_days = None
            recovery_months = None
            
        results.append(
            ScenarioEvaluation(
                scenario_id=cfg["id"],
                scenario_name=cfg["name"],
                scenario_description=cfg["desc"],
                projected_monthly_cash_surplus=projected_monthly_surplus,
                existing_debt_service=existing_debt_service,
                proposed_emi=proposed_emi,
                total_debt_service=total_debt_service,
                post_borrowing_dscr=post_dscr,
                minimum_cash_balance=min_cash_balance,
                cash_runway_days=runway_days,
                liquidity_buffer_depletion_pct=buffer_depletion_pct,
                recovery_period_months=recovery_months,
                is_cash_generative=is_cash_generative
            )
        )
        
    return results
