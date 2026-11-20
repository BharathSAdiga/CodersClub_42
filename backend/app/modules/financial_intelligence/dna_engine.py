"""UDYOGA — Financial Intelligence Engine: Business Financial DNA & Analytics.

Computes deterministic, evidence-backed financial behavior patterns,
revenue intelligence, operating expense metrics, customer/supplier concentration,
and cash-flow sustainability indicators for credit-invisible Indian MSMEs.
"""

from __future__ import annotations

import math
from collections import defaultdict
from datetime import date, datetime
from decimal import Decimal, ROUND_HALF_UP
from typing import Any, Dict, Iterable, List, Optional, Sequence, Set, Tuple, Union

from pydantic import BaseModel, ConfigDict, Field

from app.modules.financial_intelligence.parser import (
    NormalizedTransaction,
    ParseResult,
    TransactionCategory,
    TransactionChannel,
    TransactionDirection,
)

# Supported operating expense categories (strictly excludes PERSONAL, LOAN_REPAYMENT, OTHER)
OPERATING_EXPENSE_CATEGORIES: Set[TransactionCategory] = {
    TransactionCategory.SUPPLIER_PAYMENT,
    TransactionCategory.RENT,
    TransactionCategory.UTILITY,
    TransactionCategory.SALARY,
}


