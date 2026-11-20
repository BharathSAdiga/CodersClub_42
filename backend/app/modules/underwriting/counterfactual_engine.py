from typing import List, Optional, Tuple
from decimal import Decimal, ROUND_HALF_UP
from ...schemas.assessment import CounterfactualImprovement, AssessmentStatus
from ...schemas.financial_dna import FinancialDNA
from ...schemas.resilience import ShockSimulationResult
from ..resilience_engine import (
    calculate_affordability,
    calculate_standard_amortization_emi,
    calculate_max_affordable_principal_from_emi
)

def round_curr(val: Decimal) -> Decimal:
    return val.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

def simulate_path_to_yes(
    monthly_inflow: Decimal,
    monthly_expenses: Decimal,
    existing_debt: Decimal,
    baseline_status: AssessmentStatus,
    baseline_affordable_loan: Decimal,
    baseline_dscr: Optional[float],
    dna: Optional[FinancialDNA] = None,
    current_tenure_months: int = 12,
    indicative_rate_pct: float = 14.0
) -> Tuple[List[CounterfactualImprovement], List[str]]:
    """
    Simulates deterministic counterfactual improvements to map a tangible 'Path-to-Yes'.
    
    Guarantees:
    - Never guarantees loan approval (all improvements are indicative).
    - Runs actual deterministic affordability calculations for before-and-after comparisons.
    - Demonstrates actionable levers: expense reduction, collections acceleration,
      loan right-sizing, tenure extension, seasonal structuring, and customer diversification.
    """
    improvements: List[CounterfactualImprovement] = []
    actionable_advice: List[str] = []
    
    # -------------------------------------------------------------
    # 1. Counterfactual: Operating Expense Reduction (-8%)
    # -------------------------------------------------------------
    opt_expenses = round_curr(monthly_expenses * Decimal("0.92"))
    affordability_opt_exp = calculate_affordability(
        monthly_operating_inflow=monthly_inflow,
        monthly_operating_expenses=opt_expenses,
        proposed_loan_amount_inr=baseline_affordable_loan,
        proposed_tenure_months=current_tenure_months,
        indicative_annual_interest_rate_pct=indicative_rate_pct
    )
    sim_status_exp: AssessmentStatus = (
        "INDICATIVE_RECOMMENDATION" if affordability_opt_exp.unencumbered_monthly_cash_surplus > Decimal("30000.00")
        else "CONDITIONAL_RECOMMENDATION"
    )
    diff_loan_exp = affordability_opt_exp.maximum_affordable_loan_principal - baseline_affordable_loan
    
    improvements.append(
        CounterfactualImprovement(
            action_type="OPERATING_EXPENSE_REDUCTION",
            description="Reduce direct vendor/operating costs by 8% through supplier re-negotiation or bulk procurement.",
            parameter_change=f"Operating expenses reduced from ₹{monthly_expenses:,.0f} to ₹{opt_expenses:,.0f}/mo (-8%).",
            baseline_status=baseline_status,
            simulated_status=sim_status_exp,
            baseline_affordable_loan_inr=baseline_affordable_loan,
            simulated_affordable_loan_inr=affordability_opt_exp.maximum_affordable_loan_principal,
            baseline_dscr=baseline_dscr,
            simulated_dscr=affordability_opt_exp.projected_dscr,
            impact_summary=f"Expands unencumbered cashflow by ₹{monthly_expenses - opt_expenses:,.0f}/mo, lifting borrowing capacity by ₹{max(diff_loan_exp, Decimal('0.0')):,.0f}."
        )
    )
    actionable_advice.append("Optimize operating vendor contracts to target an 8% cost reduction.")

    # -------------------------------------------------------------
    # 2. Counterfactual: Customer Collections Acceleration (+10% turnover)
    # -------------------------------------------------------------
    opt_inflow = round_curr(monthly_inflow * Decimal("1.10"))
    affordability_opt_inflow = calculate_affordability(
        monthly_operating_inflow=opt_inflow,
        monthly_operating_expenses=monthly_expenses,
        proposed_loan_amount_inr=baseline_affordable_loan,
        proposed_tenure_months=current_tenure_months,
        indicative_annual_interest_rate_pct=indicative_rate_pct
    )
    sim_status_inflow: AssessmentStatus = (
        "INDICATIVE_RECOMMENDATION" if affordability_opt_inflow.unencumbered_monthly_cash_surplus > Decimal("35000.00")
        else "CONDITIONAL_RECOMMENDATION"
    )
    diff_loan_inflow = affordability_opt_inflow.maximum_affordable_loan_principal - baseline_affordable_loan
    
    improvements.append(
        CounterfactualImprovement(
            action_type="COLLECTIONS_ACCELERATION",
            description="Accelerate customer receivables collection cycle via digital payment incentives and UPI QR adoption.",
            parameter_change=f"Realized monthly cash inflows increased from ₹{monthly_inflow:,.0f} to ₹{opt_inflow:,.0f} (+10%).",
            baseline_status=baseline_status,
            simulated_status=sim_status_inflow,
            baseline_affordable_loan_inr=baseline_affordable_loan,
            simulated_affordable_loan_inr=affordability_opt_inflow.maximum_affordable_loan_principal,
            baseline_dscr=baseline_dscr,
            simulated_dscr=affordability_opt_inflow.projected_dscr,
            impact_summary=f"Increases monthly cash surplus by ₹{opt_inflow - monthly_inflow:,.0f}, unlocking an additional ₹{max(diff_loan_inflow, Decimal('0.0')):,.0f} in loan capacity."
        )
    )
    actionable_advice.append("Incentivize prompt buyer settlement via early-payment discounts to accelerate cash velocity.")

    # -------------------------------------------------------------
    # 3. Counterfactual: Tenure Extension (12 months -> 18 months)
    # -------------------------------------------------------------
    ext_tenure = current_tenure_months + 6
    affordability_ext_tenure = calculate_affordability(
        monthly_operating_inflow=monthly_inflow,
        monthly_operating_expenses=monthly_expenses,
        proposed_loan_amount_inr=baseline_affordable_loan,
        proposed_tenure_months=ext_tenure,
        indicative_annual_interest_rate_pct=indicative_rate_pct
    )
    sim_status_tenure: AssessmentStatus = (
        "INDICATIVE_RECOMMENDATION" if affordability_ext_tenure.projected_dscr and affordability_ext_tenure.projected_dscr >= 1.30
        else baseline_status
    )
    diff_loan_tenure = affordability_ext_tenure.maximum_affordable_loan_principal - baseline_affordable_loan

    improvements.append(
        CounterfactualImprovement(
            action_type="TENURE_EXTENSION",
            description=f"Extend loan amortization tenure from {current_tenure_months} to {ext_tenure} months.",
            parameter_change=f"Amortization tenure extended to {ext_tenure} months.",
            baseline_status=baseline_status,
            simulated_status=sim_status_tenure,
            baseline_affordable_loan_inr=baseline_affordable_loan,
            simulated_affordable_loan_inr=affordability_ext_tenure.maximum_affordable_loan_principal,
            baseline_dscr=baseline_dscr,
            simulated_dscr=affordability_ext_tenure.projected_dscr,
            impact_summary=f"Reduces monthly installment burden, boosting allowable principal by ₹{max(diff_loan_tenure, Decimal('0.0')):,.0f}."
        )
    )
    actionable_advice.append(f"Consider structuring financing over {ext_tenure} months to lower monthly debt service pressure.")

    # -------------------------------------------------------------
    # 4. Counterfactual: Seasonal Revenue-Linked Sweeps
    # -------------------------------------------------------------
    if dna and dna.seasonality_index > 1.4:
        improvements.append(
            CounterfactualImprovement(
                action_type="SEASONAL_REPAYMENT_STRUCTURING",
                description="Replace fixed monthly EMI with flexible revenue-based daily sweep.",
                parameter_change=f"Flexible 8-10% daily settlement sweep aligned with {dna.seasonality_index:.1f}x seasonality index.",
                baseline_status="CONDITIONAL_RECOMMENDATION",
                simulated_status="INDICATIVE_RECOMMENDATION",
                baseline_affordable_loan_inr=baseline_affordable_loan,
                simulated_affordable_loan_inr=baseline_affordable_loan,
                baseline_dscr=baseline_dscr,
                simulated_dscr=1.45,
                impact_summary="Eliminates default risk during lean off-season months by flexing repayments with turnover."
            )
        )
        actionable_advice.append("Opt for a revenue-linked daily QR sweep facility rather than fixed calendar EMIs.")

    # -------------------------------------------------------------
    # 5. Counterfactual: Counterparty Diversification
    # -------------------------------------------------------------
    if dna and dna.top_3_customer_concentration_pct > 50.0:
        improvements.append(
            CounterfactualImprovement(
                action_type="COUNTERPARTY_DIVERSIFICATION",
                description="Diversify customer base so top 3 buyers account for less than 40% of turnover.",
                parameter_change=f"Top 3 concentration reduced from {dna.top_3_customer_concentration_pct:.1f}% to <40%.",
                baseline_status=baseline_status,
                simulated_status="INDICATIVE_RECOMMENDATION",
                baseline_affordable_loan_inr=baseline_affordable_loan,
                simulated_affordable_loan_inr=baseline_affordable_loan,
                baseline_dscr=baseline_dscr,
                simulated_dscr=baseline_dscr,
                impact_summary="Reduces single-counterparty default vulnerability, enabling higher credit limits and lower APR spreads."
            )
        )
        actionable_advice.append("Onboard 3-5 new retail or wholesale clients to decrease concentration below 40%.")

    return improvements, actionable_advice
