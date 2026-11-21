import pytest
import uuid
from decimal import Decimal
from datetime import datetime, timezone
from sqlalchemy.exc import IntegrityError

from backend.app.db.session import create_custom_engine, get_session_factory, Base
from backend.app.db.models import (
    BusinessModel,
    TransactionModel,
    AssessmentModel,
    AgentEventModel,
    EvidenceRecordModel,
    DebtObligationModel
)
from backend.app.db.repositories import (
    BusinessRepository,
    TransactionRepository,
    AssessmentRepository,
    AgentEventRepository,
    EvidenceRepository,
    DebtObligationRepository,
    DatabaseBackedBusinessStore,
    DatabaseBackedAssessmentStore
)
from backend.app.schemas.business import BusinessProfile
from backend.app.schemas.transaction import Transaction
from backend.app.schemas.assessment import CreditAppraisalMemo
from backend.app.schemas.agent import AgentEvent

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

@pytest.fixture
def isolated_db(tmp_path):
    """
    Creates an isolated temporary SQLite database fixture with WAL mode and foreign keys enabled.
    Ensures that unit tests never touch or mutate the development database.
    """
    db_file = tmp_path / f"test_db_{uuid.uuid4().hex[:8]}.db"
    db_url = f"sqlite:///{db_file.as_posix()}"
    custom_engine = create_custom_engine(db_url)
    Base.metadata.create_all(bind=custom_engine)
    session_factory = get_session_factory(custom_engine)
    return {
        "engine": custom_engine,
        "session_factory": session_factory,
        "db_url": db_url
    }

def test_proof_1_business_creation_survives_session_restart(isolated_db):
    """Proof 1: Business creation persists and survives a complete database session restart."""
    session_factory = isolated_db["session_factory"]
    biz_id = f"msme_test_{uuid.uuid4().hex[:8]}"

    # Session 1: Create & Save
    db1 = session_factory()
    try:
        repo1 = BusinessRepository(session=db1)
        profile = BusinessProfile(
            business_id=biz_id,
            legal_name="Lakshmi Textiles Cooperative",
            trade_name="Lakshmi Weaves",
            sector="TEXTILE_WEAVING",
            vintage_months=42,
            location_tier="TIER_3",
            entity_type="PARTNERSHIP",
            declared_monthly_turnover=Decimal("580000.50"),
            declared_existing_monthly_emi=Decimal("12500.00"),
            has_udyam_registration=True,
            udyam_reg_number="UDYAM-TN-04-1234567"
        )
        repo1.save(profile)
    finally:
        db1.close()

    # Session 2: Fresh session simulating restart
    db2 = session_factory()
    try:
        repo2 = BusinessRepository(session=db2)
        fetched = repo2.get(biz_id)
        assert fetched is not None
        assert fetched.business_id == biz_id
        assert fetched.legal_name == "Lakshmi Textiles Cooperative"
        assert fetched.declared_monthly_turnover == Decimal("580000.50")
        assert fetched.declared_existing_monthly_emi == Decimal("12500.00")
        assert fetched.vintage_months == 42
    finally:
        db2.close()

def test_proof_2_transactions_persist_and_can_be_retrieved(isolated_db):
    """Proof 2: Transactions persist and can be retrieved with exact aggregations."""
    session_factory = isolated_db["session_factory"]
    biz_id = f"msme_tx_{uuid.uuid4().hex[:8]}"
    prefix = uuid.uuid4().hex[:6]

    db1 = session_factory()
    try:
        tx_repo1 = TransactionRepository(session=db1)
        txs = [
            Transaction(
                transaction_id=f"tx_{prefix}_1",
                business_id=biz_id,
                timestamp=utc_now(),
                amount=Decimal("25000.00"),
                direction="CREDIT",
                channel="UPI_QR",
                counterparty_id="buyer_001",
                category="CUSTOMER_REVENUE"
            ),
            Transaction(
                transaction_id=f"tx_{prefix}_2",
                business_id=biz_id,
                timestamp=utc_now(),
                amount=Decimal("11000.00"),
                direction="DEBIT",
                channel="IMPS",
                counterparty_id="supp_001",
                category="SUPPLIER_PURCHASE"
            )
        ]
        tx_repo1.save_batch(biz_id, txs)
    finally:
        db1.close()

    db2 = session_factory()
    try:
        tx_repo2 = TransactionRepository(session=db2)
        retrieved = tx_repo2.get_for_business(biz_id)
        assert len(retrieved) == 2
        summary = tx_repo2.get_summary(biz_id)
        assert summary.total_parsed == 2
        assert summary.total_credit_volume == Decimal("25000.00")
        assert summary.total_debit_volume == Decimal("11000.00")
    finally:
        db2.close()

