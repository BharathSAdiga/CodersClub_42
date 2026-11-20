/**
 * UDYOGA Full-Stack API Integration Service
 * Connects React frontend components to the deterministic FastAPI backend.
 * Provides live REST calls, multipart CSV ingestion, SSE event streaming,
 * and resilient fallbacks.
 */

export interface BackendBusinessProfile {
  business_id: string;
  legal_name: string;
  trade_name: string;
  sector: string;
  vintage_months: number;
  location_tier: string;
  entity_type: string;
  declared_monthly_turnover: number;
  declared_existing_monthly_emi: number;
  has_gstin: boolean;
  gstin?: string | null;
  has_udyam_registration: boolean;
  udyam_reg_number?: string | null;
  is_synthetic?: boolean;
  created_at: string;
}

export interface TransactionIngestSummary {
  business_id: string;
  total_parsed: number;
  credits_count: number;
  debits_count: number;
  total_credit_volume: number;
  total_debit_volume: number;
  start_date?: string | null;
  end_date?: string | null;
  coverage_days: number;
}

export interface ShockScenarioPayload {
  scenario_name: string;
  revenue_shock_pct: number;
  expense_inflation_pct: number;
  receivables_delay_days: number;
  shock_duration_months: number;
}

export interface AffordabilitySummary {
  maximum_affordable_monthly_emi: number;
  maximum_affordable_loan_principal: number;
  recommended_repayment_structure: string;
  unencumbered_monthly_surplus: number;
  pre_shock_dscr: number;
  post_shock_dscr: number;
}

export interface BackendShockResult {
  assessment_id: string;
  business_id: string;
  pre_shock_monthly_surplus: number;
  post_shock_monthly_surplus: number;
  post_shock_dscr: number;
  cash_runway_post_shock_days: number;
  is_surplus_positive: boolean;
  scenario_evaluation: string;
  recommended_repayment_structure: string;
  affordability: AffordabilitySummary;
  scenario_suite_evaluations?: Array<{
    scenario_name: string;
    revenue_shock_pct: number;
    projected_monthly_cash_surplus: number;
    post_shock_dscr: number;
    cash_runway_days: number;
    survives_shock: boolean;
  }>;
}

export interface BackendAgentEvent {
  event_id: string;
  assessment_id: string;
  business_id: string;
  agent_name: string;
  step_name: string;
  status: 'STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  timestamp: string;
  message: string;
  structured_payload?: Record<string, any>;
  execution_duration_ms?: number;
}

export interface BackendCreditAppraisalMemo {
  assessment_id: string;
  business_id: string;
  generated_at: string;
  assessment_status: 'INDICATIVE_RECOMMENDATION' | 'CONDITIONAL_RECOMMENDATION' | 'HUMAN_REVIEW_REQUIRED' | 'INSUFFICIENT_EVIDENCE';
  financial_risk_band: 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK' | 'CRITICAL_RISK' | 'UNASSESSED';
  evidence_confidence_score: number;
  investigation_status: 'NORMAL_PATTERNS' | 'ANOMALIES_DETECTED' | 'HUMAN_REVIEW_RECOMMENDED' | 'INVESTIGATION_INCONCLUSIVE';
  recommended_loan_amount_inr: number;
  recommended_tenure_months: number;
  indicative_apr_range: string;
  apr_floor_pct?: number | null;
  apr_ceiling_pct?: number | null;
  recommended_facility_type: string;
  positive_credit_factors: string[];
  risk_factors_and_vulnerabilities: string[];
  recommended_covenants_and_mitigants: string[];
  assumptions: string[];
  data_limitations: string[];
  evidence_references: string[];
  calculation_version: string;
  cam_narrative_markdown: string;
  is_fallback_rule_based: boolean;
  fallback_reason?: string | null;
}

const API_BASE = '/api/v1';

