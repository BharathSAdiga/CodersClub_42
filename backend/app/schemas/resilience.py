from pydantic import BaseModel, Field
from typing import List, Literal, Dict, Optional
from datetime import datetime, timezone

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class ShockScenarioInput(BaseModel):
    """Stress scenario parameters for deterministic cash-flow resilience simulation."""
    revenue_contraction_pct: float = Field(default=25.0, ge=0.0, le=90.0, description="Hypothetical revenue drop %")
    cogs_inflation_pct: float = Field(default=15.0, ge=0.0, le=90.0, description="Cost of goods / operating expense increase %")
    receivable_delay_days: int = Field(default=30, ge=0, le=120, description="Delay in customer cash realization")
    scenario_name: str = Field(default="Standard Economic Stress Scenario")

class AffordabilityAnalysis(BaseModel):
    """
    Deterministic loan affordability engine.
    Accounts for existing debt obligations and proposed repayment WITHOUT double-counting.
    """
    monthly_operating_inflow: float
    monthly_operating_expenses: float
    net_operating_surplus_pre_debt: float
    
    # Reconciled Existing Debt (Takes verified bank debits or declared EMI, avoiding double-counting)
    declared_existing_monthly_emi: float
    verified_existing_monthly_debt_debits: float
    reconciled_existing_debt_service: float = Field(
        ...,
        description="Max of verified or declared existing debt, ensuring single-counted obligation"
    )
    debt_reconciliation_method: str = Field(
        default="MAX_CONSERVATIVE: max(verified_bank_debits, declared_emi) to prevent duplicate penalty"
    )
    
    # Unencumbered Cash Surplus
    unencumbered_monthly_cash_surplus: float = Field(
        ...,
        description="Operating surplus minus reconciled existing debt"
    )
    
    # Proposed Loan Affordability
    proposed_loan_amount_inr: float
    proposed_tenure_months: int
    indicative_annual_interest_rate_pct: float
    proposed_monthly_emi: float
    
    # Debt Service Coverage Ratio (DSCR)
    total_post_borrowing_monthly_debt_service: float = Field(
        ...,
        description="reconciled_existing_debt_service + proposed_monthly_emi"
    )
    projected_dscr: float = Field(
        ...,
        description="net_operating_surplus_pre_debt / total_post_borrowing_monthly_debt_service"
    )
    maximum_affordable_monthly_emi: float
    maximum_affordable_loan_principal: float

class ShockSimulationResult(BaseModel):
    """Deterministic cash-flow simulation output under stress conditions."""
    business_id: str
    assessment_id: Optional[str] = None
    calculated_at: datetime = Field(default_factory=utc_now)
    
    # Applied Stress Parameters
    applied_scenario: ShockScenarioInput
    
    # Runway and Liquidity
    baseline_cash_runway_days: int = Field(..., description="Runway under normal conditions without new credit")
    stressed_cash_runway_days: int = Field(..., description="Survival runway under applied shock")
    liquidity_buffer_depletion_pct: float = Field(..., ge=0.0, le=100.0)
    
    # Post-Shock Affordability
    post_shock_monthly_surplus: float
    post_shock_dscr: float
    max_tolerable_revenue_contraction_pct: float = Field(
        ..., 
        description="Break-even revenue drop percentage before DSCR drops below 1.0"
    )
    
    # Qualitative Resilience Categorization
    resilience_classification: Literal[
        "HIGHLY_RESILIENT",
        "MODERATELY_RESILIENT",
        "VULNERABLE_TO_SHOCK",
        "CRITICAL_ILLIQUIDITY"
    ]
    
    # Affordability Breakdown
    affordability: AffordabilityAnalysis
    
    calculation_assumptions: List[str] = Field(
        default_factory=lambda: [
            "Fixed operating costs (rent, utilities) cannot be immediately cut in the first 60 days of shock",
            "Existing debt service continues uninterrupted during shock period",
            "Emergency liquidity equals 30-day average minimum end-of-day bank balance proxy"
        ]
    )
    input_availability: Dict[str, bool] = Field(default_factory=dict)
    limitations: List[str] = Field(
        default_factory=lambda: [
            "Assumes static counterparty behavior without discretionary supplier credit extensions",
            "Simulation does not model equity infusions or asset liquidations"
        ]
    )
