# UDYOGA — Financial Intelligence Engine
## Phase 0: Architecture Blueprint, Module Boundaries & Contract Specifications

**Author:** Harshitha (Financial Intelligence Engineering Lead)  
**Project:** UDYOGA — Beyond Credit. Beyond Barriers.  
**Track:** Alternative Credit Intelligence Platform for Credit-Invisible Indian MSMEs  
**Phase:** Phase 0 (Planning, Auditing & Contract Formalization)  
**Working Branch:** `feature/harshitha-finance`  
**Date:** November 2026  

---

## 1. Executive Summary & Foundational Principles

UDYOGA is an agentic, AI-powered alternative credit intelligence platform designed specifically for credit-invisible Micro, Small, and Medium Enterprises (MSMEs) in India. The platform’s primary objective is to evaluate financial behaviors, cash-flow sustainability, counterparty relationship dynamics, and transactional patterns from non-traditional and digital public infrastructure (DPI) data sources (bank statements, UPI merchant QR logs, GSTN filing turnover, and trade ledgers).

### Core Financial Engineering Mandates
1. **Deterministic Financial Math:** Every financial calculation (revenue, expenses, volatility, concentration, cash-flow velocity) must be 100% deterministic, transparent, and independently verifiable with automated tests. **An LLM must never compute, invent, or estimate monetary amounts or core financial ratios.**
2. **Evidence vs. Absence Distinction:** The platform must strictly distinguish between **missing information** (e.g., untracked cash transactions, gaps in statement dates) and **genuinely negative financial evidence** (e.g., bounced auto-debits, sharp revenue decline, severe customer concentration).
3. **No Unwarranted Inferences:**
   - Not every bank credit is business revenue (e.g., personal transfers, inter-account transfers, owner equity infusions).
   - Not every debit is an operational business expense (e.g., proprietor drawings, tax payments, capital investments, debt servicing).
   - An account balance cannot be inferred without an opening balance or verified balance stamp.
   - Undocumented debt cannot be assumed without explicit loan service transactions.
4. **Precision Currency Handling:** All monetary calculations must use exact fixed-point representation (`Decimal` or integer paisa) to avoid IEEE 754 floating-point inaccuracies.
5. **No Hallucinated Fraud Claims:** Observed transaction cycles or supplier concentrations represent structural network patterns, not verified fraud or confirmed illegality. The system must report observable patterns with confidence and structural limitations clearly stated.

---

## 2. Workspace Audit Findings

An exhaustive audit of the project repository at `C:\Users\harsh\OneDrive\Desktop\acharya` was conducted:

| Path / Component | Actual Status | Findings & Notes |
| :--- | :---: | :--- |
| `README.md` (Workspace root) | **Present** | Defines UDYOGA platform governance, main/develop branch model, and 7 project phases. |
| `.gitignore` | **Present** | Covers Python (`.venv`, `__pycache__`, `.pytest_cache`), Node (`node_modules`, `dist`), and environment secrets (`.env`). |
| `frontend/` | **Present** | Fully scaffolded React 19 + TypeScript 5 + Vite 6 application. |
| `frontend/docs/api-contracts.md` | **Present** | Comprehensive TypeScript API contracts authored by Frontend Architect (REST schemas, role-based definitions). |
| `frontend/docs/mock-data-specification.md` | **Present** | Detailed specs for 7 MSME personas (e.g., Ramesh Kumar / Sri Balaji Provisions). |
| `frontend/src/types/index.ts` | **Present** | Production TypeScript interfaces for business profiles, bank summaries, UPI summaries, and ACIE reports. |
| `backend/README.md` | **Present** | Outlines architectural boundaries: Auth/RBAC, ACIE engine, Data Ingestion Rails, DPDP compliance. |
| `backend/app/` | **Missing** | Not yet scaffolded. Needs structure for schemas, modules, and API routers. |
| `backend/app/schemas/` | **Missing** | Shared Pydantic schemas do not exist yet on backend. Contracts exist only in frontend TypeScript docs. |
| `backend/app/modules/` | **Missing** | Module directory needs to be created. |
| `backend/pyproject.toml` / `requirements.txt` | **Missing** | No backend Python dependency specification has been committed yet. |
| `backend/tests/` | **Missing** | No backend automated test suite exists currently. |

