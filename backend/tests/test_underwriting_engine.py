import pytest
from decimal import Decimal
from backend.app.schemas.business import BusinessProfile
from backend.app.schemas.financial_dna import FinancialDNA
from backend.app.schemas.graph import GraphMetrics
from backend.app.schemas.evidence import EvidenceConfidence
from backend.app.schemas.resilience import ShockScenarioInput, AffordabilityAnalysis, ShockSimulationResult, DebtObligation
from backend.app.modules.underwriting import (
    evaluate_financial_health,
    evaluate_repayment_capacity,
    evaluate_business_continuity,
    evaluate_evidence_confidence,
    evaluate_investigation_risk,
    evaluate_stress_resilience,
    simulate_path_to_yes,
    evaluate_underwriting_policy,
    compile_credit_appraisal_memo
)

def make_profile(vintage=36, turnover=Decimal("300000.00"), emi=Decimal("0.0")):
    return BusinessProfile(
        business_id="msme_underwrite_test",
        legal_name="Test Kirana LLP",
        trade_name="Test Store",
        sector="RETAIL_KIRANA",
        vintage_months=vintage,
        location_tier="TIER_2",
        entity_type="PROPRIETORSHIP",
        declared_monthly_turnover=turnover,
        declared_existing_monthly_emi=emi
    )

def make_dna(turnover=Decimal("300000.00"), volatility=0.20, seasonality=1.10, concentration=25.0):
    return FinancialDNA(
        business_id="msme_underwrite_test",
        total_credit_volume=turnover * Decimal("6.0"),
        total_debit_volume=turnover * Decimal("4.2"),
        net_operating_cashflow=turnover * Decimal("1.8"),
        monthly_average_turnover=turnover,
        daily_average_inflow=turnover / Decimal("30.0"),
        daily_average_balance_proxy=Decimal("50000.00"),
        inflow_volatility_cv=volatility,
        cash_velocity_days=3.2,
        seasonality_index=seasonality,
        top_3_customer_concentration_pct=concentration
    )

def make_evidence(score=85.0, missing=None):
    return EvidenceConfidence(
        business_id="msme_underwrite_test",
        evidence_confidence_score=score,
        data_completeness_pct=score,
        temporal_coverage_days=180,
        total_records_analyzed=250,
        missing_evidence_fields=missing or []
    )

def make_resilience(surplus=Decimal("60000.00"), existing_debt=Decimal("0.0"), post_dscr=1.75, classification="HIGHLY_RESILIENT"):
    affordability = AffordabilityAnalysis(
        monthly_operating_inflow=Decimal("300000.00"),
        monthly_operating_expenses=Decimal("210000.00"),
        net_operating_surplus_pre_debt=Decimal("90000.00"),
        declared_existing_monthly_emi=existing_debt,
        verified_existing_monthly_debt_debits=existing_debt,
        reconciled_existing_debt_service=existing_debt,
        unencumbered_monthly_cash_surplus=surplus,
        proposed_loan_amount_inr=Decimal("200000.00"),
        proposed_monthly_emi=Decimal("17957.42"),
        total_post_borrowing_monthly_debt_service=existing_debt + Decimal("17957.42"),
        is_debt_free=(existing_debt == Decimal("0.0")),
        projected_dscr=post_dscr,
        maximum_affordable_monthly_emi=max(surplus * Decimal("0.50"), Decimal("0.0")),
        maximum_affordable_loan_principal=max(surplus * Decimal("0.50") * Decimal("10.5"), Decimal("0.0")).quantize(Decimal("1000"))
    )
    return ShockSimulationResult(
        business_id="msme_underwrite_test",
        applied_scenario=ShockScenarioInput(),
        baseline_cash_runway_days=90,
        stressed_cash_runway_days=60,
        is_cash_generative_under_shock=True,
        liquidity_buffer_depletion_pct=15.0,
        post_shock_monthly_surplus=Decimal("35000.00"),
        post_shock_dscr=post_dscr,
        max_tolerable_revenue_contraction_pct=30.0,
        resilience_classification=classification,
        affordability=affordability
    )

# 1. Test: Healthy business
def test_healthy_business():
    memo = compile_credit_appraisal_memo(
        business_id="msme_healthy",
        profile=make_profile(),
        dna=make_dna(volatility=0.20),
        evidence=make_evidence(88.0),
        resilience=make_resilience(surplus=Decimal("70000.00"), post_dscr=1.85)
    )
    assert memo.assessment_status == "INDICATIVE_RECOMMENDATION"
    assert memo.financial_risk_band == "LOW_RISK"
    assert memo.recommended_loan_amount_inr > Decimal("0.0")
    assert memo.recommended_facility_type == "UNSECURED_WORKING_CAPITAL_LINE"
    assert memo.indicative_apr_min_pct == Decimal("13.0")
    assert memo.indicative_apr_max_pct == Decimal("14.5")
    assert len(memo.positive_credit_factors) >= 2

