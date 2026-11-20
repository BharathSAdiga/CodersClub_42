# UDYOGA — Frontend Architecture & Contract Guide

**Lead Developer:** Bharath  
**Stack:** React + Vite + Tailwind CSS  
**Target:** Interactive Executive Dashboard, Live SSE Agent Terminal, and Interactive Stress Slider  

---

## 1. Quick Setup for Bharath

```bash
cd frontend
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss postcss autoprefixer lucide-react
npx tailwindcss init -p
```

---

## 2. Connected Backend API Endpoints (Live on `http://localhost:8000/api/v1`)

### A. Pre-Seeded Scenarios for Instant Demo
- `GET /api/v1/business/demo/scenarios`
  - Returns 3 instant demo MSMEs:
    1. `msme_kirana_kanpur_001`: Shree Balaji Provision Store (Prime Kirana, high velocity, low volatility)
    2. `msme_trading_surat_002`: Apex Global Tex (Textile trading, circular loop anomaly triggering human review)
    3. `msme_weaver_erode_003`: Cauvery Weaves (Artisan cooperative, seasonal revenue sweep)

### B. Trigger Assessment & Live Agent Stream
- `POST /api/v1/assessment/run`
  - Body: `{"business_id": "msme_kirana_kanpur_001"}`
  - Returns: `{"assessment_id": "eval_...", "stream_url": "/api/v1/assessment/eval_.../stream"}`
- `GET /api/v1/assessment/{assessment_id}/stream`
  - Standard `EventSource` (Server-Sent Events)
  - Emits real-time `AgentEvent` objects:
    - `agent_name`: "FinancialDNAAgent", "ForensicInvestigatorAgent", "ResilienceAuditorAgent", "SeniorUnderwriterAgent"
    - `status`: "STARTED", "TOOL_CALLED", "STRUCTURED_RESULT", "COMPLETED"
    - `tool_called`: Name of deterministic tool
    - `structured_findings`: JSON metrics
    - `message`: Explanatory log string

### C. Completed Credit Appraisal Memo (CAM)
- `GET /api/v1/assessment/{assessment_id}/result`
  - Returns full `CreditAppraisalMemo`
  - Transparent statuses:
    - `INDICATIVE_RECOMMENDATION` (Green)
    - `CONDITIONAL_RECOMMENDATION` (Amber)
    - `HUMAN_REVIEW_REQUIRED` (Orange/Flagged)
    - `INSUFFICIENT_EVIDENCE` (Blue/Neutral)

### D. Interactive Shock Slider
- `POST /api/v1/resilience/simulate?business_id=msme_kirana_kanpur_001`
  - Body: `{"revenue_contraction_pct": 25, "cogs_inflation_pct": 15, "receivable_delay_days": 30}`
  - Returns: `ShockSimulationResult` with `stressed_cash_runway_days`, `post_shock_dscr`, and `affordability`
