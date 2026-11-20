from typing import Tuple, List, Optional, Dict, Any
from decimal import Decimal
from ...schemas.assessment import (
    AssessmentStatus,
    FinancialRiskBand,
    CounterfactualImprovement
)
from ...schemas.financial_dna import FinancialDNA
from ...schemas.graph import GraphMetrics
from ...schemas.evidence import EvidenceConfidence
from ...schemas.resilience import ShockSimulationResult
from ...schemas.business import BusinessProfile
from .financial_evaluator import (
    evaluate_financial_health,
    evaluate_repayment_capacity,
    evaluate_business_continuity,
    evaluate_evidence_confidence,
    evaluate_investigation_risk,
    evaluate_stress_resilience
)
from .counterfactual_engine import simulate_path_to_yes

# Configurable Underwriting Policy Assumptions & Thresholds
UNDERWRITING_POLICY_ASSUMPTIONS = [
    "EVIDENCE_THRESHOLD: Evidence confidence score < 40.0% triggers INSUFFICIENT_EVIDENCE with risk band UNASSESSED.",
    "INVESTIGATION_POLICY: Counterparty graph circular loops trigger HUMAN_REVIEW_REQUIRED (no automated fraud conclusion).",
    "DEBT_SERVICE_POLICY: Hard FOIR cap of 50% on unencumbered surplus; negative surplus yields zero loan recommendation.",
    "SEASONALITY_POLICY: Seasonality index > 1.6 mandates REVENUE_BASED_DAILY_SWEEP repayment structure.",
    "PRICING_ASSUMPTION: Baseline repo benchmark + risk spread (Low: 13.0-14.5%, Moderate: 14.5-16.5%, Elevated: 16.5-18.5%).",
    "AFFORDABILITY_BOUND: Recommended loan principal can NEVER exceed resilience engine's calculated safe limit (P_max)."
]

