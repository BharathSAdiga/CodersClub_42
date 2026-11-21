"""UDYOGA — Financial Intelligence Engine: Cash-Flow Time-Series Intelligence.

Constructs weekly and monthly cash-flow time series, tracks period-level
data coverage and missing statement intervals, analyzes cash-flow continuity,
extracts observed debt service patterns, structures seasonality-ready data,
and prepares evidence-backed inputs for the downstream resilience engine.

Strict design invariants:
- Pure deterministic calculations; Decimal arithmetic for all currency.
- CREDIT != REVENUE; DEBIT != OPERATING EXPENSE.
- Net cash flow != Accounting profit; Operating surplus proxy != EBITDA.
- Missing periods are explicitly distinguished from verified zero activity.
- Multi-month seasonality requires >= 24 complete months; otherwise INSUFFICIENT_HISTORY.
- Unobserved future contractual obligations remain UNKNOWN; never fabricated.
- Zero Git commands. Zero external network/LLM dependencies.
"""

from __future__ import annotations

import calendar
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Any, Dict, List, Optional, Set, Tuple, Union

from pydantic import BaseModel, ConfigDict, Field

from app.modules.financial_intelligence.parser import (
    NormalizedTransaction,
    ParseResult,
    TransactionCategory,
    TransactionChannel,
    TransactionDirection,
)


# ==============================================================================
# ENUMS & STATUS CODES
# ==============================================================================

class PeriodCoverageStatus(str, Enum):
    """Statement coverage quality for a specific time bucket."""
    COMPLETE = "COMPLETE"      # Fully documented statement window
    PARTIAL = "PARTIAL"        # Truncated or boundary bucket
    UNKNOWN = "UNKNOWN"        # Unverified statement bounds
    MISSING = "MISSING"        # Identified gap in expected statement continuum


class SeasonalityReadinessStatus(str, Enum):
    """Evaluation readiness for recurring annual seasonal analysis."""
    READY = "READY"
    INSUFFICIENT_HISTORY = "INSUFFICIENT_HISTORY"
    SPARSE_DATA = "SPARSE_DATA"


class ResilienceHandoffStatus(str, Enum):
    """Readiness status of financial time-series for resilience modeling."""
    READY = "READY"
    PARTIAL = "PARTIAL"
    INSUFFICIENT_HISTORY = "INSUFFICIENT_HISTORY"


class TrendDirection(str, Enum):
    """Direction of observed business revenue trend."""
    INCREASING = "INCREASING"
    DECREASING = "DECREASING"
    STABLE = "STABLE"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"


# ==============================================================================
# DATA MODELS
# ==============================================================================

class CoverageMetadata(BaseModel):
    """Caller-provided or statement-inferred coverage interval."""
    statement_start: Optional[date] = None
    statement_end: Optional[date] = None
    is_documented_complete: bool = False
    known_missing_periods: List[str] = Field(default_factory=list)
    notes: List[str] = Field(default_factory=list)

    model_config = ConfigDict(frozen=True)


