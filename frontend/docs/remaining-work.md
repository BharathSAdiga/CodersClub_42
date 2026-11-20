# UDYOGA — Remaining Frontend Work & Alignment Execution Plan

## 1. Work Completed & Preserved
- **Public Experience**: Editorial landing page, SplitWaveformHero, LiveTunerWidget, PhoneSimulator, 5-stage StickyProductStoryteller, selective parallax, count-ups, and full responsive layout.
- **Borrower Portal**: 11 distinct functional views including Onboarding Wizard, Document Upload with progress indicators, DPDP Consent Management, Application Creation with live KFS, Application Tracking, and Assessment View.
- **Lender Portal**: High-density 5-tab Workbench featuring 3-Way Triangulation Radar, monthly cashflow trends, SHAP attribution ribbons, risk haircut sliders, and human sanction letter generation.
- **Admin & Auditor Console**: System cockpit, Four-Fifths 80% Rule fairness dial, user management, audit trail, rail circuit breakers, and certified regulatory compliance packs.

---

## 2. Minimal Frontend Alignment Work Remaining

To achieve 100% feature fidelity with the Final Specification without altering any UI layouts, designs, or colors, we need to make surgical enhancements to the following existing components:

### Task 1: Ingestion & Provenance Extensions (Features 1 & 2)
- **Target File**: `frontend/src/features/borrower/components/DocumentUploadView.tsx`
  - Add a "Sales Register / Cashbook CSV" upload zone alongside the bank statement PDF zone.
  - Client-side mock parser that reads standard CSV columns and marks provenance as `SELF_REPORTED_UNVERIFIED`.
- **Target File**: `frontend/src/features/lender/components/ApplicantDetailWorkbench.tsx` (Tab 4: Documents)
  - Display the 4-tier provenance badge (`Independently Verified`, `Source-Labelled`, `Self-Reported`, `Missing Data`).

### Task 2: 5-Dimension Business Financial DNA (Feature 4)
- **Target File**: `frontend/src/features/borrower/components/AssessmentReportView.tsx` & `ApplicantDetailWorkbench.tsx` (Tab 3)
  - Add the 5 structured dimensions: Cash-Flow Vitality, Business Continuity, Trade Reliability, Financial Resilience, and Evidence Confidence with explicit limitation callouts.

### Task 3: Transaction Graph Forensics (Feature 5)
- **Target File**: `frontend/src/features/lender/components/ApplicantDetailWorkbench.tsx` (Tab 3: Intelligence & Anomalies)
  - Render an SVG counterparty network graph (Merchant $\leftrightarrow$ Buyers $\leftrightarrow$ Suppliers) with zero circular loops indicator and investigation severity badge.

### Task 4: Cash-Flow Twin 6-Scenario Stress Simulator (Feature 7)
- **Target File**: `frontend/src/features/borrower/components/WhatIfSimulatorView.tsx` & `ApplicantDetailWorkbench.tsx` (Tab 2)
  - Add preset buttons for the 6 stress scenarios (-15% Rev, -30% Rev, +15% OpEx, 30-Day Delay, Combined Shock) and project CFADS / DSCR.

### Task 5: Dynamic Repayment Structure Optimizer (Feature 9)
- **Target File**: `frontend/src/features/lender/components/ApplicantDetailWorkbench.tsx` (Tab 5: Underwriting)
  - Add a 3-way side-by-side comparison table: Standard EMI vs. Revenue-Linked Sachet vs. Step EMI.

### Task 6: 8-Agent Execution Activity Log (Feature 10)
- **Target File**: `frontend/src/features/lender/components/ApplicantDetailWorkbench.tsx` (Tab 3)
  - Add an interactive accordion detailing the execution trace of the 8 specialized agents with timing and findings.

### Task 7: Business Financial Passport Export (Feature 14)
- **Target File**: `frontend/src/features/borrower/components/BorrowerDashboard.tsx`
  - Add a "View / Print Business Financial Passport" modal consolidating the 5 dimensions and verified credentials.

---

## 3. Backend-Dependent Capabilities (Deferred to Teammate)
- Real OCR parsing of vernacular PDF statements.
- Production trained ML weights for the 8 agents.
- Real-time Webhook infrastructure for post-disbursal continuous monitoring (Feature 16).
- Database migrations and authentication token validation.
