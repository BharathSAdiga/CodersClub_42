from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from typing import Dict, Optional
import uuid
import asyncio
from datetime import datetime, timezone

from ..schemas.assessment import (
    CreditAppraisalMemo,
    AssessmentTriggerRequest,
    AssessmentTriggerResponse
)
from ..schemas.agent import AgentEvent
from ..schemas.financial_dna import FinancialDNA
from ..schemas.graph import GraphMetrics, GraphNode, GraphEdge
from ..schemas.evidence import EvidenceConfidence
from ..schemas.resilience import ShockSimulationResult, ShockScenarioInput, AffordabilityAnalysis
from ..core.event_bus import event_bus
from .endpoints_business import BUSINESS_STORE

router = APIRouter(prefix="/assessment", tags=["Assessment & Agent Orchestration"])

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

# In-memory store for assessments
ASSESSMENT_STORE: Dict[str, CreditAppraisalMemo] = {}

def build_demo_memo(assessment_id: str, business_id: str) -> CreditAppraisalMemo:
    """Builds an indicative, explainable Credit Appraisal Memo without credit bureau claims."""
    is_kirana = "kirana" in business_id
    is_trading = "trading" in business_id
    is_weaver = "weaver" in business_id
    
    if is_trading:
        # Scenario 2: Counterparty investigation triggered
        status = "HUMAN_REVIEW_REQUIRED"
        risk_band = "HIGH_RISK"
        inv_status = "HUMAN_REVIEW_RECOMMENDED"
        recommended_loan = 0.0
        tenure = 0
        apr = "N/A"
        facility = "NONE_RECOMMENDED"
        confidence = 88.0
        strengths = [
            "High declared monthly turnover (> ₹14.5 Lakhs)",
            "Active GST registration with verified GSTR-3B filings"
        ]
        vulnerabilities = [
            "Network graph reveals closed circular transaction loops across 2 related counterparties",
            "34% of monthly debit volume returns as credits within 48 hours without corresponding shipping e-way bills",
            "Turnover concentration: 68% volume routed through single counterparty handle"
        ]
        mitigants = [
            "Trigger manual field investigator visit to verify physical inventory and dispatch registers",
            "Require audited bank statements for all directors/partners before credit line sanction"
        ]
        narrative = (
            "### Executive Summary\n"
            "Anomalous transaction clustering and reciprocal fund movements detected across related entities. "
            "While declared turnover meets standard thresholds, topological graph analysis flagged circular fund transfers "
            "totaling ₹4.92 Lakhs. In accordance with UDYOGA policy, automated approval is paused pending physical trade verification."
        )
    elif is_weaver:
        # Scenario 3: Seasonal artisan / conditional recommendation
        status = "CONDITIONAL_RECOMMENDATION"
        risk_band = "MODERATE_RISK"
        inv_status = "NORMAL_PATTERNS"
        recommended_loan = 150000.0
        tenure = 9
        apr = "14.0% - 15.5% p.a."
        facility = "REVENUE_BASED_DAILY_SWEEP"
        confidence = 72.0
        strengths = [
            "Demonstrated 64-month operational vintage in regional handloom cluster",
            "High counterparty diversity across 40+ wholesale textile buyers",
            "No circular or reciprocating fund flows identified"
        ]
        vulnerabilities = [
            "Marked seasonality index (1.82x peak-to-trough ratio) tied to festival cycles",
            "Absence of formal GST records restricts maximum exposure ceiling"
        ]
        mitigants = [
            "Structure as flexible revenue-based daily sweep (8% of daily UPI receipts) to flex during low-monsoon season",
            "Missing GST treated as neutral uncertainty rather than financial delinquency"
        ]
        narrative = (
            "### Executive Summary\n"
            "Business demonstrates strong artisanal vintage and steady non-seasonal baseline demand. "
            "Seasonal cashflow volatility is mitigated through flexible revenue-linked repayment sweeps."
        )
    else:
        # Scenario 1: Prime Kirana (Credit invisible, high cash velocity, low volatility)
        status = "INDICATIVE_RECOMMENDATION"
        risk_band = "LOW_RISK"
        inv_status = "NORMAL_PATTERNS"
        recommended_loan = 250000.0
        tenure = 12
        apr = "13.2% - 14.5% p.a."
        facility = "UNSECURED_WORKING_CAPITAL_LINE"
        confidence = 82.0
        strengths = [
            "Extremely low cash velocity (2.8 days), signaling rapid daily inventory turnover",
            "Low inflow volatility (CV 0.18), indicating predictable, recession-resilient grocery demand",
            "Consistent daily average balance buffer supporting debt servicing",
            "Pristine repayment discipline on micro-credit utility obligations"
        ]
        vulnerabilities = [
            "Lack of formal audited balance sheet and ITR",
            "Absence of immovable collateral"
        ]
        mitigants = [
            "Daily QR settlement auto-debit mechanism captures operational cash at source",
            "Unencumbered operating cash surplus exceeds ₹65,000/month after existing micro-EMI"
        ]
        narrative = (
            "### Executive Summary\n"
            "Exhibits exemplary behavioral cashflow DNA characteristic of premier neighborhood retail. "
            "High velocity of consumer UPI micro-credits generates an unencumbered monthly surplus of ₹74,500. "
            "Projected DSCR post-borrowing is 1.84x, providing robust shock tolerance against inflation."
        )

    return CreditAppraisalMemo(
        assessment_id=assessment_id,
        business_id=business_id,
        generated_at=utc_now(),
        assessment_status=status,
        financial_risk_band=risk_band,
        evidence_confidence_score=confidence,
        investigation_status=inv_status,
        recommended_loan_amount_inr=recommended_loan,
        recommended_tenure_months=tenure,
        indicative_apr_range=apr,
        recommended_facility_type=facility,
        positive_credit_factors=strengths,
        risk_factors_and_vulnerabilities=vulnerabilities,
        recommended_covenants_and_mitigants=mitigants,
        cam_narrative_markdown=narrative,
        is_fallback_rule_based=False,
        is_synthetic_evaluation=True
    )

