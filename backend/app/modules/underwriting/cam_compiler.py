from typing import Optional, List
from datetime import datetime, timezone
from decimal import Decimal
import uuid

from ...schemas.assessment import (
    CreditAppraisalMemo,
    AssessmentStatus,
    FinancialRiskBand,
    CounterfactualImprovement
)
from ...schemas.financial_dna import FinancialDNA
from ...schemas.graph import GraphMetrics
from ...schemas.evidence import EvidenceConfidence
from ...schemas.resilience import ShockSimulationResult
from ...schemas.business import BusinessProfile
from .policy_rules import evaluate_underwriting_policy, UNDERWRITING_POLICY_ASSUMPTIONS

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

def compile_credit_appraisal_memo(
    business_id: str,
    assessment_id: Optional[str] = None,
    dna: Optional[FinancialDNA] = None,
    graph: Optional[GraphMetrics] = None,
    evidence: Optional[EvidenceConfidence] = None,
    resilience: Optional[ShockSimulationResult] = None,
    profile: Optional[BusinessProfile] = None,
    requested_loan_amount_inr: Optional[Decimal] = None,
    is_fallback: bool = True,
    fallback_reason: Optional[str] = "Rule-based deterministic compiler baseline"
) -> CreditAppraisalMemo:
    """
    Compiles a comprehensive, explainable Credit Appraisal Memo (CAM).
    
    Guarantees:
    - 100% deterministic underwriting decisioning.
    - Never invents credit bureau scores or unsupported fraud conclusions.
    - Captures counterfactual 'Path-to-Yes' improvements with quantitative delta.
    - Integrates resilience stress simulation and obligation-level debt findings.
    """
    assessment_id = assessment_id or f"eval_{uuid.uuid4().hex[:12]}"
    
    (
        status,
        risk_band,
        recommended_loan,
        max_safe_loan,
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
    ) = evaluate_underwriting_policy(
        dna=dna,
        graph=graph,
        evidence=evidence,
        resilience=resilience,
        profile=profile,
        requested_loan_amount_inr=requested_loan_amount_inr
    )
    
    evidence_score = evidence.evidence_confidence_score if evidence else 0.0
    investigation_status = graph.investigation_status if graph else "NORMAL_PATTERNS"
    apr_range_str = f"{apr_min:.1f}% - {apr_max:.1f}% p.a." if (apr_min and apr_max) else "N/A"
    trade_name = profile.trade_name if profile else business_id
    
    # -------------------------------------------------------------
    # Full Synthesis Narrative (Markdown)
    # -------------------------------------------------------------
    narrative_lines = [
        f"# UDYOGA Credit Appraisal Memo (CAM) — {trade_name}",
        f"**Business ID:** `{business_id}` | **Assessment ID:** `{assessment_id}`",
        f"**Assessment Status:** `{status}` | **Financial Risk Band:** `{risk_band}`",
        f"**Evidence Confidence:** {evidence_score:.1f}% | **Investigation Status:** `{investigation_status}`\n",
        "## 1. Executive Summary & Financing Recommendation",
    ]
    
    if status == "INDICATIVE_RECOMMENDATION":
        narrative_lines.append(
            f"UDYOGA issues an **indicative recommendation** for **₹{recommended_loan:,.2f}** over a tenure of {tenure} months "
            f"under an **{facility}** structure at an indicative rate of {apr_range_str}. "
            f"The business demonstrates robust unencumbered cashflow velocity, low revenue volatility, and adequate debt service coverage."
        )
    elif status == "CONDITIONAL_RECOMMENDATION":
        narrative_lines.append(
            f"UDYOGA issues a **conditional recommendation** for **₹{recommended_loan:,.2f}** over {tenure} months "
            f"at an indicative rate of {apr_range_str}, structured as a **{facility}**. "
            f"Financing is approved subject to revenue-linked collection mechanisms to cushion against detected seasonality or cashflow volatility."
        )
    elif status == "HUMAN_REVIEW_REQUIRED":
        narrative_lines.append(
            f"Automated credit recommendation is **paused pending human underwriter review**. "
            f"Triggers: Forensic counterparty network patterns or constrained cashflow capacity require physical verification before credit extension."
        )
    else:  # INSUFFICIENT_EVIDENCE
        narrative_lines.append(
            "Available transactional data is insufficient to establish an indicative cashflow baseline. "
            "No credit facility is recommended at this time; applicant is encouraged to provide additional transaction records."
        )

    narrative_lines.append(f"\n- **Calculated Safe Affordability Ceiling (P_max):** ₹{max_safe_loan:,.2f}")
    narrative_lines.append(f"- **Recommended Facility Type:** `{facility}`")
    narrative_lines.append(f"- **Indicative Tenure:** {tenure} months")
    narrative_lines.append(f"- **Pricing Spread:** {apr_range_str}")

    narrative_lines.append("\n## 2. Key Positive Credit Drivers")
    for factor in positive_factors:
        narrative_lines.append(f"- {factor}")

    narrative_lines.append("\n## 3. Vulnerabilities & Risk Factors")
    for risk in risk_factors:
        narrative_lines.append(f"- {risk}")

    narrative_lines.append("\n## 4. Covenants, Conditions & Mitigants")
    for cov in covenants:
        narrative_lines.append(f"- {cov}")

    narrative_lines.append("\n## 5. Stress Resilience Summary")
    if resilience:
        runway_str = f"{resilience.stressed_cash_runway_days} days" if resilience.stressed_cash_runway_days else "Infinite (Cash-Generative under shock)"
        dscr_str = f"{resilience.post_shock_dscr:.2f}x" if resilience.post_shock_dscr is not None else "N/A (Debt-free)"
        narrative_lines.append(f"- **Resilience Classification:** `{resilience.resilience_classification}`")
        narrative_lines.append(f"- **Stressed Cash Runway:** {runway_str}")
        narrative_lines.append(f"- **Post-Shock DSCR:** {dscr_str}")
        narrative_lines.append(f"- **Max Tolerable Revenue Contraction:** {resilience.max_tolerable_revenue_contraction_pct:.1f}%")
        if resilience.recovery_period_months is not None:
            narrative_lines.append(f"- **Estimated Liquidity Recovery Period:** {resilience.recovery_period_months} months")
    else:
        narrative_lines.append("- Stress resilience snapshot not attached.")

    narrative_lines.append("\n## 6. Counterfactual 'Path-to-Yes' Simulations")
    narrative_lines.append("Deterministic modeling of actionable adjustments that increase borrowing capacity:")
    for cf in counterfactuals:
        narrative_lines.append(
            f"- **{cf.action_type.replace('_', ' ').title()}:** {cf.description}\n"
            f"  *Model:* {cf.parameter_change} ➔ Capacity: ₹{cf.simulated_affordable_loan_inr:,.0f} "
            f"(DSCR: {cf.simulated_dscr or 'N/A'}x). *Impact:* {cf.impact_summary}"
        )

    if missing_evidence:
        narrative_lines.append("\n## 7. Missing Evidence & Information Gaps")
        for item in missing_evidence:
            narrative_lines.append(f"- Missing: `{item}` (treated neutrally under epistemic uncertainty policy).")

    narrative_lines.append(
        "\n> [!NOTE]\n"
        "> **Regulatory & Audit Disclaimer:** This Credit Appraisal Memo is an indicative, explainable decision support memorandum. "
        "> It does not constitute a formal credit bureau score and does not guarantee loan disbursement."
    )
    
    memo_markdown = "\n".join(narrative_lines)

    return CreditAppraisalMemo(
        assessment_id=assessment_id,
        business_id=business_id,
        generated_at=utc_now(),
        assessment_status=status,
        financial_risk_band=risk_band,
        evidence_confidence_score=evidence_score,
        investigation_status=investigation_status,
        recommended_loan_amount_inr=recommended_loan,
        max_safe_loan_amount_inr=max_safe_loan,
        recommended_tenure_months=tenure,
        indicative_apr_min_pct=apr_min,
        indicative_apr_max_pct=apr_max,
        indicative_apr_range=apr_range_str,
        recommended_facility_type=facility,
        positive_credit_factors=positive_factors,
        risk_factors_and_vulnerabilities=risk_factors,
        recommended_covenants_and_mitigants=covenants,
        missing_evidence_items=missing_evidence,
        recommended_improvements=improvements,
        counterfactual_improvements=counterfactuals,
        assumptions=UNDERWRITING_POLICY_ASSUMPTIONS,
        data_limitations=[
            "Unbanked physical cash receipts not recorded on digital rails are excluded",
            "Evaluates structural integrity of digital statements submitted as of evaluation date"
        ],
        evidence_references=[f"ref_tx_{business_id}", f"ref_dna_{business_id}"],
        calculation_version="1.0.0",
        cam_narrative_markdown=memo_markdown,
        financial_dna_snapshot=dna,
        graph_metrics_snapshot=graph,
        evidence_confidence_snapshot=evidence,
        resilience_simulation_snapshot=resilience,
        is_fallback_rule_based=is_fallback,
        fallback_reason=fallback_reason,
        is_synthetic_evaluation=False
    )
