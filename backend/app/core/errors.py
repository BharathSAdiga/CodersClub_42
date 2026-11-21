from typing import Optional, Any, Dict, List
from datetime import datetime, timezone
import re
from pydantic import BaseModel, Field

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class ErrorDetail(BaseModel):
    loc: Optional[List[str]] = None
    msg: str
    type: Optional[str] = None

class APIErrorResponse(BaseModel):
    """
    Standardized, RFC-7807 compliant error payload for all UDYOGA API responses.
    Guarantees no internal secrets, credentials, or raw tracebacks are leaked.
    """
    type: str = Field(..., description="URI reference identifying the problem type")
    title: str = Field(..., description="Short, human-readable summary of problem")
    status: int = Field(..., description="HTTP status code")
    detail: str = Field(..., description="Human-readable explanation specific to this occurrence")
    error_code: str = Field(..., description="Platform-standard machine-readable error code")
    correlation_id: str = Field(..., description="Unique request tracing correlation ID")
    timestamp: datetime = Field(default_factory=utc_now)
    validation_errors: Optional[List[Dict[str, Any]]] = None

class UDYOGABaseException(Exception):
    """Base exception for all domain and platform errors."""
    def __init__(self, message: str, error_code: str = "ERR_GENERIC", status_code: int = 500, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}

class AgentExecutionError(UDYOGABaseException):
    """Raised when a specialized agent encounters an unrecoverable runtime error."""
    def __init__(self, agent_name: str, step_name: str, message: str):
        super().__init__(
            message=f"Agent '{agent_name}' failed at step '{step_name}': {message}",
            error_code="ERR_AGENT_FAILURE",
            status_code=500,
            details={"agent_name": agent_name, "step_name": step_name}
        )

class AgentTimeoutError(UDYOGABaseException):
    """Raised when an agent execution exceeds its configured timeout budget."""
    def __init__(self, agent_name: str, timeout_seconds: float):
        super().__init__(
            message=f"Agent '{agent_name}' exceeded timeout budget of {timeout_seconds}s.",
            error_code="ERR_AGENT_TIMEOUT",
            status_code=504,
            details={"agent_name": agent_name, "timeout_seconds": timeout_seconds}
        )

class IdempotencyConflictError(UDYOGABaseException):
    """Raised when a duplicate request is received while an operation is already in progress."""
    def __init__(self, message: str, existing_id: Optional[str] = None):
        super().__init__(
            message=message,
            error_code="ERR_IDEMPOTENCY_CONFLICT",
            status_code=409,
            details={"existing_id": existing_id} if existing_id else {}
        )

class DatabaseIntegrityError(UDYOGABaseException):
    """Raised when a database constraint is violated."""
    def __init__(self, message: str = "A database constraint violation occurred."):
        super().__init__(
            message=message,
            error_code="ERR_DATABASE_INTEGRITY",
            status_code=409
        )

def sanitize_error_message(msg: str) -> str:
    """
    Strips out connection strings, bearer tokens, passwords, and sensitive keys from error messages.
    """
    if not msg:
        return "An internal system error occurred."
    
    # Strip SQLite/Postgres URLs
    cleaned = re.sub(r'(?:sqlite|postgresql|mysql|mssql)(?:\+[a-z]+)?://[^\s@]+@[^\s/]+', '<DATABASE_REDACTED>', msg)
    # Strip file paths containing user profile names
    cleaned = re.sub(r'[A-Za-z]:\\[Uu]sers\\[^\\]+', r'<USER_DIR>', cleaned)
    # Strip Bearer tokens
    cleaned = re.sub(r'Bearer\s+[A-Za-z0-9\-_\.]+', 'Bearer <TOKEN_REDACTED>', cleaned, flags=re.IGNORECASE)
    # Strip potential secret keys
    cleaned = re.sub(r'(?:api_key|secret|password|token)[=:]\s*["\']?[A-Za-z0-9\-_]{8,}["\']?', 'credential=<REDACTED>', cleaned, flags=re.IGNORECASE)
    return cleaned
