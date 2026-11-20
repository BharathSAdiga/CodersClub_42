# UDYOGA: MVP Scope & Product Roadmap

**Project:** UDYOGA – Beyond Credit. Beyond Barriers.  
**Phase:** Phase 2 — Comprehensive Product Strategy  
**Hackathon Track:** The Big Hack 2.0 — Finance Track (F2: Credit for the Credit-Invisible)  
**Author:** Senior FinTech Product Manager & UX Architect  
**Branch:** `feature/phase-2-product-strategy`

---

## 1. Hackathon MVP Objectives

The core objective of the UDYOGA MVP is to deliver an **unforgettable, institutional-grade, fully interactive application experience** addressing the *F2 – Credit for the Credit-Invisible* problem statement.

The MVP must convincingly demonstrate:
1. How alternative data (UPI QR, GSTN, Account Aggregator) eliminates the need for collateral for informal Indian MSMEs.
2. How Explainable AI (ACIE with SHAP and counterfactuals) builds trust and removes the "Black-Box" stigma.
3. How lenders make high-confidence, data-triangulated decisions in under 5 minutes.
4. How platform administrators and ethics officers audit algorithmic fairness and DPDP consent compliance.
5. A world-class Scandinavian/Swiss-grade visual aesthetic (warm cream, rich charcoal, electric spring-green accents, interactive split cashflow visualizers, and responsive sliders).

---

## 2. In-Scope MVP Features (Hackathon Deliverable)

### 2.1 Public Marketing & Conversion Experience
- [x] Full-fidelity Landing Page (`/`) with interactive Split Waveform Visualizer ("Your Daily Commerce" vs "Your Credit Power").
- [x] Live Interactive Loan Eligibility Teaser with real-time sliders.
- [x] Video-faithful design elements: Floating capsule navigation with blur, testimonial masonry, dynamic reviews, and full-width brand footer.
- [x] Informational pages: About, How It Works, For Businesses, For Lenders, Trust & Responsible Lending, Contact.
- [x] Unified Authentication modal with instant demo role-switching (`Borrower`, `Lender`, `Admin / Auditor`).

### 2.2 Micro-Borrower Experience
- [x] **4-Step Frictionless Onboarding Wizard:**
  - Step 1: Business identity lookup (Udyam & PAN mock auto-fill).
  - Step 2: 3-Click Account Aggregator bank consent modal.
  - Step 3: Alternative footprint connector (UPI QR handle, GSTN).
  - Step 4: Loan Customizer with dynamic tenor and sachet sweep sliders.
- [x] **Financial Health Mirror (`/borrower/health`):**
  - Interactive daily cash-flow waveform visualization.
  - Average Daily Minimum Balance (ADMB) dial and seasonal volatility cushion.
- [x] **Explainable AI (ACIE) Assessment (`/borrower/assessment`):**
  - ACIE Credit Vitality Score (0–900).
  - Bi-directional SHAP Explainability Ribbon (Positive boost factors vs Drag factors).
  - **Counterfactual "What-If" Credit Simulator:** Dual sliders (Daily Balance, Monthly UPI Volume) dynamically re-calculating projected credit line in real time.
- [x] **Borrower Dashboard (`/borrower/dashboard`):** Active credit line, withdrawal trigger, repayment schedule, and transaction feed.
- [x] **Granular Consent & DPDP Revocation Center (`/borrower/consent`):** Real-time toggles to revoke individual data pipes with immediate audit feedback.
- [x] **Key Fact Statement (KFS) Modal:** RBI-compliant transparent disclosure of all-inclusive APR, zero hidden fees, and cooling-off period.

### 2.3 Lender Underwriting Workbench
- [x] **Executive Portfolio Dashboard (`/lender/dashboard`):** Live stats ribbon (Active reviews, approvals, disbursed volume, average TAT), risk tier distribution chart.
- [x] **Application Pipeline Grid (`/lender/pipeline`):** Filter by Risk Tier (Low, Moderate, Elevated, High), Sector, and Ticket Size.
- [x] **Applicant Deep-Dive Review (`/lender/applicants/:id`):** Identity cross-check, entity metadata.
- [x] **Triangulation Engine (`/lender/financials/:id`):** 3-way reconciliation of Bank AA Inflows vs GST Returns vs UPI Turnover with congruence scoring.
- [x] **Anomaly & Fraud Matrix (`/lender/risk/:id`):** Circular loop detector, velocity spike warning, and customer concentration risk gauge.
- [x] **Underwriter Decision Workflow (`/lender/decision/:id`):** Sanction note composer, covenant builder, and one-click sanction issuance.

