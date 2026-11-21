import pytest
from decimal import Decimal
from datetime import datetime, timezone
import uuid

from backend.app.db import engine, SessionLocal, Base, init_db
from backend.app.db.models import (
    BusinessModel,
    TransactionModel,
    AssessmentModel,
    AgentEventModel,
    EvidenceRecordModel,
    DebtObligationModel
)
from backend.app.db.repositories import (
    business_repo,
    transaction_repo,
    assessment_repo,
    DatabaseBackedBusinessStore,
    DatabaseBackedAssessmentStore,
    DatabaseBackedTransactionStore
)
from backend.app.schemas.business import BusinessProfile
from backend.app.schemas.transaction import Transaction
from backend.app.schemas.assessment import CreditAppraisalMemo

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

@pytest.fixture(autouse=True)
def ensure_db():
    init_db()

def test_db_models_table_creation():
    """Verify that all core tables exist in the SQLite schema."""
    table_names = set(Base.metadata.tables.keys())
    required_tables = {
        "users",
        "businesses",
        "transactions",
        "assessments",
        "agent_events",
        "evidence_records",
        "consent_records",
        "debt_obligations"
    }
    assert required_tables.issubset(table_names)

def test_business_persistence_and_retrieval():
    """Verify BusinessModel creation, persistence to SQLite, and retrieval."""
    biz_id = f"msme_persist_{uuid.uuid4().hex[:8]}"
    profile = BusinessProfile(
        business_id=biz_id,
        legal_name="Durga Handlooms Cooperative",
        trade_name="Durga Handlooms",
        sector="TEXTILE_WEAVING",
        vintage_months=36,
        location_tier="TIER_3",
        entity_type="PARTNERSHIP",
        declared_monthly_turnover=Decimal("450000.00"),
        declared_existing_monthly_emi=Decimal("7500.00"),
        has_udyam_registration=True,
        udyam_reg_number="UDYAM-TN-04-9988112",
        is_synthetic=False,
        created_at=utc_now()
    )
    # Save via repo
    business_repo.save(profile)

    # Read back from fresh DB session
    fetched = business_repo.get(biz_id)
    assert fetched is not None
    assert fetched.business_id == biz_id
    assert fetched.legal_name == "Durga Handlooms Cooperative"
    assert fetched.declared_monthly_turnover == Decimal("450000.00")
    assert fetched.declared_existing_monthly_emi == Decimal("7500.00")

def test_transaction_batch_persistence():
    """Verify TransactionModel batch insertion and summary aggregation."""
    biz_id = f"msme_tx_db_{uuid.uuid4().hex[:8]}"
    prefix = uuid.uuid4().hex[:6]
    txs = [
        Transaction(
            transaction_id=f"tx_p_{prefix}_{i}",
            business_id=biz_id,
            timestamp=utc_now(),
            amount=Decimal("15000.00") if i % 2 == 0 else Decimal("6000.00"),
            direction="CREDIT" if i % 2 == 0 else "DEBIT",
            channel="UPI_QR",
            counterparty_id=f"cp_retail_{i}",
            category="CUSTOMER_REVENUE" if i % 2 == 0 else "SUPPLIER_PURCHASE"
        )
        for i in range(4)
    ]
    # Save batch
    transaction_repo.save_batch(biz_id, txs)

    # Fetch back
    retrieved = transaction_repo.get_for_business(biz_id)
    assert len(retrieved) == 4
    
    # Check summary calculation
    summary = transaction_repo.get_summary(biz_id)
    assert summary is not None
    assert summary.total_parsed == 4
    assert summary.credits_count == 2
    assert summary.debits_count == 2
    assert summary.total_credit_volume == Decimal("30000.00")
    assert summary.total_debit_volume == Decimal("12000.00")

def test_assessment_results_survive_restart():
    """Verify that CreditAppraisalMemo survives memory eviction and persists in DB."""
    assess_id = f"eval_persist_{uuid.uuid4().hex[:8]}"
    biz_id = f"msme_eval_db_{uuid.uuid4().hex[:8]}"
    
    # Seed business first
    biz_profile = BusinessProfile(
        business_id=biz_id,
        legal_name="Survive Restart Enterprise",
        trade_name="Survive Store",
        sector="RETAIL_KIRANA",
        vintage_months=24,
        location_tier="TIER_2",
        entity_type="PROPRIETORSHIP",
        declared_monthly_turnover=Decimal("200000.00"),
        declared_existing_monthly_emi=Decimal("0.0")
    )
    business_repo.save(biz_profile)

    memo = CreditAppraisalMemo(
        assessment_id=assess_id,
        business_id=biz_id,
        generated_at=utc_now(),
        assessment_status="INDICATIVE_RECOMMENDATION",
        financial_risk_band="LOW_RISK",
        evidence_confidence_score=92.5,
        investigation_status="NORMAL_PATTERNS",
        recommended_loan_amount_inr=Decimal("180000.00"),
        recommended_tenure_months=12,
        indicative_apr_range="13.5% - 14.5% p.a.",
        recommended_facility_type="UNSECURED_WORKING_CAPITAL_LINE",
        positive_credit_factors=["Consistent positive cash flow"],
        risk_factors_and_vulnerabilities=[],
        recommended_covenants_and_mitigants=["Quarterly bank statement review"],
        assumptions=["Standard operational assumptions"],
        data_limitations=[],
        evidence_references=[],
        calculation_version="1.0.0",
        cam_narrative_markdown="### Executive Summary\nStrong operational metrics."
    )

    # 1. Save to repo
    assessment_repo.save(memo)

    # 2. Simulate complete restart by instantiating fresh repository with new session
    fresh_repo = DatabaseBackedAssessmentStore()
    recovered_memo = fresh_repo.get(assess_id)

    assert recovered_memo is not None
    assert recovered_memo.assessment_id == assess_id
    assert recovered_memo.business_id == biz_id
    assert recovered_memo.assessment_status == "INDICATIVE_RECOMMENDATION"
    assert recovered_memo.recommended_loan_amount_inr == Decimal("180000.00")
    assert recovered_memo.indicative_apr_range == "13.5% - 14.5% p.a."

def test_database_backed_store_adapters():
    """Verify that dict-like adapters BUSINESS_STORE and ASSESSMENT_STORE update database."""
    biz_store = DatabaseBackedBusinessStore()
    unique_id = f"msme_adapter_{uuid.uuid4().hex[:6]}"
    
    # Write using dict syntax
    profile = BusinessProfile(
        business_id=unique_id,
        legal_name="Adapter Kirana Store",
        trade_name="Adapter Kirana",
        sector="RETAIL_KIRANA",
        vintage_months=18,
        location_tier="TIER_1",
        entity_type="PROPRIETORSHIP",
        declared_monthly_turnover=Decimal("120000.00"),
        declared_existing_monthly_emi=Decimal("0.0")
    )
    biz_store[unique_id] = profile

    # Read using 'in' operator and .get()
    assert unique_id in biz_store
    fetched = biz_store.get(unique_id)
    assert fetched.trade_name == "Adapter Kirana"

    # Query directly from DB session to prove physical persistence
    db = SessionLocal()
    try:
        row = db.query(BusinessModel).filter(BusinessModel.id == unique_id).first()
        assert row is not None
        assert row.trade_name == "Adapter Kirana"
    finally:
        db.close()
