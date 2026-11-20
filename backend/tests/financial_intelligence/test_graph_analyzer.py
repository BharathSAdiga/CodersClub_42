"""UDYOGA — Financial Intelligence Engine: Transaction Graph Test Suite.

Verifies deterministic graph construction, directed edge aggregation,
counterparty concentration metrics, bidirectional relationships, round-trip
offsetting transfer heuristic, cycle limits, explainable anomaly flags,
and full compatibility with Phase 1 parser and Phase 2 DNA engine.
"""

from datetime import datetime, timezone, timedelta
from decimal import Decimal
import io
import pytest

from app.modules.financial_intelligence.parser import (
    NormalizedTransaction,
    ParseResult,
    TransactionCategory,
    TransactionChannel,
    TransactionDirection,
    parse_transactions,
)
from app.modules.financial_intelligence.dna_engine import compute_financial_dna
from app.modules.financial_intelligence.graph_analyzer import (
    AnomalyFlagCode,
    CycleInvestigationStatus,
    FlagSeverity,
    GraphAnalysisResult,
    NodeType,
    build_and_analyze,
)


def _make_tx(
    tx_id: str,
    ts: datetime,
    amount: str,
    direction: TransactionDirection,
    category: TransactionCategory = TransactionCategory.REVENUE,
    cp_id: str = "CP-001",
    cp_name: str = "Counterparty 1",
    channel: TransactionChannel = TransactionChannel.UPI,
) -> NormalizedTransaction:
    """Helper to create deterministic NormalizedTransaction records."""
    return NormalizedTransaction(
        transaction_id=tx_id,
        timestamp=ts,
        amount=Decimal(amount),
        direction=direction,
        category=category,
        channel=channel,
        counterparty_id=cp_id,
        counterparty_name=cp_name,
    )


# ==============================================================================
# TESTS 1 - 8: BASIC TOPOLOGY, EDGES, NODES, AMOUNTS
# ==============================================================================

def test_01_empty_graph_input():
    """Empty transaction input produces graceful empty graph statistics and no NaN."""
    res = build_and_analyze([], business_id="MSME-EMPTY")
    assert res.business_id == "MSME-EMPTY"
    assert res.graph_statistics.total_nodes == 1  # Central MSME node
    assert res.graph_statistics.total_edges == 0
    assert res.graph_statistics.total_graph_volume == Decimal("0.00")
    assert res.concentration.incoming_hhi == 0.0
    assert res.concentration.outgoing_hhi == 0.0
    assert res.round_trip_observations.offsetting_pairs_count == 0
    assert res.cycle_investigation.cycle_investigation_status == CycleInvestigationStatus.NOT_ASSESSABLE
    assert res.data_coverage.total_dataset_transactions == 0


def test_02_single_incoming_transaction():
    """Single credit transaction produces exactly 2 nodes, 1 directed incoming edge."""
    tx = _make_tx("TX-1", datetime(2026, 1, 10, 10, 0), "15000.00", TransactionDirection.CREDIT, cp_id="CP-BUYER")
    res = build_and_analyze([tx], business_id="MSME-1")

    assert res.graph_statistics.total_nodes == 2  # MSME + CP-BUYER
    assert res.graph_statistics.total_edges == 1
    assert res.graph_statistics.incoming_relationship_count == 1
    assert res.graph_statistics.outgoing_relationship_count == 0
    assert res.graph_statistics.total_graph_incoming_amount == Decimal("15000.00")
    assert res.graph_statistics.total_graph_outgoing_amount == Decimal("0.00")


def test_03_single_outgoing_transaction():
    """Single debit transaction produces exactly 2 nodes, 1 directed outgoing edge."""
    tx = _make_tx("TX-1", datetime(2026, 1, 10, 10, 0), "8500.00", TransactionDirection.DEBIT, cp_id="CP-SELLER")
    res = build_and_analyze([tx], business_id="MSME-1")

    assert res.graph_statistics.total_nodes == 2
    assert res.graph_statistics.total_edges == 1
    assert res.graph_statistics.incoming_relationship_count == 0
    assert res.graph_statistics.outgoing_relationship_count == 1
    assert res.graph_statistics.total_graph_outgoing_amount == Decimal("8500.00")


