import time
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone

from ...schemas.evidence import EvidenceConfidence, EvidenceItem, FairnessAuditStatus
from ...modules.trust_evidence import evidence_confidence_scorer, cross_source_reconciliation_engine
from .base_agent import BaseAgent
from .context import AssessmentContext

class EvidenceVerificationAgent(BaseAgent):
    """
    Evidence Verification Agent.
    Evaluates data completeness, provenance, and credibility across data streams.
    Distinguishes USER_UPLOADED, SOURCE_LABELLED, and INDEPENDENTLY_VERIFIED data.
    
    Guarantees:
    - Never treats missing evidence as automatic negative financial evidence.
    - Missing evidence reflects solely in data limitations, confidence score, and unassessed flags.
    - Performs cross-source reconciliation between declared profile, transactions, and debt obligations.
    - User-uploaded bank statements are categorized as USER_UPLOADED, not independently verified.
    """
    def __init__(self):
        super().__init__(agent_name="EvidenceVerificationAgent")

    async def execute(self, context: AssessmentContext) -> EvidenceConfidence:
        start_time = time.monotonic()
        context.record_stage("EVIDENCE_ANALYSIS", "RUNNING")
        
        await self.emit_event(
            context=context,
            step_name="audit_evidence_provenance",
            status="RUNNING",
            event_type="TASK_START",
            tool_called="audit_evidence_sources",
            tool_input_summary=f"Auditing data provenance for {context.business_profile.trade_name}",
            message="Evaluating evidence completeness, temporal span, and third-party provenance verification..."
        )

        try:
            profile = context.business_profile
            txs = context.transactions
            
            # 1. Retrieve persisted evidence records from database
            persisted_evidence = []
            debt_obligations = []
            try:
                from ...db import evidence_repo, debt_obligation_repo
                persisted_evidence = evidence_repo.list_for_business(context.business_id)
                debt_obligations = debt_obligation_repo.get_for_business(context.business_id)
            except Exception:
                pass

            # 2. Compute deterministic evidence confidence
            evidence_result = evidence_confidence_scorer.evaluate(
                business_profile=profile,
                transactions=txs,
                persisted_evidence_records=persisted_evidence,
                assessment_id=context.assessment_id
            )

            # 3. Perform deterministic cross-source reconciliation
            reconciliation_result = cross_source_reconciliation_engine.reconcile(
                business_profile=profile,
                transactions=txs,
                debt_obligations=debt_obligations,
                evidence_records=persisted_evidence
            )
            evidence_result.reconciliation = reconciliation_result

            # 4. Link assessment to persisted evidence records
            try:
                from ...db import evidence_repo
                for ev in persisted_evidence:
                    evidence_repo.link_assessment(ev.id, context.assessment_id)
            except Exception:
                pass

            context.evidence_confidence = evidence_result
            context.agent_results["evidence_verification"] = {
                "evidence_confidence_score": evidence_result.evidence_confidence_score,
                "confidence_band": evidence_result.confidence_band,
                "data_completeness_pct": evidence_result.data_completeness_pct,
                "consistency_pct": evidence_result.consistency_pct,
                "source_reliability_pct": evidence_result.source_reliability_pct,
                "temporal_coverage_days": evidence_result.temporal_coverage_days,
                "missing_fields": evidence_result.missing_evidence_fields,
                "inconsistent_fields": evidence_result.inconsistent_fields,
                "reconciliation_concordance_score": reconciliation_result.concordance_score,
                "reconciliation_discrepancies_count": reconciliation_result.total_discrepancies,
                "unmatched_liabilities_count": reconciliation_result.unmatched_liabilities_count,
                "fairness_audit_status": evidence_result.fairness_audit_status
            }

            duration_ms = (time.monotonic() - start_time) * 1000.0
            await self.emit_event(
                context=context,
                step_name="audit_evidence_provenance",
                status="COMPLETED",
                event_type="STRUCTURED_RESULT",
                tool_called="audit_evidence_sources",
                execution_duration_ms=duration_ms,
                structured_findings=context.agent_results["evidence_verification"],
                message=(
                    f"Evidence audit complete: Confidence {evidence_result.evidence_confidence_score}/100 ({evidence_result.confidence_band}). "
                    f"Reconciliation concordance {reconciliation_result.concordance_score}%. Discrepancies: {reconciliation_result.total_discrepancies}."
                )
            )
            context.record_stage("EVIDENCE_ANALYSIS", "COMPLETED")
            return evidence_result

        except Exception as e:
            duration_ms = (time.monotonic() - start_time) * 1000.0
            error_msg = f"Evidence verification error: {str(e)}"
            context.record_error("EvidenceVerificationAgent", "audit_evidence_provenance", error_msg)
            context.record_stage("EVIDENCE_ANALYSIS", "FAILED")
            
            await self.emit_event(
                context=context,
                step_name="audit_evidence_provenance",
                status="FAILED",
                event_type="FAILURE",
                execution_duration_ms=duration_ms,
                error_message=error_msg,
                message=f"Evidence Verification agent encountered an error: {str(e)}"
            )
            raise
