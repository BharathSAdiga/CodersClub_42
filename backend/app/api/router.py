from fastapi import APIRouter
from .endpoints_health import router as health_router
from .endpoints_auth import router as auth_router
from .endpoints_business import router as business_router
from .endpoints_transactions import router as transactions_router
from .endpoints_simulation import router as simulation_router
from .endpoints_assessment import router as assessment_router
from .endpoints_consent import router as consent_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(business_router)
api_router.include_router(transactions_router)
api_router.include_router(simulation_router)
api_router.include_router(assessment_router)
api_router.include_router(consent_router)
