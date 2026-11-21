# UDYOGA — Live Application Demo Runbook (2-Minute Timed Choreography)

**Target Duration:** 120 Seconds  
**Default Demo Persona:** **Priya Sharma** (`ArtisanKraft Studio`, Jaipur — Textile & Handicrafts MSME)  
**Alternative Fallback Persona:** **Ramesh Kumar** (`Sri Balaji Provisions`, Hubli — Retail Grocery Kirana)  
**Primary Live Route:** `http://localhost:5173/` -> Borrower Portal -> `7 Agent CAM` (`/borrower/assessment`)

---

## 1. Pre-Demo Setup Checklist (2 Minutes Before Jury Call)

1. **Verify Backend Server:**
   * Open terminal: Run `curl http://localhost:8000/health` -> verify `{"status":"HEALTHY","service":"UDYOGA-Engine"}`.
2. **Verify Frontend Application:**
   * Open browser to `http://localhost:5173`.
   * Ensure user is logged in as **Priya Sharma** (or switch via top-right persona avatar -> Select **Priya Sharma (Growth MSME)**).
   * Confirm the left sidebar shows: `Dashboard`, `Business Profile`, `Cash Flow & Health`, `What-If Simulator`, **`7 Agent CAM`**, `Apply for Credit`, `DPDP Consent`, `Documents & Data`.
3. **Pre-Cache Execution:**
   * Open `/borrower/assessment` and trigger `Run Live 7-Agent Evaluation` once in advance to warm up SQLite cache and state registry.
4. **Browser Tabs Prepared:**
   * Tab 1: `http://localhost:5173/` (Borrower Portal on `/borrower/assessment`).
   * Tab 2 (Backup): `http://localhost:5173/` (Lender Portal on `/lender/workbench/APP-2026-0892`).

---

## 2. Minute-by-Minute Live Demo Choreography

### Step 1: The Persona & Operational Baseline (0:00 – 0:25)
* **Screen Display:** Left Sidebar -> Click **"Dashboard"** (`/borrower/dashboard`).
* **What to Show:**
  * Welcome header: *"Welcome back, Priya Sharma — ArtisanKraft Studio"*.
  * Metric cards: Sanctioned Line (₹5,00,000), Credit Vitality Score (733 / 900 Prime Tier), Automated Daily Sweep (₹1,890).
* **What to Say:**
  > *"Here is Priya Sharma, running ArtisanKraft Studio, a textile enterprise in Jaipur. She generates ₹8.5 Lakhs in monthly digital turnover but traditional banks hesitate to fund her seasonal inventory because she lacks commercial land collateral. Watch what happens when UDYOGA underwrites her business."*
* **Action:** Click **"7 Agent CAM"** in the left sidebar (or click the green showcase banner *"Launch 7-Agent Monitor"*).

---

### Step 2: Live Multi-Agent Execution & Real-Time Telemetry (0:25 – 0:55)
* **Screen Display:** `/borrower/assessment` (**"7 Agent CAM"**).
* **What to Show:**
  * The top banner: *"7-Agent Underwriting & Intelligence Suite"*.
  * The 7 interactive Agent Cards displayed in DAG pipeline order.
  * The green action button: **"Run Live 7-Agent Evaluation"**.
* **What to Do:**
  * Click **"Run Live 7-Agent Evaluation"**.
  * Watch the progress bar jump from 0% -> 100% as cards highlight green in real time (`RUNNING` -> `COMPLETED`).
  * Watch the streaming live terminal log below displaying agent timestamps and audit messages.
* **What to Say:**
  > *"When we trigger our live evaluation, our multi-agent orchestrator coordinates seven specialized agents over a persistent Server-Sent Events stream. Notice they don't hallucinate a single conversational reply—each agent owns a distinct quantitative domain."*
* **Point to on Screen:**
  * Point to **Agent 1 (Financial Intelligence)**: Extracting Financial DNA.
  * Point to **Agent 3 (Transaction Forensics)**: Constructing NetworkX graph to verify counterparty circularity.
  * Point to **Agent 5 (Resilience Simulation)**: Calculating stressed DSCR.

