# UDYOGA — Dashboard Usability & Understandability Audit
**Role:** Senior UX Architect & Enterprise FinTech Product Designer  
**Scope:** Lender Workbench, Administrator Cockpit, and Statutory Auditor Console  
**Document Status:** Approved Architecture Plan  
**Target Date:** Q4 2026  

---

## 1. Executive Summary & Core Diagnosis

The UDYOGA platform features sophisticated financial intelligence, including 3-way cash-flow triangulation (Account Aggregator, GSTN, UPI), explainable AI (SHAP-based ACIE scores), transaction graph loop detection, algorithmic fairness monitoring (Four-Fifths Rule), and Quai blockchain anchoring.

However, an enterprise usability evaluation reveals that **the existing presentation suffers from cognitive overload**:
1. **Raw Technical Density at Entry:** High-level overview dashboards present complex mathematical, statistical, and architectural metrics (e.g., *p99 latency*, *Dirichlet drift*, *DIR 0.947*, *CFADS*, *SHAP waterfall weights*) without immediate context, plain-English translation, or progressive disclosure.
2. **Missing Answering of the Three Foundational Questions:**
   - *What is happening?* (Current state obscured by acronyms)
   - *Why does it matter?* (Contextual impact not surfaced)
   - *What should I do next?* (Clear actionable triage guidance missing)
3. **Flat Information Hierarchy:** Critical decision signals (e.g., whether an applicant can afford daily repayment, whether a borrower needs verification) are visually competing with secondary statistical diagnostics.
4. **Jargon-Heavy Navigation & Tabs:** Underwriting views use engineering/data-science terminology (*Triangulation*, *ACIE Report*, *Forensics*) rather than lending workflow stages (*Overview*, *Financial Health*, *Transactions*, *Evidence*, *Loan Affordability*, *Stress Test*, *Decision*).

---

## 2. Detailed Usability Findings by Portal

### 2.1 Lender Portal (`/lender/*`)

#### A. Overview Dashboard (`LenderDashboard.tsx`)
* **Information Overload:**
  * Displays 4 KPI cards with terms like *Avg TAT*, *Disbursed Volume*, *Sanctioned Today* without intuitive context on *why* these numbers matter or what actions are required today.
  * Portfolio Risk Distribution lists 4 tiers with technical score brackets (*Tier 1: Prime Low Risk 700+*, *Tier 4: High Anomaly <550*) rather than clear action buckets.
* **Unclear Terminology & Missing Explanations:**
  * Terms like *e-NACH Mandates*, *SLA Urgent*, *Congruence Score* lack tooltips and plain-language definitions.
* **Workflow Deficiencies:**
  * Lenders need to immediately understand: *Which applications are ready for decision?*, *Which need more documents?*, *Which show warning signs?* The current triage list only shows raw numbers.

#### B. Application Pipeline Queue (`ApplicationPipeline.tsx`)
* **Confusing Filter Hierarchy:**
  * Generic status filters (*SANCTIONED*, *UNDERWRITING_REVIEW*, *DECLINED*) do not align with natural underwriting states:
    - *Ready for Review*
    - *More Information Needed*
    - *Requires Attention*
    - *Under Assessment*
    - *Decision Recorded*
* **Redundant / Abstract Badges:**
  * Risk tiers rely on abstract labels (*Moderate*, *Elevated*) without inline explanations of what evidence triggered that tier.

#### C. Applicant Detail Workbench (`ApplicantDetailWorkbench.tsx`)
* **Excessive Complexity in Primary View:**
  * The workbench organizes information into 5 engineering-oriented tabs (*TRIANGULATION*, *CASHFLOW*, *ACIE_REPORT*, *DOCS*, *DECISION*).
  * Lenders are immediately confronted with raw SVG transaction graphs, statistical SHAP waterfalls, and complex formula notations.
* **Jargon Deficiencies:**
  * Uses *CFADS* without explaining *Cash Available for Loan Repayment*.
  * Uses *DSCR Buffer* without explaining *Repayment Coverage Ratio*.
  * Uses *Evidence Confidence* without explaining *Reliability of Submitted Financial Information*.
  * Uses *Transaction Graph Forensics* without explaining *Transaction Relationship Analysis*.
