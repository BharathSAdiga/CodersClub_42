<<<<<<< HEAD
"""
Financial Intelligence Module [OWNED BY HARSHITHA]

Responsibilities:
1. parser.py: Ingests raw CSV/JSON/bank/UPI statements into List[Transaction]
2. dna_engine.py: Computes deterministic FinancialDNA (velocity, volatility CV, seasonality)
3. graph_analyzer.py: Builds NetworkX counterparty graph, flags circular loops for human review
"""
=======
"""UDYOGA — Financial Intelligence Module.

Provides deterministic transaction ingestion, business financial DNA computation,
counterparty network investigation, cash-flow time-series modeling,
and end-to-end pipeline execution with cross-module mathematical reconciliation.
"""

from app.modules.financial_intelligence.parser import (
    NormalizedTransaction,
    ParseResult,
    TransactionCategory,
    TransactionChannel,
    TransactionDirection,
    ValidationIssue,
    parse_transactions,
)
from app.modules.financial_intelligence.dna_engine import (
    CashFlowActivitySection,
    CustomerIntelligenceSection,
    DataCoverageSection,
    DebtRepaymentSection,
    DimensionSummary,
    FinancialDnaReport,
    FinancialStabilitySection,
    MetricItem,
    OperatingExpenseSection,
    RevenueIntelligenceSection,
    SupplierIntelligenceSection,
    compute_financial_dna,
)
from app.modules.financial_intelligence.graph_analyzer import (
    AnomalyFlagCode,
    CounterpartyActivitySummary,
    CycleInvestigationResult,
    CycleInvestigationStatus,
    ExplainableAnomalyFlag,
    FlagSeverity,
    GraphAnalysisResult,
    GraphConcentrationMetrics,
    GraphDataCoverage,
    GraphEdge,
    GraphNode,
    GraphStatistics,
    NodeType,
    RelationshipSummary,
    RepeatedTransferObservation,
    RoundTripMatch,
    RoundTripObservation,
    build_and_analyze,
)
from app.modules.financial_intelligence.cashflow_series import (
    CashflowContinuitySummary,
    CashflowPeriodBucket,
    CashflowSeriesResult,
    ContractualObligationItem,
    CoverageMetadata,
    PeriodCoverageStatus,
    PeriodGrowthObservation,
    RepaymentObservationSummary,
    ResilienceHandoffStatus,
    ResilienceInputResult,
    SeasonalityDataPackage,
    SeasonalityReadinessStatus,
    TrendDirection,
    build_cashflow_series,
    prepare_resilience_inputs,
)
from app.modules.financial_intelligence.pipeline import (
    FinancialIntelligencePipelineResult,
    PipelineExecutionStatus,
    ReconciliationCheckResult,
    ReconciliationStatus,
    ValidationSummary,
    perform_cross_module_reconciliation,
    run_financial_intelligence_pipeline,
)
from app.modules.financial_intelligence.adapters import (
    adapt_to_cashflow_waveform,
    adapt_to_graph_visualization,
    adapt_to_underwriting_dossier,
)

__all__ = [
    # Phase 1: Parser
    "NormalizedTransaction",
    "ParseResult",
    "TransactionCategory",
    "TransactionChannel",
    "TransactionDirection",
    "ValidationIssue",
    "parse_transactions",
    # Phase 2: DNA Engine
    "CashFlowActivitySection",
    "CustomerIntelligenceSection",
    "DataCoverageSection",
    "DebtRepaymentSection",
    "DimensionSummary",
    "FinancialDnaReport",
    "FinancialStabilitySection",
    "MetricItem",
    "OperatingExpenseSection",
    "RevenueIntelligenceSection",
    "SupplierIntelligenceSection",
    "compute_financial_dna",
    # Phase 3: Graph Analyzer
    "AnomalyFlagCode",
    "CounterpartyActivitySummary",
    "CycleInvestigationResult",
    "CycleInvestigationStatus",
    "ExplainableAnomalyFlag",
    "FlagSeverity",
    "GraphAnalysisResult",
    "GraphConcentrationMetrics",
    "GraphDataCoverage",
    "GraphEdge",
    "GraphNode",
    "GraphStatistics",
    "NodeType",
    "RelationshipSummary",
    "RepeatedTransferObservation",
    "RoundTripMatch",
    "RoundTripObservation",
    "build_and_analyze",
    # Phase 4: Cashflow Series & Resilience Handoff
    "CashflowContinuitySummary",
    "CashflowPeriodBucket",
    "CashflowSeriesResult",
    "ContractualObligationItem",
    "CoverageMetadata",
    "PeriodCoverageStatus",
    "PeriodGrowthObservation",
    "RepaymentObservationSummary",
    "ResilienceHandoffStatus",
    "ResilienceInputResult",
    "SeasonalityDataPackage",
    "SeasonalityReadinessStatus",
    "TrendDirection",
    "build_cashflow_series",
    "prepare_resilience_inputs",
    # Phase 5: Pipeline & Downstream Adapters
    "FinancialIntelligencePipelineResult",
    "PipelineExecutionStatus",
    "ReconciliationCheckResult",
    "ReconciliationStatus",
    "ValidationSummary",
    "perform_cross_module_reconciliation",
    "run_financial_intelligence_pipeline",
    "adapt_to_cashflow_waveform",
    "adapt_to_graph_visualization",
    "adapt_to_underwriting_dossier",
]
>>>>>>> origin/feature/harshitha-finance
