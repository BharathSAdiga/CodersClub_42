from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime, timezone

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class FinancialDNA(BaseModel):
    """Deterministic behavioral financial fingerprint computed from transactions."""
    business_id: str
    assessment_id: Optional[str] = None
    calculated_at: datetime = Field(default_factory=utc_now)
    
    # Volume & Flow Metrics
    analysis_window_days: int = Field(default=180, description="Active transaction analysis window")
    total_credit_volume: float
    total_debit_volume: float
    net_operating_cashflow: float
    monthly_average_turnover: float
    daily_average_inflow: float
    daily_average_balance_proxy: float
    
    # Behavioral Velocity & Volatility (Deterministic Math)
    inflow_volatility_cv: float = Field(..., ge=0.0, description="Coefficient of variation (std_dev / mean) of weekly inflows")
    cash_velocity_days: float = Field(..., description="Average days between operating inflows and vendor outflows")
    seasonality_index: float = Field(..., ge=0.0, le=3.0, description="Ratio of peak 30d turnover to trough 30d turnover")
    weekend_to_weekday_inflow_ratio: float
    zero_inflow_days_pct: float = Field(..., ge=0.0, le=100.0, description="Percentage of days with zero recorded incoming revenue")
    
    # Concentration & Counterparty Dependency
    top_3_customer_concentration_pct: float = Field(..., ge=0.0, le=100.0)
    top_3_supplier_concentration_pct: float = Field(..., ge=0.0, le=100.0)
    
    # Identified Debt Discipline
    detected_existing_monthly_emi: float = Field(default=0.0, description="Sum of detected recurring loan/EMI debits per month")
    repayment_irregularity_events: int = Field(default=0, description="Count of missed recurring debits or bounce charges")
    
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
            "Seasonality requires at least 180 continuous days for statistically significant variance"
        ]
    )
