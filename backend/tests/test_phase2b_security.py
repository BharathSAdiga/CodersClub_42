"""
UDYOGA Phase 2B Security & Role-Based Access Control (RBAC) Test Suite
Proves 13 security and isolation guarantees:
1. Valid registration and login
2. Duplicate email rejection (409 Conflict)
3. Invalid password policy rejection (400) & incorrect credentials (401)
4. Expired JWT rejection (401 Unauthorized)
5. Invalid/forged JWT rejection (401 Unauthorized)
6. Revoked refresh token rejection and rotation enforcement (401)
7. Borrower accessing another borrower's data (403 Forbidden)
8. Lender accessing an unauthorized application / borrower without consent (403 Forbidden)
9. Borrower attempting admin endpoints (403 Forbidden)
10. Lender attempting admin endpoints (403 Forbidden)
11. Inactive account access rejection (401 Unauthorized)
12. Consent revocation preventing unauthorized lender access (403 Forbidden)
13. Cross-tenant assessment isolation (403 Forbidden)
"""

import pytest
import uuid
from datetime import timedelta
from decimal import Decimal
from fastapi import HTTPException
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
    validate_password_strength,
    utc_now
)
from backend.app.core.auth_deps import (
    verify_tenant_access,
    verify_assessment_access,
    verify_application_access
)
from backend.app.db import (
    init_db,
    user_repo,
    consent_repo,
    application_repo,
    assessment_repo,
    refresh_token_repo
)
from backend.app.schemas.assessment import CreditAppraisalMemo

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    init_db()

def test_1_valid_registration_and_login():
    """Security Proof 1: Valid registration and login issue verified tokens and bcrypt hashes."""
    unique_suffix = uuid.uuid4().hex[:6]
    username = f"borrower_{unique_suffix}"
    email = f"borrower_{unique_suffix}@testmsme.in"
    password = "StrongPassword2026!"

    # 1. Register
    reg_resp = client.post("/api/v1/auth/register", json={
        "username": username,
        "email": email,
        "full_name": "Test Kirana Owner",
        "password": password,
        "role": "BORROWER",
        "business_id": f"msme_biz_{unique_suffix}"
    })
    assert reg_resp.status_code == 201
    reg_data = reg_resp.json()
    assert "access_token" in reg_data
    assert "refresh_token" in reg_data
    assert reg_data["user"]["username"] == username
    assert reg_data["user"]["email"] == email
    assert reg_data["user"]["role"] == "BORROWER"

    # 2. Login with registered credentials
    login_resp = client.post("/api/v1/auth/login", json={
        "username": username,
        "password": password
    })
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert login_data["username"] == username
    assert len(login_data["access_token"]) > 20
    assert len(login_data["refresh_token"]) > 20

def test_2_duplicate_email_rejection():
    """Security Proof 2: Attempting to register with an existing email returns 409 Conflict."""
    unique_suffix = uuid.uuid4().hex[:6]
    email = f"unique_{unique_suffix}@testmsme.in"
    password = "StrongPassword2026!"

    # First registration
    client.post("/api/v1/auth/register", json={
        "username": f"user_a_{unique_suffix}",
        "email": email,
        "full_name": "Original User",
        "password": password,
        "role": "BORROWER"
    })

    # Second registration with identical email
    resp = client.post("/api/v1/auth/register", json={
        "username": f"user_b_{unique_suffix}",
        "email": email,
        "full_name": "Duplicate Email Attempt",
        "password": password,
        "role": "BORROWER"
    })
    assert resp.status_code == 409
    assert f"Email '{email}' is already registered" in resp.json()["detail"]

def test_3_invalid_password_rejection():
    """Security Proof 3: Weak passwords rejected with 400; wrong login password rejected with 401."""
    unique_suffix = uuid.uuid4().hex[:6]

    # Weak password (< 8 chars)
    resp = client.post("/api/v1/auth/register", json={
        "username": f"weak_{unique_suffix}",
        "email": f"weak_{unique_suffix}@testmsme.in",
        "full_name": "Weak User",
        "password": "short",
        "role": "BORROWER"
    })
    assert resp.status_code in [400, 422]

    # Valid user registered
    valid_username = f"user_{unique_suffix}"
    client.post("/api/v1/auth/register", json={
        "username": valid_username,
        "email": f"valid_{unique_suffix}@testmsme.in",
        "full_name": "Valid User",
        "password": "StrongPassword2026!",
        "role": "BORROWER"
    })

    # Wrong password attempt
    login_fail = client.post("/api/v1/auth/login", json={
        "username": valid_username,
        "password": "WrongPassword999!"
    })
    assert login_fail.status_code == 401
    assert "Invalid username or password" in login_fail.json()["detail"]

