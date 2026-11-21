from typing import List, Optional, Dict, Any, Tuple
from decimal import Decimal
import json
import logging
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, text

from .session import engine, SessionLocal, Base
from .models import (
    BusinessModel,
    TransactionModel,
    AssessmentModel,
    AgentEventModel,
    EvidenceRecordModel,
    ConsentRecordModel,
    DebtObligationModel,
    UserModel,
    RefreshTokenModel,
    LoanApplicationModel,
    AuditAccessLogModel
)
from ..schemas.business import BusinessProfile
from ..schemas.transaction import Transaction, TransactionIngestSummary
from ..schemas.assessment import CreditAppraisalMemo
from ..schemas.agent import AgentEvent

logger = logging.getLogger(__name__)

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class BusinessRepository:
    def __init__(self, session: Optional[Session] = None):
        self._session = session

    def _get_session(self) -> Session:
        return self._session if self._session else SessionLocal()

    def get(self, business_id: str) -> Optional[BusinessProfile]:
        db = self._get_session()
        try:
            row = db.query(BusinessModel).filter(BusinessModel.id == business_id).first()
            if not row:
                return None
            return BusinessProfile(
                business_id=row.id,
                legal_name=row.legal_name,
                trade_name=row.trade_name,
                sector=row.sector,
                vintage_months=row.vintage_months,
                location_tier=row.location_tier,
                entity_type=row.entity_type,
                declared_monthly_turnover=Decimal(str(row.declared_monthly_turnover)),
                declared_existing_monthly_emi=Decimal(str(row.declared_existing_monthly_emi)),
                has_gstin=row.has_gstin,
                gstin=row.gstin,
                has_udyam_registration=row.has_udyam_registration,
                udyam_reg_number=row.udyam_reg_number,
                is_synthetic=row.is_synthetic,
                created_at=row.created_at.replace(tzinfo=timezone.utc) if row.created_at else utc_now()
            )
        finally:
            if not self._session:
                db.close()

    def list_demo(self) -> List[BusinessProfile]:
        db = self._get_session()
        try:
            rows = db.query(BusinessModel).filter(BusinessModel.is_synthetic == True).all()
            return [
                BusinessProfile(
                    business_id=r.id,
                    legal_name=r.legal_name,
                    trade_name=r.trade_name,
                    sector=r.sector,
                    vintage_months=r.vintage_months,
                    location_tier=r.location_tier,
                    entity_type=r.entity_type,
                    declared_monthly_turnover=Decimal(str(r.declared_monthly_turnover)),
                    declared_existing_monthly_emi=Decimal(str(r.declared_existing_monthly_emi)),
                    has_gstin=r.has_gstin,
                    gstin=r.gstin,
                    has_udyam_registration=r.has_udyam_registration,
                    udyam_reg_number=r.udyam_reg_number,
                    is_synthetic=r.is_synthetic,
                    created_at=r.created_at.replace(tzinfo=timezone.utc) if r.created_at else utc_now()
                )
                for r in rows
            ]
        finally:
            if not self._session:
                db.close()

    def save(self, profile: BusinessProfile) -> BusinessProfile:
        db = self._get_session()
        try:
            existing = db.query(BusinessModel).filter(BusinessModel.id == profile.business_id).first()
            if existing:
                existing.legal_name = profile.legal_name
                existing.trade_name = profile.trade_name
                existing.sector = profile.sector
                existing.vintage_months = profile.vintage_months
                existing.location_tier = profile.location_tier
                existing.entity_type = profile.entity_type
                existing.declared_monthly_turnover = profile.declared_monthly_turnover
                existing.declared_existing_monthly_emi = profile.declared_existing_monthly_emi
                existing.has_gstin = profile.has_gstin
                existing.gstin = profile.gstin
                existing.has_udyam_registration = profile.has_udyam_registration
                existing.udyam_reg_number = profile.udyam_reg_number
                existing.is_synthetic = profile.is_synthetic
            else:
                new_row = BusinessModel(
                    id=profile.business_id,
                    legal_name=profile.legal_name,
                    trade_name=profile.trade_name,
                    sector=profile.sector,
                    vintage_months=profile.vintage_months,
                    location_tier=profile.location_tier,
                    entity_type=profile.entity_type,
                    declared_monthly_turnover=profile.declared_monthly_turnover,
                    declared_existing_monthly_emi=profile.declared_existing_monthly_emi,
                    has_gstin=profile.has_gstin,
                    gstin=profile.gstin,
                    has_udyam_registration=profile.has_udyam_registration,
                    udyam_reg_number=profile.udyam_reg_number,
                    is_synthetic=profile.is_synthetic,
                    created_at=profile.created_at
                )
                db.add(new_row)
            db.commit()
            return profile
        except Exception:
            db.rollback()
            raise
        finally:
            if not self._session:
                db.close()

