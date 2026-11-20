from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict

from ...schemas.agent import AgentEvent
from ...schemas.business import BusinessProfile
from ...schemas.transaction import Transaction
from ...schemas.financial_dna import FinancialDNA
from ...schemas.graph import GraphMetrics
from ...schemas.evidence import EvidenceConfidence
from ...schemas.resilience import ShockScenarioInput, ShockSimulationResult
from ...schemas.assessment import CreditAppraisalMemo

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class AssessmentContext(BaseModel):
    """
    Shared assessment state across all specialized agents.
    Maintains persistent IDs, upstream agent findings, execution statuses, and emitted events.
    """
    model_config = ConfigDict(arbitrary_types_allowed=True)

    assessment_id: str
    business_id: str
    business_profile: BusinessProfile
    requested_loan_amount_inr: Optional[Decimal] = None
    scenario_input: Optional[ShockScenarioInput] = None
    transactions: List[Transaction] = Field(default_factory=list)
    
    # Structured outputs from specialized agents
    financial_dna: Optional[FinancialDNA] = None
    evidence_confidence: Optional[EvidenceConfidence] = None
    graph_metrics: Optional[GraphMetrics] = None
    vitality_analysis: Optional[Dict[str, Any]] = None
    resilience_result: Optional[ShockSimulationResult] = None
    credit_appraisal_memo: Optional[CreditAppraisalMemo] = None
    
    # State machine and audit tracking
    current_stage: str = "INITIALIZING"
    stage_statuses: Dict[str, str] = Field(default_factory=dict)
    agent_results: Dict[str, Any] = Field(default_factory=dict)
    errors: List[Dict[str, Any]] = Field(default_factory=list)
    events_emitted: List[AgentEvent] = Field(default_factory=list)
    started_at: datetime = Field(default_factory=utc_now)
    completed_at: Optional[datetime] = None
    is_completed: bool = False
    has_failed: bool = False
    failure_reason: Optional[str] = None

    def record_stage(self, stage_name: str, status: str):
        self.current_stage = stage_name
        self.stage_statuses[stage_name] = status

    def record_error(self, agent_name: str, step_name: str, error_message: str):
        self.errors.append({
            "agent_name": agent_name,
            "step_name": step_name,
            "error": error_message,
            "timestamp": utc_now().isoformat()
        })
