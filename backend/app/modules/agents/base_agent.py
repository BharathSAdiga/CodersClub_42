import uuid
import time
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timezone

from ...schemas.agent import AgentEvent
from ...core.event_bus import event_bus
from .context import AssessmentContext

logger = logging.getLogger(__name__)

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class BaseAgent:
    """
    Base class for all specialized agents in UDYOGA.
    Standardizes structured event emission, timing, and error handling.
    Excludes private LLM chain-of-thought to maintain auditability.
    """
    def __init__(self, agent_name: str):
        self.agent_name = agent_name

    async def emit_event(
        self,
        context: AssessmentContext,
        step_name: str,
        status: str,
        message: str,
        tool_called: Optional[str] = None,
        tool_input_summary: Optional[str] = None,
        structured_findings: Optional[Dict[str, Any]] = None,
        execution_duration_ms: Optional[float] = None,
        error_message: Optional[str] = None,
        event_type: str = "EXECUTION_STEP"
    ) -> AgentEvent:
        event = AgentEvent(
            event_id=f"evt_{uuid.uuid4().hex[:10]}",
            assessment_id=context.assessment_id,
            business_id=context.business_id,
            timestamp=utc_now(),
            agent_name=self.agent_name,
            step_name=step_name,
            status=status,
            event_type=event_type,
            tool_called=tool_called,
            tool_input_summary=tool_input_summary,
            structured_findings=structured_findings,
            message=message,
            user_facing_message=message,
            execution_duration_ms=execution_duration_ms,
            error_message=error_message
        )
        context.events_emitted.append(event)
        await event_bus.publish(event)
        return event
