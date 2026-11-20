# UDYOGA — Beyond Credit. Beyond Barriers.

Agentic AI-powered financial intelligence and resilience-based credit assessment platform for India's credit-invisible MSMEs.

---

## 1. Project Overview

UDYOGA analyzes business transactions, reconstructs behavioral financial DNA, evaluates evidence confidence, investigates suspicious counterparty transaction graphs, simulates economic shocks, and produces explainable indicative credit recommendations.

### Key Architectural Guarantees
- **100% Deterministic Financial Math:** Cashflow velocity, DSCR, volatility indices, and runway simulations are executed via deterministic Python (`pandas`, `numpy`, `networkx`).
- **No Bureau Score Claims:** UDYOGA removes artificial 300–900 credit score claims and outputs explainable risk bands and transparent statuses.
- **Absence $\neq$ Negative Evidence:** Missing records (such as sub-threshold GST exemption) are treated as neutral uncertainty without penalizing financial health.
- **Forensic Graph Investigation:** Suspicious graph cycles trigger human review recommendations rather than automated fraud verdicts.
- **Single-Counted Debt Obligations:** Cash-flow affordability reconciles existing debt obligations and proposed repayments without double-counting.
- **Fail-Safe Fallback:** If LLM synthesis is unavailable, a deterministic rule-based Credit Appraisal Memo is compiled and clearly labelled.
- **Private CoT Protection:** Internal LLM reasoning is kept out of public logs and client responses; only agent tasks, tool calls, structured findings, and statuses are emitted.

---

## 2. Team Ownership & Module Boundaries

| Teammate | Assigned Scope | Directory |
|---|---|---|
| **Atharv** | System Architecture, FastAPI Backend, Agent Orchestration, Resilience & Underwriting | `backend/app/api/`, `backend/app/core/`, `backend/app/modules/agents/`, `backend/app/modules/resilience_engine/`, `backend/app/modules/underwriting/` |
| **Harshitha** | Transaction Ingestion, Financial DNA Engine, NetworkX Graph Analysis | `backend/app/modules/financial_intelligence/` |
| **Amulya** | Synthetic MSME Data, Evidence Confidence Scorer, Fairness Auditor, Explainability | `backend/app/modules/trust_evidence/` |
| **Bharath** | React + Vite UI, Tailwind CSS, Live Agent Terminal, Interactive Shock Slider | `frontend/` |

---

## 3. Quick Start & Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+ (for frontend)

### Backend Setup

1. **Navigate to backend and create virtual environment:**
   ```bash
   cd UDYOGA
   python -m venv .venv
   # Windows PowerShell:
   .\.venv\Scripts\Activate.ps1
   # Linux/macOS:
   source .venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Configure Environment:**
   ```bash
   cp .env.example .env
   ```

4. **Run the Backend Server:**
   ```bash
   python -m uvicorn backend.app.main:app --reload --port 8000
   ```
   - Swagger Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Alternative ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 4. API Specification for Frontend Integration (Bharath)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | System health and module readiness check |
| `GET` | `/api/v1/status` | Architectural guarantees and version info |
| `GET` | `/api/v1/business/demo/scenarios` | Pre-seeded MSMEs (Kirana, Textile Weaver, Trading unit) |
| `POST` | `/api/v1/business/profile` | Create new MSME profile |
| `POST` | `/api/v1/transactions/upload-csv` | Upload bank / UPI statement CSV |
| `POST` | `/api/v1/assessment/run` | Launch async agent assessment pipeline |
| `GET` | `/api/v1/assessment/{assessment_id}/stream` | Server-Sent Events (SSE) live execution terminal |
| `GET` | `/api/v1/assessment/{assessment_id}/result` | Full Credit Appraisal Memo (CAM) and structured snapshots |
| `POST` | `/api/v1/resilience/simulate` | Interactive what-if stress simulation slider |

---

## 5. Running Tests

```bash
pytest backend/tests/ -v
```
