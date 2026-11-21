import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timezone
from decimal import Decimal
import io

from backend.app.main import app
from backend.app.api.endpoints_business import BUSINESS_STORE
from backend.app.api.endpoints_transactions import TRANSACTION_STORE
from backend.app.api.endpoints_assessment import ASSESSMENT_STORE

client = TestClient(app)

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

def test_api_health_endpoint():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "healthy"
    assert "modules_active" in body
    assert body["modules_active"]["sse_event_bus"] is True

def test_api_status_endpoint():
    res = client.get("/api/v1/status")
    assert res.status_code == 200
    body = res.json()
    assert "guarantees" in body
    assert len(body["guarantees"]) >= 5
    assert any("Deterministic" in g for g in body["guarantees"])

def test_api_demo_scenarios_endpoint():
    res = client.get("/api/v1/business/demo/scenarios")
    assert res.status_code == 200
    scenarios = res.json()
    assert len(scenarios) == 3
    ids = {s["business_id"] for s in scenarios}
    assert "msme_kirana_kanpur_001" in ids
    assert "msme_trading_surat_002" in ids
    assert "msme_weaver_erode_003" in ids

def test_api_business_profile_crud_and_errors():
    # 1. Success creation
    payload = {
        "legal_name": "Audit Kirana Stores",
        "trade_name": "Audit Kirana",
        "sector": "RETAIL_KIRANA",
        "vintage_months": 24,
        "location_tier": "TIER_3",
        "entity_type": "PROPRIETORSHIP",
        "declared_monthly_turnover": 150000.0,
        "declared_existing_monthly_emi": 2000.0
    }
    create_res = client.post("/api/v1/business/profile", json=payload)
    assert create_res.status_code == 200
    b_id = create_res.json()["business_id"]

    # 2. Retrieve existing
    get_res = client.get(f"/api/v1/business/profile/{b_id}")
    assert get_res.status_code == 200
    assert get_res.json()["legal_name"] == "Audit Kirana Stores"

    # 3. Retrieve non-existent ID -> 404
    missing_res = client.get("/api/v1/business/profile/msme_non_existent_999")
    assert missing_res.status_code == 404
    assert "not found" in missing_res.json()["detail"].lower()

    # 4. Negative turnover input -> 422 Unprocessable Entity
    invalid_payload = {**payload, "declared_monthly_turnover": -500.0}
    bad_res = client.post("/api/v1/business/profile", json=invalid_payload)
    assert bad_res.status_code == 422

    # 5. Negative EMI input -> 422 Unprocessable Entity
    invalid_emi_payload = {**payload, "declared_existing_monthly_emi": -100.0}
    bad_emi_res = client.post("/api/v1/business/profile", json=invalid_emi_payload)
    assert bad_emi_res.status_code == 422

def test_api_transactions_batch_validation():
    # 1. Success batch ingest
    batch_payload = {
        "business_id": "msme_kirana_kanpur_001",
        "transactions": [
            {
                "transaction_id": "tx_batch_audit_1",
                "business_id": "msme_kirana_kanpur_001",
                "timestamp": utc_now().isoformat(),
                "amount": 2500.0,
                "direction": "CREDIT",
                "channel": "UPI_QR",
                "counterparty_id": "cp_audit_buyer",
                "category": "CUSTOMER_REVENUE"
            }
        ]
    }
    res = client.post("/api/v1/transactions/batch", json=batch_payload)
    assert res.status_code == 200
    assert res.json()["total_parsed"] == 1

    # 2. Empty transaction list -> 400 Bad Request
    empty_res = client.post("/api/v1/transactions/batch", json={"business_id": "msme_kirana_kanpur_001", "transactions": []})
    assert empty_res.status_code == 400

    # 3. Duplicate transaction IDs in same batch -> 422 Unprocessable Entity
    dup_payload = {
        "business_id": "msme_kirana_kanpur_001",
        "transactions": [
            {
                "transaction_id": "tx_duplicate_id",
                "business_id": "msme_kirana_kanpur_001",
                "timestamp": utc_now().isoformat(),
                "amount": 1000.0,
                "direction": "CREDIT",
                "channel": "UPI_QR",
                "category": "CUSTOMER_REVENUE"
            },
            {
                "transaction_id": "tx_duplicate_id",
                "business_id": "msme_kirana_kanpur_001",
                "timestamp": utc_now().isoformat(),
                "amount": 1500.0,
                "direction": "CREDIT",
                "channel": "UPI_QR",
                "category": "CUSTOMER_REVENUE"
            }
        ]
    }
    dup_res = client.post("/api/v1/transactions/batch", json=dup_payload)
    assert dup_res.status_code == 422