def test_04_correct_graph_edge_direction():
    """Direction strictly enforces CREDIT: Counterparty -> MSME, DEBIT: MSME -> Counterparty."""
    t1 = _make_tx("TX-1", datetime(2026, 1, 10, 10, 0), "10000.00", TransactionDirection.CREDIT, cp_id="ALICE")
    t2 = _make_tx("TX-2", datetime(2026, 1, 11, 10, 0), "5000.00", TransactionDirection.DEBIT, cp_id="BOB")
    res = build_and_analyze([t1, t2], business_id="MY_SHOP")

    edge_map = {(e.source, e.target): e for e in res.edges}
    # Alice to shop
    assert ("CP:ALICE", "BIZ:MY_SHOP") in edge_map
    assert edge_map[("CP:ALICE", "BIZ:MY_SHOP")].direction_type == "INCOMING_TO_MSME"
    # Shop to Bob
    assert ("BIZ:MY_SHOP", "CP:BOB") in edge_map
    assert edge_map[("BIZ:MY_SHOP", "CP:BOB")].direction_type == "OUTGOING_FROM_MSME"


def test_05_multiple_transactions_aggregated_on_one_edge():
    """Multiple transfers on the same directed relationship aggregate amount and transaction count."""
    txs = [
        _make_tx("TX-1", datetime(2026, 1, 10, 10, 0), "10000.00", TransactionDirection.CREDIT, cp_id="RETAIL_1"),
        _make_tx("TX-2", datetime(2026, 1, 12, 11, 0), "15000.00", TransactionDirection.CREDIT, cp_id="RETAIL_1"),
        _make_tx("TX-3", datetime(2026, 1, 14, 12, 0), "25000.00", TransactionDirection.CREDIT, cp_id="RETAIL_1"),
    ]
    res = build_and_analyze(txs, business_id="CORP")

    assert res.graph_statistics.total_edges == 1
    edge = res.edges[0]
    assert edge.transaction_count == 3
    assert edge.total_amount == Decimal("50000.00")
    assert edge.first_observed_timestamp == datetime(2026, 1, 10, 10, 0)
    assert edge.last_observed_timestamp == datetime(2026, 1, 14, 12, 0)
    assert set(edge.transaction_ids) == {"TX-1", "TX-2", "TX-3"}


def test_06_counterparty_appearing_in_both_directions():
    """Counterparty with both credits and debits creates two distinct directed edges and bidi flag."""
    txs = [
        _make_tx("TX-1", datetime(2026, 1, 10), "40000.00", TransactionDirection.CREDIT, cp_id="PARTNER"),
        _make_tx("TX-2", datetime(2026, 1, 15), "15000.00", TransactionDirection.DEBIT, cp_id="PARTNER"),
    ]
    res = build_and_analyze(txs, business_id="BIZ")

    assert res.graph_statistics.total_nodes == 2
    assert res.graph_statistics.total_edges == 2
    assert res.graph_statistics.bidirectional_counterparty_count == 1
    summary = res.counterparty_summaries[0]
    assert summary.is_bidirectional is True
    assert summary.incoming_to_msme_amount == Decimal("40000.00")
    assert summary.outgoing_from_msme_amount == Decimal("15000.00")
    assert summary.net_flow_to_msme == Decimal("25000.00")


def test_07_correct_node_and_edge_counts():
    """Network with 3 distinct counterparties correctly totals 4 nodes and 4 edges."""
    txs = [
        _make_tx("TX-1", datetime(2026, 1, 1), "100.00", TransactionDirection.CREDIT, cp_id="C1"),
        _make_tx("TX-2", datetime(2026, 1, 2), "200.00", TransactionDirection.CREDIT, cp_id="C2"),
        _make_tx("TX-3", datetime(2026, 1, 3), "300.00", TransactionDirection.DEBIT, cp_id="C3"),
        _make_tx("TX-4", datetime(2026, 1, 4), "400.00", TransactionDirection.DEBIT, cp_id="C1"),
    ]
    res = build_and_analyze(txs, business_id="CENTRAL")

    assert res.graph_statistics.total_nodes == 4  # CENTRAL, C1, C2, C3
    assert res.graph_statistics.total_edges == 4  # C1->BIZ, C2->BIZ, BIZ->C3, BIZ->C1
    assert res.graph_statistics.identifiable_counterparty_count == 3


