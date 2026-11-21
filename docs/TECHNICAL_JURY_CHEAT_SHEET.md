# UDYOGA — Technical Jury Cheat Sheet

This reference guide breaks down UDYOGA’s core technical and financial concepts into three precise formats:
1. **Plain Language (Simple Sentence):** What to say to a non-technical or business judge.
2. **Technical Architecture (Exact Sentence):** The mathematical or architectural formula to defend against an AI/quant judge.
3. **Indian MSME Example:** A concrete scenario grounded in small business reality.

---

## 1. The Seven Specialized Agents

### Agent 1: Financial Intelligence Agent (`FinancialIntelligenceAgent`)
* **Simple:** Analyzes raw bank and UPI transaction records to extract how money flows in and out of the business every day.
* **Technical:** Computes deterministic behavioral metrics including weekly inflow coefficient of variation ($CV = \sigma / \mu$), zero-inflow day percentages, weekend-to-weekday inflow ratios, and counterparty concentration metrics.
* **Indian MSME Example:** For Ramesh Kumar’s kirana store in Hubli, this agent measures that he processes 142 daily UPI transactions averaging ₹128 each, proving consistent footfall.

### Agent 2: Evidence Verification Agent (`EvidenceVerificationAgent`)
* **Simple:** Checks where data came from, ensuring uploaded documents are real and treating missing documents as neutral unknowns rather than bad credit.
* **Technical:** Classifies data streams across three provenance tiers (`USER_UPLOADED`, `SOURCE_LABELLED`, `INDEPENDENTLY_VERIFIED`), applies cross-source reconciliation, and updates an epistemic `evidence_confidence_score` (0–100%).
* **Indian MSME Example:** If a small brass casting artisan from Madurai has bank statements but no formal GST filings, this agent does not penalize him with a credit decline; it tags GST as an unassessed neutral indicator and scales down maximum loan exposure safely.

### Agent 3: Transaction Forensics Agent (`TransactionForensicsAgent`)
* **Simple:** Builds a visual web of who the business trades with to catch fake transactions, circular money transfers, and ghost billing.
* **Technical:** Constructs a directed graph in NetworkX ($G = (V, E)$), evaluates cycle loops, computes Shannon entropy on counterparty transaction distribution, and flags `HUMAN_REVIEW_RECOMMENDED` without hallucinating automated fraud verdicts.
* **Indian MSME Example:** For a textile trading firm in Surat, it catches that 34% of debit volume sent to two related entities returns within 48 hours without corresponding shipping e-way bills, pausing automated loan sanction.

### Agent 4: Business Vitality Agent (`BusinessVitalityAgent`)
* **Simple:** Evaluates how long the business has survived, its revenue growth trend, and whether it has seasonal spikes and dips.
* **Technical:** Analyzes operational vintage hurdles, month-over-month revenue stability, 30-day peak-to-trough seasonality index ($\frac{\text{Peak 30d Volume}}{\text{Trough 30d Volume}}$), and early-warning distress indicators.
* **Indian MSME Example:** For a handloom weaver in Varanasi with a 1.82x seasonality index, it identifies that low turnover in July is a normal monsoon slowdown, not a business default.

### Agent 5: Resilience Simulation Agent (`ResilienceSimulationAgent`)
* **Simple:** Acts as a crash test simulator for the business's bank balance, testing if it can survive sudden drops in sales or price hikes.
* **Technical:** Simulates 6 counterfactual stress presets (e.g., -15% demand shock, -30% trough, +15% OPEX surge, 30-day receivables delays), calculating post-shock DSCR, stressed burn rate, and remaining days of cash runway cushion.
* **Indian MSME Example:** For ArtisanKraft Studio in Jaipur, it tests whether the business can survive a 2-month 30% drop in textile demand, mathematically proving it retains 68 days of cash runway and a safe 1.84x stressed DSCR.

### Agent 6: Underwriting Policy & Affordability Engine (`UnderwritingAgent`)
* **Simple:** Calculates the exact, safe maximum loan amount the business can afford without ever getting trapped in debt.
* **Technical:** Applies statutory 50% FOIR (Fixed Obligation to Income Ratio) caps over unencumbered Cash Available for Debt Service (CFADS) and bounds loan principal ($P_{max}$) using compound interest present value discounting.
* **Indian MSME Example:** Even if Ramesh requests a ₹10 Lakh loan, this agent strictly caps his credit limit at ₹4,18,000 to ensure his daily repayment never exceeds ₹1,890.

### Agent 7: CAM Narrative & Explanation Agent (`ExplanationAndPassportAgent`)
* **Simple:** Writes the complete, bank-ready loan memo for loan officers, explaining all findings in plain English with a tamper-proof digital seal.
* **Technical:** Compiles the 5-section institutional Credit Appraisal Memo (CAM), generates counterfactual improvement pathways, computes a sequential SHA-256 state seal, and utilizes a 4.0-second timeout budget for LLM narrative synthesis with instant rule-based fallback.
* **Indian MSME Example:** Produces a 5-page credit memorandum for Pragati FinServe NBFC that allows a senior credit officer to sanction Priya Sharma's ₹5 Lakh line in under 4 minutes.

