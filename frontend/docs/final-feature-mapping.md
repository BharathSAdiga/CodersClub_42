# UDYOGA — Final Feature-to-Component Mapping

This document maps every feature from the Final Specification to its exact existing route, view, and component in the codebase, detailing the minimal functional extension required without altering layouts or design tokens.

---

## Complete Feature Matrix & Existing Component Map

| Feature | Primary Route / View | Existing Component | Existing Service / Adapter | Proposed Minimal Extension (Preserving UI) |
|---|---|---|---|---|
| **Feature 1: Onboarding & CSV Ingestion** | `/borrower/documents`, `/borrower/onboarding` | `DocumentUploadView.tsx`, `OnboardingWizard.tsx` | `mockService.ts` (`uploadDocument`) | Add a "Sales Register / Cashbook CSV" dropzone card alongside bank PDFs; parse columns (`date`, `amount`, `type`, `counterparty`) client-side. |
| **Feature 2: Evidence Provenance** | `/lender/workbench` (Tab 4: Documents) | `ApplicantDetailWorkbench.tsx` | `mockPipeline.ts` | Add 4 provenance badge states: `Independently Verified (AA/GST)`, `Source-Labelled (UPI)`, `Self-Reported (CSV)`, and `Missing Data`. |
| **Feature 3: Financial Analytics** | `/borrower/financials`, `/lender/workbench` (Tab 2) | `FinancialsView.tsx`, `ApplicantDetailWorkbench.tsx` | `mockService.ts` | Retain existing Recharts Area and Pie charts; ensure metrics (receivables ageing, concentration) are clearly surfaced. |
| **Feature 4: Business Financial DNA** | `/borrower/assessment`, `/lender/workbench` (Tab 3) | `AssessmentReportView.tsx`, `ApplicantDetailWorkbench.tsx` | `mockService.ts` (`getAcieReport`) | Add a 5-dimension scorecard: 1. Cash-Flow Vitality, 2. Business Continuity, 3. Trade Reliability, 4. Financial Resilience, 5. Evidence Confidence. |
| **Feature 5: Transaction Graph Forensics** | `/lender/workbench` (Tab 3: Intelligence & Anomalies) | `ApplicantDetailWorkbench.tsx` | `mockPipeline.ts` (`anomalies`) | Render an SVG network visualization of counterparty nodes (Borrower $\leftrightarrow$ Top 3 Buyers $\leftrightarrow$ Top 2 Suppliers) with loop-check indicators. |
| **Feature 6: Vitality Monitoring** | `/borrower/health`, `/admin/system` | `FinancialHealthView.tsx`, `SystemTelemetryView.tsx` | `mockService.ts` | Surface the 5 vitality rhythms: Transaction Pulse, Revenue Rhythm, Customer Rhythm, Supplier Heartbeat, and Recovery Time. |
| **Feature 7: Cash-Flow Twin & Stress Simulation** | `/borrower/insights`, `/lender/workbench` (Tab 2) | `WhatIfSimulatorView.tsx`, `ApplicantDetailWorkbench.tsx` | `mockService.ts` | Add quick-stress preset buttons: `Normal`, `-15% Revenue`, `-30% Revenue (2 Mos)`, `+15% OpEx`, `30-Day Delay`, `Combined Shock` and plot CFADS impact. |
| **Feature 8: Maximum Safe EMI** | `/borrower/apply`, `/lender/workbench` (Tab 5) | `ApplicationCreationView.tsx`, `ApplicantDetailWorkbench.tsx` | `mockService.ts` | Compute and display Maximum Indicative Safe EMI vs. monthly cash surplus with explicit non-binding disclaimer. |
| **Feature 9: Repayment Optimizer** | `/lender/workbench` (Tab 5: Underwriting Worksheet) | `ApplicantDetailWorkbench.tsx` | `mockPipeline.ts` | Add a side-by-side comparison table: Standard EMI vs. Revenue-Linked Micro-Sweep vs. Seasonality-Matched Step EMI. |
| **Feature 10: Multi-Agent Activity Log** | `/lender/workbench` (Tab 3), `/admin/overview` | `ApplicantDetailWorkbench.tsx`, `AdminDashboard.tsx` | `mockAdminData.ts` | Add an interactive "8-Agent Orchestration Log" accordion showing execution status, tool calls, and findings for the 8 specialized agents. |
| **Feature 11: Explainable Underwriting** | `/lender/workbench` (Tab 3), `/borrower/assessment` | `ApplicantDetailWorkbench.tsx`, `AssessmentReportView.tsx` | `mockPipeline.ts` | Retain existing SHAP waterfall ribbons and map decisions to the 4 canonical categories (Affordable, Conditional, Insufficient Data, High Risk). |
| **Feature 12: Counterfactual Path-to-Yes** | `/borrower/insights` | `WhatIfSimulatorView.tsx` | `mockService.ts` | Retain dual-slider simulator with concrete threshold levers (shorten collection cycle, maintain buffer balance). |
| **Feature 13: Fairness Dashboard** | `/admin/fairness` | `FairnessMonitoringView.tsx` | `mockAdminData.ts` | Retain Four-Fifths 80% Rule dial, demographic parity ratios, and DPDP consent revocation ledger. |
| **Feature 14: Financial Passport** | `/borrower/dashboard` | `BorrowerDashboard.tsx` | `mockService.ts` | Add a "View / Export Business Financial Passport" modal consolidating the 5 dimensions, KFS terms, and verified credentials. |
| **Feature 15: Underwriting Cockpit** | `/lender/workbench` | `ApplicantDetailWorkbench.tsx` | `mockPipeline.ts` | Integrate all lender-side extensions cleanly into the existing 5 tabs without modifying outer layout or colors. |
| **Feature 16: Continuous Monitoring** | `/admin/system`, `/borrower/health` | `SystemTelemetryView.tsx`, `FinancialHealthView.tsx` | `mockAdminData.ts` | Display post-disbursal early warning alerts with clear label: "Post-Disbursal Early Warning Protocol (Historical Sandbox)". |