class TransactionRepository:
    def __init__(self, session: Optional[Session] = None):
        self._session = session

    def _get_session(self) -> Session:
        return self._session if self._session else SessionLocal()

    def get_for_business(self, business_id: str) -> List[Transaction]:
        db = self._get_session()
        try:
            rows = db.query(TransactionModel).filter(TransactionModel.business_id == business_id).order_by(TransactionModel.timestamp.asc()).all()
            return [
                Transaction(
                    transaction_id=r.id,
                    business_id=r.business_id,
                    timestamp=r.timestamp.replace(tzinfo=timezone.utc) if r.timestamp else utc_now(),
                    amount=Decimal(str(r.amount)),
                    direction=r.direction,
                    channel=r.channel,
                    counterparty_id=r.counterparty_id,
                    counterparty_name=r.counterparty_name,
                    category=r.category,
                    narration=r.narration
                )
                for r in rows
            ]
        finally:
            if not self._session:
                db.close()

    def save_batch(self, business_id: str, transactions: List[Transaction]) -> List[Transaction]:
        db = self._get_session()
        try:
            # Ensure parent business exists to satisfy foreign key constraint
            biz = db.query(BusinessModel).filter(BusinessModel.id == business_id).first()
            if not biz:
                db.add(BusinessModel(
                    id=business_id,
                    legal_name=f"MSME {business_id}",
                    trade_name=f"MSME {business_id}",
                    sector="GENERAL_COMMERCE",
                    vintage_months=12,
                    location_tier="TIER_3",
                    entity_type="PROPRIETORSHIP",
                    declared_monthly_turnover=Decimal("0.0"),
                    declared_existing_monthly_emi=Decimal("0.0"),
                    has_gstin=False,
                    has_udyam_registration=False,
                    is_synthetic=False,
                    created_at=utc_now()
                ))
                db.flush()

            # Upsert transactions
            for tx in transactions:
                existing = db.query(TransactionModel).filter(TransactionModel.id == tx.transaction_id).first()
                if existing:
                    existing.business_id = business_id
                    existing.timestamp = tx.timestamp
                    existing.amount = tx.amount
                    existing.direction = tx.direction
                    existing.channel = tx.channel
                    existing.counterparty_id = tx.counterparty_id
                    existing.counterparty_name = tx.counterparty_name
                    existing.category = tx.category
                    existing.narration = tx.narration
                else:
                    row = TransactionModel(
                        id=tx.transaction_id,
                        business_id=business_id,
                        timestamp=tx.timestamp,
                        amount=tx.amount,
                        direction=tx.direction,
                        channel=tx.channel,
                        counterparty_id=tx.counterparty_id,
                        counterparty_name=tx.counterparty_name,
                        category=tx.category,
                        narration=tx.narration
                    )
                    db.add(row)
            db.commit()
            return transactions
        except Exception:
            db.rollback()
            raise
        finally:
            if not self._session:
                db.close()

    def save(self, tx: Transaction, raise_on_duplicate: bool = False) -> Transaction:
        """Saves a single transaction. Rejects duplicate transaction IDs safely if raise_on_duplicate is True."""
        db = self._get_session()
        try:
            existing = db.query(TransactionModel).filter(TransactionModel.id == tx.transaction_id).first()
            if existing:
                if raise_on_duplicate:
                    raise ValueError(f"Duplicate transaction ID '{tx.transaction_id}' already exists")
                existing.amount = tx.amount
                existing.direction = tx.direction
                existing.channel = tx.channel
                existing.counterparty_id = tx.counterparty_id
                existing.counterparty_name = tx.counterparty_name
                existing.category = tx.category
                existing.narration = tx.narration
            else:
                biz = db.query(BusinessModel).filter(BusinessModel.id == tx.business_id).first()
                if not biz:
                    db.add(BusinessModel(
                        id=tx.business_id,
                        legal_name=f"MSME {tx.business_id}",
                        trade_name=f"MSME {tx.business_id}",
                        sector="GENERAL_COMMERCE",
                        vintage_months=12,
                        location_tier="TIER_3",
                        entity_type="PROPRIETORSHIP",
                        declared_monthly_turnover=Decimal("0.0"),
                        declared_existing_monthly_emi=Decimal("0.0"),
                        has_gstin=False,
                        has_udyam_registration=False,
                        is_synthetic=False,
                        created_at=utc_now()
                    ))
                    db.flush()
                row = TransactionModel(
                    id=tx.transaction_id,
                    business_id=tx.business_id,
                    timestamp=tx.timestamp,
                    amount=tx.amount,
                    direction=tx.direction,
                    channel=tx.channel,
                    counterparty_id=tx.counterparty_id,
                    counterparty_name=tx.counterparty_name,
                    category=tx.category,
                    narration=tx.narration
                )
                db.add(row)
            db.commit()
            return tx
        except Exception:
            db.rollback()
            raise
        finally:
            if not self._session:
                db.close()

    def delete_for_business(self, business_id: str) -> int:
        db = self._get_session()
        try:
            count = db.query(TransactionModel).filter(TransactionModel.business_id == business_id).delete()
            db.commit()
            return count
        except Exception:
            db.rollback()
            raise
        finally:
            if not self._session:
                db.close()

    def get_summary(self, business_id: str) -> Optional[TransactionIngestSummary]:
        txs = self.get_for_business(business_id)
        if not txs:
            return None
        credits = [t for t in txs if t.direction == "CREDIT"]
        debits = [t for t in txs if t.direction == "DEBIT"]
        timestamps = [t.timestamp for t in txs]
        return TransactionIngestSummary(
            business_id=business_id,
            total_parsed=len(txs),
            credits_count=len(credits),
            debits_count=len(debits),
            total_credit_volume=sum((t.amount for t in credits), Decimal("0.0")),
            total_debit_volume=sum((t.amount for t in debits), Decimal("0.0")),
            start_date=min(timestamps) if timestamps else None,
            end_date=max(timestamps) if timestamps else None,
            coverage_days=max((max(timestamps) - min(timestamps)).days, 1) if (timestamps and len(timestamps) > 1) else 1
        )

