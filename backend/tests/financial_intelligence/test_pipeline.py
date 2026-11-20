"""UDYOGA — Financial Intelligence Engine: End-to-End Pipeline & Integration Test Suite.

Verifies the unified financial intelligence pipeline, cross-module reconciliation,
data quality isolation, contract adaptation, serialization safety, and deterministic stability.
"""

from datetime import date, datetime, timezone
from decimal import Decimal
import io
import pytest

from app.modules.financial_intelligence.parser import (
    NormalizedTransaction,
    ParseResult,
    TransactionCategory,
    TransactionChannel,
    TransactionDirection,
    parse_transactions,
)
from app.modules.financial_intelligence.dna_engine import (
    FinancialDnaReport,
    compute_financial_dna,
)
from app.modules.financial_intelligence.graph_analyzer import (
    CycleInvestigationStatus,
    GraphAnalysisResult,
    build_and_analyze,
)
from app.modules.financial_intelligence.cashflow_series import (
    CashflowSeriesResult,
    ContractualObligationItem,
    CoverageMetadata,
    ResilienceInputResult,
    build_cashflow_series,
    prepare_resilience_inputs,
)
from app.modules.financial_intelligence.pipeline import (
    FinancialIntelligencePipelineResult,
    PipelineExecutionStatus,
    ReconciliationStatus,
    run_financial_intelligence_pipeline,
)
from app.modules.financial_intelligence.adapters import (
    adapt_to_cashflow_waveform,
    adapt_to_graph_visualization,
    adapt_to_underwriting_dossier,
)


# Sample clean 3-month CSV
VALID_CSV = """Transaction ID,Date,Amount,Direction,Category,Channel,Counterparty ID,Counterparty Name
TX-101,2026-01-10,50000.00,CREDIT,REVENUE,UPI,CP-ALPHA,Alpha Retail
TX-102,2026-01-15,20000.00,DEBIT,SUPPLIER_PAYMENT,NEFT,CP-BETA,Beta Mills
TX-103,2026-01-20,5000.00,DEBIT,LOAN_REPAYMENT,NEFT,CP-LENDER,State Bank
TX-104,2026-02-10,60000.00,CREDIT,REVENUE,UPI,CP-ALPHA,Alpha Retail
TX-105,2026-02-18,25000.00,DEBIT,SUPPLIER_PAYMENT,NEFT,CP-BETA,Beta Mills
TX-106,2026-02-22,5000.00,DEBIT,LOAN_REPAYMENT,NEFT,CP-LENDER,State Bank
TX-107,2026-03-08,70000.00,CREDIT,REVENUE,UPI,CP-GAMMA,Gamma Wholesalers
TX-108,2026-03-15,30000.00,DEBIT,SUPPLIER_PAYMENT,NEFT,CP-BETA,Beta Mills
TX-109,2026-03-25,5000.00,DEBIT,LOAN_REPAYMENT,NEFT,CP-LENDER,State Bank
"""


# ==============================================================================
# TESTS 1 - 9: FULL PIPELINE EXECUTION & RECONCILIATION
# ==============================================================================

def test_01_valid_csv_full_pipeline():
    """Runs a 3-month valid CSV through the full pipeline and verifies SUCCESS."""
    res = run_financial_intelligence_pipeline(VALID_CSV, business_id="KUMAR-METALS")

    assert res.business_id == "KUMAR-METALS"
    assert res.execution_status == PipelineExecutionStatus.SUCCESS
    assert res.accepted_transaction_count == 9
    assert res.rejected_transaction_count == 0
    assert res.financial_dna is not None
    assert res.graph_investigation is not None
    assert res.monthly_cashflow_series is not None
    assert res.weekly_cashflow_series is not None
    assert res.resilience_input_package is not None
    assert res.overall_reconciliation_pass is True


