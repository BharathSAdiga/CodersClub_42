from typing import Optional, List, Dict, Any, Tuple
from decimal import Decimal
from ...schemas.financial_dna import FinancialDNA
from ...schemas.graph import GraphMetrics
from ...schemas.evidence import EvidenceConfidence
from ...schemas.resilience import ShockSimulationResult
from ...schemas.business import BusinessProfile

def evaluate_financial_health(dna: Optional[FinancialDNA]) -> Dict[str, Any]:
    """
    Evaluates cashflow stability, turnover velocity, and operational profitability.
    """
    if dna is None:
        return {
            "health_grade": "UNASSESSED",
            "volatility_status": "UNKNOWN",
            "cashflow_margin_pct": 0.0,
            "observations": ["Financial DNA data unavailable for cashflow health audit."]
        }
    
    inflow = dna.monthly_average_turnover
    net_cf = dna.net_operating_cashflow
    margin_pct = float((net_cf / max(inflow * Decimal("6.0"), Decimal("1.0"))) * Decimal("100.0")) if inflow > Decimal("0.0") else 0.0
    
    observations = []
    if dna.inflow_volatility_cv <= 0.25:
        vol_status = "STABLE"
        observations.append(f"Highly stable recurring revenue (Inflow CV: {dna.inflow_volatility_cv:.2f}).")
    elif dna.inflow_volatility_cv <= 0.50:
        vol_status = "MODERATE_VARIANCE"
        observations.append(f"Moderate weekly revenue fluctuation (Inflow CV: {dna.inflow_volatility_cv:.2f}).")
    else:
        vol_status = "HIGHLY_VOLATILE"
        observations.append(f"High revenue volatility (Inflow CV: {dna.inflow_volatility_cv:.2f}), requiring liquidity cushioning.")

    if dna.cash_velocity_days is not None:
        if dna.cash_velocity_days <= 5.0:
            observations.append(f"Rapid operational cash velocity ({dna.cash_velocity_days:.1f} days) indicating fast working capital turnover.")
        elif dna.cash_velocity_days > 15.0:
            observations.append(f"Extended cash velocity cycle ({dna.cash_velocity_days:.1f} days), suggesting working capital lockup.")

    return {
        "health_grade": "HEALTHY" if dna.inflow_volatility_cv <= 0.40 and net_cf > Decimal("0.0") else "CONSTRAINED",
        "volatility_status": vol_status,
        "cashflow_margin_pct": round(margin_pct, 2),
        "observations": observations
    }

def evaluate_repayment_capacity(resilience: Optional[ShockSimulationResult]) -> Dict[str, Any]:
    """
    Evaluates debt service coverage, unencumbered surplus, and safe borrowing capacity.
    """
    if resilience is None:
        return {
            "capacity_grade": "UNASSESSED",
            "unencumbered_monthly_surplus": Decimal("0.0"),
            "baseline_dscr": None,
            "max_affordable_loan": Decimal("0.0"),
            "observations": ["Resilience simulation data unavailable for debt capacity audit."]
        }

    affordability = resilience.affordability
    surplus = affordability.unencumbered_monthly_cash_surplus
    dscr = affordability.projected_dscr
    is_debt_free = affordability.is_debt_free
    max_principal = affordability.maximum_affordable_loan_principal
    
    observations = []
    if surplus <= Decimal("0.0"):
        capacity = "DEFICIT"
        observations.append(f"Operating cashflow deficit of ₹{abs(surplus):,.2f}/month after existing debt obligations.")
    elif surplus > Decimal("50000.00"):
        capacity = "STRONG"
        observations.append(f"Robust unencumbered operating surplus of ₹{surplus:,.2f}/month.")
    else:
        capacity = "MODEST"
        observations.append(f"Modest unencumbered operating surplus of ₹{surplus:,.2f}/month.")

    if is_debt_free:
        observations.append("Debt-free enterprise; 100% of generated operating surplus is unencumbered.")
    elif dscr is not None:
        if dscr >= 1.50:
            observations.append(f"Strong baseline DSCR ({dscr:.2f}x) provides substantial debt servicing buffer.")
        elif dscr >= 1.15:
            observations.append(f"Adequate baseline DSCR ({dscr:.2f}x) meeting minimum prudential debt service thresholds.")
        else:
            observations.append(f"Constrained baseline DSCR ({dscr:.2f}x < 1.15x), signaling tight debt servicing capacity.")

    return {
        "capacity_grade": capacity,
        "unencumbered_monthly_surplus": surplus,
        "baseline_dscr": dscr,
        "max_affordable_loan": max_principal,
        "observations": observations
    }

