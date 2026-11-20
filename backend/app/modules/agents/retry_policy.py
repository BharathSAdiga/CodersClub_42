import asyncio
import time
import logging
from typing import Callable, Any, Optional, TypeVar, Tuple
from pydantic import BaseModel, Field

logger = logging.getLogger("udyoga.agents.retry")

T = TypeVar("T")

class AgentRetryConfig(BaseModel):
    """Configuration for agent execution retry and timeout policy."""
    max_retries: int = Field(default=2, ge=0, le=5, description="Maximum number of retry attempts after initial failure")
    base_delay_seconds: float = Field(default=0.05, ge=0.001, le=10.0, description="Initial backoff delay in seconds")
    exponential_factor: float = Field(default=2.0, ge=1.0, le=4.0, description="Multiplier for exponential backoff")
    timeout_seconds: float = Field(default=6.0, ge=0.01, le=60.0, description="Maximum execution timeout budget per attempt")
    retry_transient_only: bool = Field(default=True, description="Only retry transient network/timeout exceptions")

# Transient exceptions eligible for retry
TRANSIENT_EXCEPTIONS = (
    asyncio.TimeoutError,
    TimeoutError,
    ConnectionError,
    ConnectionResetError,
    OSError
)

# Deterministic or input validation errors that should fail fast without wasting retries
NON_RETRYABLE_EXCEPTIONS = (
    ValueError,
    TypeError,
    KeyError,
    AttributeError,
    AssertionError
)

async def execute_with_retry_and_timeout(
    coro_func: Callable[[], Any],
    agent_name: str,
    step_name: str,
    config: Optional[AgentRetryConfig] = None,
    on_retry_callback: Optional[Callable[[int, Exception, float], Any]] = None
) -> Tuple[bool, Any, Optional[str]]:
    """
    Executes an asynchronous agent task with strict per-attempt timeout, configurable
    exponential backoff retries, and comprehensive error isolation.

    Returns:
        (success: bool, result: Any, error_message: Optional[str])
    """
    cfg = config or AgentRetryConfig()
    attempt = 0
    max_attempts = 1 + cfg.max_retries
    delay = cfg.base_delay_seconds

    last_error: Optional[Exception] = None

    while attempt < max_attempts:
        attempt += 1
        try:
            # Enforce timeout budget
            res = await asyncio.wait_for(coro_func(), timeout=cfg.timeout_seconds)
            return True, res, None
        except asyncio.TimeoutError as te:
            last_error = te
            err_msg = f"Agent '{agent_name}' timed out after {cfg.timeout_seconds:.1f}s (attempt {attempt}/{max_attempts})"
            logger.warning(err_msg)
        except Exception as exc:
            last_error = exc
            if cfg.retry_transient_only and isinstance(exc, NON_RETRYABLE_EXCEPTIONS):
                logger.error(
                    f"Agent '{agent_name}' encountered non-retryable {type(exc).__name__}: {exc}. Halting retries.",
                    exc_info=False
                )
                return False, None, f"{type(exc).__name__}: {str(exc)}"
            
            logger.warning(
                f"Agent '{agent_name}' failed attempt {attempt}/{max_attempts} with {type(exc).__name__}: {exc}"
            )

        # If more attempts remain, backoff and retry
        if attempt < max_attempts:
            if on_retry_callback:
                try:
                    cb_res = on_retry_callback(attempt, last_error, delay)
                    if asyncio.iscoroutine(cb_res):
                        await cb_res
                except Exception:
                    pass

            await asyncio.sleep(delay)
            delay *= cfg.exponential_factor

    # Exhausted all attempts
    final_err_msg = (
        f"Agent '{agent_name}' exhausted {max_attempts} attempts. "
        f"Last error: {type(last_error).__name__}: {str(last_error)}"
    )
    logger.error(final_err_msg)
    return False, None, final_err_msg
