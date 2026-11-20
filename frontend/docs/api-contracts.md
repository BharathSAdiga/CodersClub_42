# UDYOGA: Complete API Contract Specifications & TypeScript Interfaces

**Project:** UDYOGA – Beyond Credit. Beyond Barriers.  
**Phase:** Phase 3 — System Architecture & Contracts  
**Target:** Teammate Backend, Database & Alternative Credit Intelligence Engine (ACIE)  
**Author:** Senior Frontend Architect (Enterprise FinTech)  
**Branch:** `feature/phase-3-architecture`

---

## 1. Overview & Protocol Standard

- **Protocol:** RESTful HTTPS with JSON payloads.
- **Authentication:** `Authorization: Bearer <JWT_ACCESS_TOKEN>` in request headers.
- **Error Standard:** RFC 7807 Problem Details (`{ status, code, message, errors?, timestamp }`).
- **Annotation Convention:**
  - Standard fields: Agreed core contract.
  - `// [PROVISIONAL - Teammate Review Required]`: Field proposed by frontend architecture for enhanced UX/explainability; subject to teammate verification.

---

## 2. Core TypeScript Interfaces

```typescript
// ==========================================
// 1. AUTHENTICATION & USER PROFILE CONTRACT
// ==========================================

export type UserRole = 
  | 'BORROWER_MICRO' 
  | 'BORROWER_GROWTH' 
  | 'LENDER_OFFICER' 
  | 'LENDER_MANAGER' 
  | 'SUPER_ADMIN' 
  | 'ETHICS_AUDITOR';

export interface UserProfile {
  id: string;
  mobile: string;
  email?: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt: string;
  preferredLanguage: 'en' | 'hi' | 'ta' | 'kn'; // [PROVISIONAL - Teammate Review Required]
}

export interface AuthSessionResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: UserProfile;
}

// ==========================================
// 2. BUSINESS PROFILE CONTRACT
// ==========================================

export type EnterpriseClass = 'MICRO' | 'SMALL' | 'MEDIUM';
export type ConstitutionType = 'PROPRIETORSHIP' | 'PARTNERSHIP' | 'LLP' | 'PVT_LTD';

export interface BusinessProfile {
  id: string;
  userId: string;
  tradeName: string;
  legalName: string;
  constitution: ConstitutionType;
  enterpriseClass: EnterpriseClass;
  udyamRegistrationNumber?: string;
  pan: string;
  gstin?: string;
  industrySector: string; // e.g. "Retail Grocery", "Textiles", "Brass Casting"
  operatingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    tier: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'RURAL';
  };
  yearsInOperation: number;
  verifiedAt?: string;
}

// ==========================================
// 3. FINANCIAL INFORMATION & DPI DATA CONTRACT
// ==========================================

export interface BankAccountSummary {
  accountNumberMasked: string; // e.g. "•••• 4892"
  bankName: string;
  ifscCode: string;
  accountType: 'CURRENT' | 'SAVINGS';
  aaLinked: boolean;
  averageDailyBalance: number;
  monthlyInflowAvg: number;
  monthlyOutflowAvg: number;
  bounceCount90Days: number;
}

export interface UpiMerchantSummary {
  vpaMasked: string; // e.g. "balaji***@upi"
  aggregator: 'PHONEPE' | 'PAYTM' | 'BHARATPE' | 'GPAY' | 'OTHER';
  dailyAverageTransactions: number;
  monthlyAverageVolume: number;
  ticketSizeAverage: number;
  activeSinceDays: number;
}

export interface GstnSummary {
  gstin: string;
  filingPunctualityRate: number; // percentage (e.g. 98.5)
  annualTurnoverVerified: number;
  activeBuyersCount: number;
  topBuyerConcentrationRatio: number; // e.g. 0.22 (22%)
}

export interface FinancialAggregatedPayload {
  businessId: string;
  accounts: BankAccountSummary[];
  upiMerchants: UpiMerchantSummary[];
  gstn?: GstnSummary;
  cashFlowWaveform: Array<{
    date: string;
    inflow: number;
    outflow: number;
    netBalance: number;
  }>; // 90-day daily points for frontend waveform visualizer
}

// ==========================================
// 4. DOCUMENT VAULT CONTRACT
// ==========================================

export type DocumentType = 
  | 'PAN_CARD' 
  | 'UDYAM_CERTIFICATE' 
  | 'SHOP_ESTABLISHMENT_LICENSE' 
  | 'BANK_STATEMENT_PDF' 
  | 'GST_CERTIFICATE' 
  | 'CANCELLED_CHEQUE';

export type DocumentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'FLAGGED';

export interface BusinessDocument {
  id: string;
  businessId: string;
  type: DocumentType;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  uploadedAt: string;
  status: DocumentStatus;
  ocrConfidenceScore?: number; // 0.0 - 1.0 (from teammate OCR pipeline)
  rejectionReason?: string;
}

// ==========================================
// 5. CONSENT & DPDP GOVERNANCE CONTRACT
// ==========================================

export type ConsentStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';

export interface ConsentArtifact {
  id: string;
  userId: string;
  dataProvider: 'ACCOUNT_AGGREGATOR' | 'GSTN' | 'NPCI_UPI' | 'DIGILOCKER';
  purpose: string;
  dataFieldsGranted: string[];
  grantedAt: string;
  expiresAt: string;
  status: ConsentStatus;
  revokedAt?: string;
  cryptographicSignature: string; // [PROVISIONAL - Teammate Review Required]
}

// ==========================================
// 6. CREDIT APPLICATION & LOAN CUSTOMIZER
// ==========================================

export type RepaymentFrequency = 'DAILY_SWEEP' | 'WEEKLY_SACHET' | 'MONTHLY_EMI';
export type ApplicationStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'UNDERWRITING_REVIEW' 
  | 'CONDITIONALLY_APPROVED' 
  | 'SANCTIONED' 
  | 'DISBURSED' 
  | 'REJECTED';

export interface CreditApplication {
  id: string;
  businessId: string;
  requestedAmount: number;
  approvedAmount?: number;
  tenorDays: number;
  repaymentFrequency: RepaymentFrequency;
  repaymentAmountPerCycle: number;
  apr: number; // e.g. 14.5%
  processingFee: number;
  netDisbursalAmount: number;
  status: ApplicationStatus;
  submittedAt: string;
  disbursalEtaMinutes?: number;
  kfsDocumentUrl?: string; // Key Fact Statement
}

// ==========================================
// 7. ACIE CREDIT INTELLIGENCE CONTRACT
// (Alternative Credit Intelligence Engine)
// ==========================================

export interface ShapFeatureDriver {
  featureKey: string;
  displayName: string;
  impactDirection: 'POSITIVE' | 'NEGATIVE';
  weightPoints: number; // e.g. +48 or -24
  explanationPlainLanguage: string;
}

export interface CounterfactualScenario {
  parameterName: string; // e.g. "average_daily_balance", "upi_volume"
  currentValue: number;
  suggestedTargetValue: number;
  unlockedCreditIncrease: number; // e.g. +₹1,50,000
  unlockedAprDiscount: number; // e.g. -1.2%
  timelineDays: number; // e.g. 30 days
}

export interface AcieAssessmentReport {
  id: string;
  applicationId: string;
  creditVitalityScore: number; // 0 - 900
  scoreBand: 'PRIME' | 'MODERATE' | 'DEVELOPING' | 'SUBPRIME';
  modelConfidenceScore: number; // 0.0 - 1.0 (e.g. 0.94)
  evaluatedAt: string;
  topDrivers: ShapFeatureDriver[]; // bi-directional explainability ribbon
  counterfactuals: CounterfactualScenario[]; // "What-If" simulator input
  isSparseDataProgressiveMode: boolean; // true if thin-file fallback used
}

// ==========================================
// 8. LENDER DECISION & TRIANGULATION CONTRACT
// ==========================================

export interface TriangulationMatrix {
  bankReportedTurnover: number;
  gstReportedTurnover: number;
  upiReportedTurnover: number;
  congruenceScorePercentage: number; // e.g. 96.2%
  varianceRiskTier: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface AnomalyIndicator {
  ruleCode: 'CIRCULAR_LOOP' | 'SPIKE_VELOCITY' | 'BUYER_CONCENTRATION' | 'TAX_DUE_SURGE';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  description: string;
  detectedAt: string;
}

export interface UnderwritingDecisionPayload {
  applicationId: string;
  decision: 'APPROVE' | 'APPROVE_WITH_COVENANTS' | 'REQUEST_ADDITIONAL_DOCS' | 'DECLINE';
  sanctionAmount: number;
  approvedApr: number;
  covenants?: string[];
  underwriterNotes: string;
  underwriterId: string;
  timestamp: string;
}

// ==========================================
// 9. ADMIN & ALGORITHMIC FAIRNESS CONTRACT
// ==========================================

export interface FairnessMetric {
  attribute: 'GENDER' | 'GEOGRAPHY_TIER' | 'ENTERPRISE_CLASS';
  groupA: string; // e.g. "Female-Led MSME"
  groupB: string; // e.g. "Male-Led MSME"
  approvalRateA: number; // e.g. 0.72
  approvalRateB: number; // e.g. 0.76
  disparateImpactRatio: number; // e.g. 0.947 (Target >= 0.80)
  isCompliantWith80Rule: boolean;
}

export interface ConnectorHealthStatus {
  connectorName: 'SAHAMATI_AA' | 'GSTN_GATEWAY' | 'NPCI_UPI' | 'DIGILOCKER';
  status: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE';
  latencyMs: number;
  uptime24h: number; // e.g. 99.98
  circuitBreakerTripped: boolean;
}
```

