"""Phase 7 & Demo Scenarios Acceptance Test Suite.

Validates the 3 canonical business scenarios:
1. Scenario A: Stable neighborhood business (recurring revenue, low volatility, full coverage).
2. Scenario B: Seasonal / variable business (monsoon lull vs festival surge, seasonality guard).
3. Scenario C: Limited financial evidence (sparse 2-month history, missing counterparties, malformed rows).

Ensures deterministic execution, exact cross-module reconciliation, and zero dependency on LLM or network.
"""

from decimal import Decimal
import json
from pathlib import Path
import pytest

from app.modules.financial_intelligence.pipeline import (
    run_financial_intelligence_pipeline,
    PipelineExecutionStatus,
    ReconciliationStatus,
)
from app.modules.financial_intelligence.cashflow_series import (
    ResilienceHandoffStatus,
    SeasonalityReadinessStatus,
)

FIXTURES_DIR = Path(__file__).parent / "fixtures"


def test_scenario_a_stable_business():
    """Verify Scenario A: Stable neighborhood business with 6 months of steady revenue and expenses."""
    csv_path = FIXTURES_DIR / "scenario_a_stable_business.csv"
    assert csv_path.exists(), f"Missing fixture: {csv_path}"

    result = run_financial_intelligence_pipeline(
        csv_source=csv_path,
        business_id="MSME-DEMO-001",
    )

    # 1. Execution status & validation
    assert result.execution_status == PipelineExecutionStatus.SUCCESS
    assert result.parse_summary.total_rows == 36
    assert result.parse_summary.valid_rows == 36
    assert result.parse_summary.invalid_rows == 0
    assert result.parse_summary.duplicate_rows == 0
    assert result.accepted_transaction_count == 36
    assert result.rejected_transaction_count == 0

    # 2. Financial totals (6 months, exact arithmetic)
    # Credits: 6 months of (Sharma + Apex + Metro)
    # Sharma: 12500+14000+13000+15000+13500+16000 = 84,000
    # Apex: 45000+48000+46000+50000+47000+52000 = 288,000
    # Metro: 32000+35000+34000+36000+33000+38000 = 208,000
    # Total Revenue Credits = 580,000.00
    # Debits: 6 months of (Kisan + Rent + Loan)
    # Kisan: 18000+19500+18500+21000+19000+22000 = 118,000
    # Rent: 6 * 12000 = 72,000
    # Loan: 6 * 5000 = 30,000
    # Total Debits = 220,000.00
    # Net Cash Flow = 580,000 - 220,000 = 360,000.00
    assert result.overall_reconciliation_pass is True
    assert all(c.status == ReconciliationStatus.PASS for c in result.reconciliation)

    recon = result.monthly_cashflow_series.reconciliation_summary
    assert Decimal(recon["total_observed_credits"]) == Decimal("580000.00")
    assert Decimal(recon["total_observed_debits"]) == Decimal("220000.00")
    assert Decimal(recon["net_observed_cashflow"]) == Decimal("360000.00")
    assert Decimal(recon["observed_debt_repayments"]) == Decimal("30000.00")
    assert Decimal(recon["categorized_business_revenue"]) == Decimal("580000.00")
    assert Decimal(recon["categorized_operating_expenses"]) == Decimal("190000.00")  # Kisan (118k) + Rent (72k)
    assert Decimal(recon["operating_cash_surplus_proxy"]) == Decimal("390000.00")  # 580k - 190k

    # 3. Time-series granularity
    assert len(result.monthly_cashflow_series.buckets) == 6
    for m in result.monthly_cashflow_series.buckets:
        assert m.observed_credit_total > m.observed_debit_total
        assert m.observed_net_cashflow > Decimal("0.00")

    # 4. Seasonality gate (< 24 months must remain INSUFFICIENT_HISTORY)
    assert result.monthly_cashflow_series.seasonality.seasonality_status == SeasonalityReadinessStatus.INSUFFICIENT_HISTORY

    # 5. Graph analysis
    assert result.graph_investigation is not None
    assert result.graph_investigation.graph_statistics.total_nodes >= 5
    assert result.graph_investigation.data_coverage.graph_volume_coverage_ratio == 1.0

    # 6. Resilience inputs
    assert result.resilience_input_package is not None
    assert result.resilience_input_package.handoff_readiness_status == ResilienceHandoffStatus.READY

    # 7. JSON serialization
    serialized = result.to_dict()
    assert isinstance(serialized, dict)
    json_str = json.dumps(serialized)
    assert len(json_str) > 500