class AssessmentRepository:
    def __init__(self, session: Optional[Session] = None):
        self._session = session

    def _get_session(self) -> Session:
        return self._session if self._session else SessionLocal()

    def get(self, assessment_id: str) -> Optional[CreditAppraisalMemo]:
        db = self._get_session()
        try:
            row = db.query(AssessmentModel).filter(AssessmentModel.id == assessment_id).first()
            if not row:
                return None
            data = json.loads(row.payload_json)
            data["assessment_status"] = row.assessment_status
            return CreditAppraisalMemo.model_validate(data)
        finally:
            if not self._session:
                db.close()

    def save(self, memo: CreditAppraisalMemo) -> CreditAppraisalMemo:
        db = self._get_session()
        try:
            existing = db.query(AssessmentModel).filter(AssessmentModel.id == memo.assessment_id).first()
            payload = memo.model_dump_json()
            if existing:
                existing.assessment_status = memo.assessment_status
                existing.financial_risk_band = memo.financial_risk_band
                existing.evidence_confidence_score = memo.evidence_confidence_score
                existing.investigation_status = memo.investigation_status
                existing.recommended_loan_amount_inr = memo.recommended_loan_amount_inr
                existing.recommended_tenure_months = memo.recommended_tenure_months
                existing.indicative_apr_range = memo.indicative_apr_range
                existing.recommended_facility_type = memo.recommended_facility_type
                existing.cam_narrative_markdown = memo.cam_narrative_markdown
                existing.is_fallback_rule_based = memo.is_fallback_rule_based
                existing.payload_json = payload
                existing.completed_at = utc_now()
            else:
                new_row = AssessmentModel(
                    id=memo.assessment_id,
                    business_id=memo.business_id,
                    generated_at=memo.generated_at,
                    completed_at=utc_now(),
                    assessment_status=memo.assessment_status,
                    financial_risk_band=memo.financial_risk_band,
                    evidence_confidence_score=memo.evidence_confidence_score,
                    investigation_status=memo.investigation_status,
                    recommended_loan_amount_inr=memo.recommended_loan_amount_inr,
                    recommended_tenure_months=memo.recommended_tenure_months,
                    indicative_apr_range=memo.indicative_apr_range,
                    recommended_facility_type=memo.recommended_facility_type,
                    cam_narrative_markdown=memo.cam_narrative_markdown,
                    is_fallback_rule_based=memo.is_fallback_rule_based,
                    payload_json=payload
                )
                db.add(new_row)
            db.commit()
            return memo
        except Exception:
            db.rollback()
            raise
        finally:
            if not self._session:
                db.close()

    def record_started(self, assessment_id: str, business_id: str) -> AssessmentModel:
        """Records initial RUNNING state for an assessment to ensure persistent recovery."""
        db = self._get_session()
        try:
            # Ensure business exists to satisfy foreign key constraint
            biz = db.query(BusinessModel).filter(BusinessModel.id == business_id).first()
            if not biz:
                db.add(BusinessModel(
                    id=business_id,
                    legal_name=f"MSME {business_id}",
                    trade_name=f"MSME {business_id}",
                    sector="GENERAL_COMMERCE",
                    vintage_months=12,
                    location_tier="TIER_3",
                    entity_type="PROPRIETORSHIP",
                    declared_monthly_turnover=Decimal("0.0"),
                    declared_existing_monthly_emi=Decimal("0.0"),
                    has_gstin=False,
                    has_udyam_registration=False,
                    is_synthetic=False,
                    created_at=utc_now()
                ))
                db.flush()

            now = utc_now()
            placeholder_memo = CreditAppraisalMemo(
                assessment_id=assessment_id,
                business_id=business_id,
                generated_at=now,
                assessment_status="HUMAN_REVIEW_REQUIRED",
                financial_risk_band="UNASSESSED",
                evidence_confidence_score=0.0,
                investigation_status="HUMAN_REVIEW_RECOMMENDED",
                recommended_loan_amount_inr=Decimal("0.0"),
                recommended_tenure_months=0,
                recommended_facility_type="NONE_RECOMMENDED",
                positive_credit_factors=[],
                risk_factors_and_vulnerabilities=[],
                recommended_covenants_and_mitigants=[],
                assumptions=["Assessment actively executing in background pipeline."],
                data_limitations=[],
                evidence_references=[],
                calculation_version="1.0.0",
                cam_narrative_markdown="### Assessment in Progress\n\nMulti-agent analysis is running.",
                is_fallback_rule_based=False
            )
            row = AssessmentModel(
                id=assessment_id,
                business_id=business_id,
                generated_at=now,
                completed_at=None,
                assessment_status="RUNNING",
                financial_risk_band="UNASSESSED",
                evidence_confidence_score=0.0,
                investigation_status="HUMAN_REVIEW_RECOMMENDED",
                recommended_loan_amount_inr=Decimal("0.0"),
                recommended_tenure_months=0,
                indicative_apr_range="N/A",
                recommended_facility_type="NONE_RECOMMENDED",
                cam_narrative_markdown="Assessment actively running.",
                is_fallback_rule_based=False,
                payload_json=placeholder_memo.model_dump_json()
            )
            db.add(row)
            db.commit()
            return row
        except Exception:
            db.rollback()
            raise
        finally:
            if not self._session:
                db.close()

    def recover_interrupted_assessments(self) -> int:
        """
        Scans for assessments left in RUNNING, QUEUED, or IN_PROGRESS states
        without a completed_at timestamp (e.g. from server restart or crash)
        and transitions them to FAILED_INTERRUPTED so they do not spin indefinitely.
        """
        db = self._get_session()
        try:
            stuck_rows = db.query(AssessmentModel).filter(
                AssessmentModel.assessment_status.in_(["RUNNING", "QUEUED", "IN_PROGRESS"]),
                AssessmentModel.completed_at.is_(None)
            ).all()

            count = len(stuck_rows)
            for row in stuck_rows:
                row.assessment_status = "FAILED_INTERRUPTED"
                row.financial_risk_band = "UNASSESSED"
                row.completed_at = utc_now()
                row.cam_narrative_markdown = (
                    "### Assessment Execution Interrupted\n\n"
                    "This assessment was interrupted by a backend server restart or worker shutdown. "
                    "Please re-trigger the evaluation to obtain fresh multi-agent findings."
                )
                try:
                    memo_dict = json.loads(row.payload_json)
                    memo_dict["assessment_status"] = "FAILED_INTERRUPTED"
                    memo_dict["financial_risk_band"] = "UNASSESSED"
                    memo_dict["cam_narrative_markdown"] = row.cam_narrative_markdown
                    row.payload_json = json.dumps(memo_dict)
                except Exception:
                    pass

            if count > 0:
                db.commit()
            return count
        except Exception:
            db.rollback()
            raise
        finally:
            if not self._session:
                db.close()

    def get_for_business(self, business_id: str) -> List[CreditAppraisalMemo]:
        db = self._get_session()
        try:
            rows = db.query(AssessmentModel).filter(
                AssessmentModel.business_id == business_id
            ).order_by(AssessmentModel.generated_at.desc()).all()
            return [CreditAppraisalMemo.model_validate(json.loads(r.payload_json)) for r in rows]
        finally:
            if not self._session:
                db.close()

class AgentEventRepository:
    def __init__(self, session: Optional[Session] = None):
        self._session = session

    def _get_session(self) -> Session:
        return self._session if self._session else SessionLocal()

    def save(self, event: AgentEvent) -> AgentEventModel:
        db = self._get_session()
        try:
            row = AgentEventModel(
                id=event.event_id or f"evt_{uuid.uuid4().hex[:10]}",
                assessment_id=event.assessment_id,
                business_id=event.business_id,
                agent_name=event.agent_name,
                step_name=event.step_name,
                status=event.status,
                timestamp=event.timestamp or utc_now(),
                message=event.message,
                execution_duration_ms=event.execution_duration_ms,
                structured_payload_json=json.dumps(
                    getattr(event, "structured_payload", getattr(event, "structured_findings", None))
                ) if getattr(event, "structured_payload", getattr(event, "structured_findings", None)) is not None else None
            )
            db.add(row)
            db.commit()
            return row
        except Exception:
            db.rollback()
            raise
        finally:
            if not self._session:
                db.close()

    def get_for_assessment(self, assessment_id: str) -> List[AgentEventModel]:
        db = self._get_session()
        try:
            return db.query(AgentEventModel).filter(
                AgentEventModel.assessment_id == assessment_id
            ).order_by(AgentEventModel.timestamp.asc()).all()
        finally:
            if not self._session:
                db.close()

