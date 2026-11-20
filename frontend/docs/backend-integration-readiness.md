# UDYOGA — Backend Integration Readiness & Contract Specifications

This document defines the exact data interfaces, event structures, and API contracts required from your teammate's backend microservices and Alternative Credit Intelligence Engine (ACIE).

---

## 1. Required API Endpoints & Expected Payloads

### 1.1 Ingestion & Evidence Validation
- **`POST /api/v1/ingest/csv`**
  - *Input*: Multipart form data (`file: CSV`, `businessId: string`, `sourceType: 'SALES_REGISTER' | 'CASHBOOK' | 'INVOICE_LEDGER'`).
  - *Output*:
    ```json
    {
      "uploadId": "upl_8921",
      "rowsParsed": 240,
      "dateRange": { "start": "2026-08-01", "end": "2026-10-31" },
      "totalVolume": 1420500,
      "provenanceClassification": "SELF_REPORTED_UNVERIFIED",
      "reconciliationCandidate": true
    }
    ```

### 1.2 ACIE 5-Dimension Business DNA
- **`GET /api/v1/assessments/:appId/dna`**
  - *Output*:
    ```json
    {
      "applicationId": "APP-2026-0891",
      "vitalityScore": 768,
      "scoreBand": "PRIME",
      "dimensions": {
        "cashFlowVitality": { "score": 82, "status": "STRONG", "evidence": "Daily UPI inflow cadence of 142 tx/day" },
        "businessContinuity": { "score": 78, "status": "GOOD", "evidence": "4.2 years continuous operating history" },
        "tradeReliability": { "score": 88, "status": "EXCELLENT", "evidence": "24 months punctual BBPS utility payments" },
        "financialResilience": { "score": 64, "status": "MODERATE", "evidence": "Buffer covers 18 days operating burn" },
        "evidenceConfidence": { "score": 92, "status": "HIGH", "evidence": "3-way AA, GSTN, and UPI triangulation match" }
      },
      "limitations": ["Thin conventional bank credit bureau history", "Informal shop lease agreement"]
    }
    ```

### 1.3 Transaction Graph Forensics
- **`GET /api/v1/forensics/graph/:appId`**
  - *Output*:
    ```json
    {
      "applicationId": "APP-2026-0891",
      "nodes": [
        { "id": "MERCHANT", "label": "Sri Balaji Provisions", "type": "PRIMARY" },
        { "id": "BUYER_1", "label": "Metro Retailers Ltd", "type": "BUYER", "volumeShare": 0.18 },
        { "id": "SUPPLIER_1", "label": "Hindustan Bulk Staples", "type": "SUPPLIER", "volumeShare": 0.32 }
      ],
      "edges": [
        { "from": "MERCHANT", "to": "SUPPLIER_1", "amount": 180000, "direction": "OUTFLOW" },
        { "from": "BUYER_1", "to": "MERCHANT", "amount": 95000, "direction": "INFLOW" }
      ],
      "circularLoopsDetected": 0,
      "investigationSeverity": "INFO",
      "findings": "Clean transaction graph. Normal merchant-to-distributor settlement hierarchy."
    }
    ```

### 1.4 Cash-Flow Twin & Stress Simulation (Feature 7)
- **`POST /api/v1/simulation/stress-test`**
  - *Input*:
    ```json
    {
      "applicationId": "APP-2026-0891",
      "scenario": "REVENUE_DECLINE_15" | "REVENUE_DECLINE_30_TWO_MONTHS" | "OPEX_SURGE_15" | "RECEIVABLES_DELAY_30" | "COMBINED_STRESS",
      "baseMonthlyRevenue": 610000,
      "baseMonthlyExpense": 480000,
      "indicativeEmi": 42000
    }
    ```
  - *Output*:
    ```json
    {
      "scenario": "REVENUE_DECLINE_15",
      "simulatedCfads": 78500,
      "simulatedDscr": 1.87,
      "lowestReserveBuffer": 42000,
      "negativeCashFlowMonths": 0,
      "repaymentViability": "SUSTAINABLE",
      "estimatedRecoveryDays": 14
    }
    ```

### 1.5 Multi-Agent Orchestration Log (Feature 10)
- **`GET /api/v1/agents/execution-trace/:appId`**
  - *Output*:
    ```json
    {
      "orchestratorSessionId": "sess_agent_9841",
      "agents": [
        { "agentName": "Underwriting Orchestrator", "task": "Synthesizing cross-agent risk dossiers", "status": "COMPLETED", "executionTimeMs": 310 },
        { "agentName": "Financial Analyst Agent", "task": "Parsing Account Aggregator cashflows and DSCR", "status": "COMPLETED", "executionTimeMs": 420 },
        { "agentName": "Evidence Verification Agent", "task": "3-Way Triangulation (GST vs Bank vs UPI)", "status": "COMPLETED", "executionTimeMs": 510 },
        { "agentName": "Fraud Investigation Agent", "task": "Cycle detection on transaction graph", "status": "COMPLETED", "executionTimeMs": 280 },
        { "agentName": "Business Vitality Agent", "task": "Calculating transaction rhythm and customer retention", "status": "COMPLETED", "executionTimeMs": 390 },
        { "agentName": "Resilience Simulation Agent", "task": "Simulating -30% revenue shock", "status": "COMPLETED", "executionTimeMs": 450 },
        { "agentName": "Underwriting Agent", "task": "Formulating KFS and safe EMI bounds", "status": "COMPLETED", "executionTimeMs": 320 },
        { "agentName": "Explanation and Passport Agent", "task": "Generating SHAP plain-language statements", "status": "COMPLETED", "executionTimeMs": 240 }
      ]
    }
    ```

---

## 2. Mock Adapter Fallback Strategy
While your teammate finishes the live backend, our frontend consumes typed mock services (`frontend/src/mocks/mockService.ts`) conforming exactly to the contracts above. When the backend goes live, switching `VITE_USE_MOCK_SERVICES=false` will cleanly route calls through the real API gateway with zero frontend refactoring.
