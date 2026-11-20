# UDYOGA: Complete User Journeys & End-to-End Workflows

**Project:** UDYOGA – Beyond Credit. Beyond Barriers.  
**Phase:** Phase 2 — Comprehensive Product Strategy  
**Hackathon Track:** The Big Hack 2.0 — Finance Track (F2: Credit for the Credit-Invisible)  
**Author:** Senior FinTech Product Manager & UX Architect  
**Branch:** `feature/phase-2-product-strategy`

---

## Journey 1: MSME Owner — First-Time Borrower (Ramesh, Kirana Store)

```
[Discovery: Public Landing] ──► [Instant Eligibility Teaser] ──► [OTP Mobile Auth]
                                                                        │
┌───────────────────────────────────────────────────────────────────────┘
▼
[4-Step Onboarding: Business Details (Udyam/PAN)] ──► [3-Click Account Aggregator Consent]
                                                                │
┌───────────────────────────────────────────────────────────────┘
▼
[Financial Health Mirror & Waveform Visualizer] ──► [ACIE Instant Score & Credit Line]
                                                            │
┌───────────────────────────────────────────────────────────┘
▼
[Interactive Loan Customizer (Tenor & Sachet Slider)] ──► [Key Fact Statement (KFS) Review]
                                                                    │
┌───────────────────────────────────────────────────────────────────┘
▼
[e-Mandate / UPI AutoPay Setup] ──► [Instant Sanction & Disbursal Tracker]
```

### Step-by-Step Breakdown:
1. **Entry & Inspiration:** Arrives at the public landing page. Sees the calm, high-trust interface with live split waveform visualizer ("They speak" / "You read" adapted to "Your Daily Commerce" / "Your Credit Power"). Reads transparent terms: "No collateral required. 100% flow-based."
2. **Interactive Teaser:** Plays with the public eligibility calculator (slides daily UPI turnover to ₹20,000/day; sees estimated pre-approved line of ₹1,50,000 at ~14.5% APR). Clicks **"Apply for Credit"** (green pill button).
3. **Frictionless Mobile Auth:** Enters mobile number; receives 6-digit OTP; auto-detects or manual input with 30s resend timer.
4. **Step 1 — Business Identity:** Enters Udyam Registration Number or PAN. One-tap lookup auto-fills enterprise name ("Sri Balaji Provisions"), entity type (Proprietorship), and registered address.
5. **Step 2 — Financial Consent (Account Aggregator):** Selects bank from clean modal (SBI, Canara, HDFC). Chooses mobile-linked account. AA consent screen clearly shows: "Only read access for cash flow analysis. No debit rights. Valid for 90 days." Approves via bank OTP.
6. **Step 3 — Alternative Footprint:** Connects merchant UPI QR handle (`ramesh@upi`) for transaction velocity analysis.
7. **Step 4 — Financial Health Mirror:** Instant generation of the **Credit Health Diagnostic**. Ramesh sees his net monthly inflow (₹5.8 Lakh), average minimum daily balance (₹18,400), and green ACIE Score of **742/900** ("Prime Vitality").
8. **Offer & Customization:** Pre-approved for ₹1,80,000. Uses interactive slider to select ₹1,50,000 over 90 days. Toggles repayment mode: selects **Daily Sachet Sweep (₹1,720/day)** matched to his evening shop closing time.
9. **Transparent KFS:** RBI-compliant Key Fact Statement displayed prominently: Principal, Processing fee (zero surprise), Net Disbursal, APR (14.2%), and 3-day penalty-free cooling-off period.
10. **e-Mandate & Disbursal:** Signs agreement via Aadhaar e-Sign OTP; sets up UPI AutoPay. Application status updates to "Sanctioned - Disbursal Initiated (ETA 12 minutes)".

---

## Journey 2: Existing Thin-File Business (Priya, Handicraft Studio)

```
[Login / Dashboard] ──► [View Existing Health Mirror] ──► [Connect GSTN Account]
                                                                  │
┌─────────────────────────────────────────────────────────────────┘
▼
[ACIE Real-Time Re-scoring (+48 pts)] ──► [Explainable SHAP Waterfall View]
                                                    │
┌───────────────────────────────────────────────────┘
▼
[Counterfactual "What-If" Simulator] ──► [Unlock Elevated Credit Limit (+₹3.5L)]
                                                    │
┌───────────────────────────────────────────────────┘
▼
[Submit Credit Line Increase Request] ──► [Real-Time Notification & Disbursement]
```

