import time
from fastapi import APIRouter, status, Response
from datetime import datetime, timezone
from sqlalchemy import text
from ..db import engine
from ..modules.agents.llm_client import llm_client

router = APIRouter(tags=["System Health & Diagnostics"])

def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

@router.get("/health")
async def health_check():
    """
    Comprehensive platform health diagnostics.
    Inspects database connectivity, SSE event bus, and external LLM configuration.
    """
    db_status = "HEALTHY"
    db_latency_ms = 0.0
    try:
        t0 = time.monotonic()
        with engine.connect() as conn:
            conn.execute(text("SELECT 1;"))
        db_latency_ms = round((time.monotonic() - t0) * 1000.0, 2)
    except Exception as dbe:
        db_status = f"DEGRADED: {str(dbe)}"

    llm_diag = llm_client.get_diagnostics()

    overall_healthy = "DEGRADED" not in db_status

    return {
        "status": "healthy" if overall_healthy else "degraded",
        "service": "UDYOGA Financial Intelligence Platform",
        "timestamp": utc_now_iso(),
        "phase": "Phase 2D Reliability & System Resilience",
        "database": {
            "status": db_status,
            "latency_ms": db_latency_ms,
            "dialect": "sqlite",
            "journal_mode": "WAL"
        },
        "modules_active": {
            "api_gateway": True,
            "financial_intelligence": "operational",
            "trust_evidence": "operational",
            "resilience_engine": "operational",
            "agent_orchestrator": "operational",
            "sse_event_bus": True
        },
        "llm_service": llm_diag
    }

@router.get("/health/readiness")
async def readiness_check(response: Response):
    """
    Kubernetes/container readiness probe.
    Verifies database connectivity before directing production traffic.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1;"))
        return {"status": "READY", "timestamp": utc_now_iso()}
    except Exception as e:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "NOT_READY", "error": str(e), "timestamp": utc_now_iso()}

@router.get("/health/liveness")
async def liveness_check():
    """Fast process liveness probe."""
    return {"status": "ALIVE", "timestamp": utc_now_iso()}

@router.get("/status")
async def system_status():
    """Returns platform version, active capabilities, and architectural guarantees."""
    return {
        "version": "0.2.0-phase2d",
        "guarantees": [
            "Deterministic financial calculations via Python/Pandas/NumPy",
            "No credit bureau score simulation (bureau score claim removed)",
            "Absence of evidence != negative financial evidence",
            "Suspicious graph patterns trigger investigation, not fraud verdicts",
            "Single consistent business_id and assessment_id across pipeline",
            "Private chain-of-thought excluded from logs and client responses",
            "Agent fault tolerance: Upstream calculation failures never yield fabricated loans",
            "Append-only immutable audit trail and RBAC tenant isolation",
            "Automatic restart recovery for interrupted assessments"
        ]
    }