---

## 2. Core Financial & Risk Formulations

### CFADS (Cash Flow Available for Debt Service)
* **Simple:** The real net cash left over every month after paying for rent, inventory, utilities, and existing loan EMIs.
* **Technical:**
  $$\text{CFADS} = \text{Monthly Operating Inflows} - \text{Monthly Operating Expenses} - \text{Reconciled Debt Service Obligations}$$
* **Indian MSME Example:** A grocery store brings in ₹5,84,000 in monthly sales, spends ₹5,20,000 on stock and rent, and pays ₹8,500 on an existing motorcycle loan; its unencumbered CFADS is ₹55,500/month.

### DSCR (Debt Service Coverage Ratio)
* **Simple:** A safety multiplier showing how many times over the business’s operating cash flow can cover its debt payments.
* **Technical:**
  $$\text{DSCR} = \frac{\text{Net Operating Cash Surplus Pre-Debt}}{\text{Total Monthly Debt Service Obligations}}$$
* **Indian MSME Example:** If a shop has ₹60,000 in net monthly cash and total loan repayments of ₹30,000, its DSCR is 2.0x (healthy). If payments are ₹70,000, its DSCR is 0.85x (default risk).

### Maximum Affordable EMI
* **Simple:** The absolute highest monthly loan installment a business can safely pay under government and bank lending guidelines.
* **Technical:**
  $$\text{Max Affordable EMI} = \text{CFADS} \times \text{Regulatory FOIR Cap (50\%)}$$
* **Indian MSME Example:** With a monthly CFADS of ₹60,000 and a 50% FOIR cap, the maximum EMI the bank is legally and prudently allowed to sanction is ₹30,000/month.

### Safe Loan Principal ($P_{max}$)
* **Simple:** The maximum total loan amount that a borrower can pay off over their loan tenure without defaulting.
* **Technical:**
  $$P_{max} = \frac{\text{Max Affordable EMI} \times \left[(1 + r)^n - 1\right]}{r(1 + r)^n}$$
  where $r$ is the monthly interest rate ($\text{APR} / 12 / 100$) and $n$ is the tenor in months.
* **Indian MSME Example:** At an affordable EMI of ₹20,000/month, a 12-month tenure, and a 14% annual interest rate, the mathematically safe principal ceiling ($P_{max}$) is ₹2,22,800.

### Resilience Stress Testing
* **Simple:** Simulating real-world economic crises on the business's digital cash-flow model before approving a loan.
* **Technical:** Multi-scenario sensitivity analysis that models simultaneous revenue contraction ($\Delta R$), expense inflation ($\Delta E$), and working capital payment delays ($\Delta T_{rec}$):
  $$\text{Stressed Burn Rate} = (\text{Operating Inflows} \times (1 - \Delta R)) - (\text{Operating OPEX} \times (1 + \Delta E)) - \text{Debt Service}$$
* **Indian MSME Example:** Demonstrates that if a Jaipur handicraft artisan loses 30% of sales during an unseasonal monsoon slump, her daily sales still cover her ₹1,890 daily sweep.

### Evidence Provenance & Confidence
* **Simple:** Tracking whether financial data was directly fetched from official government APIs or manually uploaded as a PDF by the user.
* **Technical:** Cryptographic origin tagging that distinguishes `INDEPENDENTLY_VERIFIED` (Account Aggregator bank APIs, GSTN, DigiLocker) from `SOURCE_LABELLED` and `USER_UPLOADED` documents, computing an immutable confidence score without treating missing files as negative proof.
* **Indian MSME Example:** An account aggregator bank feed receives a 95% trust weight, whereas an uploaded bank statement PDF receives a 70% weight until cross-reconciled against UPI QR settlements.

### Granular Consent & Audit Trail (DPDP Act 2023)
* **Simple:** Borrowers have complete control over which financial feeds are accessed, with an instant one-click revoke button that immediately shuts off bank data sharing.
* **Technical:** Statutory data governance architecture implementing Purpose Limitation, Minimal Scope, explicit expiration timestamps, and real-time webhook-driven revocation logging.
* **Indian MSME Example:** Priya Sharma grants 90-day read access to her GST returns for loan underwriting, and can revoke bank statement polling with one click after loan sanction.

### Cryptographic Assessment Seal
* **Simple:** A tamper-evident digital fingerprint that locks the loan report so no one can secretly change interest rates or loan amounts later.
* **Technical:** Sequential SHA-256 state hashing over the canonical JSON serialization of the completed Credit Appraisal Memo, borrower identifiers, financial metrics, and approved covenants.
* **Indian MSME Example:** When Pragati FinServe sanctions a ₹5 Lakh loan for ArtisanKraft, the generated CAM is stamped with hash `a8f94d2e...` ensuring perfect audit fidelity during RBI regulatory inspections.
