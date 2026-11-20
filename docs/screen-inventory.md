# UDYOGA: Complete Screen Inventory & UX Architecture

**Project:** UDYOGA – Beyond Credit. Beyond Barriers.  
**Phase:** Phase 2 — Comprehensive Product Strategy  
**Hackathon Track:** The Big Hack 2.0 — Finance Track (F2: Credit for the Credit-Invisible)  
**Author:** Senior FinTech Product Manager & UX Architect  
**Branch:** `feature/phase-2-product-strategy`

---

## 1. Application Navigation Hierarchy

```
UDYOGA APPLICATION ECOSYSTEM
├── 1. PUBLIC WEBSITE (Open Access)
│   ├── /                         [Home / Landing]
│   ├── /about                    [About UDYOGA & Mission]
│   ├── /how-it-works             [How It Works / India Stack Architecture]
│   ├── /for-businesses           [For MSMEs / Cash-Flow Benefits]
│   ├── /for-lenders              [For Banks & NBFCs / Institutional Workbench]
│   ├── /trust-and-safety         [Trust, Responsible Lending & DPDP Compliance]
│   ├── /contact                  [Contact & Regional Grievance Redressal]
│   └── /auth                     [Unified Login & Registration with Role Switcher]
│
├── 2. BORROWER PORTAL (Role: Borrower)
│   ├── /borrower/dashboard              [Executive Overview & Quick Actions]
│   ├── /borrower/profile                [Business Profile & Udyam/PAN Details]
│   ├── /borrower/financials             [Financial Hub & Connected Accounts]
│   ├── /borrower/documents              [Document Vault & Encrypted Uploads]
│   ├── /borrower/consent                [Granular Consent & DPDP Revocation Center]
│   ├── /borrower/apply                  [4-Step Credit Application Wizard]
│   ├── /borrower/tracking               [Application Lifecycle & Disbursal Tracker]
│   ├── /borrower/health                 [Financial Health Mirror & Waveform Visualizer]
│   └── /borrower/assessment             [ACIE Explainable Score & Counterfactual Simulator]
│
├── 3. LENDER WORKBENCH (Role: Credit Officer / Underwriter)
│   ├── /lender/dashboard                [Portfolio Radar & Underwriting Throughput]
│   ├── /lender/pipeline                 [Application Queue with Risk Tiers]
│   ├── /lender/applicants/:id           [Applicant Profile & KYC Cross-Check]
│   ├── /lender/financials/:id           [Multi-Stream Triangulation Analysis]
│   ├── /lender/credit-report/:id        [ACIE Explainable Report & SHAP Breakdown]
│   ├── /lender/risk/:id                 [Anomaly Matrix & Synthetic Loop Detector]
│   ├── /lender/document-requests/:id    [Interactive Document Requests & Queries]
│   ├── /lender/review/:id               [Underwriting Review Workbench]
│   └── /lender/decision/:id             [Sanction Note & Decision Workflow]
│
└── 4. ADMIN & AUDIT CONSOLE (Role: Admin / Auditor)
    ├── /admin/overview                  [System Overview & Live Traffic Cockpit]
    ├── /admin/users                     [User & Organization RBAC Management]
    ├── /admin/applications              [Global Applications Master Ledger]
    ├── /admin/assessments               [ACIE Assessment Monitoring & Drift Radar]
    ├── /admin/fairness                  [Algorithmic Fairness & Bias Audit Console]
    ├── /admin/data-quality              [Data Quality & Ingestion Congruence Hub]
    ├── /admin/audit-logs                [Immutable Audit & Decision Trace Logs]
    └── /admin/system                    [Third-Party Connectors & Infrastructure Telemetry]
```

---

## 2. Public Website Screen Inventory

### SCR-PUB-01: Public Landing (Home)
- **Route:** `/`
- **Key Visual & Interaction Elements:**
  - Floating pill navigation with blur: Brand Logo + links + green pill CTA ("Apply for Credit").
  - Warm cream canvas (`#FBF8F3`) with deep charcoal hero card.
  - Interactive Split Waveform Visualizer ("Your Daily Commerce" on left with equalizer bars / "Your Credit Power" on right with instant credit bubble emerging across the divider).
  - Floating social proof pills: "★ 4.8 from 9,400 MSMEs", "✓ Zero Collateral", "✓ RBI DLG Compliant".
  - Interactive Loan Eligibility Teaser with real-time turnover slider.
  - Testimonial masonry with 5-star cards and artisan photography.
  - Giant full-width typographic footer.