class CashflowPeriodBucket(BaseModel):
    """Aggregated financial activity for a discrete weekly or monthly bucket."""
    period_id: str = Field(..., description="YYYY-MM (monthly) or YYYY-Www (weekly)")
    period_start: date = Field(..., description="Start date of the bucket")
    period_end: date = Field(..., description="End date of the bucket")
    frequency: str = Field(..., description="'monthly' or 'weekly'")
    transaction_count: int = 0
    observed_credit_total: Decimal = Field(default=Decimal("0.00"), description="Total inflows")
    observed_debit_total: Decimal = Field(default=Decimal("0.00"), description="Total outflows")
    categorized_business_revenue: Decimal = Field(default=Decimal("0.00"), description="CREDIT + REVENUE")
    categorized_operating_expenses: Decimal = Field(default=Decimal("0.00"), description="DEBIT + (SUPPLIER/RENT/UTILITY/SALARY)")
    observed_net_cashflow: Decimal = Field(default=Decimal("0.00"), description="Credit - Debit")
    operating_cash_surplus_proxy: Decimal = Field(default=Decimal("0.00"), description="Revenue - OpEx")
    observed_loan_repayments: Decimal = Field(default=Decimal("0.00"), description="DEBIT + LOAN_REPAYMENT")
    uncategorized_credit_total: Decimal = Field(default=Decimal("0.00"), description="Non-revenue credits")
    uncategorized_debit_total: Decimal = Field(default=Decimal("0.00"), description="Non-operating, non-loan debits")
    coverage_status: PeriodCoverageStatus = PeriodCoverageStatus.UNKNOWN
    is_missing_period: bool = False
    evidence_transaction_ids: List[str] = Field(default_factory=list)
    limitations: str = Field(default="")

    model_config = ConfigDict(frozen=True)


class PeriodGrowthObservation(BaseModel):
    """Period-to-period change in categorized revenue."""
    prior_period_id: str
    current_period_id: str
    prior_revenue: Decimal
    current_revenue: Decimal
    absolute_change: Decimal
    percentage_change: Optional[float] = None
    is_consecutive: bool = True

    model_config = ConfigDict(frozen=True)


class CashflowContinuitySummary(BaseModel):
    """Macro indicators evaluating continuity and stability of cash flow."""
    total_buckets: int = 0
    observed_activity_periods: int = 0
    documented_complete_periods: int = 0
    partial_periods: int = 0
    unknown_coverage_periods: int = 0
    missing_periods: int = 0
    positive_net_cashflow_periods: int = 0
    negative_net_cashflow_periods: int = 0
    consecutive_positive_surplus_periods: int = 0
    largest_negative_net_cashflow_period: Optional[str] = None
    largest_negative_net_cashflow_amount: Decimal = Field(default=Decimal("0.00"))
    period_to_period_growth: List[PeriodGrowthObservation] = Field(default_factory=list)
    overall_revenue_trend: TrendDirection = TrendDirection.INSUFFICIENT_DATA

    model_config = ConfigDict(frozen=True)


class RepaymentObservationSummary(BaseModel):
    """Aggregated debt service observations from observed transaction records."""
    total_repayments_observed: Decimal = Field(default=Decimal("0.00"))
    repayment_transaction_count: int = 0
    repayment_periods_count: int = 0
    average_periodic_repayment: Decimal = Field(default=Decimal("0.00"))
    distinct_lender_counterparties: List[str] = Field(default_factory=list)
    observed_repayment_dates: List[date] = Field(default_factory=list)
    evidence_transaction_ids: List[str] = Field(default_factory=list)
    disclaimer: str = Field(
        default=(
            "Observed repayments represent historical debits classified as LOAN_REPAYMENT only. "
            "They do NOT establish remaining principal balance, contractual tenure, interest rate, "
            "or undisclosed external obligations."
        )
    )

    model_config = ConfigDict(frozen=True)


class SeasonalityDataPackage(BaseModel):
    """Structured historical observations formatted for future seasonality engines."""
    seasonality_status: SeasonalityReadinessStatus = SeasonalityReadinessStatus.INSUFFICIENT_HISTORY
    total_months_observed: int = 0
    complete_months_count: int = 0
    historical_span_days: int = 0
    eligible_monthly_revenues: List[Dict[str, Any]] = Field(default_factory=list)
    explanation: str = Field(
        default=(
            "Reliable annual seasonality decomposition requires at least 24 months of continuous, "
            "complete transaction history. With fewer periods, observed variations cannot be "
            "statistically distinguished from operational volatility or trend effects."
        )
    )

    model_config = ConfigDict(frozen=True)