---

## 3. Module Boundaries & Engineering Ownership

### Harshitha's Ownership Scope
The Financial Intelligence Engine resides exclusively in:
```
backend/app/modules/financial_intelligence/
```

### Module Structure
```
backend/app/modules/financial_intelligence/
├── __init__.py
├── parser.py              # CSV ingestion, data sanitization, schema normalization, and validation reporting
├── dna_engine.py          # Deterministic Business Financial DNA metrics, concentration, and volatility indicators
├── graph_analyzer.py      # NetworkX-based counterparty graph analysis, topology metrics, and structural flags
├── cashflow_series.py     # Normalized weekly and monthly cash-flow time-series aggregation for resilience modeling
└── PHASE0_PLAN.md         # This master blueprint document
```

### Testing Structure
```
backend/tests/financial_intelligence/
├── __init__.py
├── conftest.py                   # Pytest fixtures: synthetic CSV streams, mock transaction batches
├── test_parser.py                # CSV ingestion, delimiter handling, malformed rows, duplicate ID tracking
├── test_dna_engine.py            # Financial DNA calculations, zero-division guards, concentration HHI
├── test_graph_analyzer.py        # Network topology, star network validation, counterparty weight distribution
└── test_cashflow_series.py       # Weekly/monthly time-series grouping, debt separation, missing period flagging
```

### Upstream & Downstream Integration Boundaries
- **Upstream (Input):** Raw CSV/JSON transaction streams from synthetic generation scripts, Sahamati AA adapters, or direct document uploads.
- **Downstream (Consumers):**
  - **Cash-Flow Resilience Engine:** Consumes normalized weekly/monthly series from `cashflow_series.py` for stress testing.
  - **Alternative Credit Intelligence Engine (ACIE):** Consumes deterministic metrics from `dna_engine.py` and graph indicators from `graph_analyzer.py` to compute explainable vitality assessments and SHAP drivers.
  - **Agentic Orchestrator:** Reads structured financial indicators to draft evidence-backed financing summaries.
- **Strict Exclusions from Ownership:**
  - Frontend React components / UI views.
  - LLM prompt engineering / agent conversation loops.
  - Final credit underwriting sanctions or loan approval decisions.
  - Evidence confidence scoring algorithms owned by teammates.
  - Synthetic data generation pipelines.

---

## 4. Shared Data Contract Specifications

Because shared backend Pydantic schemas do not yet exist, the Financial Intelligence Engine defines its internal domain contracts locally using strict Pydantic v2 schemas. These align with the TypeScript definitions in `frontend/docs/api-contracts.md` and establish the standard for future shared schema adoption.

```python
from datetime import datetime, date
from decimal import Decimal
from enum import Enum
from typing import Optional, List, Dict, Any, Set
from pydantic import BaseModel, Field, field_validator, model_validator


class TransactionDirection(str, Enum):
    CREDIT = "CREDIT"
    DEBIT = "DEBIT"


class TransactionChannel(str, Enum):
    UPI = "UPI"
    NEFT = "NEFT"
    RTGS = "RTGS"
    IMPS = "IMPS"
    CASH_DEPOSIT = "CASH_DEPOSIT"
    CHEQUE = "CHEQUE"
    OTHER = "OTHER"


class TransactionCategory(str, Enum):
    REVENUE = "REVENUE"
    SUPPLIER_PAYMENT = "SUPPLIER_PAYMENT"
    RENT = "RENT"
    UTILITY = "UTILITY"
    SALARY = "SALARY"
    LOAN_REPAYMENT = "LOAN_REPAYMENT"
    PERSONAL = "PERSONAL"
    OTHER = "OTHER"


class NormalizedTransaction(BaseModel):
    transaction_id: str = Field(..., description="Unique alphanumeric identifier of the transaction")
    timestamp: datetime = Field(..., description="Exact ISO 8601 timestamp of transaction settlement")
    amount: Decimal = Field(..., gt=Decimal("0.00"), description="Positive settlement amount in INR")
    direction: TransactionDirection = Field(..., description="CREDIT (inflow) or DEBIT (outflow)")
    channel: TransactionChannel = Field(default=TransactionChannel.OTHER, description="Payment channel rail")
    counterparty_id: Optional[str] = Field(default=None, description="Anonymized or raw counterparty ID")
    counterparty_name: Optional[str] = Field(default=None, description="Reported entity or merchant name")
    category: TransactionCategory = Field(default=TransactionCategory.OTHER, description="Classified financial purpose")
    reference_note: Optional[str] = Field(default=None, description="Narration, remarks or UTR note")
    recurring: Optional[bool] = Field(default=False, description="Flag indicating detected or stated periodic pattern")

    class Config:
        frozen = True
        json_encoders = {Decimal: lambda v: str(v)}
```

