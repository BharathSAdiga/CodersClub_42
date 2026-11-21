"""UDYOGA — Financial Intelligence Engine: Unified Pipeline & Cross-Module Reconciliation.

Orchestrates the complete deterministic financial analysis lifecycle:
1. CSV Ingestion & Validation (Phase 1)
2. Financial DNA & Business Metrics (Phase 2)
3. Counterparty Network Analysis & Anomaly Detection (Phase 3)
4. Weekly & Monthly Cashflow Series & Missing Period Detection (Phase 4)
5. Cross-Module Mathematical Reconciliation (Phase 5)
6. Downstream Resilience Input Package Generation (Phase 5)

Strict design invariants:
- Zero fabrication of transactions, bank balances, or debt obligations.
- Decimals used for all internal currency computations.
- Reconciles 1-to-1 across modules (Parser <-> DNA <-> Graph <-> Cashflow).
- Safe JSON-compatible serialization with no NaN or floating-point drift.
- Explicit execution statuses distinguishing invalid input from insufficient data.
"""

from __future__ import annotations

from datetime import date, datetime, timezone
from decimal import Decimal
from enum import Enum
from io import TextIOBase
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Union

from pydantic import BaseModel, ConfigDict, Field

from app.modules.financial_intelligence.parser import (
    NormalizedTransaction,
    ParseResult,
    ValidationIssue,
    parse_transactions,
)
from app.modules.financial_intelligence.dna_engine import (
    FinancialDnaReport,
    compute_financial_dna,
)
from app.modules.financial_intelligence.graph_analyzer import (
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


# ==============================================================================
# PIPELINE STATUSES & DATA MODELS
# ==============================================================================

class PipelineExecutionStatus(str, Enum):
    """Overall execution quality and completeness status of the financial pipeline."""
    SUCCESS = "SUCCESS"                      # Full validity, continuous data, reconciliation passed
    PARTIAL_SUCCESS = "PARTIAL_SUCCESS"      # Valid computations, but sparse history, missing gaps, or recoverable warnings
    INVALID_INPUT = "INVALID_INPUT"          # Malformed CSV, unparseable headers, or 100% rejected rows
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"  # Valid schema but empty dataset (0 transactions)
    INTERNAL_ERROR = "INTERNAL_ERROR"        # Caught unexpected execution failure


class ReconciliationStatus(str, Enum):
    """Result of an individual cross-module mathematical consistency verification."""
    PASS = "PASS"
    FAIL = "FAIL"
    NOT_ASSESSABLE = "NOT_ASSESSABLE"


class ReconciliationCheckResult(BaseModel):
    """Outcome of a single cross-module consistency assertion."""
    check_code: str = Field(..., description="Machine-readable assertion code")
    status: ReconciliationStatus
    expected_value: Any
    actual_value: Any
    explanation: str

    model_config = ConfigDict(frozen=True)


class ValidationSummary(BaseModel):
    """High-level summary of transaction parsing and data cleanliness."""
    total_rows: int = 0
    valid_rows: int = 0
    invalid_rows: int = 0
    duplicate_rows: int = 0
    warning_count: int = 0
    issues: List[Dict[str, Any]] = Field(default_factory=list)

    model_config = ConfigDict(frozen=True)


class FinancialIntelligencePipelineResult(BaseModel):
    """Unified, typed result produced by the Financial Intelligence Engine."""
    business_id: str
    execution_status: PipelineExecutionStatus
    execution_timestamp: datetime
    parse_summary: ValidationSummary
    accepted_transaction_count: int
    rejected_transaction_count: int
    financial_dna: Optional[FinancialDnaReport] = None
    graph_investigation: Optional[GraphAnalysisResult] = None
    monthly_cashflow_series: Optional[CashflowSeriesResult] = None
    weekly_cashflow_series: Optional[CashflowSeriesResult] = None
    resilience_input_package: Optional[ResilienceInputResult] = None
    reconciliation: List[ReconciliationCheckResult] = Field(default_factory=list)
    overall_reconciliation_pass: bool = False
    data_sufficiency_limitations: List[str] = Field(default_factory=list)
    integration_warnings: List[str] = Field(default_factory=list)

    model_config = ConfigDict(frozen=True)

    def to_dict(self) -> Dict[str, Any]:
        """Serializes the pipeline result to a pure JSON-safe dict.

        Enforces:
        - Decimals serialized as strings to preserve precision.
        - Datetimes & dates serialized to ISO 8601 strings.
        - Enums serialized to their string values.
        - None/null values explicitly preserved.
        - No NaN or Infinity.
        """
        def serialize_item(obj: Any) -> Any:
            if isinstance(obj, Decimal):
                return str(obj)
            if isinstance(obj, (date, datetime)):
                return obj.isoformat()
            if isinstance(obj, Enum):
                return obj.value
            if isinstance(obj, BaseModel):
                return {k: serialize_item(v) for k, v in obj.model_dump().items()}
            if isinstance(obj, dict):
                return {k: serialize_item(v) for k, v in obj.items()}
            if isinstance(obj, (list, tuple)):
                return [serialize_item(item) for item in obj]
            return obj

        return serialize_item(self)


# ==============================================================================
# CROSS-MODULE RECONCILIATION ENGINE
# ==============================================================================

def perform_cross_module_reconciliation(
    accepted_txs: List[NormalizedTransaction],
    dna_report: Optional[FinancialDnaReport],
    graph_result: Optional[GraphAnalysisResult],
    monthly_series: Optional[CashflowSeriesResult],
    weekly_series: Optional[CashflowSeriesResult],
) -> Tuple[List[ReconciliationCheckResult], bool]:
    """Validates exact mathematical consistency across parser, DNA, graph, and cashflow series.

    Invariants checked:
    1. Transaction count congruence (Parser accepted count == Series analyzed count).
    2. Total Credits (DNA total_credits == Monthly total_observed_credits).
    3. Total Debits (DNA total_debits == Monthly total_observed_debits).
    4. Net Cash Flow (DNA net_observed_cashflow == Monthly net cash flow).
    5. Categorized Revenue (DNA observed_business_revenue == Monthly categorized revenue).
    6. Categorized OpEx (DNA observed_operating_expenses == Monthly categorized OpEx).
    7. Loan Repayments (DNA observed_debt_repayments_total == Monthly loan repayments).
    8. Monthly vs Weekly Inflow Totals.
    9. Monthly vs Weekly Outflow Totals.
    10. Graph identifiable volume <= Dataset observed volume.
    11. Evidence reference validity (all referenced IDs exist in accepted set).
    """
    checks: List[ReconciliationCheckResult] = []
    overall_pass = True

    accepted_tx_ids = set(t.transaction_id for t in accepted_txs)
    accepted_count = len(accepted_txs)

    # If no transactions were accepted, reconcile empty state safely
    if accepted_count == 0 or not dna_report or not monthly_series:
        checks.append(
            ReconciliationCheckResult(
                check_code="EMPTY_DATASET_CHECK",
                status=ReconciliationStatus.PASS,
                expected_value=0,
                actual_value=accepted_count,
                explanation="No valid transactions were provided; empty reconciliation verified.",
            )
        )
        return checks, True

    # Check 1: Transaction Count
    monthly_tx_count = sum(b.transaction_count for b in monthly_series.buckets if not b.is_missing_period)
    ch1_pass = accepted_count == monthly_tx_count
    if not ch1_pass:
        overall_pass = False
    checks.append(
        ReconciliationCheckResult(
            check_code="TX_COUNT_CONGRUENCE",
            status=ReconciliationStatus.PASS if ch1_pass else ReconciliationStatus.FAIL,
            expected_value=accepted_count,
            actual_value=monthly_tx_count,
            explanation="Accepted parser transactions equal total non-missing monthly bucket transaction count.",
        )
    )

    # Check 2: Total Credits
    dna_credits = dna_report.cash_flow_activity.total_credits
    m_credits = Decimal(monthly_series.reconciliation_summary["total_observed_credits"])
    ch2_pass = dna_credits == m_credits
    if not ch2_pass:
        overall_pass = False
    checks.append(
        ReconciliationCheckResult(
            check_code="TOTAL_CREDIT_RECONCILIATION",
            status=ReconciliationStatus.PASS if ch2_pass else ReconciliationStatus.FAIL,
            expected_value=str(dna_credits),
            actual_value=str(m_credits),
            explanation="Financial DNA observed credits match Monthly cashflow series observed credits.",
        )
    )

    # Check 3: Total Debits
    dna_debits = dna_report.cash_flow_activity.total_debits
    m_debits = Decimal(monthly_series.reconciliation_summary["total_observed_debits"])
    ch3_pass = dna_debits == m_debits
    if not ch3_pass:
        overall_pass = False
    checks.append(
        ReconciliationCheckResult(
            check_code="TOTAL_DEBIT_RECONCILIATION",
            status=ReconciliationStatus.PASS if ch3_pass else ReconciliationStatus.FAIL,
            expected_value=str(dna_debits),
            actual_value=str(m_debits),
            explanation="Financial DNA observed debits match Monthly cashflow series observed debits.",
        )
    )

    # Check 4: Net Cash Flow
    dna_net = dna_report.cash_flow_activity.net_observed_cashflow
    m_net = Decimal(monthly_series.reconciliation_summary["net_observed_cashflow"])
    ch4_pass = dna_net == m_net
    if not ch4_pass:
        overall_pass = False
    checks.append(
        ReconciliationCheckResult(
            check_code="NET_CASHFLOW_RECONCILIATION",
            status=ReconciliationStatus.PASS if ch4_pass else ReconciliationStatus.FAIL,
            expected_value=str(dna_net),
            actual_value=str(m_net),
            explanation="Financial DNA net observed cash flow matches Monthly aggregated net cash flow.",
        )
    )

    # Check 5: Categorized Business Revenue
    dna_rev = dna_report.revenue_intelligence.observed_business_revenue
    m_rev = Decimal(monthly_series.reconciliation_summary["categorized_business_revenue"])
    ch5_pass = dna_rev == m_rev
    if not ch5_pass:
        overall_pass = False
    checks.append(
        ReconciliationCheckResult(
            check_code="REVENUE_RECONCILIATION",
            status=ReconciliationStatus.PASS if ch5_pass else ReconciliationStatus.FAIL,
            expected_value=str(dna_rev),
            actual_value=str(m_rev),
            explanation="Financial DNA business revenue matches Monthly categorized business revenue.",
        )
    )

    # Check 6: Categorized Operating Expenses
    dna_opex = dna_report.operating_expenses.observed_operating_expenses
    m_opex = Decimal(monthly_series.reconciliation_summary["categorized_operating_expenses"])
    ch6_pass = dna_opex == m_opex
    if not ch6_pass:
        overall_pass = False
    checks.append(
        ReconciliationCheckResult(
            check_code="OPEX_RECONCILIATION",
            status=ReconciliationStatus.PASS if ch6_pass else ReconciliationStatus.FAIL,
            expected_value=str(dna_opex),
            actual_value=str(m_opex),
            explanation="Financial DNA operating expenses match Monthly categorized operating expenses.",
        )
    )

    # Check 7: Debt Repayments
    dna_repay = dna_report.debt_repayments.observed_debt_repayments_total
    m_repay = Decimal(monthly_series.reconciliation_summary["observed_debt_repayments"])
    ch7_pass = dna_repay == m_repay
    if not ch7_pass:
        overall_pass = False
    checks.append(
        ReconciliationCheckResult(
            check_code="REPAYMENT_RECONCILIATION",
            status=ReconciliationStatus.PASS if ch7_pass else ReconciliationStatus.FAIL,
            expected_value=str(dna_repay),
            actual_value=str(m_repay),
            explanation="Financial DNA loan repayments match Monthly cashflow series loan repayments.",
        )
    )

    # Check 8 & 9: Weekly vs Monthly Totals
    if weekly_series:
        w_credits = Decimal(weekly_series.reconciliation_summary["total_observed_credits"])
        w_debits = Decimal(weekly_series.reconciliation_summary["total_observed_debits"])
        ch8_pass = m_credits == w_credits
        ch9_pass = m_debits == w_debits
        if not (ch8_pass and ch9_pass):
            overall_pass = False
        checks.append(
            ReconciliationCheckResult(
                check_code="WEEKLY_MONTHLY_INFLOW_CONGRUENCE",
                status=ReconciliationStatus.PASS if ch8_pass else ReconciliationStatus.FAIL,
                expected_value=str(m_credits),
                actual_value=str(w_credits),
                explanation="Monthly aggregated inflows equal Weekly aggregated inflows exactly.",
            )
        )
        checks.append(
            ReconciliationCheckResult(
                check_code="WEEKLY_MONTHLY_OUTFLOW_CONGRUENCE",
                status=ReconciliationStatus.PASS if ch9_pass else ReconciliationStatus.FAIL,
                expected_value=str(m_debits),
                actual_value=str(w_debits),
                explanation="Monthly aggregated outflows equal Weekly aggregated outflows exactly.",
            )
        )

    # Check 10: Graph Identifiable Total vs Dataset Total
    if graph_result:
        graph_vol = graph_result.graph_statistics.total_graph_volume
        dataset_vol = graph_result.data_coverage.total_dataset_volume
        ch10_pass = graph_vol <= dataset_vol
        if not ch10_pass:
            overall_pass = False
        checks.append(
            ReconciliationCheckResult(
                check_code="GRAPH_VOLUME_BOUNDS",
                status=ReconciliationStatus.PASS if ch10_pass else ReconciliationStatus.FAIL,
                expected_value=f"<= {dataset_vol}",
                actual_value=str(graph_vol),
                explanation="Graph-represented volume does not exceed total dataset transaction volume.",
            )
        )

    # Check 11: Evidence Reference Integrity
    invalid_refs: List[str] = []
    for b in monthly_series.buckets:
        for ref_id in b.evidence_transaction_ids:
            if ref_id not in accepted_tx_ids:
                invalid_refs.append(ref_id)
    ch11_pass = len(invalid_refs) == 0
    if not ch11_pass:
        overall_pass = False
    checks.append(
        ReconciliationCheckResult(
            check_code="EVIDENCE_REFERENCE_INTEGRITY",
            status=ReconciliationStatus.PASS if ch11_pass else ReconciliationStatus.FAIL,
            expected_value=0,
            actual_value=len(invalid_refs),
            explanation="All transaction ID references in monthly cashflow buckets point to accepted transactions.",
        )
    )

    return checks, overall_pass


# ==============================================================================
# PIPELINE ORCHESTRATOR
# ==============================================================================

def run_financial_intelligence_pipeline(
    csv_source: Union[str, bytes, Path, TextIOBase],
    *,
    business_id: str = "MSME",
    coverage: Optional[Union[CoverageMetadata, Dict[str, Any]]] = None,
    known_obligations: Optional[Union[List[ContractualObligationItem], List[Dict[str, Any]]]] = None,
    round_trip_window_days: int = 14,
    round_trip_tolerance_percent: float = 5.0,
) -> FinancialIntelligencePipelineResult:
    """Executes the complete deterministic Financial Intelligence pipeline over a CSV source.

    Sequence:
    1. Parses CSV, isolating validation warnings and bad rows.
    2. Computes Financial DNA from accepted records.
    3. Builds counterparty graph analysis and anomaly flags.
    4. Generates Monthly and Weekly cashflow time series with gap detection.
    5. Prepares resilience simulation input vectors.
    6. Runs mathematical cross-module reconciliation checks.
    7. Evaluates execution status and limitations.

    Returns:
        FinancialIntelligencePipelineResult with full traceability and limitation caveats.
    """
    ts_now = datetime.now(timezone.utc)
    limitations: List[str] = []
    warnings: List[str] = []

    # 1. Ingest & Validate via Phase 1 Parser
    try:
        parse_result: ParseResult = parse_transactions(csv_source)
    except Exception as exc:
        return FinancialIntelligencePipelineResult(
            business_id=business_id,
            execution_status=PipelineExecutionStatus.INTERNAL_ERROR,
            execution_timestamp=ts_now,
            parse_summary=ValidationSummary(issues=[{"error": f"Parser crash: {str(exc)}"}]),
            accepted_transaction_count=0,
            rejected_transaction_count=0,
            integration_warnings=[f"Fatal parsing failure: {str(exc)}"],
            data_sufficiency_limitations=["Source file could not be parsed; no financial analysis possible."],
        )

    val_summary = ValidationSummary(
        total_rows=parse_result.total_rows,
        valid_rows=parse_result.valid_rows,
        invalid_rows=parse_result.invalid_rows,
        duplicate_rows=parse_result.duplicate_rows,
        warning_count=len(parse_result.validation_warnings),
        issues=[
            {
                "row": w.row_number,
                "field": w.field,
                "issue": w.issue_type,
                "message": w.message,
            }
            for w in parse_result.validation_warnings[:50]  # Cap at 50 for summary
        ],
    )

    accepted_txs = list(parse_result.normalized_transactions)
    accepted_count = len(accepted_txs)
    rejected_count = parse_result.invalid_rows + parse_result.duplicate_rows

    if parse_result.duplicate_rows > 0:
        warnings.append(
            f"{parse_result.duplicate_rows} duplicate transaction row(s) were safely deduplicated without double-counting."
        )
    if parse_result.invalid_rows > 0:
        warnings.append(
            f"{parse_result.invalid_rows} malformed row(s) were rejected during parsing; review parse_summary."
        )

    # Check for empty or invalid source
    if parse_result.total_rows == 0:
        return FinancialIntelligencePipelineResult(
            business_id=business_id,
            execution_status=PipelineExecutionStatus.INVALID_INPUT,
            execution_timestamp=ts_now,
            parse_summary=val_summary,
            accepted_transaction_count=0,
            rejected_transaction_count=0,
            data_sufficiency_limitations=["CSV source was empty (0 rows); cannot construct financial assessment."],
        )

    if accepted_count == 0:
        status = (
            PipelineExecutionStatus.INVALID_INPUT
            if parse_result.invalid_rows > 0
            else PipelineExecutionStatus.INSUFFICIENT_DATA
        )
        return FinancialIntelligencePipelineResult(
            business_id=business_id,
            execution_status=status,
            execution_timestamp=ts_now,
            parse_summary=val_summary,
            accepted_transaction_count=0,
            rejected_transaction_count=rejected_count,
            data_sufficiency_limitations=["Zero valid transactions accepted; all financial metrics unavailable."],
        )

    # 2. Compute Financial DNA (Phase 2)
    try:
        dna_report = compute_financial_dna(accepted_txs, business_id=business_id)
    except Exception as exc:
        return FinancialIntelligencePipelineResult(
            business_id=business_id,
            execution_status=PipelineExecutionStatus.INTERNAL_ERROR,
            execution_timestamp=ts_now,
            parse_summary=val_summary,
            accepted_transaction_count=accepted_count,
            rejected_transaction_count=rejected_count,
            integration_warnings=[f"DNA calculation failed: {str(exc)}"],
            data_sufficiency_limitations=["Financial DNA computation failed."],
        )

    # 3. Build Counterparty Network Investigation (Phase 3)
    try:
        graph_result = build_and_analyze(
            accepted_txs,
            business_id=business_id,
            round_trip_window_days=round_trip_window_days,
            round_trip_tolerance_percent=round_trip_tolerance_percent,
        )
    except Exception as exc:
        return FinancialIntelligencePipelineResult(
            business_id=business_id,
            execution_status=PipelineExecutionStatus.INTERNAL_ERROR,
            execution_timestamp=ts_now,
            parse_summary=val_summary,
            accepted_transaction_count=accepted_count,
            rejected_transaction_count=rejected_count,
            financial_dna=dna_report,
            integration_warnings=[f"Graph analysis failed: {str(exc)}"],
            data_sufficiency_limitations=["Counterparty network graph could not be constructed."],
        )

    # 4. Generate Monthly and Weekly Cashflow Series (Phase 4)
    try:
        monthly_series = build_cashflow_series(
            accepted_txs,
            business_id=business_id,
            frequency="monthly",
            coverage=coverage,
        )
        weekly_series = build_cashflow_series(
            accepted_txs,
            business_id=business_id,
            frequency="weekly",
            coverage=coverage,
        )
    except Exception as exc:
        return FinancialIntelligencePipelineResult(
            business_id=business_id,
            execution_status=PipelineExecutionStatus.INTERNAL_ERROR,
            execution_timestamp=ts_now,
            parse_summary=val_summary,
            accepted_transaction_count=accepted_count,
            rejected_transaction_count=rejected_count,
            financial_dna=dna_report,
            graph_investigation=graph_result,
            integration_warnings=[f"Cashflow time-series construction failed: {str(exc)}"],
            data_sufficiency_limitations=["Cashflow time series could not be constructed."],
        )

    # 5. Prepare Resilience Simulation Inputs (Phase 4)
    try:
        resilience_package = prepare_resilience_inputs(
            monthly_series,
            known_obligations=known_obligations,
        )
    except Exception as exc:
        resilience_package = None
        warnings.append(f"Resilience handoff package preparation failed: {str(exc)}")

    # 6. Cross-Module Mathematical Reconciliation
    recon_checks, recon_pass = perform_cross_module_reconciliation(
        accepted_txs=accepted_txs,
        dna_report=dna_report,
        graph_result=graph_result,
        monthly_series=monthly_series,
        weekly_series=weekly_series,
    )

    # 7. Collect Data Sufficiency Limitations
    if monthly_series.continuity.missing_periods > 0:
        limitations.append(
            f"{monthly_series.continuity.missing_periods} missing period(s) detected in the statement continuum. "
            "Missing intervals reflect unobserved documentation rather than confirmed zero activity."
        )
    if graph_result.data_coverage.coverage_status in ("LIMITED", "PARTIAL"):
        limitations.append(
            f"Graph topological coverage covers {graph_result.data_coverage.graph_volume_coverage_ratio * 100:.1f}% "
            "of volume due to unlabelled counterparties in bank narration."
        )
    if monthly_series.continuity.total_buckets < 3:
        limitations.append(
            f"Only {monthly_series.continuity.total_buckets} calendar month(s) observed. "
            "Financial volatility (CV) and long-term trend directions require >= 3 continuous months."
        )
    if monthly_series.seasonality.seasonality_status == "INSUFFICIENT_HISTORY":
        limitations.append(
            "Fewer than 24 complete calendar months observed; annual recurring seasonality decomposition unavailable."
        )
    if known_obligations is None:
        limitations.append(
            "No contractual loan obligations were supplied; remaining debt service obligations remain UNKNOWN."
        )

    # 8. Determine Execution Status
    execution_status = PipelineExecutionStatus.SUCCESS
    if not recon_pass:
        execution_status = PipelineExecutionStatus.PARTIAL_SUCCESS
        warnings.append("Cross-module reconciliation detected one or more discrepancies.")
    elif monthly_series.continuity.total_buckets < 3 or monthly_series.continuity.missing_periods > 0 or rejected_count > 0:
        execution_status = PipelineExecutionStatus.PARTIAL_SUCCESS

    return FinancialIntelligencePipelineResult(
        business_id=business_id,
        execution_status=execution_status,
        execution_timestamp=ts_now,
        parse_summary=val_summary,
        accepted_transaction_count=accepted_count,
        rejected_transaction_count=rejected_count,
        financial_dna=dna_report,
        graph_investigation=graph_result,
        monthly_cashflow_series=monthly_series,
        weekly_cashflow_series=weekly_series,
        resilience_input_package=resilience_package,
        reconciliation=recon_checks,
        overall_reconciliation_pass=recon_pass,
        data_sufficiency_limitations=limitations,
        integration_warnings=warnings,
    )
