from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    Numeric,
    Text,
    ForeignKey,
    Index
)
from sqlalchemy.orm import relationship
from .session import Base

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=True)
    full_name = Column(String(128), nullable=False)
    password_hash = Column(String(256), nullable=False)
    role = Column(String(32), nullable=False, default="BORROWER")
    business_id = Column(String(64), nullable=True, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    last_login_at = Column(DateTime, nullable=True)

    refresh_tokens = relationship("RefreshTokenModel", back_populates="user", cascade="all, delete-orphan")

class BusinessModel(Base):
    __tablename__ = "businesses"

    id = Column(String(64), primary_key=True)
    legal_name = Column(String(256), nullable=False)
    trade_name = Column(String(256), nullable=False)
    sector = Column(String(64), nullable=False, index=True)
    vintage_months = Column(Integer, nullable=False, default=0)
    location_tier = Column(String(32), nullable=False, default="TIER_2")
    entity_type = Column(String(32), nullable=False, default="PROPRIETORSHIP")
    declared_monthly_turnover = Column(Numeric(14, 2), nullable=False, default=Decimal("0.0"))
    declared_existing_monthly_emi = Column(Numeric(14, 2), nullable=False, default=Decimal("0.0"))
    monthly_operating_expenses = Column(Numeric(14, 2), nullable=False, default=Decimal("0.0"))
    has_gstin = Column(Boolean, default=False)
    gstin = Column(String(32), nullable=True)
    has_udyam_registration = Column(Boolean, default=False)
    udyam_reg_number = Column(String(64), nullable=True)
    is_synthetic = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    transactions = relationship("TransactionModel", back_populates="business", cascade="all, delete-orphan")
    assessments = relationship("AssessmentModel", back_populates="business", cascade="all, delete-orphan")
    evidence_records = relationship("EvidenceRecordModel", back_populates="business", cascade="all, delete-orphan")
    debt_obligations = relationship("DebtObligationModel", back_populates="business", cascade="all, delete-orphan")

class TransactionModel(Base):
    __tablename__ = "transactions"

    id = Column(String(64), primary_key=True)
    business_id = Column(String(64), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    amount = Column(Numeric(14, 2), nullable=False)
    direction = Column(String(16), nullable=False)  # CREDIT / DEBIT
    channel = Column(String(32), nullable=False)    # UPI_QR, NEFT_RTGS, IMPS, etc.
    counterparty_id = Column(String(64), nullable=True, index=True)
    counterparty_name = Column(String(128), nullable=True)
    category = Column(String(64), nullable=False, default="UNCATEGORIZED")
    narration = Column(String(256), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    business = relationship("BusinessModel", back_populates="transactions")

    __table_args__ = (
        Index("idx_tx_business_timestamp", "business_id", "timestamp"),
    )

class AssessmentModel(Base):
    __tablename__ = "assessments"

    id = Column(String(64), primary_key=True)
    business_id = Column(String(64), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    generated_at = Column(DateTime, default=utc_now, index=True)
    assessment_status = Column(String(64), nullable=False)
    financial_risk_band = Column(String(32), nullable=False)
    evidence_confidence_score = Column(Float, nullable=False, default=0.0)
    investigation_status = Column(String(64), nullable=False)
    recommended_loan_amount_inr = Column(Numeric(14, 2), nullable=False, default=Decimal("0.0"))
    maximum_safe_emi = Column(Numeric(14, 2), nullable=False, default=Decimal("0.0"))
    recommended_tenure_months = Column(Integer, nullable=False, default=0)
    indicative_apr_range = Column(String(64), nullable=False, default="N/A")
    recommended_facility_type = Column(String(64), nullable=False)
    cam_narrative_markdown = Column(Text, nullable=False)
    is_fallback_rule_based = Column(Boolean, default=False)
    payload_json = Column(Text, nullable=False)  # Full serialized CreditAppraisalMemo
    completed_at = Column(DateTime, nullable=True)

    business = relationship("BusinessModel", back_populates="assessments")

class AgentEventModel(Base):
    __tablename__ = "agent_events"

    id = Column(String(64), primary_key=True)
    assessment_id = Column(String(64), nullable=False, index=True)
    business_id = Column(String(64), nullable=False, index=True)
    agent_name = Column(String(64), nullable=False)
    step_name = Column(String(64), nullable=False)
    status = Column(String(32), nullable=False)
    timestamp = Column(DateTime, default=utc_now)
    message = Column(Text, nullable=False)
    execution_duration_ms = Column(Integer, nullable=True)
    structured_payload_json = Column(Text, nullable=True)

    __table_args__ = (
        Index("idx_events_assessment_ts", "assessment_id", "timestamp"),
    )

class EvidenceRecordModel(Base):
    __tablename__ = "evidence_records"

    id = Column(String(64), primary_key=True)
    business_id = Column(String(64), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    document_name = Column(String(128), nullable=False)
    document_type = Column(String(64), nullable=False)
    provenance = Column(String(64), nullable=False)  # INDEPENDENTLY_VERIFIED, SOURCE_LABELLED, SELF_REPORTED
    confidence = Column(Float, nullable=True, default=1.0)
    record_count = Column(Integer, nullable=True)
    file_hash = Column(String(64), nullable=True)
    upload_timestamp = Column(DateTime, default=utc_now)
    status = Column(String(32), default="VERIFIED")

    business = relationship("BusinessModel", back_populates="evidence_records")

class ConsentRecordModel(Base):
    __tablename__ = "consent_records"

    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), nullable=False, index=True)
    business_id = Column(String(64), nullable=False, index=True)
    data_provider = Column(String(64), nullable=False)  # ACCOUNT_AGGREGATOR, GSTN, NPCI_UPI, DIGILOCKER
    purpose = Column(String(256), nullable=False)
    data_fields_granted = Column(Text, nullable=False)  # JSON array string
    status = Column(String(32), nullable=False, default="ACTIVE")  # ACTIVE, REVOKED, EXPIRED
    granted_at = Column(DateTime, default=utc_now)
    expires_at = Column(DateTime, nullable=True)
    revoked_at = Column(DateTime, nullable=True)

class DebtObligationModel(Base):
    __tablename__ = "debt_obligations"

    id = Column(String(64), primary_key=True)
    business_id = Column(String(64), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    lender_name = Column(String(128), nullable=False)
    amount = Column(Numeric(14, 2), nullable=True)
    monthly_payment = Column(Numeric(14, 2), nullable=False)
    source = Column(String(64), nullable=False)  # DECLARED, VERIFIED_BANK_DEBIT
    is_matched = Column(Boolean, default=False)
    matched_reference_id = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    business = relationship("BusinessModel", back_populates="debt_obligations")

class RefreshTokenModel(Base):
    __tablename__ = "refresh_tokens"

    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(256), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_revoked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=utc_now)
    revoked_at = Column(DateTime, nullable=True)
    replaced_by = Column(String(64), nullable=True)

    user = relationship("UserModel", back_populates="refresh_tokens")

class LoanApplicationModel(Base):
    __tablename__ = "loan_applications"

    id = Column(String(64), primary_key=True)
    business_id = Column(String(64), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    applicant_user_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    assigned_lender_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    facility_type = Column(String(64), nullable=True, default="UNSECURED_WORKING_CAPITAL_LINE")
    requested_amount = Column(Numeric(14, 2), nullable=True)
    status = Column(String(32), default="SUBMITTED", nullable=False)  # SUBMITTED, IN_REVIEW, APPROVED, REJECTED
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    business = relationship("BusinessModel")

class AuditAccessLogModel(Base):
    __tablename__ = "audit_access_logs"

    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), nullable=False, index=True)
    username = Column(String(64), nullable=True)
    role = Column(String(32), nullable=False)
    business_id = Column(String(64), nullable=False, index=True)
    resource_type = Column(String(64), nullable=False)  # FINANCIAL_DATA, ASSESSMENT, EVIDENCE, TRANSACTIONS, APPLICATION
    action = Column(String(64), nullable=False)         # READ, WRITE, RUN_UNDERWRITING, REVOKE
    correlation_id = Column(String(64), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=utc_now, index=True)

