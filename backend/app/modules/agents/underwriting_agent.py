import time
from typing import Optional, Dict, Any
from decimal import Decimal

from ...schemas.assessment import CreditAppraisalMemo
from ..underwriting import compile_credit_appraisal_memo
from .base_agent import BaseAgent
from .context import AssessmentContext

class UnderwritingAgent(BaseAgent):
    """
    Underwriting Agent.
    Combines findings across all upstream intelligence agents, applies deterministic policy rules,
    enforces cash-flow affordability caps, derives risk-adjusted APR spreads, and formulates
    indicative financing recommendations and counterfactual improvements.
    Consumes Atharv's deterministic underwriting engine.
    """
    def __init__(self):
        super().__init__(agent_name="UnderwritingAgent")

    async def execute(self, context: AssessmentContext) -> CreditAppraisalMemo:
        start_time = time.monotonic()
        context.record_stage("UNDERWRITING", "RUNNING")
        
        await self.emit_event(
            context=context,
            step_name="evaluate_underwriting_policy",
            status="RUNNING",
            event_type="TASK_START",
            tool_called="compile_credit_appraisal_memo",
            tool_input_summary=f"Synthesizing underwriting decision for {context.business_profile.trade_name}",
            message="Evaluating multi-dimensional risk matrix, policy rules, and affordability caps..."
        )

        try:
            # Deterministic CAM compilation
            memo = compile_credit_appraisal_memo(
                business_id=context.business_id,
                assessment_id=context.assessment_id,
                dna=context.financial_dna,
                graph=context.graph_metrics,
                evidence=context.evidence_confidence,
                resilience=context.resilience_result,
                profile=context.business_profile,
                requested_loan_amount_inr=context.requested_loan_amount_inr,
                is_fallback=True,
                fallback_reason="Rule-based deterministic underwriting compiler"
            )

            context.credit_appraisal_memo = memo
            context.agent_results["underwriting"] = {
                "assessment_status": memo.assessment_status,
                "financial_risk_band": memo.financial_risk_band,
                "recommended_loan_amount_inr": float(memo.recommended_loan_amount_inr),
                "recommended_facility_type": memo.recommended_facility_type,
                "indicative_apr_min_pct": float(memo.indicative_apr_min_pct) if memo.indicative_apr_min_pct else None,
                "indicative_apr_max_pct": float(memo.indicative_apr_max_pct) if memo.indicative_apr_max_pct else None,
                "counterfactuals_count": len(memo.counterfactual_improvements)
            }

            duration_ms = (time.monotonic() - start_time) * 1000.0
            await self.emit_event(
                context=context,
                step_name="evaluate_underwriting_policy",
                status="COMPLETED",
                event_type="STRUCTURED_RESULT",
                tool_called="compile_credit_appraisal_memo",
                execution_duration_ms=duration_ms,
                structured_findings=context.agent_results["underwriting"],
                message=(
                    f"Underwriting evaluation complete. Status: `{memo.assessment_status}` | "
                    f"Risk Band: `{memo.financial_risk_band}` | Facility: ₹{memo.recommended_loan_amount_inr:,.2f}"
                )
            )
            context.record_stage("UNDERWRITING", "COMPLETED")
            return memo

        except Exception as e:
            duration_ms = (time.monotonic() - start_time) * 1000.0
            error_msg = f"Underwriting evaluation error: {str(e)}"
            context.record_error("UnderwritingAgent", "evaluate_underwriting_policy", error_msg)
            context.record_stage("UNDERWRITING", "FAILED")
            
            await self.emit_event(
                context=context,
                step_name="evaluate_underwriting_policy",
                status="FAILED",
                event_type="FAILURE",
                execution_duration_ms=duration_ms,
                error_message=error_msg,
                message=f"Underwriting agent encountered an error: {str(e)}"
            )
            raise
