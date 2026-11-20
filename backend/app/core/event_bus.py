import asyncio
from typing import Dict, List, AsyncGenerator
from datetime import datetime
import json
from ..schemas.agent import AgentEvent

class EventBus:
    """
    Lightweight in-memory asynchronous event bus for Server-Sent Events (SSE).
    Decouples agent execution logging from frontend delivery.
    """
    def __init__(self):
        # assessment_id -> List[asyncio.Queue]
        self._subscribers: Dict[str, List[asyncio.Queue]] = {}
        # assessment_id -> List[AgentEvent] (history for late joiners)
        self._history: Dict[str, List[AgentEvent]] = {}
        self._lock = asyncio.Lock()

    async def subscribe(self, assessment_id: str) -> AsyncGenerator[str, None]:
        queue = asyncio.Queue()
        async with self._lock:
            if assessment_id not in self._subscribers:
                self._subscribers[assessment_id] = []
            self._subscribers[assessment_id].append(queue)
            # Replay historical events
            past_events = self._history.get(assessment_id, [])

        # Send past events first
        for event in past_events:
            yield f"data: {event.model_dump_json()}\n\n"

        try:
            while True:
                event = await queue.get()
                if event is None:  # Sentinel to close connection
                    break
                yield f"data: {event.model_dump_json()}\n\n"
        finally:
            async with self._lock:
                if assessment_id in self._subscribers and queue in self._subscribers[assessment_id]:
                    self._subscribers[assessment_id].remove(queue)
                    if not self._subscribers[assessment_id]:
                        del self._subscribers[assessment_id]

    async def publish(self, event: AgentEvent):
        async with self._lock:
            if event.assessment_id not in self._history:
                self._history[event.assessment_id] = []
            self._history[event.assessment_id].append(event)
            
            subscribers = self._subscribers.get(event.assessment_id, [])
            for queue in subscribers:
                await queue.put(event)

        # Persist event to SQLite for auditability and restart recovery
        try:
            from ..db import agent_event_repo
            agent_event_repo.save(event)
        except Exception:
            pass

    async def close_stream(self, assessment_id: str):
        async with self._lock:
            subscribers = self._subscribers.get(assessment_id, [])
            for queue in subscribers:
                await queue.put(None)

    def get_history(self, assessment_id: str) -> List[AgentEvent]:
        events = self._history.get(assessment_id)
        if events:
            return events
        try:
            from ..db import agent_event_repo
            db_events = agent_event_repo.get_for_assessment(assessment_id)
            if db_events:
                parsed = [
                    AgentEvent(
                        event_id=e.id,
                        assessment_id=e.assessment_id,
                        business_id=e.business_id,
                        agent_name=e.agent_name,
                        step_name=e.step_name,
                        status=e.status,
                        timestamp=e.timestamp,
                        message=e.message,
                        execution_duration_ms=e.execution_duration_ms,
                        structured_payload=json.loads(e.structured_payload_json) if e.structured_payload_json else None
                    )
                    for e in db_events
                ]
                self._history[assessment_id] = parsed
                return parsed
        except Exception:
            pass
        return []

# Singleton event bus instance
event_bus = EventBus()
