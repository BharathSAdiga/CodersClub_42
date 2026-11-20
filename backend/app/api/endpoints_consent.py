from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict, Any
import json

from ..schemas.consent import (
    ConsentGrantRequest,
    ConsentRecordOut,
    EvidenceAuditRecordOut
)
from ..core.auth_deps import get_current_user, verify_tenant_access
from ..db import consent_repo, evidence_repo

router = APIRouter(tags=["Consent & Evidence Auditability"])

@router.post("/consent/grant", response_model=ConsentRecordOut)
async def grant_consent(
    req: ConsentGrantRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Grants explicit, verifiable consent before accessing Account Aggregator, GSTN, or UPI data.
    Enforces cross-tenant protection: borrowers may only grant consent for their own business.
    """
    verify_tenant_access(req.business_id, current_user)

    record = consent_repo.grant(
        user_id=current_user["id"],
        business_id=req.business_id,
        data_provider=req.data_provider,
        purpose=req.purpose,
        data_fields_granted=req.data_fields_granted,
        expires_in_days=req.expires_in_days
    )

    return ConsentRecordOut(
        id=record.id,
        user_id=record.user_id,
        business_id=record.business_id,
        data_provider=record.data_provider,
        purpose=record.purpose,
        data_fields_granted=json.loads(record.data_fields_granted),
        status=record.status,
        granted_at=record.granted_at,
        expires_at=record.expires_at,
        revoked_at=record.revoked_at
    )

@router.post("/consent/{consent_id}/revoke")
async def revoke_consent(
    consent_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Revokes an active data sharing consent record.
    """
    success = consent_repo.revoke(consent_id, user_id=None if current_user.get("role") in ["SUPER_ADMIN", "LENDER_OFFICER"] else current_user["id"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Consent record '{consent_id}' not found or already revoked."
        )
    return {
        "status": "REVOKED",
        "consent_id": consent_id,
        "message": "Data sharing consent revoked successfully."
    }

@router.get("/consent/active/{business_id}", response_model=List[ConsentRecordOut])
async def list_active_consents(
    business_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Lists all active consent records for an MSME enterprise.
    """
    verify_tenant_access(business_id, current_user)
    records = consent_repo.get_active_for_business(business_id)
    return [
        ConsentRecordOut(
            id=r.id,
            user_id=r.user_id,
            business_id=r.business_id,
            data_provider=r.data_provider,
            purpose=r.purpose,
            data_fields_granted=json.loads(r.data_fields_granted),
            status=r.status,
            granted_at=r.granted_at,
            expires_at=r.expires_at,
            revoked_at=r.revoked_at
        )
        for r in records
    ]

@router.get("/evidence/audit-trail/{business_id}", response_model=List[EvidenceAuditRecordOut])
async def get_evidence_audit_trail(
    business_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Provides immutable evidence audit trail with document hashes and provenance tracking:
    INDEPENDENTLY_VERIFIED, SOURCE_LABELLED, or SELF_REPORTED.
    """
    verify_tenant_access(business_id, current_user)
    records = evidence_repo.list_for_business(business_id)
    return [
        EvidenceAuditRecordOut(
            id=r.id,
            business_id=r.business_id,
            document_name=r.document_name,
            document_type=r.document_type,
            provenance=r.provenance,
            record_count=r.record_count,
            file_hash=r.file_hash,
            upload_timestamp=r.upload_timestamp,
            status=r.status
        )
        for r in records
    ]
