from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime, timezone

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class EvidenceConfidence(BaseModel):
    """
    Evidence Confidence and Data Integrity Scorer.
    IMPORTANT: Missing evidence must NOT automatically reduce financial health.
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
    temporal_coverage_days: int
    total_records_analyzed: int
    
    # Tracked Data Sources
    available_data_sources: List[str] = Field(
        default_factory=list,
        description="e.g., ['BANK_STATEMENTS', 'UPI_QR_LOGS', 'GST_RETURNS', 'UTILITY_RECEIPTS']"
    )
    missing_evidence_fields: List[str] = Field(
        default_factory=list,
        description="Fields not provided (e.g. ['GSTIN_RETURN_3B', 'FORM_26AS'])"
    )
    
    # Policy: Absence of Evidence != Negative Evidence
    missing_data_treatment_policy: str = Field(
        default="NEUTRAL_UNCERTAINTY: Missing data restricts maximum limit exposure and increases uncertainty bands without penalizing base financial health.",
        description="Explicit guarantee that missing data is not conflated with poor repayment discipline"
    )
    
    cross_source_concordance_pct: Optional[float] = Field(
        default=None,
        description="Percentage agreement between declared turnover and verified transaction credits"
    )
    fairness_audit_passed: bool = Field(
        default=True,
        description="Audit verification ensuring no discriminatory proxy variables influenced scoring"
    )
    
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