def evaluate_underwriting_policy(
    dna: Optional[FinancialDNA],
    graph: Optional[GraphMetrics],
    evidence: Optional[EvidenceConfidence],
    resilience: Optional[ShockSimulationResult],
    profile: Optional[BusinessProfile] = None,
    requested_loan_amount_inr: Optional[Decimal] = None
) -> Tuple[
    AssessmentStatus,
    FinancialRiskBand,
    Decimal,  # Recommended loan
    Decimal,  # Max safe loan
    int,      # Tenure
    Optional[Decimal], # APR min
    Optional[Decimal], # APR max
    str,      # Facility type
    List[str], # Positive factors
    List[str], # Risk factors
    List[str], # Covenants
    List[str], # Missing evidence
    List[str], # Recommended improvements
    List[CounterfactualImprovement] # Path to Yes
]:
    """
    Deterministic explainable underwriting policy rules.
    """
    positive_factors: List[str] = []
    risk_factors: List[str] = []
    covenants: List[str] = []
    
    # Run modular evaluators
    eval_health = evaluate_financial_health(dna)
    eval_capacity = evaluate_repayment_capacity(resilience)
    eval_continuity = evaluate_business_continuity(profile, dna)
    eval_evidence = evaluate_evidence_confidence(evidence)
    eval_investigation = evaluate_investigation_risk(graph)
    eval_stress = evaluate_stress_resilience(resilience)
    
    missing_evidence = eval_evidence["missing_fields"]
    
    # 1. Gate: Evidence Sufficiency Check
    evidence_score = eval_evidence["score"]
    if eval_evidence["evidence_grade"] == "INSUFFICIENT" or evidence_score < 40.0:
        counterfactuals, improvements = simulate_path_to_yes(
            monthly_inflow=dna.monthly_average_turnover if dna else Decimal("0.0"),
            monthly_expenses=dna.monthly_average_turnover * Decimal("0.72") if dna else Decimal("0.0"),
            existing_debt=Decimal("0.0"),
            baseline_status="INSUFFICIENT_EVIDENCE",
            baseline_affordable_loan=Decimal("0.0"),
            baseline_dscr=None,
            dna=dna
        )
        return (
            "INSUFFICIENT_EVIDENCE",
            "UNASSESSED",
            Decimal("0.0"),
            Decimal("0.0"),
            0,
            None,
            None,
            "NONE_RECOMMENDED",
            ["Applicant business registered on UDYOGA platform."],
            ["Verifiable digital transaction history is below the minimum 40% confidence threshold."],
            ["Submit minimum 90 to 180 days of continuous banking or UPI merchant QR transaction statements."],
            missing_evidence if missing_evidence else ["BANK_STATEMENTS_180_DAYS"],
            ["Provide official primary bank statements or authorize GST portal account aggregator access."],
            counterfactuals
        )

    # 2. Gate: Forensic Graph Anomaly Check (Never fraud, always human review)
    if eval_investigation["is_flagged"]:
        for obs in eval_investigation["observations"]:
            risk_factors.append(obs)
        covenants.append("Field credit officer visit to verify physical business premises, books, and genuine counterparty shipping e-way bills.")
        
        counterfactuals, improvements = simulate_path_to_yes(
            monthly_inflow=dna.monthly_average_turnover if dna else Decimal("0.0"),
            monthly_expenses=dna.monthly_average_turnover * Decimal("0.72") if dna else Decimal("0.0"),
            existing_debt=resilience.affordability.reconciled_existing_debt_service if resilience else Decimal("0.0"),
            baseline_status="HUMAN_REVIEW_REQUIRED",
            baseline_affordable_loan=Decimal("0.0"),
            baseline_dscr=eval_capacity["baseline_dscr"],
            dna=dna
        )
        return (
            "HUMAN_REVIEW_REQUIRED",
            "HIGH_RISK",
            Decimal("0.0"),
            Decimal("0.0"),
            0,
            None,
            None,
            "NONE_RECOMMENDED",
            eval_continuity["observations"],
            risk_factors,
            covenants,
            missing_evidence,
            ["Clarify circular fund transfer loops with documentary invoices and commercial trade justifications."],
            counterfactuals
        )

    # 3. Cashflow Capacity & Debt Burden Analysis
    unencumbered_surplus = eval_capacity["unencumbered_monthly_surplus"]
    projected_dscr = eval_capacity["baseline_dscr"]
    max_safe_principal = eval_capacity["max_affordable_loan"]
    
    if unencumbered_surplus <= Decimal("0.0"):
        risk_factors.append(f"Operating cash surplus is negative (-₹{abs(unencumbered_surplus):,.2f}/mo) after existing debt obligations.")
        covenants.append("Working capital restructuring and debt consolidation required before new credit exposure.")
        
        counterfactuals, improvements = simulate_path_to_yes(
            monthly_inflow=dna.monthly_average_turnover if dna else Decimal("0.0"),
            monthly_expenses=dna.monthly_average_turnover * Decimal("0.72") if dna else Decimal("0.0"),
            existing_debt=resilience.affordability.reconciled_existing_debt_service if resilience else Decimal("0.0"),
            baseline_status="HUMAN_REVIEW_REQUIRED",
            baseline_affordable_loan=Decimal("0.0"),
            baseline_dscr=None,
            dna=dna
        )
        return (
            "HUMAN_REVIEW_REQUIRED",
            "HIGH_RISK",
            Decimal("0.0"),
            Decimal("0.0"),
            0,
            None,
            None,
            "NONE_RECOMMENDED",
            eval_continuity["observations"],
            risk_factors,
            covenants,
            missing_evidence,
            improvements,
            counterfactuals
        )

    # Compile positive and risk drivers
    positive_factors.extend(eval_health["observations"])
    positive_factors.extend(eval_capacity["observations"])
    positive_factors.extend(eval_continuity["observations"])
    
    # 4. Stress Resilience & Volatility Audit
    is_volatile = (dna and dna.inflow_volatility_cv > 0.45)
    is_seasonal = (dna and dna.seasonality_index > 1.55)
    is_stressed_dscr_weak = (eval_stress["post_shock_dscr"] is not None and eval_stress["post_shock_dscr"] < 1.05)
    
    if is_volatile:
        risk_factors.append(f"Revenue volatility is elevated (CV {dna.inflow_volatility_cv:.2f}), creating cashflow vulnerability during low-sales periods.")
    if is_seasonal:
        risk_factors.append(f"Cashflow is seasonal (Index {dna.seasonality_index:.2f}x peak-to-trough ratio).")
        covenants.append("Structure loan repayments with flexible seasonal step-up/step-down sweeps.")
    if is_stressed_dscr_weak:
        risk_factors.append(f"Post-shock DSCR drops to {eval_stress['post_shock_dscr']:.2f}x under macro stress scenario.")

    # 5. Determine Overall Assessment Status and Risk Band
    if is_seasonal or is_volatile or is_stressed_dscr_weak or (evidence_score < 65.0):
        status: AssessmentStatus = "CONDITIONAL_RECOMMENDATION"
        risk_band: FinancialRiskBand = "MODERATE_RISK" if not is_stressed_dscr_weak else "ELEVATED_RISK"
        
        # Prudent loan: 2.5x unencumbered monthly surplus capped by max safe principal
        target_loan = (unencumbered_surplus * Decimal("2.5")).quantize(Decimal("1000"))
        recommended_loan = min(target_loan, max_safe_principal)
        tenure = 9 if is_seasonal else 12
        apr_min = Decimal("14.5")
        apr_max = Decimal("16.5")
        facility = "REVENUE_BASED_DAILY_SWEEP"
        covenants.append("Mandatory daily or weekly revenue-based sweep from settlement account.")
    else:
        status = "INDICATIVE_RECOMMENDATION"
        risk_band = "LOW_RISK"
        
        # Prime loan: 3.5x unencumbered monthly surplus capped by max safe principal
        target_loan = (unencumbered_surplus * Decimal("3.5")).quantize(Decimal("1000"))
        recommended_loan = min(target_loan, max_safe_principal)
        tenure = 12
        apr_min = Decimal("13.0")
        apr_max = Decimal("14.5")
        facility = "UNSECURED_WORKING_CAPITAL_LINE"
        covenants.append("Quarterly bank transaction review to verify continued cashflow velocity.")

    # Override with requested amount if smaller than calculated
    if requested_loan_amount_inr is not None and requested_loan_amount_inr > Decimal("0.0"):
        recommended_loan = min(recommended_loan, requested_loan_amount_inr)

    # 6. Counterfactual Simulations
    counterfactuals, improvements = simulate_path_to_yes(
        monthly_inflow=dna.monthly_average_turnover if dna else Decimal("0.0"),
        monthly_expenses=dna.monthly_average_turnover * Decimal("0.72") if dna else Decimal("0.0"),
        existing_debt=resilience.affordability.reconciled_existing_debt_service if resilience else Decimal("0.0"),
        baseline_status=status,
        baseline_affordable_loan=recommended_loan,
        baseline_dscr=projected_dscr,
        dna=dna,
        current_tenure_months=tenure,
        indicative_rate_pct=float(apr_min or Decimal("14.0"))
    )

    return (
        status,
        risk_band,
        recommended_loan,
        max_safe_principal,
        tenure,
        apr_min,
        apr_max,
        facility,
        positive_factors,
        risk_factors,
        covenants,
        missing_evidence,
        improvements,
        counterfactuals
    )
