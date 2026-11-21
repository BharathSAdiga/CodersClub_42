import pytest
import asyncio
import uuid
import time
from decimal import Decimal
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch, MagicMock

from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError, IntegrityError

from app.main import app
from app.core.config import settings
from app.core.errors import (
    APIErrorResponse,
    AgentExecutionError,
    AgentTimeoutError,
    IdempotencyConflictError,
    sanitize_error_message
)
from app.modules.agents.retry_policy import (
    AgentRetryConfig,
    execute_with_retry_and_timeout
)
from app.modules.agents.llm_client import (
    llm_client,
    LLMRateLimitError,
    LLMTimeoutError,
    LLMAuthenticationError
)
from app.modules.agents.context import AssessmentContext
from app.modules.agents.orchestrator import AgentOrchestrator
from app.schemas.business import BusinessProfile
from app.schemas.transaction import Transaction
from app.schemas.assessment import CreditAppraisalMemo
from app.db import (
    engine,
    SessionLocal,
    assessment_repo,
    audit_repo,
    AssessmentModel
)

client = TestClient(app)

def make_test_business(biz_id: str) -> BusinessProfile:
    return BusinessProfile(
        business_id=biz_id,
        legal_name=f"Reliability Enterprise {biz_id}",
        trade_name=f"Reliability Store {biz_id}",
        sector="RETAIL_KIRANA",
        vintage_months=24,
        location_tier="TIER_2",
        entity_type="PROPRIETORSHIP",
        declared_monthly_turnover=Decimal("250000.0"),
        declared_existing_monthly_emi=Decimal("0.0"),
        has_gstin=False,
        has_udyam_registration=True
    )

# -----------------------------------------------------------------------------
# 1. Error Sanitization & Request ID Propagation
# -----------------------------------------------------------------------------
def test_error_message_sanitization():
    """Verify passwords, tokens, and database connection strings are never leaked."""
    raw_error = "Failed to connect to postgresql://admin:SuperSecret123@db.prod.internal/udyoga with token Bearer eyJhbGciOiJIUzI1NiJ9"
    sanitized = sanitize_error_message(raw_error)
    assert "SuperSecret123" not in sanitized
    assert "admin" not in sanitized
    assert "Bearer eyJhbGci" not in sanitized
    assert "<DATABASE_REDACTED>" in sanitized or "Bearer <TOKEN_REDACTED>" in sanitized

def test_centralized_rfc7807_error_response_and_correlation_id():
    """Verify API error responses conform to standardized RFC-7807 structure and include correlation/request IDs."""
    resp = client.get("/api/v1/business/non_existent_msme_id_9999", headers={"X-Request-ID": "test_req_abc123"})
    assert resp.status_code == 404
    data = resp.json()
    assert "type" in data
    assert "title" in data
    assert "status" in data
    assert data["status"] == 404
    assert "correlation_id" in data
    assert "request_id" in data
    assert resp.headers.get("X-Correlation-ID") is not None
    assert resp.headers.get("X-Request-ID") is not None

# -----------------------------------------------------------------------------
# 2. Agent Timeout & Retry Policies
# -----------------------------------------------------------------------------
@pytest.mark.anyio
async def test_agent_retry_policy_transient_recovery():
    """Verify an agent successfully recovers after transient failures with exponential backoff."""
    call_count = 0

    async def flaky_step():
        nonlocal call_count
        call_count += 1
        if call_count < 3:
            raise ConnectionError("Temporary socket timeout")
        return "recovered_data"

    retries_recorded = []
    def on_retry(att, exc, delay):
        retries_recorded.append((att, delay))

    cfg = AgentRetryConfig(max_retries=3, base_delay_seconds=0.01, exponential_factor=2.0, timeout_seconds=1.0)
    success, res, err = await execute_with_retry_and_timeout(
        flaky_step, "FlakyAgent", "fetch_data", config=cfg, on_retry_callback=on_retry
    )

    assert success is True
    assert res == "recovered_data"
    assert call_count == 3
    assert len(retries_recorded) == 2

