# UDYOGA Complete UX & Functionality Audit
**Date:** November 21, 2026  
**Auditor:** Principal Fintech Product Designer, Senior Frontend Architect & Full-Stack QA Engineer  
**Scope:** Complete Authenticated Application (MSME Borrower, Lender, Administrator, and Statutory Auditor)

---

## 1. Executive Summary & Design Principles

UDYOGA is an institutional-grade, cash-flow underwriting and credit-intelligence platform tailored to 63 million credit-invisible Indian MSMEs. The core aesthetic (Forest Green `#173F35`, Warm Ivory `#F7F4EC`, Terracotta `#C96B4B`, clean typography, and SVG/Recharts cash-flow animations) is authentic, distinctive, and respected by users.

### The Problem Statement
While the visual identity is strong, the authenticated post-login experience suffers from five systemic issues:
1. **Information Overload:** Screens dumped dozens of unprioritized statistical indicators on first render without hierarchical disclosure.
2. **Artificial "AI-Generated" UI Tells:** Decorative glowing borders, low-contrast text on dark backgrounds (`LOW VARIANCE RISK`), redundant status badges, and repetitive cards.
3. **Cryptic Financial Jargon:** Acronyms like CFADS, DSCR, DIR, and RBAC presented without contextual explanations or plain-English equivalents.
4. **Static Components Lacking Reactivity:** Buttons, dropdowns, and file upload zones that appeared clickable but did not persist changes, update underlying state, or reflect period changes.
5. **Auditor Disconnect:** Inability for a statutory auditor to trace an assessment sequentially from submitted evidence to the recorded human decision.

---

## 2. Exhaustive Portal-by-Portal Usability & Functionality Audit

### 2.1 MSME Borrower Portal (`/borrower/*`)

| Page / Component | User Goal | Current Flaws Identified | Functional Defects Found | Required Fix / Production Behavior |
|---|---|---|---|---|
| **Borrower Dashboard** (`BorrowerDashboard.tsx`) | Situational awareness, available credit limit, next daily sweep | Metrics are static; withdraw capital button displays a toast but doesn't decrement drawing power | Available drawing power does not update; withdrawal history is static | Implement dynamic drawing power calculation with persistent withdrawals and real transaction history. |
| **Business Profile** (`BusinessProfileView.tsx`) | View & update commercial identity, address, and vintage | Completely read-only; no edit button or validation forms | No edit capability; zero state persistence across page refreshes | Add "Edit Profile Details" modal with validation (PIN code, phone, trade name, vintage) persisting to storage and state. |
| **Document Vault** (`DocumentUploadView.tsx`) | Upload KYC, licenses, and cashbook CSVs | Uploaded documents are lost on page refresh if backend is unavailable | Upload status lacks persistent storage; no validation for corrupted files | Store uploads in persistent local state with file size (<5MB), MIME verification, and row count calculation. |
| **Financial Accounts Hub** (`FinancialsView.tsx`) | Inspect connected bank accounts and merchant VPAs | Static account balances; no refresh or account-linking trigger | Static numbers; no ability to trigger bank sync or simulate new credit stream | Add "Sync Latest Transactions" action recalculating average daily balance and monthly turnover. |
| **Cash-Flow Pulse** (`FinancialHealthView.tsx`) | Inspect daily cash rhythm and operational runway | Waveform chart only shows fixed 30-day view without period selection | Reporting period buttons (7D, 30D, 90D) missing; charts cannot be scaled | Add interactive period switcher (7D / 30D / 90D) dynamically updating chart axes, inflow sums, and runway. |
| **Assessment & DNA** (`AssessmentReportView.tsx`) | Understand credit score factors and Business DNA | 5 DNA dimensions are hardcoded; no refresh trigger after new document ingestion | Score does not update after cashbook upload | Implement dynamic score calculation adjusting for uploaded cashbook volume and recent bank health. |
| **Financial Passport** (`BorrowerDashboard.tsx` Modal) | Export verifiable PDF credential to share with lenders | Print action only displays a toast without rendering a printable document | Download did not generate real printable credential | Connect to real print/PDF layout with cryptographic seal and formatted identity dossier. |
| **What-If Simulator** (`WhatIfSimulatorView.tsx`) | Test revenue scenarios to increase credit limit | Sliders work visually, but state resets on navigation | Sliders reset; recommended actions not linked to active profile | Preserve scenario states and calibrate recommendations to the borrower's actual turnover. |

---

### 2.2 Lender Portal (`/lender/*`)

