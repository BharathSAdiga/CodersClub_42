from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Literal, Any
from datetime import datetime, timezone
from decimal import Decimal

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

EvidenceProvenanceCategory = Literal[
    "SELF_REPORTED",
    "USER_UPLOADED",
    "SOURCE_LABELLED",
    "INDEPENDENTLY_VERIFIED",
    "SYSTEM_DERIVED",
    "MISSING"
]

# Backward compatibility alias
EvidenceProvenance = Literal[
    "USER_PROVIDED",
    "USER_UPLOADED",
    "SELF_REPORTED",
    "SOURCE_LABELLED",
    "INDEPENDENTLY_VERIFIED",
    "SYSTEM_DERIVED",
    "MISSING"
]

VerificationStatus = Literal[
    "PENDING",
    "VERIFIED",
    "FLAGGED",
    "REJECTED",
    "UNVERIFIED"
]

FairnessAuditStatus = Literal[
    "NOT_RUN",
    "PASSED",
    "FLAGGED",
    "INCONCLUSIVE"
]

DiscrepancySeverity = Literal[
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL"
]

class EvidenceItem(BaseModel):
    """Granular evidence provenance and verification metadata."""
    attribute_name: str = Field(..., description="Name of the financial or operational attribute")
    provenance: EvidenceProvenance = Field(
        ...,
        description="Source provenance: SELF_REPORTED, USER_UPLOADED, SOURCE_LABELLED, INDEPENDENTLY_VERIFIED, SYSTEM_DERIVED, MISSING"
    )
    source_reference: Optional[str] = Field(default=None, description="Identifier of source document or bank account")
    is_verified: bool = False
    confidence_weight: float = Field(default=1.0, ge=0.0, le=1.0)
    details: Optional[str] = None

class ReconciliationDiscrepancy(BaseModel):
    """Structured discrepancy discovered between distinct financial sources."""
    discrepancy_id: str
    discrepancy_type: str = Field(
        ...,
        description="TURNOVER_MISMATCH, UNMATCHED_LIABILITY, DUPLICATE_TRANSACTION, DATE_MISMATCH, REVENUE_MISMATCH, MISSING_REFERENCE"
    )
    severity: DiscrepancySeverity = "MEDIUM"
    source_a: str = Field(..., description="First evidence stream (e.g., DECLARED_PROFILE)")
    source_b: str = Field(..., description="Second evidence stream (e.g., BANK_STATEMENT_CREDITS)")
    difference_amount: Optional[float] = None
    description: str
    suggested_action: str
    flagged_for_human_review: bool = True

class CrossSourceReconciliationResult(BaseModel):
    """Cross-source reconciliation audit comparing transactions, declared turnover, and obligations."""
    is_concordant: bool = True
    concordance_score: float = Field(..., ge=0.0, le=100.0, description="Overall cross-source agreement score")
    discrepancies: List[ReconciliationDiscrepancy] = Field(default_factory=list)
    total_discrepancies: int = 0
    unmatched_liabilities_count: int = 0
    summary: str
    timestamp: datetime = Field(default_factory=utc_now)
    policy_guarantee: str = "Discrepancies are audit review indicators and are never labeled as fraud without investigation."

class EvidenceRecordOut(BaseModel):
    """Detailed persistent evidence record."""
    evidence_id: str
    business_id: str
    uploaded_by: Optional[str] = None
    evidence_type: str
    source_type: str
    source_name: Optional[str] = None
    provenance: Optional[str] = None
    provenance_category: str
    verification_status: str
    confidence_score: float
    completeness: float
    consistency: float
    recency: float
    uploaded_at: datetime
    last_reviewed_at: Optional[datetime] = None
    file_reference: Optional[str] = None
    related_assessment_ids: List[str] = Field(default_factory=list)
    file_hash: Optional[str] = None
    record_count: Optional[int] = None
    document_name: Optional[str] = None
    document_type: Optional[str] = None
    status: Optional[str] = None

