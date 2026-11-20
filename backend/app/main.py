from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api.router import api_router

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "UDYOGA — Beyond Credit. Beyond Barriers.\n\n"
        "Agentic AI-powered financial intelligence and resilience-based credit assessment platform "
        "for India's credit-invisible MSMEs."
    ),
    version="0.1.0-phase0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API endpoints under /api/v1
app.include_router(api_router, prefix=settings.API_PREFIX)

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
