# UDYOGA — Financial Intelligence Engine
## Phase 4: Cash-Flow Time-Series Intelligence, Data Coverage & Resilience Engine Handoff

### Document Overview
This document specifies the technical architecture, mathematical definitions, data integrity rules, continuity metrics, and downstream simulation contracts for the **Cash-Flow Time-Series Intelligence Engine** (`cashflow_series.py`) within UDYOGA's Financial Intelligence module.

---

### 1. Public Function Signatures

```python
def build_cashflow_series(
    transactions: Union[List[NormalizedTransaction], ParseResult, Any],
    *,
    business_id: str = "MSME",
    frequency: str = "monthly",
    coverage: Optional[Union[CoverageMetadata, Dict[str, Any]]] = None,
) -> CashflowSeriesResult:

def prepare_resilience_inputs(
    cashflow_series: CashflowSeriesResult,
    *,
    known_obligations: Optional[Union[List[ContractualObligationItem], List[Dict[str, Any]]]] = None,
) -> ResilienceInputResult:
```

---

### 2. Input Requirements & Preconditions
* **Input Types**: Normalized records produced by the Phase 1 parser (`List[NormalizedTransaction]`, `ParseResult`, or dictionaries).
* **Immutability & Precision**: Ingested transactions carry strict `Decimal` amounts, validated `TransactionDirection` (`CREDIT` / `DEBIT`), categorized financial tags, and standard `datetime` timestamps.
* **Deterministic Deduplication**: Duplicate records sharing identical `transaction_id` references are safely deduplicated, preserving the first chronological observation.
* **Chronological Sorting**: Transactions are sorted deterministically by `(timestamp, transaction_id)` prior to bucketing.

---

### 3. Weekly & Monthly Time Bucketing Conventions

| Frequency | Period ID Format | Period Start | Period End | Boundary Handling |
| :--- | :--- | :--- | :--- | :--- |
| **Monthly** | `YYYY-MM` (e.g. `2026-03`) | 1st day of month (`date(Y, M, 1)`) | Last day of month (`monthrange`) | Natural calendar boundary across Dec-to-Jan |
| **Weekly** | `YYYY-Www` (e.g. `2026-W47`) | Monday (`fromisocalendar(Y, W, 1)`) | Sunday (`fromisocalendar(Y, W, 7)`) | Standard ISO 8601 calendar convention |

#### ISO Year Boundary Note:
The ISO week-year can differ from the Gregorian calendar year for dates near January 1. For example, `2026-01-01` is Thursday of `2026-W01`, which begins on Monday `2025-12-29`. The engine rigorously applies `datetime.isocalendar()` and `date.fromisocalendar()` without custom calendar heuristics.

---

### 4. Financial Classification Policy

The time-series engine enforces identical classification invariants to Phase 2:

* **Categorized Business Revenue**:
  $$\text{Revenue} = \sum \text{Amount} \quad \forall \; (\text{Direction} = \text{CREDIT} \land \text{Category} = \text{REVENUE})$$
* **Categorized Operating Expenses (OpEx)**:
  $$\text{OpEx} = \sum \text{Amount} \quad \forall \; (\text{Direction} = \text{DEBIT} \land \text{Category} \in \{\text{SUPPLIER\_PAYMENT}, \text{RENT}, \text{UTILITY}, \text{SALARY}\})$$
* **Observed Debt Repayments**:
  $$\text{Repayments} = \sum \text{Amount} \quad \forall \; (\text{Direction} = \text{DEBIT} \land \text{Category} = \text{LOAN\_REPAYMENT})$$
* **Observed Net Cash Flow**:
  $$\text{Net Cash Flow} = \text{Total Observed Credits} - \text{Total Observed Debits}$$
* **Operating Cash Surplus Proxy**:
  $$\text{Operating Surplus Proxy} = \text{Categorized Revenue} - \text{Categorized OpEx}$$
* **Non-Revenue Credits**: Personal capital injections, loan disbursals, and unclassified credits are isolated in `uncategorized_credit_total`.
* **Non-Operating Debits**: Personal drawings, asset purchases, and unclassified debits are isolated in `uncategorized_debit_total`.

---

### 5. Statement Coverage Statuses & Semantics

| Status Code | Definition | Implications for Underwriting |
| :--- | :--- | :--- |
| `COMPLETE` | Fully documented, verified bank statement interval. | Observed transactions reflect true totality of bank feed for that period. |
| `PARTIAL` | Truncated boundary period (e.g. statement starts mid-month). | Observed volumes represent partial calendar period; cannot compare MoM directly. |
| `UNKNOWN` | Statement boundaries unverified; observed bank feed only. | Default status when caller provides no external coverage metadata. |
| `MISSING` | Identified gap in statement continuum with zero transactions. | **Crucial distinction**: Missing bank statement evidence, **not** confirmed zero business revenue. |

---

### 6. Missing-Period Detection & Timeline Continuity

When a multi-month or multi-week dataset contains calendar gaps (e.g., transactions in `2026-01` and `2026-03`, but none in `2026-02`):
1. The engine generates continuous periodic buckets across the full chronological span $[\min(\text{date}), \max(\text{date})]$.
2. The missing period (`2026-02`) is inserted with:
   - `transaction_count = 0`
   - `observed_credit_total = Decimal("0.00")`
   - `observed_debit_total = Decimal("0.00")`
   - `is_missing_period = True`
   - `coverage_status = PeriodCoverageStatus.MISSING` (or `UNKNOWN`)
   - `limitations = "Zero transactions observed; statement coverage unverified. Does not establish verified zero revenue."`