def test_scenario_b_seasonal_business():
    """Verify Scenario B: Seasonal textile business with off-peak vs festival surge."""
    csv_path = FIXTURES_DIR / "scenario_b_seasonal_business.csv"
    assert csv_path.exists()

    result = run_financial_intelligence_pipeline(
        csv_source=csv_path,
        business_id="MSME-DEMO-002",
    )

    # 1. Validation & status
    assert result.execution_status == PipelineExecutionStatus.SUCCESS
    assert result.parse_summary.total_rows == 16
    assert result.parse_summary.valid_rows == 16
    assert result.parse_summary.invalid_rows == 0
    assert result.accepted_transaction_count == 16

    # 2. Revenue volatility check
    # DNA and Cashflow should reflect 7 months of varying activity
    assert len(result.monthly_cashflow_series.buckets) == 7
    october = [m for m in result.monthly_cashflow_series.buckets if m.period_id == "2024-10"][0]
    july = [m for m in result.monthly_cashflow_series.buckets if m.period_id == "2024-07"][0]
    assert october.categorized_business_revenue > july.categorized_business_revenue * Decimal("10")

    # 3. Seasonality gate (< 24 months must report INSUFFICIENT_HISTORY)
    assert result.monthly_cashflow_series.seasonality.seasonality_status == SeasonalityReadinessStatus.INSUFFICIENT_HISTORY
    assert "24 months" in result.monthly_cashflow_series.seasonality.explanation

    # 4. Reconciliation
    assert result.overall_reconciliation_pass is True
    assert all(c.status == ReconciliationStatus.PASS for c in result.reconciliation)


def test_scenario_c_limited_evidence():
    """Verify Scenario C: Limited financial evidence, missing counterparties, and malformed rows."""
    csv_path = FIXTURES_DIR / "scenario_c_limited_evidence.csv"
    assert csv_path.exists()

    result = run_financial_intelligence_pipeline(
        csv_source=csv_path,
        business_id="MSME-DEMO-003",
    )

    # 1. Partial success due to malformed rows (1 negative amount, 1 bad date) & sparse data (<3 mo)
    assert result.execution_status == PipelineExecutionStatus.PARTIAL_SUCCESS
    assert result.parse_summary.total_rows == 10
    assert result.parse_summary.valid_rows == 8
    assert result.parse_summary.invalid_rows == 2
    assert result.accepted_transaction_count == 8
    assert result.rejected_transaction_count == 2

    # 2. Honest coverage reporting
    assert result.graph_investigation is not None
    assert result.graph_investigation.data_coverage.graph_volume_coverage_ratio < 1.0
    assert result.graph_investigation.data_coverage.unrepresented_volume > Decimal("0.00")
    assert result.graph_investigation.data_coverage.unrepresented_transactions_missing_counterparty > 0

    # 3. Sparse monthly coverage (2 months)
    assert len(result.monthly_cashflow_series.buckets) == 2

    # 4. Reconciliation passes on the accepted transactions
    assert result.overall_reconciliation_pass is True
    assert all(c.status == ReconciliationStatus.PASS for c in result.reconciliation)


def test_scenarios_deterministic_and_independent():
    """Verify that repeated runs of the demo scenarios yield identical results without side effects."""
    csv_a = FIXTURES_DIR / "scenario_a_stable_business.csv"

    run1 = run_financial_intelligence_pipeline(csv_source=csv_a, business_id="MSME-A")
    run2 = run_financial_intelligence_pipeline(csv_source=csv_a, business_id="MSME-A")

    dict1 = run1.to_dict()
    dict2 = run2.to_dict()

    # Strip timestamps from comparison
    del dict1["execution_timestamp"]
    del dict2["execution_timestamp"]
    del dict1["financial_dna"]["generated_at"]
    del dict2["financial_dna"]["generated_at"]

    assert dict1 == dict2
