# UDYOGA — Financial Intelligence Engine
## Phase 5: Financial Intelligence Integration, Contract Compatibility & End-to-End Testing

### Document Overview
This document specifies the unified end-to-end integration architecture, public orchestration interfaces, cross-module mathematical reconciliation, downstream contract adapters, and verification test specifications for UDYOGA's Financial Intelligence module.

---

### 1. Unified Pipeline Architecture

The Financial Intelligence Engine runs as a sequential, deterministic, single-pass pipeline:

```
[Raw CSV File / Stream / Bytes]
            │
            ▼
┌───────────────────────────────┐
│   Phase 1: Transaction Parser │  (parser.py)
│   - Header aliasing & parsing │
│   - Strict validation & types │
│   - Duplicate deduplication   │
└───────────────┬───────────────┘
                │
                ├─────────────────────────────────────────────┐
                │ [Accepted NormalizedTransaction Records]   │ [Parse Summary & Warnings]
                │                                             │
                ▼                                             ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│  Phase 2: Financial DNA       │             │ Phase 3: Graph Analyzer       │
│  - Categorized Revenue        │             │ - Directed Network (NetworkX) │
│  - Categorized OpEx           │             │ - HHI & Concentration         │
│  - Operating Surplus Proxy    │             │ - Offsetting Round-Trips      │
│  - Monthly CV Volatility      │             │ - Structured Anomaly Flags    │
└───────────────┬───────────────┘             └───────────────┬───────────────┘
                │                                             │
                ├─────────────────────────────────────────────┤
                ▼                                             ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 4: Cashflow Series & Missing Period Continuum         │  (cashflow_series.py)
│ - Monthly Bucketing (YYYY-MM) & Weekly Bucketing (YYYY-Www) │
│ - Detected Statement Gaps (Explicit MISSING buckets)        │
│ - Historical Cash-Flow Continuity Indicators                │
│ - Repayment Extraction & Seasonality Limits                 │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 5: Cross-Module Mathematical Reconciliation           │  (pipeline.py)
│ - 11 Independent Consistency Assertions (Credits, Debits)   │
│ - Traceability & Evidence Integrity Verification            │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│ Downstream Contract Adapters (adapters.py)                  │
│ - UI Waveform (Frontend FinancialAggregatedPayload)         │
│ - Network Graph Visualization (D3 / Cytoscape)              │
│ - Underwriting Dossier (Atharv's Agent Orchestrator)        │
│ - Resilience Input Package (Shock Simulation Engine)        │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. Public Function Signatures

#### Primary Pipeline Orchestrator:
```python
def run_financial_intelligence_pipeline(
    csv_source: Union[str, bytes, Path, TextIOBase],
    *,
    business_id: str = "MSME",
    coverage: Optional[Union[CoverageMetadata, Dict[str, Any]]] = None,
    known_obligations: Optional[Union[List[ContractualObligationItem], List[Dict[str, Any]]]] = None,
    round_trip_window_days: int = 14,
    round_trip_tolerance_percent: float = 5.0,
) -> FinancialIntelligencePipelineResult:
```

#### Downstream Adapters:
```python
def adapt_to_cashflow_waveform(
    monthly_or_weekly_series: CashflowSeriesResult,
) -> List[Dict[str, Any]]:

def adapt_to_graph_visualization(
    graph_result: GraphAnalysisResult,
) -> Dict[str, Any]:

