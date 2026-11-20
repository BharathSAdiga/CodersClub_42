"""
Explainable Underwriting Intelligence Module [OWNED BY ATHARV]

Modular Architecture:
1. financial_evaluator.py: Modular analyzers for cashflow health, debt capacity, business continuity, and forensic risks.
2. counterfactual_engine.py: Deterministic 'Path-to-Yes' simulation engine showing quantitative before-and-after improvements.
3. policy_rules.py: Unified transparent decisioning framework and APR risk pricing matrix.
4. cam_compiler.py: Structured Credit Appraisal Memo (CAM) synthesis and markdown exporter.
"""
from .financial_evaluator import (
    evaluate_financial_health,
    evaluate_repayment_capacity,
    evaluate_business_continuity,
    evaluate_evidence_confidence,
    evaluate_investigation_risk,
    evaluate_stress_resilience
)
from .counterfactual_engine import simulate_path_to_yes
from .policy_rules import evaluate_underwriting_policy, UNDERWRITING_POLICY_ASSUMPTIONS
from .cam_compiler import compile_credit_appraisal_memo

__all__ = [
    "evaluate_financial_health",
    "evaluate_repayment_capacity",
    "evaluate_business_continuity",
    "evaluate_evidence_confidence",
    "evaluate_investigation_risk",
    "evaluate_stress_resilience",
    "simulate_path_to_yes",
    "evaluate_underwriting_policy",
    "compile_credit_appraisal_memo",
    "UNDERWRITING_POLICY_ASSUMPTIONS"
]
