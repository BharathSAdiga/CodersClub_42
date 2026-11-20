# UDYOGA — Complete Feature & Button Inventory

**Document Type:** Full-Stack Interface & Control Inventory  
**Platform:** UDYOGA — Beyond Credit. Beyond Barriers.  
**Audience:** Development Team, QA Auditors, Hackathon Presentation Team  
**Inspection Date:** November 20, 2026  
**Classification Standard:**
- **`FUNCTIONAL`**: Complete working interaction with verified frontend and backend execution.
- **`PARTIALLY FUNCTIONAL`**: Working interaction with partial backend wiring or simulated fallback.
- **`DEMO / MOCK`**: Working UI populated from deterministic pre-seeded scenarios or mock service.
- **`DECORATIVE`**: Visual, informational, or typographic element without operational click action.
- **`PLANNED`**: Reserved UI placeholder designated for post-hackathon expansion.

---

## 1. Public Marketing & Conversion Website (`PUBLIC`)

| Element / Control Label | Screen & Section | Component File | Purpose | User Action | Backend API / Service | Status | Expected Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Navbar Logo ("UDYOGA")** | Global Navbar | `Navbar.tsx` | Brand anchor and home reset | Click | In-memory `handleScrollTo('hero-sec')` | `FUNCTIONAL` | Scrolls viewport smoothly to hero section |
| **"How It Works" Nav Link** | Global Navbar | `Navbar.tsx` | Explains 4-stage flow | Click | Smooth scroll to `#how-it-works-sec` | `FUNCTIONAL` | Views 4-stage underwriting workflow |
| **"For Businesses" Nav Link** | Global Navbar | `Navbar.tsx` | Outlines borrower benefits | Click | Smooth scroll to `#problem-sec` | `FUNCTIONAL` | Views MSME deficit breakdown |
| **"For Lenders" Nav Link** | Global Navbar | `Navbar.tsx` | Direct jump to Lender Portal | Click | `setAppMode('LENDER_PORTAL')` | `FUNCTIONAL` | Switches application mode to Lender Portal |
| **"Fairness & Trust" Nav Link**| Global Navbar | `Navbar.tsx` | Direct jump to Auditor Portal | Click | `setAppMode('ADMIN_PORTAL')` | `FUNCTIONAL` | Switches mode to Admin/Fairness Monitor |
| **"Active Persona Pill"** | Global Navbar (Right) | `Navbar.tsx` | Shows active demo persona | Click | `setIsPersonaModalOpen(true)` | `FUNCTIONAL` | Opens 1-click Persona Switcher modal |
| **"Apply Now" Button** | Global Navbar (Right) | `Navbar.tsx` | Direct CTA to borrower loan app | Click | `setAppMode('BORROWER_PORTAL')` | `FUNCTIONAL` | Navigates directly to Loan Application Wizard |
| **"Explore Live Platform"** | Hero Section | `SplitWaveformHero.tsx` | Primary hero conversion CTA | Click | `setAppMode('BORROWER_PORTAL')` | `FUNCTIONAL` | Enters Borrower Portal Dashboard |
| **"How We Evaluate"** | Hero Section | `SplitWaveformHero.tsx` | Explanatory scroll CTA | Click | Smooth scroll to `#how-it-works-sec` | `FUNCTIONAL` | Scrolls to multi-agent architecture section |
| **"Loan Amount Slider"** | Hero Tuner Widget | `LiveTunerWidget.tsx` | Simulates affordable loan range | Slide (₹50k - ₹10L) | Deterministic client-side formula | `FUNCTIONAL` | Updates estimated EMI & recommended tenure |
| **"Tenure Toggle (6/12/18m)"**| Hero Tuner Widget | `LiveTunerWidget.tsx` | Adjusts repayment horizon | Click pill | Pure state recalculation | `FUNCTIONAL` | Recalculates projected monthly EMI |
| **"Start Application" Button** | Hero Tuner Widget | `LiveTunerWidget.tsx` | Transfers tuned amount to app | Click | `setBorrowerView('/borrower/apply')` | `FUNCTIONAL` | Opens application wizard with pre-tuned amount |
| **"Phone Simulator Tabs"** | Hero Section (Right) | `PhoneSimulator.tsx` | Previews borrower mobile UX | Click (UPI / Pass / Alert) | Mock notification preview state | `FUNCTIONAL` | Swaps simulated WhatsApp & UPI alert cards |
| **"Switch Persona (Card)"** | Public Sticky Story | `StickyProductStoryteller.tsx` | Explains multi-persona journey | Click persona | `mockService.setActivePersona(id)` | `FUNCTIONAL` | Updates active persona context across app |
| **"Log In / Switch Role" CTA** | Public Footer / Floating | `AuthModal.tsx` | 1-click hackathon authentication | Click persona key | `POST /api/v1/auth/demo-login` | `FUNCTIONAL` | Issues JWT token and routes to role portal |

