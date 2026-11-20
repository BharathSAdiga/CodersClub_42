import pytest
import asyncio
from decimal import Decimal
from datetime import datetime, timezone
from unittest.mock import patch
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.schemas.business import BusinessProfile
from backend.app.schemas.transaction import Transaction
from backend.app.schemas.resilience import ShockScenarioInput
from backend.app.modules.agents import (
    orchestrator,
    AssessmentContext,
    FinancialIntelligenceAgent,
    EvidenceVerificationAgent,
    TransactionForensicsAgent,
    BusinessVitalityAgent,
    ResilienceSimulationAgent,
    UnderwritingAgent,
    ExplanationAndPassportAgent,
    llm_client
)
from backend.app.core.event_bus import event_bus
from backend.app.api.endpoints_assessment import ASSESSMENT_STORE

client = TestClient(app)

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

def make_sample_profile(business_id: str = "msme_test_orch") -> BusinessProfile:
    return BusinessProfile(
        business_id=business_id,
        legal_name="Kaveri Silk Weavers",
        trade_name="Kaveri Silks",
        sector="TEXTILE_WEAVING",
        vintage_months=36,
        location_tier="TIER_2",
        entity_type="PROPRIETORSHIP",
        declared_monthly_turnover=Decimal("350000.00"),
        declared_existing_monthly_emi=Decimal("6000.00"),
        has_gstin=True,
        gstin="29ABCDE1234F1Z5"
    )

def make_sample_transactions(business_id: str = "msme_test_orch") -> list[Transaction]:
    return [
        Transaction(
            transaction_id="tx_orch_1",
            business_id=business_id,
            timestamp=utc_now(),
            amount=Decimal("25000.00"),
            direction="CREDIT",
            channel="UPI_QR",
            counterparty_id="cp_cust_1",
            category="CUSTOMER_REVENUE"
        ),
        Transaction(
            transaction_id="tx_orch_2",
            business_id=business_id,
            timestamp=utc_now(),
            amount=Decimal("30000.00"),
            direction="CREDIT",
            channel="NEFT_RTGS",
            counterparty_id="cp_cust_2",
            category="CUSTOMER_REVENUE"
        ),
        Transaction(
            transaction_id="tx_orch_3",
            business_id=business_id,
            timestamp=utc_now(),
            amount=Decimal("12000.00"),
            direction="DEBIT",
            channel="NEFT_RTGS",
            counterparty_id="cp_supp_yarn",
            category="SUPPLIER_PURCHASE"
        ),
        Transaction(
            transaction_id="tx_orch_4",
            business_id=business_id,
            timestamp=utc_now(),
            amount=Decimal("6000.00"),
            direction="DEBIT",
            channel="IMPS",
            counterparty_id="cp_bank_emi",
            category="EXISTING_LOAN_EMI"
        )
    ]

# ---------------------------------------------------------------------------
# Test 1: Successful End-to-End Assessment
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_successful_end_to_end_assessment():
    profile = make_sample_profile("msme_e2e_001")
    txs = make_sample_transactions("msme_e2e_001")
    assessment_id = "eval_e2e_001"

    memo = await orchestrator.run_assessment_pipeline(
        business_profile=profile,
        assessment_id=assessment_id,
        transactions=txs
    )

    assert memo.assessment_id == assessment_id
    assert memo.business_id == "msme_e2e_001"
    assert memo.assessment_status in [
        "INDICATIVE_RECOMMENDATION",
        "CONDITIONAL_RECOMMENDATION"
    ]
    assert memo.financial_risk_band in ["LOW_RISK", "MODERATE_RISK", "ELEVATED_RISK"]
    assert memo.recommended_loan_amount_inr > Decimal("0.0")
    assert memo.recommended_facility_type is not None
    assert memo.indicative_apr_min_pct is not None
    assert len(memo.positive_credit_factors) > 0
    assert len(memo.cam_narrative_markdown) > 100
    assert memo.calculation_version == "1.0.0"