---

## 5. Module Contract: Transaction Parser (`parser.py`)

### Public Signature
```python
def parse_transactions(source: Union[str, Path, TextIO, bytes]) -> ParseResult:
    """
    Ingests and normalizes tabular transaction data from CSV or structured text.
    
    Guarantees:
    - Never raises unhandled exceptions on malformed rows.
    - Zero data loss: every invalid row is captured with diagnostic context.
    - Currency values are converted to exact Decimal instances.
    - Duplicate transaction IDs are quarantined and reported explicitly.
    """
```

### Parser Output Contract
```python
class ParseError(BaseModel):
    row_number: int
    field: Optional[str]
    raw_value: Optional[str]
    error_type: str
    message: str


class ParseWarning(BaseModel):
    row_number: int
    field: Optional[str]
    message: str


class ParseResult(BaseModel):
    normalized_transactions: List[NormalizedTransaction]
    total_rows: int
    valid_rows: int
    invalid_rows: int
    duplicate_rows: int
    validation_warnings: List[ParseWarning]
    validation_errors: List[ParseError]
    date_range_start: Optional[date]
    date_range_end: Optional[date]
```

### Input Field Mapping & Parsing Rules
1. **Header Flexibility:** Recognizes standard aliases (e.g., `TxnID`, `Transaction ID`, `Ref No` $\rightarrow$ `transaction_id`; `Date`, `Txn Date`, `Timestamp` $\rightarrow$ `timestamp`; `Amount`, `Txn Amount`, `INR` $\rightarrow$ `amount`; `Type`, `Dr/Cr`, `Direction` $\rightarrow$ `direction`).
2. **Timestamp Parsing:** Supports ISO 8601 (`YYYY-MM-DDTHH:MM:SS`, `YYYY-MM-DD`), standard Indian banking representations (`DD/MM/YYYY`, `DD-MM-YYYY`, `DD/MM/YYYY HH:MM:SS`), and auto-normalizes timezone to UTC/IST.
3. **Amount Normalization:** Strips currency symbols (`₹`, `Rs.`, `INR`), commas (`,`), and trailing whitespace. Validates that value is strictly positive ($> 0.00$). If a negative amount is provided, the parser rejects it or maps negative credit to debit if direction column is absent.
4. **Duplicate Quarantining:** Tracks all seen `transaction_id`s in a hash set. The first occurrence is preserved; subsequent occurrences are marked in `duplicate_rows` and appended to `validation_warnings` with row references to prevent double-counting.
5. **Missing Value Strategy:**
   - Missing `transaction_id`: System generates a deterministic synthetic hash `SYN-TXN-<row_hash>` and logs a warning.
   - Missing `direction`: Emits a validation error; row is marked invalid.
   - Missing `counterparty_id`: Handled gracefully as `None`; does not invalidate the row.
   - Unknown `category`: Gracefully falls back to `TransactionCategory.OTHER`.

---

## 6. Module Contract: Deterministic Business Financial DNA Engine (`dna_engine.py`)

### Public Signature
```python
def compute_financial_dna(
    transactions: List[NormalizedTransaction],
    business_id: Optional[str] = None
) -> FinancialDnaReport:
    """
    Computes deterministic financial pattern indicators from normalized transactions.
    
    Guarantees:
    - Pure functional deterministic computation (identical input -> identical output).
    - Zero division safety on all ratios (fallback to 0.0 or explicit None).
    - Clear data sufficiency gating (e.g. Seasonality requires >= 12 months).
    """
```

