import pytest
from decimal import Decimal
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.security import create_access_token, hash_password
from backend.app.db.session import get_db, SessionLocal
from backend.app.db.models import UserModel, BusinessModel, LoanApplicationModel
from backend.app.db.repositories import (
    user_repo, business_repo, application_repo, audit_repo
)

client = TestClient(app)

@pytest.fixture
def auth_headers():
    user_id = f"test_usr_{uuid.uuid4().hex[:6]}"
    token = create_access_token({"sub": user_id, "role": "ADMIN", "email": "admin@udyoga.test"})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def lender_headers():
    user_id = f"test_lender_{uuid.uuid4().hex[:6]}"
    token = create_access_token({"sub": user_id, "role": "LENDER", "email": "lender@udyoga.test"})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def borrower_headers():
    user_id = f"test_borrower_{uuid.uuid4().hex[:6]}"
    token = create_access_token({"sub": user_id, "role": "BORROWER", "email": "borrower@udyoga.test"})
    return {"Authorization": f"Bearer {token}"}

def test_demo_persona_logins():
    """Verify all demo personas authenticate and return valid tokens with assigned roles."""
    # Sunita (Auditor / Ethics)
    res_sunita = client.post("/api/v1/auth/demo-login", json={"persona_key": "PERSONA_SUNITA"})
    assert res_sunita.status_code == 200, res_sunita.text
    data_sunita = res_sunita.json()
    assert "access_token" in data_sunita
    assert data_sunita["role"] == "ETHICS_AUDITOR"

    # Priya (Borrower Growth)
    res_priya = client.post("/api/v1/auth/demo-login", json={"persona_key": "PERSONA_PRIYA"})
    assert res_priya.status_code == 200
    data_priya = res_priya.json()
    assert data_priya["role"] == "BORROWER_GROWTH"

    # Vikram (Lender Officer)
    res_vikram = client.post("/api/v1/auth/demo-login", json={"persona_key": "PERSONA_VIKRAM"})
    assert res_vikram.status_code == 200
    data_vikram = res_vikram.json()
    assert data_vikram["role"] == "LENDER_OFFICER"

    # Auditor
    res_auditor = client.post("/api/v1/auth/demo-login", json={"persona_key": "PERSONA_AUDITOR"})
    assert res_auditor.status_code == 200
    assert res_auditor.json()["role"] == "ETHICS_AUDITOR"

def test_business_profile_update_and_persistence(borrower_headers):
    """Verify business profile PUT endpoint updates SQLite-persisted business details."""
    # 1. Create initial profile
    create_payload = {
        "legal_name": "Kavitha Textiles Private Limited",
        "trade_name": "Kavitha Textiles",
        "sector": "TEXTILE_WEAVING",
        "vintage_months": 36,
        "location_tier": "TIER_2",
        "entity_type": "PROPRIETORSHIP",
        "declared_monthly_turnover": "150000.00",
        "declared_existing_monthly_emi": "5000.00"
    }
    res_create = client.post("/api/v1/business/profile", json=create_payload)
    assert res_create.status_code in [200, 201], res_create.text
    created_biz = res_create.json()
    created_id = created_biz["business_id"]

    # 2. Update profile with new turnover and trade name
    update_payload = {
        "trade_name": "Kavitha Handloom & Textiles",
        "declared_monthly_turnover": "220000.00",
        "declared_existing_monthly_emi": "8000.00"
    }
    res_update = client.put(f"/api/v1/business/profile/{created_id}", json=update_payload)
    assert res_update.status_code == 200, res_update.text
    data_updated = res_update.json()
    assert data_updated["trade_name"] == "Kavitha Handloom & Textiles"
    assert Decimal(str(data_updated["declared_monthly_turnover"])) == Decimal("220000.00")
    assert Decimal(str(data_updated["declared_existing_monthly_emi"])) == Decimal("8000.00")

    # 3. Fetch from GET endpoint to confirm persistence
    res_get = client.get(f"/api/v1/business/profile/{created_id}")
    assert res_get.status_code == 200
    persisted = res_get.json()
    assert persisted["business_id"] == created_id
    assert persisted["trade_name"] == "Kavitha Handloom & Textiles"

