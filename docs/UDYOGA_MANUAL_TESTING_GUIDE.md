# UDYOGA — Complete Manual Feature & AI Agent Testing Guide

**Handbook**: Step-by-Step Practical Testing Protocol for Developers & Hackathon Evaluators  
**Target Applications**: Frontend (`http://localhost:5173`) & Backend (`http://127.0.0.1:8000`)  
**Database**: SQLite 3 (`udyoga.db` in WAL mode)  
**Date**: November 2026

---

## 1. Quick Launch (1-Click Startup)

Before beginning manual testing, ensure both servers are running:

### Step 1.1: Start the Platform
Double-click `run_udyoga.bat` located in the root repository folder, or run in terminal:
```bat
.\run_udyoga.bat
```
This automatically launches:
1. **FastAPI Backend Server**: Running on `http://127.0.0.1:8000` (API Docs at `http://127.0.0.1:8000/docs`).
2. **Vite React Frontend**: Running on `http://localhost:5173`.
3. Opens `http://localhost:5173` automatically in your default browser.

*(To shut down servers later, double-click `stop_udyoga.bat`).*

---

## 2. Test Phase 1: Authentication & Session Resilience

### Test 1.1: 1-Click Demo Persona Login
* **Where to Test**: Public Landing Page (`http://localhost:5173`).
* **How to Test**:
  1. Click the **"Sign In"** button on the top right navigation bar.
  2. The Authentication Modal appears.
  3. Under the **"Quick Demo Access"** section at the bottom of the modal, click on:
     * **"Priya Patel"** (Growth Borrower)
* **What Input to Give**: 1 click on the "Priya Patel" button.
* **What Output to Expect**:
  * Success toast notification: `"Signed in successfully as Priya Patel"`.
  * Instant portal transition into the **Borrower Portal** (`/borrower/dashboard`).
  * Top navigation bar displays `"Priya Patel (Precision Auto Ancillary)"` with a green `BORROWER` pill badge.

---

### Test 1.2: Session Persistence Across Page Reload
* **Where to Test**: Inside Borrower Dashboard (`http://localhost:5173`).
* **How to Test**:
  1. While logged in as Priya Patel, press `F5` (or click browser reload).
* **What Input to Give**: Browser Page Refresh (`F5`).
* **What Output to Expect**:
  * The page reloads without kicking you out to the public landing page.
  * The session bootstrap hook detects the active JWT token in storage.
  * You remain on the Borrower Dashboard with all demographic data intact.

---

### Test 1.3: User Registration with Brand New Account
* **Where to Test**: Public Landing Page.
* **How to Test**:
  1. Sign out (click **"Sign Out"** in sidebar or top bar).
  2. Click **"Sign In"** on the top bar, then click the **"Register"** tab at the top of the modal.
* **What Input to Give**:
  * **Full Name**: `Aarav Sharma`
  * **Email**: `aarav.sharma@testkirana.in`
  * **Password**: `TestSecurePass123!`
  * **Role**: Select `Borrower (MSME Owner)`
  * Click **"Create Account"**.
* **What Output to Expect**:
  * Success toast: `"Registration successful. You may now sign in."`
  * Switch to Sign In tab and log in with those credentials -> successfully enters Borrower Dashboard.
  * Salted bcrypt/argon2id password hash is stored in SQLite `users` table with zero plaintext exposure.

---

### Test 1.4: Sign Out Workflow
* **Where to Test**: Bottom of the left sidebar or top right navbar.
* **How to Test**: Click the **"Sign Out"** button.
* **What Output to Expect**:
  * Toast: `"Signed out of session successfully."`
  * Active tokens and role states are purged from storage.
  * Application returns to the public marketing landing page.

---

## 3. Test Phase 2: Borrower Workflow & Feature Verification

Log in as **Priya Patel** (or switch to borrower persona) to execute these tests.

---

### Test 2.1: Business Demographic Profile Inspection & Editing
* **Where to Test**: Left Sidebar -> **"Business Profile"** (`/borrower/profile`).
* **How to Test**:
  1. Inspect the profile card displaying Legal Name, Trade Name, Sector, and Declared Financials.
  2. Click the **"Edit Business Profile"** button at the top right of the card.
  3. A modal opens with pre-filled business values.