class EvidenceRepository:
    def __init__(self, session: Optional[Session] = None):
        self._session = session

    def _get_session(self) -> Session:
        return self._session if self._session else SessionLocal()

    def record_evidence(
        self,
        business_id: str,
        document_name: str,
        document_type: str,
        provenance: str = "USER_UPLOADED",
        record_count: Optional[int] = None,
        file_hash: Optional[str] = None,
        uploaded_by: Optional[str] = None,
        evidence_type: Optional[str] = None,
        source_type: Optional[str] = None,
        source_name: Optional[str] = None,
        provenance_category: Optional[str] = None,
        verification_status: str = "PENDING",
        confidence_score: float = 0.75,
        completeness: float = 1.0,
        consistency: float = 1.0,
        recency: float = 1.0,
        file_reference: Optional[str] = None,
        related_assessment_ids: Optional[List[str]] = None
    ) -> EvidenceRecordModel:
        db = self._get_session()
        try:
            biz = db.query(BusinessModel).filter(BusinessModel.id == business_id).first()
            if not biz:
                db.add(BusinessModel(
                    id=business_id,
                    legal_name=f"MSME {business_id}",
                    trade_name=f"MSME {business_id}",
                    sector="GENERAL_COMMERCE",
                    vintage_months=12,
                    location_tier="TIER_3",
                    entity_type="PROPRIETORSHIP",
                    declared_monthly_turnover=Decimal("0.0"),
                    declared_existing_monthly_emi=Decimal("0.0"),
                    has_gstin=False,
                    has_udyam_registration=False,
                    is_synthetic=False,
                    created_at=utc_now()
                ))
                db.flush()

            actual_prov = provenance_category or provenance or "USER_UPLOADED"
            legacy_prov = provenance or provenance_category or "USER_UPLOADED"
            now = utc_now()
            record = EvidenceRecordModel(
                id=f"evd_{uuid.uuid4().hex[:12]}",
                business_id=business_id,
                uploaded_by=uploaded_by,
                evidence_type=evidence_type or document_type or "BANK_STATEMENT",
                source_type=source_type or "FILE_UPLOAD",
                source_name=source_name or document_name,
                provenance_category=actual_prov,
                verification_status=verification_status,
                confidence_score=confidence_score,
                completeness=completeness,
                consistency=consistency,
                recency=recency,
                uploaded_at=now,
                last_reviewed_at=None,
                file_reference=file_reference or document_name,
                related_assessment_ids=json.dumps(related_assessment_ids or []),
                document_name=document_name,
                document_type=document_type,
                provenance=legacy_prov,
                confidence=confidence_score,
                record_count=record_count,
                file_hash=file_hash,
                upload_timestamp=now,
                status=verification_status
            )
            db.add(record)
            db.commit()
            return record
        except Exception:
            db.rollback()
            raise
        finally:
            if not self._session:
                db.close()

    def get(self, evidence_id: str) -> Optional[EvidenceRecordModel]:
        db = self._get_session()
        try:
            return db.query(EvidenceRecordModel).filter(EvidenceRecordModel.id == evidence_id).first()
        finally:
            if not self._session:
                db.close()

    def update_verification_status(
        self,
        evidence_id: str,
        verification_status: str,
        confidence_score: Optional[float] = None,
        last_reviewed_at: Optional[datetime] = None
    ) -> Optional[EvidenceRecordModel]:
        db = self._get_session()
        try:
            rec = db.query(EvidenceRecordModel).filter(EvidenceRecordModel.id == evidence_id).first()
            if rec:
                rec.verification_status = verification_status
                rec.status = verification_status
                if confidence_score is not None:
                    rec.confidence_score = confidence_score
                    rec.confidence = confidence_score
                rec.last_reviewed_at = last_reviewed_at or utc_now()
                db.commit()
                return rec
            return None
        except Exception:
            db.rollback()
            raise
        finally:
            if not self._session:
                db.close()

    def link_assessment(self, evidence_id: str, assessment_id: str) -> bool:
        db = self._get_session()
        try:
            rec = db.query(EvidenceRecordModel).filter(EvidenceRecordModel.id == evidence_id).first()
            if rec:
                current_ids = json.loads(rec.related_assessment_ids or "[]")
                if assessment_id not in current_ids:
                    current_ids.append(assessment_id)
                    rec.related_assessment_ids = json.dumps(current_ids)
                    db.commit()
                return True
            return False
        finally:
            if not self._session:
                db.close()

    def list_for_business(self, business_id: str) -> List[EvidenceRecordModel]:
        db = self._get_session()
        try:
            return db.query(EvidenceRecordModel).filter(
                EvidenceRecordModel.business_id == business_id
            ).order_by(EvidenceRecordModel.upload_timestamp.desc()).all()
        finally:
            if not self._session:
                db.close()

class ConsentRepository:
    def __init__(self, session: Optional[Session] = None):
        self._session = session

    def _get_session(self) -> Session:
        return self._session if self._session else SessionLocal()

    def grant(
        self,
        user_id: str,
        business_id: str,
        data_provider: str,
        purpose: str,
        data_fields_granted: List[str],
        expires_in_days: int = 30,
        consent_version: str = "v1.0"
    ) -> ConsentRecordModel:
        db = self._get_session()
        try:
            now = utc_now()
            scope_json = json.dumps(data_fields_granted)
            record = ConsentRecordModel(
                id=f"cst_{uuid.uuid4().hex[:12]}",
                user_id=user_id,
                business_id=business_id,
                data_provider=data_provider,
                purpose=purpose,
                consent_scope=scope_json,
                data_fields_granted=scope_json,
                status="ACTIVE",
                consent_version=consent_version,
                granted_at=now,
                expires_at=now + timedelta(days=expires_in_days),
                revoked_at=None
            )
            db.add(record)
            db.commit()
            return record
        except Exception:
            db.rollback()
            raise
        finally:
            if not self._session:
                db.close()

    def revoke(self, consent_id: str, user_id: Optional[str] = None) -> bool:
        db = self._get_session()
        try:
            q = db.query(ConsentRecordModel).filter(ConsentRecordModel.id == consent_id)
            if user_id:
                q = q.filter(ConsentRecordModel.user_id == user_id)
            record = q.first()
            if not record or record.status == "REVOKED":
                return False
            record.status = "REVOKED"
            record.revoked_at = utc_now()
            db.commit()
            return True
        except Exception:
            db.rollback()
            raise
        finally:
            if not self._session:
                db.close()

    def get_active_for_business(self, business_id: str) -> List[ConsentRecordModel]:
        db = self._get_session()
        try:
            now = utc_now()
            all_active = db.query(ConsentRecordModel).filter(
                ConsentRecordModel.business_id == business_id,
                ConsentRecordModel.status == "ACTIVE"
            ).all()
            # Automatically filter out and mark expired consents
            valid_active = []
            for c in all_active:
                if c.expires_at:
                    exp = c.expires_at.replace(tzinfo=timezone.utc) if c.expires_at.tzinfo is None else c.expires_at
                    if exp < now:
                        c.status = "EXPIRED"
                        db.commit()
                        continue
                valid_active.append(c)
            return valid_active
        finally:
            if not self._session:
                db.close()

    def get_history_for_business(self, business_id: str) -> List[ConsentRecordModel]:
        db = self._get_session()
        try:
            now = utc_now()
            records = db.query(ConsentRecordModel).filter(
                ConsentRecordModel.business_id == business_id
            ).order_by(ConsentRecordModel.granted_at.desc()).all()
            # Update expired in place if needed
            for c in records:
                if c.status == "ACTIVE" and c.expires_at:
                    exp = c.expires_at.replace(tzinfo=timezone.utc) if c.expires_at.tzinfo is None else c.expires_at
                    if exp < now:
                        c.status = "EXPIRED"
            db.commit()
            return records
        finally:
            if not self._session:
                db.close()

    def validate_lender_access(
        self,
        business_id: str,
        lender_user_id: str,
        required_scope: Optional[str] = None
    ) -> tuple[bool, str]:
        """
        Validates whether a lender has legitimate authority to access borrower records.
        Authority is granted if:
        1. An active loan application assigns this lender to this business, OR
        2. The borrower has granted active, unexpired consent covering the scope.
        """
        db = self._get_session()
        try:
            # 1. Check assigned application
            assigned_app = db.query(LoanApplicationModel).filter(
                LoanApplicationModel.business_id == business_id,
                LoanApplicationModel.assigned_lender_id == lender_user_id
            ).first()
            if assigned_app:
                return True, f"Authorized via assigned loan application '{assigned_app.id}'"

            # 2. Check active consent
            active_consents = self.get_active_for_business(business_id)
            if not active_consents:
                return False, "Access denied: No active borrower consent or loan application assignment found."

            if required_scope:
                has_scope = False
                for c in active_consents:
                    scopes = json.loads(c.consent_scope or c.data_fields_granted or "[]")
                    if required_scope in scopes or "*" in scopes or "ALL" in scopes:
                        has_scope = True
                        break
                if not has_scope:
                    return False, f"Access denied: Active consent exists but does not grant required scope '{required_scope}'."

            return True, f"Authorized via active borrower consent '{active_consents[0].id}'"
        finally:
            if not self._session:
                db.close()