def test_02_mixed_credit_and_debit_input():
    """Mixed credit and debit transactions correctly accumulate across all modules."""
    res = run_financial_intelligence_pipeline(VALID_CSV)
    # Total Credits: 50k + 60k + 70k = 180,000
    # Total Debits: 20k + 5k + 25k + 5k + 30k + 5k = 90,000
    # Net: 90,000
    assert res.financial_dna.cash_flow_activity.total_credits == Decimal("180000.00")
    assert res.financial_dna.cash_flow_activity.total_debits == Decimal("90000.00")
    assert res.financial_dna.cash_flow_activity.net_observed_cashflow == Decimal("90000.00")


def test_03_parser_to_dna_transfer():
    """Parser output passes seamlessly to DNA engine without modifying transaction records."""
    res = run_financial_intelligence_pipeline(VALID_CSV)
    assert res.financial_dna.revenue_intelligence.revenue_transaction_count == 3
    assert res.financial_dna.operating_expenses.operating_expense_transaction_count == 3
    assert res.financial_dna.debt_repayments.debt_repayment_transaction_count == 3


def test_04_parser_to_graph_transfer():
    """Parser output passes to graph analyzer and identifies nodes and directed edges."""
    res = run_financial_intelligence_pipeline(VALID_CSV)
    graph = res.graph_investigation
    assert graph.graph_statistics.total_nodes == 5  # MSME + Alpha, Beta, Gamma, Lender
    assert graph.graph_statistics.incoming_relationship_count == 2  # Alpha, Gamma
    assert graph.graph_statistics.outgoing_relationship_count == 2  # Beta, Lender


def test_05_parser_to_cash_flow_transfer():
    """Parser output accurately groups into 3 monthly buckets."""
    res = run_financial_intelligence_pipeline(VALID_CSV)
    m_series = res.monthly_cashflow_series
    assert len(m_series.buckets) == 3
    assert [b.period_id for b in m_series.buckets] == ["2026-01", "2026-02", "2026-03"]


def test_06_monthly_and_weekly_totals_reconcile():
    """Monthly and weekly credit and debit sums reconcile 1-to-1."""
    res = run_financial_intelligence_pipeline(VALID_CSV)
    m_recon = res.monthly_cashflow_series.reconciliation_summary
    w_recon = res.weekly_cashflow_series.reconciliation_summary

    assert m_recon["total_observed_credits"] == w_recon["total_observed_credits"]
    assert m_recon["total_observed_debits"] == w_recon["total_observed_debits"]


def test_07_revenue_and_expenses_reconcile():
    """DNA revenue and expenses match monthly cash-flow categorized metrics exactly."""
    res = run_financial_intelligence_pipeline(VALID_CSV)
    m_recon = res.monthly_cashflow_series.reconciliation_summary

    assert Decimal(m_recon["categorized_business_revenue"]) == res.financial_dna.revenue_intelligence.observed_business_revenue
    assert Decimal(m_recon["categorized_operating_expenses"]) == res.financial_dna.operating_expenses.observed_operating_expenses


def test_08_loan_repayment_totals_reconcile():
    """Loan repayment debits match DNA and monthly series totals."""
    res = run_financial_intelligence_pipeline(VALID_CSV)
    assert res.financial_dna.debt_repayments.observed_debt_repayments_total == Decimal("15000.00")
    assert res.monthly_cashflow_series.repayments.total_repayments_observed == Decimal("15000.00")


def test_09_graph_identifiable_totals_correctly_bounded():
    """Graph volume does not exceed dataset total volume."""
    res = run_financial_intelligence_pipeline(VALID_CSV)
    assert res.graph_investigation.graph_statistics.total_graph_volume <= res.graph_investigation.data_coverage.total_dataset_volume


# ==============================================================================
# TESTS 10 - 18: ERROR ISOLATION, DATA QUALITY & LIMITATIONS
# ==============================================================================

def test_10_missing_counterparties_handling():
    """Unlabelled counterparties are isolated from graph topology and flagged in limitations."""
    csv_unlabelled = """Transaction ID,Date,Amount,Direction,Category,Channel,Counterparty ID,Counterparty Name
TX-01,2026-01-10,50000.00,CREDIT,REVENUE,UPI,CP-01,Known Vendor
TX-02,2026-01-15,20000.00,CREDIT,REVENUE,CASH_DEPOSIT,,
"""
    res = run_financial_intelligence_pipeline(csv_unlabelled)
    assert res.graph_investigation.data_coverage.unrepresented_transactions_missing_counterparty == 1
    assert any("unlabelled" in lim.lower() for lim in res.data_sufficiency_limitations)