### Detailed Metrics Specification

| Metric Name | Formula / Computation | Inputs Required | Unit | Data Sufficiency Requirement | Edge Case Handling |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Total Inflow (Credits)** | $\sum \text{amount for CREDIT}$ | `amount`, `direction` | INR (`Decimal`) | $\ge 1$ transaction | Returns `0.00` if no credits observed |
| **Total Outflow (Debits)** | $\sum \text{amount for DEBIT}$ | `amount`, `direction` | INR (`Decimal`) | $\ge 1$ transaction | Returns `0.00` if no debits observed |
| **Identified Revenue** | $\sum \text{amount for CREDIT where category} = \text{REVENUE}$ | `amount`, `direction`, `category` | INR (`Decimal`) | $\ge 1$ transaction | Returns `0.00` if no categorized revenue |
| **Operating Expenses (OpEx)** | $\sum \text{amount for DEBIT where category} \in \{\text{SUPPLIER}, \text{RENT}, \text{UTILITY}, \text{SALARY}\}$ | `amount`, `direction`, `category` | INR (`Decimal`) | $\ge 1$ transaction | Returns `0.00` if no operational debits |
| **Net Operational Cash Flow** | $\text{Identified Revenue} - \text{Operating Expenses}$ | Computed revenue & OpEx | INR (`Decimal`) | $\ge 1$ transaction | Can be negative; handled cleanly |
| **Revenue Volatility (CV)** | $\text{CV} = \frac{\sigma_{\text{monthly}}}{\mu_{\text{monthly}}}$ | Monthly aggregated revenue | Ratio ($0.0 - \infty$) | $\ge 3$ active calendar months | If $\mu = 0$ or months $< 3$, returns `None` with `INSUFFICIENT_DATA` flag |
| **Weekly Cash-Flow Consistency** | Active transaction days per week & std dev of weekly net flows | `timestamp`, `amount`, `direction` | Ratio ($0.0 - 1.0$) & INR | $\ge 4$ calendar weeks | Returns `0.0` if days $< 7$ |
| **Customer Concentration (HHI)** | $\sum_{i=1}^N s_i^2$ where $s_i = \frac{\text{revenue from customer}_i}{\text{total revenue}}$ | `counterparty_id`, `amount`, `category` | Index ($0 - 10,000$) | $\ge 5$ revenue transactions with counterparties | If counterparties missing, calculates on known share and flags missing evidence ratio |
| **Top-1 / Top-3 Customer Share** | $\frac{\sum_{i=1}^k \text{revenue}_i}{\text{total revenue}}$ ($k=1, 3$) | `counterparty_id`, `amount` | Percentage ($0.0 - 1.0$) | $\ge 1$ revenue transaction | If 1 customer, Top-1 is `1.0` (100%) |
| **Supplier Concentration (HHI)** | $\sum_{j=1}^M s_j^2$ where $s_j = \frac{\text{spend to supplier}_j}{\text{total OpEx}}$ | `counterparty_id`, `amount`, `category` | Index ($0 - 10,000$) | $\ge 3$ supplier debits | Returns `0` if no suppliers identified |
| **Repeat Customer Revenue Ratio** | $\frac{\text{Revenue from customers with } \ge 2 \text{ txns}}{\text{Total Identified Revenue}}$ | `counterparty_id`, `amount`, `category` | Percentage ($0.0 - 1.0$) | $\ge 5$ revenue transactions | Returns `0.0` if no identified repeat buyers |
| **Seasonality Index** | Monthly revenue compared against 12-month rolling average | `timestamp`, `amount`, `category` | Monthly ratios | $\ge 12$ consecutive months | If $< 12$ months, returns `None` and `seasonality_assessable: False` |
| **Data Completeness & Activity Coverage** | $\frac{\text{Active Days with Txns}}{\text{Total Days in Statement Window}}$ | `timestamp` | Percentage ($0.0 - 1.0$) | $\ge 1$ transaction | Exact ratio of trading activity density |

