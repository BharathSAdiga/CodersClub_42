"""
Resilience Engine Module [OWNED BY ATHARV]

Modular Architecture:
1. cashflow_analyzer.py: Monthly cash-flow reconstruction & empirical expense breakdown.
2. debt_reconciliation.py: Obligation-level debt matching without double counting.
3. repayment_structures.py: Standard amortization, revenue-linked, and seasonality-adjusted comparisons.
4. scenarios.py: Comprehensive 7-scenario economic stress testing suite.
5. affordability_engine.py: Safe borrowing limits, DSCR, and FOIR capping.
6. stress_simulator.py: Integrated resilience simulation engine.
"""
from .cashflow_analyzer import reconstruct_monthly_cashflow
from .debt_reconciliation import match_debt_obligations
from .repayment_structures import (
    calculate_standard_amortization_emi,
    calculate_max_affordable_principal_from_emi,
    compare_repayment_structures
)
from .scenarios import evaluate_stress_scenarios_suite
from .affordability_engine import calculate_affordability
from .stress_simulator import run_cashflow_stress_simulation

__all__ = [
    "reconstruct_monthly_cashflow",
    "match_debt_obligations",
    "calculate_standard_amortization_emi",
    "calculate_max_affordable_principal_from_emi",
    "compare_repayment_structures",
    "evaluate_stress_scenarios_suite",
    "calculate_affordability",
    "run_cashflow_stress_simulation"
]