def test_4_expired_jwt_rejection():
    """Security Proof 4: Expired JWT access tokens are rejected with 401 Unauthorized."""
    expired_token = create_access_token(
        data={"sub": "usr_expired_001", "username": "expired_user", "role": "BORROWER"},
        expires_delta=timedelta(seconds=-60)  # Expired 1 minute ago
    )
    resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert resp.status_code == 401
    assert "Invalid or expired access token" in resp.json()["detail"]

def test_5_invalid_jwt_rejection():
    """Security Proof 5: Forged or corrupted tokens are rejected with 401 Unauthorized."""
    forged_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsignature"
    resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {forged_token}"})
    assert resp.status_code == 401
    assert "Invalid or expired access token" in resp.json()["detail"]

def test_6_revoked_refresh_token_rejection():
    """Security Proof 6: Refresh token rotation revokes old tokens; revoked tokens return 401."""
    # Login as demo user
    login_resp = client.post("/api/v1/auth/demo-login", json={"persona_key": "PERSONA_RAMESH"})
    first_refresh = login_resp.json()["refresh_token"]

    # 1. First refresh succeeds and rotates token
    rot1_resp = client.post("/api/v1/auth/refresh", json={"refresh_token": first_refresh})
    assert rot1_resp.status_code == 200
    second_refresh = rot1_resp.json()["refresh_token"]
    assert second_refresh != first_refresh

    # 2. Replay attack: Using the already-revoked first refresh token fails with 401
    replay_resp = client.post("/api/v1/auth/refresh", json={"refresh_token": first_refresh})
    assert replay_resp.status_code == 401
    assert "Invalid, expired, or revoked refresh token" in replay_resp.json()["detail"]

    # 3. Explicit logout revokes all refresh tokens
    logout_resp = client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": second_refresh},
        headers={"Authorization": f"Bearer {rot1_resp.json()['access_token']}"}
    )
    assert logout_resp.status_code == 200

    # 4. Using the revoked second refresh token fails with 401
    post_logout_resp = client.post("/api/v1/auth/refresh", json={"refresh_token": second_refresh})
    assert post_logout_resp.status_code == 401

def test_7_borrower_accessing_another_borrowers_data():
    """Security Proof 7: Borrower attempting cross-tenant access to another MSME receives 403 Forbidden."""
    ramesh_login = client.post("/api/v1/auth/demo-login", json={"persona_key": "PERSONA_RAMESH"})
    ramesh_token = ramesh_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {ramesh_token}"}

    # Ramesh (Kirana Kanpur) attempts to submit application for Priya (Apex Global Tex Surat)
    resp = client.post(
        "/api/v1/auth/applications",
        json={
            "business_id": "msme_trading_surat_002",
            "facility_type": "UNSECURED_WORKING_CAPITAL_LINE",
            "requested_amount": 250000.00
        },
        headers=headers
    )
    assert resp.status_code == 403
    assert "Cross-tenant access forbidden" in resp.json()["detail"]

def test_8_lender_accessing_unauthorized_application():
    """Security Proof 8: Lender attempting to access application without consent/assignment receives 403."""
    other_lender_id = f"usr_other_{uuid.uuid4().hex[:6]}"
    user_repo.create_user(
        id=other_lender_id,
        username=f"other_lender_{uuid.uuid4().hex[:6]}",
        email=f"other_{uuid.uuid4().hex[:6]}@bank.in",
        full_name="Other Lender Officer",
        password_hash=hash_password("Password123!"),
        role="LENDER"
    )

    # Create application for Priya's business assigned to other lender
    app_id = f"APP-TEST-{uuid.uuid4().hex[:6]}"
    application_repo.create(
        app_id=app_id,
        business_id="msme_trading_surat_002",
        applicant_user_id="usr_priya_002",
        assigned_lender_id=other_lender_id,  # Assigned to other lender
        requested_amount=Decimal("500000.00")
    )

    # Vikram (Senior Credit Officer) has no consent and is not assigned
    vikram_user = {
        "id": "usr_vikram_003",
        "username": "vikram",
        "role": "LENDER_OFFICER",
        "business_id": None
    }

    # verify_application_access raises 403 Forbidden
    with pytest.raises(HTTPException) as exc_info:
        verify_application_access(app_id, vikram_user)
    assert exc_info.value.status_code == 403
    assert "lacks active borrower consent" in exc_info.value.detail or "not assigned" in exc_info.value.detail

def test_9_borrower_attempting_admin_endpoints():
    """Security Proof 9: Borrower attempting to access admin endpoints receives 403 Forbidden."""
    ramesh_login = client.post("/api/v1/auth/demo-login", json={"persona_key": "PERSONA_RAMESH"})
    token = ramesh_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt to access user directory
    resp_users = client.get("/api/v1/auth/users", headers=headers)
    assert resp_users.status_code == 403
    assert "Access forbidden" in resp_users.json()["detail"]

    # Attempt to view audit logs
    resp_logs = client.get("/api/v1/auth/audit-logs", headers=headers)
    assert resp_logs.status_code == 403