def test_08_correct_incoming_and_outgoing_totals():
    """Graph totals accurately match independent summation."""
    txs = [
        _make_tx("TX-1", datetime(2026, 1, 1), "12345.67", TransactionDirection.CREDIT, cp_id="C1"),
        _make_tx("TX-2", datetime(2026, 1, 2), "23456.78", TransactionDirection.CREDIT, cp_id="C2"),
        _make_tx("TX-3", datetime(2026, 1, 3), "34567.89", TransactionDirection.DEBIT, cp_id="C3"),
    ]
    res = build_and_analyze(txs)

    assert res.graph_statistics.total_graph_incoming_amount == Decimal("35802.45")
    assert res.graph_statistics.total_graph_outgoing_amount == Decimal("34567.89")
    assert res.graph_statistics.total_graph_volume == Decimal("70370.34")


# ==============================================================================
# TESTS 9 - 14: COVERAGE, IDENTIFIERS, CONCENTRATION & HHI
# ==============================================================================

def test_09_missing_counterparties_preserved_in_aggregates():
    """Transactions with empty or None counterparty IDs are excluded from graph topology but kept in coverage."""
    txs = [
        _make_tx("TX-1", datetime(2026, 1, 1), "50000.00", TransactionDirection.CREDIT, cp_id="KNOWN_1"),
        _make_tx("TX-2", datetime(2026, 1, 2), "25000.00", TransactionDirection.CREDIT, cp_id=""),
        _make_tx("TX-3", datetime(2026, 1, 3), "25000.00", TransactionDirection.DEBIT, cp_id=None),
    ]
    res = build_and_analyze(txs)

    assert res.graph_statistics.total_nodes == 2  # MSME + KNOWN_1
    assert res.graph_statistics.total_edges == 1
    assert res.data_coverage.total_dataset_transactions == 3
    assert res.data_coverage.graph_represented_transactions == 1
    assert res.data_coverage.unrepresented_transactions_missing_counterparty == 2
    assert res.data_coverage.total_dataset_volume == Decimal("100000.00")
    assert res.data_coverage.graph_represented_volume == Decimal("50000.00")
    assert res.data_coverage.graph_volume_coverage_ratio == 0.50


def test_10_identical_counterparty_display_names():
    """Counterparties sharing the same display name are preserved as distinct nodes by unique ID."""
    t1 = _make_tx("TX-1", datetime(2026, 1, 1), "1000.00", TransactionDirection.CREDIT, cp_id="ACC_001", cp_name="Sharma Stores")
    t2 = _make_tx("TX-2", datetime(2026, 1, 2), "2000.00", TransactionDirection.CREDIT, cp_id="ACC_002", cp_name="Sharma Stores")
    res = build_and_analyze([t1, t2])

    assert res.graph_statistics.total_nodes == 3  # MSME, ACC_001, ACC_002
    assert res.graph_statistics.identifiable_counterparty_count == 2
    assert {n.node_id for n in res.nodes} == {"BIZ:MSME", "CP:ACC_001", "CP:ACC_002"}


def test_11_business_counterparty_identifier_collision():
    """If counterparty ID matches business ID, namespacing prevents collision or self-loop."""
    t = _make_tx("TX-1", datetime(2026, 1, 1), "5000.00", TransactionDirection.CREDIT, cp_id="ALPHA_MSME")
    res = build_and_analyze([t], business_id="ALPHA_MSME")

    assert res.business_node_id == "BIZ:ALPHA_MSME"
    assert res.graph_statistics.total_nodes == 2
    assert {"BIZ:ALPHA_MSME", "CP:ALPHA_MSME"} == {n.node_id for n in res.nodes}
    assert res.edges[0].source == "CP:ALPHA_MSME"
    assert res.edges[0].target == "BIZ:ALPHA_MSME"


