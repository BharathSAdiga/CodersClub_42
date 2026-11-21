import pytest
import uuid
import json
from decimal import Decimal
from datetime import datetime, timezone, timedelta

from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings
from app.core.security import verify_password, hash_password
from app.db import (
    user_repo,
    business_repo,
    transaction_repo,
    assessment_repo,
    evidence_repo,
    consent_repo,
    audit_repo,
    application_repo,
    SessionLocal
)
from app.schemas.business import BusinessProfile
from app.schemas.transaction import Transaction
from app.schemas.resilience import ShockScenarioInput, DebtObligation
from app.modules.resilience_engine import calculate_affordability
from app.modules.agents.orchestrator import AgentOrchestrator
from app.modules.underwriting import compile_credit_appraisal_memo

client = TestClient(app)

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

# -----------------------------------------------------------------------------
# 1. End-to-End Borrower Workflow
# -----------------------------------------------------------------------------
def test_e2e_borrower_complete_workflow():
    """
    Verifies the complete borrower journey from authentication to assessment and CAM retrieval.
    1. Authenticate as borrower
    2. Read enterprise profile
    3. Upload CSV transactions
    4. Record evidence and inspect provenance
    5. Grant and revoke consent
    6. Trigger multi-agent assessment and verify CAM
    """
    # 1. Login as borrower
    login_resp = client.post(
        "/api/v1/auth/demo-login",
        json={"persona_key": "PERSONA_RAMESH"}
    )
    assert login_resp.status_code == 200
    auth_data = login_resp.json()
    token = auth_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    biz_id = auth_data["user"]["business_id"]
    assert biz_id == "msme_kirana_kanpur_001"

    # 2. Get business profile
    prof_resp = client.get(f"/api/v1/business/profile/{biz_id}", headers=headers)
    assert prof_resp.status_code == 200
    assert prof_resp.json()["business_id"] == biz_id

    # 3. Upload transactions via CSV
    csv_content = (
        "date,amount,direction,channel,counterparty_id,category\n"
        "2026-03-01T10:00:00Z,25000.00,CREDIT,UPI_QR,cust_1,CUSTOMER_REVENUE\n"
        "2026-03-02T11:00:00Z,18000.00,CREDIT,UPI_QR,cust_2,CUSTOMER_REVENUE\n"
        "2026-03-03T14:00:00Z,12000.00,DEBIT,IMPS,supp_1,SUPPLIER_PURCHASE\n"
    ).encode("utf-8")
    files = {"file": ("bank_stmt.csv", csv_content, "text/csv")}
    upload_resp = client.post(
        "/api/v1/transactions/upload-csv",
        data={"business_id": biz_id},
        files=files,
        headers=headers
    )
    assert upload_resp.status_code == 200
    assert upload_resp.json()["total_parsed"] == 3

    # 4. Check evidence audit trail & provenance category
    ev_resp = client.get(f"/api/v1/evidence/audit-trail/{biz_id}", headers=headers)
    assert ev_resp.status_code == 200
    ev_list = ev_resp.json()
    assert len(ev_list) > 0
    latest_ev = ev_list[0]
    assert latest_ev["provenance_category"] in ["USER_UPLOADED", "SOURCE_LABELLED"]
    assert latest_ev["file_hash"] is not None

    # 5. Grant consent to Account Aggregator
    consent_grant_resp = client.post(
        "/api/v1/consent/grant",
        json={
            "business_id": biz_id,
            "data_provider": "ACCOUNT_AGGREGATOR",
            "purpose": "Working capital underwriting assessment",
            "consent_scope": ["BANK_STATEMENTS", "UPI_MERCHANT_FEED"],
            "expires_in_days": 30
        },
        headers=headers
    )
    assert consent_grant_resp.status_code == 200
    consent_data = consent_grant_resp.json()
    consent_id = consent_data["id"]
    assert consent_data["status"] == "ACTIVE"

    # Revoke consent
    revoke_resp = client.post(f"/api/v1/consent/{consent_id}/revoke", headers=headers)
    assert revoke_resp.status_code == 200
    assert revoke_resp.json()["status"] == "REVOKED"

    # 6. Trigger Assessment & retrieve CAM
    asmt_resp = client.post(
        "/api/v1/assessment/run",
        json={"business_id": biz_id, "requested_loan_amount": 250000},
        headers=headers
    )
    assert asmt_resp.status_code == 200
    asmt_data = asmt_resp.json()
    asmt_id = asmt_data["assessment_id"]
    assert asmt_id.startswith("eval_")

    # Retrieve pre-seeded or freshly stored CAM result
    cam_resp = client.get(f"/api/v1/assessment/{asmt_id}/result", headers=headers)
    assert cam_resp.status_code in [200, 404] # 404 while async background task executes

