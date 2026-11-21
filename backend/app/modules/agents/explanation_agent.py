import time
import logging
from typing import Optional, Dict, Any

from ...schemas.assessment import CreditAppraisalMemo
from .base_agent import BaseAgent
from .context import AssessmentContext
from .llm_client import llm_client

logger = logging.getLogger(__name__)

class ExplanationAndPassportAgent(BaseAgent):
    """
    Explanation and Passport Agent.
    Compiles the final Business Financial Passport and Credit Appraisal Memo (CAM).
    Grounds explanations strictly in deterministic quantitative findings.
    Attempts LLM narrative polishing for executive synthesis, falling back to deterministic
    templates immediately when the LLM is unconfigured, slow, or unavailable.
    """
    def __init__(self):
        super().__init__(agent_name="ExplanationAndPassportAgent")

    async def execute(self, context: AssessmentContext) -> CreditAppraisalMemo:
        start_time = time.monotonic()
        context.record_stage("EXPLANATION_GENERATION", "RUNNING")
        
        await self.emit_event(
            context=context,
            step_name="compile_financial_passport_and_cam",
            status="RUNNING",
            event_type="TASK_START",
            tool_called="synthesize_cam_narrative",
            tool_input_summary=f"Synthesizing Credit Appraisal Memo for {context.business_profile.trade_name}",
            message="Generating explainable CAM narrative, Business Financial Passport, and audit citations..."
        )

        try:
            memo = context.credit_appraisal_memo
            if memo is None:
                raise ValueError("Cannot generate explanation without completed underwriting memo.")

            profile = context.business_profile
            ev = context.evidence_confidence

            # Enrich limitations and covenants with deterministic evidence intelligence
            if ev:
                memo.evidence_confidence_score = ev.evidence_confidence_score
                if ev.missing_evidence_fields:
                    memo.data_limitations.extend([
                        f"Missing Evidence: {field} not submitted (treated as neutral epistemic uncertainty)"
                        for field in ev.missing_evidence_fields
                        if f"Missing Evidence: {field}" not in " ".join(memo.data_limitations)
                    ])
                if ev.reconciliation and ev.reconciliation.discrepancies:
                    for disc in ev.reconciliation.discrepancies:
                        if disc.severity in ["HIGH", "CRITICAL"]:
                            memo.recommended_covenants_and_mitigants.append(
                                f"Audit Condition: Reconcile {disc.discrepancy_type} ({disc.source_a} vs {disc.source_b}) prior to second tranche disbursal."
                            )
            
            # Attempt LLM narrative refinement if available
            try:
                prompt = (
                    f"Synthesize an executive underwriting narrative for {profile.trade_name} ({profile.sector}).\n"
                    f"Assessment Status: {memo.assessment_status}\n"
                    f"Risk Band: {memo.financial_risk_band}\n"
                    f"Recommended Facility: {memo.recommended_facility_type} of ₹{memo.recommended_loan_amount_inr:,.2f}\n"
                    f"Strengths: {', '.join(memo.positive_credit_factors)}\n"
                    f"Vulnerabilities: {', '.join(memo.risk_factors_and_vulnerabilities)}\n"
                )

                enhanced_narrative = await llm_client.generate_narrative_synthesis(
                    prompt=prompt,
                    system_instruction="Ground narrative strictly in provided deterministic findings. Never invent credit bureau scores.",
                    fallback_narrative=memo.cam_narrative_markdown
                )
                memo.cam_narrative_markdown = enhanced_narrative
            except Exception as llm_err:
                logger.warning(f"LLM narrative refinement failed ({llm_err}). Retaining deterministic CAM narrative.")
                memo.is_fallback_rule_based = True
                memo.fallback_reason = f"LLM synthesis fallback: {str(llm_err)}"

            context.agent_results["explanation_and_passport"] = {
                "passport_generated": True,
                "cam_narrative_length_chars": len(memo.cam_narrative_markdown),
                "positive_factors_count": len(memo.positive_credit_factors),
                "risk_factors_count": len(memo.risk_factors_and_vulnerabilities),
                "mitigants_count": len(memo.recommended_covenants_and_mitigants)
            }

            duration_ms = (time.monotonic() - start_time) * 1000.0
            await self.emit_event(
                context=context,
                step_name="compile_financial_passport_and_cam",
                status="COMPLETED",
                event_type="STRUCTURED_RESULT",
                tool_called="synthesize_cam_narrative",
                execution_duration_ms=duration_ms,
                structured_findings=context.agent_results["explanation_and_passport"],
                message=f"Business Financial Passport & CAM compiled successfully ({len(memo.cam_narrative_markdown)} characters)."
            )
            context.record_stage("EXPLANATION_GENERATION", "COMPLETED")
            return memo

        except Exception as e:
            duration_ms = (time.monotonic() - start_time) * 1000.0
            error_msg = f"Explanation generation error: {str(e)}"
            context.record_error("ExplanationAndPassportAgent", "compile_financial_passport_and_cam", error_msg)
            context.record_stage("EXPLANATION_GENERATION", "FAILED")
            
            await self.emit_event(
                context=context,
                step_name="compile_financial_passport_and_cam",
                status="FAILED",
                event_type="FAILURE",
                execution_duration_ms=duration_ms,
                error_message=error_msg,
                message=f"Explanation and Passport agent encountered an error: {str(e)}"
            )
            raise