def test_api_transactions_upload_csv_validation():
    # 1. Non-CSV file rejection -> 400
    files = {"file": ("statement.pdf", io.BytesIO(b"%PDF-1.4 mock pdf data"), "application/pdf")}
    res = client.post("/api/v1/transactions/upload-csv", data={"business_id": "msme_kirana_kanpur_001"}, files=files)
    assert res.status_code == 400
    assert "only csv" in res.json()["detail"].lower()

    # 2. Empty or unparseable CSV file rejection -> 400
    empty_csv = {"file": ("empty.csv", io.BytesIO(b"random,garbage,data\n1,2,3"), "text/csv")}
    empty_res = client.post("/api/v1/transactions/upload-csv", data={"business_id": "msme_kirana_kanpur_001"}, files=empty_csv)
    assert empty_res.status_code == 400
    assert "no valid transaction rows" in empty_res.json()["detail"].lower()

    # 3. Oversized file rejection (>10MB) -> 413
    oversized_data = b"0" * (11 * 1024 * 1024)  # 11MB
    large_csv = {"file": ("huge.csv", io.BytesIO(oversized_data), "text/csv")}
    oversized_res = client.post("/api/v1/transactions/upload-csv", data={"business_id": "msme_kirana_kanpur_001"}, files=large_csv)
    assert oversized_res.status_code == 413

    # 4. Valid CSV parsing -> 200
    valid_csv_text = (
        "date,amount,direction,channel,counterparty_id,category\n"
        "2026-04-01T09:00:00Z,12500.00,CREDIT,UPI_QR,cp_cust_10,CUSTOMER_REVENUE\n"
        "2026-04-02T10:00:00Z,4500.00,DEBIT,NEFT_RTGS,cp_supp_20,SUPPLIER_PURCHASE\n"
    )
    valid_file = {"file": ("valid.csv", io.BytesIO(valid_csv_text.encode("utf-8")), "text/csv")}
    valid_res = client.post("/api/v1/transactions/upload-csv", data={"business_id": "msme_kirana_kanpur_001"}, files=valid_file)
    assert valid_res.status_code == 200
    assert valid_res.json()["total_parsed"] == 2
    assert float(valid_res.json()["total_credit_volume"]) == 12500.0

def test_api_transactions_summary_endpoint():
    # 1. Retrieve summary for existing business with transactions
    res = client.get("/api/v1/transactions/summary/msme_kirana_kanpur_001")
    assert res.status_code == 200
    assert res.json()["total_parsed"] >= 2

    # 2. Retrieve summary for business with no transactions -> 404
    missing_res = client.get("/api/v1/transactions/summary/msme_unseen_biz_999")
    assert missing_res.status_code == 404

def test_api_assessment_run_and_result_endpoints():
    # 1. Trigger assessment on non-existent business -> 404
    bad_trigger = client.post("/api/v1/assessment/run", json={"business_id": "msme_missing_person_999"})
    assert bad_trigger.status_code == 404

    # 2. Retrieve non-existent assessment result -> 404
    bad_result = client.get("/api/v1/assessment/eval_completely_fake_id/result")
    assert bad_result.status_code == 404

    # 3. Retrieve pre-seeded valid assessment result -> 200
    good_result = client.get("/api/v1/assessment/eval_msme_trading_surat_002/result")
    assert good_result.status_code == 200
    memo = good_result.json()
    assert memo["business_id"] == "msme_trading_surat_002"
    assert memo["assessment_status"] == "HUMAN_REVIEW_REQUIRED"
    assert memo["investigation_status"] == "HUMAN_REVIEW_RECOMMENDED"
    assert "circular transaction loops" in str(memo["risk_factors_and_vulnerabilities"]).lower()

def test_api_sse_stream_header_and_content_type():
    # Stream endpoint returns text/event-stream with no-cache headers
    with client.stream("GET", "/api/v1/assessment/eval_msme_kirana_kanpur_001/stream") as res:
        assert res.status_code == 200
        assert "text/event-stream" in res.headers["content-type"]
        assert "no-cache" in res.headers["cache-control"]