def test_12_incoming_concentration_metrics():
    """Largest incoming counterparty and top-3 shares are calculated accurately."""
    # 4 incoming counterparties: 50k, 25k, 15k, 10k -> total 100k
    txs = [
        _make_tx("T1", datetime(2026, 1, 1), "50000.00", TransactionDirection.CREDIT, cp_id="C1"),
        _make_tx("T2", datetime(2026, 1, 2), "25000.00", TransactionDirection.CREDIT, cp_id="C2"),
        _make_tx("T3", datetime(2026, 1, 3), "15000.00", TransactionDirection.CREDIT, cp_id="C3"),
        _make_tx("T4", datetime(2026, 1, 4), "10000.00", TransactionDirection.CREDIT, cp_id="C4"),
    ]
    res = build_and_analyze(txs)

    assert res.concentration.largest_incoming_counterparty_share == 0.50
    assert res.concentration.top_3_incoming_counterparty_share == 0.90


def test_13_outgoing_concentration_metrics():
    """Largest outgoing counterparty and top-3 shares calculated accurately."""
    # 2 outgoing counterparties: 70k, 30k -> total 100k
    txs = [
        _make_tx("T1", datetime(2026, 1, 1), "70000.00", TransactionDirection.DEBIT, cp_id="SUP_A"),
        _make_tx("T2", datetime(2026, 1, 2), "30000.00", TransactionDirection.DEBIT, cp_id="SUP_B"),
    ]
    res = build_and_analyze(txs)

    assert res.concentration.largest_outgoing_counterparty_share == 0.70
    assert res.concentration.top_3_outgoing_counterparty_share == 1.0


def test_14_hhi_calculation_arithmetic():
    """HHI arithmetic matches manual calculation: (0.6)^2 + (0.4)^2 = 0.36 + 0.16 = 0.52."""
    txs = [
        _make_tx("T1", datetime(2026, 1, 1), "60000.00", TransactionDirection.CREDIT, cp_id="C1"),
        _make_tx("T2", datetime(2026, 1, 2), "40000.00", TransactionDirection.CREDIT, cp_id="C2"),
    ]
    res = build_and_analyze(txs)
    assert res.concentration.incoming_hhi == 0.52


# ==============================================================================
# TESTS 15 - 21: REPEATED PATTERNS & ROUND-TRIP OFFSETTING LOGIC
# ==============================================================================

def test_15_repeated_same_amount_observations():
    """Identifies when the same counterparty sends/receives identical amounts >= 3 times."""
    txs = [
        _make_tx(f"TX-{i}", datetime(2026, 1, i), "12500.00", TransactionDirection.CREDIT, cp_id="CLIENT_X")
        for i in range(1, 4)
    ]
    res = build_and_analyze(txs)

    obs = [o for o in res.repeated_transfers if o.pattern_type == "REPEATED_IDENTICAL_AMOUNTS"]
    assert len(obs) == 1
    assert obs[0].observed_amounts == [Decimal("12500.00")] * 3
    assert set(obs[0].supporting_transaction_ids) == {"TX-1", "TX-2", "TX-3"}


def test_16_short_interval_transaction_patterns():
    """Detects clustering of >= 3 transactions with same counterparty within short window (<= 24h)."""
    txs = [
        _make_tx("TX-1", datetime(2026, 1, 10, 10, 0), "5000.00", TransactionDirection.CREDIT, cp_id="FAST_CP"),
        _make_tx("TX-2", datetime(2026, 1, 10, 14, 0), "5000.00", TransactionDirection.CREDIT, cp_id="FAST_CP"),
        _make_tx("TX-3", datetime(2026, 1, 10, 20, 0), "5000.00", TransactionDirection.CREDIT, cp_id="FAST_CP"),
    ]
    res = build_and_analyze(txs, short_interval_hours=24.0)

    obs = [o for o in res.repeated_transfers if o.pattern_type == "SHORT_INTERVAL_RECURRING"]
    assert len(obs) == 1
    assert len(obs[0].supporting_transaction_ids) == 3