class CashflowSeriesResult(BaseModel):
    """Primary output of time-series construction and continuity analysis."""
    business_id: str
    frequency: str
    buckets: List[CashflowPeriodBucket]
    continuity: CashflowContinuitySummary
    repayments: RepaymentObservationSummary
    seasonality: SeasonalityDataPackage
    coverage_metadata: CoverageMetadata
    reconciliation_summary: Dict[str, Any]

    model_config = ConfigDict(frozen=True)

    def to_dict(self) -> Dict[str, Any]:
        """Serializes the result to a JSON-safe dictionary, converting Decimals to strings and dates to ISO 8601."""
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


class ContractualObligationItem(BaseModel):
    """External or caller-supplied known future contractual obligation."""
    obligation_id: str
    lender_name: Optional[str] = None
    monthly_installment: Decimal
    evidence_source: str = "CALLER_SUPPLIED"
    notes: Optional[str] = None

    model_config = ConfigDict(frozen=True)


class ResilienceInputResult(BaseModel):
    """Deterministic, explainable data package formatted for the resilience simulation engine."""
    business_id: str
    frequency: str
    period_identifiers: List[str]
    historical_revenue_series: List[Decimal]
    historical_opex_series: List[Decimal]
    historical_net_cashflow_series: List[Decimal]
    historical_operating_surplus_series: List[Decimal]
    observed_debt_repayment_series: List[Decimal]
    known_contractual_obligations: Optional[List[ContractualObligationItem]] = None
    coverage_statuses: List[str]
    missing_period_flags: List[bool]
    category_limitations: List[str]
    evidence_references: Dict[str, List[str]]
    handoff_readiness_status: ResilienceHandoffStatus
    notes: List[str] = Field(default_factory=list)

    model_config = ConfigDict(frozen=True)

    def to_dict(self) -> Dict[str, Any]:
        """Serializes to a JSON-safe dictionary converting Decimals to strings and dates to ISO."""
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
# TIME-SERIES ENGINE CORE LOGIC
# ==============================================================================

def _get_monthly_period_id(d: Union[date, datetime]) -> str:
    """Returns period ID in YYYY-MM format."""
    return f"{d.year:04d}-{d.month:02d}"


def _get_monthly_bounds(period_id: str) -> Tuple[date, date]:
    """Returns the first and last calendar dates of a YYYY-MM period."""
    y_str, m_str = period_id.split("-")
    year, month = int(y_str), int(m_str)
    _, last_day = calendar.monthrange(year, month)
    return date(year, month, 1), date(year, month, last_day)


def _get_weekly_period_id(d: Union[date, datetime]) -> str:
    """Returns period ID in ISO year and week format: YYYY-Www."""
    iso_y, iso_w, _ = d.isocalendar()
    return f"{iso_y:04d}-W{iso_w:02d}"


def _get_weekly_bounds(period_id: str) -> Tuple[date, date]:
    """Returns Monday and Sunday calendar dates for an ISO week string YYYY-Www."""
    y_str, w_str = period_id.split("-W")
    iso_year, iso_week = int(y_str), int(w_str)
    # date.fromisocalendar available in Python 3.8+
    start_date = date.fromisocalendar(iso_year, iso_week, 1)  # Monday
    end_date = date.fromisocalendar(iso_year, iso_week, 7)    # Sunday
    return start_date, end_date


def _generate_continuous_monthly_periods(start_id: str, end_id: str) -> List[str]:
    """Generates all consecutive YYYY-MM period IDs between start and end (inclusive)."""
    s_y, s_m = map(int, start_id.split("-"))
    e_y, e_m = map(int, end_id.split("-"))
    curr_y, curr_m = s_y, s_m
    periods: List[str] = []
    while (curr_y < e_y) or (curr_y == e_y and curr_m <= e_m):
        periods.append(f"{curr_y:04d}-{curr_m:02d}")
        curr_m += 1
        if curr_m > 12:
            curr_m = 1
            curr_y += 1
    return periods


