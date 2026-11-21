# UDYOGA — PHASE 6 DEMO HANDOFF & INTEGRATION GUIDE
## Financial Intelligence Engine

> **Project:** UDYOGA — Beyond Credit. Beyond Barriers.  
> **Module:** Financial Intelligence Engine (`backend/app/modules/financial_intelligence/`)  
> **Lead Engineer:** Harshitha (Financial Intelligence & Cash-Flow Systems)  
> **Status:** **DEMO-READY & LOCKED** (134/134 Tests Passing, 100% Deterministic)

---

## 1. Module Overview

The Financial Intelligence Engine ingests raw bank statements/CSV files of Indian MSMEs and produces deterministic, explainable, and mathematically reconciled alternative credit intelligence.

Key guarantees:
- **Zero Fabrication:** Never manufactures synthetic transactions, account balances, external debt liabilities, or certified credit scores.
- **Exact Decimal Arithmetic:** Internal accounting uses Python `Decimal` with `ROUND_HALF_UP` to prevent floating-point drift.
- **Cross-Module Mathematical Reconciliation:** Enforces 11 automated assertions guaranteeing that Parser, Financial DNA, Graph Analyzer, and Cash-Flow Series totals reconcile 1-to-1.
- **Explainability & Caveats:** Distinguishes verified transactions from unobserved data gaps and non-assessable patterns.