class DebtObligationRepository:
    def __init__(self, session: Optional[Session] = None):
        self._session = session

    def _get_session(self) -> Session:
        return self._session if self._session else SessionLocal()

    def add(
        self,
        business_id: str,
        lender_name: str,
        monthly_payment: Decimal,
        amount: Optional[Decimal] = None,
        source: str = "DECLARED",
        is_matched: bool = False,
        matched_reference_id: Optional[str] = None
    ) -> DebtObligationModel:
        db = self._get_session()
        try:
            biz = db.query(BusinessModel).filter(BusinessModel.id == business_id).first()
            if not biz:
                db.add(BusinessModel(
                    id=business_id,
                    legal_name=f"MSME {business_id}",
                    trade_name=f"MSME {business_id}",
                    sector="GENERAL_COMMERCE",
                    vintage_months=12,
                    location_tier="TIER_3",
                    entity_type="PROPRIETORSHIP",
                    declared_monthly_turnover=Decimal("0.0"),
                    declared_existing_monthly_emi=Decimal("0.0"),
                    has_gstin=False,
                    has_udyam_registration=False,
                    is_synthetic=False,
                    created_at=utc_now()
                ))
                db.flush()

            record = DebtObligationModel(
                id=f"obl_{uuid.uuid4().hex[:12]}",
                business_id=business_id,
                lender_name=lender_name,
                amount=amount,
                monthly_payment=monthly_payment,
                source=source,
                is_matched=is_matched,
                matched_reference_id=matched_reference_id,
                created_at=utc_now()
            )
            db.add(record)
            db.commit()
            return record
        except Exception:
            db.rollback()
            raise
        finally:
            if not self._session:
                db.close()

    def get_for_business(self, business_id: str) -> List[DebtObligationModel]:
        db = self._get_session()
        try:
            return db.query(DebtObligationModel).filter(
                DebtObligationModel.business_id == business_id
            ).all()
        finally:
            if not self._session:
                db.close()

    def delete_for_business(self, business_id: str) -> int:
        db = self._get_session()
        try:
            count = db.query(DebtObligationModel).filter(
                DebtObligationModel.business_id == business_id
            ).delete()
            db.commit()
            return count
        except Exception:
            db.rollback()
            raise
        finally:
            if not self._session:
                db.close()

class UserRepository:
    def __init__(self, session: Optional[Session] = None):
        self._session = session

    def _get_session(self) -> Session:
        return self._session if self._session else SessionLocal()

    def get_by_username(self, username: str) -> Optional[UserModel]:
        db = self._get_session()
        try:
            return db.query(UserModel).filter(UserModel.username == username).first()
        finally:
            if not self._session:
                db.close()

    def get_by_id(self, user_id: str) -> Optional[UserModel]:
        db = self._get_session()
        try:
            return db.query(UserModel).filter(UserModel.id == user_id).first()
        finally:
            if not self._session:
                db.close()

    def get_by_email(self, email: str) -> Optional[UserModel]:
        db = self._get_session()
        try:
            return db.query(UserModel).filter(UserModel.email == email.lower().strip()).first()
        finally:
            if not self._session:
                db.close()

    def get_by_username_or_email(self, identifier: str) -> Optional[UserModel]:
        db = self._get_session()
        try:
            clean = identifier.strip()
            return db.query(UserModel).filter(
                (UserModel.username == clean) | (UserModel.email == clean.lower())
            ).first()
        finally:
            if not self._session:
                db.close()

    def create_user(
        self,
        id: str,
        username: str,
        email: str,
        full_name: str,
        password_hash: str,
        role: str = "BORROWER",
        business_id: Optional[str] = None,
        is_active: bool = True
    ) -> UserModel:
        db = self._get_session()
        try:
            user = UserModel(
                id=id,
                username=username,
                email=email.lower().strip() if email else None,
                full_name=full_name,
                password_hash=password_hash,
                role=role,
                business_id=business_id,
                is_active=is_active,
                created_at=utc_now(),
                updated_at=utc_now()
            )
            db.add(user)
            db.commit()
            return user
        except Exception:
            db.rollback()
            raise
        finally:
            if not self._session:
                db.close()

    def update_last_login(self, user_id: str) -> None:
        db = self._get_session()
        try:
            user = db.query(UserModel).filter(UserModel.id == user_id).first()
            if user:
                user.last_login_at = utc_now()
                db.commit()
        finally:
            if not self._session:
                db.close()

    def set_active_status(self, user_id: str, is_active: bool) -> Optional[UserModel]:
        db = self._get_session()
        try:
            user = db.query(UserModel).filter(UserModel.id == user_id).first()
            if user:
                user.is_active = is_active
                user.updated_at = utc_now()
                db.commit()
                return user
            return None
        finally:
            if not self._session:
                db.close()

    def update_role(self, user_id: str, role: str) -> Optional[UserModel]:
        db = self._get_session()
        try:
            user = db.query(UserModel).filter(UserModel.id == user_id).first()
            if user:
                user.role = role
                user.updated_at = utc_now()
                db.commit()
                return user
            return None
        finally:
            if not self._session:
                db.close()

    def list_users(self, role: Optional[str] = None, limit: int = 100, offset: int = 0) -> List[UserModel]:
        db = self._get_session()
        try:
            q = db.query(UserModel)
            if role:
                q = q.filter(UserModel.role == role)
            return q.order_by(UserModel.created_at.desc()).offset(offset).limit(limit).all()
        finally:
            if not self._session:
                db.close()

    def seed_demo_users(self):
        from ..core.security import DEMO_PERSONAS, hash_password
        db = self._get_session()
        try:
            for key, p in DEMO_PERSONAS.items():
                existing = db.query(UserModel).filter(UserModel.username == p["username"]).first()
                if not existing:
                    hashed = hash_password(p["default_password"])
                    user = UserModel(
                        id=p["id"],
                        username=p["username"],
                        email=p.get("email"),
                        full_name=p["full_name"],
                        password_hash=hashed,
                        role=p["role"],
                        business_id=p["business_id"],
                        is_active=p.get("is_active", True),
                        created_at=utc_now(),
                        updated_at=utc_now()
                    )
                    db.add(user)
                else:
                    if not existing.email and p.get("email"):
                        existing.email = p.get("email")
                    if existing.is_active is None:
                        existing.is_active = True
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            if not self._session:
                db.close()

