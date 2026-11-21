from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Literal, List
from datetime import datetime, timezone
from decimal import Decimal

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

UserRole = Literal[
    "BORROWER",
    "LENDER",
    "ADMIN",
    "BORROWER_MICRO",
    "BORROWER_GROWTH",
    "LENDER_OFFICER",
    "LENDER_MANAGER",
    "ETHICS_AUDITOR",
    "SUPER_ADMIN"
]

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=64, description="Unique username")
    email: str = Field(..., description="Valid unique email address")
    full_name: str = Field(..., min_length=2, max_length=128, description="Legal full name")
    password: str = Field(..., min_length=8, max_length=128, description="Password adhering to enterprise security policy")
    role: str = Field(default="BORROWER", description="Requested role: BORROWER, LENDER, or ADMIN")
    business_id: Optional[str] = Field(default=None, description="MSME business profile identifier if borrower")

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=128, description="Username or email address")
    password: str = Field(..., min_length=4, max_length=128)

class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="Cryptographically secure refresh token")

class DemoLoginRequest(BaseModel):
    persona_key: str = Field(
        ...,
        description="Demo persona key, e.g. PERSONA_RAMESH, PERSONA_PRIYA, PERSONA_VIKRAM, PERSONA_AUDITOR, SUPER_ADMIN"
    )

class UserOut(BaseModel):
    id: str
    username: str
    email: Optional[str] = None
    full_name: str
    role: str
    business_id: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    username: str
    full_name: str
    role: str
    business_id: Optional[str] = None
    expires_in: int
    user: Optional[UserOut] = None

class UserStatusUpdateRequest(BaseModel):
    is_active: bool = Field(..., description="True to activate, False to suspend")

class UserRoleUpdateRequest(BaseModel):
    role: str = Field(..., description="New role assignment")

class ApplicationStatusUpdateRequest(BaseModel):
    status: str = Field(..., description="New status: SUBMITTED, UNDER_REVIEW, APPROVED, DECLINED")


class AuditLogOut(BaseModel):
    id: str
    user_id: str
    username: Optional[str] = None
    role: str
    business_id: str
    resource_type: str
    action: str
    correlation_id: Optional[str] = None
    details: Optional[str] = None
    timestamp: datetime

class ApplicationCreateRequest(BaseModel):
    business_id: str
    facility_type: str = "UNSECURED_WORKING_CAPITAL_LINE"
    requested_amount: Decimal = Field(..., ge=1000)

class ApplicationOut(BaseModel):
    id: str
    business_id: str
    applicant_user_id: Optional[str] = None
    assigned_lender_id: Optional[str] = None
    facility_type: Optional[str] = None
    requested_amount: Optional[Decimal] = None
    status: str
    created_at: datetime
    updated_at: datetime