- **States:**
  - *Loading:* Skeleton pulse with smooth opacity fade.
  - *Error:* Graceful fallback to static figures if live API fails.

### SCR-PUB-02: About UDYOGA
- **Route:** `/about`
- **Elements:** Mission statement ("Democratizing credit for the bottom 80%"), leadership principles, advisory board, institutional partners.

### SCR-PUB-03: How It Works
- **Route:** `/how-it-works`
- **Elements:** Interactive 3D visual diagram showing India Stack data rails (AA + GSTN + UPI + DigiLocker) feeding into the Alternative Credit Intelligence Engine (ACIE). Step-by-step interactive card reel.

### SCR-PUB-04: For Businesses
- **Route:** `/for-businesses`
- **Elements:** MSME value proposition, comparison table (UDYOGA vs Moneylenders vs Traditional Banks), interactive repayment savings calculator.

### SCR-PUB-05: For Lenders
- **Route:** `/for-lenders`
- **Elements:** Institutional features, risk mitigation metrics, automated triangulation overview, NPA reduction case study.

### SCR-PUB-06: Trust and Responsible Lending
- **Route:** `/trust-and-safety`
- **Elements:** RBI Digital Lending Guidelines compliance, DPDP Act 2023 adherence, data security encryption certificates, customer grievance nodal officer contact.

### SCR-PUB-07: Contact & Support
- **Route:** `/contact`
- **Elements:** Multi-lingual support form, regional helpline numbers, WhatsApp chatbot trigger, grievance redressal turnaround SLA timeline.

### SCR-PUB-08: Authentication & Role Switcher
- **Route:** `/auth`
- **Elements:** Clean, tabbed mobile-first authentication modal. Switcher for **Borrower**, **Lender**, and **Admin / Auditor**. OTP input with 30s resend timer, remember-me toggle, demo quick-login credentials for hackathon evaluation.

---

## 3. Borrower Portal Screen Inventory

### SCR-BOR-01: Borrower Dashboard
- **Route:** `/borrower/dashboard`
- **Elements:**
  - Welcome greeting with business trade name and verification badge.
  - High-level metric cards: Active Credit Line, Available to Withdraw, Next Sachet Repayment Date, Credit Health Score.
  - Quick action pills: "Withdraw Funds", "Boost Limit", "View Health Mirror".
  - Live activity feed of recent UPI sweeps and repayment receipts.
- **States:**
  - *Empty:* Reassuring prompt: *"Your credit journey starts here. Complete onboarding in 3 minutes to unlock up to ₹5,00,000."* with a large green action button.

### SCR-BOR-02: Business Profile
- **Route:** `/borrower/profile`
- **Elements:**
  - Udyam Registration badge with verified tick.
  - Entity details: Legal Name, Trade Name, Enterprise Class (Micro), Constitution (Proprietorship), PAN, Registered Address, Geotagged operating location.
  - Edit profile triggers with read-only badges for government-verified records.

### SCR-BOR-03: Financial Information Hub
- **Route:** `/borrower/financials`
- **Elements:**
  - Connected data streams: Primary Current Account (AA), Secondary Bank Account, Merchant UPI QR handle, GSTN account.
  - Live sync status indicators (🟢 Synchronized, 🟡 Re-consent Due in 14 days).
  - "Connect New Account" action modal.

### SCR-BOR-04: Document Vault
- **Route:** `/borrower/documents`
- **Elements:**
  - Uploaded KYC and business artifacts (PAN card, Shop Establishment License, Cancelled Cheque).
  - Client-side thumbnail previews with AES-256 encryption badges.
  - Drag-and-drop upload zone with file size/type validation.

### SCR-BOR-05: Consent & DPDP Management Center
- **Route:** `/borrower/consent`
- **Elements:**
  - Granular consent cards for each active data provider (Bank AA, GSTN, UPI, Utility).
  - Details per consent: Scope of access, validity expiry date, data usage purpose.
  - **"Revoke Consent"** instant one-click toggle with immediate confirmation dialog.
  - Downloadable immutable consent artifact PDF.

### SCR-BOR-06: 4-Step Credit Application Wizard
- **Route:** `/borrower/apply`
- **Elements:**
  - Step 1: Loan Purpose & Requested Amount.
  - Step 2: Account Aggregator 3-click authorization modal.
  - Step 3: Alternative Footprint enrichment (optional UPI/GSTN linking).
  - Step 4: Loan Customizer (Tenor slider, Daily vs Weekly sachet sweep toggle, instant KFS calculator).