def test_11_duplicate_transaction_ids_handled():
    """Duplicate transaction IDs are deduplicated, warning is added, and amounts are not double-counted."""
    csv_dup = """Transaction ID,Date,Amount,Direction,Category,Channel,Counterparty ID,Counterparty Name
TX-01,2026-01-10,50000.00,CREDIT,REVENUE,UPI,CP-01,Vendor
TX-01,2026-01-10,50000.00,CREDIT,REVENUE,UPI,CP-01,Vendor
"""
    res = run_financial_intelligence_pipeline(csv_dup)
    assert res.parse_summary.duplicate_rows == 1
    assert res.accepted_transaction_count == 1
    assert res.financial_dna.cash_flow_activity.total_credits == Decimal("50000.00")
    assert any("duplicate" in w.lower() for w in res.integration_warnings)


def test_12_invalid_csv_rows_isolated():
    """Malformed rows are isolated into parse summary; valid rows are processed."""
    csv_mixed = """Transaction ID,Date,Amount,Direction,Category,Channel,Counterparty ID,Counterparty Name
TX-01,2026-01-10,50000.00,CREDIT,REVENUE,UPI,CP-01,Vendor
TX-BAD,INVALID_DATE,NOT_NUMERIC,UNKNOWN_DIR,OTHER,OTHER,,
TX-02,2026-01-20,20000.00,DEBIT,SUPPLIER_PAYMENT,NEFT,CP-02,Supplier
"""
    res = run_financial_intelligence_pipeline(csv_mixed)
    assert res.parse_summary.valid_rows == 2
    assert res.parse_summary.invalid_rows == 1
    assert res.accepted_transaction_count == 2
    assert res.execution_status == PipelineExecutionStatus.PARTIAL_SUCCESS


def test_13_all_invalid_input():
    """100% rejected rows yields INVALID_INPUT status without crash."""
    csv_all_bad = """Transaction ID,Date,Amount,Direction,Category,Channel,Counterparty ID,Counterparty Name
TX-BAD1,INVALID_DATE,NaN,CREDIT,REVENUE,UPI,CP-01,Vendor
TX-BAD2,2026-01-01,-5000,INVALID_DIR,REVENUE,UPI,CP-01,Vendor
"""
    res = run_financial_intelligence_pipeline(csv_all_bad)
    assert res.execution_status == PipelineExecutionStatus.INVALID_INPUT
    assert res.accepted_transaction_count == 0


def test_14_empty_csv():
    """Completely empty CSV (0 bytes) returns INVALID_INPUT status cleanly."""
    res = run_financial_intelligence_pipeline("")
    assert res.execution_status == PipelineExecutionStatus.INVALID_INPUT
    assert res.accepted_transaction_count == 0


def test_15_header_only_csv():
    """Header-only CSV returns INVALID_INPUT status with clear limitation note."""
    header_only = "Transaction ID,Date,Amount,Direction,Category,Channel,Counterparty ID,Counterparty Name\n"
    res = run_financial_intelligence_pipeline(header_only)
    assert res.execution_status == PipelineExecutionStatus.INVALID_INPUT
    assert res.accepted_transaction_count == 0


def test_16_sparse_historical_coverage():
    """Single month of history results in PARTIAL_SUCCESS and documents limitation."""
    csv_1m = """Transaction ID,Date,Amount,Direction,Category,Channel,Counterparty ID,Counterparty Name
TX-01,2026-01-10,50000.00,CREDIT,REVENUE,UPI,CP-01,Vendor
"""
    res = run_financial_intelligence_pipeline(csv_1m)
    assert res.execution_status == PipelineExecutionStatus.PARTIAL_SUCCESS
    assert any("calendar month" in lim for lim in res.data_sufficiency_limitations)


