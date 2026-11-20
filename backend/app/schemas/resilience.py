from pydantic import BaseModel, Field
from typing import List, Literal, Dict, Optional
from datetime import datetime, timezone
from decimal import Decimal

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class ShockScenarioInput(BaseModel):
    """Stress scenario parameters for deterministic cash-flow resilience simulation."""
    revenue_contraction_pct: float = Field(default=25.0, ge=0.0, le=90.0, description="Hypothetical revenue drop %")
    cogs_inflation_pct: float = Field(default=15.0, ge=0.0, le=90.0, description="Cost of goods / operating expense increase %")
    receivable_delay_days: int = Field(default=30, ge=0, le=120, description="Delay in customer cash realization")
    scenario_name: str = Field(default="Standard Economic Stress Scenario")

class DebtObligation(BaseModel):
    """Individual loan or recurring debt obligation for obligation-level matching."""
    obligation_id: str
    lender_name: Optional[str] = None
    monthly_payment: Decimal = Field(..., ge=Decimal("0.0"), description="Monthly obligation amount in INR")
    source: Literal["DECLARED", "VERIFIED_BANK_DEBIT", "MATCHED", "UNMATCHED"]
    matched_reference_id: Optional[str] = Field(
        default=None,
        description="ID of the matching counterparty obligation if matched"
    )
    is_matched: bool = False
    confidence_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)

class RepaymentStructureComparison(BaseModel):
    """Evaluation of loan affordability across different repayment structures."""
    structure_type: Literal[
        "STANDARD_MONTHLY_EMI",
        "REVENUE_LINKED",
        "SEASONALITY_ADJUSTED"
    ]
    description: str
    loan_principal: Decimal = Field(..., ge=Decimal("0.0"))
    tenure_months: int = Field(..., ge=1)
    indicative_annual_interest_rate_pct: float = Field(..., ge=0.0)
    total_repayment_amount: Decimal = Field(..., ge=Decimal("0.0"))
    total_interest_amount: Decimal = Field(..., ge=Decimal("0.0"))
    average_monthly_payment: Decimal = Field(..., ge=Decimal("0.0"))
    peak_monthly_payment: Decimal = Field(..., ge=Decimal("0.0"))
    trough_monthly_payment: Decimal = Field(..., ge=Decimal("0.0"))
    repayment_pressure_peak_pct: float = Field(
        ...,
        ge=0.0,
        description="Peak payment as % of baseline monthly operating turnover"
    )
    is_within_safe_limit: bool = True

class ScenarioEvaluation(BaseModel):
    """Detailed outcome of a specific economic or operational stress scenario."""
    scenario_id: str
    scenario_name: str
    scenario_description: str
    projected_monthly_cash_surplus: Decimal
    existing_debt_service: Decimal = Field(..., ge=Decimal("0.0"))
    proposed_emi: Decimal = Field(..., ge=Decimal("0.0"))
    total_debt_service: Decimal = Field(..., ge=Decimal("0.0"))
    post_borrowing_dscr: Optional[float] = Field(
        default=None,
        description="None if debt service is zero (debt-free)"
    )
    minimum_cash_balance: Optional[Decimal] = Field(
        default=None,
        description="Minimum projected liquidity balance during shock window (None if balance unavailable)"
    )
    cash_runway_days: Optional[int] = Field(
        default=None,
        description="None if cash generative under shock or balance unavailable"
    )
    liquidity_buffer_depletion_pct: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=100.0,
        description="None if liquidity balance unavailable"
    )
    recovery_period_months: Optional[int] = Field(
        default=None,
        description="Months needed to restore depleted buffer under normal surplus"
    )
    is_cash_generative: bool = True

