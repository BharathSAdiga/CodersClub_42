"""UDYOGA — Financial Intelligence Module: Downstream Contract Adapters.

Transforms internal financial intelligence structures into safe, standardized formats
for downstream consumers:
1. Agent Orchestration (Atharv's ACIE Underwriting & Explainability agent)
2. Resilience Simulation Engine
3. Frontend API Payloads (Waveform points, D3 network graph nodes & edges)

Invariants:
- Zero fabrication of unsupported metrics (e.g. credit scores, account balances, default probabilities).
- Pure deterministic mapping.
- Decimals converted to strings for exact precision, or floats for UI charts where documented.
"""

from __future__ import annotations

from decimal import Decimal
from typing import Any, Dict, List, Optional

from app.modules.financial_intelligence.cashflow_series import (
    CashflowPeriodBucket,
    CashflowSeriesResult,
    ResilienceInputResult,
)
from app.modules.financial_intelligence.dna_engine import FinancialDnaReport
from app.modules.financial_intelligence.graph_analyzer import GraphAnalysisResult


def adapt_to_cashflow_waveform(
    monthly_or_weekly_series: CashflowSeriesResult,
) -> List[Dict[str, Any]]:
    """Converts a cashflow series into frontend-compatible waveform points.

    Conforms to the schema expected by `FinancialAggregatedPayload.cashFlowWaveform`:
    Array<{ date: string; inflow: number; outflow: number; netBalance: number }>
    """
    points: List[Dict[str, Any]] = []
    for bucket in monthly_or_weekly_series.buckets:
        points.append({
            "date": bucket.period_id,
            "periodStart": bucket.period_start.isoformat(),
            "periodEnd": bucket.period_end.isoformat(),
            "inflow": float(bucket.observed_credit_total),
            "outflow": float(bucket.observed_debit_total),
            "netBalance": float(bucket.observed_net_cashflow),
            "operatingSurplusProxy": float(bucket.operating_cash_surplus_proxy),
            "isMissingPeriod": bucket.is_missing_period,
            "coverageStatus": bucket.coverage_status.value,
        })
    return points


def adapt_to_graph_visualization(
    graph_result: GraphAnalysisResult,
) -> Dict[str, Any]:
    """Formats graph nodes and directed edges for frontend network graphs (D3 / Cytoscape)."""
    nodes = []
    for n in graph_result.nodes:
        nodes.append({
            "id": n.node_id,
            "label": n.display_label,
            "rawId": n.raw_entity_id,
            "type": n.node_type.value,
            "transactionCount": n.observed_transaction_count,
            "creditVolume": str(n.observed_credit_amount),
            "debitVolume": str(n.observed_debit_amount),
        })

    edges = []
    for e in graph_result.edges:
        edges.append({
            "source": e.source,
            "target": e.target,
            "directionType": e.direction_type,
            "transactionCount": e.transaction_count,
            "totalAmount": str(e.total_amount),
            "categories": e.relevant_categories,
        })

    return {
        "businessNodeId": graph_result.business_node_id,
        "nodes": nodes,
        "edges": edges,
        "metrics": {
            "nodeCount": graph_result.graph_statistics.total_nodes,
            "edgeCount": graph_result.graph_statistics.total_edges,
            "bidirectionalCount": graph_result.graph_statistics.bidirectional_counterparty_count,
            "incomingHhi": graph_result.concentration.incoming_hhi,
            "outgoingHhi": graph_result.concentration.outgoing_hhi,
            "volumeCoverageRatio": graph_result.data_coverage.graph_volume_coverage_ratio,
        },
    }


def adapt_to_underwriting_dossier(
    dna_report: Optional[FinancialDnaReport],
    graph_result: Optional[GraphAnalysisResult],
    monthly_series: Optional[CashflowSeriesResult],
) -> Dict[str, Any]:
    """Prepares an objective, evidence-backed financial dossier for Atharv's Agent Orchestrator.

    Contains verified observed metrics and explicit limitation disclaimers.
    Does NOT assert loan approval, credit scores, or fraud accusations.
    """
    dossier: Dict[str, Any] = {
        "financialVitality": {},
        "revenueIntelligence": {},
        "counterpartyRisk": {},
        "repaymentHistory": {},
        "dataSufficiency": {},
        "disclaimers": [
            "All metrics reflect observed bank statements and transaction feeds.",
            "Missing counterparties or statement periods are explicitly isolated.",
            "Credit vitality proxy does not constitute a certified credit bureau score.",
        ],
    }

    if dna_report:
        dossier["financialVitality"] = {
            "totalObservedInflow": str(dna_report.cash_flow_activity.total_credits),
            "totalObservedOutflow": str(dna_report.cash_flow_activity.total_debits),
            "netObservedCashFlow": str(dna_report.cash_flow_activity.net_observed_cashflow),
            "inflowOutflowRatio": (
                float(dna_report.cash_flow_activity.inflow_to_outflow_ratio)
                if dna_report.cash_flow_activity.inflow_to_outflow_ratio is not None
                else None
            ),
        }
        dossier["revenueIntelligence"] = {
            "observedRevenue": str(dna_report.revenue_intelligence.observed_business_revenue),
            "revenueTransactionCount": dna_report.revenue_intelligence.revenue_transaction_count,
            "avgMonthlyRevenue": str(dna_report.revenue_intelligence.avg_monthly_revenue) if dna_report.revenue_intelligence.avg_monthly_revenue else None,
            "revenueTrend": dna_report.revenue_intelligence.revenue_trend_direction,
        }
        dossier["repaymentHistory"] = {
            "totalRepaymentsObserved": str(dna_report.debt_repayments.observed_debt_repayments_total),
            "repaymentCount": dna_report.debt_repayments.debt_repayment_transaction_count,
            "observedFrequency": dna_report.debt_repayments.observed_repayment_frequency,
        }

    if graph_result:
        dossier["counterpartyRisk"] = {
            "identifiableCounterpartyCount": graph_result.graph_statistics.identifiable_counterparty_count,
            "incomingHhi": graph_result.concentration.incoming_hhi,
            "largestIncomingCounterpartyShare": graph_result.concentration.largest_incoming_counterparty_share,
            "bidirectionalCount": graph_result.graph_statistics.bidirectional_counterparty_count,
            "offsettingVolume": str(graph_result.round_trip_observations.total_offsetting_volume),
            "cycleInvestigationStatus": graph_result.cycle_investigation.cycle_investigation_status.value,
            "anomalyFlags": [
                {
                    "code": f.flag_code.value,
                    "title": f.title,
                    "severity": f.severity.value,
                    "interpretation": f.interpretation,
                }
                for f in graph_result.anomaly_flags
            ],
        }

    if monthly_series:
        dossier["dataSufficiency"] = {
            "totalBuckets": monthly_series.continuity.total_buckets,
            "observedActivityPeriods": monthly_series.continuity.observed_activity_periods,
            "missingPeriods": monthly_series.continuity.missing_periods,
            "positiveNetPeriods": monthly_series.continuity.positive_net_cashflow_periods,
            "seasonalityStatus": monthly_series.seasonality.seasonality_status.value,
        }

    return dossier
