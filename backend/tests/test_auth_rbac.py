import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from backend.app.core.auth_deps import verify_tenant_access
from backend.app.db import init_db
from fastapi import HTTPException

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    init_db()

def test_password_hashing_and_verification():
    """Verify that bcrypt hashes are salted, non-plaintext, and verify accurately."""
    pwd = "UltraSecurePassword99!"
    hashed = hash_password(pwd)
    assert hashed != pwd
    assert hashed.startswith("$2b$") or hashed.startswith("$2a$")
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False

def test_jwt_token_generation_and_decoding():
    """Verify signed JWT generation, claim preservation, and decoding."""
    claims = {
        "sub": "usr_test_123",
        "username": "testuser",
        "role": "LENDER_OFFICER"
    }
    token = create_access_token(claims)
    assert isinstance(token, str)
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "usr_test_123"
    assert decoded["username"] == "testuser"
    assert decoded["role"] == "LENDER_OFFICER"

def test_login_endpoint_success():
    """Verify that seeded demo users can log in with their credentials."""
    resp = client.post("/api/v1/auth/login", json={
        "username": "ramesh",
        "password": "password123"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] == "BORROWER_MICRO"
    assert data["business_id"] == "msme_kirana_kanpur_001"

def test_login_endpoint_invalid_password():
    """Verify that invalid passwords return 401 Unauthorized."""
    resp = client.post("/api/v1/auth/login", json={
        "username": "ramesh",
        "password": "incorrect_password"
    })
    assert resp.status_code == 401
    assert "Invalid username or password" in resp.json()["detail"]

def test_demo_login_personas():
    """Verify 1-click hackathon persona logins for all key personas."""
    personas = [
        ("PERSONA_RAMESH", "ramesh", "BORROWER_MICRO"),
        ("PERSONA_PRIYA", "priya", "BORROWER_GROWTH"),
        ("PERSONA_VIKRAM", "vikram", "LENDER_OFFICER"),
        ("PERSONA_AUDITOR", "auditor", "ETHICS_AUDITOR"),
        ("SUPER_ADMIN", "admin", "SUPER_ADMIN")
    ]
    for key, expected_user, expected_role in personas:
        resp = client.post("/api/v1/auth/demo-login", json={"persona_key": key})
        assert resp.status_code == 200, f"Failed for persona {key}"
        body = resp.json()
        assert body["username"] == expected_user
        assert body["role"] == expected_role
        assert len(body["access_token"]) > 20

def test_auth_me_endpoint():
    """Verify that /api/v1/auth/me resolves the caller's JWT identity."""
    login_resp = client.post("/api/v1/auth/demo-login", json={"persona_key": "PERSONA_RAMESH"})
    token = login_resp.json()["access_token"]

    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    user_data = me_resp.json()
    assert user_data["username"] == "ramesh"
    assert user_data["role"] == "BORROWER_MICRO"
    assert user_data["business_id"] == "msme_kirana_kanpur_001"

def test_cross_tenant_access_isolation():
    """Verify that borrowers cannot access records of another business (Cross-Tenant Protection)."""
    # Ramesh is bound to 'msme_kirana_kanpur_001'
    borrower_user = {
        "id": "usr_ramesh",
        "role": "BORROWER_MICRO",
        "business_id": "msme_kirana_kanpur_001"
    }

    # Ramesh accessing own business succeeds
    verify_tenant_access("msme_kirana_kanpur_001", borrower_user)

    # Ramesh accessing Priya's business must raise 403 Forbidden
    with pytest.raises(HTTPException) as excinfo:
        verify_tenant_access("msme_trading_surat_002", borrower_user)
    assert excinfo.value.status_code == 403
    assert "Cross-tenant access forbidden" in excinfo.value.detail

    # Lender officer accessing any business is allowed
    lender_user = {
        "id": "usr_vikram",
        "role": "LENDER_OFFICER",
        "business_id": None
    }
    verify_tenant_access("msme_trading_surat_002", lender_user)
