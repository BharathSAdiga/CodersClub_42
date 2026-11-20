# UDYOGA: Centralized Mock Data Specification & Persona Profiles

**Project:** UDYOGA – Beyond Credit. Beyond Barriers.  
**Phase:** Phase 3 — System Architecture & Contracts  
**Target:** Standalone Frontend Development & Evaluation Demo  
**Author:** Senior Frontend Architect (Enterprise FinTech)  
**Branch:** `feature/phase-3-architecture`

---

## 1. Centralized Mock Service Layer Architecture

The mock service layer simulates the teammate's backend, database, and Alternative Credit Intelligence Engine (ACIE) with realistic network latency (default 250ms–400ms) and state persistence via browser `sessionStorage`.

```typescript
// src/mocks/mockService.ts
export interface MockServiceConfig {
  latencyMs: number;
  failureRate: number; // e.g. 0.05 for 5% simulated network errors
  activePersonaId: string;
}

export const mockConfig: MockServiceConfig = {
  latencyMs: 300,
  failureRate: 0.0,
  activePersonaId: 'PERSONA_RAMESH',
};
```

---

## 2. Seven Persona-Specific Mock Datasets

### Persona 1: Ramesh Kumar — Micro-Enterprise First-Time Borrower
```json
{
  "user": {
    "id": "usr_ramesh_01",
    "mobile": "+91 98451 23890",
    "fullName": "Ramesh Kumar",
    "role": "BORROWER_MICRO",
    "preferredLanguage": "en"
  },
  "business": {
    "id": "biz_balaji_01",
    "tradeName": "Sri Balaji Provisions",
    "legalName": "Ramesh Kumar",
    "constitution": "PROPRIETORSHIP",
    "enterpriseClass": "MICRO",
    "udyamRegistrationNumber": "UDYAM-KR-03-0048921",
    "pan": "BPLPK8912M",
    "industrySector": "Retail Grocery & Provisions",
    "operatingAddress": {
      "street": "14 Market Road, Gandhi Nagar",
      "city": "Hubli",
      "state": "Karnataka",
      "pincode": "580020",
      "tier": "TIER_2"
    },
    "yearsInOperation": 7
  },
  "financials": {
    "bankSummary": {
      "bankName": "State Bank of India",
      "accountNumberMasked": "•••• 4892",
      "ifscCode": "SBIN0004128",
      "averageDailyBalance": 18450,
      "monthlyInflowAvg": 584000,
      "monthlyOutflowAvg": 542000,
      "bounceCount90Days": 0
    },
    "upiSummary": {
      "vpaMasked": "balajiprovisions***@upi",
      "aggregator": "PHONEPE",
      "dailyAverageTransactions": 142,
      "monthlyAverageVolume": 512000,
      "ticketSizeAverage": 128
    }
  },
  "acieReport": {
    "creditVitalityScore": 742,
    "scoreBand": "PRIME",
    "modelConfidenceScore": 0.94,
    "topDrivers": [
      {
        "featureKey": "DAILY_UPI_VELOCITY",
        "displayName": "Consistent Daily UPI Transactions",
        "impactDirection": "POSITIVE",
        "weightPoints": 56,
        "explanationPlainLanguage": "High frequency of 140+ daily customer settlements proves steady local retail demand."
      },
      {
        "featureKey": "ZERO_DEBIT_BOUNCE",
        "displayName": "Punctual Account Liquidity",
        "impactDirection": "POSITIVE",
        "weightPoints": 42,
        "explanationPlainLanguage": "Zero cheque or auto-debit bounces across 90 days indicates disciplined financial management."
      },
      {
        "featureKey": "THIN_CREDIT_BUREAU",
        "displayName": "No Prior Institutional Credit Record",
        "impactDirection": "NEGATIVE",
        "weightPoints": -24,
        "explanationPlainLanguage": "Absence of multi-year bureau repayment history slightly limits the initial maximum credit ceiling."
      }
    ],
    "counterfactuals": [
      {
        "parameterName": "average_daily_balance",
        "currentValue": 18450,
        "suggestedTargetValue": 25000,
        "unlockedCreditIncrease": 75000,
        "unlockedAprDiscount": 0.8,
        "timelineDays": 30
      }
    ]
  },
  "loanOffer": {
    "preApprovedLimit": 180000,
    "selectedAmount": 150000,
    "tenorDays": 90,
    "repaymentFrequency": "DAILY_SWEEP",
    "repaymentAmountPerCycle": 1720,
    "apr": 14.2,
    "processingFee": 1500,
    "netDisbursalAmount": 148500
  }
}
```

