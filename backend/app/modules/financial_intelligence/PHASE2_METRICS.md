# UDYOGA — Financial Intelligence Engine: Phase 2 Financial DNA Metrics & Formulas Reference

**Module:** `backend/app/modules/financial_intelligence/dna_engine.py`  
**Author:** Harshitha, Financial Intelligence Engineer  
**Role:** Senior Python Backend Integration Engineer  
**Scope:** Phase 2 Financial DNA Metrics, Formulas, Classification Rules, Thresholds & Guardrails  

---

## 1. Overview & Architectural Principles

The Financial DNA Engine generates an evidence-grounded, multi-dimensional characterization of an MSME's financial behavior from raw bank statement transactions.

### Core Non-Negotiables
1. **Deterministic Arithmetic:** All calculations use arbitrary-precision Python `Decimal`. Floating-point drift is strictly prevented.
2. **Zero LLM Arithmetic:** Every metric, ratio, median, and concentration index is computed natively in Python. No language models are invoked for arithmetic.
3. **Missing Data vs Negative Evidence:** Unobserved documentation (e.g. absent customer IDs, sparse months) is never conflated with verified negative performance.
4. **Zero Fabrication:** The engine never hallucinates account balances, credit ratings, or future debt liabilities.

---

## 2. Dimension & Metric Catalog

### Dimension 1: Cash Flow Activity (`CashFlowActivitySection`)

Captures macro transactional velocity and liquidity movement:

| Metric Name | Formula / Logic | Unit | Data Sufficiency / Limitations |
| :--- | :--- | :---: | :--- |
| **Total Observed Credits** | $\sum \text{amount for direction} == \text{CREDIT}$ | INR | Sum of all incoming funds; includes non-sales credits. |
| **Total Observed Debits** | $\sum \text{amount for direction} == \text{DEBIT}$ | INR | Sum of all outgoing disbursements. |
| **Net Observed Cash Flow** | $\text{Total Observed Credits} - \text{Total Observed Debits}$ | INR | Not accounting profit or taxable income. |
| **Median Transaction Amount** | $\text{Median of sorted } [t.\text{amount} \text{ for } t \in \text{txns}]$ | INR | Exact median with average of 2 middles for even counts. |
| **Inflow-to-Outflow Ratio** | $\text{Total Credits} / \text{Total Debits}$ | Ratio | Ratio $\ge 1.0$ indicates net positive liquidity accumulation. If Debits $= 0$, returns $\infty$. |
| **Credit / Debit Counts** | Frequency counts of CREDIT and DEBIT transactions | Integer | Direct transaction volume metrics. |

---

### Dimension 2: Revenue Intelligence (`RevenueIntelligenceSection`)

Isolates verified commercial sales from general bank credits:

| Metric Name | Formula / Logic | Unit | Classification Rules & Thresholds |
| :--- | :--- | :---: | :--- |
| **Observed Business Revenue** | $\sum \text{amount for } (\text{CREDIT} \land \text{REVENUE})$ | INR | Isolates commercial turnover from proprietor loans/drawings. |
| **Non-Revenue Credit Total** | $\sum \text{amount for } (\text{CREDIT} \land \text{category} \ne \text{REVENUE})$ | INR | Captures owner capital injections, inter-account transfers, loan receipts. |
| **Monthly Categorized Revenue** | $\text{Map: } \{\text{"YYYY-MM"}: \sum \text{Revenue}\}$ | INR / Month | Calendar-month revenue accumulation. |
| **Weekly Categorized Revenue** | $\text{Map: } \{\text{"YYYY-Www"}: \sum \text{Revenue}\}$ | INR / Week | ISO 8601 calendar week format (`YYYY-Www`), consistent with cashflow series. |
| **Month-over-Month (MoM) Growth** | $[(\text{Rev}_m - \text{Rev}_{m-1}) / \text{Rev}_{m-1}] \times 100$ | Percentage | Requires consecutive calendar months. If $\text{Rev}_{m-1} \le 0$, emits `None`. |
| **Average Monthly Revenue** | $\text{Mean of observed monthly revenues}$ | INR | Reflects average verified monthly operational intake. |

---

### Dimension 3: Operating Expenses (`OperatingExpenseSection`)

Isolates day-to-day business OpEx from financing and non-operating transfers:

| Metric Name | Formula / Logic | Unit | Classification Rules & Thresholds |
| :--- | :--- | :---: | :--- |
| **Observed Operating Expenses** | $\sum \text{amount for } (\text{DEBIT} \land \text{category} \in \text{OPEX\_SET})$ | INR | $\text{OPEX\_SET} = \{\text{SUPPLIER\_PAYMENT}, \text{RENT}, \text{UTILITY}, \text{SALARY}\}$. |
| **Operating Cash Surplus Proxy** | $\text{Observed Revenue} - \text{Observed OpEx}$ | INR | Operating cash surplus proxy. Never presented as formal EBITDA or EBIT. |
| **Expense-to-Revenue Ratio** | $\text{Observed OpEx} / \text{Observed Revenue}$ | Ratio | If Revenue $= 0$, returns `None`. |
| **Category Distribution** | $\text{Map: } \{\text{category}: \sum \text{amount}\}$ | INR | Breakdown by supplier, rent, electricity/utility, and payroll. |
| **Recurring Operating Expenses**| $\sum \text{amount for } (\text{OpEx} \land \text{is\_recurring} == \text{True})$ | INR | Identifies contractual and predictable overhead. |

---

