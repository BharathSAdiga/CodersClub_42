import bcrypt
import jwt
import secrets
import hashlib
import re
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import logging

from .config import settings

logger = logging.getLogger(__name__)

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

def validate_password_strength(plain_password: str) -> Optional[str]:
    """
    Validates password strength according to enterprise security policy.
    Requirements:
    - Minimum length: 8 characters
    - At least one alphabet character
    - At least one numeric digit or special character
    Returns None if valid, or an explanatory error string if invalid.
    """
    if not plain_password or len(plain_password) < settings.PASSWORD_MIN_LENGTH:
        return f"Password must be at least {settings.PASSWORD_MIN_LENGTH} characters long."
    if not re.search(r"[a-zA-Z]", plain_password):
        return "Password must contain at least one alphabet letter."
    if not re.search(r"[\d\W_]", plain_password):
        return "Password must contain at least one number or special character."
    return None

def hash_password(plain_password: str) -> str:
    """Hash a plaintext password using bcrypt with random salt (12 rounds)."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception as e:
        logger.warning(f"Password verification failed: {e}")
        return False

def generate_refresh_token() -> str:
    """Generate a cryptographically secure random refresh token."""
    return secrets.token_urlsafe(64)

def hash_token(raw_token: str) -> str:
    """Compute SHA-256 hash of a raw token for secure database storage."""
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token with issuer, audience, and expiry."""
    to_encode = data.copy()
    now = utc_now()
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({
        "exp": expire,
        "iat": now,
        "iss": settings.JWT_ISSUER,
        "aud": settings.JWT_AUDIENCE
    })
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode and validate a JWT access token.
    Validates signature, expiration, and optional issuer/audience claims.
    """
    try:
        # Verify signature and expiration strictly; allow backwards compatibility with tokens missing iss/aud
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_signature": True, "verify_exp": True, "verify_aud": False, "verify_iss": False}
        )
        # If iss or aud are present, verify them
        if "iss" in payload and payload["iss"] != settings.JWT_ISSUER:
            logger.warning(f"JWT issuer mismatch: expected '{settings.JWT_ISSUER}', got '{payload['iss']}'")
            return None
        if "aud" in payload and payload["aud"] != settings.JWT_AUDIENCE:
            logger.warning(f"JWT audience mismatch: expected '{settings.JWT_AUDIENCE}', got '{payload['aud']}'")
            return None
        return payload
    except jwt.ExpiredSignatureError:
        logger.info("Access token has expired.")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid access token: {e}")
        return None

DEMO_PERSONAS = {
    "PERSONA_RAMESH": {
        "id": "usr_ramesh_001",
        "username": "ramesh",
        "email": "ramesh.kumar@kirana.udyoga.in",
        "full_name": "Ramesh Kumar (Kirana Store Owner)",
        "role": "BORROWER_MICRO",
        "business_id": "msme_kirana_kanpur_001",
        "default_password": "password123",
        "is_active": True
    },
    "PERSONA_PRIYA": {
        "id": "usr_priya_002",
        "username": "priya",
        "email": "priya.patel@surattex.udyoga.in",
        "full_name": "Priya Patel (Precision Auto Ancillary)",
        "role": "BORROWER_GROWTH",
        "business_id": "msme_trading_surat_002",
        "default_password": "password123",
        "is_active": True
    },
    "PERSONA_VIKRAM": {
        "id": "usr_vikram_003",
        "username": "vikram",
        "email": "vikram.malhotra@bank.udyoga.in",
        "full_name": "Vikram Malhotra (Senior Credit Officer)",
        "role": "LENDER_OFFICER",
        "business_id": None,
        "default_password": "password123",
        "is_active": True
    },
    "PERSONA_AUDITOR": {
        "id": "usr_auditor_004",
        "username": "auditor",
        "email": "ananya.sharma@ethics.udyoga.in",
        "full_name": "Dr. Ananya Sharma (Independent Ethics & Fair-Lending Auditor)",
        "role": "ETHICS_AUDITOR",
        "business_id": None,
        "default_password": "password123",
        "is_active": True
    },
    "SUPER_ADMIN": {
        "id": "usr_admin_000",
        "username": "admin",
        "email": "admin@udyoga.org",
        "full_name": "Platform Administrator",
        "role": "SUPER_ADMIN",
        "business_id": None,
        "default_password": "adminpassword123",
        "is_active": True
    }
}

# Alias PERSONA_SUNITA to PERSONA_AUDITOR for seamless hackathon persona evaluation
DEMO_PERSONAS["PERSONA_SUNITA"] = DEMO_PERSONAS["PERSONA_AUDITOR"]