@pytest.mark.anyio
async def test_agent_retry_exhaustion():
    """Verify retry policy stops after max_retries and returns clean error without crashing."""
    call_count = 0

    async def always_failing():
        nonlocal call_count
        call_count += 1
        raise ConnectionError("Persistent upstream outage")

    cfg = AgentRetryConfig(max_retries=2, base_delay_seconds=0.01, timeout_seconds=1.0)
    success, res, err = await execute_with_retry_and_timeout(
        always_failing, "UnstableAgent", "fetch_network", config=cfg
    )

    assert success is False
    assert res is None
    assert "exhausted 3 attempts" in err
    assert call_count == 3

@pytest.mark.anyio
async def test_agent_execution_timeout():
    """Verify an agent exceeding its timeout budget is cleanly terminated with timeout error."""
    async def slow_step():
        await asyncio.sleep(0.5)
        return "too_late"

    cfg = AgentRetryConfig(max_retries=1, base_delay_seconds=0.01, timeout_seconds=0.05)
    success, res, err = await execute_with_retry_and_timeout(
        slow_step, "SlowAgent", "compute_slow", config=cfg
    )

    assert success is False
    assert res is None
    assert "timed out" in err or "exhausted" in err

# -----------------------------------------------------------------------------
# 3. Agent Failure Isolation & Non-Fabrication Guarantee
# -----------------------------------------------------------------------------
@pytest.mark.anyio
async def test_evidence_verification_failure_isolation():
    """
    POLICY VERIFICATION: If Evidence Verification Agent fails, evidence confidence
    must be marked unavailable/incomplete, but uncoupled peers continue and underwriting
    refuses to issue an automated positive credit sanction.
    """
    biz_id = f"test_ev_fail_{uuid.uuid4().hex[:6]}"
    biz = make_test_business(biz_id)
    orchestrator = AgentOrchestrator()

    # Mock evidence agent failure
    async def broken_evidence(ctx):
        raise RuntimeError("Account aggregator gateway unavailable")

    orchestrator.evidence_agent.execute = broken_evidence

    memo = await orchestrator.run_assessment_pipeline(business_profile=biz)

    # 1. Orchestrator must not crash
    assert memo is not None
    # 2. Evidence must not be fabricated
    assert memo.evidence_confidence_score == 0.0
    # 3. Underwriting must NOT approve loan
    assert memo.assessment_status in ["HUMAN_REVIEW_REQUIRED", "INSUFFICIENT_EVIDENCE"]
    assert memo.recommended_loan_amount_inr == Decimal("0.0")
    assert memo.financial_risk_band == "UNASSESSED"

@pytest.mark.anyio
async def test_financial_intelligence_failure_non_fabrication():
    """
    POLICY VERIFICATION: If Financial Intelligence Agent fails, no fabricated
    financial metrics are produced, and underwriting halts automated loan recommendation.
    """
    biz_id = f"test_fin_fail_{uuid.uuid4().hex[:6]}"
    biz = make_test_business(biz_id)
    orchestrator = AgentOrchestrator()

    async def broken_financial(ctx):
        raise ValueError("Transaction log corrupt")

    orchestrator.financial_agent.execute = broken_financial

    memo = await orchestrator.run_assessment_pipeline(business_profile=biz)

    assert memo is not None
    assert memo.recommended_loan_amount_inr == Decimal("0.0")
    assert memo.assessment_status == "HUMAN_REVIEW_REQUIRED"
    assert memo.financial_risk_band == "UNASSESSED"
    assert any("upstream" in r.lower() or "halted" in r.lower() for r in memo.risk_factors_and_vulnerabilities)

# -----------------------------------------------------------------------------
# 4. LLM Resilience & Deterministic Fallback
# -----------------------------------------------------------------------------
@pytest.mark.anyio
async def test_llm_rate_limit_and_timeout_fallback():
    """Verify LLM 429 rate limit or timeout immediately yields deterministic rule-based CAM narrative."""
    fallback_text = "### Deterministic CAM Baseline\nStandard cashflow rules applied."
    
    # 1. Simulate rate limit
    async def mock_rate_limit(prompt, sys):
        raise LLMRateLimitError("HTTP 429 Too Many Requests")

    llm_client._mock_response_func = mock_rate_limit
    res = await llm_client.generate_narrative_synthesis(
        prompt="Synthesize",
        system_instruction="Explain",
        fallback_narrative=fallback_text
    )
    assert res == fallback_text

    # 2. Simulate timeout
    async def mock_slow_llm(prompt, sys):
        await asyncio.sleep(0.5)
        return "Never returned"

    llm_client._mock_response_func = mock_slow_llm
    res = await llm_client.generate_narrative_synthesis(
        prompt="Synthesize",
        system_instruction="Explain",
        fallback_narrative=fallback_text,
        timeout_seconds=0.05
    )
    assert res == fallback_text

    # Reset mock hook
    llm_client._mock_response_func = None

