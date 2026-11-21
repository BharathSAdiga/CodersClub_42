"""UDYOGA — Financial Intelligence Engine: Transaction Graph Intelligence.

Constructs directed transaction networks, evaluates counterparty concentration,
identifies bidirectional and repeated transfer patterns, detects potentially
offsetting (round-trip) transactions, and generates explainable anomaly flags
from normalized MSME financial records.

Strict design invariants:
- Zero fabrication of counterparty-to-counterparty edges.
- Unidentified counterparties are preserved in dataset aggregates but isolated
  from graph topology to prevent fictional entity clustering.
- Decimal precision for all monetary arithmetic.
- Deterministic output ordering for reproducible audit trails.
- Multi-entity circular flow marked NOT_ASSESSABLE when external transfer data is absent.
- Neutral, factual, and explainable reporting (no ungrounded fraud accusations).
"""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone, timedelta
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Any, Dict, List, Optional, Set, Tuple, Union

from pydantic import BaseModel, ConfigDict, Field
import networkx as nx

from app.modules.financial_intelligence.parser import (
    NormalizedTransaction,
    ParseResult,
    TransactionDirection,
    TransactionCategory,
    TransactionChannel,
)


# ==============================================================================
# ENUMS & CONSTANTS
# ==============================================================================

class NodeType(str, Enum):
    """Classification of graph nodes."""
    BUSINESS = "BUSINESS"
    COUNTERPARTY = "COUNTERPARTY"


class FlagSeverity(str, Enum):
    """Severity classification for explainable anomaly flags."""
    INFORMATIONAL = "INFORMATIONAL"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class AnomalyFlagCode(str, Enum):
    """Machine-readable diagnostic flag codes."""
    COUNTERPARTY_CONCENTRATION = "COUNTERPARTY_CONCENTRATION"
    REPEATED_SIMILAR_AMOUNTS = "REPEATED_SIMILAR_AMOUNTS"
    BIDIRECTIONAL_ACTIVITY = "BIDIRECTIONAL_ACTIVITY"
    POTENTIALLY_OFFSETTING_TRANSFERS = "POTENTIALLY_OFFSETTING_TRANSFERS"
    LIMITED_GRAPH_COVERAGE = "LIMITED_GRAPH_COVERAGE"
    INSUFFICIENT_CYCLE_EVIDENCE = "INSUFFICIENT_CYCLE_EVIDENCE"


class CycleInvestigationStatus(str, Enum):
    """Status of circular flow investigation."""
    NOT_ASSESSABLE = "NOT_ASSESSABLE"
    ASSESSED = "ASSESSED"


# ==============================================================================
# PYDANTIC DATA MODELS
# ==============================================================================

class GraphNode(BaseModel):
    """Metadata representing a single entity node in the transaction graph."""
    node_id: str = Field(..., description="Unique graph node identifier (namespaced)")
    raw_entity_id: str = Field(..., description="Original business or counterparty identifier")
    node_type: NodeType = Field(..., description="BUSINESS or COUNTERPARTY")
    display_label: str = Field(..., description="Human-readable entity label")
    observed_transaction_count: int = Field(0, description="Total observed transactions involving this node")
    observed_credit_amount: Decimal = Field(default=Decimal("0.00"), description="Total credit volume involving node")
    observed_debit_amount: Decimal = Field(default=Decimal("0.00"), description="Total debit volume involving node")

    model_config = ConfigDict(frozen=True)


class GraphEdge(BaseModel):
    """Directed edge representing aggregate financial flow between two entities."""
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    direction_type: str = Field(..., description="INCOMING_TO_MSME or OUTGOING_FROM_MSME")
    transaction_count: int = Field(..., description="Count of transactions aggregated on edge")
    total_amount: Decimal = Field(..., description="Sum of transaction amounts")
    transaction_ids: List[str] = Field(default_factory=list, description="IDs of supporting transactions")
    first_observed_timestamp: Optional[datetime] = Field(default=None, description="Earliest transaction timestamp")
    last_observed_timestamp: Optional[datetime] = Field(default=None, description="Latest transaction timestamp")
    relevant_categories: List[str] = Field(default_factory=list, description="Sorted unique transaction categories")

    model_config = ConfigDict(frozen=True)


class RelationshipSummary(BaseModel):
    """Top-level summary of an observed directed relationship."""
    counterparty_id: str = Field(..., description="Counterparty identifier")
    counterparty_name: Optional[str] = Field(default=None, description="Counterparty name")
    direction: str = Field(..., description="INCOMING or OUTGOING")
    total_amount: Decimal = Field(..., description="Aggregate monetary amount")
    transaction_count: int = Field(..., description="Number of transactions")
    share_of_flow: float = Field(..., description="Proportion of respective incoming/outgoing flow")

    model_config = ConfigDict(frozen=True)


class GraphStatistics(BaseModel):
    """Structural and quantitative graph topology metrics."""
    total_nodes: int = 0
    total_edges: int = 0
    identifiable_counterparty_count: int = 0
    incoming_relationship_count: int = 0
    outgoing_relationship_count: int = 0
    bidirectional_counterparty_count: int = 0
    total_graph_incoming_amount: Decimal = Field(default=Decimal("0.00"))
    total_graph_outgoing_amount: Decimal = Field(default=Decimal("0.00"))
    total_graph_volume: Decimal = Field(default=Decimal("0.00"))
    top_incoming_relationships: List[RelationshipSummary] = Field(default_factory=list)
    top_outgoing_relationships: List[RelationshipSummary] = Field(default_factory=list)
    transaction_counts_by_relationship: Dict[str, int] = Field(default_factory=dict)

    model_config = ConfigDict(frozen=True)


class GraphConcentrationMetrics(BaseModel):
    """Herfindahl-Hirschman Index and top-counterparty concentration ratios."""
    largest_incoming_counterparty_share: float = 0.0
    top_3_incoming_counterparty_share: float = 0.0
    incoming_hhi: float = 0.0
    largest_outgoing_counterparty_share: float = 0.0
    top_3_outgoing_counterparty_share: float = 0.0
    outgoing_hhi: float = 0.0
    overall_counterparty_hhi: float = 0.0
    incoming_identifiable_coverage_ratio: float = 0.0
    outgoing_identifiable_coverage_ratio: float = 0.0

    model_config = ConfigDict(frozen=True)