* **What Input to Give**:
  * Change **Trade Name** to: `Kavitha Handloom & Silks`
  * Change **Declared Monthly Turnover** to: `250000`
  * Change **Declared Existing Monthly EMI** to: `8500`
  * Click **"Save Changes"**.
* **What Output to Expect**:
  * Toast: `"Business profile updated and persisted to SQLite database!"`
  * Modal closes; the dashboard card instantly displays `Kavitha Handloom & Silks` and ₹2,50,000.00 monthly turnover.
  * Press `F5` to reload -> values persist directly from the SQLite database.
* **Negative Test (Validation Guard)**:
  * Click "Edit Business Profile" again, enter `-50000` in Monthly Turnover, and click "Save Changes".
  * Output: Toast error `"Turnover and EMI must be non-negative values"` and save is blocked.

---

### Test 2.2: Bank Statement Ingestion
* **Where to Test**: Left Sidebar -> **"Documents & Bank Data"** (`/borrower/documents`).
* **How to Test**:
  1. Click **"Documents & Bank Data"** in the left sidebar.
  2. Click the **"Download Sample Statement (CSV)"** button at the top right (or use the pre-generated `sample_msme_bank_statement.csv` located in the root repository folder).
  3. Switch to the **"Bank & Sales Statement CSV"** tab.
  4. Drag and drop the downloaded `sample_msme_bank_statement.csv` file into the upload dropzone (or click the dropzone to select it).
* **What Output to Expect**:
  * Toast notification: `sample_msme_bank_statement.csv ingested into UDYOGA Engine (26 txs, ₹5,44,000 inflow). Provenance: USER_UPLOADED.`
  * The file appears immediately at the top of the Document Vault list with a green `VERIFIED` status badge.
  * In the background, all 26 transactions are parsed and stored in the SQLite `transactions` table.

---

### Test 2.3: 4-Tier Financial DNA Synthesis
* **Where to Test**: Left Sidebar -> **"Financial DNA & Cashflow"** (`/borrower/health`) or Borrower Dashboard -> **"4-Tier Financial DNA Pulse"** shortcut card.
* **How to Test**:
  1. Click **"Financial DNA & Cashflow"** in the sidebar (or click "View Financial DNA" on the dashboard card).
  2. Inspect the **"4-Tier Financial DNA Synthesis (Agent 4)"** card displaying the four multi-dimensional vectors:
* **What Output to Expect**:
  * **1. Volume & Velocity**: Analyzes average monthly operating inflow (₹3,40,000), transaction velocity (18.4 txs/day), and 98.2% active rail continuity.
  * **2. Volatility & Margin**: Displays revenue coefficient of variation (0.14 - Low Volatility) and healthy net cash operating margin (+24.8%).
  * **3. Seasonality & Continuity**: Evaluates continuity across all 12 months with 1.08x seasonal surge, confirming 0% off-season penalty.
  * **4. Debt Burden & Coverage**: Highlights reconciled debt obligations (₹8,500/mo) against 2.45x pre-borrowing DSCR and free cash surplus.
  * Interactive 7D / 30D / 90D reporting period pills dynamically adjust the inflow waveform and liquidity cushion.

---

### Test 2.4: What-If Resilience & Stress Simulator
* **Where to Test**: Left Sidebar -> **"What-If Simulator"** (`/borrower/insights`).
* **How to Test**:
  1. Inspect the baseline metrics: CFADS (Cash Available for Debt Service), Stressed Cash Runway, Safe Loan Ceiling ($P_{\text{max}}$), and DSCR.
  2. Either click the **"30% Drop (2 Months)"** 1-click economic preset, OR manually adjust the **"Revenue Shock" slider** to `-30%` and **"Expense Inflation" slider** to `+15%`.
  3. Click the **"Simulate Stress Test"** button.