class EvidenceConfidence(BaseModel):
    """
    Evidence Confidence and Data Integrity Scorer.
    CRITICAL POLICY: Missing evidence must NOT automatically reduce financial health.
    Missing evidence is measured as epistemic uncertainty, not financial delinquency.
    """
    business_id: str
    assessment_id: Optional[str] = None
    calculated_at: datetime = Field(default_factory=utc_now)
    
    # Evidence Coverage & Confidence Score (0.0 to 100.0)
    evidence_confidence_score: float = Field(
        ..., 
        ge=0.0, 
        le=100.0, 
        description="Confidence in data completeness and cross-verifiability"
    )
    confidence_band: str = Field(default="MODERATE", description="HIGH (>=80), MODERATE (50-79), LOW (<50)")
    data_completeness_pct: float = Field(..., ge=0.0, le=100.0)
    consistency_pct: float = Field(default=85.0, ge=0.0, le=100.0)
    recency_pct: float = Field(default=90.0, ge=0.0, le=100.0)
    source_reliability_pct: float = Field(default=75.0, ge=0.0, le=100.0)
    temporal_coverage_days: int = Field(default=0, ge=0)
    total_records_analyzed: int = Field(default=0, ge=0)
    
    # Tracked Data Sources & Granular Provenance
    available_data_sources: List[str] = Field(
        default_factory=list,
        description="e.g., ['BANK_STATEMENTS', 'UPI_QR_LOGS', 'GST_RETURNS', 'UTILITY_RECEIPTS']"
    )
    missing_evidence_fields: List[str] = Field(
        default_factory=list,
        description="Fields not provided (e.g. ['GSTIN_RETURN_3B', 'FORM_26AS'])"
    )
    inconsistent_fields: List[str] = Field(
        default_factory=list,
        description="Fields where cross-source values deviate significantly"
    )
    evidence_items: List[EvidenceItem] = Field(
        default_factory=list,
        description="Detailed provenance for every analyzed evidence attribute"
    )
    sources_provenance: Dict[str, str] = Field(
        default_factory=dict,
        description="Mapping of data sources to their provenance level"
    )
    provenance_breakdown: Dict[str, int] = Field(
        default_factory=dict,
        description="Counts of evidence items by provenance category"
    )
    
    # Policy: Absence of Evidence != Negative Evidence
    missing_data_treatment_policy: str = Field(
        default="NEUTRAL_UNCERTAINTY: Missing data restricts maximum limit exposure and increases uncertainty bands without penalizing base financial health.",
        description="Explicit guarantee that missing data is not conflated with poor repayment discipline"
    )
    
    cross_source_concordance_pct: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=100.0,
        description="Percentage agreement between declared turnover and verified transaction credits"
    )
    
    reconciliation: Optional[CrossSourceReconciliationResult] = None

    # Structured Fairness Audit Status
    fairness_audit_status: FairnessAuditStatus = Field(
        default="NOT_RUN",
        description="Structured fairness and non-discrimination audit status: NOT_RUN, PASSED, FLAGGED, INCONCLUSIVE"
    )
    
    @property
    def fairness_audit_passed(self) -> Optional[bool]:
        """Backward-compatible boolean indicator."""
        if self.fairness_audit_status == "PASSED":
            return True
        elif self.fairness_audit_status == "FLAGGED":
            return False
        return None
    
    confidence_rationale: str = Field(
        default="Evidence confidence is derived from data completeness, source reliability, and cross-source agreement.",
        description="Plain-English explanation of why confidence is high, moderate, or low"
    )
    recommendations_to_improve: List[str] = Field(
        default_factory=list,
        description="Actionable steps the borrower or lender can take to improve evidence confidence"
    )

    calculation_assumptions: List[str] = Field(
        default_factory=lambda: [
            "Source reliability weights: Independently Verified 0.95, Source Labelled 0.80, User Uploaded 0.65, Self Reported 0.40, Missing 0.0",
            "Absence of formal GST filings for enterprises under threshold is treated as standard informal commerce, not a defect",
            "Bank statements uploaded directly by users are treated as USER_UPLOADED until verified via Account Aggregator"
        ]
    )
    limitations: List[str] = Field(
        default_factory=lambda: [
            "Evaluates structural integrity of submitted digital records only",
            "Physical collateral or on-site inventory cannot be validated digitally",
            "User-uploaded CSV statements carry moderate provenance confidence unless counterparty bank signature is present"
        ]
    )

class EvidenceConfidenceReport(BaseModel):
    """Full evidence confidence and provenance audit report."""
    business_id: str
    confidence: EvidenceConfidence
    reconciliation: CrossSourceReconciliationResult
    evidence_records: List[EvidenceRecordOut]
    generated_at: datetime = Field(default_factory=utc_now)
