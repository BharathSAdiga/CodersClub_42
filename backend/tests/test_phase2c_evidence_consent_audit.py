import pytest
from datetime import datetime, timezone, timedelta
from decimal import Decimal
import uuid
import json

from app.schemas.business import BusinessProfile
from app.schemas.transaction import Transaction
from app.schemas.evidence import (
    EvidenceConfidence,
    EvidenceConfidenceReport,
    CrossSourceReconciliationResult
)
from app.modules.trust_evidence import (
    evidence_confidence_scorer,
    cross_source_reconciliation_engine,
    PROVENANCE_RELIABILITY_WEIGHTS
)
from app.db import (
    evidence_repo,
    consent_repo,
    audit_repo,
    business_repo,
    transaction_repo,
    debt_obligation_repo,
    user_repo,
    SessionLocal
)
from app.db.models import (
    EvidenceRecordModel,
    ConsentRecordModel,
    AuditAccessLogModel,
    DebtObligationModel
)
from app.modules.agents.context import AssessmentContext
from app.modules.agents.evidence_verification_agent import EvidenceVerificationAgent

def test_1_evidence_record_creation_and_provenance():
    """Verify evidence records store provenance categories correctly."""
    biz_id = f"test_msme_{uuid.uuid4().hex[:6]}"
    
    rec = evidence_repo.record_evidence(
        business_id=biz_id,
        document_name="bank_statement_q3.csv",
        document_type="BANK_STATEMENT",
        provenance="USER_UPLOADED",
        provenance_category="USER_UPLOADED",
        source_type="FILE_UPLOAD",
        source_name="HDFC Current Account Q3",
        confidence_score=0.65,
        record_count=150,
        file_hash="hash123456"
    )
    
    assert rec.id.startswith("evd_")
    assert rec.business_id == biz_id
    assert rec.provenance_category == "USER_UPLOADED"
    assert rec.confidence_score == 0.65
    assert rec.file_hash == "hash123456"

    # Test retrieval
    fetched = evidence_repo.get(rec.id)
    assert fetched is not None
    assert fetched.document_name == "bank_statement_q3.csv"
    assert fetched.verification_status == "PENDING"

def test_2_user_upload_not_independently_verified():
    """Crucial policy check: User-uploaded bank statements are never automatically marked INDEPENDENTLY_VERIFIED."""
    biz_id = f"test_msme_{uuid.uuid4().hex[:6]}"
    
    rec = evidence_repo.record_evidence(
        business_id=biz_id,
        document_name="self_uploaded_passbook.pdf",
        document_type="BANK_STATEMENT",
        provenance="USER_UPLOADED",
        source_type="FILE_UPLOAD"
    )
    
    assert rec.provenance_category == "USER_UPLOADED"
    assert rec.provenance_category != "INDEPENDENTLY_VERIFIED"
    assert rec.confidence_score <= 0.75

def test_3_evidence_confidence_scorer_deterministic_and_epistemic():
    """Verify evidence confidence separates epistemic uncertainty from financial health."""
    biz = BusinessProfile(
        business_id="msme_eval_scorer_01",
        legal_name="Kirana Store Test",
        trade_name="Kirana Store Test",
        sector="RETAIL_KIRANA",
        vintage_months=36,
        location_tier="TIER_2",
        entity_type="PROPRIETORSHIP",
        declared_monthly_turnover=Decimal("350000.0"),
        declared_existing_monthly_emi=Decimal("0.0"),
        has_gstin=False, # Exempt from GST
        has_udyam_registration=True
    )

    now = datetime.now(timezone.utc)
    txs = [
        Transaction(
            transaction_id=f"tx_{i}",
            business_id="msme_eval_scorer_01",
            timestamp=now - timedelta(days=i),
            amount=Decimal("12000.0"),
            direction="CREDIT",
            channel="UPI_QR",
            counterparty_name="Customer",
            category="CUSTOMER_REVENUE"
        )
        for i in range(30)
    ]

    report = evidence_confidence_scorer.evaluate(
        business_profile=biz,
        transactions=txs
    )

    assert isinstance(report, EvidenceConfidence)
    assert 50.0 <= report.evidence_confidence_score <= 95.0
    # Missing GSTIN is explicitly noted in missing fields
    assert "GSTIN_RETURNS_3B" in report.missing_evidence_fields
    # Guarantee: Missing data treatment is neutral uncertainty
    assert "NEUTRAL_UNCERTAINTY" in report.missing_data_treatment_policy
    assert report.confidence_band in ["HIGH", "MODERATE"]

