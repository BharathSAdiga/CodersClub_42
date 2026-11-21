from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal, Any
from datetime import datetime, timezone
from decimal import Decimal

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

VALID_SECTORS = {
    "RETAIL_KIRANA",
    "LIGHT_MANUFACTURING",
    "TEXTILE_WEAVING",
    "FOOD_SERVICES",
    "LOGISTICS_TRANSPORT",
    "HANDICRAFTS_ARTISAN",
    "GENERAL_SERVICES"
}

def normalize_sector_str(v: Any) -> Optional[str]:
    if v is None:
        return None
    val = str(v).strip().upper()
    if val in VALID_SECTORS:
        return val
    v_lower = str(v).lower()
    if any(k in v_lower for k in ["kirana", "retail", "grocery", "provision", "store", "trade"]):
        return "RETAIL_KIRANA"
    if any(k in v_lower for k in ["manufactur", "factory", "machin", "auto"]):
        return "LIGHT_MANUFACTURING"
    if any(k in v_lower for k in ["textile", "weav", "garment", "fabric", "cloth", "silk", "loom"]):
        return "TEXTILE_WEAVING"
    if any(k in v_lower for k in ["food", "hotel", "restaurant", "cafe", "dairy", "bakery"]):
        return "FOOD_SERVICES"
    if any(k in v_lower for k in ["logistics", "transport", "freight", "courier", "truck"]):
        return "LOGISTICS_TRANSPORT"
    if any(k in v_lower for k in ["handicraft", "artisan", "craft", "wood", "pottery", "jewel"]):
        return "HANDICRAFTS_ARTISAN"
    return "GENERAL_SERVICES"

def normalize_entity_type_str(v: Any) -> Optional[str]:
    if v is None:
        return None
    val = str(v).strip().upper()
    valid = {"PROPRIETORSHIP", "PARTNERSHIP", "LLP", "PRIVATE_LIMITED", "INFORMAL_ENTERPRISE"}
    if val in valid:
        return val
    v_lower = str(v).lower()
    if "llp" in v_lower:
        return "LLP"
    if "proprietor" in v_lower or "sole" in v_lower:
        return "PROPRIETORSHIP"
    if "partner" in v_lower:
        return "PARTNERSHIP"
    if "pvt" in v_lower or "private" in v_lower or "ltd" in v_lower or "limited" in v_lower:
        return "PRIVATE_LIMITED"
    return "PROPRIETORSHIP"

def normalize_location_tier_str(v: Any) -> Optional[str]:
    if v is None:
        return None
    val = str(v).strip().upper()
    valid = {"TIER_1", "TIER_2", "TIER_3", "RURAL"}
    if val in valid:
        return val
    v_lower = str(v).lower()
    if "1" in v_lower:
        return "TIER_1"
    if "2" in v_lower:
        return "TIER_2"
    if "3" in v_lower:
        return "TIER_3"
    if "rural" in v_lower or "village" in v_lower:
        return "RURAL"
    return "TIER_2"

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

    @field_validator("sector", mode="before")
    @classmethod
    def clean_sector(cls, v):
        return normalize_sector_str(v) or "GENERAL_SERVICES"

    @field_validator("entity_type", mode="before")
    @classmethod
    def clean_entity(cls, v):
        return normalize_entity_type_str(v) or "PROPRIETORSHIP"

    @field_validator("location_tier", mode="before")
    @classmethod
    def clean_tier(cls, v):
        return normalize_location_tier_str(v) or "TIER_2"

    @field_validator("declared_monthly_turnover", "declared_existing_monthly_emi", mode="before")
    @classmethod
    def parse_decimal(cls, v):
        if v is None or v == "":
            return Decimal("0.0")
        try:
            return Decimal(str(v))
        except Exception:
            return v

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

    @field_validator("sector", mode="before")
    @classmethod
    def clean_sector(cls, v):
        return normalize_sector_str(v) or "GENERAL_SERVICES"

    @field_validator("entity_type", mode="before")
    @classmethod
    def clean_entity(cls, v):
        return normalize_entity_type_str(v) or "PROPRIETORSHIP"

    @field_validator("location_tier", mode="before")
    @classmethod
    def clean_tier(cls, v):
        return normalize_location_tier_str(v) or "TIER_2"

    @field_validator("declared_monthly_turnover", "declared_existing_monthly_emi", mode="before")
    @classmethod
    def parse_decimal(cls, v):
        if v is None or v == "":
            return Decimal("0.0")
        try:
            return Decimal(str(v))
        except Exception:
            return v

class BusinessProfileUpdate(BaseModel):
    legal_name: Optional[str] = None
    trade_name: Optional[str] = None
    sector: Optional[Literal[
        "RETAIL_KIRANA",
        "LIGHT_MANUFACTURING",
        "TEXTILE_WEAVING",
        "FOOD_SERVICES",
        "LOGISTICS_TRANSPORT",
        "HANDICRAFTS_ARTISAN",
        "GENERAL_SERVICES"
    ]] = None
    vintage_months: Optional[int] = Field(default=None, ge=0)
    location_tier: Optional[Literal["TIER_1", "TIER_2", "TIER_3", "RURAL"]] = None
    entity_type: Optional[Literal["PROPRIETORSHIP", "PARTNERSHIP", "LLP", "PRIVATE_LIMITED", "INFORMAL_ENTERPRISE"]] = None
    declared_monthly_turnover: Optional[Decimal] = Field(default=None, ge=Decimal("0.0"))
    declared_existing_monthly_emi: Optional[Decimal] = Field(default=None, ge=Decimal("0.0"))
    has_gstin: Optional[bool] = None
    gstin: Optional[str] = None
    has_udyam_registration: Optional[bool] = None
    udyam_reg_number: Optional[str] = None

    @field_validator("sector", mode="before")
    @classmethod
    def clean_sector(cls, v):
        if v is None:
            return None
        return normalize_sector_str(v)

    @field_validator("entity_type", mode="before")
    @classmethod
    def clean_entity(cls, v):
        if v is None:
            return None
        return normalize_entity_type_str(v)

    @field_validator("location_tier", mode="before")
    @classmethod
    def clean_tier(cls, v):
        if v is None:
            return None
        return normalize_location_tier_str(v)

    @field_validator("declared_monthly_turnover", "declared_existing_monthly_emi", mode="before")
    @classmethod
    def parse_decimal(cls, v):
        if v is None or v == "":
            return None
        try:
            return Decimal(str(v))
        except Exception:
            return v