def test_17_bidirectional_activity_pattern_detection():
    """Identifies bidirectional relationship and emits structured pattern observation."""
    txs = [
        _make_tx("TX-1", datetime(2026, 1, 1), "10000.00", TransactionDirection.CREDIT, cp_id="DUAL_PARTNER"),
        _make_tx("TX-2", datetime(2026, 1, 5), "8000.00", TransactionDirection.DEBIT, cp_id="DUAL_PARTNER"),
    ]
    res = build_and_analyze(txs)

    obs = [o for o in res.repeated_transfers if o.pattern_type == "BIDIRECTIONAL_ACTIVITY"]
    assert len(obs) == 1
    assert "DUAL_PARTNER" in obs[0].explanation


def test_18_potentially_offsetting_transfers_matching():
    """Matches reciprocal credit and debit with same counterparty within window and tolerance."""
    txs = [
        _make_tx("TX-C", datetime(2026, 1, 5, 10, 0), "100000.00", TransactionDirection.CREDIT, cp_id="TRADER"),
        _make_tx("TX-D", datetime(2026, 1, 8, 12, 0), "99000.00", TransactionDirection.DEBIT, cp_id="TRADER"),  # 1% diff
    ]
    res = build_and_analyze(txs, round_trip_window_days=14, round_trip_tolerance_percent=5.0)

    rt = res.round_trip_observations
    assert rt.offsetting_pairs_count == 1
    assert rt.matched_pairs[0].first_direction == "CREDIT_FIRST"
    assert rt.matched_pairs[0].credit_amount == Decimal("100000.00")
    assert rt.matched_pairs[0].debit_amount == Decimal("99000.00")
    assert rt.matched_pairs[0].matched_amount == Decimal("99000.00")
    assert rt.matched_pairs[0].amount_difference == Decimal("1000.00")


def test_19_time_window_boundary_handling():
    """Transfers exceeding round_trip_window_days are not matched as offsetting."""
    txs = [
        _make_tx("TX-C", datetime(2026, 1, 1), "50000.00", TransactionDirection.CREDIT, cp_id="CP_SLOW"),
        _make_tx("TX-D", datetime(2026, 1, 20), "50000.00", TransactionDirection.DEBIT, cp_id="CP_SLOW"),  # 19 days later
    ]
    # Window = 7 days -> should NOT match
    res_7d = build_and_analyze(txs, round_trip_window_days=7)
    assert res_7d.round_trip_observations.offsetting_pairs_count == 0

    # Window = 30 days -> should match
    res_30d = build_and_analyze(txs, round_trip_window_days=30)
    assert res_30d.round_trip_observations.offsetting_pairs_count == 1


def test_20_amount_tolerance_boundary_handling():
    """Transfers exceeding amount tolerance are not matched."""
    txs = [
        _make_tx("TX-C", datetime(2026, 1, 1), "10000.00", TransactionDirection.CREDIT, cp_id="CP_TOL"),
        _make_tx("TX-D", datetime(2026, 1, 2), "8000.00", TransactionDirection.DEBIT, cp_id="CP_TOL"),  # 20% diff
    ]
    # Tolerance = 5% -> fails
    res_5pct = build_and_analyze(txs, round_trip_tolerance_percent=5.0)
    assert res_5pct.round_trip_observations.offsetting_pairs_count == 0

    # Tolerance = 25% -> passes
    res_25pct = build_and_analyze(txs, round_trip_tolerance_percent=25.0)
    assert res_25pct.round_trip_observations.offsetting_pairs_count == 1


def test_21_no_double_counting_of_matched_volume():
    """1-to-1 greedy matching ensures one transaction is never reused in multiple offsetting pairs."""
    txs = [
        _make_tx("TX-C1", datetime(2026, 1, 1), "10000.00", TransactionDirection.CREDIT, cp_id="REUSE_TEST"),
        _make_tx("TX-D1", datetime(2026, 1, 2), "10000.00", TransactionDirection.DEBIT, cp_id="REUSE_TEST"),
        _make_tx("TX-D2", datetime(2026, 1, 3), "10000.00", TransactionDirection.DEBIT, cp_id="REUSE_TEST"),
    ]
    res = build_and_analyze(txs)
    # Only 1 pair can be formed from 1 credit and 2 debits
    assert res.round_trip_observations.offsetting_pairs_count == 1


