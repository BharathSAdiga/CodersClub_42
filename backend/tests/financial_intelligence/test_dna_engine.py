"""Unit tests for UDYOGA Financial DNA Engine (dna_engine.py).

Validates all 6 core dimensions:
1. Cash Flow Activity (totals, medians, odd/even counts, inflow-to-outflow ratios)
2. Revenue Intelligence (MoM growth, Decimal precision, non-revenue credits, December-to-January)
3. Operating Expenses (OpEx classification, non-operating debits, surplus proxy)
4. Debt Repayments (observed EMIs vs unobserved liabilities)
5. Customer Intelligence (Customer HHI, Top-1/Top-3 shares, repeat customers)
6. Supplier Intelligence (Supplier HHI, Top-1/Top-3 shares, repeat suppliers)
7. Financial Stability & Volatility (CV with odd/even, zero-denominator safety, ISO week consistency)
"""

from datetime import date, datetime
from decimal import Decimal
import pytest

from app.modules.financial_intelligence.parser import (
    NormalizedTransaction,
    TransactionCategory,
    TransactionChannel,
    TransactionDirection,
)
from app.modules.financial_intelligence.dna_engine import (
    compute_financial_dna,
    FinancialDnaReport,
)


def _make_tx(
    txn_id: str,
    dt_str: str,
    amount_str: str,
    direction: TransactionDirection,
    category: TransactionCategory,
    counterparty_id: str = None,
    counterparty_name: str = None,
    channel: TransactionChannel = TransactionChannel.UPI,
    is_recurring: bool = False,
) -> NormalizedTransaction:
    """Helper to build a deterministic NormalizedTransaction."""
    d = date.fromisoformat(dt_str)
    ts = datetime.combine(d, datetime.min.time())
    return NormalizedTransaction(
        transaction_id=txn_id,
        date=d,
        timestamp=ts,
        amount=Decimal(amount_str),
        direction=direction,
        category=category,
        channel=channel,
        counterparty_id=counterparty_id,
        counterparty_name=counterparty_name,
        description=f"Synthetic test transaction {txn_id}",
        is_recurring=is_recurring,
    )


# ==============================================================================
# 1. CUSTOMER & SUPPLIER CONCENTRATION (HHI & SHARES)
# ==============================================================================