def adapt_to_underwriting_dossier(
    dna_report: Optional[FinancialDnaReport],
    graph_result: Optional[GraphAnalysisResult],
    monthly_series: Optional[CashflowSeriesResult],
) -> Dict[str, Any]:
```

---

### 3. Module Compatibility Matrix

| Module | Public Interface | Accepted Input | Produced Output | Monetary Representation | Downstream Consumer | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Parser** | `parse_transactions` | CSV text, bytes, file path, TextIO | `ParseResult` | `Decimal` | DNA, Graph, Series | **COMPATIBLE** |
| **DNA Engine** | `compute_financial_dna` | `List[NormalizedTransaction]` | `FinancialDnaReport` | `Decimal` | Pipeline, Agent Orchestrator | **COMPATIBLE** |
| **Graph Analyzer** | `build_and_analyze` | `List[NormalizedTransaction]` | `GraphAnalysisResult` | `Decimal` | Pipeline, Network UI | **COMPATIBLE** |
| **Cashflow Series** | `build_cashflow_series` | `List[NormalizedTransaction]` | `CashflowSeriesResult` | `Decimal` | Resilience, UI Waveform | **COMPATIBLE** |
| **Resilience Handoff**| `prepare_resilience_inputs` | `CashflowSeriesResult` | `ResilienceInputResult` | `Decimal` | Resilience Shock Simulator | **COMPATIBLE** |
| **Pipeline** | `run_financial_intelligence_pipeline`| CSV source | `FinancialIntelligencePipelineResult` | `Decimal` / JSON str | Main Application API | **COMPATIBLE** |

---

### 4. Status Definitions & Precedence

The pipeline emits explicit, typed execution statuses (`PipelineExecutionStatus`):

| Status | Precedence | Condition / Meaning |
| :--- | :--- | :--- |
| `INTERNAL_ERROR` | 1 (Highest) | An unhandled exception was caught; pipeline returns structured failure without crashing. |
| `INVALID_INPUT` | 2 | CSV file is empty (0 bytes), unparseable, missing required headers, or 100% of rows rejected. |
| `INSUFFICIENT_DATA`| 3 | Valid CSV headers, but 0 data rows or zero valid financial records. |
| `PARTIAL_SUCCESS` | 4 | Computation succeeded, but data quality warnings exist (sparse data $< 3$ months, detected statement gaps, rejected malformed rows, or reconciliation warnings). |
| `SUCCESS` | 5 (Lowest) | Complete validity, continuous history ($\ge 3$ months), zero missing gaps, all 11 reconciliation checks PASS. |

---

### 5. Cross-Module Mathematical Reconciliation (11 Checks)

The reconciliation engine executes 11 independent assertions across the module boundaries:

1. **`TX_COUNT_CONGRUENCE`**: Accepted parser rows $==$ Sum of transactions in non-missing monthly buckets.
2. **`TOTAL_CREDIT_RECONCILIATION`**: DNA `total_credits` $==$ Monthly cash-flow `total_observed_credits`.
3. **`TOTAL_DEBIT_RECONCILIATION`**: DNA `total_debits` $==$ Monthly cash-flow `total_observed_debits`.
4. **`NET_CASHFLOW_RECONCILIATION`**: DNA `net_observed_cashflow` $==$ Monthly cash-flow `net_observed_cashflow`.
5. **`REVENUE_RECONCILIATION`**: DNA `observed_business_revenue` $==$ Monthly `categorized_business_revenue`.
6. **`OPEX_RECONCILIATION`**: DNA `observed_operating_expenses` $==$ Monthly `categorized_operating_expenses`.
7. **`REPAYMENT_RECONCILIATION`**: DNA `observed_debt_repayments_total` $==$ Monthly `observed_debt_repayments`.
8. **`WEEKLY_MONTHLY_INFLOW_CONGRUENCE`**: Monthly observed credit sum $==$ Weekly observed credit sum.
9. **`WEEKLY_MONTHLY_OUTFLOW_CONGRUENCE`**: Monthly observed debit sum $==$ Weekly observed debit sum.
10. **`GRAPH_VOLUME_BOUNDS`**: Graph-represented volume $\le$ Total dataset transaction volume (bounds unlabelled counterparties).
11. **`EVIDENCE_REFERENCE_INTEGRITY`**: Every transaction ID referenced in monthly buckets or anomaly flags exists in the accepted parsed transaction set.

---

### 6. Safe JSON Serialization Policy

All Pydantic result models implement `.to_dict()`:
* **Monetary Values**: Serialized as string representations (e.g. `"50000.00"`), eliminating binary float rounding errors (`50000.000000000004`).
* **Dates & Timestamps**: Serialized as ISO 8601 strings (`"2026-01-10T10:00:00Z"` or `"2026-01-01"`).
* **Enums**: Converted to their string `.value`.
* **Missing / Inapplicable Fields**: Preserved as `None`/`null` without inventing default zeros.
* **Security & Privacy**: Stack traces, unparsed CSV chunks, and raw private bank remarks are excluded from public serialization.

---

### 7. Downstream Integration Guidance

#### For Atharv (Agent Orchestration & Underwriting):
```python
from app.modules.financial_intelligence import run_financial_intelligence_pipeline, adapt_to_underwriting_dossier

# Run full financial analysis
result = run_financial_intelligence_pipeline(raw_csv_source, business_id=business_id)

# Extract objective evidence dossier for LLM Prompt context
dossier = adapt_to_underwriting_dossier(
    dna_report=result.financial_dna,
    graph_result=result.graph_investigation,
    monthly_series=result.monthly_cashflow_series,
)
```

#### For Resilience Simulation:
```python
# Pass resilience package directly to simulation engine
resilience_inputs = result.resilience_input_package
# Contains: historical_revenue_series, historical_opex_series, missing_period_flags, etc.
```

#### For Frontend Visualization:
```python
from app.modules.financial_intelligence import adapt_to_cashflow_waveform, adapt_to_graph_visualization

# Monthly waveform for financial chart
waveform_points = adapt_to_cashflow_waveform(result.monthly_cashflow_series)

# Network graph nodes & edges for D3 Cytoscape
network_data = adapt_to_graph_visualization(result.graph_investigation)
```

---

### 8. Reproducible Test Execution

To execute the entire Financial Intelligence test suite across all 5 phases:
```powershell
$env:PYTHONPATH="backend"
python -m pytest tests/financial_intelligence -v --tb=short
```
*Current test suite status: **118 passed in 0.88s (100% pass rate)**.*