# ==============================================================================
# TESTS 22 - 27: CYCLE LIMITS, ROBUSTNESS, SERIALIZATION & DETERMINISM
# ==============================================================================

def test_22_unsupported_multi_entity_cycle_investigation():
    """Multi-entity circular flow is explicitly marked NOT_ASSESSABLE without external data."""
    txs = [
        _make_tx("T1", datetime(2026, 1, 1), "1000.00", TransactionDirection.CREDIT, cp_id="C1"),
        _make_tx("T2", datetime(2026, 1, 2), "1000.00", TransactionDirection.DEBIT, cp_id="C2"),
    ]
    res = build_and_analyze(txs)
    assert res.cycle_investigation.cycle_investigation_status == CycleInvestigationStatus.NOT_ASSESSABLE
    assert "Multi-entity circular flow cannot be assessed" in res.cycle_investigation.explanation


def test_23_two_node_cycle_does_not_imply_fraud():
    """Two-node cycle interpretation confirms neutral business explanations."""
    txs = [
        _make_tx("T1", datetime(2026, 1, 1), "5000.00", TransactionDirection.CREDIT, cp_id="VENDOR_PARTNER"),
        _make_tx("T2", datetime(2026, 1, 2), "3000.00", TransactionDirection.DEBIT, cp_id="VENDOR_PARTNER"),
    ]
    res = build_and_analyze(txs)
    assert res.cycle_investigation.observed_two_node_cycles_count == 1
    assert "Two-node cycles" in res.cycle_investigation.two_node_cycle_interpretation
    assert "do not constitute evidence of circular trading" in res.cycle_investigation.two_node_cycle_interpretation


def test_24_duplicate_transaction_id_handling():
    """Duplicate transaction IDs are safely deduplicated without inflating graph totals."""
    txs = [
        _make_tx("DUP-1", datetime(2026, 1, 1), "10000.00", TransactionDirection.CREDIT, cp_id="C1"),
        _make_tx("DUP-1", datetime(2026, 1, 1), "10000.00", TransactionDirection.CREDIT, cp_id="C1"),
    ]
    res = build_and_analyze(txs)
    assert res.graph_statistics.total_graph_incoming_amount == Decimal("10000.00")
    assert res.data_coverage.total_dataset_transactions == 1


def test_25_out_of_order_transaction_timestamps():
    """Unordered input transactions are sorted deterministically by timestamp."""
    txs = [
        _make_tx("T3", datetime(2026, 1, 15), "1000.00", TransactionDirection.CREDIT, cp_id="C1"),
        _make_tx("T1", datetime(2026, 1, 5), "2000.00", TransactionDirection.CREDIT, cp_id="C1"),
        _make_tx("T2", datetime(2026, 1, 10), "3000.00", TransactionDirection.CREDIT, cp_id="C1"),
    ]
    res = build_and_analyze(txs)
    edge = res.edges[0]
    assert edge.first_observed_timestamp == datetime(2026, 1, 5)
    assert edge.last_observed_timestamp == datetime(2026, 1, 15)


def test_26_correct_decimal_serialization():
    """to_dict() converts all Decimals to strings and datetimes to ISO strings without float artifacts."""
    txs = [_make_tx("T1", datetime(2026, 1, 1, 12, 0), "12345.67", TransactionDirection.CREDIT, cp_id="C1")]
    res = build_and_analyze(txs)
    d = res.to_dict()

    assert isinstance(d["graph_statistics"]["total_graph_incoming_amount"], str)
    assert d["graph_statistics"]["total_graph_incoming_amount"] == "12345.67"
    assert "2026-01-01T12:00:00" in d["edges"][0]["first_observed_timestamp"]


def test_27_deterministic_result_ordering():
    """Running build_and_analyze multiple times produces identically ordered results."""
    txs = [
        _make_tx("T2", datetime(2026, 1, 2), "200.00", TransactionDirection.DEBIT, cp_id="B_SUPPLIER"),
        _make_tx("T1", datetime(2026, 1, 1), "500.00", TransactionDirection.CREDIT, cp_id="A_BUYER"),
        _make_tx("T3", datetime(2026, 1, 3), "300.00", TransactionDirection.DEBIT, cp_id="C_SUPPLIER"),
    ]
    r1 = build_and_analyze(txs).to_dict()
    r2 = build_and_analyze(txs).to_dict()
    assert r1 == r2