class ApiService {
  /**
   * Health check
   */
  public async getHealth(): Promise<{ status: string; service: string }> {
    const res = await fetch(`${API_BASE}/health/`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json();
  }

  /**
   * Fetch pre-seeded demo MSME scenarios
   */
  public async getDemoScenarios(): Promise<BackendBusinessProfile[]> {
    const res = await fetch(`${API_BASE}/business/demo/scenarios`);
    if (!res.ok) throw new Error(`Failed to load demo scenarios: ${res.statusText}`);
    return res.json();
  }

  /**
   * Create a new business profile
   */
  public async createBusinessProfile(profile: Partial<BackendBusinessProfile>): Promise<BackendBusinessProfile> {
    const res = await fetch(`${API_BASE}/business/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error(`Failed to create business profile: ${res.statusText}`);
    return res.json();
  }

  /**
   * Upload bank or UPI transaction statement CSV
   */
  public async uploadCsv(businessId: string, file: File): Promise<TransactionIngestSummary> {
    const formData = new FormData();
    formData.append('business_id', businessId);
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/transactions/upload-csv`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'CSV upload failed');
    }
    return res.json();
  }

  /**
   * Run real-time deterministic Cash-Flow Resilience simulation
   */
  public async simulateResilience(
    businessId: string,
    scenario: ShockScenarioPayload
  ): Promise<BackendShockResult> {
    const res = await fetch(`${API_BASE}/resilience/simulate?business_id=${encodeURIComponent(businessId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenario),
    });
    if (!res.ok) throw new Error(`Simulation failed: ${res.statusText}`);
    return res.json();
  }

  /**
   * Trigger multi-agent assessment pipeline
   */
  public async triggerAssessment(
    businessId: string,
    requestedLoanAmount?: number
  ): Promise<{
    assessment_id: string;
    business_id: string;
    status: string;
    message: string;
    stream_url: string;
  }> {
    const res = await fetch(`${API_BASE}/assessment/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_id: businessId,
        requested_loan_amount: requestedLoanAmount || 250000,
      }),
    });
    if (!res.ok) throw new Error(`Failed to trigger assessment: ${res.statusText}`);
    return res.json();
  }

  /**
   * Fetch past events for an assessment
   */
  public async getAssessmentEvents(assessmentId: string): Promise<BackendAgentEvent[]> {
    const res = await fetch(`${API_BASE}/assessment/${encodeURIComponent(assessmentId)}/events`);
    if (!res.ok) throw new Error(`Failed to fetch events: ${res.statusText}`);
    return res.json();
  }

  /**
   * Fetch final Credit Appraisal Memo
   */
  public async getAssessmentResult(assessmentId: string): Promise<BackendCreditAppraisalMemo> {
    const res = await fetch(`${API_BASE}/assessment/${encodeURIComponent(assessmentId)}/result`);
    if (!res.ok) throw new Error(`Failed to load assessment result: ${res.statusText}`);
    return res.json();
  }

  /**
   * Subscribe to real-time Server-Sent Events (SSE) for agent execution traces
   */
  public subscribeAssessmentStream(
    assessmentId: string,
    onEvent: (event: BackendAgentEvent) => void,
    onError?: (err: any) => void,
    onComplete?: () => void
  ): () => void {
    const sseUrl = `${API_BASE}/assessment/${encodeURIComponent(assessmentId)}/stream`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const parsed: BackendAgentEvent = JSON.parse(event.data);
        onEvent(parsed);
        if (parsed.agent_name === 'Orchestrator' && parsed.status === 'COMPLETED') {
          eventSource.close();
          onComplete?.();
        }
      } catch (e) {
        console.error('Failed to parse SSE agent event:', e);
      }
    };

    eventSource.onerror = (err) => {
      console.warn('SSE stream error or complete:', err);
      eventSource.close();
      onError?.(err);
    };

    // Return unsubscriber function
    return () => {
      eventSource.close();
    };
  }
}

export const apiService = new ApiService();
