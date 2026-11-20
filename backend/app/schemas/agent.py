from pydantic import BaseModel, Field, model_validator
from typing import Optional, Literal, Dict, Any, Union
from datetime import datetime, timezone

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

AgentStatusType = Literal[
    "PENDING",
    "RUNNING",
    "COMPLETED",
    "FAILED",
    "SKIPPED",
    "FALLBACK_USED",
    "STARTED",
    "TOOL_CALLED",
    "STRUCTURED_RESULT"
]

AgentNameType = Literal[
    "Orchestrator",
    "FinancialIntelligenceAgent",
    "EvidenceVerificationAgent",
    "TransactionForensicsAgent",
    "BusinessVitalityAgent",
    "ResilienceSimulationAgent",
    "UnderwritingAgent",
    "ExplanationAndPassportAgent",
    # Backward compatibility aliases
    "FinancialDNAAgent",
    "ForensicInvestigatorAgent",
    "ResilienceAuditorAgent",
    "SeniorUnderwriterAgent"
]

class AgentEvent(BaseModel):
    """
    Structured execution event emitted via SSE stream.
    Strictly excludes raw LLM chain-of-thought to maintain audit cleanliness and confidentiality.
    Exposes agent tasks, tool calls, structured findings, and execution status.
    """
    event_id: str
    assessment_id: str
    business_id: str
    timestamp: datetime = Field(default_factory=utc_now)
    agent_name: Union[AgentNameType, str]
    step_name: str = Field(..., description="e.g. 'compute_cash_velocity', 'audit_circular_counterparties'")
    status: Union[AgentStatusType, str]
    event_type: str = Field(default="EXECUTION_STEP", description="e.g. TASK_START, TOOL_INVOCATION, STRUCTURED_RESULT, COMPLETION, FAILURE, FALLBACK")
    tool_called: Optional[str] = None
    tool_input_summary: Optional[str] = None
    structured_findings: Optional[Dict[str, Any]] = None
    message: str = Field(..., description="Auditable public summary of what the agent observed or executed")
    user_facing_message: Optional[str] = Field(default=None, description="Clear, human-readable update for lenders and borrowers")
    execution_duration_ms: Optional[float] = Field(default=None, description="Time taken to execute the tool or step in milliseconds")
    error_message: Optional[str] = Field(default=None, description="Structured error details if step failed")

    @model_validator(mode="before")
    @classmethod
    def populate_user_facing_message(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if not data.get("user_facing_message") and data.get("message"):
                data["user_facing_message"] = data["message"]
            elif not data.get("message") and data.get("user_facing_message"):
                data["message"] = data["user_facing_message"]
        return data

class AgentExecutionState(BaseModel):
    """Cumulative orchestration progress state."""
    assessment_id: str
    business_id: str
    current_agent: str
    current_stage: str = "INITIALIZING"
    progress_percentage: int = Field(ge=0, le=100)
    is_completed: bool = False
    has_failed: bool = False
    failure_reason: Optional[str] = None
    total_events_emitted: int = 0