### SCR-BOR-07: Application Lifecycle Tracker
- **Route:** `/borrower/tracking`
- **Elements:**
  - Visual stepped progress line: Submitted ➔ Data Ingested ➔ ACIE Evaluated ➔ Underwriter Verified ➔ Disbursal Triggered.
  - Estimated time remaining indicator.
  - Direct contact pill for assigned support representative.

### SCR-BOR-08: Financial Health Mirror
- **Route:** `/borrower/health`
- **Elements:**
  - Interactive Cash-Flow Waveform Visualizer showing 90-day daily inflows vs. outflows.
  - Average Daily Minimum Balance (ADMB) gauge.
  - Seasonality index and revenue volatility cushion indicators.

### SCR-BOR-09: ACIE Assessment & "What-If" Simulator
- **Route:** `/borrower/assessment`
- **Elements:**
  - ACIE Credit Vitality Score (0–900 dial with color spectrum).
  - Bi-directional Explainability Ribbon (Top 3 positive drivers, top 2 drag factors).
  - **Counterfactual "What-If" Credit Simulator:** Dual interactive sliders for Average Daily Balance and Monthly UPI Volume; live updating projected credit limit card.

---

## 4. Lender Workbench Screen Inventory

### SCR-LEN-01: Lender Dashboard
- **Route:** `/lender/dashboard`
- **Elements:**
  - Executive portfolio KPI ribbon: Active Applications (42), Approved Today (14), Disbursed Volume (₹1.8 Cr), Avg Underwriting TAT (4.2m).
  - Risk Tier Distribution Pie Chart (Low, Moderate, Elevated, High).
  - Underwriter SLA throughput bar graph.

### SCR-LEN-02: Application Pipeline
- **Route:** `/lender/pipeline`
- **Elements:**
  - Comprehensive searchable, filterable data grid.
  - Filter by: Risk Tier, Loan Ticket Size, Sector, State, TAT urgency.
  - Quick-view drawer for rapid file scanning without page reloads.

### SCR-LEN-03: Applicant Deep-Dive Profile
- **Route:** `/lender/applicants/:id`
- **Elements:**
  - Borrower Identity summary, Udyam certificate metadata, Geo-verification map pin, entity age, ownership structure.

### SCR-LEN-04: Multi-Stream Financial Overview
- **Route:** `/lender/financials/:id`
- **Elements:**
  - **Triangulation Engine View:** Three parallel columns comparing Bank Inflows (AA), GSTN Sales, and UPI Merchant Turnover.
  - Congruence score (e.g. 96.2% Match).
  - Cheque bounce and debit failure frequency table.

### SCR-LEN-05: Credit Intelligence Report (ACIE)
- **Route:** `/lender/credit-report/:id`
- **Elements:**
  - Full ACIE scoring breakdown with confidence score interval.
  - Detailed SHAP feature importance chart with numerical weightings.
  - Historical repayment behavior across existing micro-lines.

### SCR-LEN-06: Anomaly & Risk Indicators
- **Route:** `/lender/risk/:id`
- **Elements:**
  - Synthetic Loop & Round-Tripping Heatmap.
  - Customer Concentration Risk gauge (identifying if > 40% revenue comes from a single GST buyer).
  - Unusual velocity spike alerts (e.g., sudden 300% surge 3 days prior to loan application).

### SCR-LEN-07: Document Requests & Queries
- **Route:** `/lender/document-requests/:id`
- **Elements:**
  - In-app query composer to request clarifying documents from the borrower.
  - Pre-defined checklist templates (e.g., "Upload latest electricity bill", "Clarify GST turnover variance").

### SCR-LEN-08: Underwriting Review
- **Route:** `/lender/review/:id`
- **Elements:**
  - Comprehensive credit assessment worksheet.
  - Underwriter risk adjustment sliders (haircut percentage, debt service coverage buffer).
  - Auto-generated preliminary sanction summary note.

### SCR-LEN-09: Decision Workflow & Sanction
- **Route:** `/lender/decision/:id`
- **Elements:**
  - Final decision action panel: **Approve**, **Approve with Conditions**, **Request Rework**, **Decline**.
  - Sanction Letter generator with customizable loan covenants.
  - Digital signoff button with instant push notification to borrower.

---

## 5. Admin & Audit Console Screen Inventory