# Pre-populate demo assessments for immediate frontend access
for demo_b_id in ["msme_kirana_kanpur_001", "msme_trading_surat_002", "msme_weaver_erode_003"]:
    demo_a_id = f"eval_{demo_b_id}"
    ASSESSMENT_STORE[demo_a_id] = build_demo_memo(demo_a_id, demo_b_id)

async def simulate_agent_pipeline_execution(assessment_id: str, business_id: str):
    """
    Simulates asynchronous multi-agent execution pipeline emitting real-time SSE events.
    Excludes private chain-of-thought, exposing tasks, tool calls, structured findings, and status.
    """
    steps = [
        (
            "FinancialDNAAgent",
            "compute_behavioral_velocity",
            "TOOL_CALLED",
            "parse_cash_velocity",
            "Analyzing 180-day transactional velocity and rolling volatility index...",
            {"cash_velocity_days": 2.8, "volatility_cv": 0.18, "rolling_dscr": 1.84}
        ),
        (
            "FinancialDNAAgent",
            "evaluate_seasonality_patterns",
            "STRUCTURED_RESULT",
            None,
            "Financial DNA profile synthesized: Low revenue volatility with high customer turnover.",
            {"seasonality_index": 1.12, "weekend_to_weekday_ratio": 1.45}
        ),
        (
            "ForensicInvestigatorAgent",
            "audit_counterparty_topology",
            "TOOL_CALLED",
            "networkx_cycle_detector",
            "Running topological graph analysis on 54 distinct counterparty nodes...",
            {"cycles_detected": 0 if "trading" not in business_id else 1}
        ),
        (
            "ForensicInvestigatorAgent",
            "evaluate_suspicious_patterns",
            "STRUCTURED_RESULT",
            None,
            "Graph audit complete. " + (
                "Anomaly flagged: Circular transfer detected between 2 related entities."
                if "trading" in business_id else "No circular trading or abnormal round-tripping identified."
            ),
            {"status": "INVESTIGATION_TRIGGERED" if "trading" in business_id else "NORMAL_PATTERNS"}
        ),
        (
            "ResilienceAuditorAgent",
            "simulate_economic_stress",
            "TOOL_CALLED",
            "deterministic_shock_engine",
            "Applying -25% revenue contraction and +15% COGS shock scenario...",
            {"baseline_runway_days": 90, "stressed_runway_days": 54}
        ),
        (
            "SeniorUnderwriterAgent",
            "synthesize_appraisal_memo",
            "STRUCTURED_RESULT",
            None,
            "Synthesizing Credit Appraisal Memo with risk bands, limits, and covenant terms.",
            {"decision": "INDICATIVE_RECOMMENDATION" if "trading" not in business_id else "HUMAN_REVIEW_REQUIRED"}
        ),
    ]

    for agent_name, step_name, status, tool, msg, findings in steps:
        await asyncio.sleep(0.8)
        event = AgentEvent(
            event_id=f"evt_{uuid.uuid4().hex[:10]}",
            assessment_id=assessment_id,
            business_id=business_id,
            agent_name=agent_name,
            step_name=step_name,
            status=status,
            tool_called=tool,
            tool_input_summary=f"Input parameters for {tool}" if tool else None,
            structured_findings=findings,
            message=msg
        )
        await event_bus.publish(event)

    # Final completion event
    await asyncio.sleep(0.5)
    completion_event = AgentEvent(
        event_id=f"evt_{uuid.uuid4().hex[:10]}",
        assessment_id=assessment_id,
        business_id=business_id,
        agent_name="SeniorUnderwriterAgent",
        step_name="complete_assessment",
        status="COMPLETED",
        message="Assessment complete. Credit Appraisal Memo generated and published."
    )
    await event_bus.publish(completion_event)
    await event_bus.close_stream(assessment_id)

    # Persist the final memo
    ASSESSMENT_STORE[assessment_id] = build_demo_memo(assessment_id, business_id)