---

## 2. Borrower Portal (`BORROWER_PORTAL`)

| Element / Control Label | Screen & Section | Component File | Purpose | User Action | Backend API / Service | Status | Expected Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **"Dashboard" Sidebar Nav** | Borrower Sidebar | `BorrowerLayout.tsx` | Main portal overview | Click | `setBorrowerView('/borrower/dashboard')` | `FUNCTIONAL` | Displays financial summary & active status |
| **"My Application" Nav** | Borrower Sidebar | `BorrowerLayout.tsx` | Track loan application | Click | `setBorrowerView('/borrower/tracking')` | `FUNCTIONAL` | Shows 5-stage progress milestone tracker |
| **"Business Profile" Nav** | Borrower Sidebar | `BorrowerLayout.tsx` | View registered enterprise data | Click | `setBorrowerView('/borrower/profile')` | `FUNCTIONAL` | Renders enterprise metadata & GST status |
| **"Financials" Nav** | Borrower Sidebar | `BorrowerLayout.tsx` | View cash flows & margins | Click | `setBorrowerView('/borrower/financials')` | `FUNCTIONAL` | Displays cash inflow/outflow charts |
| **"Document Vault" Nav** | Borrower Sidebar | `BorrowerLayout.tsx` | Upload statements | Click | `setBorrowerView('/borrower/documents')` | `FUNCTIONAL` | Displays upload zone & verified file list |
| **"Consent Manager" Nav** | Borrower Sidebar | `BorrowerLayout.tsx` | Manage AA / GST permissions | Click | `setBorrowerView('/borrower/consent')` | `FUNCTIONAL` | Shows active permissions & revoke options |
| **"Financial Health" Nav** | Borrower Sidebar | `BorrowerLayout.tsx` | 5-Dimensional Financial DNA | Click | `setBorrowerView('/borrower/health')` | `FUNCTIONAL` | Renders 5-dimensional radar & health metrics |
| **"What-If Simulator" Nav** | Borrower Sidebar | `BorrowerLayout.tsx` | Test resilience under stress | Click | `setBorrowerView('/borrower/insights')` | `FUNCTIONAL` | Opens 6-scenario cash-flow shock workbench |
| **"Credit Assessment" Nav** | Borrower Sidebar | `BorrowerLayout.tsx` | View Credit Appraisal Memo | Click | `setBorrowerView('/borrower/assessment')` | `FUNCTIONAL` | Renders official CAM, APR, and covenants |
| **"Apply for Facility" Button**| Borrower Dashboard | `BorrowerDashboard.tsx` | Start new loan application | Click | `setBorrowerView('/borrower/apply')` | `FUNCTIONAL` | Opens loan request wizard |
| **"Upload Statement" Button** | Borrower Dashboard | `BorrowerDashboard.tsx` | Upload bank / UPI CSV | Click | `setBorrowerView('/borrower/documents')` | `FUNCTIONAL` | Jumps to Document Vault |
| **"Test Cash Shock" Button** | Borrower Dashboard | `BorrowerDashboard.tsx` | Quick jump to simulator | Click | `setBorrowerView('/borrower/insights')` | `FUNCTIONAL` | Jumps to What-If Simulator |
| **"Select CSV File" Dropzone** | Document Vault | `DocumentUploadView.tsx` | Selects CSV statement file | File drop / Select | Native HTML File API | `FUNCTIONAL` | Reads file metadata and checks extension |
| **"Upload & Analyze Statement"**| Document Vault | `DocumentUploadView.tsx` | Uploads CSV to backend | Click | `POST /api/v1/transactions/upload-csv` | `FUNCTIONAL` | Ingests rows, SHA-256 hashes, returns totals |
| **"Grant Consent" Button** | Consent Manager | `ConsentManagementView.tsx`| Authorizes AA/GST data | Click | `POST /api/v1/consent/grant` | `FUNCTIONAL` | Generates active consent record with expiry |
| **"Revoke" Button** | Consent Manager | `ConsentManagementView.tsx`| Terminates data permission | Click | `POST /api/v1/consent/{id}/revoke` | `FUNCTIONAL` | Marks consent as REVOKED immediately |
| **"Scenario Preset Buttons"** | What-If Simulator | `WhatIfSimulatorView.tsx` | Selects standard shock scenario | Click (1 of 6 presets)| Sets sliders to preset parameters | `FUNCTIONAL` | Configures predefined revenue/expense shock |
| **"Run Live Simulation" CTA** | What-If Simulator | `WhatIfSimulatorView.tsx` | Deterministic cash stress test | Click | `POST /api/v1/resilience/simulate` | `FUNCTIONAL` | Returns post-shock DSCR, runway, surplus |
| **"Download CAM" Button** | Assessment Report View| `AssessmentReportView.tsx` | Export Credit Appraisal Memo | Click | Client-side markdown blob / print | `PARTIALLY FUNCTIONAL` | Initiates printable CAM view |