---

### Step 3: Inspecting Agent Logic & Non-Fabrication Guarantee (0:55 – 1:25)
* **Screen Display:** `/borrower/assessment` -> Agent Card 5 or 6 -> Click **"Inspect Logic"**.
* **What to Show:**
  * The **Agent Logic & Data Transparency Modal** pops up.
  * Section: *Data Examined* (CFADS, FOIR cap 50%, amortization formula).
  * Section: *Findings Output* (Safe Loan Ceiling: ₹4,18,000 @ 14.0% APR).
  * Green Callout Box: **Non-Fabrication Guarantee**:
    > *"Pmax is derived through strict compound interest discounting: Pmax = (CFADS × FOIR) / [r × (1+r)^n / ((1+r)^n - 1)]."*
* **What to Say:**
  > *"Let's inspect the Underwriting Agent. UDYOGA enforces a strict Non-Fabrication Guarantee. Financial calculations and loan ceilings are never outsourced to an LLM. Our engine calculates her unencumbered cash flow, applies a statutory 50% FOIR cap, and mathematically bounds her safe credit limit to ₹4,18,000."*
* **Action:** Close modal by clicking the `X` button.

---

### Step 4: The 5-Tab Credit Appraisal Memorandum & Resilience Stress (1:25 – 1:45)
* **Screen Display:** Lower section of `/borrower/assessment` -> **"Credit Appraisal Memorandum (CAM)"**.
* **What to Do:**
  1. Click Tab **"STRESS"**: Show the 6-preset resilience stress test (Normal, 15% revenue drop, 30% drop, 15% expense inflation). Point to **Stressed DSCR 1.84x** and **68 days of liquidity runway**.
  2. Click Tab **"MEMO"**: Show the bank-ready Credit Appraisal Memo memorandum format with the **SHA-256 Merkle root seal**.
* **What to Say:**
  > *"Under the Resilience tab, we prove that even if Priya suffers a 30% demand contraction and 15% inflation, her Debt Service Coverage Ratio remains resilient at 1.84x with 68 days of operational cushion. Under the Memo tab, the lender receives an institutional-grade CAM dossier sealed with a sequential SHA-256 hash."*

---

### Step 5: Lender Decision Workbench & Closing Punchline (1:45 – 2:00)
* **Screen Display:** Switch to Lender Portal (`/lender/pipeline` or `/lender/workbench/APP-2026-0892`).
* **What to Show:**
  * Show the Credit Officer workbench with 3-Way Triangulation (Bank vs UPI vs GSTN matching at 97.2%) and instant Sanction button.
* **What to Say:**
  > *"For the lender, lending is no longer a blind leap of faith. It’s explainable, mathematically proven, and audit-ready. UDYOGA transforms MSME credit from an opaque rejection to deterministic financial empowerment."*

---

## 3. Emergency Backup Runbook (If Live Execution Fails)

| Potential Failure Point | Root Cause | Immediate Backup Action (1-Second Fix) |
|:---|:---|:---|
| **SSE Stream Times Out / Stalls** | Backend network latency or local port block. | Click Tab **"DNA"** or **"STRESS"** directly in the CAM panel. All tabs have pre-rendered verified fallback state persisted in the SQLite store (`DatabaseBackedAssessmentStore`). |
| **Backend Process Not Running** | Python FastAPI server stopped. | Run `run_udyoga.bat` on Desktop or click **"Load Verified Indicative CAM"** on screen. |
| **Modal Stays Open** | Accidental double-click. | Press `ESC` or click outside the backdrop to return to the DAG execution cards. |
| **Jury Asks "Is this real or a mock?"** | Natural judge skepticism. | Click **"Inspect Logic"** on Agent 3 (Transaction Forensics) -> Show NetworkX graph entropy nodes and live calculated coefficients. Offer to show the backend pytest suite with 282 passing unit tests in terminal. |
