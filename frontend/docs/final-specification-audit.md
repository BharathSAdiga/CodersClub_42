# UDYOGA — Final Specification Comprehensive Audit Report

**Specification Source**: Final UDYOGA Project Specification (16 Features, Agentic AI Architecture, 5-Dimension Business DNA, Stress Simulator, Transaction Graph Forensics).  
**Inspection Date**: 2026-11-20  
**Current Application Baseline**: Phase 5C Consolidated Monorepo (`frontend/` + `backend/`).

---

## 1. Feature-by-Feature Gap & Alignment Audit

| Feature # & Name | Status in Existing Application | Existing Components & Mappings | Identified Functional Gaps | Backend Dependency (Teammate) | Minimal Frontend Alignment Required |
|---|---|---|---|---|---|
| **Feature 1: MSME Onboarding & Alternative Data Ingestion** | **Partially Implemented (UI & Flow Ready)** | `OnboardingWizard.tsx`, `DocumentUploadView.tsx`, `BusinessProfileView.tsx` | Missing explicit CSV drag-and-drop parser for offline sales registers/cashbooks. Needs clear distinction between independently verified vs. self-reported data. | Document OCR extraction, bank statement parsing, GSTN ingestion. | Add tab/option for CSV/Cashbook upload alongside bank docs in `DocumentUploadView.tsx`; label self-reported data clearly. |
| **Feature 2: Financial Data Validation & Evidence Provenance** | **Partially Implemented** | `DataQualityMonitoringView.tsx`, `ApplicantDetailWorkbench.tsx` | Need formal "Evidence Confidence Score" breakdown (Independently Verified vs. Source-Labelled vs. Self-Reported vs. Missing) on the applicant detail workbench. | Cross-rail reconciliation service, data recency validator. | Add 4-tier evidence classification pills to document review tab in `ApplicantDetailWorkbench.tsx`. |
| **Feature 3: Financial Transaction Intelligence** | **Fully Implemented** | `FinancialsView.tsx`, `FinancialHealthView.tsx`, `ApplicantDetailWorkbench.tsx` | All 14 metrics (Revenue growth, cashflow volatility, expense ratio, customer concentration, receivables ageing) rendered with Recharts. | Aggregated accounting and bank telemetry feeds. | None. Existing charts already present tabular and visual analytics. |
| **Feature 4: Business Financial DNA (5 Dimensions)** | **Partially Implemented** | `AssessmentReportView.tsx`, `AssessmentMonitoringView.tsx` | Currently shows ACIE 0-900 Vitality Score. Needs explicit structured display of the 5 canonical dimensions: 1. Cash-Flow Vitality, 2. Business Continuity, 3. Trade Reliability, 4. Financial Resilience, 5. Evidence Confidence. | ACIE 5-dimension scoring model outputs. | Extend `AssessmentReportView.tsx` and lender workbench with a 5-dimension radar/card breakdown showing scores, evidence, and limitations. |
| **Feature 5: Transaction Graph Forensics** | **Partially Implemented** | `ApplicantDetailWorkbench.tsx` (Anomaly Matrix) | Circular loops (0 detected) and concentration (18%) are listed as text metrics. Missing visual interactive graph node representation (borrower $\leftrightarrow$ buyers $\leftrightarrow$ suppliers) and investigation severity tags. | Graph database (Neo4j / NetworkX) cycle-finding algorithms. | Integrate SVG/interactive counterparty graph inside the Anomaly tab in `ApplicantDetailWorkbench.tsx` with severity tags (`INFO`, `WARNING`, `CRITICAL`). |
| **Feature 6: Business Vitality Monitoring** | **Partially Implemented** | `FinancialHealthView.tsx`, `LiveTunerWidget.tsx` | Shows transaction pulse and cashflow rhythm. Needs explicit labelling of "Historical Analysis" vs. "Future Continuous Monitoring" and early warning threshold signals. | Scheduled webhook listeners, periodic GSTN/AA fetchers. | Add "Continuous Vitality Rhythm" card with pulse/heartbeat indicators and clear disclaimer separating historical from future live monitoring. |
| **Feature 7: Cash-Flow Twin & Stress Simulation** | **Partially Implemented** | `WhatIfSimulatorView.tsx`, `ApplicantDetailWorkbench.tsx` | Interactive sliders exist for limit and APR. Needs the exact final scenario presets: Normal, -15% Revenue, -30% Revenue (2 months), +15% Expense, 30-Day Delay, Combined Stress, and CFADS/DSCR projection graph. | Financial stress simulation engine. | Enhance `WhatIfSimulatorView.tsx` and Lender Workbench with a preset dropdown for the 6 stress scenarios and DSCR/CFADS display. |
| **Feature 8: Maximum Safe EMI & Loan Affordability** | **Fully Implemented** | `ApplicationCreationView.tsx`, `LiveTunerWidget.tsx` | Calculates indicative loan principal, tenor, interest rate, and sachet daily sweep with upfront KFS disclaimer. | Underwriting calculation rules engine. | Add clear disclaimer: "Indicative affordability output for decision support. Final credit sanction subject to underwriter review." |
| **Feature 9: Dynamic Repayment Structure Optimizer** | **Partially Implemented** | `ApplicantDetailWorkbench.tsx` | Daily sweep vs. monthly EMI is selectable. Missing a side-by-side comparison table between Standard EMI, Revenue-Linked Repayment, and Seasonality-Matched Step EMI. | Repayment schedule amortization generator. | Add a 3-way repayment comparison card to the Underwriting tab in `ApplicantDetailWorkbench.tsx`. |
| **Feature 10: Agentic AI Financial Investigation** | **Partially Implemented (Cockpit Vitals Ready)** | `AdminDashboard.tsx`, `SystemTelemetryView.tsx` | The 8 specialized agents are defined in docs, but the lender workbench lacks a dedicated "Agent Execution Timeline" displaying: Agent Name, Assigned Task, Tool Calls, Execution Status, and Structured Findings. | Multi-agent orchestrator (LangGraph / CrewAI). | Add an interactive "Agentic Financial Investigation Log" accordion inside the intelligence tab of `ApplicantDetailWorkbench.tsx`. |
| **Feature 11: Explainable Alternative Underwriting** | **Fully Implemented** | `ApplicantDetailWorkbench.tsx`, `AssessmentReportView.tsx` | Displays SHAP positive and negative drivers, counterfactual recourse, and the 4 recommendation categories. | ACIE SHAP explainer module. | None. Visual SHAP waterfall ribbons already operational. |
| **Feature 12: Counterfactual Path-to-Yes** | **Fully Implemented** | `WhatIfSimulatorView.tsx`, `AcieExplanation.tsx` | Interactive dual-slider and deterministic actionable coaching ("+₹1.5L limit with 15 days higher balance"). | ACIE counterfactual generator. | None. Counterfactual simulation matches the final spec. |
| **Feature 13: Fairness & Responsible Assessment** | **Fully Implemented** | `FairnessMonitoringView.tsx` | Four-fifths rule dial (0.91 ratio), gender parity, tier 2/3/4 geographic distribution, DPDP purge ledger. | Fairness audit aggregation service. | None. Fully meets the final specification requirements. |
| **Feature 14: Business Financial Passport** | **Partially Implemented** | `BorrowerDashboard.tsx`, `ReportsExportsView.tsx` | Summary is visible on dashboard and downloadable in compliance packs. Missing a dedicated, printable/exportable "Business Financial Passport" modal/card in the Borrower Portal. | Verified credential / signed PDF generator. | Add "Download Business Financial Passport" view/modal in `BorrowerDashboard.tsx`. |
| **Feature 15: Lender Underwriting Cockpit** | **Fully Implemented** | `ApplicantDetailWorkbench.tsx`, `ApplicationPipeline.tsx` | High-density 5-tab workbench with haircut sliders, covenants, and human discretionary approval/decline. | Loan origination system (LOS) connector. | Minor: Incorporate Features 2, 5, 9, and 10 into existing tabs. |
| **Feature 16: Continuous Financial Monitoring** | **Partially Implemented** | `SystemTelemetryView.tsx`, `FinancialHealthView.tsx` | Historical early warning triggers exist. Needs clear visual disclaimer indicating that continuous live monitoring is an active post-disbursal capability. | Recurring webhook ingestion worker. | Label early warning indicators as "Post-Disbursal Early Warning Signals (Historical Baseline)". |

