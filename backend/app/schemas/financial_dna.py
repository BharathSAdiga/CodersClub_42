from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime, timezone
from decimal import Decimal

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class FinancialDNA(BaseModel):
    """Deterministic behavioral financial fingerprint computed from transactions."""
    business_id: str
    assessment_id: Optional[str] = None
    calculated_at: datetime = Field(default_factory=utc_now)
    
    # Volume & Flow Metrics (Decimal-compatible for precise monetary accounting)
    analysis_window_days: int = Field(default=180, description="Active transaction analysis window")
    total_credit_volume: Decimal = Field(..., ge=Decimal("0.0"))
    total_debit_volume: Decimal = Field(..., ge=Decimal("0.0"))
    net_operating_cashflow: Decimal
    monthly_average_turnover: Decimal = Field(..., ge=Decimal("0.0"))
    daily_average_inflow: Decimal = Field(..., ge=Decimal("0.0"))
    daily_average_balance_proxy: Optional[Decimal] = Field(
        default=None,
        description="Daily average balance proxy when bank balances/eod logs are available (optional)"
    )
    
    # Behavioral Velocity & Volatility (Deterministic Math)
    inflow_volatility_cv: float = Field(..., ge=0.0, description="Coefficient of variation (std_dev / mean) of weekly inflows")
    cash_velocity_days: Optional[float] = Field(
        default=None, 
        ge=0.0,
        description="Average days between operating inflows and vendor outflows (optional when unavailable)"
    )
    seasonality_index: float = Field(
        ..., 
        ge=0.0, 
        description="Ratio of peak 30d turnover to trough 30d turnover (no arbitrary upper limit)"
    )
    weekend_to_weekday_inflow_ratio: float = Field(default=1.0, ge=0.0)
    zero_inflow_days_pct: float = Field(default=0.0, ge=0.0, le=100.0, description="Percentage of days with zero recorded incoming revenue")
    
    # Concentration & Counterparty Dependency
    top_3_customer_concentration_pct: float = Field(default=0.0, ge=0.0, le=100.0)
    top_3_supplier_concentration_pct: float = Field(default=0.0, ge=0.0, le=100.0)
    
    # Identified Debt Discipline
    detected_existing_monthly_emi: Decimal = Field(default=Decimal("0.0"), ge=Decimal("0.0"), description="Sum of detected recurring loan/EMI debits per month")
    repayment_irregularity_events: int = Field(default=0, ge=0, description="Count of missed recurring debits or bounce charges")
    
    # Audit & Calculation Transparency
    calculation_assumptions: List[str] = Field(
        default_factory=lambda: [
            "Operating cashflow equals credited customer revenue minus debited vendor/operating expenses",
            "Recurring debits matching standard bank EMI narration patterns are categorized as existing debt obligations",
            "Zero inflow days reflect non-trading calendar dates or uncaptured cash ledger entries"
        ]
    )
    input_availability: Dict[str, bool] = Field(default_factory=dict)
    limitations: List[str] = Field(
        default_factory=lambda: [
            "Excludes cash transactions not banked or captured via UPI QR rails",
            "Seasonality requires at least 180 continuous days for statistically significant variance",
            "Daily average balance is omitted when only transaction logs without running balances are provided"
        ]
    )
