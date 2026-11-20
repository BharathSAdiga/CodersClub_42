from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter(tags=["System Health & Diagnostics"])

@router.get("/health")
async def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "service": "UDYOGA Financial Intelligence Platform",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "phase": "Phase 0 Architecture Baseline",
        "modules_active": {
            "api_gateway": True,
            "financial_intelligence": "ready_for_integration",
            "trust_evidence": "ready_for_integration",
            "resilience_engine": "ready_for_integration",
            "agent_orchestrator": "ready_for_integration",
            "sse_event_bus": True
        }
    }

@router.get("/status")
async def system_status():
    """Returns platform version, active capabilities, and architectural guarantees."""
    return {
        "version": "0.1.0-phase0",
        "guarantees": [
            "Deterministic financial calculations via Python/Pandas/NumPy",
            "No credit bureau score simulation (bureau score claim removed)",
            "Absence of evidence != negative financial evidence",
            "Suspicious graph patterns trigger investigation, not fraud verdicts",
            "Single consistent business_id and assessment_id across pipeline",
            "Private chain-of-thought excluded from logs and client responses"
        ]
    }
