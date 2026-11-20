from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Literal
from datetime import datetime, timezone

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

EvidenceProvenance = Literal[
    "USER_PROVIDED",
    "SOURCE_LABELLED",
    "INDEPENDENTLY_VERIFIED",
    "MISSING"
]

FairnessAuditStatus = Literal[
    "NOT_RUN",
    "PASSED",
    "FLAGGED",
    "INCONCLUSIVE"
]

class EvidenceItem(BaseModel):
    """Granular evidence provenance and verification metadata."""
    attribute_name: str = Field(..., description="Name of the financial or operational attribute (e.g. 'monthly_turnover', 'gst_3b_filings')")
    provenance: EvidenceProvenance = Field(
        ...,
        description="Source provenance: USER_PROVIDED, SOURCE_LABELLED, INDEPENDENTLY_VERIFIED, MISSING"
    )
    source_reference: Optional[str] = Field(default=None, description="Identifier of source document or bank account")
    is_verified: bool = False
    confidence_weight: float = Field(default=1.0, ge=0.0, le=1.0)

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
    data_completeness_pct: float = Field(..., ge=0.0, le=100.0)
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
    evidence_items: List[EvidenceItem] = Field(
        default_factory=list,
        description="Detailed provenance for every analyzed evidence attribute"
    )
    sources_provenance: Dict[str, EvidenceProvenance] = Field(
        default_factory=dict,
        description="Mapping of data sources to their provenance level"
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
    
    # Structured Fairness Audit Status (Replaces default boolean)
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
    
    calculation_assumptions: List[str] = Field(
        default_factory=lambda: [
            "Confidence weights: Bank/UPI transactions 60%, GST concordance 20%, Vintage/Profile 20%",
            "Absence of formal GST filings for enterprises under threshold is treated as standard informal commerce, not a defect"
        ]
    )
    limitations: List[str] = Field(
        default_factory=lambda: [
            "Evaluates structural integrity of submitted digital records only",
            "Physical collateral or on-site inventory cannot be validated digitally"
        ]
    )
