// ==========================================
// UDYOGA CORE DOMAIN & API TYPES
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
  organization?: string;
  preferredLanguage: 'en' | 'hi' | 'ta' | 'kn';
  createdAt: string;
  lastLoginAt: string;
}

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
  industrySector: string;
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

export interface BankAccountSummary {
  accountNumberMasked: string;
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
  vpaMasked: string;
  aggregator: 'PHONEPE' | 'PAYTM' | 'BHARATPE' | 'GPAY' | 'OTHER';
  dailyAverageTransactions: number;
  monthlyAverageVolume: number;
  ticketSizeAverage: number;
  activeSinceDays: number;
}

export interface GstnSummary {
  gstin: string;
  filingPunctualityRate: number;
  annualTurnoverVerified: number;
  activeBuyersCount: number;
  topBuyerConcentrationRatio: number;
}

export interface CashFlowWaveformPoint {
  date: string;
  inflow: number;
  outflow: number;
  netBalance: number;
}

export interface FinancialAggregatedPayload {
  businessId: string;
  accounts: BankAccountSummary[];
  upiMerchants: UpiMerchantSummary[];
  gstn?: GstnSummary;
  cashFlowWaveform: CashFlowWaveformPoint[];
}

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
  apr: number;
  processingFee: number;
  netDisbursalAmount: number;
  status: ApplicationStatus;
  submittedAt: string;
  disbursalEtaMinutes?: number;
}

export interface ShapFeatureDriver {
  featureKey: string;
  displayName: string;
  impactDirection: 'POSITIVE' | 'NEGATIVE';
  weightPoints: number;
  explanationPlainLanguage: string;
}

export interface CounterfactualScenario {
  parameterName: string;
  currentValue: number;
  suggestedTargetValue: number;
  unlockedCreditIncrease: number;
  unlockedAprDiscount: number;
  timelineDays: number;
}

export interface AcieAssessmentReport {
  id: string;
  applicationId: string;
  creditVitalityScore: number;
  scoreBand: 'PRIME' | 'MODERATE' | 'DEVELOPING' | 'SUBPRIME';
  modelConfidenceScore: number;
  evaluatedAt: string;
  topDrivers: ShapFeatureDriver[];
  counterfactuals: CounterfactualScenario[];
  isSparseDataProgressiveMode: boolean;
}

export interface TriangulationMatrix {
  applicationId: string;
  bankReportedTurnover: number;
  gstReportedTurnover: number;
  upiReportedTurnover: number;
  congruenceScorePercentage: number;
  varianceRiskTier: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface AnomalyIndicator {
  ruleCode: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  description: string;
  detectedAt: string;
}

export interface ConsentArtifact {
  id: string;
  userId: string;
  dataProvider: 'ACCOUNT_AGGREGATOR' | 'GSTN' | 'NPCI_UPI' | 'DIGILOCKER';
  purpose: string;
  dataFieldsGranted: string[];
  grantedAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  revokedAt?: string;
}

export interface FairnessMetric {
  attribute: 'GENDER' | 'GEOGRAPHY_TIER' | 'ENTERPRISE_CLASS';
  groupA: string;
  groupB: string;
  approvalRateA: number;
  approvalRateB: number;
  disparateImpactRatio: number;
  isCompliantWith80Rule: boolean;
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

export interface PersonaProfile {
  id: string;
  name: string;
  role: UserRole;
  badge: string;
  tagline: string;
  user: UserProfile;
  business?: BusinessProfile;
  financials?: FinancialAggregatedPayload;
  acieReport?: AcieAssessmentReport;
  application?: CreditApplication;
  triangulation?: TriangulationMatrix;
  consents?: ConsentArtifact[];
  meta?: Record<string, any>;
}