### Financial DNA Report Schema
```python
class ConcentrationMetrics(BaseModel):
    hhi_index: float = Field(..., description="Herfindahl-Hirschman Index (0-10000)")
    top_1_share: float = Field(..., description="Share of top entity (0.0 - 1.0)")
    top_3_share: float = Field(..., description="Combined share of top 3 entities (0.0 - 1.0)")
    known_counterparty_coverage: float = Field(..., description="Share of volume with identifiable IDs")


class FinancialDnaReport(BaseModel):
    business_id: Optional[str]
    total_credits: Decimal
    total_debits: Decimal
    identified_revenue: Decimal
    operating_expenses: Decimal
    net_operating_cashflow: Decimal
    net_overall_cashflow: Decimal
    revenue_volatility_cv: Optional[float]
    weekly_consistency_score: Optional[float]
    customer_concentration: ConcentrationMetrics
    supplier_concentration: ConcentrationMetrics
    repeat_customer_revenue_ratio: Optional[float]
    seasonality_assessable: bool
    seasonality_notes: Optional[str]
    observation_days: int
    active_days: int
    activity_density: float
    statement_start_date: Optional[date]
    statement_end_date: Optional[date]
    non_revenue_credit_ratio: float = Field(..., description="Ratio of credits not categorized as business revenue")
```

---

## 7. Module Contract: Counterparty Graph Investigation (`graph_analyzer.py`)

### Public Signature
```python
def analyze_counterparty_network(
    transactions: List[NormalizedTransaction],
    target_business_id: str = "MSME_ROOT"
) -> NetworkInvestigationReport:
    """
    Constructs a directed transaction network to analyze counterparty risk,
    exposure concentration, and circular transaction candidates.
    
    Critical Structural Limitations:
    - A single statement only reveals transactions between MSME_ROOT and external nodes.
    - External-to-external edges MUST NEVER be invented.
    - Potential cycle flags are structural indicators, NOT proof of fraud.
    """
```

### Graph Construction Strategy
- **Graph Type:** `networkx.DiGraph` (Directed Graph) where:
  - Central Node: `target_business_id` (representing the primary MSME).
  - Peripheral Nodes: Unique `counterparty_id`s.
  - Directed Edges:
    - $\text{Counterparty} \xrightarrow{\text{CREDIT}} \text{MSME\_ROOT}$ (Inflow / Customer)
    - $\text{MSME\_ROOT} \xrightarrow{\text{DEBIT}} \text{Counterparty}$ (Outflow / Supplier)
  - Edge Attributes: `total_volume` (`Decimal`), `transaction_count` (`int`), `channels` (`Set[str]`), `first_seen` (`datetime`), `last_seen` (`datetime`).

### Graph Metrics & Structural Indicators
1. **Network Centrality & Node Counts:**
   - In-degree (Unique paying customers) and Out-degree (Unique paid suppliers/vendors).
   - Reciprocal Counterparties: Entities that both send and receive funds to/from `MSME_ROOT`.
2. **Circular Transfer Analysis (Cycle Gating):**
   - **Single Statement Reality:** In a single bank statement, a cycle $\text{MSME} \rightarrow \text{Entity A} \rightarrow \text{MSME}$ can only appear as reciprocal transfers between the business and Entity A.
   - If only 1 account statement is provided, true multi-party cycles ($\text{MSME} \rightarrow A \rightarrow B \rightarrow \text{MSME}$) are structurally impossible to observe without external ledger data.
   - **Contract Rule:** The module explicitly sets `multi_node_cycle_assessable = False` unless multi-entity statements are provided.
   - If reciprocal transfers exist with matched velocity (e.g. ₹5,00,000 sent to Entity A and ₹4,95,000 received from Entity A within 48 hours), it is flagged as `RECIPROCAL_FLOW_ALERT` (Structural Pattern), with severity `INFO` or `WARNING`, strictly accompanied by the disclaimer: *"Observed transfer symmetry; requires commercial invoice verification."*