---

## 3. Lender Portal (`LENDER_PORTAL`)

| Element / Control Label | Screen & Section | Component File | Purpose | User Action | Backend API / Service | Status | Expected Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **"Portfolio Overview" Nav** | Lender Sidebar | `LenderLayout.tsx` | High-level underwriting metrics | Click | `setLenderView('/lender/dashboard')` | `FUNCTIONAL` | Displays portfolio cards & pipeline overview |
| **"Application Pipeline" Nav**| Lender Sidebar | `LenderLayout.tsx` | Full queue of MSME applicants | Click | `setLenderView('/lender/pipeline')` | `FUNCTIONAL` | Displays filterable table of applications |
| **"Applicant Workbench" Nav** | Lender Sidebar | `LenderLayout.tsx` | Active underwriting workstation| Click | `setLenderView('/lender/workbench')` | `FUNCTIONAL` | Opens deep analysis workbench for applicant |
| **"Risk Filter Tabs"** | Application Pipeline | `ApplicationPipeline.tsx` | Filter by risk classification | Click (All / Low / Mod / High) | Filter state update | `FUNCTIONAL` | Filters table rows by risk band |
| **"Search Applicant Bar"** | Application Pipeline | `ApplicationPipeline.tsx` | Text search across borrowers | Type MSME name / ID | Text filtering | `FUNCTIONAL` | Narrows table rows dynamically |
| **"Open Workbench" Button** | Application Pipeline | `ApplicationPipeline.tsx` | Selects applicant for review | Click row action | `setSelectedAppId(id)` + view jump | `FUNCTIONAL` | Loads detailed data into Underwriting Workbench |
| **"Run Live AI Assessment"** | Applicant Workbench | `ApplicantDetailWorkbench.tsx`| Triggers 7-agent pipeline | Click | `POST /api/v1/assessment/run` | `FUNCTIONAL` | Launches asynchronous agents & connects SSE |
| **"Live SSE Agent Feed"** | Applicant Workbench | `ApplicantDetailWorkbench.tsx`| Displays real-time agent events| Passive stream | `GET /api/v1/assessment/{id}/stream`| `FUNCTIONAL` | Renders animated cards as each agent executes |
| **"Forensic Graph Tab"** | Applicant Workbench | `ApplicantDetailWorkbench.tsx`| Inspect counterparty network | Click tab | `backend/modules/trust_evidence` | `FUNCTIONAL` | Renders node/edge visual & circular loops |
| **"Cash Stress Testing Tab"** | Applicant Workbench | `ApplicantDetailWorkbench.tsx`| Underwriter shock workbench | Click tab | `POST /api/v1/resilience/simulate` | `FUNCTIONAL` | Evaluates DSCR headroom under custom stress |
| **"Credit Appraisal Memo Tab"**| Applicant Workbench | `ApplicantDetailWorkbench.tsx`| Reads generated CAM narrative | Click tab | `GET /api/v1/assessment/{id}/result` | `FUNCTIONAL` | Formats executive narrative & covenants |
| **"Recommend Approval" Button**| Applicant Workbench | `ApplicantDetailWorkbench.tsx`| Records underwriter decision | Click | UI toast / state update | `DEMO / MOCK` | Acknowledges underwriter sanction memo |
| **"Flag for Field Audit" Button**| Applicant Workbench | `ApplicantDetailWorkbench.tsx`| Requires on-site verification | Click | UI toast / state update | `DEMO / MOCK` | Flags application for human investigator visit |
| **"Conditional Sanction"** | Applicant Workbench | `ApplicantDetailWorkbench.tsx`| Proposes revised terms | Click | UI toast / state update | `DEMO / MOCK` | Attaches covenants to indicative sanction |