class CounterpartyActivitySummary(BaseModel):
    """Detailed activity profile for an individual identifiable counterparty."""
    counterparty_id: str
    counterparty_name: Optional[str] = None
    node_id: str
    incoming_to_msme_count: int = 0
    incoming_to_msme_amount: Decimal = Field(default=Decimal("0.00"))
    outgoing_from_msme_count: int = 0
    outgoing_from_msme_amount: Decimal = Field(default=Decimal("0.00"))
    net_flow_to_msme: Decimal = Field(default=Decimal("0.00"))  # incoming - outgoing
    is_bidirectional: bool = False
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None
    primary_categories: List[str] = Field(default_factory=list)

    model_config = ConfigDict(frozen=True)


class RepeatedTransferObservation(BaseModel):
    """Documented observation of repeated transaction patterns."""
    pattern_type: str = Field(..., description="e.g. REPEATED_SIMILAR_AMOUNTS, SHORT_INTERVAL_RECURRING")
    involved_node_ids: List[str] = Field(default_factory=list)
    supporting_transaction_ids: List[str] = Field(default_factory=list)
    observed_amounts: List[Decimal] = Field(default_factory=list)
    relevant_timestamps: List[datetime] = Field(default_factory=list)
    explanation: str = Field(..., description="Factual, objective statement of observed pattern")
    detection_rule: str = Field(..., description="Formal heuristic logic applied")
    limitations: str = Field(..., description="Caveats and contextual boundaries")
    severity: FlagSeverity = Field(default=FlagSeverity.INFORMATIONAL)

    model_config = ConfigDict(frozen=True)


class RoundTripMatch(BaseModel):
    """A single matched pair of potentially offsetting transfers with one counterparty."""
    counterparty_id: str
    credit_transaction_id: str
    debit_transaction_id: str
    first_direction: str  # CREDIT_FIRST or DEBIT_FIRST
    credit_amount: Decimal
    debit_amount: Decimal
    matched_amount: Decimal
    amount_difference: Decimal
    time_difference_hours: float
    credit_timestamp: datetime
    debit_timestamp: datetime
    explanation: str
    limitations: str

    model_config = ConfigDict(frozen=True)


class RoundTripObservation(BaseModel):
    """Aggregated assessment of observed potentially offsetting transfer volume."""
    total_offsetting_volume: Decimal = Field(default=Decimal("0.00"))
    offsetting_pairs_count: int = 0
    offsetting_volume_share: float = 0.0
    matched_pairs: List[RoundTripMatch] = Field(default_factory=list)
    methodology: str = Field(
        default="Deterministic greedy 1-to-1 match within observation window and percentage tolerance"
    )
    neutral_interpretation: str = Field(
        default="Observed potentially offsetting transfer volume reflects matching inflows and outflows with the same counterparty within a defined temporal window. Does not establish economic intent or wrongdoing."
    )

    model_config = ConfigDict(frozen=True)


class CycleInvestigationResult(BaseModel):
    """Formal cycle analysis results bounded by source data visibility."""
    cycle_investigation_status: CycleInvestigationStatus = CycleInvestigationStatus.NOT_ASSESSABLE
    observed_two_node_cycles_count: int = 0
    two_node_cycle_counterparties: List[str] = Field(default_factory=list)
    multi_entity_cycle_count: int = 0
    explanation: str = Field(
        default=(
            "Multi-entity circular flow cannot be assessed from single-entity account statements "
            "because counterparty-to-counterparty transactions are not observed in source data. "
            "Fabricating external edges is strictly prohibited."
        )
    )
    two_node_cycle_interpretation: str = Field(
        default=(
            "Two-node cycles (Counterparty <-> MSME) reflect bidirectional business relationships "
            "(e.g., supplier returns, trade credits, vendor-customer relationships) and do not "
            "constitute evidence of circular trading."
        )
    )

    model_config = ConfigDict(frozen=True)


class ExplainableAnomalyFlag(BaseModel):
    """Structured diagnostic flag highlighting noteworthy graph patterns."""
    flag_code: AnomalyFlagCode
    title: str
    severity: FlagSeverity
    detection_rule: str
    supporting_evidence_references: List[str] = Field(default_factory=list)
    observed_metrics: Dict[str, Any] = Field(default_factory=dict)
    data_sufficiency_status: str = Field(default="SUFFICIENT")
    limitations: str
    interpretation: str

    model_config = ConfigDict(frozen=True)


class GraphDataCoverage(BaseModel):
    """Metrics tracking graph representation coverage vs total transaction dataset."""
    total_dataset_transactions: int = 0
    graph_represented_transactions: int = 0
    unrepresented_transactions_missing_counterparty: int = 0
    total_dataset_inflow: Decimal = Field(default=Decimal("0.00"))
    total_dataset_outflow: Decimal = Field(default=Decimal("0.00"))
    total_dataset_volume: Decimal = Field(default=Decimal("0.00"))
    graph_represented_volume: Decimal = Field(default=Decimal("0.00"))
    unrepresented_volume: Decimal = Field(default=Decimal("0.00"))
    graph_volume_coverage_ratio: float = 0.0
    coverage_status: str = "ADEQUATE"  # ADEQUATE, LIMITED, INSUFFICIENT
    notes: List[str] = Field(default_factory=list)

    model_config = ConfigDict(frozen=True)


class GraphAnalysisResult(BaseModel):
    """Comprehensive output of the Financial Intelligence Transaction Graph Engine."""
    business_id: str
    business_node_id: str
    graph_statistics: GraphStatistics
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    counterparty_summaries: List[CounterpartyActivitySummary]
    concentration: GraphConcentrationMetrics
    repeated_transfers: List[RepeatedTransferObservation]
    round_trip_observations: RoundTripObservation
    cycle_investigation: CycleInvestigationResult
    anomaly_flags: List[ExplainableAnomalyFlag]
    data_coverage: GraphDataCoverage

    model_config = ConfigDict(frozen=True)

    def to_dict(self) -> Dict[str, Any]:
        """Serializes the result to a JSON-safe dictionary, converting Decimals to strings and dates to ISO 8601."""
        def serialize_item(obj: Any) -> Any:
            if isinstance(obj, Decimal):
                return str(obj)
            if isinstance(obj, (datetime,)):
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
# GRAPH ENGINE CORE IMPLEMENTATION
# ==============================================================================