def test_business_profile_validation_rejects_negative_turnover():
    """Verify that negative financial values are rejected at schema validation level."""
    create_payload = {
        "legal_name": "Validation Test Co",
        "trade_name": "Val Test",
        "sector": "RETAIL_KIRANA",
        "vintage_months": 12,
        "location_tier": "TIER_1",
        "entity_type": "PROPRIETORSHIP",
        "declared_monthly_turnover": "100000.00",
        "declared_existing_monthly_emi": "2000.00"
    }
    res_create = client.post("/api/v1/business/profile", json=create_payload)
    assert res_create.status_code in [200, 201]
    biz_id = res_create.json()["business_id"]

    # Negative turnover should fail with 422
    update_payload = {
        "declared_monthly_turnover": "-50000.00"
    }
    res = client.put(f"/api/v1/business/profile/{biz_id}", json=update_payload)
    assert res.status_code == 422

def test_application_lifecycle_and_status_update(lender_headers, borrower_headers):
    """Verify application status updates by lenders/admins with RBAC boundaries and FK integrity."""
    app_id = f"app_test_{uuid.uuid4().hex[:8]}"
    user_id = f"usr_test_{uuid.uuid4().hex[:6]}"

    # Setup parent user
    user_repo.create_user(
        id=user_id,
        username=f"u_{uuid.uuid4().hex[:6]}",
        email=f"borrower_{uuid.uuid4().hex[:6]}@test.com",
        full_name="Lakshmi Devi",
        password_hash=hash_password("Pass123!"),
        role="BORROWER"
    )

    # Setup parent business via API so it exists in both BUSINESS_STORE and SQLite
    biz_res = client.post("/api/v1/business/profile", json={
        "legal_name": "Lakshmi Silks Pvt Ltd",
        "trade_name": "Lakshmi Silks",
        "sector": "TEXTILE_WEAVING",
        "vintage_months": 48,
        "location_tier": "TIER_2",
        "entity_type": "PROPRIETORSHIP",
        "declared_monthly_turnover": "350000.00",
        "declared_existing_monthly_emi": "15000.00"
    })
    assert biz_res.status_code in [200, 201]
    biz_id = biz_res.json()["business_id"]

    # 1. Create loan application
    app_record = application_repo.create(
        app_id=app_id,
        business_id=biz_id,
        applicant_user_id=user_id,
        requested_amount=Decimal("350000.00")
    )
    assert app_record.status == "SUBMITTED"

    # 2. Borrower cannot update status (RBAC boundary)
    res_borrower = client.put(
        f"/api/v1/auth/applications/{app_id}/status",
        json={"status": "APPROVED", "remarks": "Self-approval attempt"},
        headers=borrower_headers
    )
    assert res_borrower.status_code == 403

    # 3. Lender approves application
    res_approve = client.put(
        f"/api/v1/auth/applications/{app_id}/status",
        json={"status": "APPROVED", "remarks": "Sanctioned under Prime MSME Program"},
        headers=lender_headers
    )
    assert res_approve.status_code == 200, res_approve.text
    app_data = res_approve.json()
    assert app_data["status"] == "APPROVED"

    # 4. Verify persistence in DB
    refetched = application_repo.get(app_id)
    assert refetched is not None
    assert refetched.status == "APPROVED"

    # 5. Invalid status transition rejected
    res_invalid = client.put(
        f"/api/v1/auth/applications/{app_id}/status",
        json={"status": "SUPER_APPROVED", "remarks": "Invalid"},
        headers=lender_headers
    )
    assert res_invalid.status_code == 400

def test_admin_user_status_management(auth_headers):
    """Verify Admin can toggle user active/suspended status with immediate enforcement."""
    user_id = f"usr_test_{uuid.uuid4().hex[:6]}"
    username = f"user_{uuid.uuid4().hex[:6]}"
    email = f"{username}@udyoga.test"
    
    # Create user directly
    user_repo.create_user(
        id=user_id,
        username=username,
        email=email,
        full_name="Rajesh Kumar",
        password_hash=hash_password("SecurePass123!"),
        role="BORROWER"
    )

    # 1. Admin suspends user via PUT
    res_suspend = client.put(
        f"/api/v1/auth/users/{user_id}/status",
        json={"is_active": False},
        headers=auth_headers
    )
    assert res_suspend.status_code == 200
    assert res_suspend.json()["is_active"] is False

    # 2. Suspended user login fails
    res_login = client.post("/api/v1/auth/login", json={"username": email, "password": "SecurePass123!"})
    assert res_login.status_code in [400, 401, 403]
    assert "deactivated or suspended" in res_login.json()["detail"].lower()

    # 3. Admin reactivates user via PUT
    res_activate = client.put(
        f"/api/v1/auth/users/{user_id}/status",
        json={"is_active": True},
        headers=auth_headers
    )
    assert res_activate.status_code == 200
    assert res_activate.json()["is_active"] is True
