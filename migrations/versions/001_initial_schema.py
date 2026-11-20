"""001_initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-11-20

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. users
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("username", sa.String(length=64), nullable=False, unique=True),
        sa.Column("full_name", sa.String(length=128), nullable=False),
        sa.Column("password_hash", sa.String(length=256), nullable=False),
        sa.Column("role", sa.String(length=32), nullable=False, server_default="BORROWER_MICRO"),
        sa.Column("business_id", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_users_username", "users", ["username"], unique=True)
    op.create_index("ix_users_business_id", "users", ["business_id"])

    # 2. businesses
    op.create_table(
        "businesses",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("legal_name", sa.String(length=256), nullable=False),
        sa.Column("trade_name", sa.String(length=256), nullable=False),
        sa.Column("sector", sa.String(length=64), nullable=False),
        sa.Column("vintage_months", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("location_tier", sa.String(length=32), nullable=False, server_default="TIER_2"),
        sa.Column("entity_type", sa.String(length=32), nullable=False, server_default="PROPRIETORSHIP"),
        sa.Column("declared_monthly_turnover", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("declared_existing_monthly_emi", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("monthly_operating_expenses", sa.Numeric(precision=14, scale=2), nullable=False, server_default="0.0"),
        sa.Column("has_gstin", sa.Boolean(), server_default="0"),
        sa.Column("gstin", sa.String(length=32), nullable=True),
        sa.Column("has_udyam_registration", sa.Boolean(), server_default="0"),
        sa.Column("udyam_reg_number", sa.String(length=64), nullable=True),
        sa.Column("is_synthetic", sa.Boolean(), server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_businesses_sector", "businesses", ["sector"])

    # 3. transactions
    op.create_table(
        "transactions",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("business_id", sa.String(length=64), sa.ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False),
        sa.Column("timestamp", sa.DateTime(), nullable=False),
        sa.Column("amount", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("direction", sa.String(length=16), nullable=False),
        sa.Column("channel", sa.String(length=32), nullable=False),
        sa.Column("counterparty_id", sa.String(length=64), nullable=True),
        sa.Column("counterparty_name", sa.String(length=128), nullable=True),
        sa.Column("category", sa.String(length=64), nullable=False, server_default="UNCATEGORIZED"),
        sa.Column("narration", sa.String(length=256), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("idx_tx_business_timestamp", "transactions", ["business_id", "timestamp"])

    # 4. assessments
    op.create_table(
        "assessments",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("business_id", sa.String(length=64), sa.ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False),
        sa.Column("generated_at", sa.DateTime(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("assessment_status", sa.String(length=64), nullable=False),
        sa.Column("financial_risk_band", sa.String(length=32), nullable=False),
        sa.Column("evidence_confidence_score", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("investigation_status", sa.String(length=64), nullable=False),
        sa.Column("recommended_loan_amount_inr", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("maximum_safe_emi", sa.Numeric(precision=14, scale=2), nullable=False, server_default="0.0"),
        sa.Column("recommended_tenure_months", sa.Integer(), nullable=False),
        sa.Column("indicative_apr_range", sa.String(length=64), nullable=False),
        sa.Column("recommended_facility_type", sa.String(length=64), nullable=False),
        sa.Column("cam_narrative_markdown", sa.Text(), nullable=False),
        sa.Column("is_fallback_rule_based", sa.Boolean(), server_default="0"),
        sa.Column("payload_json", sa.Text(), nullable=False),
    )
    op.create_index("ix_assessments_business_id", "assessments", ["business_id"])

    # 5. agent_events
    op.create_table(
        "agent_events",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("assessment_id", sa.String(length=64), nullable=False),
        sa.Column("business_id", sa.String(length=64), nullable=False),
        sa.Column("agent_name", sa.String(length=64), nullable=False),
        sa.Column("step_name", sa.String(length=64), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("timestamp", sa.DateTime(), nullable=True),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("execution_duration_ms", sa.Integer(), nullable=True),
        sa.Column("structured_payload_json", sa.Text(), nullable=True),
    )
    op.create_index("idx_events_assessment_ts", "agent_events", ["assessment_id", "timestamp"])

    # 6. evidence_records
    op.create_table(
        "evidence_records",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("business_id", sa.String(length=64), sa.ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False),
        sa.Column("document_name", sa.String(length=128), nullable=False),
        sa.Column("document_type", sa.String(length=64), nullable=False),
        sa.Column("provenance", sa.String(length=64), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=True, server_default="1.0"),
        sa.Column("record_count", sa.Integer(), nullable=True),
        sa.Column("file_hash", sa.String(length=64), nullable=True),
        sa.Column("upload_timestamp", sa.DateTime(), nullable=True),
        sa.Column("status", sa.String(length=32), server_default="VERIFIED"),
    )
    op.create_index("ix_evidence_records_business_id", "evidence_records", ["business_id"])

    # 7. consent_records
    op.create_table(
        "consent_records",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("business_id", sa.String(length=64), nullable=False),
        sa.Column("data_provider", sa.String(length=64), nullable=False),
        sa.Column("purpose", sa.String(length=256), nullable=False),
        sa.Column("data_fields_granted", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="ACTIVE"),
        sa.Column("granted_at", sa.DateTime(), nullable=True),
        sa.Column("expires_at", sa.DateTime(), nullable=True),
        sa.Column("revoked_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_consent_records_business_id", "consent_records", ["business_id"])

    # 8. debt_obligations
    op.create_table(
        "debt_obligations",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("business_id", sa.String(length=64), sa.ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False),
        sa.Column("lender_name", sa.String(length=128), nullable=False),
        sa.Column("amount", sa.Numeric(precision=14, scale=2), nullable=True),
        sa.Column("monthly_payment", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("source", sa.String(length=64), nullable=False),
        sa.Column("is_matched", sa.Boolean(), server_default="0"),
        sa.Column("matched_reference_id", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_debt_obligations_business_id", "debt_obligations", ["business_id"])

def downgrade() -> None:
    op.drop_table("debt_obligations")
    op.drop_table("consent_records")
    op.drop_table("evidence_records")
    op.drop_table("agent_events")
    op.drop_table("assessments")
    op.drop_table("transactions")
    op.drop_table("businesses")
    op.drop_table("users")