### Step-by-Step Breakdown:
1. **Context:** Priya has an existing credit line of ₹1,50,000 in good standing, but needs ₹5,00,000 for raw material procurement ahead of a large export order.
2. **Dashboard Entry:** Logs in; sees her active credit status, repayment history (100% on-time), and an alert: *"Boost your credit line up to ₹5,00,000 by connecting your GST returns."*
3. **One-Tap GSTN Linking:** Clicks **"Connect GSTN"**. Enters GSTIN (`08AABCU9603R1ZM`); authorizes via registered phone OTP. System ingests GSTR-1 and GSTR-3B filings for the past 12 months.
4. **ACIE Dynamic Re-Scoring:** Within 8 seconds, the engine processes her B2B invoice volume (₹42 Lakhs annual sales across 14 verified corporate buyers). Her score jumps from 685 to **733/900**.
5. **Explainable SHAP Waterfall:** Priya opens the **Score Explainability Ribbon**:
   - `+38 pts` — Strong B2B buyer diversification (top buyer is only 18% of total invoices).
   - `+22 pts` — Zero GST filing delays over 12 consecutive quarters.
   - `-12 pts` — Seasonal revenue dip during monsoon quarter (explained and non-fatal).
6. **Counterfactual "What-If" Exploration:** Priya uses the interactive simulator:
   - "If you upload purchase orders from your new European client, projected credit capacity unlocks to ₹6,50,000 at a 1.2% lower APR."
7. **Credit Line Expansion:** Clicks **"Apply for Limit Upgrade"**. Instantly approved for ₹5,00,000. New terms reflected seamlessly on her active dashboard.

---

## Journey 3: Digitally Inexperienced Borrower (Muthuvel, Foundry)

```
[Public Page: Language Selector (தமிழ் / English)] ──► [High-Contrast Assistive View]
                                                                │
┌───────────────────────────────────────────────────────────────┘
▼
[Audio-Guided Onboarding Step-by-Step] ──► [Simplified Bank Selection via Icons]
                                                        │
┌───────────────────────────────────────────────────────┘
▼
[Visual Borrowing Summary (No Fine Print Trap)] ──► [One-Touch Voice Confirmation]
```

### Step-by-Step Breakdown:
1. **Vernacular Switch:** Arrives at the site; toggles language pill to **"தமிழ்" (Tamil)**. Typography instantly adapts with clear, legible native script and larger font sizes.
2. **Audio Companion:** An optional floating audio speaker button plays a clear, reassuring native audio explanation: *"வணக்கம். உங்கள் வணிகத்திற்கான கடன் பெற 3 எளிய படிகள்..."* (Welcome. 3 simple steps to access credit for your enterprise...).
3. **Step-by-Step Cards:** Instead of overwhelming multi-input grids, each input is presented in a generous card with single focused questions (e.g., "Enter your 10-digit mobile number").
4. **Icon-Driven Bank Selection:** Large recognizable bank logos with dual-script names (SBI, Indian Bank, Canara Bank).
5. **Crystal-Clear Financial Terms:** Instead of complex interest amortization tables, the screen shows a simple visual balance:
   - Green Bag: You Receive **₹75,000** today.
   - White Box: You Pay **₹2,650** every week for 30 weeks. Total paid: **₹79,500**.
   - Clear badge: "No extra charges. No property paper needed."
6. **Reassuring Completion:** Application submitted with green checkmark confirmation and SMS notification in Tamil.

---

## Journey 4: Lender — Credit Officer (Vikram, Pragati FinServe)

```
[Lender Pipeline Dashboard] ──► [Filter by Risk Tier & Sector] ──► [Select Applicant]
                                                                            │
┌───────────────────────────────────────────────────────────────────────────┘
▼
[Applicant Overview & Verification Radar] ──► [Multi-Stream Triangulation Analysis]
                                                            │
┌───────────────────────────────────────────────────────────┘
▼
[Inspect Anomaly Heatmap (Loop/Fraud Check)] ──► [SHAP Feature Weight Inspection]
                                                            │
┌───────────────────────────────────────────────────────────┘
▼
[Action: Approve / Request Docs / Decline] ──► [Auto-Generate Sanction Note]
```

### Step-by-Step Breakdown:
1. **Pipeline Radar:** Vikram logs into the Lender Underwriting Cockpit. The top stats ribbon shows: 42 Pending Reviews, 14 Approved Today, ₹1.8 Cr Disbursed, Average TAT: 4.2 minutes.
2. **Triage & Priority Filtering:** Selects filter `Risk Tier: Moderate (Green/Amber)` and `Sector: Kirana & Retail`. Clicks on applicant **"Sri Balaji Provisions — Ramesh Kumar"**.
3. **Triangulation Radar:** Opens applicant profile. The automated triangulation engine compares three key data feeds side-by-side:
   - Bank Inflows (AA): ₹5,84,000/mo.
   - GST Declared Sales: ₹6,10,000/mo (95.7% congruence — healthy match).
   - UPI QR Velocity: 142 daily transactions averaging ₹140 ticket size.
4. **Fraud & Anomaly Inspection:** Checks the **Synthetic Transaction Detection Matrix**:
   - Circular Loops: **Zero detected** (no fund bouncing between related party accounts).
   - Weekend/Weekday Ratio: Normal retail pattern (35% higher on weekends).
   - High-Value Spike Risk: Low (no single outlier transaction > 5% of monthly volume).
