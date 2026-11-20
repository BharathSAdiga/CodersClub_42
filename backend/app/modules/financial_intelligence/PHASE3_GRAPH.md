# UDYOGA — Financial Intelligence Engine
## Phase 3: Transaction Graph Intelligence, Network Analysis & Explainable Anomaly Investigation

### Document Overview
This document specifies the technical architecture, mathematical definitions, data integrity rules, and integration contracts for the **Transaction Graph Intelligence Engine** (`graph_analyzer.py`) within UDYOGA's Financial Intelligence module.

---

### 1. Public Function Signatures

The primary public entrypoint is `build_and_analyze`:

```python
def build_and_analyze(
    transactions: Union[List[NormalizedTransaction], ParseResult, Any],
    *,
    business_id: str = "MSME",
    round_trip_window_days: int = 14,
    round_trip_tolerance_percent: float = 5.0,
    concentration_threshold: float = 0.40,
    short_interval_hours: float = 24.0,
) -> GraphAnalysisResult:
```

#### Parameter Specifications:
* `transactions`: Normalized records from Phase 1 (`List[NormalizedTransaction]`, `ParseResult`, or dictionaries).
* `business_id`: Stable alphanumeric identifier for the analyzed enterprise (default: `"MSME"`).
* `round_trip_window_days`: Observation window for matching potentially offsetting bidirectional transfers (default: `14` days).
* `round_trip_tolerance_percent`: Percentage tolerance between credit and debit amounts for round-trip pairing (default: `5.0`%).
* `concentration_threshold`: Counterparty volume share threshold triggering concentration anomaly flags (default: `0.40` or 40%).
* `short_interval_hours`: Maximum hours between consecutive transfers to flag high-frequency bursts (default: `24.0` hours).

---

### 2. Input Transaction Assumptions & Normalization
* **Immutability & Types**: Consumes Pydantic `NormalizedTransaction` records where `amount` is strictly `Decimal`, `timestamp` is standard Python `datetime`, and `direction` is `CREDIT` or `DEBIT`.
* **Deduplication**: Input transactions with duplicate `transaction_id` references are safely deduplicated, preserving the first chronological record.
* **Deterministic Sorting**: Transactions are pre-sorted by `(timestamp, transaction_id)` prior to graph construction and temporal matching.

---

### 3. Graph Node & Edge Data Model

The graph is constructed as a directed network using **NetworkX** (`networkx.DiGraph`).

#### Node Schema (`GraphNode`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `node_id` | `str` | Namespaced identifier (`BIZ:{business_id}` or `CP:{counterparty_id}`) |
| `raw_entity_id` | `str` | Original entity identifier |
| `node_type` | `NodeType` | `BUSINESS` (central MSME) or `COUNTERPARTY` |
| `display_label` | `str` | Human-readable label (counterparty name or sanitized ID) |
| `observed_transaction_count` | `int` | Total transactions involving this node |
| `observed_credit_amount` | `Decimal` | Total inflow to MSME involving this node |
| `observed_debit_amount` | `Decimal` | Total outflow from MSME involving this node |

#### Edge Schema (`GraphEdge`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `source` | `str` | Source node ID |
| `target` | `str` | Target node ID |
| `direction_type` | `str` | `INCOMING_TO_MSME` or `OUTGOING_FROM_MSME` |
| `transaction_count` | `int` | Number of individual transactions aggregated on edge |
| `total_amount` | `Decimal` | Exact monetary sum of aggregated transactions |
| `transaction_ids` | `List[str]` | References to supporting transaction IDs |
| `first_observed_timestamp` | `datetime` | Earliest transaction timestamp on this directed edge |
| `last_observed_timestamp` | `datetime` | Latest transaction timestamp on this directed edge |
| `relevant_categories` | `List[str]` | Sorted unique operational categories |

---

### 4. Direction Conventions & Invariants

UDYOGA models transactions from a **single-business bank statement view**:
* **CREDIT (Inflow)**: Money moves from the customer/payer into the business.
  $$\text{Counterparty} \longrightarrow \text{MSME}$$
* **DEBIT (Outflow)**: Money moves from the business to the supplier/payee.
  $$\text{MSME} \longrightarrow \text{Counterparty}$$