# ---------------------------------------------------------------------------
# Test 2: Correct Agent Execution Order
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_correct_agent_execution_order():
    profile = make_sample_profile("msme_order_002")
    txs = make_sample_transactions("msme_order_002")
    assessment_id = "eval_order_002"

    await orchestrator.run_assessment_pipeline(
        business_profile=profile,
        assessment_id=assessment_id,
        transactions=txs
    )

    events = event_bus.get_history(assessment_id)
    assert len(events) >= 8

    # Check order of first appearance of each agent
    agent_sequence = []
    for e in events:
        if e.agent_name not in agent_sequence:
            agent_sequence.append(e.agent_name)

    # Initializing agent must be Orchestrator
    assert agent_sequence[0] == "Orchestrator"
    
    # Financial, Evidence, Forensics, and Vitality agents run before Resilience
    resilience_idx = agent_sequence.index("ResilienceSimulationAgent")
    assert agent_sequence.index("FinancialIntelligenceAgent") < resilience_idx
    assert agent_sequence.index("EvidenceVerificationAgent") < resilience_idx
    assert agent_sequence.index("TransactionForensicsAgent") < resilience_idx
    assert agent_sequence.index("BusinessVitalityAgent") < resilience_idx

    # Underwriting runs after Resilience
    underwriting_idx = agent_sequence.index("UnderwritingAgent")
    assert resilience_idx < underwriting_idx

    # Explanation runs after Underwriting
    explanation_idx = agent_sequence.index("ExplanationAndPassportAgent")
    assert underwriting_idx < explanation_idx

# ---------------------------------------------------------------------------
# Test 3: Concurrent Independent Agents
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_concurrent_independent_agents():
    profile = make_sample_profile("msme_concurrent_003")
    txs = make_sample_transactions("msme_concurrent_003")
    assessment_id = "eval_concurrent_003"

    context = AssessmentContext(
        assessment_id=assessment_id,
        business_id=profile.business_id,
        business_profile=profile,
        transactions=txs
    )

    fin_agent = FinancialIntelligenceAgent()
    ev_agent = EvidenceVerificationAgent()
    forensics_agent = TransactionForensicsAgent()
    vitality_agent = BusinessVitalityAgent()

    # Run independent agents concurrently
    results = await asyncio.gather(
        fin_agent.execute(context),
        ev_agent.execute(context),
        forensics_agent.execute(context),
        vitality_agent.execute(context)
    )

    dna, evidence, graph, vitality = results
    assert dna.monthly_average_turnover > Decimal("0.0")
    assert evidence.evidence_confidence_score > 0.0
    assert graph.total_nodes > 0
    assert vitality["vitality_score"] > 0.0

    assert context.stage_statuses["FINANCIAL_ANALYSIS"] == "COMPLETED"
    assert context.stage_statuses["EVIDENCE_ANALYSIS"] == "COMPLETED"
    assert context.stage_statuses["TRANSACTION_INVESTIGATION"] == "COMPLETED"
    assert context.stage_statuses["BUSINESS_VITALITY_ANALYSIS"] == "COMPLETED"

# ---------------------------------------------------------------------------
# Test 4: Agent Failure Handling
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_agent_failure_handling():
    # Pass invalid profile with negative turnover
    profile = BusinessProfile(
        business_id="msme_fail_004",
        legal_name="Failing Co",
        trade_name="Failing Co",
        sector="RETAIL_KIRANA",
        vintage_months=12,
        location_tier="TIER_3",
        entity_type="PROPRIETORSHIP",
        declared_monthly_turnover=Decimal("1000.00"),
        declared_existing_monthly_emi=Decimal("0.00")
    )
    # Mutate to invalid negative turnover directly to test state machine validation
    object.__setattr__(profile, 'declared_monthly_turnover', Decimal("-50000.00"))

    assessment_id = "eval_fail_004"
    with pytest.raises(ValueError, match="cannot be negative"):
        await orchestrator.run_assessment_pipeline(
            business_profile=profile,
            assessment_id=assessment_id
        )

    events = event_bus.get_history(assessment_id)
    fail_events = [e for e in events if e.status == "FAILED"]
    assert len(fail_events) >= 1
    assert "cannot be negative" in fail_events[0].error_message

# ---------------------------------------------------------------------------
# Test 5: Deterministic Fallback
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_deterministic_fallback():
    profile = make_sample_profile("msme_fallback_005")
    assessment_id = "eval_fallback_005"

    # Simulate LLM raising error
    with patch.object(llm_client, "generate_narrative_synthesis", side_effect=Exception("LLM Network Timeout")):
        memo = await orchestrator.run_assessment_pipeline(
            business_profile=profile,
            assessment_id=assessment_id
        )

    # Assessment must still complete using deterministic fallback
    assert memo.assessment_id == assessment_id
    assert memo.is_fallback_rule_based is True
    assert len(memo.cam_narrative_markdown) > 0