class AffordabilityAnalysis(BaseModel):
    """
    Deterministic loan affordability engine.
    Performs obligation-level debt matching to prevent double-counting obligations.
    Safe handling for zero debt service and negative operating surplus.
    """
    monthly_operating_inflow: Decimal = Field(..., ge=Decimal("0.0"))
    monthly_operating_expenses: Decimal = Field(..., ge=Decimal("0.0"))
    net_operating_surplus_pre_debt: Decimal
    
    # Obligation-Level Debt Reconciliation
    declared_obligations: List[DebtObligation] = Field(default_factory=list)
    verified_obligations: List[DebtObligation] = Field(default_factory=list)
    matched_obligations: List[DebtObligation] = Field(
        default_factory=list,
        description="Obligations verified in bank debits matching declared loans (counted once)"
    )
    unmatched_declared_obligations: List[DebtObligation] = Field(
        default_factory=list,
        description="Declared loans without corresponding bank debits detected"
    )
    unmatched_verified_obligations: List[DebtObligation] = Field(
        default_factory=list,
        description="Bank recurring loan debits not declared by applicant"
    )
    
    # Reconciled Totals (Decimal precision)
    declared_existing_monthly_emi: Decimal = Field(default=Decimal("0.0"), ge=Decimal("0.0"))
    verified_existing_monthly_debt_debits: Decimal = Field(default=Decimal("0.0"), ge=Decimal("0.0"))
    reconciled_existing_debt_service: Decimal = Field(
        ...,
        ge=Decimal("0.0"),
        description="Total reconciled monthly debt: sum(matched once) + sum(unmatched declared) + sum(unmatched verified)"
    )
    debt_reconciliation_method: str = Field(
        default="OBLIGATION_LEVEL_MATCHING: Matched obligations counted once; unmatched obligations added without double-counting."
    )
    
    # Unencumbered Cash Surplus (Can be negative if operating expenses + existing debt > inflows)
    unencumbered_monthly_cash_surplus: Decimal = Field(
        ...,
        description="Operating surplus minus reconciled existing debt"
    )
    
    # Proposed Loan Facility
    proposed_loan_amount_inr: Decimal = Field(default=Decimal("0.0"), ge=Decimal("0.0"))
    proposed_tenure_months: int = Field(default=0, ge=0)
    indicative_annual_interest_rate_pct: float = Field(default=0.0, ge=0.0)
    proposed_monthly_emi: Decimal = Field(default=Decimal("0.0"), ge=Decimal("0.0"))
    
    # Debt Service Coverage Ratio (DSCR) with safe zero-debt handling
    total_post_borrowing_monthly_debt_service: Decimal = Field(
        ...,
        ge=Decimal("0.0"),
        description="reconciled_existing_debt_service + proposed_monthly_emi"
    )
    is_debt_free: bool = Field(
        default=False, 
        description="True if total existing debt and proposed debt service are both zero"
    )
    projected_dscr: Optional[float] = Field(
        default=None,
        description="net_operating_surplus_pre_debt / total_post_borrowing_monthly_debt_service (None if debt service is zero)"
    )
    maximum_affordable_monthly_emi: Decimal = Field(
        default=Decimal("0.0"),
        ge=Decimal("0.0"),
        description="Capped at 0 if surplus is negative"
    )
    maximum_affordable_loan_principal: Decimal = Field(
        default=Decimal("0.0"),
        ge=Decimal("0.0"),
        description="Exact amortization formula limit; capped at 0 if surplus is negative"
    )
    repayment_comparisons: List[RepaymentStructureComparison] = Field(default_factory=list)

class ShockSimulationResult(BaseModel):
    """Deterministic cash-flow simulation output under stress conditions with safe edge-case handling."""
    business_id: str
    assessment_id: Optional[str] = None
    calculated_at: datetime = Field(default_factory=utc_now)
    
    # Applied Stress Parameters
    applied_scenario: ShockScenarioInput
    
    # Runway and Liquidity (Safe handling for zero burn or unavailable bank balance)
    baseline_cash_runway_days: Optional[int] = Field(
        default=None,
        description="Baseline runway in days (None if bank balance/liquidity data is unavailable)"
    )
    stressed_cash_runway_days: Optional[int] = Field(
        default=None,
        description="Stressed runway in days (None if business remains cash-generative with burn <= 0)"
    )
    is_cash_generative_under_shock: bool = Field(
        default=False,
        description="True if net operating cashflow remains positive under shock (zero cash burn)"
    )
    liquidity_buffer_depletion_pct: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=100.0,
        description="Percentage of liquid buffer depleted (None if liquidity balance is unavailable)"
    )
    minimum_projected_cash_balance: Optional[Decimal] = Field(
        default=None,
        description="Estimated minimum cash balance during the stress window"
    )
    recovery_period_months: Optional[int] = Field(
        default=None,
        description="Estimated months to restore liquidity buffer to baseline"
    )
    
    # Post-Shock Affordability
    post_shock_monthly_surplus: Decimal
    post_shock_dscr: Optional[float] = Field(
        default=None,
        description="Post-shock DSCR (None if post-borrowing debt service is zero)"
    )
    max_tolerable_revenue_contraction_pct: float = Field(
        ..., 
        description="Break-even revenue drop percentage before pre-debt operating cashflow drops below zero"
    )
    
    # Qualitative Resilience Categorization
    resilience_classification: Literal[
        "HIGHLY_RESILIENT",
        "MODERATELY_RESILIENT",
        "VULNERABLE_TO_SHOCK",
        "CRITICAL_ILLIQUIDITY"
    ]
    
    # Affordability Breakdown & Multi-Scenario Suite
    affordability: AffordabilityAnalysis
    scenario_suite_evaluations: List[ScenarioEvaluation] = Field(default_factory=list)
    
    calculation_assumptions: List[str] = Field(
        default_factory=lambda: [
            "Fixed operating costs cannot be immediately cut in the first 60 days of shock",
            "Existing debt service continues uninterrupted during shock period",
            "Emergency liquidity equals 30-day average minimum end-of-day bank balance proxy when available",
            "Loan affordability is strictly bounded by maximum safe EMI calculated from unencumbered surplus"
        ]
    )
    input_availability: Dict[str, bool] = Field(default_factory=dict)
    limitations: List[str] = Field(
        default_factory=lambda: [
            "Assumes static counterparty behavior without discretionary supplier credit extensions",
            "Simulation does not model equity infusions or asset liquidations",
            "Runway is not computed when enterprise is cash-flow positive under stress"
        ]
    )
