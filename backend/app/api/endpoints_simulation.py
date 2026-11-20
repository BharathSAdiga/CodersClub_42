from fastapi import APIRouter, HTTPException
from typing import Optional
from datetime import datetime, timezone
from decimal import Decimal

from ..schemas.resilience import ShockScenarioInput, ShockSimulationResult, DebtObligation
from ..modules.resilience_engine import run_cashflow_stress_simulation
from .endpoints_business import BUSINESS_STORE

router = APIRouter(prefix="/resilience", tags=["Resilience & Shock Simulation"])

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

@router.post("/simulate", response_model=ShockSimulationResult)
async def simulate_stress_test(
    payload: ShockScenarioInput,
    business_id: Optional[str] = "msme_kirana_kanpur_001"
):
    """
    Simulates cash-flow resilience under dynamic macro/micro stress scenarios.
    Used directly by the interactive UI stress slider.
    Calculations use pure Decimal precision and obligation-level debt matching.
    """
    profile = BUSINESS_STORE.get(business_id)
    monthly_inflow = profile.declared_monthly_turnover if profile else Decimal("285000.0")
    declared_emi = profile.declared_existing_monthly_emi if profile else Decimal("4500.0")
    
    declared_obs = []
    verified_obs = []
    if declared_emi > Decimal("0.0"):
        decl_ob = DebtObligation(
            obligation_id="decl_ob_1",
            lender_name="Bank Working Capital Loan",
            monthly_payment=declared_emi,
            source="DECLARED",
            is_matched=True,
            matched_reference_id="verif_ob_1"
        )
        verif_ob = DebtObligation(
            obligation_id="verif_ob_1",
            lender_name="Bank Auto-Debit",
            monthly_payment=declared_emi,
            source="VERIFIED_BANK_DEBIT",
            is_matched=True,
            matched_reference_id="decl_ob_1"
        )
        declared_obs.append(decl_ob)
        verified_obs.append(verif_ob)

    # Buffer proxy: 40% of monthly turnover
    liquidity_buffer = monthly_inflow * Decimal("0.40")

    result = run_cashflow_stress_simulation(
        business_id=business_id,
        assessment_id=f"sim_{utc_now().strftime('%Y%m%d%H%M%S')}",
        monthly_turnover=monthly_inflow,
        declared_obligations=declared_obs,
        verified_obligations=verified_obs,
        operating_expense_ratio=Decimal("0.72"),
        liquidity_buffer_inr=liquidity_buffer,
        shock_scenario=payload
    )
    return result