class RefreshTokenRepository:
    def __init__(self, session: Optional[Session] = None):
        self._session = session

    def _get_session(self) -> Session:
        return self._session if self._session else SessionLocal()

    def create(self, user_id: str, raw_token: str, expires_at: datetime) -> RefreshTokenModel:
        from ..core.security import hash_token
        db = self._get_session()
        try:
            token_row = RefreshTokenModel(
                id=f"rt_{uuid.uuid4().hex[:16]}",
                user_id=user_id,
                token_hash=hash_token(raw_token),
                expires_at=expires_at,
                is_revoked=False,
                created_at=utc_now()
            )
            db.add(token_row)
            db.commit()
            return token_row
        except Exception:
            db.rollback()
            raise
        finally:
            if not self._session:
                db.close()

    def get_valid(self, raw_token: str) -> Optional[RefreshTokenModel]:
        from ..core.security import hash_token
        db = self._get_session()
        try:
            h = hash_token(raw_token)
            row = db.query(RefreshTokenModel).filter(
                RefreshTokenModel.token_hash == h,
                RefreshTokenModel.is_revoked == False
            ).first()
            if not row:
                return None
            exp = row.expires_at.replace(tzinfo=timezone.utc) if row.expires_at.tzinfo is None else row.expires_at
            if exp < utc_now():
                row.is_revoked = True
                row.revoked_at = utc_now()
                db.commit()
                return None
            return row
        finally:
            if not self._session:
                db.close()

    def revoke(self, raw_token: str, replaced_by: Optional[str] = None) -> bool:
        from ..core.security import hash_token
        db = self._get_session()
        try:
            h = hash_token(raw_token)
            row = db.query(RefreshTokenModel).filter(RefreshTokenModel.token_hash == h).first()
            if row and not row.is_revoked:
                row.is_revoked = True
                row.revoked_at = utc_now()
                if replaced_by:
                    row.replaced_by = hash_token(replaced_by)
                db.commit()
                return True
            return False
        finally:
            if not self._session:
                db.close()

    def revoke_all_for_user(self, user_id: str) -> int:
        db = self._get_session()
        try:
            count = db.query(RefreshTokenModel).filter(
                RefreshTokenModel.user_id == user_id,
                RefreshTokenModel.is_revoked == False
            ).update({
                RefreshTokenModel.is_revoked: True,
                RefreshTokenModel.revoked_at: utc_now()
            })
            db.commit()
            return count
        finally:
            if not self._session:
                db.close()

class ApplicationRepository:
    def __init__(self, session: Optional[Session] = None):
        self._session = session

    def _get_session(self) -> Session:
        return self._session if self._session else SessionLocal()

    def create(
        self,
        app_id: str,
        business_id: str,
        applicant_user_id: Optional[str] = None,
        assigned_lender_id: Optional[str] = None,
        requested_amount: Optional[Decimal] = None,
        facility_type: str = "UNSECURED_WORKING_CAPITAL_LINE"
    ) -> LoanApplicationModel:
        db = self._get_session()
        try:
            row = LoanApplicationModel(
                id=app_id,
                business_id=business_id,
                applicant_user_id=applicant_user_id,
                assigned_lender_id=assigned_lender_id,
                requested_amount=requested_amount,
                facility_type=facility_type,
                status="SUBMITTED",
                created_at=utc_now(),
                updated_at=utc_now()
            )
            db.add(row)
            db.commit()
            return row
        except Exception:
            db.rollback()
            raise
        finally:
            if not self._session:
                db.close()

    def get(self, app_id: str) -> Optional[LoanApplicationModel]:
        db = self._get_session()
        try:
            return db.query(LoanApplicationModel).filter(LoanApplicationModel.id == app_id).first()
        finally:
            if not self._session:
                db.close()

    def get_for_business(self, business_id: str) -> List[LoanApplicationModel]:
        db = self._get_session()
        try:
            return db.query(LoanApplicationModel).filter(
                LoanApplicationModel.business_id == business_id
            ).order_by(LoanApplicationModel.created_at.desc()).all()
        finally:
            if not self._session:
                db.close()

    def get_for_lender(self, lender_user_id: str) -> List[LoanApplicationModel]:
        db = self._get_session()
        try:
            return db.query(LoanApplicationModel).filter(
                LoanApplicationModel.assigned_lender_id == lender_user_id
            ).order_by(LoanApplicationModel.created_at.desc()).all()
        finally:
            if not self._session:
                db.close()

    def list_all(self, limit: int = 100) -> List[LoanApplicationModel]:
        db = self._get_session()
        try:
            return db.query(LoanApplicationModel).order_by(LoanApplicationModel.created_at.desc()).limit(limit).all()
        finally:
            if not self._session:
                db.close()

    def assign_lender(self, app_id: str, lender_user_id: str) -> Optional[LoanApplicationModel]:
        db = self._get_session()
        try:
            row = db.query(LoanApplicationModel).filter(LoanApplicationModel.id == app_id).first()
            if row:
                row.assigned_lender_id = lender_user_id
                row.updated_at = utc_now()
                db.commit()
                return row
            return None
        finally:
            if not self._session:
                db.close()