3. Underwriters and automated agents are explicitly warned against treating missing statement periods as evidence of zero revenue or business failure.

---

### 7. Continuity & Stability Metrics (`CashflowContinuitySummary`)

* **Activity Periods**: Count of buckets with $\ge 1$ transaction.
* **Net Cash Flow Polarization**:
  - `positive_net_cashflow_periods`: Count of periods where $\text{Credits} > \text{Debits}$.
  - `negative_net_cashflow_periods`: Count of periods where $\text{Credits} < \text{Debits}$.
* **Consecutive Surplus Run**: Longest streak of consecutive periods with $\text{Operating Surplus Proxy} > 0$.
* **Largest Drawdown Period**: Specific bucket ID and amount where negative net cash flow was deepest.
* **Period-to-Period Growth**: Percentage and absolute change across consecutive periods where prior revenue $> 0$.
* **Revenue Trend Direction**: Evaluates first-half vs second-half revenue momentum (`INCREASING` if $> +10\%$, `DECREASING` if $< -10\%$, `STABLE`, or `INSUFFICIENT_DATA` if $< 3$ periods).

---

### 8. Debt Service & Repayment Observations

* **Historical Cash Outflow Only**:
  Aggregates actual observed DEBIT transactions categorized as `LOAN_REPAYMENT`.
* **Explicit Governance Limits**:
  - Does **NOT** infer remaining principal balance.
  - Does **NOT** calculate remaining tenure or interest rates.
  - Does **NOT** assert undisclosed liabilities.
  - Does **NOT** assume zero future obligations if obligations are unsupplied.

---

### 9. Seasonality Readiness Requirements

Recurring annual seasonality (e.g., Diwali or monsoon demand spikes in Indian MSMEs) requires sufficient historical depth to statistically distinguish seasonal cycles from random shocks or growth trends:
* **Readiness Threshold**: At least **24 continuous, documented complete months** ($\ge 2$ full annual cycles).
* **Fewer than 24 months**: Marked `INSUFFICIENT_HISTORY`.
* **Policy**: The engine provides structured monthly observations with month-of-year tags ($1 \dots 12$), but does **not** manufacture seasonal indices or forecast multipliers on sparse data.

---

### 10. Resilience Engine Handoff Contract (`ResilienceInputResult`)

Downstream resilience simulation modules (e.g., shock testing, liquidity survival buffers) consume the unopinionated output of `prepare_resilience_inputs`:

```python
class ResilienceInputResult(BaseModel):
    business_id: str
    frequency: str                                   # "monthly" or "weekly"
    period_identifiers: List[str]                   # ["2026-01", "2026-02", ...]
    historical_revenue_series: List[Decimal]        # [50000.00, 60000.00, ...]
    historical_opex_series: List[Decimal]           # [30000.00, 35000.00, ...]
    historical_net_cashflow_series: List[Decimal]   # [20000.00, 25000.00, ...]
    historical_operating_surplus_series: List[Decimal] # [20000.00, 25000.00, ...]
    observed_debt_repayment_series: List[Decimal]   # [5000.00, 5000.00, ...]
    known_contractual_obligations: Optional[List[ContractualObligationItem]] # None if unsupplied
    coverage_statuses: List[str]                    # ["COMPLETE", "MISSING", ...]
    missing_period_flags: List[bool]                # [False, True, ...]
    category_limitations: List[str]                 # Accounting caveats
    evidence_references: Dict[str, List[str]]       # Period -> transaction IDs
    handoff_readiness_status: ResilienceHandoffStatus # READY, PARTIAL, INSUFFICIENT_HISTORY
```

#### What the Resilience Module Must NOT Assume:
* Does not assume unsupplied future debt obligations are zero.
* Does not treat missing periods as zero historical revenue.
* Does not treat operating cash surplus as EBITDA or accounting profit.

---

### 11. Cross-Phase Reconciliation

The time-series engine mathematically reconciles against all earlier development phases:

| Metric | Phase 1 (Parser) | Phase 2 (Financial DNA) | Phase 3 (Graph Analyzer) | Phase 4 (Cashflow Series) |
| :--- | :--- | :--- | :--- | :--- |
| **Transaction Count** | `valid_rows` | `tx_count` | `total_dataset_transactions` | `len(unique_txs)` (Exact Match) |
| **Total Inflow** | Sum(Credits) | `cash_flow_activity.total_credits` | `data_coverage.total_dataset_inflow` | `total_observed_credits` (Exact Match) |
| **Total Outflow** | Sum(Debits) | `cash_flow_activity.total_debits` | `data_coverage.total_dataset_outflow` | `total_observed_debits` (Exact Match) |
| **Categorized Revenue** | Sum(Credit+Rev) | `revenue_intelligence.observed_business_revenue` | N/A (Topological focus) | `categorized_business_revenue` (Exact Match) |
| **Categorized OpEx** | Sum(Debit+OpEx) | `operating_expenses.observed_operating_expenses` | N/A (Topological focus) | `categorized_operating_expenses` (Exact Match) |
| **Debt Repayments** | Sum(Debit+Loan) | `debt_repayments.observed_debt_repayments_total` | N/A | `observed_debt_repayments` (Exact Match) |

*(Graph topology totals differ from dataset totals only when unlabelled counterparties are isolated from graph edges, which is explicitly reconciled in `test_31_phase_3_graph_coverage_compatibility`.)*