def test_10_lender_attempting_admin_endpoints():
    """Security Proof 10: Lender attempting to manage users or access admin logs receives 403 Forbidden."""
    vikram_login = client.post("/api/v1/auth/demo-login", json={"persona_key": "PERSONA_VIKRAM"})
    token = vikram_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt to deactivate a user
    resp = client.patch(
        "/api/v1/auth/users/usr_ramesh_001/status",
        json={"is_active": False},
        headers=headers
    )
    assert resp.status_code == 403
    assert "Access forbidden" in resp.json()["detail"]

def test_11_inactive_account_access_rejection():
    """Security Proof 11: Inactive/suspended user accounts are rejected on login and token verification."""
    unique_suffix = uuid.uuid4().hex[:6]
    username = f"inactive_{unique_suffix}"
    email = f"inactive_{unique_suffix}@testmsme.in"
    password = "StrongPassword2026!"

    # 1. Register active user
    reg_resp = client.post("/api/v1/auth/register", json={
        "username": username,
        "email": email,
        "full_name": "Suspended Merchant",
        "password": password,
        "role": "BORROWER"
    })
    token = reg_resp.json()["access_token"]
    user_id = reg_resp.json()["user"]["id"]

    # 2. Admin suspends the user
    admin_login = client.post("/api/v1/auth/demo-login", json={"persona_key": "SUPER_ADMIN"})
    admin_headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}

    deact_resp = client.patch(
        f"/api/v1/auth/users/{user_id}/status",
        json={"is_active": False},
        headers=admin_headers
    )
    assert deact_resp.status_code == 200
    assert deact_resp.json()["is_active"] is False

    # 3. Login attempt with suspended account fails with 401
    login_attempt = client.post("/api/v1/auth/login", json={
        "username": username,
        "password": password
    })
    assert login_attempt.status_code == 401
    assert "deactivated" in login_attempt.json()["detail"]

    # 4. Token verification fails for suspended account
    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 401
    assert "deactivated" in me_resp.json()["detail"]

def test_12_consent_revocation_preventing_unauthorized_access():
    """Security Proof 12: Consent revocation immediately prevents unauthorized lender data access."""
    biz_id = f"msme_consent_{uuid.uuid4().hex[:6]}"
    lender_user = {
        "id": "usr_lender_audit_1",
        "username": "lender_audit",
        "role": "LENDER_OFFICER"
    }

    # Initially: No consent -> access with enforce_consent=True raises 403
    with pytest.raises(HTTPException) as exc1:
        verify_tenant_access(biz_id, lender_user, enforce_consent=True)
    assert exc1.value.status_code == 403

    # Grant consent
    consent = consent_repo.grant(
        user_id="usr_borrower_owner",
        business_id=biz_id,
        data_provider="ACCOUNT_AGGREGATOR",
        purpose="Credit Assessment",
        data_fields_granted=["BANK_STATEMENTS"],
        expires_in_days=30
    )

    # Now access with enforce_consent=True succeeds
    verify_tenant_access(biz_id, lender_user, enforce_consent=True)

    # Revoke consent
    consent_repo.revoke(consent.id)

    # Access with enforce_consent=True raises 403 immediately
    with pytest.raises(HTTPException) as exc2:
        verify_tenant_access(biz_id, lender_user, enforce_consent=True)
    assert exc2.value.status_code == 403

def test_13_cross_tenant_assessment_isolation():
    """Security Proof 13: Borrowers cannot view assessments belonging to other enterprises."""
    eval_id = f"eval_secret_{uuid.uuid4().hex[:6]}"
    biz_owner = "msme_kirana_kanpur_001"
    biz_intruder = "msme_trading_surat_002"

    # Save assessment for biz_owner
    assessment_repo.save(CreditAppraisalMemo(
        assessment_id=eval_id,
        business_id=biz_owner,
        generated_at=utc_now(),
        assessment_status="INDICATIVE_RECOMMENDATION",
        financial_risk_band="LOW_RISK",
        evidence_confidence_score=95.0,
        investigation_status="NORMAL_PATTERNS",
        recommended_loan_amount_inr=Decimal("200000.00"),
        recommended_tenure_months=12,
        indicative_apr_range="13.5%",
        recommended_facility_type="UNSECURED_WORKING_CAPITAL_LINE",
        positive_credit_factors=["Strong cashflow"],
        risk_factors_and_vulnerabilities=[],
        recommended_covenants_and_mitigants=[],
        assumptions=[],
        data_limitations=[],
        evidence_references=[],
        calculation_version="1.0.0",
        cam_narrative_markdown="Confidential CAM"
    ))

    # Borrower from different business attempts to view assessment
    intruder_user = {
        "id": "usr_intruder",
        "username": "intruder_borrower",
        "role": "BORROWER",
        "business_id": biz_intruder
    }

    with pytest.raises(HTTPException) as exc_info:
        verify_assessment_access(eval_id, intruder_user)
    assert exc_info.value.status_code == 403
    assert "Cross-tenant access forbidden" in exc_info.value.detail