def test_proof_3_duplicate_transaction_ids_rejected_safely(isolated_db):
    """Proof 3: Duplicate transaction IDs are safely caught and rejected without silent corruption."""
    session_factory = isolated_db["session_factory"]
    db = session_factory()
    try:
        tx_repo = TransactionRepository(session=db)
        biz_id = f"msme_dup_{uuid.uuid4().hex[:8]}"
        tx_id = f"tx_unique_{uuid.uuid4().hex[:8]}"

        t1 = Transaction(
            transaction_id=tx_id,
            business_id=biz_id,
            timestamp=utc_now(),
            amount=Decimal("5000.00"),
            direction="CREDIT",
            channel="UPI_QR",
            category="CUSTOMER_REVENUE"
        )
        tx_repo.save(t1)

        # Attempt to insert identical transaction_id with raise_on_duplicate=True
        t2 = Transaction(
            transaction_id=tx_id,
            business_id=biz_id,
            timestamp=utc_now(),
            amount=Decimal("9999.00"),
            direction="DEBIT",
            channel="IMPS",
            category="SUPPLIER_PURCHASE"
        )
        with pytest.raises(ValueError) as excinfo:
            tx_repo.save(t2, raise_on_duplicate=True)
        assert f"Duplicate transaction ID '{tx_id}'" in str(excinfo.value)
    finally:
        db.close()

def test_proof_4_assessment_results_survive_application_restart(isolated_db):
    """Proof 4: CreditAppraisalMemo results survive memory eviction and restart."""
    session_factory = isolated_db["session_factory"]
    eval_id = f"eval_test_{uuid.uuid4().hex[:8]}"
    biz_id = f"msme_eval_{uuid.uuid4().hex[:8]}"

    db1 = session_factory()
    try:
        biz_repo1 = BusinessRepository(session=db1)
        biz_repo1.save(BusinessProfile(
            business_id=biz_id,
            legal_name="Survive Store Ltd",
            trade_name="Survive Store",
            sector="RETAIL_KIRANA",
            vintage_months=24,
            location_tier="TIER_2",
            entity_type="PROPRIETORSHIP",
            declared_monthly_turnover=Decimal("200000.00"),
            declared_existing_monthly_emi=Decimal("0.0")
        ))
        assess_repo1 = AssessmentRepository(session=db1)
        memo = CreditAppraisalMemo(
            assessment_id=eval_id,
            business_id=biz_id,
            generated_at=utc_now(),
            assessment_status="INDICATIVE_RECOMMENDATION",
            financial_risk_band="LOW_RISK",
            evidence_confidence_score=94.0,
            investigation_status="NORMAL_PATTERNS",
            recommended_loan_amount_inr=Decimal("250000.00"),
            recommended_tenure_months=12,
            indicative_apr_range="13.5% - 14.5% p.a.",
            recommended_facility_type="UNSECURED_WORKING_CAPITAL_LINE",
            positive_credit_factors=["Strong operating surplus"],
            risk_factors_and_vulnerabilities=[],
            recommended_covenants_and_mitigants=["Monthly statement review"],
            assumptions=["Standard operational assumptions"],
            data_limitations=[],
            evidence_references=[],
            calculation_version="1.0.0",
            cam_narrative_markdown="### Executive Summary\nHigh cash velocity.",
            is_fallback_rule_based=False
        )
        assess_repo1.save(memo)
    finally:
        db1.close()

    # Verify retrieval from a brand new session
    db2 = session_factory()
    try:
        assess_repo2 = AssessmentRepository(session=db2)
        recovered = assess_repo2.get(eval_id)
        assert recovered is not None
        assert recovered.assessment_id == eval_id
        assert recovered.recommended_loan_amount_inr == Decimal("250000.00")
        assert recovered.financial_risk_band == "LOW_RISK"
        assert recovered.positive_credit_factors == ["Strong operating surplus"]
    finally:
        db2.close()

