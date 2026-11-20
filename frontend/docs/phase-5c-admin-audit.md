# UDYOGA — Phase 5C: Administrator & Algorithmic Fairness Auditor Portal Specification

## 1. Executive Summary & Objective

In **Phase 5C**, we implemented the institutional Administrator and Algorithmic Fairness Auditor Console for **UDYOGA – Beyond Credit. Beyond Barriers** (The Big Hack 2.0, Finance Track F2).

This portal equips platform administrators (`SUPER_ADMIN` – Rajiv Mehta) and independent ethical auditors (`ETHICS_AUDITOR` – Dr. Sunita Rao) with comprehensive tools for governance, bias prevention, data-quality monitoring, cryptographically anchored audit trails, and DPDP compliance enforcement.

---

## 2. Core Functional Modules Implemented

### 2.1 System Cockpit Dashboard (`AdminDashboard.tsx`)
- **Real-Time Operational Vitals**:
  - Active MSME evaluations (1,842).
  - Aggregate approved capital volume (₹41.8 Cr).
  - Demographic Parity Ratio (91.2% — meeting the Four-Fifths / 80% Rule).
  - Sahamati Account Aggregator & India Stack health (99.9% uptime).
- **India Stack Connector Status**: Sahamati AA, GSTN, NPCI UPI, and DigiLocker real-time telemetry.
- **Quick-Access Navigation**: Rapid triage links to fairness monitors, user management, and ledger review.

### 2.2 Algorithmic Fairness & Model Risk Governance (`FairnessMonitoringView.tsx`)
- **Four-Fifths Rule (80% Rule) Dial**:
  - Live adverse impact ratio gauge (**0.91** vs baseline 0.80 regulatory threshold).
  - Demographic acceptance parity across gender (Women entrepreneurs: 71.4% vs Baseline Men: 78.2%).
  - Geographic tier distribution (Tier 2/3/4 semi-urban MSMEs vs Metros).
- **DPDP Right-to-be-Forgotten & Consent Revocation Ledger**:
  - Transparent tracking of MSME consent revocations.
  - Zero-retention raw financial data sanitization audit trail.

### 2.3 Role-Based Access Control User Management (`UserManagementView.tsx`)
- **Seven-Persona Federation Management**:
  - Manage access across Borrowers, Credit Officers, Underwriting Managers, Admins, and Ethics Reviewers.
  - Granular RBAC permissions display (e.g. `audit:fairness:read`, `underwrite:decision:write`).
  - Active/Suspended status toggles and security audit logs.

### 2.4 Master Application & Pipeline Ledger (`ApplicationMasterLedger.tsx`)
- Comprehensive filterable ledger of all evaluated facilities across all lending partners.
- Inspection of 3-way triangulation congruence, ACIE Vitality score, requested vs sanctioned amounts, and underwriting decision timestamps.

### 2.5 ACIE Model Drift & Explainability Observatory (`AssessmentMonitoringView.tsx`)
- **Population Stability Index (PSI)** tracking (0.042 — within safe & stable &lt; 0.10 threshold).
- Feature importance drift telemetry (e.g., GST reconciliation consistency vs UPI velocity vs average bank balance).
- Score band distribution histogram (0–900 Vitality score distribution across unbanked vs banked applicant pools).

### 2.6 Data Quality Hub (`DataQualityMonitoringView.tsx`)
- Syntactic and semantic validation telemetry across ingestion feeds:
  - Sahamati AA Native XML (99.4% pass).
  - GSTN GSP API JSON (97.2% pass).
  - NPCI UPI merchant webhooks (99.8% pass).
  - Physical statement OCR extraction confidence (96.4% avg).
- Missing data topology catalog: Explicit structural accommodation for missing formal records (e.g., informal rent receipts, audited balance sheet exemption for micro-enterprises).

### 2.7 Cryptographically Tamper-Evident Audit Trail (`AuditLogsView.tsx`)
- SHA-256 Merkle root anchored audit log.
- Full event categorization:
  - `AUTH`: Authentication and brute-force prevention.
  - `CONSENT_REVOCATION`: DPDP Act Section 12 consent revocations.
  - `SANCTION_DECISION`: Loan sanction and decline issuances.
  - `HAIRCUT_OVERRIDE`: Credit officer discretionary risk haircut adjustments.
  - `SECURITY`: Administrative elevation and export events.

### 2.8 Rails Resilience & Circuit Breakers (`SystemTelemetryView.tsx`)
- Live gateway round-trip time (RTT) and throughput tracking.
- Interactive administrative circuit breaker overrides to isolate degraded external rails (e.g., GSTN maintenance windows) with graceful fallback to cached banking records.

### 2.9 Regulatory Compliance Exports (`ReportsExportsView.tsx`)
- One-click generated compliance dossiers:
  - RBI Master Direction Fair Lending & Disparate Impact Certification.
  - DPDP Consent Revocation & Data Sanitization Ledger.
  - ACIE Model Risk Management (MRM) Technical Dossier.
  - Complete 3-Way Triangulation Audit CSV pack.

---

## 3. Strict Architecture & Teammate Boundaries Respected

1. **ACIE Model Boundary**:
   - The frontend **does not** execute credit risk modeling or claim proprietary algorithmic bias detection algorithms.
   - It surfaces structured outputs, Population Stability Index telemetry, and demographic distribution indicators provided by backend services.
2. **Security & Authentication Boundary**:
   - The teammate enforces backend authentication, token validation, and RBAC authorization at the API gateway.
   - Frontend route guards and role-adaptive layouts consume verified identity claims without claiming to be an authoritative security boundary.
3. **Data Integrity & DPDP Compliance**:
   - Every synthetic data point is clearly labeled (`Simulated Sandbox Telemetry`, `Synthetic Record`).
   - Consent revocations reflect real-world DPDP Act operational requirements.

---

## 4. Verification & Build Status

- **TypeScript Compilation**: `tsc -b` passed with 0 errors.
- **Production Bundle**: `vite build` completed in 12.46s.
- **Git Status**: All changes cleanly authored in `feature/phase-5c-admin-audit`.
