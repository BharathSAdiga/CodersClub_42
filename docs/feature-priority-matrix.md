# UDYOGA: Prioritised Feature Matrix

**Project:** UDYOGA – Beyond Credit. Beyond Barriers.  
**Track:** The Big Hack 2.0 — Finance Track (F2: Credit for the Credit-Invisible)  
**Engineering Boundary:** Frontend & Full Application Experience (Interfacing with Teammate's Backend, Database, Auth, OCR, ML Risk Models & ACIE)

---

## 1. Feature Prioritisation Framework

Features are evaluated using the **ICE & MoSCoW framework**:
- **Impact (1–5):** Direct effect on solving the "Credit-Invisible" barrier for Indian MSMEs.
- **Confidence (1–5):** Certainty of product delivery and market resonance.
- **Ease (1–5):** Engineering feasibility given frontend ownership and teammate backend/ACIE contract.
- **MVP Tier:**
  - **P0 (Must Have):** Required for the core demonstration of the F2 challenge.
  - **P1 (Should Have):** Major differentiator, high institutional and demo value.
  - **P2 (Could Have):** Advanced enhancements if time permits.

---

## 2. Comprehensive Feature Matrix

| # | Feature Name | User Persona | Problem Addressed | Business & User Value | Tech Complexity | MVP Priority | Dependencies | Requires Backend / ACIE Support? | Frontend Implementation Ownership |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **F01** | **Interactive Flow-Based Credit Health Mirror** | Micro-Borrower (Kirana / Artisan) | Borrowers have zero insight into how lenders view their financial health; traditional scores are black boxes. | Transforms opaque underwriting into an empowering, visual cash-flow health diagnostic. | Medium | **P0 (Must Have)** | Account Aggregator & UPI payload schemas | **Yes (ACIE)** — consumes health score & feature metrics | Interactive Cashflow Waveform Visualizer, Health Dial, Income-to-Burn charts, Seasonal Trend Tracker |
| **F02** | **Frictionless Multi-Stream Onboarding Workflow** | Micro-Borrower | Intimidating paperwork and multi-week branch wait times cause high drop-offs. | Completes borrower profiling in under 4 minutes; builds instant trust through progressive disclosure. | Medium | **P0 (Must Have)** | Teammate Auth & Session API | **Yes (Backend)** — receives identity payload and consent tokens | 4-step wizard with Udyam verification, AA consent modal, document dropzone, and live progress indicator |
| **F03** | **Explainable AI (XAI) Score Breakdown Ribbon** | Micro-Borrower & Underwriter | "No-Hit" bureau rejections provide zero justification or recourse. | Establishes algorithmic trust; complies with regulatory transparency and borrower protection standards. | Low | **P0 (Must Have)** | ACIE SHAP / feature importance output | **Yes (ACIE)** — outputs top positive/negative contribution weights | Visual bi-directional waterfall ribbon, green positive boosts vs. red drag indicators, plain-language tooltips |
| **F04** | **Counterfactual "What-If" Credit Simulator** | Micro-Borrower | Borrowers don't know what concrete steps will increase their credit line or lower interest rates. | Empowers micro-enterprises with actionable financial coaching; drives repeat engagement and credit graduation. | Medium | **P0 (Must Have)** | ACIE counterfactual simulation API / mock matrix | **Yes (ACIE)** — calculates projected limits based on parameter delta | Real-time dual slider widget (Daily Balance, Invoice Regularity) updating projected credit line live in UI |
| **F05** | **Underwriter Risk Cockpit & Triangulation Radar** | Lender / Credit Officer | Underwriters struggle to reconcile disparate bank, GST, and UPI figures manually, causing 30-day delays. | Cuts underwriting decision turnaround time from 20 days to under 5 minutes with automated reconciliation. | High | **P0 (Must Have)** | Application queue & risk summary API | **Yes (Backend & ACIE)** — provides risk tiering, anomaly flags, and payload | Complete Lender Workbench: Candidate List, Filter by Risk Tier, Anomaly Heatmap, Triangulation Radar Chart |
| **F06** | **Granular Consent & Data Revocation Center** | Micro-Borrower & Auditor | Lack of control over sensitive business data breaches RBI DLG & DPDP Act 2023. | Guarantees regulatory compliance; instills confidence in hesitant first-time digital borrowers. | Low | **P0 (Must Have)** | Consent storage & revocation endpoints | **Yes (Backend)** — handles token lifecycle and data purge | Interactive consent management drawer: toggle individual data sources (AA, GST, UPI) with real-time audit log |
| **F07** | **Interactive Loan Customizer & Dynamic Sachet Slider** | Micro-Borrower | Rigid loan amounts and fixed EMIs lead to default during seasonal cash troughs. | Enables cash-flow matched flexible repayment; higher recovery rates for lenders. | Low | **P0 (Must Have)** | Loan product matrix & pricing service | **Yes (Backend)** — validates loan configuration bounds | Interactive loan configuration canvas: tenor slider, daily sweep vs. weekly sachet toggle, instant KFS calculation |
| **F08** | **Synthetic Anomaly & Circular Flow Detection Badge** | Lender / Underwriter | Risk of fraudulent round-tripping or synthetic UPI inflation to game alternative credit models. | Protects lender capital against organized fraud and artificial turnover manipulation. | Medium | **P1 (Should Have)** | ACIE fraud detection signals | **Yes (ACIE)** — flags suspicious loops, velocity spikes, and counterparty risks | Visual alert tags (Low/Medium/High Anomaly), circular transaction graph view, and underwriter override toggle |
| **F09** | **Algorithmic Fairness & Bias Audit Console** | Bank Risk Auditor / Compliance Admin | Unchecked AI models perpetuate historical bias against women entrepreneurs, micro-proprietorships, and remote districts. | Institutional proof of ESG/fair-lending compliance; critical hackathon differentiator. | Medium | **P1 (Should Have)** | Aggregated portfolio fairness telemetry | **Yes (ACIE & Backend)** — demographic parity & disparity ratio metrics | Interactive compliance dashboard: Disparate Impact Ratio graphs, gender parity gauges, geographic distribution map |
| **F10** | **Dynamic Key Fact Statement (KFS) & e-Mandate Generator** | Micro-Borrower | Hidden charges and predatory penalties disguise the true annual percentage rate (APR). | 100% compliance with RBI Digital Lending Guidelines; transparent, zero-surprise borrowing. | Low | **P1 (Should Have)** | Sanction letter & mandate generation API | **Yes (Backend)** — generates legally binding terms and mandate token | Clean printable/downloadable modal with APR breakdown, fee schedule, cooling-off period, and digital signature pill |
| **F11** | **Multi-Lingual & Vernacular Assistive Audio Guides** | Micro-Borrower (Tier 2/3) | English-heavy interfaces alienate vernacular-first micro-merchants and artisans. | Drastically reduces onboarding drop-off across diverse linguistic regions of India. | Medium | **P2 (Could Have)** | Static localization assets / TTS endpoints | **No (Frontend native / optional backend)** | Language switcher pill (Hindi, Kannada, Tamil, English) + assistive audio narrator for each form section |
| **F12** | **Offline Document Vault with Client-Side Encryption Preview** | Micro-Borrower | Intermittent mobile data connectivity leads to upload failures and lost application state. | Resilient onboarding experience; zero data loss during network dropouts. | Medium | **P2 (Could Have)** | IndexedDB client cache + sync endpoints | **Yes (Backend)** — handles eventual consistency and secure storage | LocalStorage/IndexedDB state persistence, offline status badge, auto-resume upload upon reconnection |

---

## 3. Clear Team Responsibility Division

```
┌────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND OWNERSHIP (OUR ROLE)                     │
│  • Complete application architecture, design system, and UX workflows │
│  • Public Marketing & Borrower Conversion Experience                   │
│  • Micro-Borrower Self-Service Onboarding & Health Mirror              │
│  • Explainable AI UI (SHAP ribbons, Counterfactual "What-If" sliders) │
│  • Lender Underwriting Workbench & Portfolio Risk Heatmaps             │
│  • Algorithmic Fairness & Bias Audit Console                           │
│  • Consent & DPDP Privacy Management UI                                │
│  • Realistic Mock Services for independent development & testing      │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                           API CONTRACT LAYER
                     (REST / JSON Schemas / SSE)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    BACKEND & ACIE (TEAMMATE OWNERSHIP)                 │
│  • PostgreSQL / MongoDB database & schema persistence                  │
│  • Authentication, JWT / Session issuance, and RBAC enforcement       │
│  • Document OCR pipeline & Aadhaar/PAN validation APIs                 │
│  • Account Aggregator (AA) & GSTN external connector integrations      │
│  • Alternative Credit Intelligence Engine (ACIE) & ML models          │
│  • Risk scoring algorithms, SHAP weight calculations, and fraud flags  │
│  • Loan Management System (LMS) core accounting & repayment engine     │
└────────────────────────────────────────────────────────────────────────┘
```