def _to_decimal(val: Any) -> Decimal:
    """Safe converter to 2-decimal-place Decimal."""
    if isinstance(val, Decimal):
        return val.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return Decimal(str(val)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _safe_float(val: Optional[float]) -> Optional[float]:
    """Ensures no NaN or Infinity slips into metrics."""
    if val is None or math.isnan(val) or math.isinf(val):
        return None
    return round(val, 4)


class MetricItem(BaseModel):
    """Atomic metric item detailing value, unit, human explanation, and evidence scope."""

    model_config = ConfigDict(frozen=True)

    name: str = Field(..., description="Canonical metric identifier")
    value: Optional[Union[str, float, int, Dict[str, Any], List[Any]]] = Field(
        default=None, description="Computed metric value or None if unavailable"
    )
    unit: str = Field(..., description="Measurement unit (e.g., INR, RATIO, PERCENT, COUNT, MONTHS)")
    explanation: str = Field(..., description="Plain-language interpretation for borrowers and lenders")
    methodology: str = Field(..., description="Exact mathematical formula or calculation logic")
    evidence_basis: str = Field(..., description="Transaction subset or data scope supporting calculation")
    limitations: Optional[str] = Field(default=None, description="Data constraints or potential blindspots")


class CashFlowActivitySection(BaseModel):
    """Section A: Observed cash inflows, outflows, and gross activity."""

    model_config = ConfigDict(frozen=True)

    total_credits: Decimal = Decimal("0.00")
    total_debits: Decimal = Decimal("0.00")
    net_observed_cashflow: Decimal = Decimal("0.00")
    transaction_count: int = 0
    credit_transaction_count: int = 0
    debit_transaction_count: int = 0
    median_transaction_amount: Optional[Decimal] = None
    inflow_to_outflow_ratio: Optional[Decimal] = None
    metrics: Dict[str, MetricItem] = Field(default_factory=dict)


class RevenueIntelligenceSection(BaseModel):
    """Section B: Verified business revenue, trends, and seasonal run-rates."""

    model_config = ConfigDict(frozen=True)

    observed_business_revenue: Decimal = Decimal("0.00")
    revenue_transaction_count: int = 0
    non_revenue_credit_total: Decimal = Decimal("0.00")
    non_revenue_credit_count: int = 0
    monthly_categorized_revenue: Dict[str, Decimal] = Field(default_factory=dict)
    weekly_categorized_revenue: Dict[str, Decimal] = Field(default_factory=dict)
    mom_revenue_growth: Dict[str, Optional[float]] = Field(default_factory=dict)
    avg_monthly_revenue: Optional[Decimal] = None
    median_monthly_revenue: Optional[Decimal] = None
    highest_monthly_revenue: Optional[Tuple[str, Decimal]] = None
    lowest_monthly_revenue: Optional[Tuple[str, Decimal]] = None
    revenue_trend_direction: str = "INSUFFICIENT_DATA"
    metrics: Dict[str, MetricItem] = Field(default_factory=dict)


class OperatingExpenseSection(BaseModel):
    """Section C: Operational expenditures, category distribution, and operating surplus."""

    model_config = ConfigDict(frozen=True)

    observed_operating_expenses: Decimal = Decimal("0.00")
    operating_expense_transaction_count: int = 0
    monthly_operating_expenses: Dict[str, Decimal] = Field(default_factory=dict)
    weekly_operating_expenses: Dict[str, Decimal] = Field(default_factory=dict)
    operating_cash_surplus_proxy: Decimal = Decimal("0.00")
    expense_to_revenue_ratio: Optional[Decimal] = None
    expense_category_distribution: Dict[str, Decimal] = Field(default_factory=dict)
    recurring_expense_total: Decimal = Decimal("0.00")
    recurring_expense_count: int = 0
    metrics: Dict[str, MetricItem] = Field(default_factory=dict)


class FinancialStabilitySection(BaseModel):
    """Section D: Cash-flow volatility, surplus trends, and activity consistency."""

    model_config = ConfigDict(frozen=True)

    monthly_revenue_cv: Optional[float] = None
    weekly_revenue_cv: Optional[float] = None
    positive_cashflow_months_count: int = 0
    negative_cashflow_months_count: int = 0
    revenue_activity_consistency: Optional[float] = None
    surplus_trend_direction: str = "INSUFFICIENT_DATA"
    stability_band: str = "INSUFFICIENT_EVIDENCE"
    metrics: Dict[str, MetricItem] = Field(default_factory=dict)


class CustomerIntelligenceSection(BaseModel):
    """Section E: Revenue counterparties, concentration index, and repeat buyer shares."""

    model_config = ConfigDict(frozen=True)

    identifiable_customers_count: int = 0
    identifiable_revenue_total: Decimal = Decimal("0.00")
    unidentified_revenue_total: Decimal = Decimal("0.00")
    identifiable_revenue_ratio: float = 0.0
    revenue_by_customer: Dict[str, Decimal] = Field(default_factory=dict)
    top_customer_share: Optional[float] = None
    top_three_customers_share: Optional[float] = None
    customer_hhi: Optional[float] = None
    repeat_customers_count: int = 0
    repeat_customers_revenue_total: Decimal = Decimal("0.00")
    repeat_customers_revenue_share: Optional[float] = None
    metrics: Dict[str, MetricItem] = Field(default_factory=dict)


class SupplierIntelligenceSection(BaseModel):
    """Section F: Supplier payments, vendor concentration, and recurring relationships."""

    model_config = ConfigDict(frozen=True)

    identifiable_suppliers_count: int = 0
    identifiable_supplier_payments_total: Decimal = Decimal("0.00")
    unidentified_supplier_payments_total: Decimal = Decimal("0.00")
    identifiable_supplier_payments_ratio: float = 0.0
    payments_by_supplier: Dict[str, Decimal] = Field(default_factory=dict)
    top_supplier_share: Optional[float] = None
    top_three_suppliers_share: Optional[float] = None
    supplier_hhi: Optional[float] = None
    repeat_suppliers_count: int = 0
    repeat_suppliers_payment_share: Optional[float] = None
    monthly_supplier_payments: Dict[str, Decimal] = Field(default_factory=dict)
    metrics: Dict[str, MetricItem] = Field(default_factory=dict)


class DebtRepaymentSection(BaseModel):
    """Section G: Observed loan repayments and service frequency."""

    model_config = ConfigDict(frozen=True)

    observed_debt_repayments_total: Decimal = Decimal("0.00")
    debt_repayment_transaction_count: int = 0
    monthly_debt_repayments: Dict[str, Decimal] = Field(default_factory=dict)
    observed_repayment_frequency: str = "INSUFFICIENT_DATA"
    metrics: Dict[str, MetricItem] = Field(default_factory=dict)


class DataCoverageSection(BaseModel):
    """Section H: Data completeness, statement observation dates, and known caveats."""

    model_config = ConfigDict(frozen=True)

    total_transactions: int = 0
    earliest_transaction_date: Optional[date] = None
    latest_transaction_date: Optional[date] = None
    observation_window_days: int = 0
    distinct_calendar_months_count: int = 0
    coverage_status: str = "UNKNOWN"
    rejected_rows_count: int = 0
    duplicate_rows_count: int = 0
    data_limitations: List[str] = Field(default_factory=list)
    unavailable_metrics: List[str] = Field(default_factory=list)
    metrics: Dict[str, MetricItem] = Field(default_factory=dict)


class DimensionSummary(BaseModel):
    """Explainable dimension evaluation with evidence sufficiency status."""

    model_config = ConfigDict(frozen=True)

    dimension_name: str
    status: str = Field(..., description="POSITIVE, MODERATE, CONSTRAINED, or INSUFFICIENT_DATA")
    score_proxy: Optional[float] = Field(default=None, description="Transparent 0-100 prototype index")
    key_observations: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    evidence_sufficiency: str = Field(..., description="HIGH, MEDIUM, LOW, or INSUFFICIENT")


class FinancialDnaReport(BaseModel):
    """Master Financial DNA Result encapsulating all 8 analytics sections and dimensions."""

    model_config = ConfigDict(frozen=True)

    business_id: Optional[str] = None
    generated_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    cash_flow_activity: CashFlowActivitySection
    revenue_intelligence: RevenueIntelligenceSection
    operating_expenses: OperatingExpenseSection
    financial_stability: FinancialStabilitySection
    customer_intelligence: CustomerIntelligenceSection
    supplier_intelligence: SupplierIntelligenceSection
    debt_repayments: DebtRepaymentSection
    data_coverage: DataCoverageSection
    dimensions: Dict[str, DimensionSummary] = Field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Custom clean dictionary representation with string Decimals and zero NaN/Infinity."""
        def _serialize(obj: Any) -> Any:
            if isinstance(obj, Decimal):
                return str(obj)
            if isinstance(obj, (date, datetime)):
                return obj.isoformat()
            if isinstance(obj, float):
                if math.isnan(obj) or math.isinf(obj):
                    return None
                return round(obj, 4)
            if isinstance(obj, dict):
                return {k: _serialize(v) for k, v in obj.items()}
            if isinstance(obj, list):
                return [_serialize(item) for item in obj]
            if isinstance(obj, tuple):
                return [_serialize(item) for item in obj]
            if isinstance(obj, BaseModel):
                return _serialize(obj.model_dump())
            return obj

        return _serialize(self)


def _extract_transaction_list(transactions: Any) -> Tuple[List[NormalizedTransaction], int, int]:
    """Adapts input cleanly from ParseResult, list of NormalizedTransactions, or dicts."""
    rejected_rows = 0
    duplicate_rows = 0

    if isinstance(transactions, ParseResult):
        return transactions.normalized_transactions, transactions.invalid_rows, transactions.duplicate_rows

    if hasattr(transactions, "normalized_transactions"):
        txns = getattr(transactions, "normalized_transactions")
        rej = getattr(transactions, "invalid_rows", 0)
        dup = getattr(transactions, "duplicate_rows", 0)
        return list(txns), rej, dup

    if isinstance(transactions, Iterable):
        txn_list: List[NormalizedTransaction] = []
        for item in transactions:
            if isinstance(item, NormalizedTransaction):
                txn_list.append(item)
            elif isinstance(item, dict):
                try:
                    txn_list.append(NormalizedTransaction(**item))
                except Exception:
                    rejected_rows += 1
            else:
                try:
                    # Duck typing for objects with matching attributes
                    txn_list.append(
                        NormalizedTransaction(
                            transaction_id=str(getattr(item, "transaction_id")),
                            timestamp=getattr(item, "timestamp"),
                            amount=_to_decimal(getattr(item, "amount")),
                            direction=getattr(item, "direction"),
                            channel=getattr(item, "channel", TransactionChannel.OTHER),
                            category=getattr(item, "category", TransactionCategory.OTHER),
                            counterparty_id=getattr(item, "counterparty_id", None),
                            counterparty_name=getattr(item, "counterparty_name", None),
                            reference_note=getattr(item, "reference_note", None),
                            recurring=getattr(item, "recurring", False),
                        )
                    )
                except Exception:
                    rejected_rows += 1
        return txn_list, rejected_rows, duplicate_rows

    return [], 0, 0


def _compute_median(values: Sequence[Decimal]) -> Optional[Decimal]:
    """Computes median of Decimal sequence without floating point precision loss."""
    if not values:
        return None
    sorted_vals = sorted(values)
    n = len(sorted_vals)
    mid = n // 2
    if n % 2 == 1:
        return sorted_vals[mid]
    return ((sorted_vals[mid - 1] + sorted_vals[mid]) / Decimal("2")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _compute_mom_growth(monthly_map: Dict[str, Decimal]) -> Dict[str, Optional[float]]:
    """Calculates Month-over-Month growth percentage strictly across consecutive calendar months."""
    growth_dict: Dict[str, Optional[float]] = {}
    sorted_months = sorted(monthly_map.keys())

    for i in range(1, len(sorted_months)):
        curr_m = sorted_months[i]
        prev_m = sorted_months[i - 1]

        # Verify consecutive calendar months (e.g., 2026-03 followed by 2026-04)
        y_curr, m_curr = int(curr_m[:4]), int(curr_m[5:7])
        y_prev, m_prev = int(prev_m[:4]), int(prev_m[5:7])

        is_consecutive = (y_curr == y_prev and m_curr == m_prev + 1) or (y_curr == y_prev + 1 and m_prev == 12 and m_curr == 1)

        if not is_consecutive:
            growth_dict[curr_m] = None
            continue

        prev_val = monthly_map[prev_m]
        curr_val = monthly_map[curr_m]

        if prev_val <= Decimal("0.00"):
            growth_dict[curr_m] = None
        else:
            diff = curr_val - prev_val
            pct = float((diff / prev_val) * Decimal("100.0"))
            growth_dict[curr_m] = round(pct, 2)

    return growth_dict


def _get_iso_week_id(dt: Union[date, datetime]) -> str:
    """Returns period ID in ISO year and week format: YYYY-Www, handling Week 53 and year boundaries."""
    iso_y, iso_w, _ = dt.isocalendar()
    return f"{iso_y:04d}-W{iso_w:02d}"


def _compute_cv(values: Sequence[Decimal]) -> Optional[float]:
    """Computes Population Coefficient of Variation (CV = std_dev / mean)."""
    if len(values) < 3:
        return None
    float_vals = [float(v) for v in values]
    mean_val = sum(float_vals) / len(float_vals)
    if mean_val <= 0.0:
        return None
    variance = sum((x - mean_val) ** 2 for x in float_vals) / len(float_vals)
    std_dev = math.sqrt(variance)
    return round(std_dev / mean_val, 4)


def _compute_trend_direction(series_map: Dict[str, Decimal]) -> str:
    """Determines trend direction across chronologically sorted periods."""
    if len(series_map) < 3:
        return "INSUFFICIENT_DATA"

    sorted_keys = sorted(series_map.keys())
    values = [float(series_map[k]) for k in sorted_keys]
    n = len(values)

    # Simple linear slope estimation: Cov(x, y) / Var(x)
    x = list(range(n))
    x_mean = (n - 1) / 2.0
    y_mean = sum(values) / n

    if y_mean <= 0.0:
        return "STABLE"

    numerator = sum((x[i] - x_mean) * (values[i] - y_mean) for i in range(n))
    denominator = sum((x[i] - x_mean) ** 2 for i in range(n))

    if denominator == 0:
        return "STABLE"

    slope = numerator / denominator
    relative_slope = slope / y_mean  # Normalized slope per step

    if relative_slope > 0.05:
        return "INCREASING"
    elif relative_slope < -0.05:
        return "DECREASING"
    return "STABLE"


def compute_financial_dna(
    transactions: Any,
    *,
    business_id: Optional[str] = None,
    coverage: Optional[Dict[str, Any]] = None,
) -> FinancialDnaReport:
    """Computes comprehensive deterministic Business Financial DNA analytics.

    Args:
        transactions: ParseResult, list of NormalizedTransaction, or iterable of records.
        business_id: Optional business entity identifier.
        coverage: Optional metadata dict indicating known statement date bounds or coverage.

    Returns:
        FinancialDnaReport containing deterministic metrics across 8 sections + dimensions.
    """
    txn_list, rejected_count, duplicate_count = _extract_transaction_list(transactions)

    # ---------------------------------------------------------
    # SECTION A: CASH-FLOW ACTIVITY
    # ---------------------------------------------------------
    total_credits = Decimal("0.00")
    total_debits = Decimal("0.00")
    credit_txns: List[Decimal] = []
    debit_txns: List[Decimal] = []
    all_amounts: List[Decimal] = []

    for t in txn_list:
        all_amounts.append(t.amount)
        if t.direction == TransactionDirection.CREDIT:
            total_credits += t.amount
            credit_txns.append(t.amount)
        elif t.direction == TransactionDirection.DEBIT:
            total_debits += t.amount
            debit_txns.append(t.amount)

    total_credits = total_credits.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    total_debits = total_debits.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    net_observed_cashflow = (total_credits - total_debits).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    median_amount = _compute_median(all_amounts)
    inflow_outflow_ratio = (
        (total_credits / total_debits).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        if total_debits > Decimal("0.00")
        else None
    )

    activity_metrics: Dict[str, MetricItem] = {
        "total_observed_credits": MetricItem(
            name="Total Observed Credits",
            value=str(total_credits),
            unit="INR",
            explanation="Cumulative sum of all incoming funds into the observed accounts.",
            methodology="sum(amount for direction == CREDIT)",
            evidence_basis=f"{len(credit_txns)} observed credit transactions",
            limitations="Includes non-sales inflows such as proprietor funds, loans, and intra-account transfers.",
        ),
        "total_observed_debits": MetricItem(
            name="Total Observed Debits",
            value=str(total_debits),
            unit="INR",
            explanation="Cumulative sum of all outgoing funds from the observed accounts.",
            methodology="sum(amount for direction == DEBIT)",
            evidence_basis=f"{len(debit_txns)} observed debit transactions",
            limitations="Combines operating expenses with capital expenditures, personal drawings, and debt servicing.",
        ),
        "net_observed_cashflow": MetricItem(
            name="Net Observed Cash Flow",
            value=str(net_observed_cashflow),
            unit="INR",
            explanation="Net change in observed bank liquidity across the statement period.",
            methodology="total_credits - total_debits",
            evidence_basis=f"{len(txn_list)} total transactions",
            limitations="Net cash flow is not net profit. Excludes unobserved cash sales, depreciation, and accrued taxes.",
        ),
        "inflow_to_outflow_ratio": MetricItem(
            name="Inflow-to-Outflow Ratio",
            value=str(inflow_outflow_ratio) if inflow_outflow_ratio is not None else None,
            unit="RATIO",
            explanation="Ratio of incoming liquidity to outgoing expenditures. Values > 1.0 indicate net positive liquidity.",
            methodology="total_credits / total_debits (defined only when total_debits > 0)",
            evidence_basis="Observed credits and debits",
            limitations="Unavailable if zero debits are observed.",
        ),
    }

    cash_flow_activity = CashFlowActivitySection(
        total_credits=total_credits,
        total_debits=total_debits,
        net_observed_cashflow=net_observed_cashflow,
        transaction_count=len(txn_list),
        credit_transaction_count=len(credit_txns),
        debit_transaction_count=len(debit_txns),
        median_transaction_amount=median_amount,
        inflow_to_outflow_ratio=inflow_outflow_ratio,
        metrics=activity_metrics,
    )

    # ---------------------------------------------------------
    # SECTION B: REVENUE INTELLIGENCE
    # ---------------------------------------------------------
    observed_revenue = Decimal("0.00")
    revenue_txns_count = 0
    non_revenue_credit_total = Decimal("0.00")
    non_revenue_credit_count = 0

    monthly_rev_acc: Dict[str, Decimal] = defaultdict(lambda: Decimal("0.00"))
    weekly_rev_acc: Dict[str, Decimal] = defaultdict(lambda: Decimal("0.00"))

    for t in txn_list:
        if t.direction == TransactionDirection.CREDIT:
            if t.category == TransactionCategory.REVENUE:
                observed_revenue += t.amount
                revenue_txns_count += 1
                m_key = t.timestamp.strftime("%Y-%m")
                w_key = _get_iso_week_id(t.timestamp)
                monthly_rev_acc[m_key] += t.amount
                weekly_rev_acc[w_key] += t.amount
            else:
                non_revenue_credit_total += t.amount
                non_revenue_credit_count += 1

    observed_revenue = observed_revenue.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    non_revenue_credit_total = non_revenue_credit_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    monthly_revenue = {k: v.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP) for k, v in sorted(monthly_rev_acc.items())}
    weekly_revenue = {k: v.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP) for k, v in sorted(weekly_rev_acc.items())}

    mom_growth = _compute_mom_growth(monthly_revenue)

    # Revenue averages and extremes
    eligible_monthly_revs = list(monthly_revenue.values())
    avg_monthly_rev = (
        (sum(eligible_monthly_revs) / Decimal(str(len(eligible_monthly_revs)))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        if eligible_monthly_revs
        else None
    )
    median_monthly_rev = _compute_median(eligible_monthly_revs)

    highest_month: Optional[Tuple[str, Decimal]] = None
    lowest_month: Optional[Tuple[str, Decimal]] = None
    if monthly_revenue:
        sorted_by_val = sorted(monthly_revenue.items(), key=lambda kv: kv[1])
        lowest_month = sorted_by_val[0]
        highest_month = sorted_by_val[-1]

    revenue_trend_dir = _compute_trend_direction(monthly_revenue)

    revenue_metrics: Dict[str, MetricItem] = {
        "observed_business_revenue": MetricItem(
            name="Observed Business Revenue",
            value=str(observed_revenue),
            unit="INR",
            explanation="Sum of verified customer inflows tagged as sales/business revenue.",
            methodology="sum(amount for direction == CREDIT and category == REVENUE)",
            evidence_basis=f"{revenue_txns_count} categorized revenue transactions",
            limitations="Strictly excludes personal inflows and unverified credits without commercial purpose.",
        ),
        "non_revenue_credits": MetricItem(
            name="Non-Revenue Credits",
            value=str(non_revenue_credit_total),
            unit="INR",
            explanation="Credits received that are not classified as core sales revenue.",
            methodology="sum(amount for direction == CREDIT and category != REVENUE)",
            evidence_basis=f"{non_revenue_credit_count} non-revenue credits",
            limitations="Should not be leveraged to establish debt repayment capability.",
        ),
        "revenue_trend": MetricItem(
            name="Revenue Trend Direction",
            value=revenue_trend_dir,
            unit="TREND",
            explanation="Estimated directional momentum of monthly revenue.",
            methodology="Linear slope evaluation across chronological monthly observations (requires >= 3 months)",
            evidence_basis=f"{len(monthly_revenue)} calendar months observed",
            limitations="Marked INSUFFICIENT_DATA if fewer than 3 months are observed.",
        ),
    }

    revenue_intelligence = RevenueIntelligenceSection(
        observed_business_revenue=observed_revenue,
        revenue_transaction_count=revenue_txns_count,
        non_revenue_credit_total=non_revenue_credit_total,
        non_revenue_credit_count=non_revenue_credit_count,
        monthly_categorized_revenue=monthly_revenue,
        weekly_categorized_revenue=weekly_revenue,
        mom_revenue_growth=mom_growth,
        avg_monthly_revenue=avg_monthly_rev,
        median_monthly_revenue=median_monthly_rev,
        highest_monthly_revenue=highest_month,
        lowest_monthly_revenue=lowest_month,
        revenue_trend_direction=revenue_trend_dir,
        metrics=revenue_metrics,
    )

    # ---------------------------------------------------------
    # SECTION C: OPERATING EXPENSE INTELLIGENCE
    # ---------------------------------------------------------
    observed_opex = Decimal("0.00")
    opex_txns_count = 0
    monthly_opex_acc: Dict[str, Decimal] = defaultdict(lambda: Decimal("0.00"))
    weekly_opex_acc: Dict[str, Decimal] = defaultdict(lambda: Decimal("0.00"))
    cat_distribution_acc: Dict[str, Decimal] = defaultdict(lambda: Decimal("0.00"))
    recurring_expense_total = Decimal("0.00")
    recurring_expense_count = 0

    for t in txn_list:
        if t.direction == TransactionDirection.DEBIT and t.category in OPERATING_EXPENSE_CATEGORIES:
            observed_opex += t.amount
            opex_txns_count += 1
            m_key = t.timestamp.strftime("%Y-%m")
            w_key = _get_iso_week_id(t.timestamp)
            monthly_opex_acc[m_key] += t.amount
            weekly_opex_acc[w_key] += t.amount
            cat_distribution_acc[t.category.value] += t.amount

            if t.recurring is True:
                recurring_expense_total += t.amount
                recurring_expense_count += 1

    observed_opex = observed_opex.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    recurring_expense_total = recurring_expense_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    monthly_opex = {k: v.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP) for k, v in sorted(monthly_opex_acc.items())}
    weekly_opex = {k: v.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP) for k, v in sorted(weekly_opex_acc.items())}
    cat_distribution = {k: v.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP) for k, v in cat_distribution_acc.items()}

    operating_surplus_proxy = (observed_revenue - observed_opex).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    expense_to_revenue_ratio = (
        (observed_opex / observed_revenue).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        if observed_revenue > Decimal("0.00")
        else None
    )

    opex_metrics: Dict[str, MetricItem] = {
        "observed_operating_expenses": MetricItem(
            name="Observed Operating Expenses",
            value=str(observed_opex),
            unit="INR",
            explanation="Sum of operational debits (suppliers, rent, utility, salaries).",
            methodology="sum(amount for direction == DEBIT and category in OPERATING_EXPENSE_CATEGORIES)",
            evidence_basis=f"{opex_txns_count} categorized expense transactions",
            limitations="Strictly excludes personal drawings, capital expenditures, and loan repayments.",
        ),
        "operating_cash_surplus_proxy": MetricItem(
            name="Operating Cash Surplus Proxy",
            value=str(operating_surplus_proxy),
            unit="INR",
            explanation="Partial cash-based operating surplus before taxes, non-operating costs, and financing costs.",
            methodology="observed_revenue - observed_opex",
            evidence_basis="Categorized sales revenue and operating expenses",
            limitations="Not an audited EBITDA or net profit. Represents transaction-level operational buffer.",
        ),
        "expense_to_revenue_ratio": MetricItem(
            name="Expense-to-Revenue Ratio",
            value=str(expense_to_revenue_ratio) if expense_to_revenue_ratio is not None else None,
            unit="RATIO",
            explanation="Proportion of revenue consumed by recognized operating expenditures.",
            methodology="observed_opex / observed_revenue (defined only when observed_revenue > 0)",
            evidence_basis="Categorized OpEx and Revenue",
            limitations="Unavailable if observed revenue is zero.",
        ),
    }

    operating_expenses = OperatingExpenseSection(
        observed_operating_expenses=observed_opex,
        operating_expense_transaction_count=opex_txns_count,
        monthly_operating_expenses=monthly_opex,
        weekly_operating_expenses=weekly_opex,
        operating_cash_surplus_proxy=operating_surplus_proxy,
        expense_to_revenue_ratio=expense_to_revenue_ratio,
        expense_category_distribution=cat_distribution,
        recurring_expense_total=recurring_expense_total,
        recurring_expense_count=recurring_expense_count,
        metrics=opex_metrics,
    )

    # ---------------------------------------------------------
    # SECTION D: FINANCIAL STABILITY & VOLATILITY
    # ---------------------------------------------------------
    monthly_rev_cv = _compute_cv(list(monthly_revenue.values()))
    weekly_rev_cv = _compute_cv(list(weekly_revenue.values())) if len(weekly_revenue) >= 4 else None

    # Monthly net cash-flow breakdown
    all_months_keys = sorted(set(monthly_revenue.keys()) | set(monthly_opex.keys()))
    pos_months = 0
    neg_months = 0
    monthly_surplus_map: Dict[str, Decimal] = {}

    for mk in all_months_keys:
        m_rev = monthly_revenue.get(mk, Decimal("0.00"))
        m_op = monthly_opex.get(mk, Decimal("0.00"))
        m_surplus = m_rev - m_op
        monthly_surplus_map[mk] = m_surplus
        if m_surplus >= Decimal("0.00"):
            pos_months += 1
        else:
            neg_months += 1

    surplus_trend = _compute_trend_direction(monthly_surplus_map)

    # Activity consistency: distinct dates with revenue / distinct dates with transactions
    all_txn_dates = {t.timestamp.date() for t in txn_list}
    rev_txn_dates = {t.timestamp.date() for t in txn_list if t.direction == TransactionDirection.CREDIT and t.category == TransactionCategory.REVENUE}
    activity_consistency = _safe_float(len(rev_txn_dates) / len(all_txn_dates)) if all_txn_dates else None

    # Qualitative stability band
    if monthly_rev_cv is None:
        stability_band = "INSUFFICIENT_EVIDENCE"
    elif monthly_rev_cv < 0.25:
        stability_band = "OBSERVED_STABLE"
    else:
        stability_band = "OBSERVED_VARIABLE"

    stability_metrics: Dict[str, MetricItem] = {
        "monthly_revenue_volatility": MetricItem(
            name="Monthly Revenue Volatility (CV)",
            value=_safe_float(monthly_rev_cv),
            unit="COEFFICIENT_OF_VARIATION",
            explanation="Normalized measure of dispersion of monthly sales revenue. Lower values indicate steady cash inflow.",
            methodology="population_std_dev(monthly_revenue) / mean(monthly_revenue) (requires >= 3 months)",
            evidence_basis=f"{len(monthly_revenue)} calendar months",
            limitations="Unavailable if fewer than 3 months of revenue are observed.",
        ),
        "financial_stability_band": MetricItem(
            name="Stability Classification",
            value=stability_band,
            unit="CATEGORY",
            explanation="Heuristic evaluation of monthly cash-flow predictability based on observed CV.",
            methodology="CV < 0.25 -> OBSERVED_STABLE; CV >= 0.25 -> OBSERVED_VARIABLE; < 3 months -> INSUFFICIENT_EVIDENCE",
            evidence_basis="Monthly revenue CV",
            limitations="Prototype heuristic; does not replace formal underwriting stress testing.",
        ),
    }

    financial_stability = FinancialStabilitySection(
        monthly_revenue_cv=monthly_rev_cv,
        weekly_revenue_cv=weekly_rev_cv,
        positive_cashflow_months_count=pos_months,
        negative_cashflow_months_count=neg_months,
        revenue_activity_consistency=activity_consistency,
        surplus_trend_direction=surplus_trend,
        stability_band=stability_band,
        metrics=stability_metrics,
    )

    # ---------------------------------------------------------
    # SECTION E: CUSTOMER INTELLIGENCE
    # ---------------------------------------------------------
    customer_revenue_acc: Dict[str, Decimal] = defaultdict(lambda: Decimal("0.00"))
    customer_txns_count: Dict[str, int] = defaultdict(int)
    identifiable_rev_total = Decimal("0.00")
    unidentified_rev_total = Decimal("0.00")

    for t in txn_list:
        if t.direction == TransactionDirection.CREDIT and t.category == TransactionCategory.REVENUE:
            if t.counterparty_id:
                cid = t.counterparty_id.strip()
                customer_revenue_acc[cid] += t.amount
                customer_txns_count[cid] += 1
                identifiable_rev_total += t.amount
            else:
                unidentified_rev_total += t.amount

    identifiable_rev_total = identifiable_rev_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    unidentified_rev_total = unidentified_rev_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    identifiable_rev_ratio = (
        _safe_float(float(identifiable_rev_total / observed_revenue))
        if observed_revenue > Decimal("0.00")
        else 0.0
    )

    sorted_customers = sorted(customer_revenue_acc.items(), key=lambda kv: kv[1], reverse=True)
    revenue_by_cust = {k: v.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP) for k, v in sorted_customers}

    # Concentration and HHI
    top_1_cust_share: Optional[float] = None
    top_3_cust_share: Optional[float] = None
    customer_hhi: Optional[float] = None

    if identifiable_rev_total > Decimal("0.00"):
        shares = [float(val / identifiable_rev_total) for _, val in sorted_customers]
        top_1_cust_share = _safe_float(shares[0]) if shares else None
        top_3_cust_share = _safe_float(sum(shares[:3])) if shares else None
        # HHI between 0.0 and 1.0
        hhi_val = sum(s ** 2 for s in shares)
        customer_hhi = _safe_float(hhi_val)

    # Repeat customers (>= 2 distinct revenue transactions)
    repeat_cust_ids = {cid for cid, cnt in customer_txns_count.items() if cnt >= 2}
    repeat_cust_revenue = sum((customer_revenue_acc[cid] for cid in repeat_cust_ids), Decimal("0.00")).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )
    repeat_cust_share = (
        _safe_float(float(repeat_cust_revenue / identifiable_rev_total))
        if identifiable_rev_total > Decimal("0.00")
        else None
    )

    customer_metrics: Dict[str, MetricItem] = {
        "customer_hhi_concentration": MetricItem(
            name="Customer Concentration Index (HHI)",
            value=customer_hhi,
            unit="INDEX",
            explanation="Herfindahl-Hirschman Index representing revenue concentration among identifiable buyers (0.0 to 1.0).",
            methodology="sum((customer_revenue / identifiable_revenue)^2)",
            evidence_basis=f"{len(customer_revenue_acc)} identifiable revenue counterparties",
            limitations="Computed strictly over identifiable transactions. Unidentified cash/UPI volume is excluded.",
        ),
        "repeat_customer_revenue_share": MetricItem(
            name="Repeat Customer Revenue Share",
            value=repeat_cust_share,
            unit="RATIO",
            explanation="Proportion of identifiable revenue originating from repeat customers (>= 2 transactions).",
            methodology="revenue_from_repeat_customers / identifiable_revenue",
            evidence_basis=f"{len(repeat_cust_ids)} repeat buyers identified",
            limitations="Requires counterparty identifier; untracked over-the-counter walk-in customers cannot be tracked.",
        ),
    }

    customer_intelligence = CustomerIntelligenceSection(
        identifiable_customers_count=len(customer_revenue_acc),
        identifiable_revenue_total=identifiable_rev_total,
        unidentified_revenue_total=unidentified_rev_total,
        identifiable_revenue_ratio=identifiable_rev_ratio or 0.0,
        revenue_by_customer=revenue_by_cust,
        top_customer_share=top_1_cust_share,
        top_three_customers_share=top_3_cust_share,
        customer_hhi=customer_hhi,
        repeat_customers_count=len(repeat_cust_ids),
        repeat_customers_revenue_total=repeat_cust_revenue,
        repeat_customers_revenue_share=repeat_cust_share,
        metrics=customer_metrics,
    )

    # ---------------------------------------------------------
    # SECTION F: SUPPLIER INTELLIGENCE
    # ---------------------------------------------------------
    supplier_payments_acc: Dict[str, Decimal] = defaultdict(lambda: Decimal("0.00"))
    supplier_txns_count: Dict[str, int] = defaultdict(int)
    identifiable_supp_total = Decimal("0.00")
    unidentified_supp_total = Decimal("0.00")
    monthly_supp_acc: Dict[str, Decimal] = defaultdict(lambda: Decimal("0.00"))

    total_supplier_spend = Decimal("0.00")
    for t in txn_list:
        if t.direction == TransactionDirection.DEBIT and t.category == TransactionCategory.SUPPLIER_PAYMENT:
            total_supplier_spend += t.amount
            m_key = t.timestamp.strftime("%Y-%m")
            monthly_supp_acc[m_key] += t.amount
            if t.counterparty_id:
                sid = t.counterparty_id.strip()
                supplier_payments_acc[sid] += t.amount
                supplier_txns_count[sid] += 1
                identifiable_supp_total += t.amount
            else:
                unidentified_supp_total += t.amount

    identifiable_supp_total = identifiable_supp_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    unidentified_supp_total = unidentified_supp_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    identifiable_supp_ratio = (
        _safe_float(float(identifiable_supp_total / total_supplier_spend))
        if total_supplier_spend > Decimal("0.00")
        else 0.0
    )

    sorted_suppliers = sorted(supplier_payments_acc.items(), key=lambda kv: kv[1], reverse=True)
    payments_by_supp = {k: v.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP) for k, v in sorted_suppliers}
    monthly_supp_payments = {k: v.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP) for k, v in sorted(monthly_supp_acc.items())}

    top_1_supp_share: Optional[float] = None
    top_3_supp_share: Optional[float] = None
    supplier_hhi: Optional[float] = None

    if identifiable_supp_total > Decimal("0.00"):
        supp_shares = [float(val / identifiable_supp_total) for _, val in sorted_suppliers]
        top_1_supp_share = _safe_float(supp_shares[0]) if supp_shares else None
        top_3_supp_share = _safe_float(sum(supp_shares[:3])) if supp_shares else None
        hhi_val = sum(s ** 2 for s in supp_shares)
        supplier_hhi = _safe_float(hhi_val)

    repeat_supp_ids = {sid for sid, cnt in supplier_txns_count.items() if cnt >= 2}
    repeat_supp_spend = sum((supplier_payments_acc[sid] for sid in repeat_supp_ids), Decimal("0.00")).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )
    repeat_supp_share = (
        _safe_float(float(repeat_supp_spend / identifiable_supp_total))
        if identifiable_supp_total > Decimal("0.00")
        else None
    )

    supplier_metrics: Dict[str, MetricItem] = {
        "supplier_hhi_concentration": MetricItem(
            name="Supplier Concentration Index (HHI)",
            value=supplier_hhi,
            unit="INDEX",
            explanation="Herfindahl-Hirschman Index representing supplier expenditure concentration (0.0 to 1.0).",
            methodology="sum((supplier_spend / identifiable_supplier_spend)^2)",
            evidence_basis=f"{len(supplier_payments_acc)} identifiable suppliers",
            limitations="High concentration can represent single-vendor dependency or focused bulk discounting.",
        ),
        "repeat_supplier_relationship_share": MetricItem(
            name="Repeat Supplier Relationship Share",
            value=repeat_supp_share,
            unit="RATIO",
            explanation="Proportion of supplier payments directed to recurring trade vendors (>= 2 transactions).",
            methodology="spend_with_repeat_suppliers / identifiable_supplier_spend",
            evidence_basis=f"{len(repeat_supp_ids)} repeat suppliers observed",
            limitations="Reflects payment regularity; does not verify contract terms or delivery completion.",
        ),
    }

    supplier_intelligence = SupplierIntelligenceSection(
        identifiable_suppliers_count=len(supplier_payments_acc),
        identifiable_supplier_payments_total=identifiable_supp_total,
        unidentified_supplier_payments_total=unidentified_supp_total,
        identifiable_supplier_payments_ratio=identifiable_supp_ratio or 0.0,
        payments_by_supplier=payments_by_supp,
        top_supplier_share=top_1_supp_share,
        top_three_suppliers_share=top_3_supp_share,
        supplier_hhi=supplier_hhi,
        repeat_suppliers_count=len(repeat_supp_ids),
        repeat_suppliers_payment_share=repeat_supp_share,
        monthly_supplier_payments=monthly_supp_payments,
        metrics=supplier_metrics,
    )

    # ---------------------------------------------------------
    # SECTION G: DEBT REPAYMENT OBSERVATIONS
    # ---------------------------------------------------------
    observed_debt_total = Decimal("0.00")
    debt_txns_count = 0
    monthly_debt_acc: Dict[str, Decimal] = defaultdict(lambda: Decimal("0.00"))

    for t in txn_list:
        if t.direction == TransactionDirection.DEBIT and t.category == TransactionCategory.LOAN_REPAYMENT:
            observed_debt_total += t.amount
            debt_txns_count += 1
            m_key = t.timestamp.strftime("%Y-%m")
            monthly_debt_acc[m_key] += t.amount

    observed_debt_total = observed_debt_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    monthly_debt = {k: v.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP) for k, v in sorted(monthly_debt_acc.items())}

    # Repayment frequency heuristic
    repayment_freq = "INSUFFICIENT_DATA"
    if len(monthly_debt) >= 2:
        repayment_freq = "MONTHLY"
    elif debt_txns_count > 0:
        repayment_freq = "IRREGULAR"

    debt_metrics: Dict[str, MetricItem] = {
        "observed_debt_repayments": MetricItem(
            name="Observed Debt Repayments",
            value=str(observed_debt_total),
            unit="INR",
            explanation="Total outgoing debits explicitly categorized as loan or debt repayments.",
            methodology="sum(amount for direction == DEBIT and category == LOAN_REPAYMENT)",
            evidence_basis=f"{debt_txns_count} repayment transactions observed",
            limitations=(
                "Does NOT reflect total outstanding borrowing liabilities, interest rates, or missed EMI obligations. "
                "Only accounts for debit transactions visible in the supplied statement."
            ),
        ),
    }

    debt_repayments = DebtRepaymentSection(
        observed_debt_repayments_total=observed_debt_total,
        debt_repayment_transaction_count=debt_txns_count,
        monthly_debt_repayments=monthly_debt,
        observed_repayment_frequency=repayment_freq,
        metrics=debt_metrics,
    )

    # ---------------------------------------------------------
    # SECTION H: DATA COVERAGE & LIMITATIONS
    # ---------------------------------------------------------
    earliest_date: Optional[date] = None
    latest_date: Optional[date] = None
    observation_days = 0

    if txn_list:
        sorted_dates = sorted(t.timestamp.date() for t in txn_list)
        earliest_date = sorted_dates[0]
        latest_date = sorted_dates[-1]
        observation_days = (latest_date - earliest_date).days + 1

    distinct_months_count = len(set(t.timestamp.strftime("%Y-%m") for t in txn_list))

    # Coverage status
    coverage_status = "UNKNOWN"
    if coverage and "status" in coverage:
        coverage_status = str(coverage["status"]).upper()
    elif distinct_months_count >= 6 and observation_days >= 180:
        coverage_status = "COMPLETE"
    elif distinct_months_count >= 1:
        coverage_status = "PARTIAL"

    limitations: List[str] = [
        "Unobserved cash, ledger-based, or non-bank digital transactions are not included.",
        "A missing transaction period represents an unobserved interval, not verified zero activity.",
        "Absence of recorded debt repayments does not prove the absence of outside liabilities.",
        "Counterparties lacking identifiers represent anonymous payments, not confirmed suspicious entities.",
    ]

    unavailable_metrics: List[str] = []
    if monthly_rev_cv is None:
        unavailable_metrics.append("Monthly Revenue Volatility (Requires >= 3 eligible calendar months)")
    if len(monthly_revenue) < 12:
        unavailable_metrics.append("Revenue Seasonality Index (Requires >= 12 consecutive calendar months)")
    if customer_hhi is None:
        unavailable_metrics.append("Customer Concentration HHI (Requires identifiable customer counterparties)")

    coverage_metrics: Dict[str, MetricItem] = {
        "observation_window": MetricItem(
            name="Observation Window",
            value=observation_days,
            unit="DAYS",
            explanation="Calendar duration between earliest and latest recorded transactions.",
            methodology="(latest_date - earliest_date) + 1",
            evidence_basis=f"Earliest: {earliest_date}, Latest: {latest_date}",
            limitations="Does not guarantee full unbroken statement continuity.",
        ),
    }

    data_coverage = DataCoverageSection(
        total_transactions=len(txn_list),
        earliest_transaction_date=earliest_date,
        latest_transaction_date=latest_date,
        observation_window_days=observation_days,
        distinct_calendar_months_count=distinct_months_count,
        coverage_status=coverage_status,
        rejected_rows_count=rejected_count,
        duplicate_rows_count=duplicate_count,
        data_limitations=limitations,
        unavailable_metrics=unavailable_metrics,
        metrics=coverage_metrics,
    )

    # ---------------------------------------------------------
    # SECTION I: EXPLAINABLE FINANCIAL DNA DIMENSIONS
    # ---------------------------------------------------------
    # 1. Cash-Flow Vitality
    vitality_obs = []
    if net_observed_cashflow > Decimal("0.00"):
        vitality_obs.append(f"Net positive cash inflow of ₹{net_observed_cashflow:,.2f}.")
    else:
        vitality_obs.append(f"Net negative cash outflow of ₹{abs(net_observed_cashflow):,.2f}.")
    if operating_surplus_proxy > Decimal("0.00"):
        vitality_obs.append(f"Operating cash surplus buffer estimated at ₹{operating_surplus_proxy:,.2f}.")
    vitality_status = "POSITIVE" if operating_surplus_proxy > Decimal("0.00") and net_observed_cashflow > Decimal("0.00") else "CONSTRAINED"
    vitality_score = 75.0 if vitality_status == "POSITIVE" else 40.0
    dim_vitality = DimensionSummary(
        dimension_name="Cash-Flow Vitality",
        status=vitality_status,
        score_proxy=vitality_score,
        key_observations=vitality_obs,
        limitations=["Operating surplus does not reflect accrued tax, depreciation, or off-balance-sheet commitments."],
        evidence_sufficiency="HIGH" if len(txn_list) >= 10 else "LOW",
    )

    # 2. Business Activity Continuity
    continuity_obs = [f"{len(txn_list)} transactions recorded across {distinct_months_count} distinct calendar months."]
    if activity_consistency is not None:
        continuity_obs.append(f"{activity_consistency * 100:.1f}% of active trading days demonstrate sales inflow.")
    continuity_status = "POSITIVE" if distinct_months_count >= 3 and len(txn_list) >= 15 else "MODERATE"
    dim_continuity = DimensionSummary(
        dimension_name="Business Activity Continuity",
        status=continuity_status,
        score_proxy=80.0 if continuity_status == "POSITIVE" else 55.0,
        key_observations=continuity_obs,
        limitations=["Only reflects activity on observed digital/banking rails."],
        evidence_sufficiency="HIGH" if distinct_months_count >= 3 else "MEDIUM",
    )

    # 3. Customer Diversification
    cust_obs = []
    if customer_hhi is not None:
        cust_obs.append(f"Identifiable customer HHI index is {customer_hhi:.4f} across {len(customer_revenue_acc)} counterparties.")
        if top_1_cust_share is not None:
            cust_obs.append(f"Top buyer accounts for {top_1_cust_share * 100:.1f}% of identifiable sales.")
        cust_status = "POSITIVE" if customer_hhi < 0.25 else "CONSTRAINED"
    else:
        cust_obs.append("Insufficient identifiable customer IDs to compute formal concentration index.")
        cust_status = "INSUFFICIENT_DATA"
    dim_cust = DimensionSummary(
        dimension_name="Customer Diversification",
        status=cust_status,
        score_proxy=75.0 if cust_status == "POSITIVE" else (45.0 if cust_status == "CONSTRAINED" else None),
        key_observations=cust_obs,
        limitations=["Unidentified over-the-counter payments cannot be tracked to individual buyer accounts."],
        evidence_sufficiency="HIGH" if identifiable_rev_ratio >= 0.7 else "LOW",
    )

    # 4. Supplier Dependence
    supp_obs = []
    if supplier_hhi is not None:
        supp_obs.append(f"Identifiable supplier HHI is {supplier_hhi:.4f} across {len(supplier_payments_acc)} trade vendors.")
        supp_status = "POSITIVE" if supplier_hhi < 0.35 else "MODERATE"
    else:
        supp_obs.append("Limited identifiable supplier accounts in operating expenditures.")
        supp_status = "INSUFFICIENT_DATA"
    dim_supp = DimensionSummary(
        dimension_name="Supplier Dependence",
        status=supp_status,
        score_proxy=70.0 if supp_status == "POSITIVE" else 50.0,
        key_observations=supp_obs,
        limitations=["Concentration may represent exclusive wholesale distributor arrangements rather than adverse dependency."],
        evidence_sufficiency="MEDIUM" if identifiable_supp_ratio >= 0.5 else "LOW",
    )

    # 5. Financial Stability
    stab_obs = [f"Stability band evaluated as {stability_band}."]
    if monthly_rev_cv is not None:
        stab_obs.append(f"Monthly revenue dispersion (CV) measured at {monthly_rev_cv:.4f}.")
    dim_stab = DimensionSummary(
        dimension_name="Financial Stability",
        status="POSITIVE" if stability_band == "OBSERVED_STABLE" else ("MODERATE" if stability_band == "OBSERVED_VARIABLE" else "INSUFFICIENT_DATA"),
        score_proxy=85.0 if stability_band == "OBSERVED_STABLE" else (50.0 if stability_band == "OBSERVED_VARIABLE" else None),
        key_observations=stab_obs,
        limitations=["Does not extrapolate future macroeconomic shocks or unobserved seasonal down-cycles."],
        evidence_sufficiency="HIGH" if distinct_months_count >= 3 else "INSUFFICIENT",
    )

    dimensions_dict = {
        "cash_flow_vitality": dim_vitality,
        "business_activity_continuity": dim_continuity,
        "customer_diversification": dim_cust,
        "supplier_dependence": dim_supp,
        "financial_stability": dim_stab,
    }

    return FinancialDnaReport(
        business_id=business_id,
        cash_flow_activity=cash_flow_activity,
        revenue_intelligence=revenue_intelligence,
        operating_expenses=operating_expenses,
        financial_stability=financial_stability,
        customer_intelligence=customer_intelligence,
        supplier_intelligence=supplier_intelligence,
        debt_repayments=debt_repayments,
        data_coverage=data_coverage,
        dimensions=dimensions_dict,
    )