5. **Explainable AI Deep-Dive:** Inspects the ACIE SHAP ribbon:
   - High positive drivers: Daily cash inflow regularity (+54), Low return/bounce rate (+38).
   - Moderate drag: Thin credit bureau history (-24) — offset by strong operational cash flow.
6. **Decisioning:** Vikram confirms the ₹1,50,000 loan recommendation at 14.2% APR. Enters underwriter note: *"Strong verified UPI cash flow; excellent customer diversification. Recommended for instant sanction."* Clicks **"Approve & Issue Sanction"**.

---

## Journey 5: Lender — Underwriting Manager (Ananya, Chief Risk Officer)

```
[Executive Risk Cockpit] ──► [Portfolio Vintage Analysis] ──► [Sector Exposure Breakdown]
                                                                        │
┌───────────────────────────────────────────────────────────────────────┘
▼
[SLA & Underwriter Throughput Tracker] ──► [Policy Rule Adjustment Simulation]
                                                        │
┌───────────────────────────────────────────────────────┘
▼
[High-Value Sanction Escalation Approval] ──► [Export RBI Regulatory Compliance Pack]
```

### Step-by-Step Breakdown:
1. **High-Level Governance:** Ananya reviews the overarching portfolio health: ₹45 Crore total live exposure across 3,400 micro-borrowers. Portfolio 30+ DPD delinquency is at an exceptional 1.4%.
2. **Vintage Analysis:** Inspects 30/60/90-day cohort default curves; verifies that flow-based sachet repayment loans have 42% lower default rates than traditional monthly EMI loans.
3. **Cluster Exposure Alert:** Notice a concentration alert in automotive ancillary suppliers in Pune due to a steel price fluctuation.
4. **Policy Calibration:** Modifies the credit risk threshold for new automotive ancillary applicants, raising the minimum Average Daily Minimum Balance (ADMB) covenant from ₹10,000 to ₹15,000 for that specific sub-sector.
5. **High-Ticket Escalation:** Reviews an escalated ₹15,00,000 loan request from a small food packaging enterprise; inspects the automated triangulation report and signs off on the sanction.
6. **Regulatory Export:** Downloads the monthly automated **RBI Fair Lending & Portfolio Asset Quality Report** in one click.

---

## Journey 6: Platform Administrator (Rajiv, System Operations)

```
[Admin Telemetry Dashboard] ──► [Monitor Connector Uptime & Latency]
                                              │
┌─────────────────────────────────────────────┘
▼
[Detect Degradation in External Rail (e.g. GSTN)] ──► [Toggle Fallback Circuit Breaker]
                                                                │
┌───────────────────────────────────────────────────────────────┘
▼
[Review Immutable Security Audit Logs] ──► [User & RBAC Access Management]
```

### Step-by-Step Breakdown:
1. **Health Check:** Rajiv monitors live platform vitals: API Gateway latency (142ms), Error Rate (0.02%), WebSocket connections (1,840 active).
2. **Third-Party Connector Radar:** Inspects external integrations:
   - Account Aggregator Gateway: 99.98% uptime, 1.2s avg response.
   - DigiLocker: 99.8% uptime.
   - GSTN Sandbox/Production API: Experiencing intermittent 504 timeouts.
3. **Operational Mitigation:** Temporarily activates the **Asynchronous GST Queue Fallback**: the borrower UI gently informs users that GST verification will occur in the background while onboarding proceeds without blocking.
4. **Security Audit Review:** Filters audit trail for failed login bursts or unauthorized role elevation attempts; verifies all access tokens comply with 15-minute rotation policies.

---

## Journey 7: Auditor / Algorithmic Fairness & ESG Reviewer (Dr. Sunita)

```
[Fairness & Ethics Console] ──► [Disparate Impact Ratio (DIR) Gauges]
                                              │
┌─────────────────────────────────────────────┘
▼
[Demographic Parity Analysis (Gender, Tier 1 vs Tier 3)] ──► [Consent Revocation Ledger]
                                                                        │
┌───────────────────────────────────────────────────────────────────────┘
▼
[Inspect Manual Override Log] ──► [Issue Algorithmic Fairness Compliance Certification]
```

### Step-by-Step Breakdown:
1. **Objective:** Verify that the ACIE automated underwriting models do not discriminate against protected classes or geographically marginalized enterprises.
2. **Four-Fifths (80%) Rule Compliance:** Reviews the Disparate Impact Ratio across demographics:
   - Female-led vs. Male-led enterprise approval ratio: **0.94** (Well above the 0.80 regulatory threshold; passed).
   - Tier-3 / Rural vs. Tier-1 Metropolitan approval ratio: **0.88** (Passed).
3. **Feature Fairness Audit:** Audits the model weight distribution to confirm that proxy attributes (e.g., zip code or phone hardware brand) are strictly excluded from the scoring model.
4. **DPDP Consent Ledger:** Verifies that 100% of borrower consent revocation requests logged in the past 30 days were executed with immediate cessation of data polling and complete purging of cached financial tokens.
5. **Certification Generation:** Stamps the system with an immutable **Algorithmic Fairness Compliance Certificate** for the quarter.
