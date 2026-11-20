import uuid
import time
import logging
import asyncio
from typing import Optional, List, Dict, Any
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
    - Concurrent execution of independent analysis agents (Stages 3, 4, 5, 6).
    - Sequential dependencies for simulation, underwriting, and CAM explanation.
    - 100% deterministic calculations without private LLM chain-of-thought leakage.
    - Immediate deterministic fallback on agent or LLM failure.
    - Structured real-time SSE event publishing.
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
        Executes the 10-stage asynchronous multi-agent assessment pipeline.
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

            # Step 3, 4, 5, 6: CONCURRENT EXECUTION OF INDEPENDENT ANALYSIS AGENTS
            # Financial Intelligence, Evidence Verification, Transaction Forensics, Business Vitality
            async def run_financial():
                if context.financial_dna is None:
                    return await self.financial_agent.execute(context)
                context.record_stage("FINANCIAL_ANALYSIS", "COMPLETED")
                return context.financial_dna

            async def run_evidence():
                if context.evidence_confidence is None:
                    return await self.evidence_agent.execute(context)
                context.record_stage("EVIDENCE_ANALYSIS", "COMPLETED")
                return context.evidence_confidence

            async def run_forensics():
                if context.graph_metrics is None:
                    return await self.forensics_agent.execute(context)
                context.record_stage("TRANSACTION_INVESTIGATION", "COMPLETED")
                return context.graph_metrics

            async def run_vitality():
                return await self.vitality_agent.execute(context)

            # Gather parallel agents
            await asyncio.gather(
                run_financial(),
                run_evidence(),
                run_forensics(),
                run_vitality(),
                return_exceptions=False
            )

            # Step 7: RESILIENCE_SIMULATION (Depends on Financial Analysis)
            await self.resilience_agent.execute(context)

            # Step 8: UNDERWRITING (Depends on all upstream agents)
            await self.underwriting_agent.execute(context)

            # Step 9: EXPLANATION_GENERATION (Depends on Underwriting)
            memo = await self.explanation_agent.execute(context)

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
                    f"Assessment pipeline completed successfully in {pipeline_duration_ms:.1f}ms. "
                    f"Status: {memo.assessment_status} | Facility: ₹{memo.recommended_loan_amount_inr:,.2f}"
                )
            )

            await self.event_bus.close_stream(assessment_id)
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
            await self.event_bus.close_stream(assessment_id)
            raise

orchestrator = AgentOrchestrator()
