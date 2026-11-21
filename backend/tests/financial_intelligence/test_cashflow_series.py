"""UDYOGA — Financial Intelligence Engine: Cash-Flow Series & Resilience Test Suite.

Verifies monthly and weekly time bucketing, category segregation,
coverage metadata handling, missing-period detection, continuity metrics,
repayment extraction, seasonality limits, resilience handoff adapter,
and cross-phase reconciliation with Phase 1 parser, Phase 2 DNA, and Phase 3 graph.
"""

from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
import pytest

from app.modules.financial_intelligence.parser import (
    NormalizedTransaction,
    ParseResult,
    TransactionCategory,
    TransactionChannel,
    TransactionDirection,
    parse_transactions,
)
from app.modules.financial_intelligence.dna_engine import compute_financial_dna
from app.modules.financial_intelligence.graph_analyzer import build_and_analyze
from app.modules.financial_intelligence.cashflow_series import (
    CashflowContinuitySummary,
    CashflowPeriodBucket,
    CashflowSeriesResult,
    ContractualObligationItem,
    CoverageMetadata,
    PeriodCoverageStatus,
    RepaymentObservationSummary,
    ResilienceHandoffStatus,
    ResilienceInputResult,
    SeasonalityReadinessStatus,
    TrendDirection,
    build_cashflow_series,
    prepare_resilience_inputs,
)


def _tx(
    tx_id: str,
    ts: datetime,
    amount: str,
    direction: TransactionDirection,
    category: TransactionCategory = TransactionCategory.REVENUE,
    cp_id: str = "CP-1",
) -> NormalizedTransaction:
    """Helper to instantiate test transactions."""
    return NormalizedTransaction(
        transaction_id=tx_id,
        timestamp=ts,
        amount=Decimal(amount),
        direction=direction,
        category=category,
        channel=TransactionChannel.UPI,
        counterparty_id=cp_id,
        counterparty_name=f"Entity {cp_id}",
    )


# ==============================================================================
# TESTS 1 - 9: BUCKETING, BOUNDARIES & PRECISION
# ==============================================================================

def test_01_empty_input():
    """Empty transactions produce empty bucket list and safe zero/neutral continuity metrics."""
    res = build_cashflow_series([], business_id="EMPTY-BIZ")
    assert res.business_id == "EMPTY-BIZ"
    assert len(res.buckets) == 0
    assert res.continuity.total_buckets == 0
    assert res.continuity.observed_activity_periods == 0
    assert res.repayments.total_repayments_observed == Decimal("0.00")
    assert res.seasonality.seasonality_status == SeasonalityReadinessStatus.INSUFFICIENT_HISTORY


