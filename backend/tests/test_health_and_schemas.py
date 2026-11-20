import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from datetime import datetime, timezone

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "modules_active" in data
    assert data["modules_active"]["sse_event_bus"] is True

def test_status_guarantees():
    response = client.get("/api/v1/status")
    assert response.status_code == 200
    data = response.json()
    assert "guarantees" in data
    assert any("Deterministic" in g for g in data["guarantees"])
    assert any("credit bureau score" in g for g in data["guarantees"])

def test_demo_scenarios():
    response = client.get("/api/v1/business/demo/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert any(p["sector"] == "RETAIL_KIRANA" for p in data)
    assert any(p["sector"] == "TEXTILE_WEAVING" for p in data)

def test_business_profile_creation():
    payload = {
        "legal_name": "Test Enterprise",
        "trade_name": "Test Traders",
        "sector": "LIGHT_MANUFACTURING",
        "vintage_months": 36,
        "location_tier": "TIER_2",
        "entity_type": "PROPRIETORSHIP",
        "declared_monthly_turnover": 500000.0,
        "declared_existing_monthly_emi": 12000.0,
        "has_gstin": True,
        "gstin": "29AAAAA0000A1Z5"
    }
    response = client.post("/api/v1/business/profile", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["business_id"].startswith("msme_")
    assert data["trade_name"] == "Test Traders"

def test_resilience_simulation_deterministic():
    payload = {
        "revenue_contraction_pct": 20.0,
        "cogs_inflation_pct": 10.0,
        "receivable_delay_days": 15
    }
    response = client.post("/api/v1/resilience/simulate?business_id=msme_kirana_kanpur_001", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "stressed_cash_runway_days" in data
    assert "resilience_classification" in data
    assert "affordability" in data
    affordability = data["affordability"]
    assert "reconciled_existing_debt_service" in affordability
    assert "projected_dscr" in affordability
    # Verify existing debt obligation is single-counted
    assert affordability["reconciled_existing_debt_service"] >= affordability["declared_existing_monthly_emi"]

def test_assessment_preseeded_and_trigger():
    # 1. Check pre-seeded memo retrieval
    response = client.get("/api/v1/assessment/eval_msme_kirana_kanpur_001/result")
    assert response.status_code == 200
    memo = response.json()
    assert memo["assessment_status"] == "INDICATIVE_RECOMMENDATION"
    assert "300" not in str(memo)  # Bureau score claim removed
    assert float(memo["recommended_loan_amount_inr"]) > 0
    assert "disclaimer" in memo

    # 2. Check trigger endpoint
    trigger_resp = client.post("/api/v1/assessment/run", json={"business_id": "msme_kirana_kanpur_001"})
    assert trigger_resp.status_code == 200
    trigger_data = trigger_resp.json()
    assert "eval_" in trigger_data["assessment_id"]
    assert trigger_data["status"] == "QUEUED"
    assert "/stream" in trigger_data["stream_url"]

def test_transactions_batch_ingest():
    tx_payload = {
        "business_id": "msme_kirana_kanpur_001",
        "transactions": [
            {
                "transaction_id": "tx_test_1",
                "business_id": "msme_kirana_kanpur_001",
                "timestamp": utc_now().isoformat(),
                "amount": 1500.0,
                "direction": "CREDIT",
                "channel": "UPI_QR",
                "counterparty_id": "cp_001",
                "counterparty_name": "Retail Buyer",
                "category": "CUSTOMER_REVENUE"
            },
            {
                "transaction_id": "tx_test_2",
                "business_id": "msme_kirana_kanpur_001",
                "timestamp": utc_now().isoformat(),
                "amount": 800.0,
                "direction": "DEBIT",
                "channel": "UPI_QR",
                "counterparty_id": "cp_supplier",
                "counterparty_name": "Wholesale Distributor",
                "category": "SUPPLIER_PURCHASE"
            }
        ]
    }
    response = client.post("/api/v1/transactions/batch", json=tx_payload)
    assert response.status_code == 200
    summary = response.json()
    assert summary["total_parsed"] == 2
    assert summary["credits_count"] == 1
    assert summary["debits_count"] == 1
    assert float(summary["total_credit_volume"]) == 1500.0
    assert float(summary["total_debit_volume"]) == 800.0