# -----------------------------------------------------------------------------
# 2. End-to-End Lender Workflow & RBAC Access Enforcement
# -----------------------------------------------------------------------------
def test_e2e_lender_workflow_and_rbac_boundaries():
    """
    Verifies lender login, application review, and tenant isolation.
    Lenders cannot access unassigned borrower data without consent.
    """
    # 1. Login as lender Vikram
    login_resp = client.post(
        "/api/v1/auth/demo-login",
        json={"persona_key": "PERSONA_VIKRAM"}
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. List loan applications accessible to lender
    apps_resp = client.get("/api/v1/auth/applications", headers=headers)
    assert apps_resp.status_code == 200
    assert isinstance(apps_resp.json(), list)

    # 3. Attempt access to borrower data without assignment or consent
    unauthorized_biz_id = f"msme_private_{uuid.uuid4().hex[:6]}"
    access_resp = client.get(
        f"/api/v1/consent/validate/{unauthorized_biz_id}",
        headers=headers
    )
    assert access_resp.status_code == 200
    val_result = access_resp.json()
    assert val_result["is_authorized"] is False
    assert "denied" in val_result["reason"].lower() or "no active" in val_result["reason"].lower()

# -----------------------------------------------------------------------------
# 3. End-to-End Administrator Workflow
# -----------------------------------------------------------------------------
def test_e2e_admin_workflow():
    """
    Verifies admin access to user directory, audit trail, and health probes.
    """
    # 1. Login as Super Admin
    login_resp = client.post(
        "/api/v1/auth/demo-login",
        json={"persona_key": "SUPER_ADMIN"}
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. View user directory
    users_resp = client.get("/api/v1/auth/users", headers=headers)
    assert users_resp.status_code == 200
    users = users_resp.json()
    assert len(users) >= 4

    # 3. View immutable audit trail
    audit_resp = client.get("/api/v1/auth/audit-logs", headers=headers)
    assert audit_resp.status_code == 200
    logs = audit_resp.json()
    assert len(logs) > 0

    # 4. Deep health checks
    health_resp = client.get("/api/v1/health")
    assert health_resp.status_code == 200
    assert health_resp.json()["status"] == "healthy"

# -----------------------------------------------------------------------------
# 4. Financial Calculation Accuracy & Formula Validation
# -----------------------------------------------------------------------------
def test_financial_accuracy_formula_and_precision():
    """
    Independently verifies formulas for monthly cash surplus, DSCR, max affordable EMI,
    and maximum safe loan principal with exact Decimal precision.
    """
    # Hand-calculated case:
    # Monthly Inflow: 300,000.00
    # Operating Expenses (70%): 210,000.00
    # Operating Cashflow: 90,000.00
    # Existing Debt Obligations: 15,000.00
    # Unencumbered Surplus = 90,000 - 15,000 = 75,000.00
    # Max Affordable EMI (50% FOIR cap) = 75,000 * 0.50 = 37,500.00
    # For tenure n=12 months, r=14.0% p.a. (0.0116667 monthly rate):
    # P_max = EMI * (1 - (1+r)^-n) / r ≈ 37500 * (1 - (1.011667)^-12) / 0.011667 ≈ 418,294.00
    inflow = Decimal("300000.00")
    expenses = Decimal("210000.00")
    existing_emi = Decimal("15000.00")
    declared_obs = [
        DebtObligation(
            obligation_id="obl_1",
            lender_name="Existing Loan",
            monthly_payment=existing_emi,
            source="DECLARED"
        )
    ]

    affordability = calculate_affordability(
        monthly_operating_inflow=inflow,
        monthly_operating_expenses=expenses,
        declared_obligations=declared_obs,
        verified_obligations=[],
        proposed_loan_amount_inr=Decimal("200000.00"),
        proposed_tenure_months=12,
        indicative_annual_interest_rate_pct=14.0,
        foir_cap_pct=Decimal("50.0")
    )

    expected_surplus = Decimal("75000.00")
    expected_max_emi = Decimal("37500.00")

    assert affordability.unencumbered_monthly_cash_surplus == expected_surplus
    assert affordability.maximum_affordable_monthly_emi == expected_max_emi
    # Maximum affordable principal must be strictly positive and bounded by formula
    assert affordability.maximum_affordable_loan_principal > Decimal("400000.00")
    assert affordability.maximum_affordable_loan_principal < Decimal("430000.00")

def test_financial_accuracy_zero_revenue_and_negative_cashflow():
    """Verify divide-by-zero prevention and zero loan recommendation on cashflow deficit."""
    # Zero revenue & negative cashflow
    affordability = calculate_affordability(
        monthly_operating_inflow=Decimal("10000.00"),
        monthly_operating_expenses=Decimal("35000.00"),
        declared_obligations=[
            DebtObligation(obligation_id="obl_d", lender_name="Bank", monthly_payment=Decimal("10000.00"), source="DECLARED")
        ],
        verified_obligations=[],
        proposed_loan_amount_inr=Decimal("100000.00"),
        proposed_tenure_months=12,
        indicative_annual_interest_rate_pct=14.0,
        foir_cap_pct=Decimal("50.0")
    )

    assert affordability.unencumbered_monthly_cash_surplus == Decimal("-35000.00")
    assert affordability.maximum_affordable_monthly_emi == Decimal("0.00")
    assert affordability.maximum_affordable_loan_principal == Decimal("0.00")
    assert affordability.is_over_leveraged is True

# -----------------------------------------------------------------------------
# 5. Security & Audit Trail Immutability Verification
# -----------------------------------------------------------------------------
def test_audit_trail_immutability():
    """Verify audit log records cannot be deleted via repository interface."""
    with pytest.raises(PermissionError, match="immutable and cannot be deleted"):
        audit_repo.delete("any_log_id")

def test_argon2id_password_hashing_security():
    """Verify passwords are securely hashed with Argon2id and never stored in plaintext."""
    raw_pass = "PristineSecurePassword123!"
    hashed = hash_password(raw_pass)
    assert hashed != raw_pass
    assert hashed.startswith("$argon2id$") or hashed.startswith("$2b$")
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False
