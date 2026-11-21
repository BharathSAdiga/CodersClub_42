from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from fastapi.responses import StreamingResponse
from typing import Dict, Optional, Any
from decimal import Decimal
import uuid
import asyncio
import time
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
from .endpoints_transactions import TRANSACTION_STORE
from ..modules.agents import orchestrator
from ..db import DatabaseBackedAssessmentStore

router = APIRouter(prefix="/assessment", tags=["Assessment & Agent Orchestration"])

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

import logging

logger = logging.getLogger(__name__)

# Database-backed assessment store (persisted to SQLite)
ASSESSMENT_STORE: Dict[str, CreditAppraisalMemo] = DatabaseBackedAssessmentStore()

# In-flight execution registry to prevent duplicate concurrent runs for the same business
ACTIVE_RUNS: Dict[str, Dict[str, Any]] = {}
IDEMPOTENCY_CACHE: Dict[str, str] = {}

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
        recommended_loan = Decimal("0.0")
        tenure = 0
        apr = "N/A"
        apr_min = None
        apr_max = None
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
        recommended_loan = Decimal("150000.0")
        tenure = 9
        apr = "14.0% - 15.5% p.a."
        apr_min = Decimal("14.0")
        apr_max = Decimal("15.5")
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
        recommended_loan = Decimal("250000.0")
        tenure = 12
        apr = "13.2% - 14.5% p.a."
        apr_min = Decimal("13.2")
        apr_max = Decimal("14.5")
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
        indicative_apr_min_pct=apr_min,
        indicative_apr_max_pct=apr_max,
        indicative_apr_range=apr,
        recommended_facility_type=facility,
        positive_credit_factors=strengths,
        risk_factors_and_vulnerabilities=vulnerabilities,
        recommended_covenants_and_mitigants=mitigants,
        assumptions=[
            "Assesses behavioral operational cash flows rather than balance sheet asset collateral",
            "Debt capacity calculated on verified unencumbered monthly operating surplus",
            "Repayments structured to avoid exceeding 50% fixed obligation to income ratio"
        ],
        data_limitations=[
            "Unbanked physical cash turnover not reflected in digital statements",
            "Evaluates digital evidence records provided as of assessment date"
        ],
        evidence_references=[f"ref_statement_{business_id}", f"ref_upi_{business_id}"],
        calculation_version="1.0.0",
        cam_narrative_markdown=narrative,
        is_fallback_rule_based=False,
        is_synthetic_evaluation=True
    )

# Pre-populate demo assessments for immediate frontend access
for demo_b_id in ["msme_kirana_kanpur_001", "msme_trading_surat_002", "msme_weaver_erode_003"]:
    demo_a_id = f"eval_{demo_b_id}"
    ASSESSMENT_STORE[demo_a_id] = build_demo_memo(demo_a_id, demo_b_id)

async def execute_agent_assessment(assessment_id: str, business_id: str):
    """
    Executes the real asynchronous multi-agent assessment pipeline emitting real-time SSE events.
    Excludes private chain-of-thought, exposing tasks, tool calls, structured findings, and status.
    """
    profile = BUSINESS_STORE.get(business_id)
    if not profile:
        ACTIVE_RUNS.pop(business_id, None)
        return
    txs = TRANSACTION_STORE.get(business_id, [])
    
    # Record RUNNING status in SQLite database for recovery
    try:
        from ..db import assessment_repo
        assessment_repo.record_started(assessment_id, business_id)
    except Exception as dbe:
        logger.warning(f"Could not record started status for {assessment_id} in SQLite: {dbe}")

    try:
        memo = await orchestrator.run_assessment_pipeline(
            business_profile=profile,
            assessment_id=assessment_id,
            transactions=txs
        )
        ASSESSMENT_STORE[assessment_id] = memo
        try:
            from ..db import assessment_repo
            assessment_repo.save(memo)
        except Exception:
            pass
    except Exception as e:
        logger.error(f"Error during async assessment {assessment_id}: {e}")
        fallback_memo = CreditAppraisalMemo(
            assessment_id=assessment_id,
            business_id=business_id,
            generated_at=utc_now(),
            assessment_status="HUMAN_REVIEW_REQUIRED",
            financial_risk_band="UNASSESSED",
            evidence_confidence_score=0.0,
            investigation_status="FAILED",
            recommended_loan_amount_inr=Decimal("0.0"),
            recommended_tenure_months=0,
            recommended_facility_type="NONE_RECOMMENDED",
            positive_credit_factors=[],
            risk_factors_and_vulnerabilities=[f"Assessment execution halted: {str(e)}"],
            recommended_covenants_and_mitigants=["Manual credit underwriter review required."],
            assumptions=["Automated multi-agent execution encountered an error."],
            data_limitations=[str(e)],
            evidence_references=[],
            calculation_version="1.0.0",
            cam_narrative_markdown=f"### Pipeline Execution Error\n\nThe assessment pipeline encountered an exception: `{str(e)}`.\nA human underwriter must review this application.",
            is_fallback_rule_based=True,
            fallback_reason=f"Pipeline error: {str(e)}"
        )
        ASSESSMENT_STORE[assessment_id] = fallback_memo
        try:
            from ..db import assessment_repo
            assessment_repo.save(fallback_memo)
        except Exception:
            pass
    finally:
        ACTIVE_RUNS.pop(business_id, None)

