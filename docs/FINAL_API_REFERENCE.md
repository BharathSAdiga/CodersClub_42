# UDYOGA — Final API Reference Specification

## 1. Global API Standards

- **Base URL**: `http://localhost:8000`
- **API Prefix**: `/api/v1`
- **Protocol**: HTTP/1.1 & Server-Sent Events (SSE)
- **Content-Type**: `application/json` (Multipart form-data for CSV / Evidence files)

### 1.1 Standard Request Headers

| Header | Type | Required | Description |
|---|---|---|---|
| `Authorization` | String | Conditional | `Bearer <access_token>` for protected endpoints |
| `X-Correlation-ID` | UUID | Optional | Distributed tracing correlation ID. Auto-generated if omitted. |
| `X-Request-ID` | UUID | Optional | Unique per-request telemetry ID. Auto-generated if omitted. |
| `X-Idempotency-Key` | UUID | Optional | Idempotency token for mutating calls (`/assessment/run`, `/transactions/upload`). |

### 1.2 RFC-7807 Error Response Format

All error responses across UDYOGA conform to RFC-7807:

```json
{
  "type": "https://errors.udyoga.ai/ERR_UNAUTHORIZED",
  "title": "Unauthorized Access",
  "status": 401,
  "detail": "Invalid or expired authentication credentials.",
  "instance": "/api/v1/auth/me",
  "code": "ERR_UNAUTHORIZED",
  "correlation_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "timestamp": "2026-11-21T02:00:00Z"
}
```

---

## 2. API Endpoints

### 2.1 Health & Telemetry

