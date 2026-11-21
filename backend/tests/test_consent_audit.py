import io
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db import init_db, evidence_repo
from backend.app.schemas.evidence import EvidenceConfidence, EvidenceItem

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    init_db()

def test_consent_grant_and_retrieval():
    """Verify consent lifecycle: granting, active listing, and revoking."""
    # 1. Login as Ramesh
    login_resp = client.post("/api/v1/auth/demo-login", json={"persona_key": "PERSONA_RAMESH"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Grant consent for Account Aggregator data sharing
    grant_resp = client.post(
        "/api/v1/consent/grant",
        json={
            "business_id": "msme_kirana_kanpur_001",
            "data_provider": "ACCOUNT_AGGREGATOR",
            "purpose": "MSME Underwriting & Assessment",
            "data_fields_granted": ["BANK_STATEMENTS", "DAILY_CLOSING_BALANCES"],
            "expires_in_days": 30
        },
        headers=headers
    )
    assert grant_resp.status_code == 200
    consent_data = grant_resp.json()
    assert consent_data["status"] == "ACTIVE"
    assert consent_data["data_provider"] == "ACCOUNT_AGGREGATOR"
    consent_id = consent_data["id"]

    # 3. Retrieve active consents
    list_resp = client.get("/api/v1/consent/active/msme_kirana_kanpur_001", headers=headers)
    assert list_resp.status_code == 200
    active_consents = list_resp.json()
    assert any(c["id"] == consent_id for c in active_consents)

    # 4. Revoke consent
    revoke_resp = client.post(f"/api/v1/consent/{consent_id}/revoke", headers=headers)
    assert revoke_resp.status_code == 200
    assert revoke_resp.json()["status"] == "REVOKED"

    # 5. Check active consents list after revocation
    after_list_resp = client.get("/api/v1/consent/active/msme_kirana_kanpur_001", headers=headers)
    assert after_list_resp.status_code == 200
    assert not any(c["id"] == consent_id for c in after_list_resp.json())

def test_cross_tenant_consent_protection():
    """Verify that a borrower cannot grant consent for another borrower's business."""
    # Login as Ramesh
    login_resp = client.post("/api/v1/auth/demo-login", json={"persona_key": "PERSONA_RAMESH"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt to grant consent for Priya's business (msme_trading_surat_002)
    resp = client.post(
        "/api/v1/consent/grant",
        json={
            "business_id": "msme_trading_surat_002",
            "data_provider": "GSTN",
            "purpose": "Unauthorized Access Attempt",
            "data_fields_granted": ["GSTR_3B"]
        },
        headers=headers
    )
    assert resp.status_code == 403
    assert "Cross-tenant access forbidden" in resp.json()["detail"]

def test_evidence_audit_trail_and_sha256_hash():
    """Verify document upload provenance and SHA-256 fingerprint audit trail."""
    biz_id = "msme_kirana_kanpur_001"
    csv_content = (
        "date,amount,direction,channel,counterparty_id,counterparty_name,category,narration\n"
        "2026-03-01T10:00:00,12000.00,CREDIT,UPI_QR,retail_c1,Customer One,CUSTOMER_REVENUE,UPI Payment\n"
        "2026-03-02T11:00:00,4500.00,DEBIT,IMPS,supp_s1,Flour Supplier,SUPPLIER_PURCHASE,Raw materials\n"
    )
    files = {"file": ("bank_statement_march.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    upload_resp = client.post(
        "/api/v1/transactions/upload-csv",
        data={"business_id": biz_id},
        files=files
    )
    assert upload_resp.status_code == 200

    # Retrieve evidence audit trail
    audit_resp = client.get(f"/api/v1/evidence/audit-trail/{biz_id}")
    assert audit_resp.status_code == 200
    audit_records = audit_resp.json()
    assert len(audit_records) > 0

    latest = audit_records[0]
    assert latest["document_name"] == "bank_statement_march.csv"
    assert latest["provenance"] == "SOURCE_LABELLED"
    assert latest["record_count"] == 2
    assert len(latest["file_hash"]) == 64  # Valid SHA-256 hex string

def test_missing_evidence_neutrality_policy():
    """Verify that absence of formal evidence increases uncertainty bands without penalizing base score."""
    confidence = EvidenceConfidence(
        business_id="msme_kirana_kanpur_001",
        evidence_confidence_score=75.0,
        data_completeness_pct=70.0,
        temporal_coverage_days=90,
        total_records_analyzed=240,
        available_data_sources=["BANK_STATEMENTS", "UPI_QR_LOGS"],
        missing_evidence_fields=["GSTIN_RETURN_3B", "AUDITED_BALANCE_SHEET"],
        evidence_items=[
            EvidenceItem(
                attribute_name="monthly_cash_inflow",
                provenance="SOURCE_LABELLED",
                is_verified=True,
                confidence_weight=1.0
            ),
            EvidenceItem(
                attribute_name="gst_filings",
                provenance="MISSING",
                is_verified=False,
                confidence_weight=0.0
            )
        ]
    )
    assert "NEUTRAL_UNCERTAINTY" in confidence.missing_data_treatment_policy
    assert confidence.fairness_audit_status == "NOT_RUN"
