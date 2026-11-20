from fastapi import APIRouter, HTTPException
from typing import List, Dict
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from ..schemas.business import BusinessProfile, BusinessProfileCreate
from ..db import DatabaseBackedBusinessStore

router = APIRouter(prefix="/business", tags=["Business & Profiles"])

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

# Database-backed business store (replaces volatile in-memory dict)
BUSINESS_STORE: Dict[str, BusinessProfile] = DatabaseBackedBusinessStore()

# Pre-seeded Hackathon Demo Profiles
DEMO_PROFILES: List[BusinessProfile] = [
    BusinessProfile(
        business_id="msme_kirana_kanpur_001",
        legal_name="Gupta General Store",
        trade_name="Shree Balaji Provision Store",
        sector="RETAIL_KIRANA",
        vintage_months=42,
        location_tier="TIER_2",
        entity_type="PROPRIETORSHIP",
        declared_monthly_turnover=Decimal("285000.0"),
        declared_existing_monthly_emi=Decimal("4500.0"),
        has_gstin=False,
        gstin=None,
        has_udyam_registration=True,
        udyam_reg_number="UDYAM-UP-28-0019284",
        is_synthetic=True,
        created_at=utc_now()
    ),
    BusinessProfile(
        business_id="msme_trading_surat_002",
        legal_name="Apex Synthetic Fabrics LLP",
        trade_name="Apex Global Tex",
        sector="TEXTILE_WEAVING",
        vintage_months=28,
        location_tier="TIER_2",
        entity_type="LLP",
        declared_monthly_turnover=Decimal("1450000.0"),
        declared_existing_monthly_emi=Decimal("28000.0"),
        has_gstin=True,
        gstin="24AAACA0000A1Z5",
        has_udyam_registration=True,
        udyam_reg_number="UDYAM-GJ-01-0082711",
        is_synthetic=True,
        created_at=utc_now()
    ),
    BusinessProfile(
        business_id="msme_weaver_erode_003",
        legal_name="Cauvery Handloom Cooperative",
        trade_name="Cauvery Weaves",
        sector="HANDICRAFTS_ARTISAN",
        vintage_months=64,
        location_tier="TIER_3",
        entity_type="PARTNERSHIP",
        declared_monthly_turnover=Decimal("420000.0"),
        declared_existing_monthly_emi=Decimal("8000.0"),
        has_gstin=False,
        gstin=None,
        has_udyam_registration=True,
        udyam_reg_number="UDYAM-TN-04-0041289",
        is_synthetic=True,
        created_at=utc_now()
    )
]

for profile in DEMO_PROFILES:
    BUSINESS_STORE[profile.business_id] = profile

@router.get("/demo/scenarios", response_model=List[BusinessProfile])
async def get_demo_scenarios():
    """Retrieve pre-seeded MSME scenarios for 1-click live demo and UI testing."""
    return DEMO_PROFILES

@router.post("/profile", response_model=BusinessProfile)
async def create_profile(payload: BusinessProfileCreate):
    """Create a new MSME business profile."""
    business_id = f"msme_{uuid.uuid4().hex[:12]}"
    profile = BusinessProfile(
        business_id=business_id,
        legal_name=payload.legal_name,
        trade_name=payload.trade_name,
        sector=payload.sector,
        vintage_months=payload.vintage_months,
        location_tier=payload.location_tier,
        entity_type=payload.entity_type,
        declared_monthly_turnover=payload.declared_monthly_turnover,
        declared_existing_monthly_emi=payload.declared_existing_monthly_emi,
        has_gstin=payload.has_gstin,
        gstin=payload.gstin,
        has_udyam_registration=payload.has_udyam_registration,
        udyam_reg_number=payload.udyam_reg_number,
        is_synthetic=False,
        created_at=utc_now()
    )
    BUSINESS_STORE[business_id] = profile
    return profile

@router.get("/profile/{business_id}", response_model=BusinessProfile)
async def get_profile(business_id: str):
    """Fetch business profile by ID."""
    if business_id not in BUSINESS_STORE:
        raise HTTPException(status_code=404, detail=f"Business profile '{business_id}' not found")
    return BUSINESS_STORE[business_id]