def test_llm_malformed_json_parsing():
    """Verify LLM Client cleans markdown fences and handles malformed JSON without raising uncaught exceptions."""
    # Markdown wrapped valid JSON
    ok, parsed, err = llm_client.parse_structured_output("```json\n{\"risk_band\": \"LOW\"}\n```")
    assert ok is True
    assert parsed["risk_band"] == "LOW"

    # Malformed JSON
    ok2, parsed2, err2 = llm_client.parse_structured_output("Invalid { json missing bracket")
    assert ok2 is False
    assert parsed2 is None
    assert "Malformed JSON" in err2

# -----------------------------------------------------------------------------
# 5. Database Startup Recovery of Interrupted Assessments
# -----------------------------------------------------------------------------
def test_interrupted_assessment_startup_recovery():
    """
    Verify assessments left in RUNNING state (due to server restart or crash)
    are safely transitioned to FAILED_INTERRUPTED on startup.
    """
    stuck_id = f"eval_stuck_{uuid.uuid4().hex[:6]}"
    biz_id = f"biz_stuck_{uuid.uuid4().hex[:6]}"

    # Insert stuck RUNNING assessment
    row = assessment_repo.record_started(stuck_id, biz_id)
    assert row.assessment_status == "RUNNING"
    assert row.completed_at is None

    # Run recovery
    recovered_count = assessment_repo.recover_interrupted_assessments()
    assert recovered_count >= 1

    # Verify transition
    fetched = assessment_repo.get(stuck_id)
    assert fetched is not None
    assert fetched.assessment_status == "FAILED_INTERRUPTED"
    assert fetched.financial_risk_band == "UNASSESSED"

# -----------------------------------------------------------------------------
# 6. Idempotency & Duplicate Concurrency Guard
# -----------------------------------------------------------------------------
def test_assessment_trigger_idempotency_and_duplicate_guard():
    """Verify duplicate rapid assessment triggers return the active assessment without duplicate background tasks."""
    biz_id = "msme_kirana_kanpur_001"
    idempotency_key = f"idemp_{uuid.uuid4().hex}"

    # First trigger
    resp1 = client.post(
        "/api/v1/assessment/run",
        json={"business_id": biz_id, "requested_loan_amount": 200000},
        headers={"Idempotency-Key": idempotency_key}
    )
    assert resp1.status_code == 200
    data1 = resp1.json()
    first_id = data1["assessment_id"]

    # Second trigger with identical Idempotency-Key
    resp2 = client.post(
        "/api/v1/assessment/run",
        json={"business_id": biz_id, "requested_loan_amount": 200000},
        headers={"Idempotency-Key": idempotency_key}
    )
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["assessment_id"] == first_id

# -----------------------------------------------------------------------------
# 7. System Health, Readiness, and Liveness Probes
# -----------------------------------------------------------------------------
def test_system_health_probes():
    """Verify deep health checks probe database latency, LLM status, and return 200 OK."""
    # Liveness
    live_resp = client.get("/api/v1/health/liveness")
    assert live_resp.status_code == 200
    assert live_resp.json()["status"] == "ALIVE"

    # Readiness
    ready_resp = client.get("/api/v1/health/readiness")
    assert ready_resp.status_code == 200
    assert ready_resp.json()["status"] == "READY"

    # Deep Health
    health_resp = client.get("/api/v1/health")
    assert health_resp.status_code == 200
    h_data = health_resp.json()
    assert h_data["status"] == "healthy"
    assert h_data["database"]["status"] == "HEALTHY"
    assert h_data["database"]["latency_ms"] >= 0.0
    assert "llm_service" in h_data
