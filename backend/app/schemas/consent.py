from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Literal, Any
from datetime import datetime, timezone

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

ConsentProvider = Literal[
    "ACCOUNT_AGGREGATOR",
    "GSTN",
    "NPCI_UPI",
    "DIGILOCKER",
    "BANK_DIRECT_API",
    "MANUAL_DOCUMENT_VERIFICATION"
]

ConsentStatus = Literal[
    "ACTIVE",
    "REVOKED",
    "EXPIRED"
]

class ConsentGrantRequest(BaseModel):
    business_id: str
    data_provider: str = Field(..., description="ACCOUNT_AGGREGATOR, GSTN, NPCI_UPI, DIGILOCKER")
    purpose: str = "MSME Cash-Flow Underwriting & Working Capital Assessment"
    consent_scope: List[str] = Field(
        default_factory=lambda: ["TRANSACTIONS", "TURNOVER_SUMMARY", "CASHFLOW_METRICS"],
        description="Specific scopes: TRANSACTIONS, TURNOVER_SUMMARY, CASHFLOW_METRICS, GST_RETURNS, IDENTITY_KYC, DEBT_PROFILE"
    )
    data_fields_granted: Optional[List[str]] = None # alias
    expires_in_days: int = 30
    consent_version: str = "v1.0"

class ConsentRecordOut(BaseModel):
    id: str
    user_id: str
    business_id: str
    data_provider: str
    purpose: str
    consent_scope: List[str]
    data_fields_granted: List[str]
    status: str
    consent_version: str = "v1.0"
    granted_at: datetime
    expires_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None
    is_expired: bool = False

class EvidenceAuditRecordOut(BaseModel):
    id: str
    business_id: str
    document_name: str
    document_type: str
    provenance: str  # INDEPENDENTLY_VERIFIED, SOURCE_LABELLED, SELF_REPORTED, USER_UPLOADED
    record_count: Optional[int] = None
    file_hash: Optional[str] = None
    upload_timestamp: datetime
    status: str

class ConsentValidationResult(BaseModel):
    is_authorized: bool
    reason: str
    business_id: str
    user_id: str
    role: str
    active_consent_id: Optional[str] = None
    granted_scopes: List[str] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=utc_now)

class AuditLogEventOut(BaseModel):
    id: str
    actor_user_id: str
    actor_role: str
    action: str
    resource_type: str
    resource_id: str
    request_id: Optional[str] = None
    outcome: str = "SUCCESS"
    details: Optional[str] = None
    structured_metadata: Optional[Dict[str, Any]] = None
    timestamp: datetime
