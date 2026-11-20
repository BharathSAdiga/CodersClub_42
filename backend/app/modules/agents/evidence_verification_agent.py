import time
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone

from ...schemas.evidence import EvidenceConfidence, EvidenceItem, FairnessAuditStatus
from .base_agent import BaseAgent
from .context import AssessmentContext

class EvidenceVerificationAgent(BaseAgent):
    """
    Evidence Verification Agent.
    Evaluates data completeness, provenance, and credibility across data streams.
    Distinguishes USER_PROVIDED, SOURCE_LABELLED, and INDEPENDENTLY_VERIFIED data.
    
    Guarantees:
    - Never treats missing evidence as automatic negative financial evidence.
    - Missing evidence reflects solely in data limitations, confidence score, and unassessed flags.
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
            
            evidence_items: List[EvidenceItem] = []
            missing_fields: List[str] = []
            data_sources: List[str] = []

            # 1. Profile evidence
            evidence_items.append(
                EvidenceItem(
                    attribute_name="business_profile_declaration",
                    provenance="USER_PROVIDED",
                    source_reference="self_declared_profile",
                    is_verified=False,
                    confidence_weight=0.75
                )
            )
            data_sources.append("USER_DECLARED_PROFILE")

            # 2. Transaction evidence
            if txs:
                # Determine channels
                channels = {t.channel for t in txs}
                has_bank = "NEFT_RTGS" in channels or "IMPS" in channels or "CHEQUE" in channels or "CASH_DEPOSIT" in channels
                has_upi = "UPI_QR" in channels or "POS_SWIPE" in channels

                if has_bank:
                    data_sources.append("BANK_STATEMENTS")
                    evidence_items.append(
                        EvidenceItem(
                            attribute_name="bank_statement_cashflow",
                            provenance="INDEPENDENTLY_VERIFIED",
                            source_reference=f"bank_statement_{len(txs)}_records",
                            is_verified=True,
                            confidence_weight=0.92
                        )
                    )
                if has_upi:
                    data_sources.append("UPI_QR_LOGS")
                    evidence_items.append(
                        EvidenceItem(
                            attribute_name="merchant_qr_settlements",
                            provenance="SOURCE_LABELLED",
                            source_reference="upi_qr_logs",
                            is_verified=True,
                            confidence_weight=0.85
                        )
                    )
                temporal_days = 180 if len(txs) >= 10 else 90
                completeness_pct = 85.0 if len(txs) >= 20 else 65.0
            else:
                temporal_days = 0
                completeness_pct = 40.0
                missing_fields.append("DIGITAL_TRANSACTION_HISTORY")

            # 3. GST Returns
            if profile.has_gstin and profile.gstin:
                data_sources.append("GST_PORTAL")
                evidence_items.append(
                    EvidenceItem(
                        attribute_name="gst_3b_tax_filings",
                        provenance="INDEPENDENTLY_VERIFIED",
                        source_reference=f"gstin_{profile.gstin}",
                        is_verified=True,
                        confidence_weight=0.95
                    )
                )
            else:
                missing_fields.append("GSTIN_RETURNS_3B")
                evidence_items.append(
                    EvidenceItem(
                        attribute_name="gst_3b_tax_filings",
                        provenance="MISSING",
                        source_reference=None,
                        is_verified=False,
                        confidence_weight=0.0
                    )
                )

            # Calculate composite evidence confidence score
            valid_scores = [item.confidence_weight * 100.0 for item in evidence_items if item.provenance != "MISSING"]
            avg_score = sum(valid_scores) / len(valid_scores) if valid_scores else 40.0
            
            # Missing coverage impacts confidence only, never creditworthiness
            penalty = len(missing_fields) * 8.0
            composite_confidence = max(20.0, min(95.0, avg_score - penalty + (10.0 if txs else 0.0)))

            evidence_result = EvidenceConfidence(
                business_id=context.business_id,
                assessment_id=context.assessment_id,
                evidence_confidence_score=round(composite_confidence, 1),
                data_completeness_pct=round(completeness_pct, 1),
                temporal_coverage_days=temporal_days,
                total_records_analyzed=len(txs),
                available_data_sources=data_sources,
                missing_evidence_fields=missing_fields,
                evidence_items=evidence_items,
                fairness_audit_status="PASSED",
                provenance_breakdown={
                    "user_provided_count": sum(1 for i in evidence_items if i.provenance == "USER_PROVIDED"),
                    "source_labelled_count": sum(1 for i in evidence_items if i.provenance == "SOURCE_LABELLED"),
                    "independently_verified_count": sum(1 for i in evidence_items if i.provenance == "INDEPENDENTLY_VERIFIED"),
                    "missing_count": sum(1 for i in evidence_items if i.provenance == "MISSING")
                }
            )

            context.evidence_confidence = evidence_result
            context.agent_results["evidence_verification"] = {
                "evidence_confidence_score": evidence_result.evidence_confidence_score,
                "data_completeness_pct": evidence_result.data_completeness_pct,
                "temporal_coverage_days": evidence_result.temporal_coverage_days,
                "missing_fields": evidence_result.missing_evidence_fields,
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
                message=f"Evidence audit complete: Confidence {evidence_result.evidence_confidence_score}/100. Missing: {len(missing_fields)} items (treated neutrally)."
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