### 2.4 Administrator & Algorithmic Fairness Console
- [x] **System Pulse Cockpit (`/admin/overview`):** Request throughput, API latency, geographic distribution map.
- [x] **Algorithmic Fairness Console (`/admin/fairness`):**
  - Disparate Impact Ratio (DIR) compliance gauge (Four-Fifths Rule threshold at 0.80).
  - Demographic Parity graphs: Approval rates across Gender (Female vs Male-led MSMEs) and Geography (Tier 1 vs Tier 2 vs Tier 3).
  - Feature bias matrix and one-click compliance certification download.
- [x] **Immutable Security & Audit Trail (`/admin/audit-logs`):** Verifiable event logs for consent revocations and sanction overrides.
- [x] **Third-Party Connector Telemetry (`/admin/system`):** Health status, latency, and circuit breakers for AA, GSTN, DigiLocker, and NPCI rails.

### 2.5 Resilient Frontend Mock Service Layer
- [x] Realistic, high-fidelity mock data and service handlers mirroring the teammate's backend API contract.
- [x] Seamless toggle between Mock Mode (for standalone frontend demo) and Live Integration Mode (Phase 6).

---

## 3. Out-of-Scope for Hackathon (Future Production Roadmap)

| Capability | MVP Treatment | Production Phase (Post-Hackathon) |
| :--- | :--- | :--- |
| **Real Government API Keys** | High-fidelity sandbox mocks with realistic latency simulation. | Direct production leased-line connections to GSTN, Sahamati AA, and UIDAI. |
| **Real Money Movement / Payment Gateway** | Simulated UPI AutoPay debit schedule with instant balance update. | Real-time NPCI e-Mandate clearing via Razorpay / Cashfree / Setu APIs. |
| **Voice Multimodal Generation** | High-contrast vernacular text + pre-recorded assistive audio walkthrough snippets. | Real-time streaming Generative AI Voice Agents (e.g. Bhashini / Sarvam AI integration). |
| **Physical Field Verification App** | Digital geo-tagged selfie and shop establishment photo upload. | Dedicated offline Android APK with GPS spoofing detection for field credit officers. |
| **Multi-Entity Cross-Guarantee Matrix** | Single borrower entity focus with co-applicant guarantee notes. | Complex multi-tier corporate group cross-collateralization graphs. |

---

## 4. Phase-by-Phase Execution Schedule

```
┌────────────────────────────────────────────────────────────────────────┐
│                        UDYOGA DEVELOPMENT TIMELINE                     │
├────────────────────────────────────────────────────────────────────────┤
│  Phase 1: Research & MSME Credit Analysis                   [COMPLETED]│
│  Phase 2: Product Strategy, Personas & Screen Inventory     [COMPLETED]│
│  Phase 3: Architecture & API Contract Specification          [NEXT]    │
│  Phase 4: Design System, UI Components & Mock Service Layer  [UPCOMING]│
│  Phase 5A: Public Marketing & Borrower Experience            [UPCOMING]│
│  Phase 5B: Lender Underwriting Workbench                     [UPCOMING]│
│  Phase 5C: Admin & Algorithmic Fairness Console              [UPCOMING]│
│  Phase 6: Backend & ACIE Integration                         [UPCOMING]│
│  Phase 7: QA, Security Hardening & Demo Readiness            [UPCOMING]│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Success Criteria & Demo Verification Checklist

- [ ] **Visual Impact:** Instant recognition of the high-craft design language (warm cream, rich charcoal, electric spring-green accents, smooth Framer Motion springs).
- [ ] **Interactive Responsiveness:** Sliders, split visualizers, and simulators must respond with zero jank (< 16ms frame times, 60 FPS).
- [ ] **Story Completeness:** The judge must be able to walk through:
  1. An informal micro-artisan who has no collateral getting approved in 3 minutes.
  2. The same borrower exploring the "What-If" simulator to understand how to increase their limit.
  3. A bank underwriter opening the file, viewing the 3-way triangulation, and approving the loan.
  4. An independent auditor verifying that female entrepreneurs are approved at 94% parity.
- [ ] **Zero Crash Resilience:** All forms have client-side validation; empty states guide the user; error states allow graceful recovery.