---

### Persona 2: Priya Sharma — Existing Thin-File Business
```json
{
  "user": {
    "id": "usr_priya_02",
    "mobile": "+91 97112 84910",
    "fullName": "Priya Sharma",
    "role": "BORROWER_GROWTH",
    "preferredLanguage": "en"
  },
  "business": {
    "id": "biz_artisan_02",
    "tradeName": "ArtisanKraft Studio",
    "legalName": "ArtisanKraft Crafts LLP",
    "constitution": "LLP",
    "enterpriseClass": "SMALL",
    "udyamRegistrationNumber": "UDYAM-RJ-10-0081290",
    "pan": "AAMFA9124L",
    "gstin": "08AABCU9603R1ZM",
    "industrySector": "Textile Printing & Handicrafts",
    "operatingAddress": {
      "street": "Plot 24, Sanganer Industrial Area",
      "city": "Jaipur",
      "state": "Rajasthan",
      "pincode": "302029",
      "tier": "TIER_2"
    },
    "yearsInOperation": 4
  },
  "financials": {
    "gstnSummary": {
      "gstin": "08AABCU9603R1ZM",
      "filingPunctualityRate": 99.2,
      "annualTurnoverVerified": 4200000,
      "activeBuyersCount": 14,
      "topBuyerConcentrationRatio": 0.18
    }
  },
  "acieReport": {
    "creditVitalityScore": 733,
    "scoreBand": "PRIME",
    "modelConfidenceScore": 0.96,
    "topDrivers": [
      {
        "featureKey": "GST_PUNCTUALITY",
        "displayName": "100% On-Time GST Returns",
        "impactDirection": "POSITIVE",
        "weightPoints": 48,
        "explanationPlainLanguage": "Filing GSTR-1 and GSTR-3B without delay for 12 consecutive quarters validates tax compliance."
      },
      {
        "featureKey": "BUYER_DIVERSIFICATION",
        "displayName": "Low Customer Concentration",
        "impactDirection": "POSITIVE",
        "weightPoints": 34,
        "explanationPlainLanguage": "Top corporate buyer accounts for only 18% of revenue, mitigating single-client default risk."
      }
    ],
    "counterfactuals": [
      {
        "parameterName": "export_purchase_orders",
        "currentValue": 0,
        "suggestedTargetValue": 1,
        "unlockedCreditIncrease": 350000,
        "unlockedAprDiscount": 1.4,
        "timelineDays": 15
      }
    ]
  },
  "loanOffer": {
    "preApprovedLimit": 500000,
    "selectedAmount": 500000,
    "tenorDays": 180,
    "repaymentFrequency": "WEEKLY_SACHET",
    "repaymentAmountPerCycle": 20450,
    "apr": 13.8,
    "netDisbursalAmount": 495000
  }
}
```

---

