# UDYOGA: Regulatory, Institutional & Technical Research References

**Project:** UDYOGA – Beyond Credit. Beyond Barriers.  
**Track:** The Big Hack 2.0 — Finance Track (F2: Credit for the Credit-Invisible)  
**Author:** Senior FinTech Product Researcher & Strategist  
**Repository Branch:** `feature/phase-1-research`

---

## 1. Regulatory Frameworks & Official Committee Reports

1. **Reserve Bank of India (RBI) — Report of the Expert Committee on MSMEs (U.K. Sinha Committee)**  
   *Title:* Comprehensive Strategy for MSME Development and Credit Deepening  
   *Publication Date:* June 2019  
   *Key Takeaway:* Identified the structural ₹25+ lakh crore MSME debt financing gap; recommended transitioning from asset-backed underwriting to cash-flow-based lending leveraging GSTN, TReDS, and Account Aggregators.  
   *Citation:* RBI Central Office, Department of Banking Operations and Development (DBOD).

2. **Reserve Bank of India (RBI) — Guidelines on Digital Lending (DLG)**  
   *Circular No.:* RBI/2022-23/111 DOR.CRE.REC.66/21.07.001/2022-23  
   *Effective Date:* September 02, 2022  
   *Key Directives:*
   - All loan disbursals and repayments must execute directly between the borrower's bank account and the Regulated Entity (RE), bypassing intermediary pool accounts.
   - Mandatory Key Fact Statement (KFS) provided to borrower upfront detailing all-inclusive APR, penal charges, and recovery procedures.
   - Strict constraints on data access: Prohibition on accessing smartphone contacts, file storage, and media; clear consent logging for any telemetry used.
   - Mandatory cooling-off / look-up period allowing borrowers to exit digital loans without penalty.

3. **Reserve Bank of India (RBI) — Master Direction on Account Aggregator (AA) Directions, 2016 (Updated)**  
   *Circular No.:* RBI/DNBR/2016-17/45 Master Direction DNBR.PD.008/03.10.119/2016-17  
   *Key Directives:* Governs the transfer of financial asset data from Financial Information Providers (FIPs) to Financial Information Users (FIUs) with tamper-proof end-to-end encryption and cryptographically signed user consent artifacts.

4. **Ministry of Law and Justice, Government of India — The Digital Personal Data Protection Act, 2023 (DPDP Act)**  
   *Legislation:* Act No. 22 of 2023  
   *Date of Enactment:* August 11, 2023  
   *Key Directives:*
   - Notice and consent: Data fiduciaries must present notices in clear, accessible plain language detailing the specific purpose of processing.
   - Right to withdraw consent: Borrowers possess an absolute statutory right to revoke data consent at any point with instant cessation of processing.
   - Purpose limitation and data minimization: Lenders cannot collect alternative data beyond what is strictly necessary to perform credit assessment.

---

## 2. Digital Public Infrastructure (India Stack) Standards

5. **Sahamati — Account Aggregator Ecosystem Architecture & Consent Specification**  
   *Standard:* ReBIT (Reserve Bank Information Technology Pvt. Ltd.) Technical Specifications for AA  
   *Components:*
   - FIP/FIU API Schemas for Banking, Deposit Accounts, and Recurring Mutual Fund/Securities Cash Flow.
   - Consent Artifact Structure: Defines `consentMode` (VIEW/STORE/QUERY), `fetchType` (ONETIME/PERIODIC), frequency, and cryptographic signature validation.

6. **iSPIRT — Open Credit Enablement Network (OCEN 4.0 Specification)**  
   *Standard:* Protocol for cash-flow lending connecting Loan Service Providers (LSPs) and Digital Lenders.  
   *Key Pillars:* Micro-loans (sachet loans), daily sweep repayments via e-NACH/UPI AutoPay, and standardized underwriting APIs.

7. **Goods and Services Tax Network (GSTN) — Invoice Data & Return APIs**  
   *API Standards:* GSTR-1 (Outward Supplies), GSTR-3B (Summary Return), and e-Way Bill movement authentication protocols for business-to-business transaction verification.

8. **National Payments Corporation of India (NPCI) — UPI Merchant & AutoPay Standards**  
   *Specifications:*
   - Dynamic & Static UPI QR specification for merchant collections.
   - UPI AutoPay 2.0 framework for automated recurring sweeps with customer-defined frequency and upper-bound debits.

---

## 3. Global & Academic Foundations in Credit Modeling & Explainable AI (XAI)

9. **Lundberg, S. M., & Lee, S.-I. (2017) — A Unified Approach to Interpreting Model Predictions (SHAP)**  
   *Conference:* Advances in Neural Information Processing Systems (NeurIPS 2017), 30, 4765–4774.  
   *Relevance to UDYOGA:* Provides the mathematical backbone for computing feature contribution weights (Shapley values) for each alternative credit signal, powering the visual explainability ribbon in the UI.

10. **Wachter, S., Mittelstadt, B., & Russell, C. (2017) — Counterfactual Explanations Without Opening the Black Box: Automated Decisions and the GDPR**  
    *Journal:* Harvard Journal of Law & Technology, 31(2), 841–887.  
    *Relevance to UDYOGA:* Conceptual foundation for the **"What-If" Credit Simulator**, ensuring applicants receive actionable, deterministic paths to qualify for credit rather than static binary rejections.

11. **Barocas, S., Hardt, M., & Narayanan, A. (2023) — Fairness and Machine Learning: Limitations and Opportunities**  
    *Publisher:* MIT Press.  
    *Relevance to UDYOGA:* Formulates the quantitative definitions of **Disparate Impact Ratio**, **Demographic Parity**, and **Equalized Opportunity** implemented in UDYOGA's Algorithmic Fairness & Bias Console to prevent historical discrimination against credit-invisible micro-enterprises.

12. **International Finance Corporation (IFC) / World Bank Group (2018) — Financing India's MSMEs: Estimation of Debt Requirement of MSME Sector**  
    *Report ID:* IFC-WBG-IND-MSME-2018  
    *Relevance:* Established the quantitative empirical baseline for the ₹25–30 Lakh Crore addressable market opportunity in informal enterprise lending.