| Page / Component | User Goal | Current Flaws Identified | Functional Defects Found | Required Fix / Production Behavior |
|---|---|---|---|---|
| **Lender Dashboard** (`LenderDashboard.tsx`) | Rapid triage of inbound loan applications (<10s) | Too many dense metrics; lack of clear next-step guidance | Filter buttons did not retain state across route navigation | Implemented 3-Question Operational Banner, 4 plain-English metric cards, and 5 priority category tabs. |
| **Application Pipeline** (`ApplicationPipeline.tsx`) | Filter, search, and prioritize application queue | "Variance Attention" tag was technical and unexplained | Anomaly tags lacked tooltips; filter combinations were rigid | Added plain-English "Needs Document Check" with explanatory tooltip, multi-column sorting, and keyword search. |
| **Application Workbench** (`ApplicantDetailWorkbench.tsx`) | Deep underwriting analysis and loan sanction | Monolithic view; cryptic acronyms (CFADS, DSCR); low-contrast badge (`LOW VARIANCE RISK`) | Instant state change on approve/decline without confirmation; no decision history audit trail | Structured into 8 focused tabs, replaced low-contrast badge with high-contrast status card, added confirmation dialog and decision history timeline. |

---

### 2.3 Institutional Administrator Portal (`/admin/*`)

| Page / Component | User Goal | Current Flaws Identified | Functional Defects Found | Required Fix / Production Behavior |
|---|---|---|---|---|
| **Platform Overview** (`AdminDashboard.tsx`) | Understand system health, users, and processing status | Displayed raw Prometheus/Grafana-style technical metrics | Technical terms (Model Drift, DIR, RBAC) lacked plain-English definitions | Added 5 core status cards, 3-question operational banner, and expandable Plain-English Terminology Guide. |
| **User Management** (`UserManagementView.tsx`) | Manage user accounts, roles, and permissions | Role names were technical backend constants (`LENDER_OFFICER`) | Role labels lacked plain-English permission scopes | Added natural-language role descriptions, granular permission scopes, and session termination controls. |
| **System Activity Log** (`AuditLogsView.tsx`) | Inspect security and administrative events | Events formatted as raw log strings | Lacked human-readable summaries | Added natural-language action statements ("Underwriter Vikram Deshmukh issued loan sanction") and expandable SHA-256 inspection drawers. |

---

### 2.4 Statutory Auditor Portal (`/admin/fairness` & `/admin/applications`)

| Page / Component | User Goal | Current Flaws Identified | Functional Defects Found | Required Fix / Production Behavior |
|---|---|---|---|---|
| **Fairness & Bias Console** (`FairnessMonitoringView.tsx`) | Evaluate algorithmic fairness and demographic parity | Disparate Impact Ratio (DIR) was presented without operational context | Claimed system was "fair" simply because DIR > 0.80 | Added 4-question breakdown for each dimension + mandatory statutory disclaimer on sample audits. |
| **Master Applications Ledger** (`ApplicationMasterLedger.tsx`) | Trace an assessment from evidence to human decision | Static read-only table without deep inspection capability | Could not inspect evidence provenance, calculations, or underwriter notes | Implemented interactive 7-Step Auditor Assessment Trace Drawer verifying business, information, provenance, calculations, issues, recommendations, and recorded decisions. |

---

## 3. Four-Tier Information Hierarchy Applied Across Portals

- **Level 1 (Essential):** Immediate situational awareness answering:
  1. *What is happening?*
  2. *Why does it matter?*
  3. *What should I do next?*
- **Level 2 (Important):** Actionable triage categories, priority files, and critical alerts.
- **Level 3 (Detailed):** 3-way reconciliation charts, cash-flow waveforms, and document previews.
- **Level 4 (Advanced):** Cryptographic SHA-256 seals, Quai blockchain anchor hashes, and sub-agent execution logs tucked into expandable drawers.

---

## 4. Controlled Implementation Plan (Stages 1 to 7)
- **Stage 1:** Complete audit documentation (this document).
- **Stage 2:** Improve Lender UX & decisioning functionality.
- **Stage 3:** Improve Admin UX, user permissions, and terminology drawers.
- **Stage 4:** Improve Auditor UX with 7-step traceable inspection.
- **Stage 5:** Fix MSME Borrower functional interactivity, persistence, and dynamic recalculations while strictly preserving visual styling.
- **Stage 6:** Cross-portal data synchronization.
- **Stage 7:** Regression testing and full-stack verification.
