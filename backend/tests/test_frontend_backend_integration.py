import pytest
from fastapi.testclient import TestClient
from decimal import Decimal
import io

from backend.app.main import app

client = TestClient(app)

def test_integration_demo_scenarios_and_onboarding():
    """Verify frontend onboarding and demo scenario retrieval."""
    # 1. Fetch demo scenarios
    res = client.get("/api/v1/business/demo/scenarios")
    assert res.status_code == 200
    scenarios = res.json()
    assert len(scenarios) >= 3
    assert any(s["business_id"] == "msme_kirana_kanpur_001" for s in scenarios)

    # 2. Create new business profile from OnboardingWizard
    profile_payload = {
        "legal_name": "Shree Balaji Provisions",
        "trade_name": "Balaji Kirana & Provisions",
        "sector": "RETAIL_KIRANA",
        "vintage_months": 48,
        "location_tier": "TIER_2",
        "entity_type": "PROPRIETORSHIP",
        "declared_monthly_turnover": 300000.0,
        "declared_existing_monthly_emi": 4500.0,
        "has_gstin": False,
        "has_udyam_registration": True,
        "udyam_reg_number": "UDYAM-KR-03-0048921"
    }
    create_res = client.post("/api/v1/business/profile", json=profile_payload)
    assert create_res.status_code == 200
    created = create_res.json()
    assert created["business_id"].startswith("msme_")
    assert created["legal_name"] == "Shree Balaji Provisions"

def test_integration_csv_upload_document_vault():
    """Verify bank/UPI statement CSV upload from DocumentUploadView."""
    csv_content = (
        "date,amount,direction,channel,counterparty_id,category\n"
        "2026-03-01T10:00:00Z,4500.00,CREDIT,UPI,vpa_cust_1,SALE_PROCEEDS\n"
        "2026-03-02T11:30:00Z,1200.00,DEBIT,IMPS,supp_dist_1,SUPPLIER_PAYMENT\n"
        "2026-03-03T14:15:00Z,6800.00,CREDIT,UPI,vpa_cust_2,SALE_PROCEEDS\n"
    )
    files = {
        "file": ("Daily_Sales_Cashbook_Q3.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")
    }
    data = {"business_id": "msme_kirana_kanpur_001"}
    upload_res = client.post("/api/v1/transactions/upload-csv", data=data, files=files)
    assert upload_res.status_code == 200
    summary = upload_res.json()
    assert summary["total_parsed"] == 3
    assert summary["credits_count"] == 2
    assert summary["debits_count"] == 1
    assert float(summary["total_credit_volume"]) == 11300.0

def test_integration_resilience_simulation_presets():
    """Verify WhatIfSimulatorView 6-scenario resilience shock calculations."""
    presets = [
        {"scenario_name": "NORMAL", "revenue_contraction_pct": 0, "cogs_inflation_pct": 0, "receivable_delay_days": 0, "shock_duration_months": 1},
        {"scenario_name": "REVENUE_DROP_15", "revenue_contraction_pct": 15, "cogs_inflation_pct": 0, "receivable_delay_days": 0, "shock_duration_months": 1},
        {"scenario_name": "REVENUE_DROP_30", "revenue_contraction_pct": 30, "cogs_inflation_pct": 0, "receivable_delay_days": 0, "shock_duration_months": 2},
        {"scenario_name": "EXPENSE_SURGE_15", "revenue_contraction_pct": 0, "cogs_inflation_pct": 15, "receivable_delay_days": 0, "shock_duration_months": 1},
        {"scenario_name": "DELAYED_RECEIVABLES_30", "revenue_contraction_pct": 0, "cogs_inflation_pct": 0, "receivable_delay_days": 30, "shock_duration_months": 1},
        {"scenario_name": "COMBINED_STRESS", "revenue_contraction_pct": 20, "cogs_inflation_pct": 15, "receivable_delay_days": 30, "shock_duration_months": 2},
    ]

    for p in presets:
        res = client.post(
            "/api/v1/resilience/simulate?business_id=msme_kirana_kanpur_001",
            json=p
        )
        assert res.status_code == 200
        sim = res.json()
        assert "post_shock_dscr" in sim
        assert "post_shock_monthly_surplus" in sim
        assert "resilience_classification" in sim
        assert "affordability" in sim
        if sim["post_shock_dscr"] is not None:
            assert isinstance(sim["post_shock_dscr"], (int, float))

def test_integration_applicant_workbench_agent_assessment():
    """Verify triggering live assessment and receiving CAM result."""
    trigger_payload = {
        "business_id": "msme_kirana_kanpur_001",
        "requested_loan_amount": 150000.0
    }
    run_res = client.post("/api/v1/assessment/run", json=trigger_payload)
    assert run_res.status_code == 200
    meta = run_res.json()
    assert meta["status"] == "QUEUED"
    assert "eval_" in meta["assessment_id"]

    # Result retrieval
    res = client.get(f"/api/v1/assessment/{meta['assessment_id']}/result")
    # Result may be in progress or completed
    assert res.status_code in [200, 404]

    # Pre-seeded assessment retrieval
    demo_res = client.get("/api/v1/assessment/eval_msme_kirana_kanpur_001/result")
    assert demo_res.status_code == 200
    memo = demo_res.json()
    assert memo["business_id"] == "msme_kirana_kanpur_001"
    assert memo["assessment_status"] in [
        "INDICATIVE_RECOMMENDATION",
        "CONDITIONAL_RECOMMENDATION",
        "HUMAN_REVIEW_REQUIRED"
    ]
    assert float(memo["recommended_loan_amount_inr"]) > 0
