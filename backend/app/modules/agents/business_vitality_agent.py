import time
from typing import Optional, Dict, Any, List
from decimal import Decimal
from datetime import datetime, timezone
from collections import defaultdict

from .base_agent import BaseAgent
from .context import AssessmentContext

class BusinessVitalityAgent(BaseAgent):
    """
    Business Vitality Agent.
    Evaluates business continuity, operational vintage, revenue trend trajectory,
    seasonality cycles, early-warning risk indicators, and recovery elasticity.
    """
    def __init__(self):
        super().__init__(agent_name="BusinessVitalityAgent")

    async def execute(self, context: AssessmentContext) -> Dict[str, Any]:
        start_time = time.monotonic()
        context.record_stage("BUSINESS_VITALITY_ANALYSIS", "RUNNING")
        
        await self.emit_event(
            context=context,
            step_name="evaluate_vitality_and_stability",
            status="RUNNING",
            event_type="TASK_START",
            tool_called="analyze_vitality_trajectory",
            tool_input_summary=f"Evaluating business continuity for {context.business_profile.trade_name} ({context.business_profile.vintage_months}m vintage)",
            message="Analyzing operational vintage, month-over-month revenue stability, and early-warning distress indicators..."
        )

        try:
            profile = context.business_profile
            txs = context.transactions
            
            vintage_months = profile.vintage_months
            early_warnings: List[str] = []
            strengths: List[str] = []

            # Vintage assessment
            if vintage_months >= 36:
                vintage_rating = "MATURE_ESTABLISHED"
                strengths.append(f"Strong operational vintage ({vintage_months} months / {vintage_months // 12} years) demonstrating business survival")
            elif vintage_months >= 12:
                vintage_rating = "STABILIZING"
                strengths.append(f"Operating vintage of {vintage_months} months exceeds preliminary 1-year establishment hurdle")
            else:
                vintage_rating = "EARLY_STAGE"
                early_warnings.append(f"Early-stage enterprise ({vintage_months} months vintage) lacks long-term survival track record")

            # Monthly revenue trajectory
            monthly_credits = defaultdict(Decimal)
            for t in txs:
                if t.direction == "CREDIT":
                    month_key = t.timestamp.strftime("%Y-%m")
                    monthly_credits[month_key] += t.amount

            sorted_months = sorted(monthly_credits.keys())
            trajectory = "STABLE"
            growth_pct = 0.0

            if len(sorted_months) >= 2:
                first_month_vol = monthly_credits[sorted_months[0]]
                last_month_vol = monthly_credits[sorted_months[-1]]
                if first_month_vol > Decimal("0.0"):
                    growth_pct = float(round(((last_month_vol - first_month_vol) / first_month_vol) * Decimal("100.0"), 2))
                    if growth_pct >= 15.0:
                        trajectory = "EXPANDING"
                        strengths.append(f"Expanding revenue trajectory (+{growth_pct:.1f}% across observed window)")
                    elif growth_pct <= -25.0:
                        trajectory = "CONTRACTING"
                        early_warnings.append(f"Sharp revenue contraction detected (-{abs(growth_pct):.1f}% over observed period)")

            # Check seasonality
            seasonality_index = 1.15
            if context.financial_dna:
                seasonality_index = context.financial_dna.seasonality_index
            
            is_seasonal = seasonality_index >= 1.4
            if is_seasonal:
                early_warnings.append(f"High seasonal cashflow volatility (peak-to-trough ratio {seasonality_index:.2f}x)")

            vitality_score = 75.0
            if vintage_rating == "MATURE_ESTABLISHED":
                vitality_score += 15.0
            elif vintage_rating == "EARLY_STAGE":
                vitality_score -= 15.0

            if trajectory == "EXPANDING":
                vitality_score += 10.0
            elif trajectory == "CONTRACTING":
                vitality_score -= 20.0

            vitality_score = max(20.0, min(95.0, vitality_score))

            vitality_result = {
                "vintage_months": vintage_months,
                "vintage_rating": vintage_rating,
                "trajectory": trajectory,
                "growth_pct": growth_pct,
                "seasonality_index": seasonality_index,
                "is_seasonal": is_seasonal,
                "vitality_score": vitality_score,
                "early_warning_indicators": early_warnings,
                "vitality_strengths": strengths
            }

            context.vitality_analysis = vitality_result
            context.agent_results["business_vitality"] = vitality_result

            duration_ms = (time.monotonic() - start_time) * 1000.0
            await self.emit_event(
                context=context,
                step_name="evaluate_vitality_and_stability",
                status="COMPLETED",
                event_type="STRUCTURED_RESULT",
                tool_called="analyze_vitality_trajectory",
                execution_duration_ms=duration_ms,
                structured_findings=vitality_result,
                message=f"Business vitality evaluated: {vintage_rating} ({vintage_months}m vintage), Trajectory: {trajectory}, Score: {vitality_score:.1f}/100"
            )
            context.record_stage("BUSINESS_VITALITY_ANALYSIS", "COMPLETED")
            return vitality_result

        except Exception as e:
            duration_ms = (time.monotonic() - start_time) * 1000.0
            error_msg = f"Business vitality analysis error: {str(e)}"
            context.record_error("BusinessVitalityAgent", "evaluate_vitality_and_stability", error_msg)
            context.record_stage("BUSINESS_VITALITY_ANALYSIS", "FAILED")
            
            await self.emit_event(
                context=context,
                step_name="evaluate_vitality_and_stability",
                status="FAILED",
                event_type="FAILURE",
                execution_duration_ms=duration_ms,
                error_message=error_msg,
                message=f"Business Vitality agent encountered an error: {str(e)}"
            )
            raise