# 2. Test: Unstable revenue
def test_unstable_revenue():
    # Volatility CV 0.55 triggers conditional recommendation
    memo = compile_credit_appraisal_memo(
        business_id="msme_volatile",
        profile=make_profile(),
        dna=make_dna(volatility=0.55),
        evidence=make_evidence(75.0),
        resilience=make_resilience(surplus=Decimal("40000.00"), post_dscr=1.35)
    )
    assert memo.assessment_status == "CONDITIONAL_RECOMMENDATION"
    assert memo.financial_risk_band in ["MODERATE_RISK", "ELEVATED_RISK"]
    assert any("volatility" in r.lower() for r in memo.risk_factors_and_vulnerabilities)
    assert memo.recommended_facility_type == "REVENUE_BASED_DAILY_SWEEP"

# 3. Test: High existing debt
def test_high_existing_debt():
    # Operating surplus is 90k, but existing debt is 85k -> unencumbered surplus is only 5k
    memo = compile_credit_appraisal_memo(
        business_id="msme_heavy_debt",
        profile=make_profile(emi=Decimal("85000.00")),
        dna=make_dna(),
        evidence=make_evidence(80.0),
        resilience=make_resilience(surplus=Decimal("5000.00"), existing_debt=Decimal("85000.00"), post_dscr=1.02)
    )
    assert memo.assessment_status == "CONDITIONAL_RECOMMENDATION"
    assert memo.financial_risk_band in ["MODERATE_RISK", "ELEVATED_RISK"]
    assert memo.recommended_loan_amount_inr <= Decimal("15000.00")

# 4. Test: Negative operating cashflow
def test_negative_operating_cashflow():
    # Net surplus is negative -15k
    memo = compile_credit_appraisal_memo(
        business_id="msme_negative",
        profile=make_profile(),
        dna=make_dna(),
        evidence=make_evidence(80.0),
        resilience=make_resilience(surplus=Decimal("-15000.00"), existing_debt=Decimal("10000.00"), post_dscr=0.5)
    )
    assert memo.assessment_status == "HUMAN_REVIEW_REQUIRED"
    assert memo.financial_risk_band == "HIGH_RISK"
    assert memo.recommended_loan_amount_inr == Decimal("0.0")
    assert memo.recommended_facility_type == "NONE_RECOMMENDED"

# 5. Test: Strong financials but insufficient evidence
def test_strong_financials_insufficient_evidence():
    # Excellent turnover, but evidence confidence is 32% (<40%)
    memo = compile_credit_appraisal_memo(
        business_id="msme_strong_no_data",
        profile=make_profile(turnover=Decimal("1000000.00")),
        dna=make_dna(turnover=Decimal("1000000.00")),
        evidence=make_evidence(score=32.0, missing=["BANK_STATEMENTS_180_DAYS", "GSTR_3B"]),
        resilience=make_resilience(surplus=Decimal("250000.00"), post_dscr=2.5)
    )
    assert memo.assessment_status == "INSUFFICIENT_EVIDENCE"
    assert memo.financial_risk_band == "UNASSESSED"  # Never fabricated risk band
    assert memo.recommended_loan_amount_inr == Decimal("0.0")
    assert "BANK_STATEMENTS_180_DAYS" in memo.missing_evidence_items

# 6. Test: Suspicious transaction patterns (Human review required, no auto-fraud)
def test_suspicious_transaction_patterns():
    graph = GraphMetrics(
        business_id="msme_fraud_flag",
        total_nodes=5,
        total_edges=6,
        nodes=[],
        edges=[],
        unique_customers_count=2,
        unique_suppliers_count=2,
        counterparty_entropy=1.1,
        circular_loops_detected=[["node_x", "node_y", "node_x"]],
        round_trip_volume_inr=350000.0,
        investigation_status="HUMAN_REVIEW_RECOMMENDED"
    )
    memo = compile_credit_appraisal_memo(
        business_id="msme_fraud_flag",
        profile=make_profile(),
        dna=make_dna(),
        graph=graph,
        evidence=make_evidence(85.0),
        resilience=make_resilience()
    )
    assert memo.assessment_status == "HUMAN_REVIEW_REQUIRED"
    assert memo.financial_risk_band == "HIGH_RISK"
    assert memo.recommended_loan_amount_inr == Decimal("0.0")
    assert any("circular" in r.lower() for r in memo.risk_factors_and_vulnerabilities)
    # Check that it triggers human review, not fraud conviction
    assert any("field credit officer" in c.lower() for c in memo.recommended_covenants_and_mitigants)