#### Absolute Integrity Restrictions:
1. **No External Transfer Fabrication**: Transfers between external entities ($\text{Counterparty}_A \longrightarrow \text{Counterparty}_B$) are **never** manufactured.
2. **Namespace Collision Prevention**: Even if a counterparty has identifier `"MSME"` identical to `business_id`, nodes are namespaced as `BIZ:MSME` and `CP:MSME`, strictly preventing self-loops or entity merging.
3. **No Unidentified Entity Clustering**: Transactions with missing counterparty IDs are **not** collapsed into a single fictional "UNKNOWN" node. They are excluded from graph topology and accounted for in `data_coverage`.

---

### 5. Edge Aggregation Rules
When multiple transactions occur between the business and a counterparty in the same direction:
* Exactly **one directed edge** represents that relationship.
* `total_amount = \sum \text{amount}_i` using exact `Decimal` addition.
* `transaction_count = N`.
* `first_observed_timestamp = \min(timestamp_i)`.
* `last_observed_timestamp = \max(timestamp_i)`.
* If a counterparty has both credits and debits, **two distinct opposing directed edges** are created, reflecting bidirectional activity.

---

### 6. Counterparty Coverage Calculations

Single-statement accounting requires transparent visibility into how much transaction volume carries identifiable counterparties:

$$\text{Coverage Ratio} = \frac{\text{Graph Represented Volume}}{\text{Total Dataset Volume}}$$

* `graph_represented_transactions`: Count of transactions with non-empty counterparty IDs.
* `unrepresented_transactions_missing_counterparty`: Transactions with null/empty counterparty IDs.
* If coverage is below $50\%$, status is marked `LIMITED`; if below $80\%$, status is marked `PARTIAL`; otherwise `ADEQUATE`.

---

### 7. Concentration Formulas & Herfindahl-Hirschman Index (HHI)

Concentration is evaluated over **identifiable counterparty volume only** to avoid distortions from unlabelled cash transactions:

#### Herfindahl-Hirschman Index (HHI):
$$\text{HHI}_{\text{inflow}} = \sum_{i=1}^{K} \left(\frac{\text{Amount}_{i,\text{credit}}}{\text{Total Identifiable Credits}}\right)^2 \quad \in [0.0, 1.0]$$

$$\text{HHI}_{\text{outflow}} = \sum_{j=1}^{M} \left(\frac{\text{Amount}_{j,\text{debit}}}{\text{Total Identifiable Debits}}\right)^2 \quad \in [0.0, 1.0]$$

* **Top Counterparty Share**: $\frac{\max(\text{Amount}_i)}{\text{Total Flow}}$
* **Top-3 Counterparty Share**: $\frac{\sum_{i=1}^3 \text{Amount}_i}{\text{Total Flow}}$
* **Zero-Volume Safety**: When total identifiable volume is zero, HHI and shares strictly return `0.0` without division errors.

---

### 8. Round-Trip (Offsetting Transfer) Heuristic

A potentially offsetting transfer occurs when the business exchanges reciprocal flows of comparable magnitude with the same entity within a defined temporal window:

#### Matching Logic:
1. Identify all counterparties with **bidirectional activity** ($\text{Inflow} > 0 \land \text{Outflow} > 0$).
2. For each bidirectional counterparty, sort credit and debit transactions chronologically.
3. For each credit transaction, search for an unallocated debit transaction satisfying:
   $$|\text{timestamp}_{\text{debit}} - \text{timestamp}_{\text{credit}}| \le \text{round\_trip\_window\_days}$$
   $$\frac{|\text{amount}_{\text{credit}} - \text{amount}_{\text{debit}}|}{\max(\text{amount}_{\text{credit}}, \text{amount}_{\text{debit}})} \le \text{round\_trip\_tolerance\_percent}$$
4. **Greedy 1-to-1 Matching**: Once a transaction is matched, it is added to `used_tx_ids` and cannot be reused in another pair, strictly preventing double-counting.
5. **Matched Volume**: $\text{matched\_amount} = \min(\text{credit}, \text{debit})$.
6. **Neutral Labeling**: The total volume is reported strictly as *"Observed potentially offsetting transfer volume"*. It explicitly acknowledges legitimate commercial causes (e.g., customer returns, supplier advance refunds, security deposits).