* **What Output to Expect**:
  * Instant reactive recalculation with live engine confirmation toast (`Stress test simulated: Stressed DSCR ...x`).
  * **Stressed Cash Runway**: Dynamically recalculates to show days of survival remaining (with zero `NaN` occurrences).
  * **Stressed DSCR**: Updates dynamically (e.g. `1.18x • CONDITIONAL` or `SAFE`).
  * **Safe Loan Ceiling ($P_{\text{max}}$)**: Updates to show the conservative borrowing capacity under crisis.

---

### Test 2.5: Submitting a Formal Loan Application
* **Where to Test**: Left Sidebar -> **"Apply for Credit"** (`/borrower/apply`).
* **How to Test**:
  1. Adjust the **Requested Amount** slider (e.g., `₹1,95,000`).
  2. Adjust the **Repayment Tenor** slider (e.g., `105 Days`).
  3. Choose the **Repayment Cadence** (`Daily Sweep` or `Weekly Sachet`).
  4. Inspect the dynamic **Key Fact Statement (KFS)** showing Daily Sweep amount, APR, and total interest.
  5. Check the box **"I accept the Key Fact Statement terms..."**.
  6. Click the **"Submit & Apply"** button.
* **What Output to Expect**:
  * Toast: `"Credit application APP-2026-XXXXXX submitted and registered! Review underway."`
  * Automatically redirects to **Application Tracking View** (`/borrower/tracking`).
  * The newly submitted application appears at the top with status `SUBMITTED`, reference ID, and 5-stage live underwriting lifecycle timeline.

---

### Test 2.6: Explicit Consent Management
* **Where to Test**: Left Sidebar -> **"Consent & Privacy"** (`/borrower/consent`).
* **How to Test**:
  1. View the list of institutional lenders (e.g., HDFC Bank, State Bank of India).
  2. Find "HDFC Bank" and click the **"Revoke Consent"** button.
* **What Output to Expect**:
  * Status badge turns from green `ACTIVE` to red `REVOKED`.
  * If a lender tries to view your credit dossier while consent is revoked, the system returns HTTP 403 Forbidden.
  * Click **"Grant Consent"** -> badge immediately returns to green `ACTIVE`.

---

## 4. Test Phase 3: The 7 AI Agents in Action (Live Assessment & CAM)

This is the centerpiece of UDYOGA. You will trigger and witness all 7 AI agents executing sequentially via Server-Sent Events (SSE).

### Where to Test:
Left Sidebar -> **"Underwriting Report (CAM)"** (`/borrower/assessment`).

### Step-by-Step Test Procedure:
1. Navigate to `/borrower/assessment`.
2. Locate the banner with the button **"Run Live AI Assessment"**.
3. Click **"Run Live AI Assessment"**.

### What to Observe During the Live Execution:

| Agent Step | Name | What it Does Behind the Scenes | What You Will See on Screen |
|:---:|:---|:---|:---|
| **Step 1** | **Forensic Audit Agent** | Scans transactions for circular flows, duplicate amounts, round-number bias, and timing anomalies. | Agent 1 card pulses blue, progress increments to 14%, status: `"Forensic transaction integrity cleared"`. |
| **Step 2** | **Bank Ingestion Agent** | Normalizes credits and debits into monthly buckets, isolating non-revenue transfers. | Agent 2 card activates, progress reaches 28%, displays `"Cash flow streams normalized with Decimal precision"`. |
| **Step 3** | **Evidence Reconciliation Agent** | Matches declared borrower loans against detected bank debits to avoid double-counting. | Agent 3 card activates, progress reaches 42%, displays `"Obligation-level matching: 1 matched, 0 unmatched"`. |
| **Step 4** | **Financial DNA Synthesis Agent** | Calculates 4-tier resilience profile across velocity, volatility, seasonality, and debt coverage. | Agent 4 card pulses green, progress reaches 57%, displays `"Financial DNA synthesized: Moderate Volatility, Strong Continuity"`. |
| **Step 5** | **Resilience & Shock Simulator Agent** | Simulates 20% revenue shock and inflationary cost spikes; calculates stressed cash runway. | Agent 5 card activates, progress reaches 71%, displays `"Resilience verified: 68 days stressed runway, DSCR 1.84"`. |
| **Step 6** | **Underwriting Policy Engine Agent** | Applies strict FOIR caps (50%) and compound interest formula to calculate $P_{\text{max}}$. | Agent 6 card pulses, progress reaches 85%, displays `"Calculated Pmax: ₹4,18,000.00 @ 14.0% p.a."`. |
| **Step 7** | **CAM Narrative Agent** | Synthesizes findings from Agents 1–6 into a bank-ready Credit Appraisal Memo. | Agent 7 completes, progress hits 100%, status: `"Assessment Completed — CAM Generated"`. |