For detailed architecture and extended schemas, refer to:
- [PHASE2_METRICS.md](file:///C:/Users/harsh/OneDrive/Desktop/acharya/backend/app/modules/financial_intelligence/PHASE2_METRICS.md) (Formulas & Classification Thresholds)
- [PHASE7_FINAL_HANDOFF.md](file:///C:/Users/harsh/OneDrive/Desktop/acharya/backend/app/modules/financial_intelligence/PHASE7_FINAL_HANDOFF.md) (Comprehensive Audit & Specification)
- [PHASE8_FINAL_READINESS.md](file:///C:/Users/harsh/OneDrive/Desktop/acharya/backend/app/modules/financial_intelligence/PHASE8_FINAL_READINESS.md) (Final Readiness & System Contracts)

---

## 2. Actual Public Function Signatures

All core functions are exported from `app.modules.financial_intelligence`:

```python
# 1. Pipeline Orchestrator (Primary entry point)
def run_financial_intelligence_pipeline(
    csv_source: Union[str, bytes, Path, TextIOBase],
    *,
    business_id: str = "MSME",
    coverage: Optional[Union[CoverageMetadata, Dict[str, Any]]] = None,
    known_obligations: Optional[Union[List[ContractualObligationItem], List[Dict[str, Any]]]] = None,
    round_trip_window_days: int = 14,
    round_trip_tolerance_percent: float = 5.0,
) -> FinancialIntelligencePipelineResult: ...

# 2. Phase 1: CSV Parser & Ingestion
def parse_transactions(
    source: Union[str, Path, bytes, TextIOBase],
    encoding: str = "utf-8",
    date_format: Optional[str] = None,
) -> ParseResult: ...

# 3. Phase 2: Financial DNA Engine
def compute_financial_dna(
    transactions: Sequence[NormalizedTransaction],
    business_id: Optional[str] = None,
) -> FinancialDnaReport: ...

# 4. Phase 3: Graph Analyzer & Anomaly Detection
def build_and_analyze(
    transactions: Sequence[NormalizedTransaction],
    observed_business_id: str,
    round_trip_window_days: int = 14,
    round_trip_tolerance_percent: float = 5.0,
    concentration_threshold: float = 0.5,
    short_interval_hours: float = 24.0,
) -> GraphAnalysisResult: ...

# 5. Phase 4: Cash-Flow Series & Resilience Preparation
def build_cashflow_series(
    transactions: Sequence[NormalizedTransaction],
    business_id: str = "MSME",
    frequency: str = "monthly",
    coverage: Optional[Union[CoverageMetadata, Dict[str, Any]]] = None,
) -> CashflowSeriesResult: ...

def prepare_resilience_inputs(
    monthly_series: CashflowSeriesResult,
    known_obligations: Optional[Union[List[ContractualObligationItem], List[Dict[str, Any]]]] = None,
) -> ResilienceInputResult: ...

# 6. Phase 5: Downstream Consumer Adapters
def adapt_to_cashflow_waveform(
    monthly_or_weekly_series: CashflowSeriesResult,
) -> List[Dict[str, Any]]: ...

def adapt_to_graph_visualization(
    graph_result: GraphAnalysisResult,
) -> Dict[str, Any]: ...

def adapt_to_underwriting_dossier(
    dna_report: Optional[FinancialDnaReport],
    graph_result: Optional[GraphAnalysisResult],
    monthly_series: Optional[CashflowSeriesResult],
) -> Dict[str, Any]: ...
```

---

## 3. CSV Input Requirements

The parser ingests file paths (`str`, `Path`), byte buffers (`bytes`), or text streams (`TextIOBase`, `StringIO`).

### Required & Recognized Column Mappings (Case-Insensitive)
- **Transaction ID:** `transaction_id`, `txn_id`, `tx_id`, `reference_no`, `ref_id`
- **Timestamp / Date:** `date`, `txn_date`, `timestamp`, `value_date`, `posting_date` (supports ISO, `DD-MM-YYYY`, `DD/MM/YYYY`)
- **Amount:** `amount`, `txn_amount`, `inr`, `value` (strictly positive `Decimal`)
- **Direction:** `direction`, `type`, `dr_cr`, `credit_debit` (`CREDIT` or `DEBIT`)
- **Category:** `category`, `txn_category`, `purpose`, `tag` (`REVENUE`, `SUPPLIER_PAYMENT`, `RENT`, `UTILITY`, `SALARY`, `LOAN_REPAYMENT`, `PERSONAL`, `OTHER`)
- **Channel:** `channel`, `rail`, `mode`, `payment_channel` (`UPI`, `NEFT`, `RTGS`, `IMPS`, `CASH_DEPOSIT`, `CHEQUE`, `OTHER`)
- **Counterparty (Optional):** `counterparty_id`, `party_id`, `vpa`, `account_no`, `counterparty_name`, `merchant_name`
- **Reference / Notes (Optional):** `narration`, `description`, `remarks`, `note`

---

## 4. Financial DNA Capabilities

Structured across 6 business vitality dimensions:
1. **Cash-Flow Activity:** Total credits, debits, net observed flow, odd/even median transaction amounts, inflow-to-outflow ratio.
2. **Revenue Intelligence:** Verified revenue run-rates, Month-over-Month (MoM) growth rates, isolation of non-revenue credits.
3. **Operating Expenses:** Operational expenditures by category, recurring operational overheads, and `operating_cash_surplus_proxy` (Revenue minus OpEx).
4. **Debt Repayments:** Observed loan repayment transactions (EMIs) without claiming unobserved total debt liability.
5. **Customer Intelligence:** Identifiable buyer volume, Top-1 and Top-3 customer concentration shares, repeat buyer shares, and normalized Customer HHI ($0.0–1.0$).
6. **Supplier Intelligence:** Vendor spend distribution, Top-1 and Top-3 supplier shares, repeat supplier relationships, and normalized Supplier HHI ($0.0–1.0$).

---

## 5. Graph Capabilities & Limitations

- **Topological Analysis:** Constructs bipartite-like ego network around the observed MSME. Identifies high-degree counterparties and volume concentration.
- **Bidirectional Relationship Detection:** Detects two-node reciprocal flows (e.g., supplier returns, trade rebates) without alleging circular trading.
- **Explainable Anomaly Flags:** Rule-based detection of volume spikes, high counterparty concentration, and short-interval round trips. Preserves exact supporting `transaction_id` references.
- **Strict Single-Account Boundary:** Multi-entity circular flows cannot be confirmed from a single entity's statements; marked objectively as `CycleInvestigationStatus.NOT_ASSESSABLE`.

---

## 6. Cash-Flow Outputs & Gap Detection

- **Time-Series Granularity:** Generates both Monthly and ISO 8601 Weekly (`YYYY-Www`) aggregated buckets.
- **Missing Period Detection:** Detects zero-transaction calendar intervals in the statement continuum and flags them as unobserved documentation gaps (`is_missing_period = True`).
- **Seasonality Safeguard:** Annual seasonality decomposition strictly requires $\ge 24$ complete months of continuous data. Shorter series are explicitly gated as `INSUFFICIENT_HISTORY`.

---

## 7. Resilience Handoff

The pipeline produces `result.resilience_input_package` (`ResilienceInputResult`) ready for the downstream simulation engine:
- `historical_revenue_series: List[Decimal]`
- `historical_opex_series: List[Decimal]`
- `historical_net_cashflow_series: List[Decimal]`
- `historical_operating_surplus_series: List[Decimal]`
- `observed_debt_repayment_series: List[Decimal]`
- `known_contractual_obligations: Optional[List[ContractualObligationItem]]`
- `handoff_readiness_status: ResilienceHandoffStatus.READY` (or `LIMITED_COVERAGE`)

---

## 8. Three Synthetic Demo Scenarios

The engine includes 3 pre-built demo scenarios verified in `test_demo_scenarios.py`:

| Scenario | Fixture File | Profile | Key Characteristics | Verified Status |
| :--- | :--- | :--- | :--- | :--- |
| **Scenario A** | `scenario_a_stable_business.csv` | Stable Retail MSME | 6 continuous months, steady revenue (₹580k), OpEx (₹190k), monthly surplus > 0, low volatility ($CV < 0.25$). | `SUCCESS`, Reconciliation: `PASS`, Resilience: `READY` |
| **Scenario B** | `scenario_b_seasonal_business.csv` | Seasonal Textile Trader | 12 months with monsoon lull vs festival surge, high volatility ($CV > 0.40$), seasonality gated at `INSUFFICIENT_HISTORY`. | `SUCCESS`, Reconciliation: `PASS`, Resilience: `READY` |
| **Scenario C** | `scenario_c_limited_evidence.csv` | Sparse / Micro Vendor | Sparse 2-month history, unlabelled counterparties, malformed CSV rows safely isolated. | `PARTIAL_SUCCESS`, Limitations documented |

---

## 9. Test Evidence

The Financial Intelligence suite executes in **1.53s** with zero external dependencies:
- **Command:**
  ```powershell
  $env:PYTHONPATH = "backend"; pytest backend/tests/financial_intelligence -v
  ```
- **Results:**
  - `test_cashflow_series.py`: **35 passed**
  - `test_demo_scenarios.py`: **4 passed**
  - `test_dna_engine.py`: **12 passed**
  - `test_graph_engine.py`: **27 passed**
  - `test_parser.py`: **23 passed**
  - `test_pipeline.py`: **33 passed**
  - **Total:** **134 passed (100% pass rate, 0 failed, 0 skipped)**

---

## 10. Known Limitations & Responsible Disclaimers

1. **Statement Window:** Statements without start/end metadata assume coverage spans observed transaction dates.
2. **Contractual Debt Visibility:** Total future debt obligations cannot be deduced from bank statements alone; callers must provide external loan schedules via `known_obligations`.
3. **Multi-Entity Graph Cycles:** External entity-to-entity transactions are unobservable; marked `NOT_ASSESSABLE`.
4. **No Bureau Credit Scores:** Indicators reflect cash-flow vitality proxies, not certified CIBIL/Experian credit scores.
5. **Surplus Proxy:** Operating cash surplus represents cash receipts minus operational debits, not audited accrual net profit.

---

## 11. Teammate Integration Instructions

### A. FastAPI Backend Route (API Lead)
```python
from fastapi import APIRouter, UploadFile, File
from app.modules.financial_intelligence import run_financial_intelligence_pipeline

router = APIRouter()

@router.post("/api/v1/financial-intelligence/analyze")
async def analyze_statement(file: UploadFile = File(...), business_id: str = "MSME"):
    content = await file.read()
    result = run_financial_intelligence_pipeline(content, business_id=business_id)
    return result.to_dict()  # Pure JSON-safe dictionary
```

### B. Agent Orchestration / Underwriting Committee (Atharv)
```python
from app.modules.financial_intelligence import run_financial_intelligence_pipeline, adapt_to_underwriting_dossier

result = run_financial_intelligence_pipeline(csv_content, business_id="MSME-001")

# Extract objective evidence dossier for prompt injection
dossier = adapt_to_underwriting_dossier(
    result.financial_dna,
    result.graph_investigation,
    result.monthly_cashflow_series,
)
```

### C. Resilience Simulation Engine (Simulation Lead)
```python
# Consume verified historical vectors directly
resilience_inputs = result.resilience_input_package
# Pass resilience_inputs.historical_revenue_series, opex_series, etc., to Monte Carlo shock model
```

### D. Frontend API / Visualizations (Frontend Lead)
```python
from app.modules.financial_intelligence import adapt_to_cashflow_waveform, adapt_to_graph_visualization

waveform_points = adapt_to_cashflow_waveform(result.monthly_cashflow_series)
network_graph = adapt_to_graph_visualization(result.graph_investigation)
```