def test_proof_5_agent_events_queried_by_assessment_id(isolated_db):
    """Proof 5: Agent events are persisted and can be queried by assessment ID in chronological order."""
    session_factory = isolated_db["session_factory"]
    eval_target = f"eval_stream_{uuid.uuid4().hex[:8]}"
    eval_other = f"eval_other_{uuid.uuid4().hex[:8]}"

    db = session_factory()
    try:
        event_repo = AgentEventRepository(session=db)
        
        # Save events for eval_target
        event_repo.save(AgentEvent(
            event_id="evt_01",
            assessment_id=eval_target,
            business_id="biz_target",
            agent_name="Orchestrator",
            step_name="init",
            status="STARTED",
            message="Pipeline starting"
        ))
        event_repo.save(AgentEvent(
            event_id="evt_02",
            assessment_id=eval_target,
            business_id="biz_target",
            agent_name="FinancialAgent",
            step_name="dna",
            status="COMPLETED",
            message="DNA calculated"
        ))

        # Save event for another evaluation
        event_repo.save(AgentEvent(
            event_id="evt_99",
            assessment_id=eval_other,
            business_id="biz_other",
            agent_name="Orchestrator",
            step_name="init",
            status="STARTED",
            message="Unrelated pipeline"
        ))

        # Query events for target
        queried = event_repo.get_for_assessment(eval_target)
        assert len(queried) == 2
        assert queried[0].agent_name == "Orchestrator"
        assert queried[1].agent_name == "FinancialAgent"
        assert not any(e.assessment_id == eval_other for e in queried)
    finally:
        db.close()

def test_proof_6_foreign_key_constraints_enforced(isolated_db):
    """Proof 6: Foreign key constraints prevent orphaned transaction rows."""
    session_factory = isolated_db["session_factory"]
    db = session_factory()
    try:
        # Directly insert a TransactionModel pointing to non-existent business
        orphaned_tx = TransactionModel(
            id=f"tx_orphan_{uuid.uuid4().hex[:8]}",
            business_id="msme_non_existent_foreign_key",
            timestamp=utc_now(),
            amount=Decimal("100.00"),
            direction="CREDIT",
            channel="UPI_QR",
            category="UNCATEGORIZED"
        )
        db.add(orphaned_tx)
        with pytest.raises(IntegrityError):
            db.commit()
        db.rollback()
    finally:
        db.close()

def test_proof_7_failed_transactions_roll_back(isolated_db):
    """Proof 7: Database transaction rollback ensures atomicity on operational failure."""
    session_factory = isolated_db["session_factory"]
    db = session_factory()
    biz_id = f"msme_rollback_{uuid.uuid4().hex[:8]}"
    try:
        # Create business first
        biz = BusinessModel(
            id=biz_id,
            legal_name="Rollback Test MSME",
            trade_name="Rollback MSME",
            sector="RETAIL_KIRANA",
            declared_monthly_turnover=Decimal("1000.00"),
            declared_existing_monthly_emi=Decimal("0.0")
        )
        db.add(biz)
        db.commit()

        # Start a flawed transaction block
        t1 = TransactionModel(
            id="tx_rollback_valid",
            business_id=biz_id,
            timestamp=utc_now(),
            amount=Decimal("500.00"),
            direction="CREDIT",
            channel="UPI_QR"
        )
        # Invalid: same primary key will trigger integrity failure on commit
        t2 = TransactionModel(
            id="tx_rollback_valid",  # duplicate PK
            business_id=biz_id,
            timestamp=utc_now(),
            amount=Decimal("600.00"),
            direction="DEBIT",
            channel="IMPS"
        )
        db.add(t1)
        db.add(t2)
        with pytest.raises(IntegrityError):
            db.commit()
        db.rollback()

        # Verify nothing from the failed block was committed
        count = db.query(TransactionModel).filter(TransactionModel.business_id == biz_id).count()
        assert count == 0
    finally:
        db.close()