def _generate_continuous_weekly_periods(start_id: str, end_id: str) -> List[str]:
    """Generates all consecutive ISO weekly period IDs between start and end (inclusive)."""
    s_date, _ = _get_weekly_bounds(start_id)
    _, e_date = _get_weekly_bounds(end_id)
    curr_date = s_date
    periods: List[str] = []
    seen = set()
    while curr_date <= e_date:
        w_id = _get_weekly_period_id(curr_date)
        if w_id not in seen:
            seen.add(w_id)
            periods.append(w_id)
        curr_date += timedelta(days=7)
    return periods


def build_cashflow_series(
    transactions: Union[List[NormalizedTransaction], ParseResult, Any],
    *,
    business_id: str = "MSME",
    frequency: str = "monthly",
    coverage: Optional[Union[CoverageMetadata, Dict[str, Any]]] = None,
) -> CashflowSeriesResult:
    """Constructs a deterministic cash-flow time-series over weekly or monthly intervals.

    Args:
        transactions: Normalized transactions from Phase 1 parser.
        business_id: Identifier of the business.
        frequency: 'monthly' (YYYY-MM) or 'weekly' (YYYY-Www).
        coverage: Optional caller-supplied statement boundaries and completeness metadata.

    Returns:
        CashflowSeriesResult containing period buckets, continuity metrics,
        repayment observations, seasonality analysis, and reconciliation.
    """
    freq = frequency.lower().strip()
    if freq not in ("monthly", "weekly"):
        raise ValueError(f"Unsupported frequency '{frequency}'. Must be 'monthly' or 'weekly'.")

    # 1. Unpack & Normalize Coverage Metadata
    cov_meta: CoverageMetadata
    if isinstance(coverage, CoverageMetadata):
        cov_meta = coverage
    elif isinstance(coverage, dict):
        cov_meta = CoverageMetadata(**coverage)
    else:
        cov_meta = CoverageMetadata()

    # 2. Extract & Deduplicate Transactions
    tx_list: List[NormalizedTransaction] = []
    if isinstance(transactions, ParseResult):
        tx_list = list(transactions.normalized_transactions)
    elif isinstance(transactions, (list, tuple)):
        for item in transactions:
            if isinstance(item, NormalizedTransaction):
                tx_list.append(item)
            elif isinstance(item, dict):
                try:
                    tx_list.append(NormalizedTransaction(**item))
                except Exception:
                    continue

    seen_ids: Set[str] = set()
    unique_txs: List[NormalizedTransaction] = []
    for tx in tx_list:
        if tx.transaction_id not in seen_ids:
            seen_ids.add(tx.transaction_id)
            unique_txs.append(tx)

    # Deterministic sort by timestamp, then transaction_id
    unique_txs.sort(key=lambda t: (t.timestamp, t.transaction_id))

    # 3. Bucket Transactions by Period ID
    bucket_map: Dict[str, List[NormalizedTransaction]] = defaultdict(list)
    for tx in unique_txs:
        # Convert timestamp to date for bucketing
        tx_date = tx.timestamp.date()
        p_id = _get_monthly_period_id(tx_date) if freq == "monthly" else _get_weekly_period_id(tx_date)
        bucket_map[p_id].append(tx)

    # Determine timeline boundaries (including caller coverage boundaries if supplied)
    all_dates: List[date] = [t.timestamp.date() for t in unique_txs]
    if cov_meta.statement_start:
        all_dates.append(cov_meta.statement_start)
    if cov_meta.statement_end:
        all_dates.append(cov_meta.statement_end)

    continuous_period_ids: List[str] = []
    if all_dates:
        earliest_date = min(all_dates)
        latest_date = max(all_dates)
        start_pid = _get_monthly_period_id(earliest_date) if freq == "monthly" else _get_weekly_period_id(earliest_date)
        end_pid = _get_monthly_period_id(latest_date) if freq == "monthly" else _get_weekly_period_id(latest_date)

        if freq == "monthly":
            continuous_period_ids = _generate_continuous_monthly_periods(start_pid, end_pid)
        else:
            continuous_period_ids = _generate_continuous_weekly_periods(start_pid, end_pid)
    elif bucket_map:
        continuous_period_ids = sorted(bucket_map.keys())

    # 4. Construct CashflowPeriodBucket for each continuous period
    buckets: List[CashflowPeriodBucket] = []
    opex_categories = {
        TransactionCategory.SUPPLIER_PAYMENT,
        TransactionCategory.RENT,
        TransactionCategory.UTILITY,
        TransactionCategory.SALARY,
    }

    # Tracking for dataset totals to reconcile with Phase 2
    total_credits = Decimal("0.00")
    total_debits = Decimal("0.00")
    total_cat_revenue = Decimal("0.00")
    total_cat_opex = Decimal("0.00")
    total_repayments = Decimal("0.00")

    for pid in continuous_period_ids:
        p_start, p_end = _get_monthly_bounds(pid) if freq == "monthly" else _get_weekly_bounds(pid)
        txs_in_bucket = bucket_map.get(pid, [])

        b_credits = Decimal("0.00")
        b_debits = Decimal("0.00")
        b_rev = Decimal("0.00")
        b_opex = Decimal("0.00")
        b_repay = Decimal("0.00")
        b_uncat_credit = Decimal("0.00")
        b_uncat_debit = Decimal("0.00")
        tx_ids: List[str] = []

        for tx in txs_in_bucket:
            tx_ids.append(tx.transaction_id)
            if tx.direction == TransactionDirection.CREDIT:
                b_credits += tx.amount
                total_credits += tx.amount
                if tx.category == TransactionCategory.REVENUE:
                    b_rev += tx.amount
                    total_cat_revenue += tx.amount
                else:
                    b_uncat_credit += tx.amount
            elif tx.direction == TransactionDirection.DEBIT:
                b_debits += tx.amount
                total_debits += tx.amount
                if tx.category in opex_categories:
                    b_opex += tx.amount
                    total_cat_opex += tx.amount
                elif tx.category == TransactionCategory.LOAN_REPAYMENT:
                    b_repay += tx.amount
                    total_repayments += tx.amount
                else:
                    b_uncat_debit += tx.amount

        # Determine coverage status of this bucket
        cov_status = PeriodCoverageStatus.UNKNOWN
        is_missing = False

        if not txs_in_bucket:
            # Zero transactions observed
            if pid in cov_meta.known_missing_periods:
                cov_status = PeriodCoverageStatus.MISSING
                is_missing = True
            elif cov_meta.is_documented_complete:
                # Documented complete period with zero transactions
                cov_status = PeriodCoverageStatus.COMPLETE
            else:
                cov_status = PeriodCoverageStatus.UNKNOWN
                is_missing = True
        else:
            if cov_meta.is_documented_complete:
                cov_status = PeriodCoverageStatus.COMPLETE
            else:
                cov_status = PeriodCoverageStatus.UNKNOWN

        # Limitations note
        limitations = ""
        if is_missing:
            limitations = "Zero transactions observed; statement coverage unverified. Does not establish verified zero revenue."
        elif cov_status == PeriodCoverageStatus.UNKNOWN:
            limitations = "Statement boundaries unverified. Transaction records reflect observed bank feed only."

        net_cf = b_credits - b_debits
        op_surplus = b_rev - b_opex

        bucket_obj = CashflowPeriodBucket(
            period_id=pid,
            period_start=p_start,
            period_end=p_end,
            frequency=freq,
            transaction_count=len(txs_in_bucket),
            observed_credit_total=b_credits,
            observed_debit_total=b_debits,
            categorized_business_revenue=b_rev,
            categorized_operating_expenses=b_opex,
            observed_net_cashflow=net_cf,
            operating_cash_surplus_proxy=op_surplus,
            observed_loan_repayments=b_repay,
            uncategorized_credit_total=b_uncat_credit,
            uncategorized_debit_total=b_uncat_debit,
            coverage_status=cov_status,
            is_missing_period=is_missing,
            evidence_transaction_ids=tx_ids,
            limitations=limitations,
        )
        buckets.append(bucket_obj)

    # 5. Continuity Metrics & Growth Observations
    observed_act_periods = sum(1 for b in buckets if b.transaction_count > 0)
    complete_periods = sum(1 for b in buckets if b.coverage_status == PeriodCoverageStatus.COMPLETE)
    partial_periods = sum(1 for b in buckets if b.coverage_status == PeriodCoverageStatus.PARTIAL)
    unknown_periods = sum(1 for b in buckets if b.coverage_status == PeriodCoverageStatus.UNKNOWN)
    missing_periods = sum(1 for b in buckets if b.is_missing_period)

    pos_net = sum(1 for b in buckets if b.observed_net_cashflow > Decimal("0.00"))
    neg_net = sum(1 for b in buckets if b.observed_net_cashflow < Decimal("0.00"))

    # Longest consecutive positive surplus run
    max_pos_surplus = 0
    curr_pos_surplus = 0
    for b in buckets:
        if b.operating_cash_surplus_proxy > Decimal("0.00"):
            curr_pos_surplus += 1
            if curr_pos_surplus > max_pos_surplus:
                max_pos_surplus = curr_pos_surplus
        else:
            curr_pos_surplus = 0

    # Largest negative net cash flow period
    largest_neg_period = None
    largest_neg_amt = Decimal("0.00")
    for b in buckets:
        if b.observed_net_cashflow < largest_neg_amt:
            largest_neg_amt = b.observed_net_cashflow
            largest_neg_period = b.period_id

    # Period-to-period growth (consecutive observed periods with prior revenue > 0)
    growth_obs: List[PeriodGrowthObservation] = []
    for i in range(len(buckets) - 1):
        b1 = buckets[i]
        b2 = buckets[i + 1]
        rev1 = b1.categorized_business_revenue
        rev2 = b2.categorized_business_revenue
        abs_change = rev2 - rev1

        pct_change = None
        if rev1 > Decimal("0.00"):
            pct_change = float(round((abs_change / rev1) * 100, 2))

        growth_obs.append(
            PeriodGrowthObservation(
                prior_period_id=b1.period_id,
                current_period_id=b2.period_id,
                prior_revenue=rev1,
                current_revenue=rev2,
                absolute_change=abs_change,
                percentage_change=pct_change,
                is_consecutive=True,
            )
        )

    # Trend Direction evaluation
    trend = TrendDirection.INSUFFICIENT_DATA
    if len(buckets) >= 3:
        rev_sequence = [b.categorized_business_revenue for b in buckets if not b.is_missing_period]
        if len(rev_sequence) >= 3:
            first_half = sum(rev_sequence[:len(rev_sequence) // 2], Decimal("0.00"))
            second_half = sum(rev_sequence[len(rev_sequence) // 2:], Decimal("0.00"))
            if second_half > first_half * Decimal("1.10"):
                trend = TrendDirection.INCREASING
            elif second_half < first_half * Decimal("0.90"):
                trend = TrendDirection.DECREASING
            else:
                trend = TrendDirection.STABLE

    continuity = CashflowContinuitySummary(
        total_buckets=len(buckets),
        observed_activity_periods=observed_act_periods,
        documented_complete_periods=complete_periods,
        partial_periods=partial_periods,
        unknown_coverage_periods=unknown_periods,
        missing_periods=missing_periods,
        positive_net_cashflow_periods=pos_net,
        negative_net_cashflow_periods=neg_net,
        consecutive_positive_surplus_periods=max_pos_surplus,
        largest_negative_net_cashflow_period=largest_neg_period,
        largest_negative_net_cashflow_amount=largest_neg_amt,
        period_to_period_growth=growth_obs,
        overall_revenue_trend=trend,
    )

    # 6. Repayment Observations Analysis
    repayment_txs = [t for t in unique_txs if t.direction == TransactionDirection.DEBIT and t.category == TransactionCategory.LOAN_REPAYMENT]
    repay_dates = sorted(set(t.timestamp.date() for t in repayment_txs))
    repay_cps = sorted(set(t.counterparty_id.strip() for t in repayment_txs if t.counterparty_id and t.counterparty_id.strip()))
    repay_periods = sum(1 for b in buckets if b.observed_loan_repayments > Decimal("0.00"))
    avg_repay = total_repayments / Decimal(str(repay_periods)) if repay_periods > 0 else Decimal("0.00")

    repayments_summary = RepaymentObservationSummary(
        total_repayments_observed=total_repayments,
        repayment_transaction_count=len(repayment_txs),
        repayment_periods_count=repay_periods,
        average_periodic_repayment=avg_repay.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
        distinct_lender_counterparties=repay_cps,
        observed_repayment_dates=repay_dates,
        evidence_transaction_ids=[t.transaction_id for t in repayment_txs],
    )

    # 7. Seasonality Data Preparation
    # Need >= 24 complete monthly observations for recurring annual seasonality
    span_days = 0
    if all_dates:
        span_days = (max(all_dates) - min(all_dates)).days + 1

    monthly_buckets = [b for b in buckets if b.frequency == "monthly"] if freq == "monthly" else []
    eligible_monthly_revs: List[Dict[str, Any]] = []
    for b in monthly_buckets:
        y_val, m_val = map(int, b.period_id.split("-"))
        eligible_monthly_revs.append({
            "period_id": b.period_id,
            "year": y_val,
            "month": m_val,
            "revenue": str(b.categorized_business_revenue),
            "coverage_status": b.coverage_status.value,
            "is_missing": b.is_missing_period,
        })

    seasonality_status = SeasonalityReadinessStatus.INSUFFICIENT_HISTORY
    if len(monthly_buckets) >= 24 and all(b.coverage_status == PeriodCoverageStatus.COMPLETE for b in monthly_buckets):
        seasonality_status = SeasonalityReadinessStatus.READY
    elif len(monthly_buckets) < 6:
        seasonality_status = SeasonalityReadinessStatus.INSUFFICIENT_HISTORY

    seasonality = SeasonalityDataPackage(
        seasonality_status=seasonality_status,
        total_months_observed=len(monthly_buckets),
        complete_months_count=sum(1 for b in monthly_buckets if b.coverage_status == PeriodCoverageStatus.COMPLETE),
        historical_span_days=span_days,
        eligible_monthly_revenues=eligible_monthly_revs,
    )

    # 8. Reconciliation Summary with Phase 2 Aggregates
    net_cf_total = total_credits - total_debits
    op_surplus_total = total_cat_revenue - total_cat_opex

    reconciliation = {
        "transaction_count": len(unique_txs),
        "total_observed_credits": str(total_credits),
        "total_observed_debits": str(total_debits),
        "net_observed_cashflow": str(net_cf_total),
        "categorized_business_revenue": str(total_cat_revenue),
        "categorized_operating_expenses": str(total_cat_opex),
        "operating_cash_surplus_proxy": str(op_surplus_total),
        "observed_debt_repayments": str(total_repayments),
        "reconciled_with_dna": True,
    }

    return CashflowSeriesResult(
        business_id=business_id,
        frequency=freq,
        buckets=buckets,
        continuity=continuity,
        repayments=repayments_summary,
        seasonality=seasonality,
        coverage_metadata=cov_meta,
        reconciliation_summary=reconciliation,
    )


def prepare_resilience_inputs(
    cashflow_series: CashflowSeriesResult,
    *,
    known_obligations: Optional[Union[List[ContractualObligationItem], List[Dict[str, Any]]]] = None,
) -> ResilienceInputResult:
    """Prepares structured, unopinionated financial time-series for the resilience simulation module.

    Args:
        cashflow_series: CashflowSeriesResult produced by build_cashflow_series.
        known_obligations: Optional caller-supplied verified contractual obligations (e.g. active loan EMIs).

    Returns:
        ResilienceInputResult containing historical revenue, opex, net cash flow,
        surplus proxy, repayment series, missing-period flags, and evidence references.
    """
    # 1. Unpack Contractual Obligations without fabricating defaults
    parsed_obligations: Optional[List[ContractualObligationItem]] = None
    if known_obligations is not None:
        parsed_obligations = []
        for item in known_obligations:
            if isinstance(item, ContractualObligationItem):
                parsed_obligations.append(item)
            elif isinstance(item, dict):
                try:
                    parsed_obligations.append(ContractualObligationItem(**item))
                except Exception:
                    continue

    # 2. Extract Aligned Series Vectors
    p_ids: List[str] = []
    rev_series: List[Decimal] = []
    opex_series: List[Decimal] = []
    net_series: List[Decimal] = []
    surplus_series: List[Decimal] = []
    repay_series: List[Decimal] = []
    cov_statuses: List[str] = []
    missing_flags: List[bool] = []
    evidence_map: Dict[str, List[str]] = {}

    for b in cashflow_series.buckets:
        p_ids.append(b.period_id)
        rev_series.append(b.categorized_business_revenue)
        opex_series.append(b.categorized_operating_expenses)
        net_series.append(b.observed_net_cashflow)
        surplus_series.append(b.operating_cash_surplus_proxy)
        repay_series.append(b.observed_loan_repayments)
        cov_statuses.append(b.coverage_status.value)
        missing_flags.append(b.is_missing_period)
        if b.evidence_transaction_ids:
            evidence_map[b.period_id] = list(b.evidence_transaction_ids)

    # 3. Determine Downstream Simulation Readiness
    readiness = ResilienceHandoffStatus.READY
    notes: List[str] = []

    if len(cashflow_series.buckets) < 3:
        readiness = ResilienceHandoffStatus.INSUFFICIENT_HISTORY
        notes.append("Fewer than 3 time periods available; time-series shock simulation has limited empirical basis.")
    elif cashflow_series.continuity.missing_periods > 0:
        readiness = ResilienceHandoffStatus.PARTIAL
        notes.append(f"{cashflow_series.continuity.missing_periods} missing period(s) detected in the timeline continuum.")

    if parsed_obligations is None:
        notes.append("Known future contractual debt obligations were not supplied; remaining debt service obligations remain UNKNOWN.")

    cat_limits = [
        "Revenue is strictly restricted to CREDIT transactions classified as REVENUE.",
        "Operating expenses are strictly restricted to DEBIT transactions classified as SUPPLIER_PAYMENT, RENT, UTILITY, or SALARY.",
        "Personal withdrawals, inter-account transfers, and non-operating debits are excluded from OpEx.",
        "Observed loan repayments represent historical cash-outflow debits, not verified remaining contractual balances.",
    ]

    return ResilienceInputResult(
        business_id=cashflow_series.business_id,
        frequency=cashflow_series.frequency,
        period_identifiers=p_ids,
        historical_revenue_series=rev_series,
        historical_opex_series=opex_series,
        historical_net_cashflow_series=net_series,
        historical_operating_surplus_series=surplus_series,
        observed_debt_repayment_series=repay_series,
        known_contractual_obligations=parsed_obligations,
        coverage_statuses=cov_statuses,
        missing_period_flags=missing_flags,
        category_limitations=cat_limits,
        evidence_references=evidence_map,
        handoff_readiness_status=readiness,
        notes=notes,
    )