### Final Output to Verify on Screen:
* **Recommended Facility**: `UNSECURED_WORKING_CAPITAL_LINE`
* **Recommended Loan Amount**: Verified non-zero amount bounded by cash flow (e.g. ₹3,50,000.00 – ₹4,18,000.00)
* **Projected DSCR**: e.g., `1.84`
* **Indicative APR**: `13.5% – 14.5%`
* **Full Credit Appraisal Memo (CAM)**: Formatted Markdown report detailing:
  1. Executive Summary & MSME Background
  2. Cash Flow & Revenue Analysis
  3. Debt Servicing & Affordability Boundaries
  4. Stress Test Resilience Findings
  5. Recommended Terms, Covenants & Risk Mitigation
* **Action Button**: Click **"Download CAM"** to print or export the PDF memo.

---

## 5. Test Phase 4: Institutional Lender Workflow

Now test the perspective of the bank credit officer evaluating the application you submitted!

### Step 5.1: Switch to Lender Persona
* **How to Test**:
  1. Click **"Switch Persona"** in top bar, or Sign Out and Sign In.
  2. Select **"Vikram Malhotra (Senior Credit Officer)"** (`vikram` / `password123`).
* **What Output to Expect**:
  * You enter the **Lender Portal** (`/lender/dashboard`).
  * The top bar displays a blue `LENDER` badge.

---

### Step 5.2: Application Pipeline & Filtering
* **Where to Test**: Left Sidebar -> **"Application Pipeline"** (`/lender/pipeline`).
* **How to Test**:
  1. View the pipeline table. Notice the application you submitted in Phase 2 appears in the queue!
  2. Click the sector filter pills: `Retail / Kirana`, `Textile Weaving`, `Manufacturing`.
  3. Change the sort order dropdown from `Newest First` to `Amount: High to Low`.
* **What Output to Expect**:
  * Pipeline table filters and re-sorts instantly in real time.

---

### Step 5.3: Applicant Workbench & 3-Way Triangulation
* **Where to Test**: In the pipeline table, click the **"Review Dossier"** button next to an applicant (e.g., Priya Patel / Kavitha Silks).
* **What Output to Expect**:
  * Enters `/lender/workbench`.
  * Visualizes **3-Way Triangulation**:
    1. Declared Turnover (Self-Reported)
    2. Bank Deposit Velocity (Verified Banking)
    3. GST Returns (Government Tax Filings)
  * Displays Evidence Provenance categories (`SOURCE_LABELLED`, `USER_UPLOADED`, `SYSTEM_DERIVED`).

---

### Step 5.4: Loan Decisioning (Sanction / Decline)
* **Where to Test**: Bottom of the Applicant Workbench screen.
* **How to Test**:
  1. In the **Underwriter Remarks** text area, type:
     ```text
     Sanctioned under Prime MSME Program at 13.8% p.a. 12-month tenure approved.
     ```
  2. Click the green **"Sanction Loan"** button.
* **What Output to Expect**:
  * Success toast: `"Application Sanctioned Successfully!"`
  * Application status badge immediately turns green: `APPROVED`.
  * The action is saved to the SQLite database.
  * Refresh the page (`F5`) -> status remains `APPROVED`.
  * An immutable audit log entry is written to `audit_access_logs`.

---

## 6. Test Phase 5: Administrator & Governance Portal

Now test platform oversight, user management, and cryptographic audit proofs.

### Step 6.1: Switch to Administrator Persona
* **How to Test**:
  1. Click **"Switch Persona"** in top bar.
  2. Select **"Platform Administrator"** (or log in with `admin` / `adminpassword123`).
* **What Output to Expect**:
  * Enters **Admin Portal** (`/admin/overview`).
  * Navigation shows purple `ADMIN` badge.

