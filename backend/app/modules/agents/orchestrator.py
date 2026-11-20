import uuid
import time
import logging
import asyncio
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime, timezone
from decimal import Decimal

from ...schemas.agent import AgentEvent
from ...schemas.business import BusinessProfile
from ...schemas.transaction import Transaction
from ...schemas.financial_dna import FinancialDNA
from ...schemas.graph import GraphMetrics
from ...schemas.evidence import EvidenceConfidence
from ...schemas.resilience import ShockScenarioInput, ShockSimulationResult
from ...schemas.assessment import CreditAppraisalMemo
from ...core.event_bus import event_bus
from .context import AssessmentContext
from .retry_policy import AgentRetryConfig, execute_with_retry_and_timeout
from .financial_intelligence_agent import FinancialIntelligenceAgent
from .evidence_verification_agent import EvidenceVerificationAgent
from .transaction_forensics_agent import TransactionForensicsAgent
from .business_vitality_agent import BusinessVitalityAgent
from .resilience_simulation_agent import ResilienceSimulationAgent
from .underwriting_agent import UnderwritingAgent
from .explanation_agent import ExplanationAndPassportAgent

logger = logging.getLogger(__name__)

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class AgentOrchestrator:
    """
    Asynchronous Multi-Agent State Machine for UDYOGA.
    Coordinates 7 specialized agents across 10 deterministic execution stages:
      1. INITIALIZING
      2. DATA_VALIDATION
      3. FINANCIAL_ANALYSIS
      4. EVIDENCE_ANALYSIS
      5. TRANSACTION_INVESTIGATION
      6. BUSINESS_VITALITY_ANALYSIS
      7. RESILIENCE_SIMULATION
      8. UNDERWRITING
      9. EXPLANATION_GENERATION
      10. COMPLETED / FAILED
      
    Guarantees:
    - Shared assessment context across all agents.
    - Fault-tolerant concurrent execution of independent analysis agents (Stages 3, 4, 5, 6).
    - Failure isolation: Failure in one agent does not terminate unaffected peers.
    - Individual agent timeouts and exponential backoff retry policies.
    - Strict non-fabrication guarantee: Failed financial/resilience calculations
      never produce fabricated numbers or unauthorized credit approvals.
    - Structured real-time SSE event publishing with guaranteed stream teardown.
    """
    def __init__(self):
        self.event_bus = event_bus
        self.financial_agent = FinancialIntelligenceAgent()
        self.evidence_agent = EvidenceVerificationAgent()
        self.forensics_agent = TransactionForensicsAgent()
        self.vitality_agent = BusinessVitalityAgent()
        self.resilience_agent = ResilienceSimulationAgent()
        self.underwriting_agent = UnderwritingAgent()
        self.explanation_agent = ExplanationAndPassportAgent()

    async def emit_event(
        self,
        context: AssessmentContext,
        agent_name: str,
        step_name: str,
        status: str,
        message: str,
        tool_called: Optional[str] = None,
        tool_input_summary: Optional[str] = None,
        structured_findings: Optional[Dict[str, Any]] = None,
        execution_duration_ms: Optional[float] = None,
        error_message: Optional[str] = None,
        event_type: str = "EXECUTION_STEP"
    ) -> AgentEvent:
        event = AgentEvent(
            event_id=f"evt_{uuid.uuid4().hex[:10]}",
            assessment_id=context.assessment_id,
            business_id=context.business_id,
            timestamp=utc_now(),
            agent_name=agent_name,
            step_name=step_name,
            status=status,
            event_type=event_type,
            tool_called=tool_called,
            tool_input_summary=tool_input_summary,
            structured_findings=structured_findings,
            message=message,
            user_facing_message=message,
            execution_duration_ms=execution_duration_ms,
            error_message=error_message
        )
        context.events_emitted.append(event)
        await self.event_bus.publish(event)
        return event

    async def _execute_agent_isolated(
        self,
        context: AssessmentContext,
        agent_name: str,
        step_name: str,
        coro_func,
        timeout_seconds: float = 6.0,
        max_retries: int = 2
    ) -> Tuple[bool, Any, Optional[str]]:
        """
        Executes a specialized agent with strict timeout, retry policy, and failure isolation.
        Emits 'RETRYING' events on transient failure and records errors in context.
        """
        async def on_retry(attempt: int, exc: Exception, delay: float):
            await self.emit_event(
                context=context,
                agent_name=agent_name,
                step_name=step_name,
                status="RETRYING",
                event_type="SYSTEM_RETRY",
                message=f"Transient failure in {agent_name} ({type(exc).__name__}). Retrying attempt {attempt + 1} after {delay:.2f}s backoff..."
            )

        config = AgentRetryConfig(
            max_retries=max_retries,
            base_delay_seconds=0.05,
            exponential_factor=2.0,
            timeout_seconds=timeout_seconds,
            retry_transient_only=True
        )

        success, result, err = await execute_with_retry_and_timeout(
            coro_func=coro_func,
            agent_name=agent_name,
            step_name=step_name,
            config=config,
            on_retry_callback=on_retry
        )

        if not success:
            context.record_error(agent_name, step_name, err or "Execution failed")
        return success, result, err

    async def run_assessment_pipeline(
        self,
        business_profile: BusinessProfile,
        assessment_id: Optional[str] = None,
        transactions: Optional[List[Transaction]] = None,
        requested_loan_amount_inr: Optional[Decimal] = None,
        scenario: Optional[ShockScenarioInput] = None,
        dna: Optional[FinancialDNA] = None,
        graph: Optional[GraphMetrics] = None,
        evidence: Optional[EvidenceConfidence] = None
    ) -> CreditAppraisalMemo:
        """
        Executes the 10-stage asynchronous multi-agent assessment pipeline with fault tolerance.
        """
        business_id = business_profile.business_id
        assessment_id = assessment_id or f"eval_{uuid.uuid4().hex[:12]}"
        transactions = transactions or []
        scenario = scenario or ShockScenarioInput()

        # Step 1: Initialize Assessment Context
        context = AssessmentContext(
            assessment_id=assessment_id,
            business_id=business_id,
            business_profile=business_profile,
            requested_loan_amount_inr=requested_loan_amount_inr,
            scenario_input=scenario,
            transactions=transactions,
            financial_dna=dna,
            graph_metrics=graph,
            evidence_confidence=evidence
        )

        pipeline_start_time = time.monotonic()
        context.record_stage("INITIALIZING", "RUNNING")

        await self.emit_event(
            context=context,
            agent_name="Orchestrator",
            step_name="initialize_pipeline",
            status="STARTED",
            event_type="TASK_START",
            message=f"Starting multi-agent credit assessment for '{business_profile.trade_name}' (ID: {business_id})"
        )
        context.record_stage("INITIALIZING", "COMPLETED")

        try:
            # Step 2: DATA_VALIDATION
            val_start = time.monotonic()
            context.record_stage("DATA_VALIDATION", "RUNNING")
            
            if not business_profile.business_id or len(business_profile.business_id.strip()) == 0:
                raise ValueError("Invalid business_id provided.")
            if business_profile.declared_monthly_turnover < Decimal("0.0"):
                raise ValueError("Declared monthly turnover cannot be negative.")
            if business_profile.declared_existing_monthly_emi < Decimal("0.0"):
                raise ValueError("Declared existing EMI cannot be negative.")

            val_duration_ms = (time.monotonic() - val_start) * 1000.0
            await self.emit_event(
                context=context,
                agent_name="Orchestrator",
                step_name="validate_input_data",
                status="COMPLETED",
                event_type="STRUCTURED_RESULT",
                tool_called="input_schema_validator",
                execution_duration_ms=val_duration_ms,
                structured_findings={
                    "business_id": business_id,
                    "declared_turnover_inr": float(business_profile.declared_monthly_turnover),
                    "transaction_count": len(transactions),
                    "validation_passed": True
                },
                message=f"Input validation passed: {len(transactions)} transactions ingested for {business_profile.legal_name}."
            )
            context.record_stage("DATA_VALIDATION", "COMPLETED")

            # Steps 3, 4, 5, 6: CONCURRENT EXECUTION OF INDEPENDENT ANALYSIS AGENTS (WITH FAILURE ISOLATION)
            async def run_financial_isolated():
                if context.financial_dna is not None:
                    context.record_stage("FINANCIAL_ANALYSIS", "COMPLETED")
                    return context.financial_dna
                ok, res, err = await self._execute_agent_isolated(
                    context, "FinancialIntelligenceAgent", "analyze_financial_dna",
                    lambda: self.financial_agent.execute(context)
                )
                if ok:
                    context.financial_dna = res
                else:
                    context.financial_dna = None
                    context.record_stage("FINANCIAL_ANALYSIS", "FAILED")
                return context.financial_dna

            async def run_evidence_isolated():
                if context.evidence_confidence is not None:
                    context.record_stage("EVIDENCE_ANALYSIS", "COMPLETED")
                    return context.evidence_confidence
                ok, res, err = await self._execute_agent_isolated(
                    context, "EvidenceVerificationAgent", "audit_and_reconcile_evidence",
                    lambda: self.evidence_agent.execute(context)
                )
                if ok:
                    context.evidence_confidence = res
                else:
                    context.evidence_confidence = None
                    context.record_stage("EVIDENCE_ANALYSIS", "FAILED")
                return context.evidence_confidence

            async def run_forensics_isolated():
                if context.graph_metrics is not None:
                    context.record_stage("TRANSACTION_INVESTIGATION", "COMPLETED")
                    return context.graph_metrics
                ok, res, err = await self._execute_agent_isolated(
                    context, "TransactionForensicsAgent", "construct_and_analyze_counterparty_graph",
                    lambda: self.forensics_agent.execute(context)
                )
                if ok:
                    context.graph_metrics = res
                else:
                    context.graph_metrics = None
                    context.record_stage("TRANSACTION_INVESTIGATION", "FAILED")
                return context.graph_metrics

            async def run_vitality_isolated():
                ok, res, err = await self._execute_agent_isolated(
                    context, "BusinessVitalityAgent", "assess_composite_vitality",
                    lambda: self.vitality_agent.execute(context)
                )
                if ok:
                    context.vitality_analysis = res
                else:
                    context.vitality_analysis = None
                    context.record_stage("BUSINESS_VITALITY_ANALYSIS", "FAILED")
                return context.vitality_analysis

            # Gather parallel independent agents
            await asyncio.gather(
                run_financial_isolated(),
                run_evidence_isolated(),
                run_forensics_isolated(),
                run_vitality_isolated(),
                return_exceptions=False
            )

            # Step 7: RESILIENCE_SIMULATION (Depends on Financial Analysis)
            # NON-FABRICATION GUARANTEE: If Financial Analysis failed and no declared turnover exists, halt simulation
            if context.financial_dna is None and business_profile.declared_monthly_turnover <= Decimal("0.0"):
                context.resilience_result = None
                context.record_stage("RESILIENCE_SIMULATION", "FAILED")
                await self.emit_event(
                    context=context,
                    agent_name="ResilienceSimulationAgent",
                    step_name="simulate_cashflow_shocks",
                    status="FAILED",
                    event_type="FAILURE",
                    error_message="Simulation halted: Upstream financial turnover calculation was unavailable.",
                    message="Resilience simulation skipped: Missing verifiable turnover data."
                )
            else:
                ok_resil, res_resil, err_resil = await self._execute_agent_isolated(
                    context, "ResilienceSimulationAgent", "simulate_cashflow_shocks",
                    lambda: self.resilience_agent.execute(context)
                )
                if ok_resil:
                    context.resilience_result = res_resil
                else:
                    context.resilience_result = None
                    context.record_stage("RESILIENCE_SIMULATION", "FAILED")

            # Step 8: UNDERWRITING (Depends on Upstream Engines)
            # STRICT POLICY: Underwriting MUST NOT approve credit or fabricate scores if essential upstream engines failed
            essential_calculations_failed = (
                context.financial_dna is None
                or context.resilience_result is None
                or context.evidence_confidence is None
            )

            if essential_calculations_failed:
                failed_components = []
                if context.financial_dna is None:
                    failed_components.append("Financial Intelligence Engine")
                if context.resilience_result is None:
                    failed_components.append("Cash-flow Resilience Simulation")
                if context.evidence_confidence is None:
                    failed_components.append("Evidence Verification Engine")

                failure_desc = f"Upstream calculation engines failed or incomplete: {', '.join(failed_components)}"
                logger.warning(f"Underwriting halting automated sanction for {business_id}: {failure_desc}")

                # Create safe, unapproved memo requiring human underwriting review
                safe_memo = CreditAppraisalMemo(
                    assessment_id=assessment_id,
                    business_id=business_id,
                    generated_at=utc_now(),
                    assessment_status="HUMAN_REVIEW_REQUIRED",
                    financial_risk_band="UNASSESSED",
                    evidence_confidence_score=context.evidence_confidence.evidence_confidence_score if context.evidence_confidence else 0.0,
                    investigation_status="HUMAN_REVIEW_RECOMMENDED",
                    recommended_loan_amount_inr=Decimal("0.0"),
                    recommended_tenure_months=0,
                    indicative_apr_range="N/A",
                    recommended_facility_type="NONE_RECOMMENDED",
                    positive_credit_factors=[],
                    risk_factors_and_vulnerabilities=[
                        f"Automated credit assessment halted: {failure_desc}.",
                        "Platform non-fabrication guarantee prevented synthetic metric generation."
                    ],
                    recommended_covenants_and_mitigants=[
                        "Refer application to credit committee for manual financial analysis reconstruction."
                    ],
                    assumptions=["Automated assessment incomplete due to upstream agent failure isolation."],
                    data_limitations=[failure_desc],
                    evidence_references=[],
                    calculation_version="1.0.0",
                    cam_narrative_markdown=(
                        f"### Credit Assessment Incomplete — Referred to Manual Underwriting\n\n"
                        f"Automated underwriting was safely paused because essential upstream financial calculations "
                        f"were unavailable: **{', '.join(failed_components)}**.\n\n"
                        f"Under UDYOGA's institutional reliability policy, no speculative or fabricated loan amounts "
                        f"are recommended when primary data engines cannot complete verification."
                    ),
                    is_fallback_rule_based=True,
                    fallback_reason=failure_desc
                )
                context.credit_appraisal_memo = safe_memo
                context.record_stage("UNDERWRITING", "COMPLETED")

                await self.emit_event(
                    context=context,
                    agent_name="UnderwritingAgent",
                    step_name="evaluate_underwriting_policy",
                    status="COMPLETED",
                    event_type="STRUCTURED_RESULT",
                    tool_called="compile_credit_appraisal_memo",
                    structured_findings={"assessment_status": "HUMAN_REVIEW_REQUIRED", "recommended_loan": 0.0},
                    message="Underwriting halted automated sanctioning due to incomplete upstream calculations. Loan amount set to ₹0.0."
                )
            else:
                ok_uw, res_uw, err_uw = await self._execute_agent_isolated(
                    context, "UnderwritingAgent", "evaluate_underwriting_policy",
                    lambda: self.underwriting_agent.execute(context)
                )
                if ok_uw:
                    context.credit_appraisal_memo = res_uw
                else:
                    context.record_stage("UNDERWRITING", "FAILED")
                    raise RuntimeError(f"Underwriting agent execution failed: {err_uw}")

            # Step 9: EXPLANATION_GENERATION (Depends on Underwriting Memo)
            ok_exp, memo, err_exp = await self._execute_agent_isolated(
                context, "ExplanationAndPassportAgent", "compile_financial_passport_and_cam",
                lambda: self.explanation_agent.execute(context)
            )
            if not ok_exp or memo is None:
                memo = context.credit_appraisal_memo

            # Step 10: COMPLETED
            pipeline_duration_ms = (time.monotonic() - pipeline_start_time) * 1000.0
            context.completed_at = utc_now()
            context.is_completed = True
            context.record_stage("COMPLETED", "COMPLETED")

            await self.emit_event(
                context=context,
                agent_name="Orchestrator",
                step_name="finalize_assessment",
                status="COMPLETED",
                event_type="COMPLETION",
                execution_duration_ms=pipeline_duration_ms,
                structured_findings={
                    "assessment_status": memo.assessment_status,
                    "financial_risk_band": memo.financial_risk_band,
                    "recommended_loan_amount_inr": float(memo.recommended_loan_amount_inr),
                    "total_stages_completed": len(context.stage_statuses),
                    "total_events_emitted": len(context.events_emitted) + 1,
                    "pipeline_duration_ms": round(pipeline_duration_ms, 2)
                },
                message=(
                    f"Assessment pipeline completed in {pipeline_duration_ms:.1f}ms. "
                    f"Status: {memo.assessment_status} | Facility: ₹{memo.recommended_loan_amount_inr:,.2f}"
                )
            )

            return memo

        except Exception as e:
            logger.error(f"Assessment pipeline failed for {business_id}: {e}", exc_info=True)
            pipeline_duration_ms = (time.monotonic() - pipeline_start_time) * 1000.0
            context.has_failed = True
            context.failure_reason = str(e)
            context.record_stage("FAILED", "FAILED")

            await self.emit_event(
                context=context,
                agent_name="Orchestrator",
                step_name="pipeline_failure",
                status="FAILED",
                event_type="FAILURE",
                execution_duration_ms=pipeline_duration_ms,
                error_message=str(e),
                message=f"Assessment pipeline terminated with error: {str(e)}"
            )
            raise
        finally:
            # GUARANTEE: SSE stream is always closed cleanly to prevent hanging client connections
            await self.event_bus.close_stream(assessment_id)

orchestrator = AgentOrchestrator()