def test_proof_8_two_businesses_cannot_share_assessment_data(isolated_db):
    """Proof 8: Data isolation guarantees two businesses never share assessment results."""
    session_factory = isolated_db["session_factory"]
    db = session_factory()
    try:
        biz_repo = BusinessRepository(session=db)
        assess_repo = AssessmentRepository(session=db)

        biz_a = f"biz_alpha_{uuid.uuid4().hex[:6]}"
        biz_b = f"biz_beta_{uuid.uuid4().hex[:6]}"

        for b_id, name in [(biz_a, "Alpha Traders"), (biz_b, "Beta Enterprises")]:
            biz_repo.save(BusinessProfile(
                business_id=b_id,
                legal_name=name,
                trade_name=name,
                sector="RETAIL_KIRANA",
                vintage_months=12,
                location_tier="TIER_1",
                entity_type="PROPRIETORSHIP",
                declared_monthly_turnover=Decimal("100000.00"),
                declared_existing_monthly_emi=Decimal("0.0")
            ))

        # Save assessment for Alpha
        assess_repo.save(CreditAppraisalMemo(
            assessment_id="eval_alpha_1",
            business_id=biz_a,
            generated_at=utc_now(),
            assessment_status="INDICATIVE_RECOMMENDATION",
            financial_risk_band="LOW_RISK",
            evidence_confidence_score=90.0,
            investigation_status="NORMAL_PATTERNS",
            recommended_loan_amount_inr=Decimal("100000.00"),
            recommended_tenure_months=6,
            indicative_apr_range="14.0%",
            recommended_facility_type="UNSECURED_WORKING_CAPITAL_LINE",
            positive_credit_factors=[],
            risk_factors_and_vulnerabilities=[],
            recommended_covenants_and_mitigants=[],
            assumptions=[],
            data_limitations=[],
            evidence_references=[],
            calculation_version="1.0.0",
            cam_narrative_markdown="Alpha Memo"
        ))

        # Query assessments for Beta
        beta_assessments = assess_repo.get_for_business(biz_b)
        assert len(beta_assessments) == 0

        # Query assessments for Alpha
        alpha_assessments = assess_repo.get_for_business(biz_a)
        assert len(alpha_assessments) == 1
        assert alpha_assessments[0].assessment_id == "eval_alpha_1"
    finally:
        db.close()

def test_proof_9_phase1_endpoints_compatibility():
    """Proof 9: Dict-like store adapters BUSINESS_STORE and ASSESSMENT_STORE update SQLite seamlessly."""
    biz_store = DatabaseBackedBusinessStore()
    unique_id = f"msme_compat_{uuid.uuid4().hex[:6]}"
    
    profile = BusinessProfile(
        business_id=unique_id,
        legal_name="Compatibility Kirana Stores",
        trade_name="Compat Kirana",
        sector="RETAIL_KIRANA",
        vintage_months=20,
        location_tier="TIER_2",
        entity_type="PROPRIETORSHIP",
        declared_monthly_turnover=Decimal("175000.00"),
        declared_existing_monthly_emi=Decimal("0.0")
    )
    biz_store[unique_id] = profile

    # Verify transparent retrieval via dict interface
    assert unique_id in biz_store
    fetched = biz_store.get(unique_id)
    assert fetched.legal_name == "Compatibility Kirana Stores"

def test_proof_10_decimal_precision_retained_without_float_distortion(isolated_db):
    """Proof 10: Financial numbers strictly maintain exact Decimal precision without floating-point distortion."""
    session_factory = isolated_db["session_factory"]
    db = session_factory()
    biz_id = f"msme_prec_{uuid.uuid4().hex[:8]}"
    precise_turnover = Decimal("987654.32")
    precise_emi = Decimal("12345.67")

    try:
        biz_repo = BusinessRepository(session=db)
        biz_repo.save(BusinessProfile(
            business_id=biz_id,
            legal_name="Precision Engineering MSME",
            trade_name="Precision Eng",
            sector="LIGHT_MANUFACTURING",
            vintage_months=30,
            location_tier="TIER_1",
            entity_type="PRIVATE_LIMITED",
            declared_monthly_turnover=precise_turnover,
            declared_existing_monthly_emi=precise_emi
        ))

        retrieved = biz_repo.get(biz_id)
        assert isinstance(retrieved.declared_monthly_turnover, Decimal)
        assert isinstance(retrieved.declared_existing_monthly_emi, Decimal)
        assert retrieved.declared_monthly_turnover == precise_turnover
        assert retrieved.declared_existing_monthly_emi == precise_emi
        # Strict exact string equality proving no binary float distortion occurred
        assert str(retrieved.declared_monthly_turnover) == "987654.32"
        assert str(retrieved.declared_existing_monthly_emi) == "12345.67"
    finally:
        db.close()