def test_4_cross_source_reconciliation_turnover_mismatch():
    """Verify reconciliation detects significant divergence between declared turnover and bank credits."""
    biz = BusinessProfile(
        business_id="msme_eval_turnover_02",
        legal_name="Textile Wholesaler",
        trade_name="Textile Wholesaler",
        sector="TEXTILE_WEAVING",
        vintage_months=24,
        location_tier="TIER_1",
        entity_type="PARTNERSHIP",
        declared_monthly_turnover=Decimal("1000000.0"), # Declared 10 Lakhs
        declared_existing_monthly_emi=Decimal("0.0"),
        has_gstin=True,
        has_udyam_registration=True
    )

    now = datetime.now(timezone.utc)
    # But actual transactions only show 2 Lakhs/month
    txs = [
        Transaction(
            transaction_id=f"tx_{i}",
            business_id="msme_eval_turnover_02",
            timestamp=now - timedelta(days=i * 2),
            amount=Decimal("10000.0"),
            direction="CREDIT",
            channel="NEFT_RTGS",
            counterparty_name="Client",
            category="CUSTOMER_REVENUE"
        )
        for i in range(20)
    ]

    res = cross_source_reconciliation_engine.reconcile(
        business_profile=biz,
        transactions=txs
    )

    assert isinstance(res, CrossSourceReconciliationResult)
    turnover_discs = [d for d in res.discrepancies if d.discrepancy_type == "TURNOVER_MISMATCH"]
    assert len(turnover_discs) > 0
    disc = turnover_discs[0]
    assert disc.severity in ["HIGH", "MEDIUM"]
    assert disc.flagged_for_human_review is True
    assert "Declared turnover" in disc.description

def test_5_cross_source_reconciliation_unmatched_liabilities():
    """Verify reconciliation flags undeclared recurring EMI debits for human review."""
    biz = BusinessProfile(
        business_id="msme_eval_dbt_03",
        legal_name="Auto Repairs",
        trade_name="Auto Repairs",
        sector="GENERAL_SERVICES",
        vintage_months=18,
        location_tier="TIER_3",
        entity_type="PROPRIETORSHIP",
        declared_monthly_turnover=Decimal("200000.0"),
        declared_existing_monthly_emi=Decimal("0.0"), # Zero declared debt
        has_gstin=False,
        has_udyam_registration=False
    )

    now = datetime.now(timezone.utc)
    # Statements contain recurring loan EMI debits
    txs = [
        Transaction(
            transaction_id=f"tx_emi_{i}",
            business_id="msme_eval_dbt_03",
            timestamp=now - timedelta(days=i * 30),
            amount=Decimal("15000.0"),
            direction="DEBIT",
            channel="NEFT_RTGS",
            counterparty_name="Bajaj Finance NBFC",
            category="EXISTING_LOAN_EMI"
        )
        for i in range(1, 4)
    ]

    res = cross_source_reconciliation_engine.reconcile(
        business_profile=biz,
        transactions=txs
    )

    assert res.unmatched_liabilities_count > 0
    unmatched_discs = [d for d in res.discrepancies if d.discrepancy_type == "UNMATCHED_LIABILITY"]
    assert len(unmatched_discs) > 0
    assert unmatched_discs[0].severity == "HIGH"
    assert "Bajaj Finance" in txs[0].counterparty_name

