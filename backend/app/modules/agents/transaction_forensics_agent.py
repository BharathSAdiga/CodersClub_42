import time
import math
from typing import Optional, List, Dict, Any, Set
from collections import defaultdict
import networkx as nx

from ...schemas.graph import GraphMetrics, GraphNode, GraphEdge
from .base_agent import BaseAgent
from .context import AssessmentContext

class TransactionForensicsAgent(BaseAgent):
    """
    Transaction Forensics Agent.
    Investigates transaction graph topology, circular flow cycles, counterparty entropy,
    and reciprocal transfers using NetworkX.
    
    Guarantees:
    - Never automatically declares a fraud verdict.
    - Anomalous topology triggers HUMAN_REVIEW_RECOMMENDED / HUMAN_REVIEW_REQUIRED.
    """
    def __init__(self):
        super().__init__(agent_name="TransactionForensicsAgent")

    async def execute(self, context: AssessmentContext) -> GraphMetrics:
        start_time = time.monotonic()
        context.record_stage("TRANSACTION_INVESTIGATION", "RUNNING")
        
        await self.emit_event(
            context=context,
            step_name="investigate_transaction_graph",
            status="RUNNING",
            event_type="TASK_START",
            tool_called="networkx_topological_analyzer",
            tool_input_summary=f"Constructing directed counterparty graph for {context.business_id}",
            message="Analyzing topological transaction graph for circular loops, round-tripping, and counterparty entropy..."
        )

        try:
            txs = context.transactions
            business_id = context.business_id
            
            G = nx.DiGraph()
            G.add_node(business_id, type="PRIMARY_MSME")

            edge_weights = defaultdict(float)
            edge_counts = defaultdict(int)
            node_types = {business_id: "PRIMARY_MSME"}

            for t in txs:
                cp = t.counterparty_id or f"anon_cp_{t.transaction_id[:6]}"
                amt = float(t.amount)
                
                if t.direction == "CREDIT":
                    # Counterparty -> MSME (Customer)
                    u, v = cp, business_id
                    node_types[cp] = "CUSTOMER"
                else:
                    # MSME -> Counterparty (Supplier / Debt)
                    u, v = business_id, cp
                    node_types[cp] = "SUPPLIER"

                edge_weights[(u, v)] += amt
                edge_counts[(u, v)] += 1
                G.add_node(cp, type=node_types[cp])
                G.add_edge(u, v, weight=edge_weights[(u, v)], count=edge_counts[(u, v)])

            # Detect directed cycles (circular loops)
            all_cycles = []
            try:
                # Find simple cycles involving the business
                for cycle in nx.simple_cycles(G):
                    if business_id in cycle and len(cycle) >= 2:
                        all_cycles.append(cycle)
                        if len(all_cycles) >= 10:
                            break
            except Exception:
                all_cycles = []

            # Calculate counterparty entropy (Shannon entropy of credit/debit volumes)
            total_vol = sum(edge_weights.values())
            entropy = 0.0
            if total_vol > 0:
                for w in edge_weights.values():
                    p = w / total_vol
                    if p > 0:
                        entropy -= p * math.log2(p)
            entropy = round(entropy, 2)

            # Round trip volume
            round_trip_vol = 0.0
            for cycle in all_cycles:
                for i in range(len(cycle)):
                    u = cycle[i]
                    v = cycle[(i + 1) % len(cycle)]
                    round_trip_vol += edge_weights.get((u, v), 0.0)

            # Categorize investigation status
            if all_cycles:
                inv_status = "HUMAN_REVIEW_RECOMMENDED"
                inv_message = f"Found {len(all_cycles)} circular transaction loops totaling ₹{round_trip_vol:,.2f}. Triggering human review."
            elif entropy < 0.8 and len(txs) > 5:
                inv_status = "INVESTIGATION_TRIGGERED"
                inv_message = "High transaction concentration on single counterparty. Moderate entropy."
            else:
                inv_status = "NORMAL_PATTERNS"
                inv_message = "Normal transaction topology without circular or reciprocal anomalies."

            # Construct nodes and edges schema
            nodes = []
            for nid in list(G.nodes)[:25]:
                ntype = G.nodes[nid].get("type", "UNKNOWN")
                if nid == business_id:
                    role = "PRIMARY_BUSINESS"
                elif ntype == "CUSTOMER":
                    role = "CUSTOMER"
                elif ntype == "SUPPLIER":
                    role = "SUPPLIER"
                else:
                    role = "UNKNOWN"

                inflow = sum(edge_weights.get((u, nid), 0.0) for u in G.predecessors(nid))
                outflow = sum(edge_weights.get((nid, v), 0.0) for v in G.successors(nid))

                nodes.append(
                    GraphNode(
                        id=str(nid),
                        label=str(nid),
                        role=role,
                        total_inflow_volume=inflow,
                        total_outflow_volume=outflow,
                        degree=G.degree(nid)
                    )
                )

            edges = []
            for (u, v) in list(edge_weights.keys())[:35]:
                direction = "OUTGOING" if u == business_id else "INCOMING"
                edges.append(
                    GraphEdge(
                        source=str(u),
                        target=str(v),
                        total_amount=round(edge_weights[(u, v)], 2),
                        transaction_count=edge_counts[(u, v)],
                        direction=direction
                    )
                )

            unique_customers = sum(1 for n, d in G.nodes(data=True) if d.get("type") == "CUSTOMER")
            unique_suppliers = sum(1 for n, d in G.nodes(data=True) if d.get("type") == "SUPPLIER")

            graph_metrics = GraphMetrics(
                business_id=business_id,
                assessment_id=context.assessment_id,
                total_nodes=G.number_of_nodes(),
                total_edges=G.number_of_edges(),
                nodes=nodes,
                edges=edges,
                unique_customers_count=unique_customers,
                unique_suppliers_count=unique_suppliers,
                counterparty_entropy=entropy,
                circular_loops_detected=all_cycles,
                round_trip_volume_inr=round(round_trip_vol, 2),
                investigation_status=inv_status
            )

            context.graph_metrics = graph_metrics
            context.agent_results["transaction_forensics"] = {
                "investigation_status": inv_status,
                "circular_loops_count": len(all_cycles),
                "round_trip_volume_inr": round_trip_vol,
                "counterparty_entropy": entropy,
                "total_nodes": G.number_of_nodes(),
                "total_edges": G.number_of_edges()
            }

            duration_ms = (time.monotonic() - start_time) * 1000.0
            await self.emit_event(
                context=context,
                step_name="investigate_transaction_graph",
                status="COMPLETED",
                event_type="STRUCTURED_RESULT",
                tool_called="networkx_topological_analyzer",
                execution_duration_ms=duration_ms,
                structured_findings=context.agent_results["transaction_forensics"],
                message=inv_message
            )
            context.record_stage("TRANSACTION_INVESTIGATION", "COMPLETED")
            return graph_metrics

        except Exception as e:
            duration_ms = (time.monotonic() - start_time) * 1000.0
            error_msg = f"Transaction forensics error: {str(e)}"
            context.record_error("TransactionForensicsAgent", "investigate_transaction_graph", error_msg)
            context.record_stage("TRANSACTION_INVESTIGATION", "FAILED")
            
            await self.emit_event(
                context=context,
                step_name="investigate_transaction_graph",
                status="FAILED",
                event_type="FAILURE",
                execution_duration_ms=duration_ms,
                error_message=error_msg,
                message=f"Transaction Forensics agent encountered an error: {str(e)}"
            )
            raise