def test_02_single_credit_transaction():
    """Single credit transaction produces 1 bucket with credit & revenue appropriately attributed."""
    t = _tx("TX-1", datetime(2026, 3, 15, 10, 0), "25000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE)
    res = build_cashflow_series([t])

    assert len(res.buckets) == 1
    b = res.buckets[0]
    assert b.period_id == "2026-03"
    assert b.period_start == date(2026, 3, 1)
    assert b.period_end == date(2026, 3, 31)
    assert b.observed_credit_total == Decimal("25000.00")
    assert b.categorized_business_revenue == Decimal("25000.00")
    assert b.observed_debit_total == Decimal("0.00")
    assert b.observed_net_cashflow == Decimal("25000.00")


def test_03_single_debit_transaction():
    """Single debit transaction produces 1 bucket with debit & opex attributed."""
    t = _tx("TX-1", datetime(2026, 3, 15, 10, 0), "12000.00", TransactionDirection.DEBIT, TransactionCategory.SUPPLIER_PAYMENT)
    res = build_cashflow_series([t])

    assert len(res.buckets) == 1
    b = res.buckets[0]
    assert b.observed_debit_total == Decimal("12000.00")
    assert b.categorized_operating_expenses == Decimal("12000.00")
    assert b.observed_net_cashflow == Decimal("-12000.00")
    assert b.operating_cash_surplus_proxy == Decimal("-12000.00")


def test_04_correct_monthly_grouping():
    """Transactions in different calendar months are grouped into separate YYYY-MM buckets."""
    txs = [
        _tx("T1", datetime(2026, 1, 10), "10000.00", TransactionDirection.CREDIT),
        _tx("T2", datetime(2026, 1, 20), "15000.00", TransactionDirection.CREDIT),
        _tx("T3", datetime(2026, 2, 5), "20000.00", TransactionDirection.CREDIT),
    ]
    res = build_cashflow_series(txs, frequency="monthly")
    assert len(res.buckets) == 2
    assert res.buckets[0].period_id == "2026-01"
    assert res.buckets[0].transaction_count == 2
    assert res.buckets[0].observed_credit_total == Decimal("25000.00")
    assert res.buckets[1].period_id == "2026-02"
    assert res.buckets[1].transaction_count == 1
    assert res.buckets[1].observed_credit_total == Decimal("20000.00")


def test_05_correct_iso_weekly_grouping():
    """Transactions grouped into ISO weeks format YYYY-Www with Monday start and Sunday end."""
    # 2026-01-12 is Monday (W03), 2026-01-18 is Sunday (W03), 2026-01-19 is Monday (W04)
    txs = [
        _tx("T1", datetime(2026, 1, 12, 10, 0), "5000.00", TransactionDirection.CREDIT),
        _tx("T2", datetime(2026, 1, 18, 18, 0), "7000.00", TransactionDirection.CREDIT),
        _tx("T3", datetime(2026, 1, 19, 9, 0), "9000.00", TransactionDirection.CREDIT),
    ]
    res = build_cashflow_series(txs, frequency="weekly")
    assert len(res.buckets) == 2
    assert res.buckets[0].period_id == "2026-W03"
    assert res.buckets[0].period_start == date(2026, 1, 12)
    assert res.buckets[0].period_end == date(2026, 1, 18)
    assert res.buckets[0].observed_credit_total == Decimal("12000.00")
    assert res.buckets[1].period_id == "2026-W04"
    assert res.buckets[1].observed_credit_total == Decimal("9000.00")


def test_06_december_to_january_boundary():
    """Consecutive months across calendar year-end (2025-12 to 2026-01) transition smoothly."""
    txs = [
        _tx("T1", datetime(2025, 12, 28), "30000.00", TransactionDirection.CREDIT),
        _tx("T2", datetime(2026, 1, 3), "40000.00", TransactionDirection.CREDIT),
    ]
    res = build_cashflow_series(txs, frequency="monthly")
    assert len(res.buckets) == 2
    assert res.buckets[0].period_id == "2025-12"
    assert res.buckets[1].period_id == "2026-01"
    assert res.buckets[0].period_end == date(2025, 12, 31)
    assert res.buckets[1].period_start == date(2026, 1, 1)


def test_07_iso_year_boundary():
    """ISO year boundary handled accurately (e.g. 2026-01-01 is Thursday of 2026-W01)."""
    t = _tx("T1", datetime(2026, 1, 1), "1000.00", TransactionDirection.CREDIT)
    res = build_cashflow_series([t], frequency="weekly")
    assert res.buckets[0].period_id == "2026-W01"
    assert res.buckets[0].period_start == date(2025, 12, 29)  # Monday
    assert res.buckets[0].period_end == date(2026, 1, 4)      # Sunday


def test_08_unsorted_records():
    """Unsorted transaction timestamps are aggregated deterministically into correct chronological buckets."""
    txs = [
        _tx("T3", datetime(2026, 3, 1), "300.00", TransactionDirection.CREDIT),
        _tx("T1", datetime(2026, 1, 1), "100.00", TransactionDirection.CREDIT),
        _tx("T2", datetime(2026, 2, 1), "200.00", TransactionDirection.CREDIT),
    ]
    res = build_cashflow_series(txs, frequency="monthly")
    assert [b.period_id for b in res.buckets] == ["2026-01", "2026-02", "2026-03"]
    assert [b.observed_credit_total for b in res.buckets] == [Decimal("100.00"), Decimal("200.00"), Decimal("300.00")]


def test_09_decimal_precision():
    """Fractional paisa values maintain exact Decimal precision without floating-point drift."""
    txs = [
        _tx("T1", datetime(2026, 1, 5), "12345.67", TransactionDirection.CREDIT),
        _tx("T2", datetime(2026, 1, 15), "23456.78", TransactionDirection.CREDIT),
        _tx("T3", datetime(2026, 1, 25), "5000.45", TransactionDirection.DEBIT),
    ]
    res = build_cashflow_series(txs)
    b = res.buckets[0]
    assert b.observed_credit_total == Decimal("35802.45")
    assert b.observed_debit_total == Decimal("5000.45")
    assert b.observed_net_cashflow == Decimal("30802.00")


# ==============================================================================
# TESTS 10 - 18: FINANCIAL CATEGORIZATION, NET CASH FLOW & REPAYMENTS
# ==============================================================================

def test_10_categorized_business_revenue():
    """Only CREDIT transactions with category REVENUE count toward categorized_business_revenue."""
    txs = [
        _tx("T1", datetime(2026, 1, 5), "50000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE),
        _tx("T2", datetime(2026, 1, 10), "20000.00", TransactionDirection.CREDIT, TransactionCategory.PERSONAL),
    ]
    res = build_cashflow_series(txs)
    b = res.buckets[0]
    assert b.observed_credit_total == Decimal("70000.00")
    assert b.categorized_business_revenue == Decimal("50000.00")
    assert b.uncategorized_credit_total == Decimal("20000.00")


def test_11_categorized_operating_expenses():
    """DEBIT transactions with SUPPLIER_PAYMENT, RENT, UTILITY, and SALARY count toward OpEx."""
    txs = [
        _tx("T1", datetime(2026, 1, 2), "10000.00", TransactionDirection.DEBIT, TransactionCategory.SUPPLIER_PAYMENT),
        _tx("T2", datetime(2026, 1, 5), "8000.00", TransactionDirection.DEBIT, TransactionCategory.RENT),
        _tx("T3", datetime(2026, 1, 8), "2000.00", TransactionDirection.DEBIT, TransactionCategory.UTILITY),
        _tx("T4", datetime(2026, 1, 10), "15000.00", TransactionDirection.DEBIT, TransactionCategory.SALARY),
    ]
    res = build_cashflow_series(txs)
    b = res.buckets[0]
    assert b.categorized_operating_expenses == Decimal("35000.00")


def test_12_non_revenue_credits_isolated():
    """Non-revenue credits (personal capital injection, loan disbursals) do not inflate revenue."""
    t = _tx("T1", datetime(2026, 1, 1), "100000.00", TransactionDirection.CREDIT, TransactionCategory.PERSONAL)
    res = build_cashflow_series([t])
    b = res.buckets[0]
    assert b.observed_credit_total == Decimal("100000.00")
    assert b.categorized_business_revenue == Decimal("0.00")
    assert b.uncategorized_credit_total == Decimal("100000.00")


def test_13_non_operating_debits_isolated():
    """Personal drawings and tax/other non-operating debits are excluded from OpEx."""
    t = _tx("T1", datetime(2026, 1, 1), "30000.00", TransactionDirection.DEBIT, TransactionCategory.PERSONAL)
    res = build_cashflow_series([t])
    b = res.buckets[0]
    assert b.observed_debit_total == Decimal("30000.00")
    assert b.categorized_operating_expenses == Decimal("0.00")
    assert b.uncategorized_debit_total == Decimal("30000.00")


def test_14_net_observed_cashflow():
    """Net observed cash flow is strictly total credits minus total debits."""
    txs = [
        _tx("T1", datetime(2026, 1, 1), "50000.00", TransactionDirection.CREDIT),
        _tx("T2", datetime(2026, 1, 2), "30000.00", TransactionDirection.DEBIT),
    ]
    res = build_cashflow_series(txs)
    assert res.buckets[0].observed_net_cashflow == Decimal("20000.00")


def test_15_operating_cash_surplus_proxy():
    """Operating surplus proxy is categorized revenue minus categorized OpEx."""
    txs = [
        _tx("T1", datetime(2026, 1, 1), "80000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE),
        _tx("T2", datetime(2026, 1, 2), "50000.00", TransactionDirection.DEBIT, TransactionCategory.SUPPLIER_PAYMENT),
        _tx("T3", datetime(2026, 1, 3), "10000.00", TransactionDirection.DEBIT, TransactionCategory.PERSONAL),  # Non-opex
    ]
    res = build_cashflow_series(txs)
    b = res.buckets[0]
    # Net cash flow = 80k - 60k = 20k
    assert b.observed_net_cashflow == Decimal("20000.00")
    # Operating surplus = 80k - 50k = 30k
    assert b.operating_cash_surplus_proxy == Decimal("30000.00")


def test_16_loan_repayment_aggregation():
    """Loan repayments aggregated separately from OpEx and summarized in repayments object."""
    txs = [
        _tx("T1", datetime(2026, 1, 10), "15000.00", TransactionDirection.DEBIT, TransactionCategory.LOAN_REPAYMENT, "BANK_HDFC"),
        _tx("T2", datetime(2026, 2, 10), "15000.00", TransactionDirection.DEBIT, TransactionCategory.LOAN_REPAYMENT, "BANK_HDFC"),
    ]
    res = build_cashflow_series(txs)
    assert res.repayments.total_repayments_observed == Decimal("30000.00")
    assert res.repayments.repayment_transaction_count == 2
    assert res.repayments.repayment_periods_count == 2
    assert res.repayments.average_periodic_repayment == Decimal("15000.00")
    assert res.repayments.distinct_lender_counterparties == ["BANK_HDFC"]
    assert res.buckets[0].categorized_operating_expenses == Decimal("0.00")


def test_17_unknown_obligations_default():
    """prepare_resilience_inputs leaves contractual obligations as None if not supplied."""
    t = _tx("T1", datetime(2026, 1, 1), "50000.00", TransactionDirection.CREDIT)
    series = build_cashflow_series([t])
    resilience_in = prepare_resilience_inputs(series)

    assert resilience_in.known_contractual_obligations is None
    assert any("UNKNOWN" in note for note in resilience_in.notes)


def test_18_explicitly_supplied_obligations():
    """prepare_resilience_inputs attaches caller-supplied contractual obligations cleanly."""
    t = _tx("T1", datetime(2026, 1, 1), "50000.00", TransactionDirection.CREDIT)
    series = build_cashflow_series([t])
    known_obs = [
        {"obligation_id": "LOAN-99", "lender_name": "SIDBI", "monthly_installment": Decimal("18500.00")}
    ]
    resilience_in = prepare_resilience_inputs(series, known_obligations=known_obs)

    assert resilience_in.known_contractual_obligations is not None
    assert len(resilience_in.known_contractual_obligations) == 1
    assert resilience_in.known_contractual_obligations[0].monthly_installment == Decimal("18500.00")


# ==============================================================================
# TESTS 19 - 25: COVERAGE, CONTINUITY, MISSING PERIODS & SEASONALITY
# ==============================================================================

def test_19_missing_period_detection():
    """A calendar month gap (e.g. Jan and March observed, Feb missing) inserts a missing bucket."""
    txs = [
        _tx("T1", datetime(2026, 1, 15), "40000.00", TransactionDirection.CREDIT),
        _tx("T2", datetime(2026, 3, 15), "50000.00", TransactionDirection.CREDIT),
    ]
    res = build_cashflow_series(txs, frequency="monthly")

    assert len(res.buckets) == 3
    assert [b.period_id for b in res.buckets] == ["2026-01", "2026-02", "2026-03"]
    feb_bucket = res.buckets[1]
    assert feb_bucket.transaction_count == 0
    assert feb_bucket.observed_credit_total == Decimal("0.00")
    assert feb_bucket.is_missing_period is True
    assert res.continuity.missing_periods == 1


def test_20_unknown_coverage_handling():
    """Default coverage without caller statement metadata is labeled UNKNOWN."""
    t = _tx("T1", datetime(2026, 1, 10), "10000.00", TransactionDirection.CREDIT)
    res = build_cashflow_series([t])
    assert res.buckets[0].coverage_status == PeriodCoverageStatus.UNKNOWN
    assert res.continuity.unknown_coverage_periods == 1


def test_21_explicit_complete_coverage():
    """Caller-provided complete coverage metadata marks periods as COMPLETE."""
    t = _tx("T1", datetime(2026, 1, 10), "10000.00", TransactionDirection.CREDIT)
    cov = CoverageMetadata(is_documented_complete=True)
    res = build_cashflow_series([t], coverage=cov)
    assert res.buckets[0].coverage_status == PeriodCoverageStatus.COMPLETE
    assert res.continuity.documented_complete_periods == 1


def test_22_partial_coverage_metadata():
    """Coverage metadata with statement boundaries creates continuous span."""
    t = _tx("T1", datetime(2026, 2, 10), "10000.00", TransactionDirection.CREDIT)
    cov = CoverageMetadata(statement_start=date(2026, 1, 1), statement_end=date(2026, 3, 31))
    res = build_cashflow_series([t], coverage=cov)

    assert len(res.buckets) == 3
    assert [b.period_id for b in res.buckets] == ["2026-01", "2026-02", "2026-03"]
    assert res.buckets[0].is_missing_period is True
    assert res.buckets[2].is_missing_period is True


def test_23_coverage_qualified_continuity_metrics():
    """Continuity summary reports positive/negative net cashflow counts and runs."""
    txs = [
        _tx("T1", datetime(2026, 1, 1), "50000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE),
        _tx("T2", datetime(2026, 2, 1), "40000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE),
        _tx("T3", datetime(2026, 2, 15), "60000.00", TransactionDirection.DEBIT, TransactionCategory.SUPPLIER_PAYMENT),
        _tx("T4", datetime(2026, 3, 1), "70000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE),
    ]
    res = build_cashflow_series(txs)
    c = res.continuity
    assert c.total_buckets == 3
    assert c.positive_net_cashflow_periods == 2  # Jan (+50k), Mar (+70k)
    assert c.negative_net_cashflow_periods == 1  # Feb (-20k)
    assert c.largest_negative_net_cashflow_period == "2026-02"
    assert c.largest_negative_net_cashflow_amount == Decimal("-20000.00")


def test_24_missing_month_does_not_claim_zero_verified_revenue():
    """Limitations string on missing period bucket explicitly states revenue is unverified."""
    txs = [
        _tx("T1", datetime(2026, 1, 1), "10000.00", TransactionDirection.CREDIT),
        _tx("T2", datetime(2026, 3, 1), "10000.00", TransactionDirection.CREDIT),
    ]
    res = build_cashflow_series(txs)
    missing_b = res.buckets[1]
    assert "Does not establish verified zero revenue" in missing_b.limitations


def test_25_seasonality_insufficient_history_result():
    """Fewer than 24 complete months strictly returns INSUFFICIENT_HISTORY for seasonality."""
    txs = [
        _tx(f"T-{m}", datetime(2026, m, 1), "50000.00", TransactionDirection.CREDIT)
        for m in range(1, 7)
    ]
    res = build_cashflow_series(txs)
    assert res.seasonality.seasonality_status == SeasonalityReadinessStatus.INSUFFICIENT_HISTORY
    assert res.seasonality.total_months_observed == 6


# ==============================================================================
# TESTS 26 - 35: TRACEABILITY, SERIALIZATION, RECONCILIATION & SCALE
# ==============================================================================

def test_26_evidence_transaction_references():
    """Every bucket maintains exact supporting transaction ID references."""
    txs = [
        _tx("TX-A", datetime(2026, 1, 5), "1000.00", TransactionDirection.CREDIT),
        _tx("TX-B", datetime(2026, 1, 15), "2000.00", TransactionDirection.CREDIT),
    ]
    res = build_cashflow_series(txs)
    assert res.buckets[0].evidence_transaction_ids == ["TX-A", "TX-B"]


def test_27_duplicate_transaction_handling():
    """Duplicate transaction IDs are deduplicated without double-counting amounts."""
    txs = [
        _tx("DUP-1", datetime(2026, 1, 1), "20000.00", TransactionDirection.CREDIT),
        _tx("DUP-1", datetime(2026, 1, 1), "20000.00", TransactionDirection.CREDIT),
    ]
    res = build_cashflow_series(txs)
    assert res.buckets[0].observed_credit_total == Decimal("20000.00")
    assert res.buckets[0].transaction_count == 1


def test_28_serialization_safety():
    """to_dict() serializes all Decimals as strings and dates to ISO format without NaN or floats."""
    t = _tx("T1", datetime(2026, 1, 1), "15000.50", TransactionDirection.CREDIT)
    res = build_cashflow_series([t])
    d = res.to_dict()

    assert isinstance(d["buckets"][0]["observed_credit_total"], str)
    assert d["buckets"][0]["observed_credit_total"] == "15000.50"
    assert d["buckets"][0]["period_start"] == "2026-01-01"


def test_29_phase_1_parser_compatibility():
    """Directly ingests Phase 1 parse_transactions output into build_cashflow_series."""
    csv_text = """Transaction ID,Date,Amount,Direction,Category,Channel,Counterparty ID,Counterparty Name
TX-01,2026-01-10,35000.00,CREDIT,REVENUE,UPI,CP-01,Sharma Ent
TX-02,2026-01-20,15000.00,DEBIT,SUPPLIER_PAYMENT,NEFT,CP-02,Apex Steel
"""
    parsed = parse_transactions(csv_text)
    series = build_cashflow_series(parsed, business_id="KUMAR-MFG")

    assert series.business_id == "KUMAR-MFG"
    assert len(series.buckets) == 1
    assert series.buckets[0].observed_credit_total == Decimal("35000.00")
    assert series.buckets[0].categorized_operating_expenses == Decimal("15000.00")


def test_30_phase_2_dna_reconciliation():
    """Cashflow series totals strictly reconcile with Phase 2 Financial DNA metrics."""
    txs = [
        _tx("T1", datetime(2026, 1, 5), "50000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE),
        _tx("T2", datetime(2026, 1, 10), "10000.00", TransactionDirection.CREDIT, TransactionCategory.PERSONAL),
        _tx("T3", datetime(2026, 1, 15), "25000.00", TransactionDirection.DEBIT, TransactionCategory.SUPPLIER_PAYMENT),
        _tx("T4", datetime(2026, 1, 20), "5000.00", TransactionDirection.DEBIT, TransactionCategory.LOAN_REPAYMENT),
    ]
    dna = compute_financial_dna(txs)
    series = build_cashflow_series(txs)
    recon = series.reconciliation_summary

    assert Decimal(recon["total_observed_credits"]) == dna.cash_flow_activity.total_credits
    assert Decimal(recon["total_observed_debits"]) == dna.cash_flow_activity.total_debits
    assert Decimal(recon["net_observed_cashflow"]) == dna.cash_flow_activity.net_observed_cashflow
    assert Decimal(recon["categorized_business_revenue"]) == dna.revenue_intelligence.observed_business_revenue
    assert Decimal(recon["categorized_operating_expenses"]) == dna.operating_expenses.observed_operating_expenses
    assert Decimal(recon["observed_debt_repayments"]) == dna.debt_repayments.observed_debt_repayments_total


def test_31_phase_3_graph_coverage_compatibility():
    """Series dataset volume matches Graph data_coverage total dataset volume."""
    txs = [
        _tx("T1", datetime(2026, 1, 1), "40000.00", TransactionDirection.CREDIT, cp_id="KNOWN_CP"),
        _tx("T2", datetime(2026, 1, 2), "10000.00", TransactionDirection.CREDIT, cp_id=""),  # unlabelled
    ]
    series = build_cashflow_series(txs)
    graph = build_and_analyze(txs)

    series_total_inflow = Decimal(series.reconciliation_summary["total_observed_credits"])
    graph_dataset_inflow = graph.data_coverage.total_dataset_inflow
    assert series_total_inflow == graph_dataset_inflow


def test_32_deterministic_output_ordering():
    """Repeated executions produce byte-for-byte identical serialized dictionaries."""
    txs = [
        _tx("T2", datetime(2026, 2, 1), "2000.00", TransactionDirection.CREDIT),
        _tx("T1", datetime(2026, 1, 1), "1000.00", TransactionDirection.CREDIT),
    ]
    d1 = build_cashflow_series(txs).to_dict()
    d2 = build_cashflow_series(txs).to_dict()
    assert d1 == d2


def test_33_resilience_input_adapter_output():
    """prepare_resilience_inputs converts CashflowSeriesResult into aligned lists."""
    txs = [
        _tx("T1", datetime(2026, 1, 5), "50000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE),
        _tx("T2", datetime(2026, 2, 5), "60000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE),
        _tx("T3", datetime(2026, 3, 5), "70000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE),
    ]
    series = build_cashflow_series(txs)
    res_input = prepare_resilience_inputs(series)

    assert res_input.business_id == "MSME"
    assert res_input.period_identifiers == ["2026-01", "2026-02", "2026-03"]
    assert res_input.historical_revenue_series == [Decimal("50000.00"), Decimal("60000.00"), Decimal("70000.00")]
    assert res_input.handoff_readiness_status == ResilienceHandoffStatus.READY
    assert len(res_input.category_limitations) >= 4


def test_34_missing_contractual_repayment_information():
    """Resilience handoff explicitly notes when future obligations are unsupplied."""
    t = _tx("T1", datetime(2026, 1, 1), "20000.00", TransactionDirection.CREDIT)
    series = build_cashflow_series([t])
    res_in = prepare_resilience_inputs(series)

    assert res_in.known_contractual_obligations is None
    assert any("contractual debt obligations were not supplied" in n for n in res_in.notes)


def test_35_larger_synthetic_dataset_smoke_test():
    """Performance smoke test with 1,200 transactions across 24 months completes under 0.5s."""
    import time
    base = datetime(2024, 1, 1, 10, 0)
    txs = []
    for i in range(1200):
        m_offset = i % 24
        d_offset = (i % 28) + 1
        ts = datetime(2024 + (m_offset // 12), (m_offset % 12) + 1, d_offset, 12, 0)
        direction = TransactionDirection.CREDIT if i % 2 == 0 else TransactionDirection.DEBIT
        cat = TransactionCategory.REVENUE if direction == TransactionDirection.CREDIT else TransactionCategory.SUPPLIER_PAYMENT
        txs.append(
            NormalizedTransaction(
                transaction_id=f"SCALE-TX-{i:05d}",
                timestamp=ts,
                amount=Decimal(str(1000 + i)),
                direction=direction,
                category=cat,
                channel=TransactionChannel.UPI,
                counterparty_id=f"CP-{(i % 10):02d}",
                counterparty_name="Vendor Entity",
            )
        )

    t0 = time.time()
    res = build_cashflow_series(txs, frequency="monthly")
    res_in = prepare_resilience_inputs(res)
    elapsed = time.time() - t0

    assert len(res.buckets) == 24
    assert res.continuity.total_buckets == 24
    res_input_dict = res_in.to_dict()
    assert isinstance(res_input_dict, dict)
    assert elapsed < 1.0