class AuditAccessLogRepository:
    def __init__(self, session: Optional[Session] = None):
        self._session = session

    def _get_session(self) -> Session:
        return self._session if self._session else SessionLocal()

    def log_access(
        self,
        user_id: str,
        role: str,
        business_id: str,
        resource_type: str,
        action: str,
        username: Optional[str] = None,
        correlation_id: Optional[str] = None,
        details: Optional[str] = None,
        outcome: str = "SUCCESS",
        structured_metadata: Optional[Dict[str, Any]] = None
    ) -> AuditAccessLogModel:
        """
        Append-only audit log entry.
        Guarantees that sensitive credentials, passwords, and tokens are never logged.
        """
        db = self._get_session()
        try:
            safe_meta_str = json.dumps(structured_metadata) if structured_metadata else None
            log_entry = AuditAccessLogModel(
                id=f"audit_{uuid.uuid4().hex[:12]}",
                user_id=user_id,
                actor_user_id=user_id,
                username=username,
                role=role,
                actor_role=role,
                business_id=business_id,
                resource_id=business_id,
                resource_type=resource_type,
                action=action,
                correlation_id=correlation_id,
                request_id=correlation_id,
                outcome=outcome,
                details=details,
                structured_metadata=safe_meta_str,
                timestamp=utc_now()
            )
            db.add(log_entry)
            db.commit()
            return log_entry
        except Exception:
            db.rollback()
            raise
        finally:
            if not self._session:
                db.close()

    def get_logs_for_business(self, business_id: str, limit: int = 100) -> List[AuditAccessLogModel]:
        db = self._get_session()
        try:
            return db.query(AuditAccessLogModel).filter(
                (AuditAccessLogModel.business_id == business_id) |
                (AuditAccessLogModel.resource_id == business_id)
            ).order_by(AuditAccessLogModel.timestamp.desc()).limit(limit).all()
        finally:
            if not self._session:
                db.close()

    def list_system_logs(self, limit: int = 100, role: Optional[str] = None, action: Optional[str] = None) -> List[AuditAccessLogModel]:
        db = self._get_session()
        try:
            q = db.query(AuditAccessLogModel)
            if role:
                q = q.filter(AuditAccessLogModel.role == role)
            if action:
                q = q.filter(AuditAccessLogModel.action == action)
            return q.order_by(AuditAccessLogModel.timestamp.desc()).limit(limit).all()
        finally:
            if not self._session:
                db.close()

    def delete(self, *args, **kwargs):
        raise PermissionError("Audit trail is strictly immutable and append-only. Historical audit logs cannot be modified or deleted.")

def migrate_schema(target_engine=None):
    """Safely applies missing columns to existing SQLite tables without data loss."""
    bind_eng = target_engine or engine
    with bind_eng.connect() as conn:
        # Check users columns
        res = conn.execute(text("PRAGMA table_info(users);")).fetchall()
        cols = {r[1] for r in res}
        if cols:
            if "email" not in cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR(128);"))
            if "is_active" not in cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1;"))
            if "updated_at" not in cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN updated_at DATETIME;"))
            if "last_login_at" not in cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN last_login_at DATETIME;"))

        # Check businesses columns
        res = conn.execute(text("PRAGMA table_info(businesses);")).fetchall()
        cols = {r[1] for r in res}
        if cols:
            if "monthly_operating_expenses" not in cols:
                conn.execute(text("ALTER TABLE businesses ADD COLUMN monthly_operating_expenses NUMERIC(14, 2) DEFAULT 0.0;"))
            if "updated_at" not in cols:
                conn.execute(text("ALTER TABLE businesses ADD COLUMN updated_at DATETIME;"))

        # Check assessments columns
        res = conn.execute(text("PRAGMA table_info(assessments);")).fetchall()
        cols = {r[1] for r in res}
        if cols:
            if "maximum_safe_emi" not in cols:
                conn.execute(text("ALTER TABLE assessments ADD COLUMN maximum_safe_emi NUMERIC(14, 2) DEFAULT 0.0;"))
            if "completed_at" not in cols:
                conn.execute(text("ALTER TABLE assessments ADD COLUMN completed_at DATETIME;"))

        # Check transactions columns
        res = conn.execute(text("PRAGMA table_info(transactions);")).fetchall()
        cols = {r[1] for r in res}
        if cols:
            if "created_at" not in cols:
                conn.execute(text("ALTER TABLE transactions ADD COLUMN created_at DATETIME;"))

        # Check evidence_records columns
        res = conn.execute(text("PRAGMA table_info(evidence_records);")).fetchall()
        cols = {r[1] for r in res}
        if cols:
            if "confidence" not in cols:
                conn.execute(text("ALTER TABLE evidence_records ADD COLUMN confidence FLOAT DEFAULT 1.0;"))
            if "uploaded_by" not in cols:
                conn.execute(text("ALTER TABLE evidence_records ADD COLUMN uploaded_by VARCHAR(64);"))
            if "evidence_type" not in cols:
                conn.execute(text("ALTER TABLE evidence_records ADD COLUMN evidence_type VARCHAR(64) DEFAULT 'BANK_STATEMENT';"))
            if "source_type" not in cols:
                conn.execute(text("ALTER TABLE evidence_records ADD COLUMN source_type VARCHAR(64) DEFAULT 'FILE_UPLOAD';"))
            if "source_name" not in cols:
                conn.execute(text("ALTER TABLE evidence_records ADD COLUMN source_name VARCHAR(128);"))
            if "provenance_category" not in cols:
                conn.execute(text("ALTER TABLE evidence_records ADD COLUMN provenance_category VARCHAR(64) DEFAULT 'USER_UPLOADED';"))
            if "verification_status" not in cols:
                conn.execute(text("ALTER TABLE evidence_records ADD COLUMN verification_status VARCHAR(32) DEFAULT 'PENDING';"))
            if "confidence_score" not in cols:
                conn.execute(text("ALTER TABLE evidence_records ADD COLUMN confidence_score FLOAT DEFAULT 0.75;"))
            if "completeness" not in cols:
                conn.execute(text("ALTER TABLE evidence_records ADD COLUMN completeness FLOAT DEFAULT 1.0;"))
            if "consistency" not in cols:
                conn.execute(text("ALTER TABLE evidence_records ADD COLUMN consistency FLOAT DEFAULT 1.0;"))
            if "recency" not in cols:
                conn.execute(text("ALTER TABLE evidence_records ADD COLUMN recency FLOAT DEFAULT 1.0;"))
            if "uploaded_at" not in cols:
                conn.execute(text("ALTER TABLE evidence_records ADD COLUMN uploaded_at DATETIME;"))
            if "last_reviewed_at" not in cols:
                conn.execute(text("ALTER TABLE evidence_records ADD COLUMN last_reviewed_at DATETIME;"))
            if "file_reference" not in cols:
                conn.execute(text("ALTER TABLE evidence_records ADD COLUMN file_reference VARCHAR(256);"))
            if "related_assessment_ids" not in cols:
                conn.execute(text("ALTER TABLE evidence_records ADD COLUMN related_assessment_ids TEXT;"))

        # Check consent_records columns
        res = conn.execute(text("PRAGMA table_info(consent_records);")).fetchall()
        cols = {r[1] for r in res}
        if cols:
            if "consent_scope" not in cols:
                conn.execute(text("ALTER TABLE consent_records ADD COLUMN consent_scope TEXT;"))
            if "consent_version" not in cols:
                conn.execute(text("ALTER TABLE consent_records ADD COLUMN consent_version VARCHAR(32) DEFAULT 'v1.0';"))

        # Check audit_access_logs columns
        res = conn.execute(text("PRAGMA table_info(audit_access_logs);")).fetchall()
        cols = {r[1] for r in res}
        if cols:
            if "actor_user_id" not in cols:
                conn.execute(text("ALTER TABLE audit_access_logs ADD COLUMN actor_user_id VARCHAR(64);"))
            if "actor_role" not in cols:
                conn.execute(text("ALTER TABLE audit_access_logs ADD COLUMN actor_role VARCHAR(32);"))
            if "resource_id" not in cols:
                conn.execute(text("ALTER TABLE audit_access_logs ADD COLUMN resource_id VARCHAR(64);"))
            if "request_id" not in cols:
                conn.execute(text("ALTER TABLE audit_access_logs ADD COLUMN request_id VARCHAR(64);"))
            if "outcome" not in cols:
                conn.execute(text("ALTER TABLE audit_access_logs ADD COLUMN outcome VARCHAR(32) DEFAULT 'SUCCESS';"))
            if "structured_metadata" not in cols:
                conn.execute(text("ALTER TABLE audit_access_logs ADD COLUMN structured_metadata TEXT;"))

        # Check debt_obligations columns
        res = conn.execute(text("PRAGMA table_info(debt_obligations);")).fetchall()
        cols = {r[1] for r in res}
        if cols:
            if "amount" not in cols:
                conn.execute(text("ALTER TABLE debt_obligations ADD COLUMN amount NUMERIC(14, 2) DEFAULT 0.0;"))
            if "created_at" not in cols:
                conn.execute(text("ALTER TABLE debt_obligations ADD COLUMN created_at DATETIME;"))
        conn.commit()