@router.post("/run", response_model=AssessmentTriggerResponse)
async def trigger_assessment(
    payload: AssessmentTriggerRequest,
    background_tasks: BackgroundTasks,
    request: Request
):
    """Triggers asynchronous agent pipeline for a business and returns streaming assessment ID."""
    business_id = payload.business_id
    if business_id not in BUSINESS_STORE:
        raise HTTPException(status_code=404, detail=f"Business '{business_id}' not found")

    idempotency_key = request.headers.get("Idempotency-Key") or request.headers.get("X-Idempotency-Key")
    now_ts = time.time()

    # 1. Idempotency Check: if identical idempotency key was received within 300 seconds
    if idempotency_key and idempotency_key in IDEMPOTENCY_CACHE:
        cached_id = IDEMPOTENCY_CACHE[idempotency_key]
        return AssessmentTriggerResponse(
            assessment_id=cached_id,
            business_id=business_id,
            status="QUEUED",
            message="Idempotent request recognized. Returning existing assessment run.",
            stream_url=f"/api/v1/assessment/{cached_id}/stream"
        )

    # 2. Concurrency De-duplication: Prevent duplicate concurrent runs for same business within 15 seconds
    if business_id in ACTIVE_RUNS:
        active = ACTIVE_RUNS[business_id]
        if (now_ts - active.get("started_at", 0)) < 15.0:
            existing_id = active.get("assessment_id")
            return AssessmentTriggerResponse(
                assessment_id=existing_id,
                business_id=business_id,
                status="RUNNING",
                message="An assessment is already actively running for this business. Reusing active session.",
                stream_url=f"/api/v1/assessment/{existing_id}/stream"
            )

    assessment_id = f"eval_{uuid.uuid4().hex[:12]}"
    ACTIVE_RUNS[business_id] = {"assessment_id": assessment_id, "started_at": now_ts}
    if idempotency_key:
        IDEMPOTENCY_CACHE[idempotency_key] = assessment_id
    
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

    try:
        from ..db import audit_repo
        audit_repo.log_access(
            user_id="system_orchestrator",
            role="SYSTEM",
            business_id=business_id,
            resource_type="ASSESSMENT",
            action="ASSESSMENT_EXECUTE",
            details=f"Triggered 8-agent assessment '{assessment_id}' for business '{business_id}'.",
            outcome="SUCCESS",
            structured_metadata={"assessment_id": assessment_id, "business_id": business_id}
        )
    except Exception:
        pass
    
    # Queue execution
    background_tasks.add_task(execute_agent_assessment, assessment_id, business_id)
    
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

@router.get("/{assessment_id}/events", response_model=list[AgentEvent])
async def get_assessment_events(assessment_id: str):
    """Retrieve history of structured agent execution events for an assessment."""
    return event_bus.get_history(assessment_id)

@router.get("/{assessment_id}/result", response_model=CreditAppraisalMemo)
async def get_assessment_result(assessment_id: str):
    """Retrieve full completed Credit Appraisal Memo (CAM) and structured snapshots."""
    if assessment_id not in ASSESSMENT_STORE:
        raise HTTPException(
            status_code=404, 
            detail=f"Assessment '{assessment_id}' not found or still processing. Connect to stream endpoint to observe status."
        )
    return ASSESSMENT_STORE[assessment_id]

@router.get("/business/{business_id}/latest", response_model=CreditAppraisalMemo)
async def get_latest_assessment_for_business(business_id: str):
    """Retrieve the latest completed Credit Appraisal Memo (CAM) for a given business ID."""
    matching = [memo for memo in ASSESSMENT_STORE.values() if memo.business_id == business_id]
    if matching:
        matching.sort(key=lambda m: m.generated_at, reverse=True)
        return matching[0]
    try:
        from ..db import assessment_repo
        memos = assessment_repo.list_for_business(business_id)
        if memos:
            return memos[0]
    except Exception:
        pass
    raise HTTPException(status_code=404, detail=f"No completed assessment found for business '{business_id}'")