* **Proposed Remediation:**
  * Restructure into 8 structured underwriting tabs:
    1. **Overview:** Executive summary, key decision indicators, quick applicant profile.
    2. **Financial Health:** Plain-language 5-metric overview (Revenue, Expenses, Net Cash Flow, Existing Obligations, Repayment Capacity).
    3. **Transactions:** Daily cash rhythm, UPI velocity, seasonal peaks, counterparty network.
    4. **Evidence & Documents:** 4-tier provenance verification with interactive document requests.
    5. **Loan Affordability:** Maximum safe daily/monthly repayment vs. proposed loan structures.
    6. **Stress Test:** Interactive macroeconomic shock simulator (revenue dip, cost inflation, payment delays).
    7. **Assessment Explanation:** Plain-English explanation of the credit evaluation, positive drivers, and drag factors.
    8. **Decision History:** Sanction notes, condition covenants, audit trail, and Quai blockchain verification.

---

### 2.2 Administrator Portal (`/admin/*`)

#### A. Admin System Overview (`AdminDashboard.tsx`)
* **Overwhelming Telemetry on Entry:**
  * Immediately shows *p99 Gateway Latency (142ms)*, *API mesh telemetry*, *DIR ratio* in the top KPI strip.
  * Technical infrastructure metrics obscure operational governance questions: *Is the system operating normally?*, *How many MSMEs and lenders are active?*, *Are there pending administrative approvals?*
* **Missing Plain-Language Translations:**
  * *Gateway Latency* $\rightarrow$ "System Response Speed (How quickly the platform responds)"
  * *Model Drift* $\rightarrow$ "Model Behaviour Stability (Whether scoring logic is shifting over time)"
  * *Data Quality* $\rightarrow$ "Data Completeness & Reliability (How consistent submitted records are)"
  * *Disparate Impact Ratio* $\rightarrow$ "Fair Lending Metric (Comparing approval equality across demographics)"
  * *Connector Health* $\rightarrow$ "External Integrations Status (Whether third-party government/banking rails are working)"
  * *RBAC* $\rightarrow$ "Role-Based Access Control (Who can view and edit which parts)"

#### B. User & RBAC Management (`UserManagementView.tsx`)
* **Technical Roles Exposed Unfiltered:**
  * Roles like `BORROWER_MICRO`, `LENDER_CREDIT_OFFICER`, `SUPER_ADMIN` shown as raw enums.
  * Missing clear explanations of what each role can see and execute.

#### C. Immutable Audit Logs (`AuditLogsView.tsx`)
* **Raw Technical Log Format:**
  * Displays JSON-like technical event traces rather than human-readable natural language event descriptions with progressive drill-downs.

---

### 2.3 Statutory Auditor Portal (`/admin/fairness`, `/admin/audit-logs`)

* **Algorithmic Fairness Presentation (`FairnessMonitoringView.tsx`):**
  * Displays single numeric values (e.g., *DIR: 0.947*) with a simple "Fully Compliant" badge.
  * **Critical Flaw:** The dashboard labels the system as unbiased simply because a single ratio is above 0.80.
  * **Required Structural Change:** Every fairness metric must explicitly answer:
    1. *What is being measured?*
    2. *What does the current result mean?*
    3. *Why should the administrator or auditor care?*
    4. *Does it require further investigation?*
    5. *Nuanced Fair Lending Disclaimer:* Clear disclosure that compliance with the 80% statistical threshold does not guarantee the complete absence of disparate impact.

---

## 3. Interaction & Information Architecture Principles

1. **Simple Information First. Advanced Information on Demand:**
   * Level 1: Plain-language summary card (Verdict, key metrics, status).
   * Level 2: Interactive breakdown with visual charts and indicators.
   * Level 3: Expandable technical detail drawers, tooltips, and raw formulas.
2. **Contextual Actionability:**
   * Every card with an anomaly or warning must present a **"Why this matters"** and a **"Recommended Next Step"**.
3. **No Unexplained Numbers:**
   * Every currency figure, ratio, and percentage has an explanatory sub-caption and tooltip.
4. **Preservation of Core Data:**
   * No backend data, formulas, or calculations will be modified or removed. All existing features remain 100% accessible.