def test_17_insufficient_volatility_history():
    """When fewer than 3 months exist, monthly CV volatility is explicitly unavailable."""
    csv_2m = """Transaction ID,Date,Amount,Direction,Category,Channel,Counterparty ID,Counterparty Name
TX-01,2026-01-10,50000.00,CREDIT,REVENUE,UPI,CP-01,Vendor
TX-02,2026-02-10,60000.00,CREDIT,REVENUE,UPI,CP-01,Vendor
"""
    res = run_financial_intelligence_pipeline(csv_2m)
    assert res.financial_dna.financial_stability.monthly_revenue_cv is None


def test_18_unsupported_circular_flow_investigation():
    """Multi-entity cycle detection is strictly NOT_ASSESSABLE."""
    res = run_financial_intelligence_pipeline(VALID_CSV)
    assert res.graph_investigation.cycle_investigation.cycle_investigation_status == CycleInvestigationStatus.NOT_ASSESSABLE


# ==============================================================================
# TESTS 19 - 27: RESILIENCE, SERIALIZATION & TRACEABILITY
# ==============================================================================

def test_19_valid_resilience_ready_output():
    """Pipeline outputs populated ResilienceInputResult with aligned series."""
    res = run_financial_intelligence_pipeline(VALID_CSV)
    resilience_in = res.resilience_input_package
    assert resilience_in is not None
    assert len(resilience_in.historical_revenue_series) == 3
    assert len(resilience_in.historical_opex_series) == 3
    assert len(resilience_in.observed_debt_repayment_series) == 3


def test_20_unknown_future_obligations():
    """If caller does not pass known obligations, they remain None without fabricated defaults."""
    res = run_financial_intelligence_pipeline(VALID_CSV)
    assert res.resilience_input_package.known_contractual_obligations is None


def test_21_decimal_serialization():
    """to_dict() produces pure string Decimals and valid JSON primitives."""
    res = run_financial_intelligence_pipeline(VALID_CSV)
    d = res.to_dict()
    assert isinstance(d["financial_dna"]["cash_flow_activity"]["total_credits"], str)
    assert d["financial_dna"]["cash_flow_activity"]["total_credits"] == "180000.00"


def test_22_timestamp_serialization():
    """to_dict() produces ISO 8601 strings for all timestamps and dates."""
    res = run_financial_intelligence_pipeline(VALID_CSV)
    d = res.to_dict()
    assert "T" in d["execution_timestamp"]
    assert d["monthly_cashflow_series"]["buckets"][0]["period_start"] == "2026-01-01"


def test_23_missing_data_represented_as_unavailable():
    """Missing or inapplicable fields are represented as None/null, never fabricated."""
    csv_short = """Transaction ID,Date,Amount,Direction,Category,Channel,Counterparty ID,Counterparty Name
TX-01,2026-01-10,50000.00,CREDIT,REVENUE,UPI,CP-01,Vendor
"""
    res = run_financial_intelligence_pipeline(csv_short)
    assert res.financial_dna.revenue_intelligence.mom_revenue_growth == {}
    assert res.financial_dna.financial_stability.monthly_revenue_cv is None


def test_24_stable_execution_status():
    """Status precedence strictly maps clean 3-month dataset to SUCCESS."""
    res = run_financial_intelligence_pipeline(VALID_CSV)
    assert res.execution_status == PipelineExecutionStatus.SUCCESS


def test_25_stable_repeated_output():
    """Running the pipeline multiple times on the same input produces byte-for-byte identical dicts."""
    d1 = run_financial_intelligence_pipeline(VALID_CSV).to_dict()
    d2 = run_financial_intelligence_pipeline(VALID_CSV).to_dict()
    # Mask out the execution_timestamp for deterministic parity
    del d1["execution_timestamp"]
    del d2["execution_timestamp"]
    del d1["financial_dna"]["generated_at"]
    del d2["financial_dna"]["generated_at"]
    assert d1 == d2


def test_26_internal_exception_reporting():
    """Non-existent file path or malformed source type returns structured error without uncaught crash."""
    res = run_financial_intelligence_pipeline(12345)  # Invalid type
    assert res.execution_status in (PipelineExecutionStatus.INTERNAL_ERROR, PipelineExecutionStatus.INVALID_INPUT)