---

### Step 6.2: Live User Management (Account Suspension / Reactivation)
* **Where to Test**: Left Sidebar -> **"User Management"** (`/admin/users`).
* **How to Test**:
  1. Inspect the directory of registered users loaded from the SQLite database.
  2. Find any user (e.g., `ramesh` or `priya`) who is currently `ACTIVE`.
  3. Click the red **"Suspend"** button next to their name.
* **What Output to Expect**:
  * The user's status badge turns red `SUSPENDED`.
  * SQLite table `users.is_active` updates to `FALSE`.
* **Live Proof Test (Suspension Enforcement)**:
  * In a new Incognito browser window, open `http://localhost:5173`.
  * Try to sign in with that suspended user.
  * Backend rejects login with HTTP 401 Unauthorized: `"User account is deactivated or suspended."`
* **Reactivation**:
  * Back in Admin portal, click **"Reactivate"** next to the user.
  * Badge turns green `ACTIVE`. The user can now log in again!

---

### Step 6.3: Tamper-Evident Audit Trail & Merkle Root Verification
* **Where to Test**: Left Sidebar -> **"Audit Logs"** (`/admin/audit-logs`).
* **How to Test**:
  1. Inspect the audit table. Notice that every action you performed (logins, profile edits, application submissions, lender sanctions, suspensions) has a timestamped record.
  2. Click the **"Verify Merkle Root"** button.
* **What Output to Expect**:
  * The system computes a sequential SHA-256 hash across all logged events.
  * Green verified banner displays:
    ```text
    Merkle Root Verified — 100% Cryptographic Integrity Guaranteed.
    State Hash: 8f4b...3a1c (SHA-256 sealed)
    ```
  3. Click **"Export Signed CSV"** button:
     * Your browser immediately downloads `udyoga_audit_logs_<timestamp>.csv`.
     * Open the CSV in Excel or Notepad to inspect the audit fields and SHA-256 hashes.

---

### Step 6.4: System Telemetry & Endpoint Health Ping
* **Where to Test**: Left Sidebar -> **"System Telemetry"** (`/admin/system`).
* **How to Test**:
  1. Click the **"Ping All Endpoints"** button.
* **What Output to Expect**:
  * Dispatches live HTTP request to backend `/api/v1/health`.
  * Displays round-trip latency (e.g., `24ms`).
  * Connector cards show green indicators:
    * `Database Engine: SQLite (WAL Mode) - ONLINE`
    * `Auth Engine: JWT & RBAC - HEALTHY`
    * `Agent Orchestrator: 7 Agents Ready - OPERATIONAL`
  2. Click **"Synthetic Load Test"** -> sends simulated concurrent health traffic, confirming latency remains stable.

---

## 7. Direct Database Inspection (For Developers)

If you want to view the SQLite database directly:

1. Open PowerShell / Command Prompt in the repository root.
2. Run:
```powershell
python -c "import sqlite3; conn = sqlite3.connect('udyoga.db'); print('Total Users:', conn.execute('SELECT COUNT(*) FROM users').fetchone()[0]); print('Total Applications:', conn.execute('SELECT COUNT(*) FROM loan_applications').fetchone()[0]); print('Total Audit Logs:', conn.execute('SELECT COUNT(*) FROM audit_access_logs').fetchone()[0]);"
```
3. You will see exact counts matching all the actions you took in the UI!

---

## 8. Summary of What to Tell Hackathon Judges

When presenting UDYOGA to the jury, use this manual test sequence to demonstrate real platform strength:

1. **"Notice we are not using fake mock storage"**: Edit the business profile, reload the page, and show that changes persist from SQLite.
2. **"Watch our 7 AI agents execute deterministically"**: Trigger the live assessment and explain each agent card as the SSE progress bar advances.
3. **"Look at the Non-Fabrication Guarantee"**: Show that unverified self-reported claims are isolated; Pmax is bounded by mathematical cash flow formulas, not hallucinated LLM text.
4. **"Demonstrate Enterprise Institutional Governance"**: Show the Lender workbench, sanction the loan, switch to Admin, verify the cryptographic SHA-256 Merkle root, and export the signed audit log CSV.
