# UDYOGA: Integration Dependencies, Environment Configuration & Teammate Checklist

**Project:** UDYOGA – Beyond Credit. Beyond Barriers.  
**Phase:** Phase 3 — System Architecture & Contracts  
**Target:** Engineering Environment & Teammate Handoff  
**Author:** Senior Frontend Architect (Enterprise FinTech)  
**Branch:** `feature/phase-3-architecture`

---

## 1. Production & Development Dependencies

The frontend stack is engineered for speed, bundle efficiency (< 220kB initial gzip), and high-fidelity interaction.

### 1.1 Core Runtime Dependencies
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0",
    "@tanstack/react-query": "^5.62.0",
    "framer-motion": "^11.13.1",
    "recharts": "^2.14.1",
    "lucide-react": "^0.468.0",
    "react-hook-form": "^7.54.0",
    "zod": "^3.24.1",
    "@hookform/resolvers": "^3.9.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5",
    "sonner": "^1.7.1",
    "canvas-confetti": "^1.9.3",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-slider": "^1.2.1",
    "@radix-ui/react-tabs": "^1.1.1",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-tooltip": "^1.1.4",
    "@radix-ui/react-select": "^2.1.2"
  }
}
```

### 1.2 Developer Tools & Build Infrastructure
```json
{
  "devDependencies": {
    "typescript": "^5.7.2",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@types/canvas-confetti": "^1.9.0",
    "vite": "^6.0.3",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^3.4.16",
    "postcss": "^8.4.49",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.16.0"
  }
}
```

---

## 2. Environment Variables & Configuration (`.env.example`)

All environment variables follow Vite's `VITE_` prefix standard:

```ini
# ==========================================
# UDYOGA — ENVIRONMENT CONFIGURATION TEMPLATE
# Copy to .env.local for local overrides
# ==========================================

# Platform Identity
VITE_APP_NAME="UDYOGA — Credit for the Credit-Invisible"
VITE_APP_VERSION="1.0.0-hackathon-mvp"

# Backend & Service Routing
# When true, frontend intercepts all API calls with the centralized mock service layer
VITE_USE_MOCK_SERVICES=true

# Live Teammate Backend Base URL (Used in Phase 6 Integration)
VITE_API_BASE_URL="http://localhost:8000/api/v1"

# Teammate Alternative Credit Intelligence Engine (ACIE) URL
VITE_ACIE_ENGINE_URL="http://localhost:8000/api/v1/acie"

# Mock Service Simulation Controls
VITE_MOCK_LATENCY_MS=300
VITE_MOCK_FAILURE_RATE=0.0

# Third-Party Sandbox Keys (Mocked in MVP)
VITE_ENABLE_VERIFIED_BADGES=true
VITE_ENABLE_AUDIO_ASSISTANT=true
```

---

## 3. Teammate Backend & ACIE Integration Checklist

To ensure a seamless transition during **Phase 6 (Backend Integration)**, the following coordination checklist is established:

| Integration Checkpoint | Expected Format | Teammate Action Required |
| :--- | :--- | :--- |
| **CORS Policy** | Headers | Allow origin `http://localhost:5173` (or Vite preview port) with credentials. |
| **Auth Headers** | `Bearer <JWT>` | Standard Authorization header on all protected routes. |
| **SHAP Feature Drivers** | Array of `{ featureKey, impactDirection, weightPoints, explanationPlainLanguage }` | ACIE must return at least top 3 positive and top 2 negative weight vectors. |
| **Counterfactual Simulator** | Endpoint accepting `{ admbDelta, upiVolumeDelta }` | Returns updated credit limit without running full heavyweight pipeline. |
| **Cash-Flow Waveform Data** | Array of 90 daily points `{ date, inflow, outflow, netBalance }` | Ingested via Account Aggregator; formatted for Recharts consumption. |
| **Triangulation Congruence** | `{ bankTurnover, gstTurnover, upiTurnover, congruenceScore }` | Automated cross-reconciliation output for lender view. |
| **DPDP Consent Revocation** | `POST /consents/:id/revoke` | Must return 200 OK within 500ms and immediately stop background data polling. |