# ---------------------------------------------------------------------------
# Test 6: Missing Evidence Neutral Treatment
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_missing_evidence_neutral_treatment():
    # Business without GSTIN and zero transaction history
    profile = BusinessProfile(
        business_id="msme_micro_rural_006",
        legal_name="Gramin Dairy",
        trade_name="Gramin Dairy",
        sector="FOOD_SERVICES",
        vintage_months=24,
        location_tier="RURAL",
        entity_type="PROPRIETORSHIP",
        declared_monthly_turnover=Decimal("80000.00"),
        declared_existing_monthly_emi=Decimal("0.00"),
        has_gstin=False,
        gstin=None
    )
    assessment_id = "eval_missing_ev_006"

    memo = await orchestrator.run_assessment_pipeline(
        business_profile=profile,
        assessment_id=assessment_id,
        transactions=[]
    )

    # Missing evidence reduces confidence score but is not treated as fraud/delinquency
    assert memo.evidence_confidence_score < 70.0
    assert "GSTIN_RETURNS_3B" in memo.missing_evidence_items or len(memo.missing_evidence_items) > 0 or any("GST" in l for l in memo.data_limitations)
    # Does not accuse business of delinquency
    for risk in memo.risk_factors_and_vulnerabilities:
        assert "fraud" not in risk.lower()
        assert "default" not in risk.lower()

# ---------------------------------------------------------------------------
# Test 7: Suspicious Transaction Patterns (Circular Loops Trigger Human Review)
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_suspicious_transaction_findings():
    b_id = "msme_suspicious_007"
    profile = make_sample_profile(b_id)
    
    # Circular flow: b_id -> cp_shell_1 -> cp_shell_2 -> b_id
    txs = [
        Transaction(
            transaction_id="tx_circ_1",
            business_id=b_id,
            timestamp=utc_now(),
            amount=Decimal("80000.00"),
            direction="DEBIT",
            channel="NEFT_RTGS",
            counterparty_id="cp_shell_1",
            category="SUPPLIER_PURCHASE"
        ),
        Transaction(
            transaction_id="tx_circ_2",
            business_id=b_id,
            timestamp=utc_now(),
            amount=Decimal("79500.00"),
            direction="CREDIT",
            channel="NEFT_RTGS",
            counterparty_id="cp_shell_1",
            category="CUSTOMER_REVENUE"
        )
    ]
    assessment_id = "eval_suspicious_007"

    memo = await orchestrator.run_assessment_pipeline(
        business_profile=profile,
        assessment_id=assessment_id,
        transactions=txs
    )

    # Must flag for human review, NEVER automatic fraud verdict
    assert memo.assessment_status == "HUMAN_REVIEW_REQUIRED"
    assert memo.investigation_status == "HUMAN_REVIEW_RECOMMENDED"
    assert "fraud" not in memo.cam_narrative_markdown.lower() or "circular" in memo.cam_narrative_markdown.lower()

# ---------------------------------------------------------------------------
# Test 8: Resilience Engine Integration
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_resilience_engine_integration():
    profile = make_sample_profile("msme_resilience_008")
    txs = make_sample_transactions("msme_resilience_008")
    assessment_id = "eval_resilience_008"

    scenario = ShockScenarioInput(
        revenue_contraction_pct=30.0,
        cogs_inflation_pct=20.0,
        receivable_delay_days=45
    )

    memo = await orchestrator.run_assessment_pipeline(
        business_profile=profile,
        assessment_id=assessment_id,
        transactions=txs,
        scenario=scenario
    )

    # Stressed resilience scenario directly reflected in covenants and calculations
    assert memo.assessment_id == assessment_id
    assert memo.recommended_loan_amount_inr >= Decimal("0.0")

# ---------------------------------------------------------------------------
# Test 9: Underwriting Integration
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_underwriting_integration():
    profile = make_sample_profile("msme_uw_009")
    txs = make_sample_transactions("msme_uw_009")
    assessment_id = "eval_uw_009"

    memo = await orchestrator.run_assessment_pipeline(
        business_profile=profile,
        assessment_id=assessment_id,
        transactions=txs,
        requested_loan_amount_inr=Decimal("150000.00")
    )

    assert memo.recommended_facility_type in [
        "UNSECURED_WORKING_CAPITAL_LINE",
        "REVENUE_BASED_DAILY_SWEEP",
        "SEASONALITY_ADJUSTED_FACILITY"
    ]
    assert memo.indicative_apr_min_pct is not None
    assert memo.indicative_apr_max_pct is not None
    assert memo.indicative_apr_min_pct <= memo.indicative_apr_max_pct
    assert len(memo.assumptions) > 0
    assert len(memo.evidence_references) > 0