@router.post("/run", response_model=AssessmentTriggerResponse)
async def trigger_assessment(
    payload: AssessmentTriggerRequest,
    background_tasks: BackgroundTasks
):
    """Triggers asynchronous agent pipeline for a business and returns streaming assessment ID."""
    business_id = payload.business_id
    if business_id not in BUSINESS_STORE:
        raise HTTPException(status_code=404, detail=f"Business '{business_id}' not found")
        
    assessment_id = f"eval_{uuid.uuid4().hex[:12]}"
    
    # Emit initial started event
    init_event = AgentEvent(
        event_id=f"evt_{uuid.uuid4().hex[:10]}",
        assessment_id=assessment_id,
        business_id=business_id,
        agent_name="Orchestrator",
        step_name="initialize_pipeline",
        status="STARTED",
        message=f"Initiating UDYOGA agentic evaluation for {BUSINESS_STORE[business_id].trade_name}"
    )
    await event_bus.publish(init_event)
    
    # Queue execution
    background_tasks.add_task(simulate_agent_pipeline_execution, assessment_id, business_id)
    
    return AssessmentTriggerResponse(
        assessment_id=assessment_id,
        business_id=business_id,
        status="QUEUED",
        message="Agent orchestration initiated. Stream live execution via the stream_url.",
        stream_url=f"/api/v1/assessment/{assessment_id}/stream"
    )

@router.get("/{assessment_id}/stream")
async def stream_assessment_events(assessment_id: str):
    """Server-Sent Events (SSE) streaming endpoint for live agent audit terminal."""
    return StreamingResponse(
        event_bus.subscribe(assessment_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.get("/{assessment_id}/result", response_model=CreditAppraisalMemo)
async def get_assessment_result(assessment_id: str):
    """Retrieve full completed Credit Appraisal Memo (CAM) and structured snapshots."""
    if assessment_id not in ASSESSMENT_STORE:
        raise HTTPException(
            status_code=404, 
            detail=f"Assessment '{assessment_id}' not found or still processing. Connect to stream endpoint to observe status."
        )
    return ASSESSMENT_STORE[assessment_id]