def test_customer_hhi_and_concentration_shares():
    """Verify Customer HHI, Top-1, and Top-3 share calculations against hand-checked values."""
    # 3 customers:
    # CUST-A: 50,000 (50%)
    # CUST-B: 30,000 (30%)
    # CUST-C: 20,000 (20%)
    # Total Revenue: 100,000.00
    # Expected HHI: 0.50^2 + 0.30^2 + 0.20^2 = 0.25 + 0.09 + 0.04 = 0.3800
    txs = [
        _make_tx("T1", "2024-05-10", "50000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE, "CUST-A", "Customer A"),
        _make_tx("T2", "2024-05-15", "30000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE, "CUST-B", "Customer B"),
        _make_tx("T3", "2024-05-20", "20000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE, "CUST-C", "Customer C"),
    ]

    report = compute_financial_dna(txs, business_id="BIZ-TEST-001")
    cust_intel = report.customer_intelligence

    assert cust_intel.identifiable_customers_count == 3
    assert cust_intel.identifiable_revenue_total == Decimal("100000.00")
    assert cust_intel.customer_hhi == pytest.approx(0.38, abs=0.001)
    assert cust_intel.top_customer_share == pytest.approx(0.50, abs=0.001)
    assert cust_intel.top_three_customers_share == pytest.approx(1.00, abs=0.001)
    assert list(cust_intel.revenue_by_customer.keys())[0] == "CUST-A"


def test_supplier_hhi_and_concentration_shares():
    """Verify Supplier HHI and Top-1 share against independently calculated values."""
    # 2 suppliers:
    # SUPP-X: 60,000 (60%)
    # SUPP-Y: 40,000 (40%)
    # Total OpEx: 100,000.00
    # Expected HHI: 0.60^2 + 0.40^2 = 0.36 + 0.16 = 0.5200
    txs = [
        _make_tx("T1", "2024-05-10", "60000.00", TransactionDirection.DEBIT, TransactionCategory.SUPPLIER_PAYMENT, "SUPP-X", "Supplier X"),
        _make_tx("T2", "2024-05-15", "40000.00", TransactionDirection.DEBIT, TransactionCategory.SUPPLIER_PAYMENT, "SUPP-Y", "Supplier Y"),
    ]

    report = compute_financial_dna(txs, business_id="BIZ-TEST-002")
    supp_intel = report.supplier_intelligence

    assert supp_intel.identifiable_suppliers_count == 2
    assert supp_intel.identifiable_supplier_payments_total == Decimal("100000.00")
    assert supp_intel.supplier_hhi == pytest.approx(0.52, abs=0.001)
    assert supp_intel.top_supplier_share == pytest.approx(0.60, abs=0.001)
    assert list(supp_intel.payments_by_supplier.keys())[0] == "SUPP-X"


def test_repeat_customers_and_repeat_suppliers():
    """Verify identification of recurring counterparties (>= 2 transactions)."""
    txs = [
        # Customer A: 3 txns (repeat)
        _make_tx("T1", "2024-05-01", "10000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE, "CUST-A"),
        _make_tx("T2", "2024-05-08", "12000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE, "CUST-A"),
        _make_tx("T3", "2024-05-15", "11000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE, "CUST-A"),
        # Customer B: 1 txn (one-time)
        _make_tx("T4", "2024-05-20", "5000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE, "CUST-B"),
        # Supplier S1: 2 txns (repeat)
        _make_tx("T5", "2024-05-05", "8000.00", TransactionDirection.DEBIT, TransactionCategory.SUPPLIER_PAYMENT, "SUPP-S1"),
        _make_tx("T6", "2024-05-18", "9000.00", TransactionDirection.DEBIT, TransactionCategory.SUPPLIER_PAYMENT, "SUPP-S1"),
        # Supplier S2: 1 txn (one-time)
        _make_tx("T7", "2024-05-25", "4000.00", TransactionDirection.DEBIT, TransactionCategory.SUPPLIER_PAYMENT, "SUPP-S2"),
    ]

    report = compute_financial_dna(txs)
    assert report.customer_intelligence.repeat_customers_count == 1
    assert report.supplier_intelligence.repeat_suppliers_count == 1


# ==============================================================================
# 2. REVENUE VOLATILITY & ISO WEEKS
# ==============================================================================

def test_stable_vs_variable_revenue_volatility():
    """Verify Coefficient of Variation (CV) for stable vs volatile monthly revenue."""
    # Stable: 4 months of 50,000 each -> CV = 0.0000
    stable_txs = [
        _make_tx("S1", "2024-01-10", "50000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE, "C1"),
        _make_tx("S2", "2024-02-10", "50000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE, "C1"),
        _make_tx("S3", "2024-03-10", "50000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE, "C1"),
        _make_tx("S4", "2024-04-10", "50000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE, "C1"),
    ]
    report_stable = compute_financial_dna(stable_txs)
    assert report_stable.financial_stability.monthly_revenue_cv == pytest.approx(0.0000, abs=0.0001)

    # Volatile: 4 months of 10,000, 100,000, 20,000, 90,000
    # Mean = 55,000. Variance = ((45k)^2 + (45k)^2 + (35k)^2 + (35k)^2)/4 = (2025M + 2025M + 1225M + 1225M)/4 = 1625M
    # StdDev = sqrt(1625M) = 40311.288 -> CV = 40311.29 / 55000 = 0.7329
    var_txs = [
        _make_tx("V1", "2024-01-10", "10000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE, "C1"),
        _make_tx("V2", "2024-02-10", "100000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE, "C1"),
        _make_tx("V3", "2024-03-10", "20000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE, "C1"),
        _make_tx("V4", "2024-04-10", "90000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE, "C1"),
    ]
    report_var = compute_financial_dna(var_txs)
    assert report_var.financial_stability.monthly_revenue_cv > 0.60


def test_iso_week_consistency_and_december_january_boundary():
    """Verify ISO 8601 week formatting (YYYY-Www) across December-to-January boundary and ISO Week 53."""
    txs = [
        # 2020-12-30 (Wednesday) is 2020-W53 (genuine 53-week ISO year)
        _make_tx("W1", "2020-12-30", "15000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE, "C1"),
        # 2021-01-05 (Tuesday) is 2021-W01
        _make_tx("W2", "2021-01-05", "25000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE, "C1"),
    ]
    report = compute_financial_dna(txs)
    weekly_rev = report.revenue_intelligence.weekly_categorized_revenue

    assert "2020-W53" in weekly_rev
    assert weekly_rev["2020-W53"] == Decimal("15000.00")
    assert "2021-W01" in weekly_rev
    assert weekly_rev["2021-W01"] == Decimal("25000.00")


# ==============================================================================
# 3. MEDIANS (ODD & EVEN), ZERO-DENOMINATOR & MoM GROWTH
# ==============================================================================

def test_odd_and_even_transaction_amount_medians():
    """Verify median calculation with both odd and even numbers of transactions."""
    # Odd: 3 txns: 1,000, 3,000, 10,000 -> Median = 3,000.00
    odd_txs = [
        _make_tx("O1", "2024-05-01", "1000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE),
        _make_tx("O2", "2024-05-02", "3000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE),
        _make_tx("O3", "2024-05-03", "10000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE),
    ]
    rep_odd = compute_financial_dna(odd_txs)
    assert rep_odd.cash_flow_activity.median_transaction_amount == Decimal("3000.00")

    # Even: 4 txns: 1,000, 2,000, 4,000, 5,000 -> Median = (2,000 + 4,000)/2 = 3,000.00
    even_txs = [
        _make_tx("E1", "2024-05-01", "1000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE),
        _make_tx("E2", "2024-05-02", "2000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE),
        _make_tx("E3", "2024-05-03", "4000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE),
        _make_tx("E4", "2024-05-04", "5000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE),
    ]
    rep_even = compute_financial_dna(even_txs)
    assert rep_even.cash_flow_activity.median_transaction_amount == Decimal("3000.00")


def test_zero_previous_month_revenue_growth_safety():
    """Verify that MoM growth safely handles zero previous month revenue without ZeroDivisionError."""
    # Month 1: 0 revenue (only non-revenue credit)
    # Month 2: 50,000 revenue
    txs = [
        _make_tx("Z1", "2024-05-10", "100000.00", TransactionDirection.CREDIT, TransactionCategory.OTHER),
        _make_tx("Z2", "2024-06-10", "50000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE),
    ]
    report = compute_financial_dna(txs)
    growth = report.revenue_intelligence.mom_revenue_growth
    # Should not crash, and Month 2 growth should be None because Month 1 revenue was 0 or unobserved
    assert growth.get("2024-06") is None


def test_december_to_january_consecutive_mom_growth():
    """Verify MoM growth across calendar year boundary (December to January)."""
    txs = [
        _make_tx("D1", "2024-12-15", "40000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE),
        _make_tx("J1", "2025-01-15", "50000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE),
    ]
    report = compute_financial_dna(txs)
    growth = report.revenue_intelligence.mom_revenue_growth

    # (50,000 - 40,000) / 40,000 * 100 = +25.0%
    assert growth.get("2025-01") == pytest.approx(25.0, abs=0.01)


# ==============================================================================
# 4. CATEGORY ISOLATION, MISSING COUNTERPARTIES & PRECISION
# ==============================================================================

def test_missing_counterparties_handling():
    """Verify that transactions with missing counterparty IDs are handled safely without crash."""
    txs = [
        _make_tx("M1", "2024-05-01", "20000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE, counterparty_id=None),
        _make_tx("M2", "2024-05-05", "30000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE, counterparty_id=""),
        _make_tx("M3", "2024-05-10", "50000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE, counterparty_id="CUST-X"),
    ]
    report = compute_financial_dna(txs)
    assert report.revenue_intelligence.observed_business_revenue == Decimal("100000.00")
    # Only CUST-X is recognized as an identifiable counterparty
    assert report.customer_intelligence.identifiable_customers_count == 1
    assert list(report.customer_intelligence.revenue_by_customer.keys())[0] == "CUST-X"


def test_non_revenue_credits_and_non_operating_debits_isolation():
    """Verify that non-revenue credits and non-operating debits do not contaminate business revenue or OpEx."""
    txs = [
        _make_tx("C1", "2024-05-01", "50000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE),
        _make_tx("C2", "2024-05-02", "100000.00", TransactionDirection.CREDIT, TransactionCategory.OTHER),
        _make_tx("D1", "2024-05-03", "20000.00", TransactionDirection.DEBIT, TransactionCategory.SUPPLIER_PAYMENT),
        _make_tx("D2", "2024-05-04", "15000.00", TransactionDirection.DEBIT, TransactionCategory.LOAN_REPAYMENT),
        _make_tx("D3", "2024-05-05", "5000.00", TransactionDirection.DEBIT, TransactionCategory.PERSONAL),
    ]
    report = compute_financial_dna(txs)

    # Cash Flow Activity totals
    assert report.cash_flow_activity.total_credits == Decimal("150000.00")
    assert report.cash_flow_activity.total_debits == Decimal("40000.00")
    assert report.cash_flow_activity.net_observed_cashflow == Decimal("110000.00")

    # Revenue Intelligence isolates only C1
    assert report.revenue_intelligence.observed_business_revenue == Decimal("50000.00")
    assert report.revenue_intelligence.non_revenue_credit_total == Decimal("100000.00")

    # Operating Expenses isolates only D1
    assert report.operating_expenses.observed_operating_expenses == Decimal("20000.00")

    # Debt Repayment isolates only D2
    assert report.debt_repayments.observed_debt_repayments_total == Decimal("15000.00")

    # Operating Cash Surplus Proxy = Revenue - OpEx = 50,000 - 20,000 = 30,000.00
    assert report.operating_expenses.operating_cash_surplus_proxy == Decimal("30000.00")


def test_decimal_precision_preservation():
    """Verify exact Decimal arithmetic without floating-point rounding errors."""
    txs = [
        _make_tx("P1", "2024-05-01", "12345.67", TransactionDirection.CREDIT, TransactionCategory.REVENUE),
        _make_tx("P2", "2024-05-02", "98765.43", TransactionDirection.CREDIT, TransactionCategory.REVENUE),
        _make_tx("P3", "2024-05-03", "11111.11", TransactionDirection.DEBIT, TransactionCategory.SUPPLIER_PAYMENT),
    ]
    report = compute_financial_dna(txs)

    # Credits: 12345.67 + 98765.43 = 111111.10
    # Debits: 11111.11
    # Net: 111111.10 - 11111.11 = 99999.99
    assert report.cash_flow_activity.total_credits == Decimal("111111.10")
    assert report.cash_flow_activity.total_debits == Decimal("11111.11")
    assert report.cash_flow_activity.net_observed_cashflow == Decimal("99999.99")
    assert report.operating_expenses.operating_cash_surplus_proxy == Decimal("99999.99")


def test_insufficient_evidence_and_empty_input():
    """Verify that an empty transaction list returns clean, safe default objects without crashing."""
    report = compute_financial_dna([], business_id="EMPTY-MSME")

    assert report.cash_flow_activity.total_credits == Decimal("0.00")
    assert report.cash_flow_activity.total_debits == Decimal("0.00")
    assert report.cash_flow_activity.net_observed_cashflow == Decimal("0.00")
    assert report.revenue_intelligence.observed_business_revenue == Decimal("0.00")
    assert report.customer_intelligence.customer_hhi is None
    assert report.supplier_intelligence.supplier_hhi is None
    assert report.financial_stability.monthly_revenue_cv is None