def test_6_cross_source_reconciliation_duplicate_detection():
    """Verify reconciliation detects duplicate records without modifying source data."""
    biz = BusinessProfile(
        business_id="msme_eval_dup_04",
        legal_name="Bakery",
        trade_name="Bakery",
        sector="FOOD_SERVICES",
        vintage_months=12,
        location_tier="TIER_2",
        entity_type="PROPRIETORSHIP",
        declared_monthly_turnover=Decimal("150000.0"),
        declared_existing_monthly_emi=Decimal("0.0"),
        has_gstin=False,
        has_udyam_registration=False
    )

    t_time = datetime(2026, 11, 15, 10, 30, 0, tzinfo=timezone.utc)
    txs = [
        Transaction(
            transaction_id="tx_orig_1",
            business_id="msme_eval_dup_04",
            timestamp=t_time,
            amount=Decimal("5000.0"),
            direction="CREDIT",
            channel="UPI_QR",
            counterparty_name="Customer A",
            category="CUSTOMER_REVENUE"
        ),
        Transaction(
            transaction_id="tx_dup_2",
            business_id="msme_eval_dup_04",
            timestamp=t_time,
            amount=Decimal("5000.0"),
            direction="CREDIT",
            channel="UPI_QR",
            counterparty_name="Customer A",
            category="CUSTOMER_REVENUE"
        )
    ]

    res = cross_source_reconciliation_engine.reconcile(
        business_profile=biz,
        transactions=txs
    )

    dup_discs = [d for d in res.discrepancies if d.discrepancy_type == "DUPLICATE_TRANSACTION"]
    assert len(dup_discs) == 1
    assert dup_discs[0].difference_amount == 5000.0

def test_7_consent_grant_and_active_retrieval():
    """Verify consent granting, scope persistence, and active listing."""
    user_id = f"usr_test_{uuid.uuid4().hex[:6]}"
    biz_id = f"biz_test_{uuid.uuid4().hex[:6]}"
    
    record = consent_repo.grant(
        user_id=user_id,
        business_id=biz_id,
        data_provider="ACCOUNT_AGGREGATOR",
        purpose="Underwriting working capital loan",
        data_fields_granted=["TRANSACTIONS", "TURNOVER_SUMMARY"],
        expires_in_days=30,
        consent_version="v1.0"
    )

    assert record.id.startswith("cst_")
    assert record.status == "ACTIVE"
    assert record.consent_version == "v1.0"

    active_list = consent_repo.get_active_for_business(biz_id)
    assert len(active_list) == 1
    assert active_list[0].id == record.id
    scopes = json.loads(active_list[0].consent_scope)
    assert "TRANSACTIONS" in scopes

def test_8_consent_expiry_handling():
    """Verify that expired consent is automatically excluded from active queries."""
    user_id = f"usr_test_{uuid.uuid4().hex[:6]}"
    biz_id = f"biz_test_{uuid.uuid4().hex[:6]}"

    db = SessionLocal()
    try:
        # Create an already-expired consent
        expired_record = ConsentRecordModel(
            id=f"cst_exp_{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            business_id=biz_id,
            data_provider="ACCOUNT_AGGREGATOR",
            purpose="Expired purpose",
            consent_scope=json.dumps(["TRANSACTIONS"]),
            data_fields_granted=json.dumps(["TRANSACTIONS"]),
            status="ACTIVE",
            granted_at=datetime.now(timezone.utc) - timedelta(days=60),
            expires_at=datetime.now(timezone.utc) - timedelta(days=30)
        )
        db.add(expired_record)
        db.commit()
    finally:
        db.close()

    # Query active consents via repository
    active = consent_repo.get_active_for_business(biz_id)
    assert len(active) == 0

    # But it must exist in consent history
    history = consent_repo.get_history_for_business(biz_id)
    assert any(c.id == expired_record.id for c in history)

def test_9_consent_revocation_lifecycle():
    """Verify immediate revocation of active consent."""
    user_id = f"usr_test_{uuid.uuid4().hex[:6]}"
    biz_id = f"biz_test_{uuid.uuid4().hex[:6]}"

    record = consent_repo.grant(
        user_id=user_id,
        business_id=biz_id,
        data_provider="NPCI_UPI",
        purpose="Transaction analysis",
        data_fields_granted=["UPI_SETTLEMENTS"],
        expires_in_days=30
    )

    assert consent_repo.get_active_for_business(biz_id)[0].id == record.id

    # Revoke
    revoked = consent_repo.revoke(record.id, user_id=user_id)
    assert revoked is True

    # Active should now be empty
    assert len(consent_repo.get_active_for_business(biz_id)) == 0

    # History shows revoked
    history = consent_repo.get_history_for_business(biz_id)
    assert history[0].status == "REVOKED"
    assert history[0].revoked_at is not None

