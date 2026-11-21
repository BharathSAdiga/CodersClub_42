/**
 * UDYOGA Full-Stack API Integration Service
 * Connects React frontend components to the deterministic FastAPI backend.
 * Provides live REST calls, multipart CSV ingestion, SSE event streaming,
 * JWT authentication, refresh token rotation, and resilient fallbacks.
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
  revenue_shock_pct?: number;
  revenue_contraction_pct?: number;
  expense_inflation_pct?: number;
  cogs_inflation_pct?: number;
  receivables_delay_days?: number;
  receivable_delay_days?: number;
  shock_duration_months?: number;
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
  pre_shock_monthly_surplus?: number;
  post_shock_monthly_surplus: number;
  post_shock_dscr: number;
  cash_runway_post_shock_days?: number;
  stressed_cash_runway_days?: number | null;
  cash_runway_days?: number | null;
  is_cash_generative_under_shock?: boolean;
  is_surplus_positive?: boolean;
  scenario_evaluation?: string;
  recommended_repayment_structure?: string;
  affordability?: AffordabilitySummary;
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
  apr_cap_pct?: number | null;
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

export interface AuthUser {
  id: string;
  username: string;
  email?: string | null;
  full_name: string;
  role: string;
  business_id?: string | null;
  is_active: boolean;
  created_at: string;
  last_login_at?: string | null;
}

export interface AuthTokenResponse {
  access_token: string;
  refresh_token?: string | null;
  token_type: string;
  username: string;
  full_name: string;
  role: string;
  business_id?: string | null;
  expires_in: number;
  user?: AuthUser;
}

const API_BASE = '/api/v1';

class ApiService {
  private accessToken: string | null = null;
  private refreshTokenVal: string | null = null;
  private currentUser: AuthUser | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = sessionStorage.getItem('udyoga_access_token');
      this.refreshTokenVal = sessionStorage.getItem('udyoga_refresh_token');
      try {
        const u = sessionStorage.getItem('udyoga_user');
        this.currentUser = u ? JSON.parse(u) : null;
      } catch {
        this.currentUser = null;
      }
    }
  }

  // Auth State Helpers
  public isAuthenticated(): boolean {
    return Boolean(this.accessToken);
  }

  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public getAuthHeaders(): Record<string, string> {
    if (this.accessToken) {
      return { Authorization: `Bearer ${this.accessToken}` };
    }
    return {};
  }

  public setSession(data: AuthTokenResponse): void {
    this.accessToken = data.access_token;
    if (data.refresh_token) {
      this.refreshTokenVal = data.refresh_token;
    }
    const user: AuthUser = data.user || {
      id: 'usr_' + data.username,
      username: data.username,
      full_name: data.full_name,
      role: data.role,
      business_id: data.business_id,
      is_active: true,
      created_at: new Date().toISOString()
    };
    this.currentUser = user;

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('udyoga_access_token', data.access_token);
      if (data.refresh_token) {
        sessionStorage.setItem('udyoga_refresh_token', data.refresh_token);
      }
      sessionStorage.setItem('udyoga_user', JSON.stringify(user));
    }
  }

  public clearSession(): void {
    this.accessToken = null;
    this.refreshTokenVal = null;
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('udyoga_access_token');
      sessionStorage.removeItem('udyoga_refresh_token');
      sessionStorage.removeItem('udyoga_user');
    }
  }

  // Authentication API Calls
  public async login(username: string, password: string): Promise<AuthTokenResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Invalid credentials' }));
      throw new Error(err.detail || 'Login failed');
    }
    const data: AuthTokenResponse = await res.json();
    this.setSession(data);
    return data;
  }

  public async register(userData: {
    username: string;
    email: string;
    full_name: string;
    password: string;
    role?: string;
    business_id?: string;
  }): Promise<AuthTokenResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        full_name: userData.full_name,
        password: userData.password,
        role: userData.role || 'BORROWER',
        business_id: userData.business_id,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    const data: AuthTokenResponse = await res.json();
    this.setSession(data);
    return data;
  }

  public async demoLogin(personaKey: string): Promise<AuthTokenResponse> {
    const res = await fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persona_key: personaKey }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Demo login failed' }));
      throw new Error(err.detail || 'Demo login failed');
    }
    const data: AuthTokenResponse = await res.json();
    this.setSession(data);
    return data;
  }

  public async refreshToken(): Promise<AuthTokenResponse | null> {
    if (!this.refreshTokenVal) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshTokenVal }),
      });
      if (!res.ok) {
        this.clearSession();
        return null;
      }
      const data: AuthTokenResponse = await res.json();
      this.setSession(data);
      return data;
    } catch {
      this.clearSession();
      return null;
    }
  }

  public async logout(): Promise<void> {
    try {
      if (this.refreshTokenVal) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders(),
          },
          body: JSON.stringify({ refresh_token: this.refreshTokenVal }),
        });
      }
    } finally {
      this.clearSession();
    }
  }

  public async getMe(): Promise<AuthUser> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) {
      if (res.status === 401) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          return this.getMe();
        }
      }
      throw new Error('Failed to fetch authenticated user profile');
    }
    return res.json();
  }

  // Core Platform Endpoints
  public async getHealth(): Promise<{ status: string; service: string }> {
    const res = await fetch(`${API_BASE}/health/`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json();
  }

  public async getDemoScenarios(): Promise<BackendBusinessProfile[]> {
    const res = await fetch(`${API_BASE}/business/demo/scenarios`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to load demo scenarios: ${res.statusText}`);
    return res.json();
  }

  public async createBusinessProfile(profile: Partial<BackendBusinessProfile>): Promise<BackendBusinessProfile> {
    const res = await fetch(`${API_BASE}/business/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error(`Failed to create business profile: ${res.statusText}`);
    return res.json();
  }

  public async uploadCsv(businessId: string, file: File): Promise<TransactionIngestSummary> {
    const formData = new FormData();
    formData.append('business_id', businessId);
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/transactions/upload-csv`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'CSV upload failed');
    }
    return res.json();
  }

  public async simulateResilience(
    businessId: string,
    scenario: ShockScenarioPayload
  ): Promise<BackendShockResult> {
    const res = await fetch(`${API_BASE}/resilience/simulate?business_id=${encodeURIComponent(businessId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(scenario),
    });
    if (!res.ok) throw new Error(`Simulation failed: ${res.statusText}`);
    return res.json();
  }

  private async extractErrorMessage(res: Response, defaultMsg: string): Promise<string> {
    try {
      const err = await res.json();
      if (typeof err.detail === 'string') return err.detail;
      if (Array.isArray(err.detail) && err.detail.length > 0) {
        return err.detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ');
      }
      return err.detail || err.message || err.title || defaultMsg;
    } catch {
      return `${defaultMsg} (${res.status} ${res.statusText})`;
    }
  }

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
    const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const res = await fetch(`${API_BASE}/assessment/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({
        business_id: businessId,
        requested_loan_amount: requestedLoanAmount || 250000,
      }),
    });
    if (!res.ok) {
      const msg = await this.extractErrorMessage(res, 'Failed to trigger assessment');
      throw new Error(msg);
    }
    return res.json();
  }

  public async getAssessmentEvents(assessmentId: string): Promise<BackendAgentEvent[]> {
    const res = await fetch(`${API_BASE}/assessment/${encodeURIComponent(assessmentId)}/events`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) {
      const msg = await this.extractErrorMessage(res, 'Failed to fetch events');
      throw new Error(msg);
    }
    return res.json();
  }

  public async getAssessmentResult(assessmentId: string): Promise<BackendCreditAppraisalMemo> {
    const res = await fetch(`${API_BASE}/assessment/${encodeURIComponent(assessmentId)}/result`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) {
      const msg = await this.extractErrorMessage(res, 'Failed to load assessment result');
      throw new Error(msg);
    }
    return res.json();
  }

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
      console.warn('SSE stream error or disconnection. Attempting event recovery catchup...');
      eventSource.close();
      this.getAssessmentEvents(assessmentId)
        .then((events) => {
          events.forEach((ev) => onEvent(ev));
          const completed = events.some(
            (e) => (e.agent_name === 'Orchestrator' && e.status === 'COMPLETED') || e.status === 'FAILED'
          );
          if (completed) {
            onComplete?.();
          } else {
            onError?.(err);
          }
        })
        .catch(() => {
          onError?.(err);
        });
    };

    return () => {
      eventSource.close();
    };
  }

  // -------------------------------------------------------------
  // Phase 2C: Consent Management, Evidence Intelligence & Audit Trail
  // -------------------------------------------------------------

  public async getActiveConsents(businessId: string): Promise<BackendConsentRecord[]> {
    const res = await fetch(`${API_BASE}/consent/active/${encodeURIComponent(businessId)}`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to load active consents: ${res.statusText}`);
    return res.json();
  }

  public async getConsentHistory(businessId: string): Promise<BackendConsentRecord[]> {
    const res = await fetch(`${API_BASE}/consent/history/${encodeURIComponent(businessId)}`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to load consent history: ${res.statusText}`);
    return res.json();
  }

  public async grantConsent(payload: {
    business_id: string;
    data_provider: string;
    purpose?: string;
    consent_scope?: string[];
    expires_in_days?: number;
  }): Promise<BackendConsentRecord> {
    const res = await fetch(`${API_BASE}/consent/grant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const msg = await this.extractErrorMessage(res, 'Failed to grant consent');
      throw new Error(msg);
    }
    return res.json();
  }

  public async revokeConsent(consentId: string): Promise<{ status: string; consent_id: string; message: string }> {
    const res = await fetch(`${API_BASE}/consent/${encodeURIComponent(consentId)}/revoke`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) {
      const msg = await this.extractErrorMessage(res, 'Failed to revoke consent');
      throw new Error(msg);
    }
    return res.json();
  }

  public async getEvidenceAuditTrail(businessId: string): Promise<BackendEvidenceRecord[]> {
    const res = await fetch(`${API_BASE}/evidence/audit-trail/${encodeURIComponent(businessId)}`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to load evidence audit trail: ${res.statusText}`);
    return res.json();
  }

  public async getEvidenceConfidenceReport(businessId: string): Promise<BackendEvidenceConfidenceReport> {
    const res = await fetch(`${API_BASE}/evidence/confidence/${encodeURIComponent(businessId)}`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to load evidence confidence report: ${res.statusText}`);
    return res.json();
  }

  public async getBusinessAuditLogs(businessId: string, limit = 50): Promise<BackendAuditLogEvent[]> {
    const res = await fetch(`${API_BASE}/audit/business/${encodeURIComponent(businessId)}?limit=${limit}`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to load business audit logs: ${res.statusText}`);
    return res.json();
  }

  public async getSystemAuditLogs(limit = 100): Promise<BackendAuditLogEvent[]> {
    const res = await fetch(`${API_BASE}/audit/logs?limit=${limit}`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to load system audit logs: ${res.statusText}`);
    return res.json();
  }

  // User Management
  public async getUsers(): Promise<AuthUser[]> {
    const res = await fetch(`${API_BASE}/auth/users`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to fetch users: ${res.statusText}`);
    return res.json();
  }

  public async updateUserStatus(userId: string, isActive: boolean): Promise<AuthUser> {
    const res = await fetch(`${API_BASE}/auth/users/${encodeURIComponent(userId)}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ is_active: isActive }),
    });
    if (!res.ok) throw new Error(`Failed to update user status: ${res.statusText}`);
    return res.json();
  }

  public async updateUserRole(userId: string, role: string): Promise<AuthUser> {
    const res = await fetch(`${API_BASE}/auth/users/${encodeURIComponent(userId)}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error(`Failed to update user role: ${res.statusText}`);
    return res.json();
  }

  // Application Management
  public async getApplications(limit = 50): Promise<any[]> {
    const res = await fetch(`${API_BASE}/auth/applications?limit=${limit}`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to fetch applications: ${res.statusText}`);
    return res.json();
  }

  public async getApplication(applicationId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/applications/${encodeURIComponent(applicationId)}`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to fetch application: ${res.statusText}`);
    return res.json();
  }

  public async submitApplication(data: {
    business_id: string;
    facility_type?: string;
    requested_amount: number;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({
        business_id: data.business_id,
        facility_type: data.facility_type || 'UNSECURED_WORKING_CAPITAL_LINE',
        requested_amount: data.requested_amount,
      }),
    });
    if (!res.ok) {
      const msg = await this.extractErrorMessage(res, 'Failed to submit application');
      throw new Error(msg);
    }
    return res.json();
  }

  public async updateApplicationStatus(applicationId: string, status: string): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/applications/${encodeURIComponent(applicationId)}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(`Failed to update application status: ${res.statusText}`);
    return res.json();
  }

  // Business Profile Management
  public async getBusinessProfile(businessId: string): Promise<BackendBusinessProfile> {
    const res = await fetch(`${API_BASE}/business/profile/${encodeURIComponent(businessId)}`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await this.extractErrorMessage(res, `Failed to fetch business profile: ${res.statusText}`);
      throw new Error(err);
    }
    return res.json();
  }

  public async updateBusinessProfile(
    businessId: string,
    profile: Partial<BackendBusinessProfile>
  ): Promise<BackendBusinessProfile> {
    const res = await fetch(`${API_BASE}/business/profile/${encodeURIComponent(businessId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(profile),
    });
    if (!res.ok) {
      const err = await this.extractErrorMessage(res, `Failed to update business profile: ${res.statusText}`);
      throw new Error(err);
    }
    return res.json();
  }
}

export interface BackendConsentRecord {
  id: string;
  user_id: string;
  business_id: string;
  data_provider: string;
  purpose: string;
  consent_scope: string[];
  data_fields_granted: string[];
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  consent_version: string;
  granted_at: string;
  expires_at?: string;
  revoked_at?: string;
  is_expired?: boolean;
}

export interface BackendEvidenceRecord {
  evidence_id: string;
  business_id: string;
  uploaded_by?: string;
  evidence_type: string;
  source_type: string;
  source_name?: string;
  provenance_category: string;
  verification_status: string;
  confidence_score: number;
  completeness: number;
  consistency: number;
  recency: number;
  uploaded_at: string;
  last_reviewed_at?: string;
  file_reference?: string;
  related_assessment_ids: string[];
  file_hash?: string;
  record_count?: number;
  document_name?: string;
  document_type?: string;
  status?: string;
}

export interface BackendReconciliationDiscrepancy {
  discrepancy_id: string;
  discrepancy_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source_a: string;
  source_b: string;
  difference_amount?: number;
  description: string;
  suggested_action: string;
  flagged_for_human_review: boolean;
}

export interface BackendEvidenceConfidenceReport {
  business_id: string;
  confidence: {
    evidence_confidence_score: number;
    confidence_band: string;
    data_completeness_pct: number;
    consistency_pct: number;
    recency_pct: number;
    source_reliability_pct: number;
    temporal_coverage_days: number;
    total_records_analyzed: number;
    available_data_sources: string[];
    missing_evidence_fields: string[];
    inconsistent_fields: string[];
    confidence_rationale: string;
    recommendations_to_improve: string[];
  };
  reconciliation: {
    is_concordant: boolean;
    concordance_score: number;
    discrepancies: BackendReconciliationDiscrepancy[];
    total_discrepancies: number;
    unmatched_liabilities_count: number;
    summary: string;
  };
  evidence_records: BackendEvidenceRecord[];
  generated_at: string;
}

export interface BackendAuditLogEvent {
  id: string;
  actor_user_id: string;
  actor_role: string;
  action: string;
  resource_type: string;
  resource_id: string;
  request_id?: string;
  outcome: string;
  details?: string;
  structured_metadata?: Record<string, any>;
  timestamp: string;
}

export const apiService = new ApiService();