# ---------------------------------------------------------------------------
# Test 10: LLM Unavailable Resilience
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_llm_unavailable_resilience():
    profile = make_sample_profile("msme_no_llm_010")
    assessment_id = "eval_no_llm_010"

    # Set LLM client api_key to None
    with patch.object(llm_client, "is_configured", return_value=False):
        memo = await orchestrator.run_assessment_pipeline(
            business_profile=profile,
            assessment_id=assessment_id
        )

    assert memo.is_fallback_rule_based is True
    assert "Credit Appraisal Memo" in memo.cam_narrative_markdown

# ---------------------------------------------------------------------------
# Test 11: SSE Event Ordering and Required Fields
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_sse_event_ordering_and_fields():
    profile = make_sample_profile("msme_sse_011")
    txs = make_sample_transactions("msme_sse_011")
    assessment_id = "eval_sse_011"

    await orchestrator.run_assessment_pipeline(
        business_profile=profile,
        assessment_id=assessment_id,
        transactions=txs
    )

    events = event_bus.get_history(assessment_id)
    assert len(events) >= 7

    for event in events:
        # Mandatory event fields
        assert event.assessment_id == assessment_id
        assert event.business_id == "msme_sse_011"
        assert event.agent_name is not None
        assert event.step_name is not None
        assert event.status in [
            "PENDING", "RUNNING", "COMPLETED", "FAILED", "SKIPPED",
            "FALLBACK_USED", "STARTED", "TOOL_CALLED", "STRUCTURED_RESULT"
        ]
        assert event.message is not None
        assert event.user_facing_message is not None
        # Guarantee no private chain-of-thought exposure
        assert not hasattr(event, "chain_of_thought")
        assert not hasattr(event, "thinking")

# ---------------------------------------------------------------------------
# Test 12: Assessment Result Retrieval via API
# ---------------------------------------------------------------------------
def test_assessment_result_retrieval_api():
    # Pre-seeded assessment retrieval
    resp = client.get("/api/v1/assessment/eval_msme_kirana_kanpur_001/result")
    assert resp.status_code == 200
    data = resp.json()
    assert data["assessment_id"] == "eval_msme_kirana_kanpur_001"
    assert data["assessment_status"] == "INDICATIVE_RECOMMENDATION"
    assert data["financial_risk_band"] == "LOW_RISK"
    assert float(data["recommended_loan_amount_inr"]) > 0

    # Non-existent assessment
    resp_missing = client.get("/api/v1/assessment/eval_unknown_999/result")
    assert resp_missing.status_code == 404

# ---------------------------------------------------------------------------
# Test 13: Multiple Assessments Without Cross-Contamination
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_multiple_assessments_without_cross_contamination():
    profile_a = make_sample_profile("msme_corp_a")
    profile_b = BusinessProfile(
        business_id="msme_corp_b",
        legal_name="Surat Yarn Exports",
        trade_name="Surat Yarn",
        sector="TEXTILE_WEAVING",
        vintage_months=60,
        location_tier="TIER_1",
        entity_type="PRIVATE_LIMITED",
        declared_monthly_turnover=Decimal("1200000.00"),
        declared_existing_monthly_emi=Decimal("15000.00"),
        has_gstin=True,
        gstin="24ABCDE9999F1Z1"
    )

    assessment_id_a = "eval_iso_a_013"
    assessment_id_b = "eval_iso_b_013"

    # Execute two assessments concurrently
    memo_a, memo_b = await asyncio.gather(
        orchestrator.run_assessment_pipeline(business_profile=profile_a, assessment_id=assessment_id_a),
        orchestrator.run_assessment_pipeline(business_profile=profile_b, assessment_id=assessment_id_b)
    )

    # Check isolation of results
    assert memo_a.assessment_id == assessment_id_a
    assert memo_a.business_id == "msme_corp_a"

    assert memo_b.assessment_id == assessment_id_b
    assert memo_b.business_id == "msme_corp_b"

    # Check isolation of event histories
    history_a = event_bus.get_history(assessment_id_a)
    history_b = event_bus.get_history(assessment_id_b)

    assert all(e.business_id == "msme_corp_a" for e in history_a)
    assert all(e.business_id == "msme_corp_b" for e in history_b)
    assert len(history_a) > 0
    assert len(history_b) > 0
