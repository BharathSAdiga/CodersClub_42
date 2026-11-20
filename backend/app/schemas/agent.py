from pydantic import BaseModel, Field
from typing import Optional, Literal, Dict, Any
from datetime import datetime, timezone

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

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
    agent_name: Literal[
        "Orchestrator",
        "FinancialDNAAgent",
        "ForensicInvestigatorAgent",
        "ResilienceAuditorAgent",
        "SeniorUnderwriterAgent"
    ]
    step_name: str = Field(..., description="e.g. 'compute_cash_velocity', 'audit_circular_counterparties'")
    status: Literal["STARTED", "RUNNING", "TOOL_CALLED", "STRUCTURED_RESULT", "COMPLETED", "FAILED"]
    tool_called: Optional[str] = None
    tool_input_summary: Optional[str] = None
    structured_findings: Optional[Dict[str, Any]] = None
    message: str = Field(..., description="Auditable public summary of what the agent observed or executed")

class AgentExecutionState(BaseModel):
    """Cumulative orchestration progress state."""
    assessment_id: str
    business_id: str
    current_agent: str
    progress_percentage: int = Field(ge=0, le=100)
    is_completed: bool = False
    has_failed: bool = False
    failure_reason: Optional[str] = None
    total_events_emitted: int = 0
