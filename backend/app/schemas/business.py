from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime, timezone
from decimal import Decimal

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class BusinessProfile(BaseModel):
    """Core MSME business demographic profile."""
    business_id: str = Field(..., description="Unique persistent identifier for the business")
    legal_name: str
    trade_name: str
    sector: Literal[
        "RETAIL_KIRANA",
        "LIGHT_MANUFACTURING",
        "TEXTILE_WEAVING",
        "FOOD_SERVICES",
        "LOGISTICS_TRANSPORT",
        "HANDICRAFTS_ARTISAN",
        "GENERAL_SERVICES"
    ]
    vintage_months: int = Field(..., ge=0, description="Months in continuous operation")
    location_tier: Literal["TIER_1", "TIER_2", "TIER_3", "RURAL"]
    entity_type: Literal["PROPRIETORSHIP", "PARTNERSHIP", "LLP", "PRIVATE_LIMITED", "INFORMAL_ENTERPRISE"]
    declared_monthly_turnover: Decimal = Field(..., ge=Decimal("0.0"), description="Declared monthly turnover in INR (must be non-negative)")
    declared_existing_monthly_emi: Decimal = Field(default=Decimal("0.0"), ge=Decimal("0.0"), description="Self-reported current debt repayment (must be non-negative)")
    has_gstin: bool = False
    gstin: Optional[str] = None
    has_udyam_registration: bool = False
    udyam_reg_number: Optional[str] = None
    is_synthetic: bool = False
    created_at: datetime = Field(default_factory=utc_now)

class BusinessProfileCreate(BaseModel):
    legal_name: str
    trade_name: str
    sector: Literal[
        "RETAIL_KIRANA",
        "LIGHT_MANUFACTURING",
        "TEXTILE_WEAVING",
        "FOOD_SERVICES",
        "LOGISTICS_TRANSPORT",
        "HANDICRAFTS_ARTISAN",
        "GENERAL_SERVICES"
    ]
    vintage_months: int = Field(..., ge=0)
    location_tier: Literal["TIER_1", "TIER_2", "TIER_3", "RURAL"]
    entity_type: Literal["PROPRIETORSHIP", "PARTNERSHIP", "LLP", "PRIVATE_LIMITED", "INFORMAL_ENTERPRISE"]
    declared_monthly_turnover: Decimal = Field(..., ge=Decimal("0.0"), description="Declared monthly turnover in INR (must be non-negative)")
    declared_existing_monthly_emi: Decimal = Field(default=Decimal("0.0"), ge=Decimal("0.0"), description="Self-reported current debt repayment (must be non-negative)")
    has_gstin: bool = False
    gstin: Optional[str] = None
    has_udyam_registration: bool = False
    udyam_reg_number: Optional[str] = None