def _namespace_business_node(business_id: str) -> str:
    """Creates a guaranteed unique graph node identifier for the central business."""
    clean_id = (business_id or "MSME").strip()
    return f"BIZ:{clean_id}"


def _namespace_counterparty_node(counterparty_id: str) -> str:
    """Creates a guaranteed unique graph node identifier for a counterparty entity."""
    clean_id = (counterparty_id or "UNKNOWN").strip()
    return f"CP:{clean_id}"


def build_and_analyze(
    transactions: Union[List[NormalizedTransaction], ParseResult, Any],
    *,
    business_id: str = "MSME",
    round_trip_window_days: int = 14,
    round_trip_tolerance_percent: float = 5.0,
    concentration_threshold: float = 0.40,
    short_interval_hours: float = 24.0,
) -> GraphAnalysisResult:
    """Constructs a directed transaction network and computes explainable graph metrics.

    Args:
        transactions: List of NormalizedTransaction or ParseResult from Phase 1.
        business_id: Unique identifier for the analyzed MSME.
        round_trip_window_days: Max days between potentially offsetting transactions.
        round_trip_tolerance_percent: Percentage tolerance for matching amounts.
        concentration_threshold: HHI or single-counterparty share threshold for flags.
        short_interval_hours: Max hours between transfers considered short-interval.

    Returns:
        GraphAnalysisResult containing complete topology, statistics, concentration,
        repeated patterns, round-trip matching, cycle analysis, and anomaly flags.
    """
    # 1. Unpack & Normalize Input
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

    # Deduplicate by transaction_id if duplicates are present, preserving first occurrence
    seen_ids: Set[str] = set()
    unique_txs: List[NormalizedTransaction] = []
    for tx in tx_list:
        if tx.transaction_id not in seen_ids:
            seen_ids.add(tx.transaction_id)
            unique_txs.append(tx)

    # Sort transactions deterministically by timestamp, then transaction_id
    unique_txs.sort(key=lambda x: (x.timestamp, x.transaction_id))

    # 2. Dataset Accounting & Coverage Breakdown
    total_dataset_txs = len(unique_txs)
    total_dataset_inflow = Decimal("0.00")
    total_dataset_outflow = Decimal("0.00")
    identifiable_txs: List[NormalizedTransaction] = []
    unrepresented_count = 0
    unrepresented_volume = Decimal("0.00")

    for tx in unique_txs:
        if tx.direction == TransactionDirection.CREDIT:
            total_dataset_inflow += tx.amount
        elif tx.direction == TransactionDirection.DEBIT:
            total_dataset_outflow += tx.amount

        # Check if counterparty is identifiable
        cp_id = (tx.counterparty_id or "").strip()
        if cp_id:
            identifiable_txs.append(tx)
        else:
            unrepresented_count += 1
            unrepresented_volume += tx.amount

    total_dataset_volume = total_dataset_inflow + total_dataset_outflow
    graph_volume = sum((tx.amount for tx in identifiable_txs), Decimal("0.00"))
    coverage_ratio = float(graph_volume / total_dataset_volume) if total_dataset_volume > Decimal("0.00") else 1.0

    coverage_status = "ADEQUATE"
    coverage_notes = []
    if unrepresented_count > 0:
        coverage_notes.append(
            f"{unrepresented_count} transaction(s) totalling INR {unrepresented_volume} lack counterparty IDs "
            "and were isolated from graph topology to prevent artificial entity clustering."
        )
    if coverage_ratio < 0.50 and total_dataset_volume > Decimal("0.00"):
        coverage_status = "LIMITED"
        coverage_notes.append("Graph covers less than 50% of observed dataset volume due to missing counterparty IDs.")
    elif coverage_ratio < 0.80 and total_dataset_volume > Decimal("0.00"):
        coverage_status = "PARTIAL"

    data_coverage = GraphDataCoverage(
        total_dataset_transactions=total_dataset_txs,
        graph_represented_transactions=len(identifiable_txs),
        unrepresented_transactions_missing_counterparty=unrepresented_count,
        total_dataset_inflow=total_dataset_inflow,
        total_dataset_outflow=total_dataset_outflow,
        total_dataset_volume=total_dataset_volume,
        graph_represented_volume=graph_volume,
        unrepresented_volume=unrepresented_volume,
        graph_volume_coverage_ratio=round(coverage_ratio, 4),
        coverage_status=coverage_status,
        notes=coverage_notes,
    )

    # 3. Build NetworkX Directed Graph & Aggregate Edge Buckets
    G = nx.DiGraph()
    biz_node_id = _namespace_business_node(business_id)

    # Track entity-level metadata
    biz_credits = Decimal("0.00")
    biz_debits = Decimal("0.00")
    biz_tx_count = len(identifiable_txs)

    cp_nodes_meta: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
        "raw_id": "",
        "name": None,
        "count": 0,
        "credit_amount": Decimal("0.00"),  # inflow to MSME
        "debit_amount": Decimal("0.00"),   # outflow from MSME
        "first_seen": None,
        "last_seen": None,
        "categories": set(),
    })

    # Directed edge buckets: (source_id, target_id) -> list of transactions
    edge_buckets: Dict[Tuple[str, str], List[NormalizedTransaction]] = defaultdict(list)

    for tx in identifiable_txs:
        raw_cp_id = tx.counterparty_id.strip()
        cp_node_id = _namespace_counterparty_node(raw_cp_id)
        cp_meta = cp_nodes_meta[cp_node_id]
        cp_meta["raw_id"] = raw_cp_id
        if tx.counterparty_name and not cp_meta["name"]:
            cp_meta["name"] = tx.counterparty_name.strip()
        cp_meta["count"] += 1
        if cp_meta["first_seen"] is None or tx.timestamp < cp_meta["first_seen"]:
            cp_meta["first_seen"] = tx.timestamp
        if cp_meta["last_seen"] is None or tx.timestamp > cp_meta["last_seen"]:
            cp_meta["last_seen"] = tx.timestamp
        if tx.category:
            cp_meta["categories"].add(tx.category.value if isinstance(tx.category, Enum) else str(tx.category))

        if tx.direction == TransactionDirection.CREDIT:
            # Inflow: Counterparty -> MSME
            edge_buckets[(cp_node_id, biz_node_id)].append(tx)
            biz_credits += tx.amount
            cp_meta["credit_amount"] += tx.amount
        elif tx.direction == TransactionDirection.DEBIT:
            # Outflow: MSME -> Counterparty
            edge_buckets[(biz_node_id, cp_node_id)].append(tx)
            biz_debits += tx.amount
            cp_meta["debit_amount"] += tx.amount

    # Register Nodes in NetworkX
    G.add_node(
        biz_node_id,
        node_id=biz_node_id,
        raw_entity_id=business_id,
        node_type=NodeType.BUSINESS,
        display_label=f"MSME ({business_id})",
        observed_transaction_count=biz_tx_count,
        observed_credit_amount=biz_credits,
        observed_debit_amount=biz_debits,
    )

    serialized_nodes: List[GraphNode] = []
    # Add business node first
    serialized_nodes.append(
        GraphNode(
            node_id=biz_node_id,
            raw_entity_id=business_id,
            node_type=NodeType.BUSINESS,
            display_label=f"MSME ({business_id})",
            observed_transaction_count=biz_tx_count,
            observed_credit_amount=biz_credits,
            observed_debit_amount=biz_debits,
        )
    )

    # Sort counterparty nodes deterministically by raw_id
    for cp_node_id in sorted(cp_nodes_meta.keys()):
        meta = cp_nodes_meta[cp_node_id]
        display_name = meta["name"] or meta["raw_id"]
        lbl = f"{display_name} ({meta['raw_id']})" if meta["name"] and meta["name"] != meta["raw_id"] else display_name
        node_obj = GraphNode(
            node_id=cp_node_id,
            raw_entity_id=meta["raw_id"],
            node_type=NodeType.COUNTERPARTY,
            display_label=lbl,
            observed_transaction_count=meta["count"],
            observed_credit_amount=meta["credit_amount"],
            observed_debit_amount=meta["debit_amount"],
        )
        serialized_nodes.append(node_obj)
        G.add_node(
            cp_node_id,
            node_id=cp_node_id,
            raw_entity_id=meta["raw_id"],
            node_type=NodeType.COUNTERPARTY,
            display_label=lbl,
            observed_transaction_count=meta["count"],
            observed_credit_amount=meta["credit_amount"],
            observed_debit_amount=meta["debit_amount"],
        )

    # Register Directed Edges in NetworkX & Build Serialized Edges
    serialized_edges: List[GraphEdge] = []
    for (src, tgt) in sorted(edge_buckets.keys()):
        bucket = edge_buckets[(src, tgt)]
        bucket_amount = sum((t.amount for t in bucket), Decimal("0.00"))
        bucket_tx_ids = [t.transaction_id for t in bucket]
        earliest_ts = min(t.timestamp for t in bucket)
        latest_ts = max(t.timestamp for t in bucket)
        cats = sorted(set(
            (t.category.value if isinstance(t.category, Enum) else str(t.category))
            for t in bucket if t.category
        ))

        dir_type = "INCOMING_TO_MSME" if tgt == biz_node_id else "OUTGOING_FROM_MSME"
        edge_obj = GraphEdge(
            source=src,
            target=tgt,
            direction_type=dir_type,
            transaction_count=len(bucket),
            total_amount=bucket_amount,
            transaction_ids=bucket_tx_ids,
            first_observed_timestamp=earliest_ts,
            last_observed_timestamp=latest_ts,
            relevant_categories=cats,
        )
        serialized_edges.append(edge_obj)
        G.add_edge(
            src,
            tgt,
            direction_type=dir_type,
            transaction_count=len(bucket),
            total_amount=bucket_amount,
            transaction_ids=bucket_tx_ids,
            first_observed_timestamp=earliest_ts,
            last_observed_timestamp=latest_ts,
            relevant_categories=cats,
        )

    # 4. Counterparty Activity Summaries & Bidirectional Detection
    cp_summaries: List[CounterpartyActivitySummary] = []
    bidirectional_cps: List[str] = []

    for cp_node_id in sorted(cp_nodes_meta.keys()):
        meta = cp_nodes_meta[cp_node_id]
        in_amt = meta["credit_amount"]   # Flow into MSME
        out_amt = meta["debit_amount"]   # Flow out of MSME
        has_in = in_amt > Decimal("0.00")
        has_out = out_amt > Decimal("0.00")
        is_bidi = has_in and has_out

        if is_bidi:
            bidirectional_cps.append(meta["raw_id"])

        in_count = len(edge_buckets.get((cp_node_id, biz_node_id), []))
        out_count = len(edge_buckets.get((biz_node_id, cp_node_id), []))

        cp_summaries.append(
            CounterpartyActivitySummary(
                counterparty_id=meta["raw_id"],
                counterparty_name=meta["name"],
                node_id=cp_node_id,
                incoming_to_msme_count=in_count,
                incoming_to_msme_amount=in_amt,
                outgoing_from_msme_count=out_count,
                outgoing_from_msme_amount=out_amt,
                net_flow_to_msme=in_amt - out_amt,
                is_bidirectional=is_bidi,
                first_seen=meta["first_seen"],
                last_seen=meta["last_seen"],
                primary_categories=sorted(meta["categories"]),
            )
        )

    # 5. Top Relationships & Transaction Counts by Relationship
    top_incoming: List[RelationshipSummary] = []
    top_outgoing: List[RelationshipSummary] = []
    tx_counts_by_rel: Dict[str, int] = {}

    for edge in serialized_edges:
        rel_key = f"{edge.source}->{edge.target}"
        tx_counts_by_rel[rel_key] = edge.transaction_count

        if edge.direction_type == "INCOMING_TO_MSME":
            cp_raw = edge.source.replace("CP:", "", 1)
            name = cp_nodes_meta[edge.source]["name"]
            share = float(edge.total_amount / biz_credits) if biz_credits > Decimal("0.00") else 0.0
            top_incoming.append(
                RelationshipSummary(
                    counterparty_id=cp_raw,
                    counterparty_name=name,
                    direction="INCOMING",
                    total_amount=edge.total_amount,
                    transaction_count=edge.transaction_count,
                    share_of_flow=round(share, 4),
                )
            )
        else:
            cp_raw = edge.target.replace("CP:", "", 1)
            name = cp_nodes_meta[edge.target]["name"]
            share = float(edge.total_amount / biz_debits) if biz_debits > Decimal("0.00") else 0.0
            top_outgoing.append(
                RelationshipSummary(
                    counterparty_id=cp_raw,
                    counterparty_name=name,
                    direction="OUTGOING",
                    total_amount=edge.total_amount,
                    transaction_count=edge.transaction_count,
                    share_of_flow=round(share, 4),
                )
            )

    top_incoming.sort(key=lambda r: (r.total_amount, r.transaction_count), reverse=True)
    top_outgoing.sort(key=lambda r: (r.total_amount, r.transaction_count), reverse=True)

    # Graph Statistics Model
    incoming_edges_count = sum(1 for e in serialized_edges if e.direction_type == "INCOMING_TO_MSME")
    outgoing_edges_count = sum(1 for e in serialized_edges if e.direction_type == "OUTGOING_FROM_MSME")

    graph_stats = GraphStatistics(
        total_nodes=len(serialized_nodes),
        total_edges=len(serialized_edges),
        identifiable_counterparty_count=len(cp_nodes_meta),
        incoming_relationship_count=incoming_edges_count,
        outgoing_relationship_count=outgoing_edges_count,
        bidirectional_counterparty_count=len(bidirectional_cps),
        total_graph_incoming_amount=biz_credits,
        total_graph_outgoing_amount=biz_debits,
        total_graph_volume=biz_credits + biz_debits,
        top_incoming_relationships=top_incoming[:10],
        top_outgoing_relationships=top_outgoing[:10],
        transaction_counts_by_relationship=tx_counts_by_rel,
    )

    # 6. Task C: Counterparty Concentration & HHI
    def _compute_hhi(amounts: List[Decimal], total: Decimal) -> float:
        if total <= Decimal("0.00") or not amounts:
            return 0.0
        hhi_val = sum((amt / total) ** 2 for amt in amounts)
        return float(round(hhi_val, 4))

    # Incoming concentration
    in_amounts = [r.total_amount for r in top_incoming]
    largest_in_share = float(in_amounts[0] / biz_credits) if in_amounts and biz_credits > Decimal("0.00") else 0.0
    top_3_in_share = float(sum(in_amounts[:3], Decimal("0.00")) / biz_credits) if in_amounts and biz_credits > Decimal("0.00") else 0.0
    in_hhi = _compute_hhi(in_amounts, biz_credits)

    # Outgoing concentration
    out_amounts = [r.total_amount for r in top_outgoing]
    largest_out_share = float(out_amounts[0] / biz_debits) if out_amounts and biz_debits > Decimal("0.00") else 0.0
    top_3_out_share = float(sum(out_amounts[:3], Decimal("0.00")) / biz_debits) if out_amounts and biz_debits > Decimal("0.00") else 0.0
    out_hhi = _compute_hhi(out_amounts, biz_debits)

    # Overall counterparty concentration
    cp_total_volumes = [
        meta["credit_amount"] + meta["debit_amount"]
        for meta in cp_nodes_meta.values()
    ]
    tot_graph_vol = biz_credits + biz_debits
    overall_hhi = _compute_hhi(cp_total_volumes, tot_graph_vol)

    in_cov = float(biz_credits / total_dataset_inflow) if total_dataset_inflow > Decimal("0.00") else 1.0
    out_cov = float(biz_debits / total_dataset_outflow) if total_dataset_outflow > Decimal("0.00") else 1.0

    concentration_metrics = GraphConcentrationMetrics(
        largest_incoming_counterparty_share=round(largest_in_share, 4),
        top_3_incoming_counterparty_share=round(top_3_in_share, 4),
        incoming_hhi=in_hhi,
        largest_outgoing_counterparty_share=round(largest_out_share, 4),
        top_3_outgoing_counterparty_share=round(top_3_out_share, 4),
        outgoing_hhi=out_hhi,
        overall_counterparty_hhi=overall_hhi,
        incoming_identifiable_coverage_ratio=round(in_cov, 4),
        outgoing_identifiable_coverage_ratio=round(out_cov, 4),
    )

    # 7. Task D: Repeated Transaction Patterns
    repeated_observations: List[RepeatedTransferObservation] = []

    # D1: Repeated similar amounts with the same counterparty (>= 3 transactions with identical amount)
    cp_to_txs: Dict[str, List[NormalizedTransaction]] = defaultdict(list)
    for tx in identifiable_txs:
        cp_to_txs[tx.counterparty_id.strip()].append(tx)

    for cp_id, cp_tx_list in sorted(cp_to_txs.items()):
        amt_groups: Dict[Decimal, List[NormalizedTransaction]] = defaultdict(list)
        for t in cp_tx_list:
            amt_groups[t.amount].append(t)

        for amt, group in sorted(amt_groups.items(), key=lambda x: len(x[1]), reverse=True):
            if len(group) >= 3:
                repeated_observations.append(
                    RepeatedTransferObservation(
                        pattern_type="REPEATED_IDENTICAL_AMOUNTS",
                        involved_node_ids=[_namespace_counterparty_node(cp_id), biz_node_id],
                        supporting_transaction_ids=[t.transaction_id for t in group],
                        observed_amounts=[t.amount for t in group],
                        relevant_timestamps=[t.timestamp for t in group],
                        explanation=(
                            f"Counterparty '{cp_id}' engaged in {len(group)} transactions of exactly "
                            f"INR {amt} across the observed period."
                        ),
                        detection_rule="Count of identical transaction amounts with the same counterparty >= 3",
                        limitations="Repeated fixed amounts are standard for recurring subscriptions, lease payments, and fixed EMI installments.",
                        severity=FlagSeverity.INFORMATIONAL,
                    )
                )

    # D2: Short-interval transfers (transfers between same counterparty within short_interval_hours)
    for cp_id, cp_tx_list in sorted(cp_to_txs.items()):
        if len(cp_tx_list) < 2:
            continue
        sorted_cp_txs = sorted(cp_tx_list, key=lambda x: x.timestamp)
        rapid_cluster: List[NormalizedTransaction] = []
        for i in range(len(sorted_cp_txs) - 1):
            t1 = sorted_cp_txs[i]
            t2 = sorted_cp_txs[i + 1]
            diff_hours = (t2.timestamp - t1.timestamp).total_seconds() / 3600.0
            if 0.0 <= diff_hours <= short_interval_hours:
                if not rapid_cluster:
                    rapid_cluster.extend([t1, t2])
                elif t2 not in rapid_cluster:
                    rapid_cluster.append(t2)

        if len(rapid_cluster) >= 3:
            repeated_observations.append(
                RepeatedTransferObservation(
                    pattern_type="SHORT_INTERVAL_RECURRING",
                    involved_node_ids=[_namespace_counterparty_node(cp_id), biz_node_id],
                    supporting_transaction_ids=[t.transaction_id for t in rapid_cluster],
                    observed_amounts=[t.amount for t in rapid_cluster],
                    relevant_timestamps=[t.timestamp for t in rapid_cluster],
                    explanation=(
                        f"Observed cluster of {len(rapid_cluster)} transactions involving counterparty '{cp_id}' "
                        f"occurring within intervals of {short_interval_hours} hours."
                    ),
                    detection_rule=f"Consecutive transaction timestamp difference <= {short_interval_hours} hours",
                    limitations="High-frequency transfers can represent active retail trading days, batch settlements, or split payments.",
                    severity=FlagSeverity.INFORMATIONAL,
                )
            )

    # D3: High Counterparty Concentration
    if largest_in_share >= concentration_threshold and biz_credits > Decimal("0.00"):
        top_in = top_incoming[0]
        in_txs = edge_buckets.get((_namespace_counterparty_node(top_in.counterparty_id), biz_node_id), [])
        repeated_observations.append(
            RepeatedTransferObservation(
                pattern_type="HIGH_COUNTERPARTY_CONCENTRATION_INFLOW",
                involved_node_ids=[_namespace_counterparty_node(top_in.counterparty_id), biz_node_id],
                supporting_transaction_ids=[t.transaction_id for t in in_txs[:10]],
                observed_amounts=[top_in.total_amount],
                relevant_timestamps=[t.timestamp for t in in_txs[:10]],
                explanation=(
                    f"A single counterparty '{top_in.counterparty_id}' accounts for {top_in.share_of_flow * 100:.1f}% "
                    f"of all identifiable incoming transaction volume (INR {top_in.total_amount})."
                ),
                detection_rule=f"Single counterparty incoming share >= {concentration_threshold * 100:.0f}%",
                limitations="MSMEs serving anchor B2B clients or single wholesale distributors naturally show high customer concentration.",
                severity=FlagSeverity.LOW,
            )
        )

    if largest_out_share >= concentration_threshold and biz_debits > Decimal("0.00"):
        top_out = top_outgoing[0]
        out_txs = edge_buckets.get((biz_node_id, _namespace_counterparty_node(top_out.counterparty_id)), [])
        repeated_observations.append(
            RepeatedTransferObservation(
                pattern_type="HIGH_COUNTERPARTY_CONCENTRATION_OUTFLOW",
                involved_node_ids=[biz_node_id, _namespace_counterparty_node(top_out.counterparty_id)],
                supporting_transaction_ids=[t.transaction_id for t in out_txs[:10]],
                observed_amounts=[top_out.total_amount],
                relevant_timestamps=[t.timestamp for t in out_txs[:10]],
                explanation=(
                    f"A single counterparty '{top_out.counterparty_id}' receives {top_out.share_of_flow * 100:.1f}% "
                    f"of all identifiable outgoing transaction volume (INR {top_out.total_amount})."
                ),
                detection_rule=f"Single counterparty outgoing share >= {concentration_threshold * 100:.0f}%",
                limitations="Single primary suppliers or key raw material distributors commonly capture high procurement share.",
                severity=FlagSeverity.LOW,
            )
        )

    # D4: Bidirectional activity observation
    for cp_id in sorted(bidirectional_cps):
        in_txs = edge_buckets.get((_namespace_counterparty_node(cp_id), biz_node_id), [])
        out_txs = edge_buckets.get((biz_node_id, _namespace_counterparty_node(cp_id)), [])
        in_amt = sum((t.amount for t in in_txs), Decimal("0.00"))
        out_amt = sum((t.amount for t in out_txs), Decimal("0.00"))

        repeated_observations.append(
            RepeatedTransferObservation(
                pattern_type="BIDIRECTIONAL_ACTIVITY",
                involved_node_ids=[_namespace_counterparty_node(cp_id), biz_node_id],
                supporting_transaction_ids=[t.transaction_id for t in in_txs + out_txs],
                observed_amounts=[in_amt, out_amt],
                relevant_timestamps=[],
                explanation=(
                    f"Counterparty '{cp_id}' exhibits bidirectional financial flow: "
                    f"{len(in_txs)} incoming transfers (INR {in_amt}) and {len(out_txs)} outgoing transfers (INR {out_amt})."
                ),
                detection_rule="Counterparty has observed transactions in both CREDIT and DEBIT directions",
                limitations=(
                    "Bidirectional activity is standard for merchant settlement partners, supplier returns, "
                    "contractor advances with expense reimbursements, or dual customer-supplier relationships."
                ),
                severity=FlagSeverity.INFORMATIONAL,
            )
        )

    # 8. Task E: Round-Trip (Offsetting Transfer) Observations
    matched_pairs: List[RoundTripMatch] = []
    used_tx_ids: Set[str] = set()
    window_delta = timedelta(days=round_trip_window_days)
    tol_dec = Decimal(str(round_trip_tolerance_percent / 100.0))

    # Evaluate each bidirectional counterparty independently
    for cp_id in sorted(bidirectional_cps):
        in_txs = sorted(
            edge_buckets.get((_namespace_counterparty_node(cp_id), biz_node_id), []),
            key=lambda t: (t.timestamp, t.transaction_id),
        )
        out_txs = sorted(
            edge_buckets.get((biz_node_id, _namespace_counterparty_node(cp_id)), []),
            key=lambda t: (t.timestamp, t.transaction_id),
        )

        # Greedily match unpaired credit and debit transactions within window and tolerance
        for credit_tx in in_txs:
            if credit_tx.transaction_id in used_tx_ids:
                continue

            best_debit: Optional[NormalizedTransaction] = None
            best_diff: Optional[Decimal] = None

            for debit_tx in out_txs:
                if debit_tx.transaction_id in used_tx_ids:
                    continue

                # Check temporal window (either order: credit first or debit first)
                time_diff = abs(debit_tx.timestamp - credit_tx.timestamp)
                if time_diff > window_delta:
                    continue

                # Check amount tolerance: |credit - debit| / max(credit, debit) <= tolerance
                max_amt = max(credit_tx.amount, debit_tx.amount)
                amt_diff = abs(credit_tx.amount - debit_tx.amount)
                if max_amt > Decimal("0.00") and (amt_diff / max_amt) <= tol_dec:
                    if best_diff is None or amt_diff < best_diff:
                        best_diff = amt_diff
                        best_debit = debit_tx

            if best_debit is not None:
                used_tx_ids.add(credit_tx.transaction_id)
                used_tx_ids.add(best_debit.transaction_id)

                first_dir = "CREDIT_FIRST" if credit_tx.timestamp <= best_debit.timestamp else "DEBIT_FIRST"
                hrs = abs((best_debit.timestamp - credit_tx.timestamp).total_seconds()) / 3600.0
                matched_val = min(credit_tx.amount, best_debit.amount)

                matched_pairs.append(
                    RoundTripMatch(
                        counterparty_id=cp_id,
                        credit_transaction_id=credit_tx.transaction_id,
                        debit_transaction_id=best_debit.transaction_id,
                        first_direction=first_dir,
                        credit_amount=credit_tx.amount,
                        debit_amount=best_debit.amount,
                        matched_amount=matched_val,
                        amount_difference=abs(credit_tx.amount - best_debit.amount),
                        time_difference_hours=round(hrs, 2),
                        credit_timestamp=credit_tx.timestamp,
                        debit_timestamp=best_debit.timestamp,
                        explanation=(
                            f"Matched {first_dir.replace('_', ' ').lower()} offsetting flow with counterparty '{cp_id}': "
                            f"Credit of INR {credit_tx.amount} and Debit of INR {best_debit.amount} within {hrs:.1f} hours."
                        ),
                        limitations=(
                            "Observed offsetting volume does not establish circular trading or economic intent. "
                            "May represent customer refunds, supplier deposit returns, or temporary operational liquidity."
                        ),
                    )
                )

    total_offsetting_vol = sum((m.matched_amount * 2 for m in matched_pairs), Decimal("0.00"))
    offsetting_share = float(total_offsetting_vol / tot_graph_vol) if tot_graph_vol > Decimal("0.00") else 0.0

    round_trip_obs = RoundTripObservation(
        total_offsetting_volume=total_offsetting_vol,
        offsetting_pairs_count=len(matched_pairs),
        offsetting_volume_share=round(offsetting_share, 4),
        matched_pairs=matched_pairs,
    )

    # 9. Task F: Circular Flow Investigation
    # In a business-centered statement, 2-node cycles (MSME <-> CP) are observed.
    # Multi-entity cycles (A -> B -> C -> A) require external counterparty transfers which are unobserved.
    cycle_investigation = CycleInvestigationResult(
        cycle_investigation_status=CycleInvestigationStatus.NOT_ASSESSABLE,
        observed_two_node_cycles_count=len(bidirectional_cps),
        two_node_cycle_counterparties=sorted(bidirectional_cps),
        multi_entity_cycle_count=0,
    )

    # 10. Task G: Explainable Anomaly Flags
    anomaly_flags: List[ExplainableAnomalyFlag] = []

    # Flag 1: Counterparty Concentration
    if largest_in_share >= concentration_threshold and biz_credits > Decimal("0.00"):
        top_in = top_incoming[0]
        anomaly_flags.append(
            ExplainableAnomalyFlag(
                flag_code=AnomalyFlagCode.COUNTERPARTY_CONCENTRATION,
                title="Elevated Inflow Concentration with Primary Counterparty",
                severity=FlagSeverity.MEDIUM if largest_in_share >= 0.60 else FlagSeverity.LOW,
                detection_rule=f"Single counterparty incoming volume share >= {concentration_threshold * 100:.0f}%",
                supporting_evidence_references=[top_in.counterparty_id],
                observed_metrics={
                    "counterparty_id": top_in.counterparty_id,
                    "counterparty_name": top_in.counterparty_name,
                    "inflow_share": round(top_in.share_of_flow, 4),
                    "inflow_amount": str(top_in.total_amount),
                    "incoming_hhi": in_hhi,
                },
                data_sufficiency_status="SUFFICIENT",
                limitations="Legitimate MSMEs operating as dedicated job-workers or exclusive distributors show high client concentration.",
                interpretation=(
                    f"Counterparty '{top_in.counterparty_id}' provides {top_in.share_of_flow * 100:.1f}% of total identifiable inflows. "
                    "Indicates revenue dependency on an anchor client rather than operational misconduct."
                ),
            )
        )

    if largest_out_share >= concentration_threshold and biz_debits > Decimal("0.00"):
        top_out = top_outgoing[0]
        anomaly_flags.append(
            ExplainableAnomalyFlag(
                flag_code=AnomalyFlagCode.COUNTERPARTY_CONCENTRATION,
                title="Elevated Outflow Concentration with Primary Counterparty",
                severity=FlagSeverity.MEDIUM if largest_out_share >= 0.60 else FlagSeverity.LOW,
                detection_rule=f"Single counterparty outgoing volume share >= {concentration_threshold * 100:.0f}%",
                supporting_evidence_references=[top_out.counterparty_id],
                observed_metrics={
                    "counterparty_id": top_out.counterparty_id,
                    "counterparty_name": top_out.counterparty_name,
                    "outflow_share": round(top_out.share_of_flow, 4),
                    "outflow_amount": str(top_out.total_amount),
                    "outgoing_hhi": out_hhi,
                },
                data_sufficiency_status="SUFFICIENT",
                limitations="Single-source procurement is common among small enterprises dependent on specialized primary suppliers.",
                interpretation=(
                    f"Counterparty '{top_out.counterparty_id}' receives {top_out.share_of_flow * 100:.1f}% of total identifiable outflows. "
                    "Highlights single-supplier dependence for operational procurement."
                ),
            )
        )

    # Flag 2: Bidirectional Activity
    if bidirectional_cps:
        bidi_count = len(bidirectional_cps)
        bidi_share = float(
            sum((cp_nodes_meta[_namespace_counterparty_node(c)]["credit_amount"] + cp_nodes_meta[_namespace_counterparty_node(c)]["debit_amount"] for c in bidirectional_cps), Decimal("0.00"))
            / tot_graph_vol
        ) if tot_graph_vol > Decimal("0.00") else 0.0

        anomaly_flags.append(
            ExplainableAnomalyFlag(
                flag_code=AnomalyFlagCode.BIDIRECTIONAL_ACTIVITY,
                title="Observed Bidirectional Entity Relationships",
                severity=FlagSeverity.LOW if bidi_share < 0.30 else FlagSeverity.MEDIUM,
                detection_rule="Identifiable counterparties exhibiting both incoming and outgoing transaction flows",
                supporting_evidence_references=sorted(bidirectional_cps),
                observed_metrics={
                    "bidirectional_counterparty_count": bidi_count,
                    "bidirectional_volume_share": round(bidi_share, 4),
                    "counterparties": sorted(bidirectional_cps),
                },
                data_sufficiency_status="SUFFICIENT",
                limitations="Natural in commercial setups featuring customer returns, escrow or settlement accounts, or dual-trading partners.",
                interpretation=(
                    f"{bidi_count} counterparty/counterparties exhibit reciprocal financial flows accounting for "
                    f"{bidi_share * 100:.1f}% of observed graph volume. Warrant review to confirm commercial relationship type."
                ),
            )
        )

    # Flag 3: Potentially Offsetting (Round-Trip) Transfers
    if matched_pairs:
        anomaly_flags.append(
            ExplainableAnomalyFlag(
                flag_code=AnomalyFlagCode.POTENTIALLY_OFFSETTING_TRANSFERS,
                title="Observed Potentially Offsetting Transfer Volume",
                severity=FlagSeverity.MEDIUM if offsetting_share >= 0.20 else FlagSeverity.LOW,
                detection_rule=f"Matched credit-debit pairs within {round_trip_window_days} days and {round_trip_tolerance_percent}% amount tolerance",
                supporting_evidence_references=[m.credit_transaction_id for m in matched_pairs] + [m.debit_transaction_id for m in matched_pairs],
                observed_metrics={
                    "offsetting_pairs_count": len(matched_pairs),
                    "total_offsetting_volume": str(total_offsetting_vol),
                    "offsetting_volume_share": round(offsetting_share, 4),
                },
                data_sufficiency_status="SUFFICIENT",
                limitations="Does not confirm circular trading; frequently reflects order cancellations, security deposits, or supplier refunds.",
                interpretation=(
                    f"{len(matched_pairs)} matched pair(s) of reciprocal transfers observed representing "
                    f"INR {total_offsetting_vol} ({offsetting_share * 100:.1f}% of graph volume)."
                ),
            )
        )

    # Flag 4: Repeated Similar Amounts
    similar_amt_obs = [o for o in repeated_observations if o.pattern_type == "REPEATED_IDENTICAL_AMOUNTS"]
    if similar_amt_obs:
        anomaly_flags.append(
            ExplainableAnomalyFlag(
                flag_code=AnomalyFlagCode.REPEATED_SIMILAR_AMOUNTS,
                title="Identical Repeated Transfer Amounts Observed",
                severity=FlagSeverity.INFORMATIONAL,
                detection_rule="Three or more transactions of identical monetary amount with the same counterparty",
                supporting_evidence_references=[
                    tx_id for obs in similar_amt_obs for tx_id in obs.supporting_transaction_ids
                ],
                observed_metrics={
                    "pattern_count": len(similar_amt_obs),
                    "counterparties_involved": sorted(set(
                        node.replace("CP:", "", 1) for obs in similar_amt_obs for node in obs.involved_node_ids if node.startswith("CP:")
                    )),
                },
                data_sufficiency_status="SUFFICIENT",
                limitations="Standard for contractual obligations, retainers, structured rent payments, and fixed recurring debts.",
                interpretation="Transactions of identical recurring amounts were observed, consistent with structured contractual agreements.",
            )
        )

    # Flag 5: Limited Graph Coverage (if missing counterparties exceed 20% of volume)
    if coverage_ratio < 0.80 and total_dataset_volume > Decimal("0.00"):
        anomaly_flags.append(
            ExplainableAnomalyFlag(
                flag_code=AnomalyFlagCode.LIMITED_GRAPH_COVERAGE,
                title="Limited Counterparty Identifiability in Source Statement",
                severity=FlagSeverity.LOW if coverage_ratio >= 0.50 else FlagSeverity.MEDIUM,
                detection_rule="Graph-represented transaction volume < 80% of total dataset volume",
                supporting_evidence_references=[],
                observed_metrics={
                    "coverage_ratio": round(coverage_ratio, 4),
                    "unrepresented_transaction_count": unrepresented_count,
                    "unrepresented_volume": str(unrepresented_volume),
                },
                data_sufficiency_status="PARTIAL",
                limitations="Missing counterparty identifiers are common in legacy cash deposits, unannotated bank transfers, or truncated narrations.",
                interpretation=(
                    f"Only {coverage_ratio * 100:.1f}% of transaction volume carries identifiable counterparties. "
                    "Graph topological analysis covers identifiable relationships only."
                ),
            )
        )

    # Flag 6: Insufficient Multi-Entity Cycle Evidence
    anomaly_flags.append(
        ExplainableAnomalyFlag(
            flag_code=AnomalyFlagCode.INSUFFICIENT_CYCLE_EVIDENCE,
            title="Multi-Entity Circular Flow Unassessable from Single Account Statement",
            severity=FlagSeverity.INFORMATIONAL,
            detection_rule="Source dataset contains transactions relative to MSME only; external entity transfers are unobserved",
            supporting_evidence_references=[],
            observed_metrics={
                "cycle_investigation_status": CycleInvestigationStatus.NOT_ASSESSABLE.value,
                "two_node_cycles_count": len(bidirectional_cps),
            },
            data_sufficiency_status="INSUFFICIENT_DATA",
            limitations="External counterparty-to-counterparty bank records cannot be manufactured or inferred.",
            interpretation=(
                "Evaluating closed multi-party circular flows requires multi-bank transaction data across external counterparties. "
                "Per clinical safety rules, external edges are not fabricated."
            ),
        )
    )

    # Return fully constructed GraphAnalysisResult
    return GraphAnalysisResult(
        business_id=business_id,
        business_node_id=biz_node_id,
        graph_statistics=graph_stats,
        nodes=serialized_nodes,
        edges=serialized_edges,
        counterparty_summaries=cp_summaries,
        concentration=concentration_metrics,
        repeated_transfers=repeated_observations,
        round_trip_observations=round_trip_obs,
        cycle_investigation=cycle_investigation,
        anomaly_flags=anomaly_flags,
        data_coverage=data_coverage,
    )