---

## 3. REST API Endpoint Catalog

| Module | Method | Path | Request Body | Response Schema | Description |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/otp/send` | `{ mobile: string }` | `{ success: boolean, retryAfter: number }` | Sends SMS OTP to user. |
| **Auth** | `POST` | `/api/v1/auth/otp/verify` | `{ mobile: string, otp: string }` | `AuthSessionResponse` | Verifies OTP and returns JWT token. |
| **Borrower** | `GET` | `/api/v1/borrower/profile` | None | `BusinessProfile` | Fetches business and identity profile. |
| **Financials**| `GET` | `/api/v1/borrower/financials` | None | `FinancialAggregatedPayload` | Fetches aggregated accounts and cash-flow waveform points. |
| **Consent** | `GET` | `/api/v1/borrower/consents` | None | `ConsentArtifact[]` | Lists active DPDP consent tokens. |
| **Consent** | `POST` | `/api/v1/borrower/consents/:id/revoke` | None | `{ success: boolean, revokedAt: string }` | Immediate revocation of data access. |
| **Application**| `POST` | `/api/v1/applications/create` | `Partial<CreditApplication>` | `CreditApplication` | Submits loan application request. |
| **ACIE Engine**| `GET` | `/api/v1/acie/assessment/:applicationId` | None | `AcieAssessmentReport` | Returns explainable score, SHAP weights & counterfactuals. |
| **ACIE Engine**| `POST`| `/api/v1/acie/simulate-counterfactual` | `{ applicationId: string, admbDelta: number, upiVolumeDelta: number }` | `CounterfactualScenario` | Live re-calculation for the "What-If" simulator slider. |
| **Lender** | `GET` | `/api/v1/lender/pipeline` | Query filters | `{ items: CreditApplication[], total: number }` | Filterable underwriting queue. |
| **Lender** | `GET` | `/api/v1/lender/triangulation/:applicationId` | None | `TriangulationMatrix` | 3-way reconciliation view. |
| **Lender** | `POST` | `/api/v1/lender/decision` | `UnderwritingDecisionPayload` | `{ success: boolean, sanctionId: string }` | Submits underwriter sanction/decline. |
| **Admin** | `GET` | `/api/v1/admin/fairness-audit` | None | `FairnessMetric[]` | Returns Disparate Impact & demographic parity stats. |
| **Admin** | `GET` | `/api/v1/admin/connector-telemetry` | None | `ConnectorHealthStatus[]` | Third-party API uptime and latency telemetry. |
