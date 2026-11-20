from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime, timezone

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

ConsentProvider = Literal[
    "ACCOUNT_AGGREGATOR",
    "GSTN",
    "NPCI_UPI",
    "DIGILOCKER"
]

ConsentStatus = Literal[
    "ACTIVE",
    "REVOKED",
    "EXPIRED"
]

class ConsentGrantRequest(BaseModel):
    business_id: str
    data_provider: ConsentProvider
    purpose: str = "MSME Cash-Flow Underwriting & Working Capital Assessment"
    data_fields_granted: List[str] = Field(default_factory=lambda: ["TRANSACTIONS", "TURNOVER_SUMMARY"])
    expires_in_days: int = 30

class ConsentRecordOut(BaseModel):
    id: str
    user_id: str
    business_id: str
    data_provider: str
    purpose: str
    data_fields_granted: List[str]
    status: str
    granted_at: datetime
    expires_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None

class EvidenceAuditRecordOut(BaseModel):
    id: str
    business_id: str
    document_name: str
    document_type: str
    provenance: str  # INDEPENDENTLY_VERIFIED, SOURCE_LABELLED, SELF_REPORTED
    record_count: Optional[int] = None
    file_hash: Optional[str] = None
    upload_timestamp: datetime
    status: str