# Database Initializer with Demo MSME and User Seeding
def init_db():
    """Initializes tables and seeds initial demo MSMEs and demo users if newly created."""
    Base.metadata.create_all(bind=engine)
    migrate_schema(engine)
    db = SessionLocal()
    try:
        from ..api.endpoints_business import DEMO_PROFILES
        biz_repo = BusinessRepository(db)
        for demo in DEMO_PROFILES:
            existing = db.query(BusinessModel).filter(BusinessModel.id == demo.business_id).first()
            if not existing:
                biz_repo.save(demo)
        
        user_repo_instance = UserRepository(db)
        user_repo_instance.seed_demo_users()

        # Recover any assessments interrupted by server restarts
        asmt_repo_instance = AssessmentRepository(db)
        recovered_count = asmt_repo_instance.recover_interrupted_assessments()
        if recovered_count > 0:
            import logging
            logging.getLogger("udyoga.db").info(f"Recovered {recovered_count} interrupted assessments on startup.")

        db.commit()
    finally:
        db.close()

# Module-level instances for direct injection
business_repo = BusinessRepository()
transaction_repo = TransactionRepository()
assessment_repo = AssessmentRepository()
agent_event_repo = AgentEventRepository()
evidence_repo = EvidenceRepository()
consent_repo = ConsentRepository()
debt_obligation_repo = DebtObligationRepository()
user_repo = UserRepository()
refresh_token_repo = RefreshTokenRepository()
application_repo = ApplicationRepository()
audit_repo = AuditAccessLogRepository()

class DatabaseBackedBusinessStore(dict):
    def __init__(self, repo: Optional[BusinessRepository] = None):
        super().__init__()
        self.repo = repo or business_repo

    def get(self, key, default=None):
        val = self.repo.get(key)
        if val is not None:
            return val
        return super().get(key, default)

    def __getitem__(self, key):
        val = self.repo.get(key)
        if val is not None:
            return val
        return super().__getitem__(key)

    def __setitem__(self, key, value):
        super().__setitem__(key, value)
        if isinstance(value, BusinessProfile):
            self.repo.save(value)

    def __contains__(self, key):
        if self.repo.get(key) is not None:
            return True
        return super().__contains__(key)

    def values(self):
        demos = self.repo.list_demo()
        merged = {b.business_id: b for b in demos}
        merged.update(super().copy())
        return list(merged.values())

class DatabaseBackedAssessmentStore(dict):
    def __init__(self, repo: Optional[AssessmentRepository] = None):
        super().__init__()
        self.repo = repo or assessment_repo

    def get(self, key, default=None):
        val = self.repo.get(key)
        if val is not None:
            return val
        return super().get(key, default)

    def __getitem__(self, key):
        val = self.repo.get(key)
        if val is not None:
            return val
        return super().__getitem__(key)

    def __setitem__(self, key, value):
        super().__setitem__(key, value)
        if isinstance(value, CreditAppraisalMemo):
            self.repo.save(value)

    def __contains__(self, key):
        if self.repo.get(key) is not None:
            return True
        return super().__contains__(key)

class DatabaseBackedTransactionStore(dict):
    def __init__(self, repo: Optional[TransactionRepository] = None):
        super().__init__()
        self.repo = repo or transaction_repo

    def get(self, key, default=None):
        txs = self.repo.get_for_business(key)
        if txs:
            return txs
        return super().get(key, default if default is not None else [])

    def __getitem__(self, key):
        txs = self.repo.get_for_business(key)
        if txs:
            return txs
        return super().__getitem__(key)

    def __setitem__(self, key, value):
        super().__setitem__(key, value)
        if isinstance(value, list) and value and isinstance(value[0], Transaction):
            self.repo.save_batch(key, value)

    def __contains__(self, key):
        if self.repo.get_for_business(key):
            return True
        return super().__contains__(key)