### Dimension 4: Debt Repayments (`DebtRepaymentSection`)

Tracks observable loan service behavior:

| Metric Name | Formula / Logic | Unit | Classification Rules & Disclosures |
| :--- | :--- | :---: | :--- |
| **Observed Debt Repayments** | $\sum \text{amount for } (\text{DEBIT} \land \text{LOAN\_REPAYMENT})$ | INR | Aggregation of observable term loan and working capital debt payments. |
| **Repayment Frequency Count** | Count of transactions with category `LOAN_REPAYMENT` | Integer | Observable repayment velocity. |
| **Disclosures & Limitations** | Strict statement boundary disclosures | Text | Explicitly notes that observed EMIs do NOT prove total outstanding loan obligations. |

---

### Dimension 5: Customer Concentration (`CustomerIntelligenceSection`)

Evaluates buyer reliance and revenue diversification:

| Metric Name | Mathematical Formula | Range | Interpretation & Risk Thresholds |
| :--- | :--- | :---: | :--- |
| **Customer HHI** | $\text{HHI} = \sum_{i=1}^{n} s_i^2 \text{ where } s_i = \frac{\text{Revenue}_i}{\text{Total Customer Revenue}}$ | $0.0 - 1.0$ | $< 0.15$: Diversified<br>$0.15 - 0.25$: Moderate Concentration<br>$> 0.25$: High Concentration |
| **Top-1 Customer Share** | $\max(s_i)$ | $0.0 - 1.0$ | Share of total customer revenue accounted for by the single largest client. |
| **Top-3 Customer Share** | $\sum_{i=1}^{\min(3, n)} s_{(i)}$ | $0.0 - 1.0$ | Cumulative revenue share of the 3 largest clients. |
| **Repeat Customer Count** | $\text{Count of customers with } \ge 2 \text{ revenue transactions}$ | Integer | Indicator of recurring business relationships. |
| **Unique Customer Count** | Distinct identifiable `counterparty_id` with revenue credits | Integer | Excludes unlabelled cash or over-the-counter sales. |

---

### Dimension 6: Supplier Concentration (`SupplierIntelligenceSection`)

Evaluates supply-chain reliance and single-source dependency risks:

| Metric Name | Mathematical Formula | Range | Interpretation & Risk Thresholds |
| :--- | :--- | :---: | :--- |
| **Supplier HHI** | $\text{HHI} = \sum_{j=1}^{m} w_j^2 \text{ where } w_j = \frac{\text{Spend}_j}{\text{Total Supplier Spend}}$ | $0.0 - 1.0$ | $< 0.20$: Diversified Vendor Base<br>$> 0.35$: High Single-Supplier Dependency |
| **Top-1 Supplier Share** | $\max(w_j)$ | $0.0 - 1.0$ | Largest vendor share of total procurement disbursements. |
| **Repeat Supplier Count** | $\text{Count of suppliers with } \ge 2 \text{ debit transactions}$ | Integer | Indicates recurring vendor and supply relationships. |

---

### Dimension 7: Financial Stability & Volatility (`FinancialStabilitySection`)

Evaluates operational stability and cash-flow predictability:

| Metric Name | Formula / Logic | Thresholds / Gates |
| :--- | :--- | :--- |
| **Monthly Revenue CV** | $\text{CV} = \sigma / \mu \text{ (Population StdDev / Mean)}$ | Requires $\ge 3$ active calendar months. If $< 3$, returns `None`. |
| **Weekly Revenue CV** | $\text{CV} = \sigma_{\text{week}} / \mu_{\text{week}}$ | Requires $\ge 4$ active ISO weeks. If $< 4$, returns `None`. |
| **Net Cash Flow Trend** | Linear slope direction across monthly series | `GROWING` ($>+2\%$), `STABLE` ($\pm 2\%$), `CONTRACTING` ($<-2\%$). |

---

## 3. Data Sufficiency Thresholds & Safety Rules

1. **Coefficient of Variation Gate:** Minimum 3 continuous calendar months for monthly CV; minimum 4 ISO weeks for weekly CV.
2. **Consecutive Month Verification:** Month-over-month growth requires consecutive months ($\text{month}_t == \text{month}_{t-1} + 1$). Non-consecutive intervals (e.g. March followed by May) emit `None` rather than skewed growth rates.
3. **Zero-Denominator Defense:**
   - Growth with zero previous-month revenue returns `None` (no `ZeroDivisionError`).
   - Expense-to-revenue ratio with zero revenue returns `None`.
   - Inflow-to-outflow ratio with zero debits returns `Decimal("Infinity")`.
4. **Paisa Precision Preservation:** Quantized to `Decimal("0.01")` using `ROUND_HALF_UP` at every metric boundary to ensure cross-module equality.
5. **ISO Week Synchronization:** Standardized on `f"{d.isocalendar().year}-W{d.isocalendar().week:02d}"` to guarantee byte-for-byte reconciliation with `cashflow_series.py`.

---

## 4. Responsible Finance & Regulatory Boundaries

- **Not a Credit Score:** Financial DNA metrics are factual aggregations of observed records. They do not constitute an official CIBIL/Experian credit score or a regulatory credit rating.
- **Single-Source Context:** Indicators are derived solely from the provided statement feeds. External unobserved bank accounts, cash in hand, or physical inventory are not factored into the assessment.
- **No Automatic Sanctions:** This module does not approve or reject loan applications. Its purpose is to deliver verifiable evidence to human underwriters and agent committees.
