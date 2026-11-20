from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Dict, Any
from datetime import datetime, timezone
from decimal import Decimal
from .financial_dna import FinancialDNA
from .graph import GraphMetrics
from .evidence import EvidenceConfidence
from .resilience import ShockSimulationResult

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

AssessmentStatus = Literal[
    "INDICATIVE_RECOMMENDATION",
    "CONDITIONAL_RECOMMENDATION",
    "HUMAN_REVIEW_REQUIRED",
    "INSUFFICIENT_EVIDENCE"
]

FinancialRiskBand = Literal[
    "LOW_RISK",
    "MODERATE_RISK",
    "ELEVATED_RISK",
    "HIGH_RISK",
    "UNASSESSED"
]

class CounterfactualImprovement(BaseModel):
    """Deterministic simulation of what changes would improve borrowing capacity (Path-to-Yes)."""
    action_type: str = Field(..., description="e.g. 'EXPENSE_REDUCTION', 'COLLECTIONS_ACCELERATION', 'TENURE_EXTENSION'")
    description: str = Field(..., description="Actionable business adjustment")
    parameter_change: str = Field(..., description="Quantitative modeled change, e.g. 'COGS reduced by 8%'")
    baseline_status: AssessmentStatus
    simulated_status: AssessmentStatus
    baseline_affordable_loan_inr: Decimal
    simulated_affordable_loan_inr: Decimal
    baseline_dscr: Optional[float] = None
    simulated_dscr: Optional[float] = None
    impact_summary: str = Field(..., description="Executive summary of how this alters underwriting eligibility")

class CreditAppraisalMemo(BaseModel):
    """
    Comprehensive Credit Appraisal Memo (CAM).
    - Excludes artificial 300-900 credit bureau score claims.
    - Transparent assessment statuses: INDICATIVE_RECOMMENDATION, CONDITIONAL_RECOMMENDATION, HUMAN_REVIEW_REQUIRED, INSUFFICIENT_EVIDENCE.
    - Financial risk band includes UNASSESSED when evidence is insufficient.
    - Structured numerical APR min and max values.
    - Deterministic fallback reports clearly labelled when LLM synthesis is bypassed.
    - Auditability: Explicit assumptions, data limitations, evidence references, and calculation version.
    """
    assessment_id: str = Field(..., description="Unique assessment run identifier")
    business_id: str = Field(..., description="Consistent business identifier")
    generated_at: datetime = Field(default_factory=utc_now)
    
    # Transparent Assessment Status (No hard automated rejection)
    assessment_status: AssessmentStatus
    
    # Financial Risk Band (Separated from evidence confidence; UNASSESSED when evidence is insufficient)
    financial_risk_band: FinancialRiskBand
    
    # Evidence & Investigation Direct Links
    evidence_confidence_score: float = Field(..., ge=0.0, le=100.0)
    investigation_status: Literal["NORMAL_PATTERNS", "INVESTIGATION_TRIGGERED", "HUMAN_REVIEW_RECOMMENDED"]
    
    # Credit Facility Recommendation (Indicative & Subject to Verification)
    recommended_loan_amount_inr: Decimal = Field(default=Decimal("0.0"), ge=Decimal("0.0"))
    max_safe_loan_amount_inr: Decimal = Field(default=Decimal("0.0"), ge=Decimal("0.0"), description="Hard ceiling from resilience engine affordability calculations")
    recommended_tenure_months: int = Field(default=0, ge=0)
    indicative_apr_min_pct: Optional[Decimal] = Field(default=None, ge=Decimal("0.0"), description="Indicative minimum annual percentage rate")
    indicative_apr_max_pct: Optional[Decimal] = Field(default=None, ge=Decimal("0.0"), description="Indicative maximum annual percentage rate")
    indicative_apr_range: Optional[str] = Field(default="N/A", description="Formatted string e.g. '13.5% - 15.0% p.a.' for UI display")
    recommended_facility_type: Literal[
        "UNSECURED_WORKING_CAPITAL_LINE",
        "REVENUE_BASED_DAILY_SWEEP",
        "STRUCTURED_VENDOR_FINANCING",
        "NONE_RECOMMENDED"
    ]
    
    # Decision Drivers & Explainability
    positive_credit_factors: List[str] = Field(default_factory=list)
    risk_factors_and_vulnerabilities: List[str] = Field(default_factory=list)
    recommended_covenants_and_mitigants: List[str] = Field(default_factory=list)
    missing_evidence_items: List[str] = Field(default_factory=list)
    recommended_improvements: List[str] = Field(default_factory=list)
    counterfactual_improvements: List[CounterfactualImprovement] = Field(default_factory=list)
    
    # Assumptions, Limitations & Calculation Audit Trail
    assumptions: List[str] = Field(
        default_factory=lambda: [
            "Assesses behavioral operational cash flows rather than balance sheet asset collateral",
            "Debt capacity calculated on verified unencumbered monthly operating surplus",
            "Repayments structured to avoid exceeding 50% fixed obligation to income ratio"
        ]
    )
    data_limitations: List[str] = Field(
        default_factory=lambda: [
            "Unbanked physical cash turnover not reflected in digital statements",
            "Evaluates digital evidence records provided as of assessment date"
        ]
    )
    evidence_references: List[str] = Field(default_factory=list)
    calculation_version: str = Field(default="1.0.0", description="Semantic calculation engine version")
    
    # Full Synthesis Narrative (Markdown format for CAM Export)
    cam_narrative_markdown: str = Field(..., description="Executive underwriting memorandum")
    
    # Deterministic Engine Snapshots
    financial_dna_snapshot: Optional[FinancialDNA] = None
    graph_metrics_snapshot: Optional[GraphMetrics] = None
    evidence_confidence_snapshot: Optional[EvidenceConfidence] = None
    resilience_simulation_snapshot: Optional[ShockSimulationResult] = None
    
    # Traceability, Fallback & Audit
    is_fallback_rule_based: bool = Field(
        default=False,
        description="True if compiled entirely by deterministic rules when LLM synthesis was unavailable"
    )
    fallback_reason: Optional[str] = None
    is_synthetic_evaluation: bool = False
    disclaimer: str = Field(
        default="This is an indicative, explainable credit recommendation generated by UDYOGA. It is not a formal credit bureau score and is subject to human underwriter verification and field KYC."
    )

class AssessmentTriggerRequest(BaseModel):
    business_id: str
    scenario_override: Optional[Dict[str, Any]] = None

class AssessmentTriggerResponse(BaseModel):
    assessment_id: str
    business_id: str
    status: Literal["QUEUED", "PROCESSING", "COMPLETED", "FAILED"]
    message: str
    stream_url: str
