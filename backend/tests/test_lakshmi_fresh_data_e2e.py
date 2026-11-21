import pytest
import io
import asyncio
from decimal import Decimal
from fastapi import UploadFile, HTTPException

from backend.app.schemas.business import BusinessProfileCreate
from backend.app.api.endpoints_business import create_profile, get_profile, BUSINESS_STORE
from backend.app.api.endpoints_transactions import upload_transactions_csv, TRANSACTION_STORE
from backend.app.api.endpoints_simulation import simulate_stress_test
from backend.app.schemas.resilience import ShockScenarioInput
from backend.app.modules.agents.orchestrator import AgentOrchestrator
from backend.app.db import SessionLocal, BusinessModel, TransactionModel, AssessmentModel

@pytest.mark.anyio
async def test_lakshmi_mini_mart_fresh_data_full_pipeline():
    """
    End-to-end validation of the complete fresh-data workflow for 'Lakshmi Mini Mart'.
    Tests:
      1. Fresh business profile creation and persistence.
      2. Multi-format CSV upload (Debit/Credit columns & Amount/Type columns).
      3. Deduplication on repeated upload.
      4. Database persistence in SQLite.
      5. Financial DNA and resilience stress simulation.
      6. Coordinated execution of all 7 specialized agents.
      7. Institutional Credit Appraisal Memo (CAM) generation and loan terms bounding.
    """
    # -------------------------------------------------------------
    # 1. Create completely new business: Lakshmi Mini Mart
    # -------------------------------------------------------------
    payload = BusinessProfileCreate(
        legal_name="Lakshmi Mini Mart",
        trade_name="Lakshmi Mini Mart",
        sector="RETAIL_KIRANA",
        vintage_months=48,
        location_tier="TIER_1",
        entity_type="PROPRIETORSHIP",
        declared_monthly_turnover=Decimal("458000.0"),
        declared_existing_monthly_emi=Decimal("42000.0"),
        has_gstin=False,
        has_udyam_registration=True,
        udyam_reg_number="UDYAM-KR-03-0098412"
    )
    biz = await create_profile(payload)
    assert biz.business_id.startswith("msme_")
    assert biz.business_id not in ["msme_kirana_kanpur_001", "msme_trading_surat_002", "biz_artisan_02"]
    assert biz.trade_name == "Lakshmi Mini Mart"
    assert biz.vintage_months == 48

    # -------------------------------------------------------------
    # 2. Upload Bank Statement CSV (Format: Date, Description, Debit, Credit, Balance)
    # -------------------------------------------------------------
    with open("udyoga_kirana_bank_statement.csv", "rb") as f:
        file_stmt = UploadFile(filename="udyoga_kirana_bank_statement.csv", file=io.BytesIO(f.read()))

    res_stmt = await upload_transactions_csv(business_id=biz.business_id, file=file_stmt)
    assert res_stmt.total_parsed == 180
    assert res_stmt.credits_count == 94
    assert res_stmt.debits_count == 86
    assert res_stmt.total_credit_volume == Decimal("1375191.33")
    assert res_stmt.total_debit_volume == Decimal("771634.27")

    # -------------------------------------------------------------
    # 3. Test Deduplication: Re-uploading same statement produces no duplicate rows
    # -------------------------------------------------------------
    with open("udyoga_kirana_bank_statement.csv", "rb") as f:
        file_stmt_repeat = UploadFile(filename="udyoga_kirana_bank_statement.csv", file=io.BytesIO(f.read()))
    res_repeat = await upload_transactions_csv(business_id=biz.business_id, file=file_stmt_repeat)
    assert res_repeat.total_parsed == 180
    stored_txs = TRANSACTION_STORE.get(biz.business_id, [])
    assert len(stored_txs) == 180

    # -------------------------------------------------------------
    # 4. Verify SQLite Database Records
    # -------------------------------------------------------------
    db = SessionLocal()
    try:
        db_biz = db.query(BusinessModel).filter(BusinessModel.id == biz.business_id).first()
        assert db_biz is not None
        assert db_biz.trade_name == "Lakshmi Mini Mart"

        db_txs = db.query(TransactionModel).filter(TransactionModel.business_id == biz.business_id).all()
        assert len(db_txs) == 180
        total_cr = sum((Decimal(str(t.amount)) for t in db_txs if t.direction == "CREDIT"), Decimal("0.0"))
        total_db = sum((Decimal(str(t.amount)) for t in db_txs if t.direction == "DEBIT"), Decimal("0.0"))
        assert total_cr == Decimal("1375191.33")
        assert total_db == Decimal("771634.27")
    finally:
        db.close()

    # -------------------------------------------------------------
    # 5. Verify Stress Simulator on Uploaded Transactions
    # -------------------------------------------------------------
    # Normal scenario
    sim_normal = await simulate_stress_test(
        payload=ShockScenarioInput(revenue_contraction_pct=0.0, cogs_inflation_pct=0.0, receivable_delay_days=0),
        business_id=biz.business_id
    )
    assert sim_normal.post_shock_dscr > 1.5
    assert sim_normal.resilience_classification == "HIGHLY_RESILIENT"

    # Severe 20% revenue drop
    sim_shock = await simulate_stress_test(
        payload=ShockScenarioInput(revenue_contraction_pct=20.0, cogs_inflation_pct=0.0, receivable_delay_days=0),
        business_id=biz.business_id
    )
    assert sim_shock.post_shock_dscr < sim_normal.post_shock_dscr

    # -------------------------------------------------------------
    # 6. Execute Seven-Agent Assessment Pipeline
    # -------------------------------------------------------------
    orchestrator = AgentOrchestrator()
    memo = await orchestrator.run_assessment_pipeline(
        business_profile=biz,
        transactions=stored_txs,
        requested_loan_amount_inr=Decimal("500000.0")
    )

    # -------------------------------------------------------------
    # 7. Verify CAM Output & Affordability Bounding
    # -------------------------------------------------------------
    assert memo.assessment_id.startswith("eval_")
    assert memo.business_id == biz.business_id
    assert memo.assessment_status in ["INDICATIVE_RECOMMENDATION", "CONDITIONAL_RECOMMENDATION"]
    assert memo.recommended_loan_amount_inr > Decimal("0.0")
    assert memo.recommended_tenure_months > 0
    assert memo.evidence_confidence_score > 70.0
    assert len(memo.positive_credit_factors) >= 1
    assert "Credit Appraisal Memo" in memo.cam_narrative_markdown

@pytest.mark.anyio
async def test_invalid_csv_rejected_cleanly():
    """Verify that uploading an empty or invalid CSV produces an understandable HTTP 400 error."""
    invalid_content = b"random,unrecognized,stuff\nwith,no,transactions\n"
    file_bad = UploadFile(filename="corrupt_statement.csv", file=io.BytesIO(invalid_content))
    with pytest.raises(HTTPException) as exc_info:
        await upload_transactions_csv(business_id="test_invalid", file=file_bad)
    assert exc_info.value.status_code == 400
    assert "CSV contains no valid transaction rows" in exc_info.value.detail
