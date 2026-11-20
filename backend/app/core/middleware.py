import time
import uuid
import logging
from contextvars import ContextVar
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from fastapi import Request, Response

correlation_id_ctx: ContextVar[str] = ContextVar("correlation_id", default="")
request_id_ctx: ContextVar[str] = ContextVar("request_id", default="")

logger = logging.getLogger("udyoga.access")

def get_correlation_id() -> str:
    """Retrieve the correlation ID of the current active request context."""
    return correlation_id_ctx.get()

def get_request_id() -> str:
    """Retrieve the request ID of the current active request context."""
    return request_id_ctx.get() or correlation_id_ctx.get()

class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """
    Ensures every inbound request has an X-Correlation-ID and X-Request-ID.
    Passes correlation ID through to contextvars, logs, agent events, and outbound response headers.
    """
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Check header or generate UUID
        correlation_id = (
            request.headers.get("X-Correlation-ID")
            or request.headers.get("X-Request-ID")
            or f"corr_{uuid.uuid4().hex[:12]}"
        )
        token_corr = correlation_id_ctx.set(correlation_id)
        token_req = request_id_ctx.set(correlation_id)
        request.state.correlation_id = correlation_id
        request.state.request_id = correlation_id

        start_time = time.time()
        try:
            response = await call_next(request)
            duration_ms = (time.time() - start_time) * 1000
            response.headers["X-Correlation-ID"] = correlation_id
            response.headers["X-Request-ID"] = correlation_id
            
            # Log structured access
            logger.info(
                f"[{correlation_id}] {request.method} {request.url.path} "
                f"-> {response.status_code} ({duration_ms:.1f}ms)"
            )
            return response
        except Exception as exc:
            duration_ms = (time.time() - start_time) * 1000
            logger.error(
                f"[{correlation_id}] Unhandled error on {request.method} {request.url.path} "
                f"after {duration_ms:.1f}ms: {exc}",
                exc_info=True
            )
            raise
        finally:
            correlation_id_ctx.reset(token_corr)
            request_id_ctx.reset(token_req)