---

## 2. Priority Classification Summary

- **P0 Gaps to Align (Essential)**:
  1. Add CSV / Offline cashbook ingestion upload option to `DocumentUploadView.tsx` (Feature 1).
  2. Add 5-Dimension Business Financial DNA scorecard to `AssessmentReportView.tsx` and Lender Workbench (Feature 4).
  3. Add 6-Scenario Stress Test simulator presets (-15% Rev, -30% Rev, +15% Exp, etc.) to `WhatIfSimulatorView.tsx` and Lender Workbench (Feature 7).
  4. Add 8-Agent Execution Activity Timeline to the intelligence tab in `ApplicantDetailWorkbench.tsx` (Feature 10).
  5. Add Evidence Confidence Provenance pills (Verified vs. Self-Reported vs. Missing) (Feature 2).
  6. Add Counterparty Transaction Graph network visualization inside the Anomaly tab (Feature 5).
- **P1 Gaps to Align (Competitive Differentiators)**:
  7. Add 3-Way Repayment Structure Comparison (Standard vs. Revenue-Linked vs. Step EMI) (Feature 9).
  8. Add "Business Financial Passport" export summary card (Feature 14).
- **P2 Future Enhancements**:
  9. Live recurring webhook triggers (Feature 16) — cleanly labeled as post-disbursal capability.
