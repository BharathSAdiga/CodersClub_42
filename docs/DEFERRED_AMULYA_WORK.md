# UDYOGA — Deferred Work Declaration: Amulya's Assigned Scope

**Project**: UDYOGA MSME Lending & Financial Intelligence Platform  
**Document Type**: Architectural Boundary & Task Ownership Isolation Record  
**Date**: November 2026  
**Status**: STRICTLY ISOLATED & DEFERRED (Untouched by Audit & Repair Phase)

---

## 1. Context & Scope Protection Directive

In accordance with team governance and explicit instructions:
> *"Leave Amulya's assigned work out of this testing and repair phase. Do not modify, rewrite or claim completion of her pending modules. Test all other team members' work."*

This document serves as the formal architectural record confirming that all modules, algorithms, tests, and models assigned to team member **Amulya** have been strictly isolated, preserved in their original state, and deferred for her completion.

---

## 2. Inventory of Amulya's Reserved Modules

The following files and directories belong exclusively to Amulya's scope:

| Module / Component | Path / Location | Description & Ownership | Isolation Status |
|:---|:---|:---|:---:|
| **Synthetic MSME Data Generator** | `backend/app/modules/trust_evidence/synthetic_generator.py` | Generator of synthetic MSME demographic and banking profiles across Indian tiers | **DEFERRED (Untouched)** |
| **Evidence Confidence Scorer** | `backend/app/modules/trust_evidence/confidence_scorer.py` | Multi-factor evidence confidence scoring algorithm based on source provenance and cross-verification | **DEFERRED (Untouched)** |
| **Reconciliation Engine (Trust & Evidence)** | `backend/app/modules/trust_evidence/reconciliation_engine.py` | Cross-stream reconciliation between tax filings, e-way bills, and bank statements | **DEFERRED (Untouched)** |
| **Algorithmic Fairness Auditor** | `backend/app/modules/trust_evidence/fairness_auditor.py` (and test fixtures) | Demographic parity and equal opportunity auditor across credit decisions | **DEFERRED (Untouched)** |
| **Explainability & Counterfactuals** | `backend/app/modules/trust_evidence/explainability.py` | Counterfactual loan approval suggestions for rejected borrowers | **DEFERRED (Untouched)** |

---

## 3. Scope Isolation Audit & Integrity Attestation

1. **Zero Modifications**: No lines of code were modified, deleted, or rewritten within `backend/app/modules/trust_evidence/` during this testing and debugging phase.
2. **Clean Import Boundaries**: Core platform services (FastAPI endpoints, persistence repositories, and the 7 orchestrator agents) consume well-defined, backwards-compatible interfaces, ensuring Amulya's ongoing development will plug seamlessly into the verified Phase 2 architecture.
3. **Dedicated Test Suite Preserved**: Existing baseline test fixtures for fairness and trust evidence remain intact and continue passing without interference.

---

## 4. Next Steps for Amulya

Upon returning to the codebase, Amulya may directly:
1. Finalize the heuristic weighting models in `confidence_scorer.py`.
2. Expand the synthetic enterprise archetypes in `synthetic_generator.py`.
3. Enhance the demographic parity metrics in `fairness_auditor.py`.
4. Run `pytest backend/tests/test_fairness_auditor.py` to verify her module in complete isolation.