### Persona 3: Muthuvel Pandian — Digitally Inexperienced Borrower
```json
{
  "user": {
    "id": "usr_muthuvel_03",
    "mobile": "+91 94431 82901",
    "fullName": "Muthuvel Pandian",
    "role": "BORROWER_MICRO",
    "preferredLanguage": "ta"
  },
  "business": {
    "id": "biz_foundry_03",
    "tradeName": "Pandian Brass Works",
    "legalName": "Muthuvel Pandian",
    "constitution": "PROPRIETORSHIP",
    "enterpriseClass": "MICRO",
    "industrySector": "Artisanal Metal Casting",
    "operatingAddress": {
      "street": "7 South Masi Street",
      "city": "Madurai",
      "state": "Tamil Nadu",
      "pincode": "625001",
      "tier": "TIER_2"
    },
    "yearsInOperation": 22
  },
  "loanOffer": {
    "requestedAmount": 75000,
    "selectedAmount": 75000,
    "tenorDays": 60,
    "repaymentFrequency": "WEEKLY_SACHET",
    "repaymentAmountPerCycle": 9150,
    "totalRepaymentAmount": 79500,
    "apr": 14.8
  }
}
```

---

### Persona 4: Vikram Deshmukh — Senior Credit Analyst
```json
{
  "user": {
    "id": "usr_vikram_04",
    "mobile": "+91 98200 45123",
    "fullName": "Vikram Deshmukh",
    "role": "LENDER_OFFICER",
    "organization": "Pragati FinServe NBFC",
    "preferredLanguage": "en"
  },
  "queueStats": {
    "pendingReviews": 42,
    "approvedToday": 14,
    "disbursedTodayAmount": 18400000,
    "averageTatMinutes": 4.2
  },
  "triangulationSample": {
    "applicationId": "app_balaji_01",
    "bankReportedTurnover": 584000,
    "gstReportedTurnover": 610000,
    "upiReportedTurnover": 512000,
    "congruenceScorePercentage": 95.8,
    "varianceRiskTier": "LOW",
    "anomalies": []
  }
}
```

---

### Persona 5: Ananya Sen — Chief Risk Officer (Underwriting Manager)
```json
{
  "user": {
    "id": "usr_ananya_05",
    "mobile": "+91 99300 78219",
    "fullName": "Ananya Sen",
    "role": "LENDER_MANAGER",
    "organization": "Utkarsh Small Finance Bank",
    "preferredLanguage": "en"
  },
  "portfolioStats": {
    "totalActiveExposure": 450000000,
    "activeBorrowerCount": 3420,
    "grossNpaRate": 1.42,
    "delinquency30PlusRate": 2.1,
    "sachetRepaymentRecoveryAdvantage": 42.4
  }
}
```

---

### Persona 6: Rajiv Mehta — Platform Administrator
```json
{
  "user": {
    "id": "usr_rajiv_06",
    "mobile": "+91 98190 32190",
    "fullName": "Rajiv Mehta",
    "role": "SUPER_ADMIN",
    "preferredLanguage": "en"
  },
  "systemTelemetry": {
    "apiLatencyMs": 142,
    "uptime30d": 99.98,
    "errorRate": 0.02,
    "connectors": [
      { "name": "SAHAMATI_AA", "status": "OPERATIONAL", "latencyMs": 310 },
      { "name": "GSTN_API", "status": "DEGRADED", "latencyMs": 1280 },
      { "name": "NPCI_UPI", "status": "OPERATIONAL", "latencyMs": 180 },
      { "name": "DIGILOCKER", "status": "OPERATIONAL", "latencyMs": 240 }
    ]
  }
}
```

---

### Persona 7: Dr. Sunita Rao — Algorithmic Fairness & ESG Auditor
```json
{
  "user": {
    "id": "usr_sunita_07",
    "mobile": "+91 98400 91823",
    "fullName": "Dr. Sunita Rao",
    "role": "ETHICS_AUDITOR",
    "organization": "Independent Fair Lending Council",
    "preferredLanguage": "en"
  },
  "fairnessAudit": {
    "disparateImpactRatioGender": 0.947,
    "disparateImpactRatioGeography": 0.882,
    "fourFifthsThreshold": 0.80,
    "isFullyCompliant": true,
    "dpdpConsentsRevokedPast30Days": 18,
    "dpdpPurgeVerificationRate": 100.0
  }
}
```