---

### 9. Cycle Detection Limitations & Governance

In a single-business account statement, multi-party circular flows (e.g., $A \longrightarrow B \longrightarrow C \longrightarrow A$) **cannot be established** because inter-counterparty transfers are outside the visibility boundary.

#### Governance Policy:
* `cycle_investigation_status` is explicitly set to `"NOT_ASSESSABLE"`.
* 2-node cycles ($C \rightleftharpoons \text{MSME}$) are reported as bidirectional trading relationships.
* Fabricating synthetic counterparty-to-counterparty edges to produce multi-entity cycles is strictly prohibited.

---

### 10. Structured Explainable Anomaly Flags

The engine emits typed diagnostic flags (`ExplainableAnomalyFlag`) with neutral interpretations:

| Flag Code | Trigger Rule | Default Severity | Interpretation |
| :--- | :--- | :--- | :--- |
| `COUNTERPARTY_CONCENTRATION` | Single counterparty share $\ge 40\%$ | `LOW` ($\ge 40\%$) / `MEDIUM` ($\ge 60\%$) | Identifies revenue or procurement dependency on anchor counterparties. |
| `BIDIRECTIONAL_ACTIVITY` | Counterparty appears in credits and debits | `LOW` ($< 30\%$ vol) / `MEDIUM` ($\ge 30\%$) | Highlights reciprocal trading flows warranting relationship verification. |
| `POTENTIALLY_OFFSETTING_TRANSFERS` | Matched credit-debit pairs within window | `LOW` ($< 20\%$ vol) / `MEDIUM` ($\ge 20\%$) | Documents reciprocal matching transfers (refunds, deposits, or trade wash). |
| `REPEATED_SIMILAR_AMOUNTS` | $\ge 3$ transactions with identical amounts | `INFORMATIONAL` | Recurring fixed payments consistent with leases, retainers, or EMIs. |
| `LIMITED_GRAPH_COVERAGE` | Graph-represented volume $< 80\%$ | `LOW` / `MEDIUM` ($< 50\%$) | Informs underwriters that unlabelled transactions limit graph completeness. |
| `INSUFFICIENT_CYCLE_EVIDENCE` | Multi-entity circular flow unobserved | `INFORMATIONAL` | Formally notes that single-account statements cannot assess external cycles. |

---

### 11. Computational Complexity
* **Graph Construction**: $O(N)$ where $N$ is the count of transactions.
* **Edge Aggregation**: $O(N)$ with dictionary-based bucket accumulation.
* **Top Relationships & HHI**: $O(K \log K)$ where $K$ is the number of distinct counterparties ($K \le N$).
* **Round-Trip Matching**: $O(K \cdot M \cdot D)$ where $M$ is credits per counterparty and $D$ is debits per counterparty. Since $M + D = N_k \ll N$, worst-case matching executes in milliseconds.
* **Benchmark Performance**: 1,200 synthetic transactions process in under 0.05 seconds.

---

### 12. Integration Contract for Agent Orchestration (Atharv's Module)

The graph analysis result provides clean, deterministic JSON serialization via `.to_dict()`:

```python
from app.modules.financial_intelligence import build_and_analyze, parse_transactions

# 1. Parse CSV
parse_result = parse_transactions(raw_csv_bytes)

# 2. Build and analyze graph
graph_result = build_and_analyze(parse_result, business_id=business_id)

# 3. Serialize for Agent context / API payloads
graph_dict = graph_result.to_dict()

# Example downstream consumption by Agent Prompt:
evidence_summary = {
    "identifiable_counterparties": graph_result.graph_statistics.identifiable_counterparty_count,
    "top_incoming_partner": graph_result.graph_statistics.top_incoming_relationships[0].counterparty_id,
    "incoming_hhi": graph_result.concentration.incoming_hhi,
    "offsetting_volume": str(graph_result.round_trip_observations.total_offsetting_volume),
    "flags": [f.flag_code.value for f in graph_result.anomaly_flags],
}
```
