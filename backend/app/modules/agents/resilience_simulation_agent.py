import time
from typing import Optional, List, Dict, Any
from decimal import Decimal

from ...schemas.resilience import ShockScenarioInput, ShockSimulationResult, DebtObligation
from ..resilience_engine import run_cashflow_stress_simulation
from .base_agent import BaseAgent
from .context import AssessmentContext

class ResilienceSimulationAgent(BaseAgent):
    """
    Resilience Simulation Agent.
    Runs 7-scenario macro and cash-flow shock simulations, calculates post-shock DSCR,
    safe monthly EMI headroom, maximum affordable principal, and compares repayment structures.
    Consumes Atharv's deterministic cash-flow resilience engine.
    """
    def __init__(self):
        super().__init__(agent_name="ResilienceSimulationAgent")

    async def execute(self, context: AssessmentContext) -> ShockSimulationResult:
        start_time = time.monotonic()
        context.record_stage("RESILIENCE_SIMULATION", "RUNNING")
        
        scenario = context.scenario_input or ShockScenarioInput()
        
        await self.emit_event(
            context=context,
            step_name="simulate_cashflow_shocks",
            status="RUNNING",
            event_type="TASK_START",
            tool_called="run_cashflow_stress_simulation",
            tool_input_summary=f"Evaluating 7 shock scenarios for {context.business_profile.trade_name}",
            message="Running deterministic cash-flow stress testing, debt reconciliation, and loan affordability simulation..."
        )

        try:
            profile = context.business_profile
            dna = context.financial_dna
            
            monthly_turnover = dna.monthly_average_turnover if dna else profile.declared_monthly_turnover
            liquidity_buffer = dna.daily_average_balance_proxy if dna else None

            # Reconcile obligations
            declared_obs: List[DebtObligation] = []
            if profile.declared_existing_monthly_emi > Decimal("0.0"):
                declared_obs.append(
                    DebtObligation(
                        obligation_id=f"obl_declared_{profile.business_id[:8]}",
                        lender_name="Reported Existing Loan/Credit",
                        monthly_payment=profile.declared_existing_monthly_emi,
                        source="DECLARED"
                    )
                )

            # Verified obligations from bank debits if category EXISTING_LOAN_EMI
            verified_obs: List[DebtObligation] = []
            for t in context.transactions:
                if t.direction == "DEBIT" and t.category == "EXISTING_LOAN_EMI":
                    verified_obs.append(
                        DebtObligation(
                            obligation_id=f"obl_tx_{t.transaction_id}",
                            lender_name=t.counterparty_id or "Banking Loan Repayment",
                            monthly_payment=t.amount,
                            source="VERIFIED_BANK_DEBIT"
                        )
                    )

            # If no verified transactions but declared EMI exists, pass declared as verified to prevent under-counting
            if not verified_obs and declared_obs:
                verified_obs = declared_obs

            resilience = run_cashflow_stress_simulation(
                business_id=context.business_id,
                assessment_id=context.assessment_id,
                monthly_turnover=monthly_turnover,
                declared_obligations=declared_obs,
                verified_obligations=verified_obs,
                liquidity_buffer_inr=liquidity_buffer,
                shock_scenario=scenario,
                proposed_loan_amount_inr=context.requested_loan_amount_inr
            )

            worst_deficit = min(
                (s.projected_monthly_cash_surplus for s in resilience.scenario_suite_evaluations),
                default=resilience.post_shock_monthly_surplus
            )

            context.resilience_result = resilience
            context.agent_results["resilience_simulation"] = {
                "resilience_classification": resilience.resilience_classification,
                "post_shock_dscr": resilience.post_shock_dscr,
                "unencumbered_monthly_surplus": float(resilience.affordability.unencumbered_monthly_cash_surplus),
                "max_safe_monthly_emi": float(resilience.affordability.maximum_affordable_monthly_emi),
                "max_affordable_principal": float(resilience.affordability.maximum_affordable_loan_principal),
                "is_cash_generative_under_shock": resilience.is_cash_generative_under_shock,
                "worst_case_monthly_deficit": float(worst_deficit)
            }

            duration_ms = (time.monotonic() - start_time) * 1000.0
            await self.emit_event(
                context=context,
                step_name="simulate_cashflow_shocks",
                status="COMPLETED",
                event_type="STRUCTURED_RESULT",
                tool_called="run_cashflow_stress_simulation",
                execution_duration_ms=duration_ms,
                structured_findings=context.agent_results["resilience_simulation"],
                message=f"Resilience analysis complete: Tier `{resilience.resilience_classification}` | Max Affordable Principal: ₹{resilience.affordability.maximum_affordable_loan_principal:,.2f}"
            )
            context.record_stage("RESILIENCE_SIMULATION", "COMPLETED")
            return resilience

        except Exception as e:
            duration_ms = (time.monotonic() - start_time) * 1000.0
            error_msg = f"Resilience simulation error: {str(e)}"
            context.record_error("ResilienceSimulationAgent", "simulate_cashflow_shocks", error_msg)
            context.record_stage("RESILIENCE_SIMULATION", "FAILED")
            
            await self.emit_event(
                context=context,
                step_name="simulate_cashflow_shocks",
                status="FAILED",
                event_type="FAILURE",
                execution_duration_ms=duration_ms,
                error_message=error_msg,
                message=f"Resilience Simulation agent encountered an error: {str(e)}"
            )
            raise