#### `GET /health`
Returns the aggregated health of the platform including database, file storage, and memory status.
- **Auth**: None
- **Response**: `200 OK`
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "timestamp": "2026-11-21T02:00:00Z",
  "database": {
    "status": "connected",
    "driver": "sqlite+wal",
    "latency_ms": 1.2
  }
}
```

#### `GET /health/liveness`
Fast probe for Kubernetes or Docker orchestrators to check if the process is responsive.
- **Auth**: None
- **Response**: `200 OK` `{"status": "alive"}`

#### `GET /health/readiness`
Deep probe verifying database read/write readiness, table migration state, and disk availability.
- **Auth**: None
- **Response**: `200 OK` `{"status": "ready", "checks": {"database": "ok", "storage": "ok"}}`

---

### 2.2 Authentication & Identity (`/api/v1/auth`)

#### `POST /api/v1/auth/register`
Register a new user account with role-based access.
- **Request Body**:
```json
{
  "full_name": "Ramesh Patel",
  "email": "ramesh@pateltextiles.in",
  "password": "SecurePassword123!",
  "role": "BORROWER"
}
```
- **Response**: `201 Created`
```json
{
  "user_id": "usr_9b1deb4d",
  "email": "ramesh@pateltextiles.in",
  "full_name": "Ramesh Patel",
  "role": "BORROWER",
  "created_at": "2026-11-21T02:00:00Z"
}
```

#### `POST /api/v1/auth/login`
Authenticate credentials and issue JWT access token and refresh token.
- **Request Body**:
```json
{
  "email": "ramesh@pateltextiles.in",
  "password": "SecurePassword123!"
}
```
- **Response**: `200 OK`
```json
{
  "access_token": "eyJhbGciOi...",
  "refresh_token": "rnd_sec_8f9a2b...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "user_id": "usr_9b1deb4d",
    "email": "ramesh@pateltextiles.in",
    "role": "BORROWER"
  }
}
```

#### `POST /api/v1/auth/refresh`
Rotate refresh token and receive a new access token.
- **Request Body**: `{"refresh_token": "rnd_sec_8f9a2b..."}`
- **Response**: `200 OK` `{"access_token": "...", "refresh_token": "...", "token_type": "bearer"}`

#### `POST /api/v1/auth/logout`
Revoke the provided refresh token and invalidate active sessions.
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**: `{"refresh_token": "..."}`
- **Response**: `200 OK` `{"message": "Logged out successfully"}`

#### `GET /api/v1/auth/me`
Retrieve profile of currently authenticated user.
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: `200 OK` `{"user_id": "...", "email": "...", "role": "BORROWER"}`

#### `GET /api/v1/auth/users`
List all registered users across the platform.
- **Headers**: `Authorization: Bearer <access_token>` (ADMIN role required)
- **Response**: `200 OK` `[{"user_id": "...", "email": "...", "role": "..."}]`

#### `GET /api/v1/auth/applications`
List loan applications with RBAC scoping:
- `BORROWER`: Returns borrower's own applications.
- `LENDER`: Returns applications assigned to this lender or shared with consent.
- `ADMIN`: Returns all applications platform-wide.
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: `200 OK` `[{"application_id": "...", "business_id": "...", "status": "APPROVED", "requested_amount": 500000}]`

---

### 2.3 Business Management (`/api/v1/business`)

#### `POST /api/v1/business/profiles`
Register a new business profile.
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
```json
{
  "business_name": "Patel Textiles Pvt Ltd",
  "business_type": "MANUFACTURING",
  "location": "Surat, Gujarat",
  "monthly_turnover": 450000.0,
  "monthly_operating_expenses": 280000.0,
  "declared_existing_emi": 25000.0
}
```
- **Response**: `201 Created`

#### `GET /api/v1/business/profiles/{business_id}`
Retrieve business details by ID (enforces tenant isolation).
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: `200 OK`

---

### 2.4 Transaction Ingestion (`/api/v1/transactions`)

#### `POST /api/v1/transactions/upload`
Upload and parse bank statement CSV file.
- **Headers**: `Authorization: Bearer <access_token>`
- **Form Data**:
  - `file`: CSV file containing columns (`date`, `description`, `amount`, `type`, `balance`)
  - `business_id`: Business identifier
- **Response**: `200 OK` `{"parsed_count": 142, "total_inflow": 485000.0, "total_outflow": 310000.0}`

#### `POST /api/v1/transactions/batch`
Batch ingest structured transaction rows.
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**: `{"business_id": "...", "transactions": [...]}`
- **Response**: `201 Created`

---

### 2.5 Evidence Intelligence & Provenance (`/api/v1/evidence`)

#### `POST /api/v1/evidence/upload`
Upload supporting document evidence (GST returns, electricity bills, bank statements).
- **Headers**: `Authorization: Bearer <access_token>`
- **Form Data**:
  - `file`: PDF or image file
  - `business_id`: Business ID
  - `evidence_type`: `BANK_STATEMENT` | `GST_FILING` | `ELECTRICITY_BILL` | `TAX_RETURN`
  - `source_type`: `USER_UPLOAD` | `ACCOUNT_AGGREGATOR` | `GSTN_API`
- **Response**: `201 Created` `{"evidence_id": "ev_...", "confidence_score": 0.88, "provenance": "USER_UPLOADED"}`

#### `GET /api/v1/evidence/provenance/{business_id}`
Inspect provenance chain, document signatures, and verification status for all uploaded business evidence.
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: `200 OK`

---

### 2.6 Consent Lifecycle Management (`/api/v1/consent`)

#### `POST /api/v1/consent/grant`
Grant scoped consent to an underwriting lender or partner.
- **Headers**: `Authorization: Bearer <access_token>` (Borrower role required)
- **Request Body**:
```json
{
  "business_id": "biz_patel",
  "granted_to_party": "LENDER_SBI_VIKRAM",
  "scope": ["FINANCIAL_DNA", "STRESS_RESILIENCE", "FULL_CAM"],
  "valid_days": 30
}
```
- **Response**: `200 OK` `{"consent_id": "cst_...", "status": "ACTIVE"}`

#### `POST /api/v1/consent/revoke`
Immediately revoke previously granted consent.
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**: `{"consent_id": "cst_...", "reason": "Application withdrawn"}`
- **Response**: `200 OK` `{"consent_id": "cst_...", "status": "REVOKED"}`

---

### 2.7 Financial Resilience & Stress Testing (`/api/v1/resilience`)

#### `POST /api/v1/resilience/simulate`
Run deterministic cash flow stress simulation across economic shock parameters.
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
```json
{
  "business_id": "biz_patel",
  "revenue_contraction_pct": 25.0,
  "cogs_inflation_pct": 15.0,
  "receivable_delay_days": 30
}
```
- **Response**: `200 OK`
```json
{
  "stress_surplus": 32500.0,
  "runway_days": 180,
  "resilience_rating": "MODERATE_RESILIENCE",
  "is_cash_generative_under_stress": true
}
```

#### `POST /api/v1/resilience/affordability`
Evaluate deterministic loan affordability and compute maximum safe borrowing limit ($P_{\text{max}}$).
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
```json
{
  "monthly_turnover": 450000.0,
  "monthly_operating_expenses": 280000.0,
  "declared_existing_emi": 25000.0,
  "proposed_loan_amount": 500000.0,
  "tenure_months": 24,
  "annual_interest_rate_pct": 14.0
}
```
- **Response**: `200 OK`
```json
{
  "unencumbered_monthly_surplus": 145000.0,
  "maximum_affordable_monthly_emi": 72500.0,
  "maximum_safe_loan_principal": 1421350.0,
  "repayment_comparisons": [...]
}
```

---

### 2.8 Multi-Agent Assessment & Underwriting (`/api/v1/assessment`)

#### `POST /api/v1/assessment/run`
Trigger autonomous 7-agent assessment pipeline.
- **Headers**: `Authorization: Bearer <access_token>`, `X-Idempotency-Key: <uuid>`
- **Request Body**:
```json
{
  "business_id": "biz_patel",
  "loan_amount_requested": 500000.0,
  "loan_purpose": "Raw Cotton Procurement"
}
```
- **Response**: `202 Accepted`
```json
{
  "assessment_id": "asmt_patel_001",
  "status": "QUEUED",
  "stream_url": "/api/v1/assessment/stream/asmt_patel_001"
}
```

#### `GET /api/v1/assessment/stream/{assessment_id}`
Real-time Server-Sent Events (SSE) stream of agent progress and execution steps.
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: `text/event-stream`
```
event: agent_event
data: {"agent": "ForensicAuditAgent", "status": "COMPLETED", "progress": 14, "detail": "Document signatures verified."}

event: agent_event
data: {"agent": "RecommendationCAMAgent", "status": "COMPLETED", "progress": 100, "detail": "CAM generated successfully."}
```

#### `GET /api/v1/assessment/{assessment_id}`
Retrieve completed assessment record and final Credit Assessment Memorandum (CAM).
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: `200 OK` (Full CAM model with Financial DNA, Risk Rating, and Terms)

---

### 2.9 Immutable Audit Logging (`/api/v1/audit`)

#### `GET /api/v1/audit/logs`
Query immutable audit logs across the platform.
- **Headers**: `Authorization: Bearer <access_token>` (ADMIN only)
- **Query Params**: `limit=50&offset=0`
- **Response**: `200 OK`
```json
[
  {
    "audit_id": "aud_01",
    "user_id": "usr_patel",
    "action": "CONSENT_GRANTED",
    "resource_type": "BUSINESS_DATA",
    "resource_id": "biz_patel",
    "ip_address": "127.0.0.1",
    "created_at": "2026-11-21T02:00:00Z"
  }
]
```