### Graph Report Schema
```python
class CounterpartyNodeSummary(BaseModel):
    counterparty_id: str
    counterparty_name: Optional[str]
    inflow_from_entity: Decimal
    outflow_to_entity: Decimal
    transaction_count: int
    is_reciprocal: bool
    velocity_days: int


class NetworkInvestigationReport(BaseModel):
    total_nodes: int
    total_edges: int
    unique_customers: int
    unique_suppliers: int
    reciprocal_counterparties_count: int
    top_counterparties: List[CounterpartyNodeSummary]
    multi_node_cycle_assessable: bool
    structural_anomaly_flags: List[Dict[str, Any]]
    network_density: float
    visibility_disclaimer: str = (
        "Network topology is restricted to observed statement counterparties. "
        "External transfers between third parties cannot be inferred."
    )
```

---

## 8. Module Contract: Cash-Flow Series Handoff (`cashflow_series.py`)

### Public Signature
```python
def generate_cashflow_series(
    transactions: List[NormalizedTransaction],
    interval: str = "MONTHLY"  # "MONTHLY" or "WEEKLY"
) -> CashFlowSeriesHandoff:
    """
    Transforms normalized transactions into structured periodic time-series
    buckets consumed by the downstream Cash-Flow Resilience Engine.
    """
```

### Time-Series Bucket Specification
```python
class CashFlowBucket(BaseModel):
    period_key: str = Field(..., description="e.g. '2026-M03' or '2026-W11'")
    period_start: date
    period_end: date
    observed_revenue: Decimal = Field(default=Decimal("0.00"))
    observed_opex: Decimal = Field(default=Decimal("0.00"))
    net_operating_cashflow: Decimal = Field(default=Decimal("0.00"))
    total_inflow: Decimal = Field(default=Decimal("0.00"))
    total_outflow: Decimal = Field(default=Decimal("0.00"))
    net_total_cashflow: Decimal = Field(default=Decimal("0.00"))
    debt_service_outflows: Decimal = Field(default=Decimal("0.00"), description="Explicit loan EMI/interest payments")
    transaction_count: int = 0
    active_days_count: int = 0
    is_complete_period: bool = Field(..., description="False if statement starts/ends mid-period")
    data_missing_flag: bool = Field(default=False, description="True if expected period has zero recorded records")


class CashFlowSeriesHandoff(BaseModel):
    business_id: Optional[str]
    granularity: str  # "MONTHLY" | "WEEKLY"
    series: List[CashFlowBucket]
    total_periods: int
    complete_periods: int
    unobserved_periods_count: int
    average_monthly_revenue: Decimal
    average_monthly_opex: Decimal
    average_monthly_net_cashflow: Decimal
    reconciliation_notes: List[str]
```

### Time-Series Boundary Logic
1. **Calendar Alignment:**
   - Monthly intervals span 1st of month to last day of month.
   - Weekly intervals span Monday to Sunday (ISO week calendar).
2. **First / Last Period Completeness:**
   - If transactions begin on 18-March-2026, the bucket `2026-M03` is marked `is_complete_period: False`.
   - Prevents downstream simulation engines from misinterpreting a partial month as a 50% revenue crash.
3. **Empty Period Identification:**
   - If the statement spans Jan 2026 to Jun 2026, but March has zero transactions, the bucket `2026-M03` is emitted with `data_missing_flag: True` and amounts `0.00`.
   - The engine explicitly annotates: *"Period contains zero observed transactions; requires gap verification."*

---

## 9. Comprehensive Testing Plan (`pytest`)

A robust suite of automated tests will be authored in `backend/tests/financial_intelligence/`:

### Test Matrix
1. **Parser Unit Tests (`test_parser.py`):**
   - `test_parse_valid_standard_csv`: Ingestion of full valid synthetic bank statement.
   - `test_parse_empty_csv_raises_or_reports`: Empty file returns clean 0-row `ParseResult` with warning.
   - `test_parse_missing_required_headers`: Missing `amount` or `direction` flags validation error.
   - `test_parse_invalid_date_formats`: Handles corrupt dates without crashing.
   - `test_parse_negative_and_zero_amounts`: Ensures amounts $\le 0$ are quarantined.
   - `test_parse_duplicate_transaction_ids`: Quarantines duplicate ID, processes unique ones.
   - `test_parse_currency_symbols_and_formatting`: Cleans `₹ 1,50,000.00` to `Decimal('150000.00')`.
   - `test_parse_unknown_categories_and_channels`: Fallback to `OTHER` without throwing.
   - `test_parse_missing_counterparty_graceful`: `None` counterparty accepted without row rejection.