def evaluate_business_continuity(
    profile: Optional[BusinessProfile],
    dna: Optional[FinancialDNA]
) -> Dict[str, Any]:
    """
    Evaluates operating vintage, sector stability, and counterparty concentration risk.
    """
    observations = []
    vintage = profile.vintage_months if profile else 0
    if vintage >= 36:
        continuity = "ESTABLISHED"
        observations.append(f"Established enterprise with {vintage} months ({vintage // 12} years) of continuous operations.")
    elif vintage >= 12:
        continuity = "EMERGING"
        observations.append(f"Emerging enterprise with {vintage} months operating vintage.")
    else:
        continuity = "NASCENT"
        observations.append(f"Nascent operational vintage ({vintage} months); track record is limited.")

    if dna:
        if dna.top_3_customer_concentration_pct > 60.0:
            observations.append(f"High customer concentration: top 3 counterparties drive {dna.top_3_customer_concentration_pct:.1f}% of receipts.")
        elif dna.top_3_customer_concentration_pct > 0.0:
            observations.append(f"Healthy customer diversification: top 3 counterparties comprise only {dna.top_3_customer_concentration_pct:.1f}% of turnover.")

    return {
        "continuity_grade": continuity,
        "vintage_months": vintage,
        "observations": observations
    }

def evaluate_evidence_confidence(evidence: Optional[EvidenceConfidence]) -> Dict[str, Any]:
    """
    Evaluates evidence integrity and data completeness.
    IMPORTANT: Missing evidence is isolated as epistemic uncertainty and does NOT mean poor financial health.
    """
    if evidence is None:
        return {
            "evidence_grade": "INSUFFICIENT",
            "score": 0.0,
            "missing_fields": ["ALL_TRANSACTIONAL_RECORDS"],
            "observations": ["Zero verifiable digital evidence provided."]
        }

    score = evidence.evidence_confidence_score
    missing = evidence.missing_evidence_fields
    
    observations = []
    if score >= 75.0:
        grade = "HIGH_CONFIDENCE"
        observations.append(f"High data integrity score ({score:.1f}%). Primary banking records cross-validated.")
    elif score >= 45.0:
        grade = "MODERATE_CONFIDENCE"
        observations.append(f"Moderate evidence confidence ({score:.1f}%). Core cashflow verified, secondary tax/statutory data absent.")
    else:
        grade = "INSUFFICIENT"
        observations.append(f"Low evidence confidence ({score:.1f}% < 45.0%). Data density insufficient for automated credit sanction.")

    if missing:
        observations.append(f"Missing documentation: {', '.join(missing)} (treated as neutral uncertainty under UDYOGA policy).")

    return {
        "evidence_grade": grade,
        "score": score,
        "missing_fields": missing,
        "observations": observations
    }

def evaluate_investigation_risk(graph: Optional[GraphMetrics]) -> Dict[str, Any]:
    """
    Evaluates forensic counterparty graph patterns.
    Suspicious circular loops trigger human investigation, NEVER an automated fraud conviction.
    """
    if graph is None:
        return {
            "investigation_status": "NORMAL_PATTERNS",
            "is_flagged": False,
            "circular_cycles_count": 0,
            "observations": ["Counterparty network topology graph unavailable."]
        }

    status = graph.investigation_status
    cycles = len(graph.circular_loops_detected)
    is_flagged = (status in ["INVESTIGATION_TRIGGERED", "HUMAN_REVIEW_RECOMMENDED"] or cycles > 0)
    
    observations = []
    if is_flagged:
        observations.append(
            f"Topological anomaly: {cycles} circular transaction loop(s) detected. Prompted for Human Review (no automatic fraud verdict)."
        )
    else:
        observations.append("Normal counterparty transaction topology; no circular trading or artificial round-tripping detected.")

    return {
        "investigation_status": status if is_flagged else "NORMAL_PATTERNS",
        "is_flagged": is_flagged,
        "circular_cycles_count": cycles,
        "observations": observations
    }

def evaluate_stress_resilience(resilience: Optional[ShockSimulationResult]) -> Dict[str, Any]:
    """
    Evaluates enterprise resilience under applied economic stress scenarios.
    """
    if resilience is None:
        return {
            "resilience_classification": "CRITICAL_ILLIQUIDITY",
            "stressed_runway_days": None,
            "post_shock_dscr": None,
            "observations": ["Stress simulation results unavailable."]
        }

    classification = resilience.resilience_classification
    dscr = resilience.post_shock_dscr
    runway = resilience.stressed_cash_runway_days
    is_cash_gen = resilience.is_cash_generative_under_shock
    max_tolerable = resilience.max_tolerable_revenue_contraction_pct
    
    observations = [
        f"Resilience rating: `{classification}`. Maximum tolerable revenue shock: {max_tolerable:.1f}%."
    ]
    if is_cash_gen:
        observations.append("Enterprise remains operational cash-generative even during stressed revenue shocks (zero cash burn).")
    elif runway is not None:
        observations.append(f"Stressed cash runway: {runway} days of liquidity buffer survival under economic contraction.")

    if dscr is not None:
        observations.append(f"Post-shock DSCR: {dscr:.2f}x under combined stress conditions.")

    return {
        "resilience_classification": classification,
        "stressed_runway_days": runway,
        "post_shock_dscr": dscr,
        "is_cash_generative": is_cash_gen,
        "observations": observations
    }
