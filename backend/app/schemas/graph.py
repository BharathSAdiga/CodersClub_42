from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from datetime import datetime, timezone

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class GraphNode(BaseModel):
    id: str
    label: str
    role: Literal["PRIMARY_BUSINESS", "CUSTOMER", "SUPPLIER", "LENDER_BANK", "RELATED_PARTY", "UNKNOWN"]
    total_inflow_volume: float = 0.0
    total_outflow_volume: float = 0.0
    degree: int = 0

class GraphEdge(BaseModel):
    source: str
    target: str
    total_amount: float
    transaction_count: int
    direction: Literal["INCOMING", "OUTGOING", "BIDIRECTIONAL"]

class GraphMetrics(BaseModel):
    """Network graph topological analysis of counterparty relationships."""
    business_id: str
    assessment_id: Optional[str] = None
    calculated_at: datetime = Field(default_factory=utc_now)
    
    total_nodes: int
    total_edges: int
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    
    # Counterparty Diversity
    unique_customers_count: int
    unique_suppliers_count: int
    counterparty_entropy: float = Field(..., description="Shannon entropy score of flow distribution (higher = more diversified)")
    
    # Suspicious Circular Flow Investigation (Never automatic fraud verdict)
    circular_loops_detected: List[List[str]] = Field(
        default_factory=list, 
        description="Identified cycles of fund transfers across counterparties"
    )
    round_trip_volume_inr: float = Field(default=0.0, description="Volume of circular or reciprocating transactions")
    investigation_status: Literal[
        "NORMAL_PATTERNS",
        "INVESTIGATION_TRIGGERED",
        "HUMAN_REVIEW_RECOMMENDED"
    ] = "NORMAL_PATTERNS"
    investigation_notes: Optional[str] = Field(
        default=None, 
        description="Factual anomaly notes prompting human investigator verification"
    )
    
    calculation_assumptions: List[str] = Field(
        default_factory=lambda: [
            "Graph edges represent aggregated monetary flows over the full transaction window",
            "Cycles of length 2 or 3 with similar credit/debit timestamps trigger review recommendations"
        ]
    )
    limitations: List[str] = Field(
        default_factory=lambda: [
            "Entity resolution relies on provided counterparty identifiers/VPA handles",
            "Legitimate trade credit settlements can exhibit bidirectional flows"
        ]
    )