2. **DNA Engine Unit Tests (`test_dna_engine.py`):**
   - `test_dna_revenue_vs_total_credits`: Verifies personal transfer credits excluded from business revenue.
   - `test_dna_opex_categorization`: Ensures only operational categories count towards OpEx.
   - `test_dna_zero_credits_zero_debits`: Verifies zero-division safety and default decimal returns.
   - `test_dna_volatility_insufficient_data`: Gated to `None` if $<3$ calendar months.
   - `test_dna_customer_concentration_hhi`: Mathematical verification against known HHI distribution.
   - `test_dna_single_customer_edge_case`: Top-1 share equals 1.0, HHI equals 10,000.
   - `test_dna_seasonality_gating`: Returns `seasonality_assessable: False` when data $<12$ months.
   - `test_dna_activity_density`: Verifies exact count of active transaction dates vs window duration.

3. **Graph Analyzer Unit Tests (`test_graph_analyzer.py`):**
   - `test_graph_construction_star_topology`: Target business at root, directed in/out edges verified.
   - `test_graph_counterparty_aggregation`: Multiple transactions with same entity aggregate volume and count.
   - `test_graph_reciprocal_flow_detection`: Bi-directional cash flows flagged with `RECIPROCAL_FLOW_ALERT`.
   - `test_graph_no_fabricated_edges`: Confirms 0 edges between external nodes in single statement.
   - `test_graph_cycle_assessability_false`: Multi-node cycles flagged `multi_node_cycle_assessable: False`.

4. **Cash-Flow Series Unit Tests (`test_cashflow_series.py`):**
   - `test_series_monthly_aggregation`: Exact summation across 3 distinct months.
   - `test_series_weekly_aggregation`: ISO calendar week boundary compliance.
   - `test_series_partial_period_marking`: First and last partial periods marked `is_complete_period: False`.
   - `test_series_missing_period_detection`: Gap month explicitly generated with `data_missing_flag: True`.
   - `test_series_debt_service_isolation`: Loan repayment categories separated from operational expenses.

---

## 10. Integration Dependencies & Open Design Decisions

### Dependencies Required
- Standard Library: `csv`, `datetime`, `decimal`, `typing`, `math`, `collections`, `pathlib`, `hashlib`.
- External Libraries (Minimal & Proven):
  - `pydantic >= 2.6.0`: Strict typed domain contracts and validation.
  - `networkx >= 3.2.0`: Deterministic in-memory graph construction and topology algorithms.
  - `pytest >= 8.0.0`: Comprehensive test runner.

### Open Architectural Decisions for Teammate Alignment
1. **Shared Schema Location:** Once the technical lead establishes `backend/app/schemas/`, these contracts will be harmonized into `app/schemas/financial.py` and `app/schemas/transaction.py`.
2. **Currency Precision Storage:** Recommendation to store all monetary values as `Decimal` strings or integer paisa in SQLite/PostgreSQL to prevent float rounding bugs.
3. **Counterparty ID Standardization:** Need to align with synthetic data lead on whether UPI VPA hashes (`VPA-****@upi`) or GSTINs will serve as canonical counterparty keys.

---

## 11. Phase 1 Implementation Sequence

Following approval of Phase 0, Phase 1 will be executed in the following strict order:
1. **Step 1:** Implement `NormalizedTransaction` and parsing schemas in `parser.py`.
2. **Step 2:** Implement `parse_transactions()` with comprehensive regex/delimiter sanitization and tests.
3. **Step 3:** Implement `dna_engine.py` with deterministic formulas, concentration HHI, and zero-division guards.
4. **Step 4:** Implement `graph_analyzer.py` using NetworkX for directed counterparty topology and reciprocal detection.
5. **Step 5:** Implement `cashflow_series.py` generating monthly and weekly handoff buckets.
6. **Step 6:** Run full unit test suite with 100% passing coverage on synthetic test datasets.