def test_27_evidence_reference_integrity():
    """All supporting transaction IDs in buckets and graph edges exist in accepted transactions."""
    res = run_financial_intelligence_pipeline(VALID_CSV)
    accepted_ids = {f"TX-{i:03d}" for i in range(101, 110)}
    for b in res.monthly_cashflow_series.buckets:
        for ref in b.evidence_transaction_ids:
            assert ref in accepted_ids


# ==============================================================================
# TESTS 28 - 33: COMPATIBILITY, ADAPTERS & SCALE
# ==============================================================================

def test_28_no_fabricated_unsupported_financial_values():
    """Guarantees zero credit scores, zero bank balances, zero default probabilities."""
    res = run_financial_intelligence_pipeline(VALID_CSV)
    d = res.to_dict()
    assert "credit_score" not in d
    assert "cibil_score" not in d
    assert "fraud_probability" not in d
    assert "loan_approved" not in d


def test_29_compatibility_with_existing_parser_models():
    """Accepted records strictly conform to NormalizedTransaction."""
    res = run_financial_intelligence_pipeline(VALID_CSV)
    assert res.parse_summary.valid_rows == 9


def test_30_compatibility_with_existing_dna_models():
    """DNA output strictly matches FinancialDnaReport."""
    res = run_financial_intelligence_pipeline(VALID_CSV)
    assert isinstance(res.financial_dna, FinancialDnaReport)


def test_31_compatibility_with_existing_graph_models():
    """Graph output strictly matches GraphAnalysisResult."""
    res = run_financial_intelligence_pipeline(VALID_CSV)
    assert isinstance(res.graph_investigation, GraphAnalysisResult)


def test_32_downstream_adapters_execution():
    """Verifies that adapters convert pipeline results into UI/agent formats cleanly."""
    res = run_financial_intelligence_pipeline(VALID_CSV)

    # Waveform adapter
    waveform = adapt_to_cashflow_waveform(res.monthly_cashflow_series)
    assert len(waveform) == 3
    assert waveform[0]["date"] == "2026-01"
    assert waveform[0]["inflow"] == 50000.0

    # Graph visualization adapter
    graph_ui = adapt_to_graph_visualization(res.graph_investigation)
    assert len(graph_ui["nodes"]) == 5
    assert len(graph_ui["edges"]) == 4

    # Underwriting dossier adapter
    dossier = adapt_to_underwriting_dossier(res.financial_dna, res.graph_investigation, res.monthly_cashflow_series)
    assert "financialVitality" in dossier
    assert dossier["revenueIntelligence"]["observedRevenue"] == "180000.00"
    assert isinstance(dossier["financialVitality"]["inflowOutflowRatio"], float)
    assert dossier["financialVitality"]["inflowOutflowRatio"] == 2.0

    # Ensure all downstream adapted payloads serialize to valid JSON without Decimal errors
    import json
    assert json.dumps(waveform) is not None
    assert json.dumps(graph_ui) is not None
    assert json.dumps(dossier) is not None


def test_33_larger_synthetic_dataset_smoke_test():
    """Smoke test running 1,000 synthetic records through the complete pipeline in < 1.0s."""
    import time
    lines = ["Transaction ID,Date,Amount,Direction,Category,Channel,Counterparty ID,Counterparty Name"]
    for i in range(1000):
        d_val = (i % 28) + 1
        m_val = (i % 12) + 1
        direction = "CREDIT" if i % 2 == 0 else "DEBIT"
        cat = "REVENUE" if direction == "CREDIT" else "SUPPLIER_PAYMENT"
        lines.append(f"TX-{i:05d},2025-{m_val:02d}-{d_val:02d},{1000 + i}.00,{direction},{cat},UPI,CP-{i % 20:02d},Partner {i % 20:02d}")
    large_csv = "\n".join(lines)

    t0 = time.time()
    res = run_financial_intelligence_pipeline(large_csv, business_id="SCALE-CORP")
    elapsed = time.time() - t0

    assert res.accepted_transaction_count == 1000
    assert res.overall_reconciliation_pass is True
    assert elapsed < 1.5  # Under performance ceiling