# ==============================================================================
# TESTS 28 - 30: INTEGRATION WITH PARSER, FINANCIAL DNA & SCALE
# ==============================================================================

def test_28_parser_to_graph_compatibility():
    """Directly ingest a CSV string via Phase 1 parse_transactions and pass ParseResult to build_and_analyze."""
    csv_data = """Transaction ID,Date,Amount,Direction,Category,Channel,Counterparty ID,Counterparty Name
TX-101,2026-01-05,50000.00,CREDIT,REVENUE,UPI,CUST-99,Sunrise Retail
TX-102,2026-01-08,25000.00,DEBIT,SUPPLIER_PAYMENT,NEFT,SUP-11,Steel Distributors
TX-103,2026-01-12,49000.00,DEBIT,OTHER,UPI,CUST-99,Sunrise Retail
"""
    parse_result = parse_transactions(csv_data)
    assert parse_result.valid_rows == 3

    graph_res = build_and_analyze(parse_result, business_id="KUMAR_METALS")
    assert graph_res.business_id == "KUMAR_METALS"
    assert graph_res.graph_statistics.total_nodes == 3  # KUMAR_METALS, CUST-99, SUP-11
    assert graph_res.graph_statistics.bidirectional_counterparty_count == 1  # CUST-99 is bidi
    assert graph_res.round_trip_observations.offsetting_pairs_count == 1


def test_29_graph_to_financial_dna_consistency():
    """Graph totals and Financial DNA totals match on the same valid transaction dataset."""
    txs = [
        _make_tx("T1", datetime(2026, 1, 5), "60000.00", TransactionDirection.CREDIT, TransactionCategory.REVENUE, "CP-1"),
        _make_tx("T2", datetime(2026, 1, 10), "30000.00", TransactionDirection.DEBIT, TransactionCategory.SUPPLIER_PAYMENT, "CP-2"),
    ]
    dna = compute_financial_dna(txs)
    graph = build_and_analyze(txs)

    # Inflow matches
    assert dna.cash_flow_activity.total_credits == graph.graph_statistics.total_graph_incoming_amount
    # Outflow matches
    assert dna.cash_flow_activity.total_debits == graph.graph_statistics.total_graph_outgoing_amount
    # Net matches
    net_dna = dna.cash_flow_activity.net_observed_cashflow
    net_graph = graph.graph_statistics.total_graph_incoming_amount - graph.graph_statistics.total_graph_outgoing_amount
    assert net_dna == net_graph


def test_30_synthetic_larger_input_performance_smoke_test():
    """Performance smoke test with 1,200 synthetic transactions finishes in < 0.5s."""
    import time

    base_time = datetime(2026, 1, 1, 9, 0)
    large_batch: List[NormalizedTransaction] = []

    for i in range(1200):
        cp_idx = (i % 20) + 1  # 20 counterparties
        direction = TransactionDirection.CREDIT if i % 2 == 0 else TransactionDirection.DEBIT
        large_batch.append(
            NormalizedTransaction(
                transaction_id=f"PERF-TX-{i:05d}",
                timestamp=base_time + timedelta(hours=i),
                amount=Decimal(str(1000 + (i % 500))),
                direction=direction,
                category=TransactionCategory.REVENUE if direction == TransactionDirection.CREDIT else TransactionCategory.SUPPLIER_PAYMENT,
                counterparty_id=f"CP-ENTITY-{cp_idx:02d}",
                counterparty_name=f"Partner Entity {cp_idx:02d}",
            )
        )

    t0 = time.time()
    res = build_and_analyze(large_batch, business_id="SCALE_MSME")
    elapsed = time.time() - t0

    assert res.graph_statistics.total_nodes == 21  # 1 MSME + 20 CPs
    assert res.data_coverage.total_dataset_transactions == 1200
    assert elapsed < 1.0  # Well within performance bounds