# 7. Test: Severe stress-test results
def test_severe_stress_test_results():
    # Stressed DSCR drops to 0.75x
    memo = compile_credit_appraisal_memo(
        business_id="msme_stressed",
        profile=make_profile(),
        dna=make_dna(),
        evidence=make_evidence(75.0),
        resilience=make_resilience(surplus=Decimal("30000.00"), post_dscr=0.75, classification="VULNERABLE_TO_SHOCK")
    )
    assert memo.assessment_status == "CONDITIONAL_RECOMMENDATION"
    assert memo.financial_risk_band == "ELEVATED_RISK"
    assert any("0.75" in r for r in memo.risk_factors_and_vulnerabilities)

# 8. Test: Business with no existing debt
def test_business_with_no_existing_debt():
    memo = compile_credit_appraisal_memo(
        business_id="msme_debt_free",
        profile=make_profile(emi=Decimal("0.0")),
        dna=make_dna(),
        evidence=make_evidence(80.0),
        resilience=make_resilience(surplus=Decimal("60000.00"), existing_debt=Decimal("0.0"), post_dscr=None)
    )
    assert any("debt-free" in f.lower() for f in memo.positive_credit_factors)

# 9. Test: Insufficient data
def test_insufficient_data():
    memo = compile_credit_appraisal_memo(
        business_id="msme_empty",
        dna=None,
        graph=None,
        evidence=None,
        resilience=None
    )
    assert memo.assessment_status == "INSUFFICIENT_EVIDENCE"
    assert memo.financial_risk_band == "UNASSESSED"
    assert memo.recommended_loan_amount_inr == Decimal("0.0")

# 10. Test: Counterfactual improvement simulation
def test_counterfactual_improvements():
    simulations, advice = simulate_path_to_yes(
        monthly_inflow=Decimal("100000.00"),
        monthly_expenses=Decimal("80000.00"),
        existing_debt=Decimal("10000.00"),
        baseline_status="CONDITIONAL_RECOMMENDATION",
        baseline_affordable_loan=Decimal("50000.00"),
        baseline_dscr=1.15
    )
    assert len(simulations) >= 3
    action_types = {s.action_type for s in simulations}
    assert "OPERATING_EXPENSE_REDUCTION" in action_types
    assert "COLLECTIONS_ACCELERATION" in action_types
    assert "TENURE_EXTENSION" in action_types
    
    # Verify quantitative delta
    exp_sim = next(s for s in simulations if s.action_type == "OPERATING_EXPENSE_REDUCTION")
    assert exp_sim.simulated_affordable_loan_inr > exp_sim.baseline_affordable_loan_inr

# 11. Test: Maximum loan affordability boundaries
def test_maximum_loan_affordability_boundaries():
    # Applicant requests 50 Lakhs (5,000,000), but max safe principal is ~2.5 Lakhs
    resilience = make_resilience(surplus=Decimal("50000.00"))
    max_safe = resilience.affordability.maximum_affordable_loan_principal
    
    memo = compile_credit_appraisal_memo(
        business_id="msme_cap_check",
        profile=make_profile(),
        dna=make_dna(),
        evidence=make_evidence(80.0),
        resilience=resilience,
        requested_loan_amount_inr=Decimal("5000000.00")
    )
    # Recommended loan must NEVER exceed max_safe_loan_amount_inr
    assert memo.recommended_loan_amount_inr <= memo.max_safe_loan_amount_inr
    assert memo.recommended_loan_amount_inr <= max_safe

# 12. Test: Rule-based fallback
def test_rule_based_fallback():
    memo = compile_credit_appraisal_memo(
        business_id="msme_fallback",
        profile=make_profile(),
        dna=make_dna(),
        evidence=make_evidence(80.0),
        resilience=make_resilience(),
        is_fallback=True,
        fallback_reason="Explicit rule-based fallback test"
    )
    assert memo.is_fallback_rule_based is True
    assert memo.fallback_reason == "Explicit rule-based fallback test"
    assert memo.calculation_version == "1.0.0"
    assert "Executive Summary" in memo.cam_narrative_markdown
    assert "Counterfactual 'Path-to-Yes' Simulations" in memo.cam_narrative_markdown