def test_10_lender_access_validation_without_consent():
    """Verify lender access validation blocks unassigned lender without active consent."""
    lender_id = f"usr_lender_{uuid.uuid4().hex[:6]}"
    biz_id = f"biz_unauthorized_{uuid.uuid4().hex[:6]}"

    is_auth, reason = consent_repo.validate_lender_access(biz_id, lender_id)
    assert is_auth is False
    assert "No active borrower consent" in reason

def test_11_lender_access_validation_with_consent():
    """Verify lender access validation succeeds when borrower grants active consent."""
    borrower_id = f"usr_borrower_{uuid.uuid4().hex[:6]}"
    lender_id = f"usr_lender_{uuid.uuid4().hex[:6]}"
    biz_id = f"biz_authorized_{uuid.uuid4().hex[:6]}"

    consent_repo.grant(
        user_id=borrower_id,
        business_id=biz_id,
        data_provider="ACCOUNT_AGGREGATOR",
        purpose="Credit assessment",
        data_fields_granted=["TRANSACTIONS", "TURNOVER_SUMMARY"],
        expires_in_days=30
    )

    is_auth, reason = consent_repo.validate_lender_access(biz_id, lender_id, required_scope="TRANSACTIONS")
    assert is_auth is True
    assert "Authorized via active borrower consent" in reason

def test_12_immutable_audit_trail_append_only():
    """Verify audit log records events and raises error on modification attempt."""
    user_id = f"usr_actor_{uuid.uuid4().hex[:6]}"
    biz_id = f"biz_audit_{uuid.uuid4().hex[:6]}"

    log_entry = audit_repo.log_access(
        user_id=user_id,
        role="BORROWER",
        business_id=biz_id,
        resource_type="FINANCIAL_DOCUMENT",
        action="DOCUMENT_UPLOAD",
        details="Uploaded statement",
        outcome="SUCCESS",
        structured_metadata={"filename": "ledger.csv", "rows": 120}
    )

    assert log_entry.id.startswith("audit_")
    assert log_entry.action == "DOCUMENT_UPLOAD"
    assert log_entry.outcome == "SUCCESS"

    # Query logs
    logs = audit_repo.get_logs_for_business(biz_id)
    assert any(l.id == log_entry.id for l in logs)

    # Attempt delete must raise PermissionError
    with pytest.raises(PermissionError):
        audit_repo.delete(log_entry.id)

def test_13_agent_integration_with_persisted_evidence():
    """Verify EvidenceVerificationAgent incorporates database-persisted evidence and reconciliation."""
    import asyncio
    biz_id = f"msme_agent_evd_{uuid.uuid4().hex[:6]}"
    
    # Pre-seed business profile and evidence in database
    biz = BusinessProfile(
        business_id=biz_id,
        legal_name="Agent Evidence MSME",
        trade_name="Agent Evidence MSME",
        sector="GENERAL_SERVICES",
        vintage_months=30,
        location_tier="TIER_2",
        entity_type="PROPRIETORSHIP",
        declared_monthly_turnover=Decimal("250000.0"),
        declared_existing_monthly_emi=Decimal("0.0"),
        has_gstin=True,
        has_udyam_registration=True
    )
    business_repo.save(biz)

    evidence_repo.record_evidence(
        business_id=biz_id,
        document_name="official_statement.csv",
        document_type="BANK_STATEMENT",
        provenance="USER_UPLOADED",
        record_count=50,
        confidence_score=0.70
    )

    now = datetime.now(timezone.utc)
    txs = [
        Transaction(
            transaction_id=f"tx_{i}",
            business_id=biz_id,
            timestamp=now - timedelta(days=i),
            amount=Decimal("8000.0"),
            direction="CREDIT",
            channel="UPI_QR",
            counterparty_name="Customer",
            category="CUSTOMER_REVENUE"
        )
        for i in range(25)
    ]

    context = AssessmentContext(
        business_id=biz_id,
        assessment_id=f"eval_{biz_id}",
        business_profile=biz,
        transactions=txs
    )

    agent = EvidenceVerificationAgent()
    evidence_res = asyncio.run(agent.execute(context))

    assert isinstance(evidence_res, EvidenceConfidence)
    assert evidence_res.evidence_confidence_score > 0
    assert context.agent_results["evidence_verification"]["reconciliation_concordance_score"] > 0
    assert evidence_res.reconciliation is not None
