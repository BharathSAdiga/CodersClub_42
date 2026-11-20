from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
import logging

from .core.config import settings
from .core.middleware import CorrelationIdMiddleware, get_correlation_id
from .api.router import api_router
from .db import init_db

logger = logging.getLogger("udyoga.app")

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "UDYOGA — Beyond Credit. Beyond Barriers.\n\n"
        "Agentic AI-powered financial intelligence and resilience-based credit assessment platform "
        "for India's credit-invisible MSMEs."
    ),
    version="0.2.0-phase2",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Correlation ID and Request Telemetry Middleware
app.add_middleware(CorrelationIdMiddleware)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Correlation-ID", "X-Request-ID"]
)

from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import SQLAlchemyError, IntegrityError, OperationalError
from .core.errors import UDYOGABaseException, sanitize_error_message, utc_now

# Global RFC-7807 Compliant Exception Handlers
@app.exception_handler(UDYOGABaseException)
async def domain_exception_handler(request: Request, exc: UDYOGABaseException):
    cid = getattr(request.state, "correlation_id", get_correlation_id())
    logger.warning(f"[{cid}] Domain exception [{exc.error_code}]: {exc.message}")
    headers = {"X-Correlation-ID": cid, "X-Request-ID": cid} if cid else None
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "type": f"https://api.udyoga.org/errors/{exc.error_code.lower().replace('_', '-')}",
            "title": exc.error_code,
            "status": exc.status_code,
            "detail": sanitize_error_message(exc.message),
            "error_code": exc.error_code,
            "correlation_id": cid,
            "request_id": cid,
            "timestamp": utc_now().isoformat(),
            "details": exc.details
        },
        headers=headers
    )

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    cid = getattr(request.state, "correlation_id", get_correlation_id())
    logger.error(f"[{cid}] Database exception ({type(exc).__name__}): {exc}", exc_info=True)
    is_integrity = isinstance(exc, IntegrityError)
    status_code = status.HTTP_409_CONFLICT if is_integrity else status.HTTP_503_SERVICE_UNAVAILABLE
    err_code = "ERR_DATABASE_INTEGRITY" if is_integrity else "ERR_DATABASE_UNAVAILABLE"
    detail = (
        "Database constraint violation. Ensure unique constraints and required fields are respected."
        if is_integrity else
        "Database service is temporarily unavailable or busy. Please retry shortly."
    )
    headers = {"X-Correlation-ID": cid, "X-Request-ID": cid} if cid else None
    return JSONResponse(
        status_code=status_code,
        content={
            "type": f"https://api.udyoga.org/errors/{err_code.lower().replace('_', '-')}",
            "title": "Database Error",
            "status": status_code,
            "detail": detail,
            "error_code": err_code,
            "correlation_id": cid,
            "request_id": cid,
            "timestamp": utc_now().isoformat()
        },
        headers=headers
    )

@app.exception_handler(HTTPException)
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: Exception):
    cid = getattr(request.state, "correlation_id", get_correlation_id())
    status_code = getattr(exc, "status_code", 500)
    raw_detail = getattr(exc, "detail", str(exc))
    detail = sanitize_error_message(str(raw_detail)) if isinstance(raw_detail, str) else raw_detail
    headers = {"X-Correlation-ID": cid, "X-Request-ID": cid} if cid else None
    return JSONResponse(
        status_code=status_code,
        content={
            "type": "https://api.udyoga.org/errors/http-error",
            "title": "HTTP Error",
            "status": status_code,
            "detail": detail,
            "error_code": f"ERR_HTTP_{status_code}",
            "correlation_id": cid,
            "request_id": cid,
            "timestamp": utc_now().isoformat()
        },
        headers=headers
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    cid = getattr(request.state, "correlation_id", get_correlation_id())
    headers = {"X-Correlation-ID": cid, "X-Request-ID": cid} if cid else None
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "type": "https://api.udyoga.org/errors/validation-error",
            "title": "Unprocessable Entity",
            "status": 422,
            "detail": jsonable_encoder(exc.errors()),
            "error_code": "ERR_VALIDATION_ERROR",
            "correlation_id": cid,
            "request_id": cid,
            "timestamp": utc_now().isoformat()
        },
        headers=headers
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    cid = getattr(request.state, "correlation_id", get_correlation_id())
    logger.error(f"[{cid}] Unhandled server exception: {exc}", exc_info=True)
    headers = {"X-Correlation-ID": cid, "X-Request-ID": cid} if cid else None
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "type": "https://api.udyoga.org/errors/internal-error",
            "title": "Internal Server Error",
            "status": 500,
            "detail": "An internal server error occurred. Please reference the correlation_id when contacting support.",
            "error_code": "ERR_INTERNAL_SERVER_ERROR",
            "correlation_id": cid,
            "request_id": cid,
            "timestamp": utc_now().isoformat()
        },
        headers=headers
    )

# Mount all API endpoints under /api/v1
app.include_router(api_router, prefix=settings.API_PREFIX)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to UDYOGA Financial Intelligence Platform API",
        "docs": "/docs",
        "health": f"{settings.API_PREFIX}/health",
        "status": f"{settings.API_PREFIX}/status",
        "demo_scenarios": f"{settings.API_PREFIX}/business/demo/scenarios"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