---

## 4. Admin & Auditor Portal (`ADMIN_PORTAL`)

| Element / Control Label | Screen & Section | Component File | Purpose | User Action | Backend API / Service | Status | Expected Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **"System Overview" Nav** | Admin Sidebar | `AdminLayout.tsx` | Platform throughput & health | Click | `setAdminView('/admin/overview')` | `FUNCTIONAL` | Displays global MSME throughput & volume |
| **"Fairness Monitoring" Nav** | Admin Sidebar | `AdminLayout.tsx` | Demographic & bias parity | Click | `setAdminView('/admin/fairness')` | `FUNCTIONAL` | Displays approval parity across tiers/sectors |
| **"User Management" Nav** | Admin Sidebar | `AdminLayout.tsx` | Inspect registered accounts | Click | `setAdminView('/admin/users')` | `FUNCTIONAL` | Lists RBAC users, roles, and tenant IDs |
| **"Master Ledger" Nav** | Admin Sidebar | `AdminLayout.tsx` | Immutable application ledger | Click | `setAdminView('/admin/applications')` | `FUNCTIONAL` | Complete audit ledger of all submissions |
| **"Assessment Monitor" Nav** | Admin Sidebar | `AdminLayout.tsx` | Live pipeline latency monitor | Click | `setAdminView('/admin/assessments')` | `FUNCTIONAL` | Subagent execution durations and queue state |
| **"Data Quality Monitor" Nav** | Admin Sidebar | `AdminLayout.tsx` | Ingestion error telemetry | Click | `setAdminView('/admin/data-quality')` | `FUNCTIONAL` | Ingested statement validity & concordance |
| **"Audit Logs" Nav** | Admin Sidebar | `AdminLayout.tsx` | Cryptographic evidence trail | Click | `setAdminView('/admin/audit-logs')` | `FUNCTIONAL` | SHA-256 hashes, consent history, events |
| **"System Telemetry" Nav** | Admin Sidebar | `AdminLayout.tsx` | Server latency & WAL mode | Click | `setAdminView('/admin/system')` | `FUNCTIONAL` | SQLite WAL status, DB pool, API latency |
| **"Reports & Exports" Nav** | Admin Sidebar | `AdminLayout.tsx` | Regulatory compliance export | Click | `setAdminView('/admin/reports')` | `FUNCTIONAL` | Export options for RBI / DPDP audit files |
| **"Export Audit Trail CSV"** | Reports & Exports | `ReportsExportsView.tsx` | Export immutable audit logs | Click | Client-side CSV generation | `FUNCTIONAL` | Downloads CSV containing cryptographic trail |
| **"Trigger Bias Audit Run"** | Fairness Monitoring | `FairnessMonitoringView.tsx` | Re-evaluates fairness status | Click | Client-side audit re-score | `FUNCTIONAL` | Recalculates Disparate Impact Ratio |

---

## 5. Global Utility Controls

| Element / Control Label | Screen & Section | Component File | Purpose | User Action | Backend API / Service | Status | Expected Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **"Persona Switcher Card"** | Floating Modal | `PersonaSwitcher.tsx` | Instant 1-click persona switch | Click (Ramesh / Priya / Vikram / Auditor / Admin) | `handleSelectPersona(id)` | `FUNCTIONAL` | Swaps authentication token, role, and portal view |
| **"Back to Public Site" Button**| All Portals (Header) | Global Layouts | Exit portal to marketing site | Click | `setAppMode('PUBLIC')` | `FUNCTIONAL` | Returns viewport to public landing page |
| **"Toast Notification"** | Global Screen Overlay | Sonner (`toast`) | Visual feedback on API calls | Automated trigger | React State | `FUNCTIONAL` | Displays error or success banner (e.g. CSV parsed) |

---
*Inventory verified by Atharv, Technical Lead & Agentic AI Architect.*