### SCR-ADM-01: Admin Overview
- **Route:** `/admin/overview`
- **Elements:**
  - Real-time system pulse: Active users, concurrent applications, API request throughput (req/sec), platform error rate.
  - Geographic application heatmap across Indian states.

### SCR-ADM-02: User & RBAC Management
- **Route:** `/admin/users`
- **Elements:**
  - Searchable user table with role badges (Borrower, Credit Officer, Manager, Admin, Auditor).
  - One-tap permission modifier, account suspension toggle, session termination.

### SCR-ADM-03: Global Applications Master Ledger
- **Route:** `/admin/applications`
- **Elements:**
  - Master audit table of every application submitted, with state machine statuses, timestamped events, and assigned underwriters.

### SCR-ADM-04: Assessment Monitoring & Model Drift
- **Route:** `/admin/assessments`
- **Elements:**
  - ACIE inference telemetry: Mean score distribution, model inference latency, confidence interval drift tracker over 30/60/90 days.

### SCR-ADM-05: Algorithmic Fairness & Bias Console
- **Route:** `/admin/fairness`
- **Elements:**
  - Disparate Impact Ratio (DIR) compliance dial (Four-Fifths Rule threshold marker at 0.80).
  - Demographic Parity graphs: Approval rates across Gender (Female vs Male-led MSMEs), Geography (Tier 1 vs Tier 2 vs Tier 3), and Enterprise Scale.
  - Feature bias audit matrix and automated fairness compliance certificate export.

### SCR-ADM-06: Data Quality & Congruence Hub
- **Route:** `/admin/data-quality`
- **Elements:**
  - Monitoring payload schema compliance, missing field frequency across AA and GSTN feeds, OCR extraction accuracy rates.

### SCR-ADM-07: Immutable Audit Logs
- **Route:** `/admin/audit-logs`
- **Elements:**
  - Cryptographically verifiable event log (User ID, IP Address, Timestamp, Action, Old Value, New Value).
  - Filter by: Consent Revocation, Sanction Override, Role Change, Security Event.

### SCR-ADM-08: System Infrastructure & Connector Telemetry
- **Route:** `/admin/system`
- **Elements:**
  - Health status cards for third-party rails: Sahamati AA Gateway, GSTN API, DigiLocker, NPCI UPI AutoPay.
  - Response time charts, error logs, and circuit breaker toggle controls.

---

## 6. Comprehensive UX States: Empty, Loading, and Error States

| Screen Category | Loading State Pattern | Empty State Pattern | Error & Edge State Pattern |
| :--- | :--- | :--- | :--- |
| **Public Landing & Pages** | Skeleton card shimmering with smooth pulse; hero video/graphic progressive blur-up. | N/A (Always populated). | Fallback static metrics banner if live statistics service fails; offline alert banner if disconnected. |
| **Borrower Dashboard & Lists** | Rounded pill skeleton blocks matching exact component layout; no jarring layout shifts (CLS < 0.05). | Illustrated warm graphic + friendly copy: *"No active loans yet. Your cash flow qualifies you for up to ₹5,00,000."* + prominent green CTA. | Red warning banner with retry button: *"Could not refresh recent transactions. Cached data from 2 hours ago shown."* |
| **Health Mirror & Waveforms** | Animated fluid pulse simulating soundwaves/cash waves before data points snap into place. | Guide card: *"Connect your bank account or merchant QR to view your cash-flow health mirror."* | Fallback message if bank statement has < 30 days data: *"Limited history detected. Progressive confidence mode activated."* |
| **Lender Underwriting Table** | 6-row animated placeholder table with shimmering status badges. | *"No applications pending review in this filter tier. Great work!"* with clear filter reset link. | Network error banner with auto-reconnect timer and manual retry trigger. |
| **Lender Triangulation Radar** | Rotating radar pulse animation with translucent polygon wireframe. | *"Waiting for secondary data stream (GSTN). Bank AA data available."* | Flagged discrepancy alert: *"GST sales and Bank inflows differ by > 35%. Review underwriter anomaly checklist."* |
| **Admin & Fairness Gauges** | Circular spinner inside gauge frame with fading percentage placeholder. | *"No demographic data available for this date window."* | Alert banner: *"Disparate Impact Ratio dropped below 0.85 in Sector X. Review recommended."* |
| **Consent Revocation Drawer** | Disabled buttons with embedded loading spinner during API handshake. | *"No third-party consents active."* | Clear recovery modal: *"Consent revocation could not be processed due to a network glitch. Please retry."* |
