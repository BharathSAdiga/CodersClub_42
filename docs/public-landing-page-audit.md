# UDYOGA Public Landing Page: UX, Copy & Functionality Audit

**Date:** November 21, 2026  
**Auditor:** Senior FinTech Product Designer, UX Writer & Frontend Engineer  
**Scope:** UDYOGA Public Marketing & Conversion Surface (`http://localhost:5173/`)

---

## 1. Executive Summary & Design Principles

UDYOGA is an institutional-grade, cash-flow evaluation platform designed for the Indian MSME credit ecosystem. The objective of this comprehensive audit and refinement is to:
1. **Preserve 100% of the visual identity and animations:** Retain the signature brand palette (Forest Green `#173F35`, Warm Ivory `#F7F4EC`, Editorial Charcoal `#1A1A1A`, Terracotta `#C96B4B`), typography, staggered parallax motion, and waveform animations.
2. **Eliminate AI-Generated Buzzwords & Overpromising Hype:** Replace robotic jargon (e.g., *"Institutional Credit Vitality Model Output"*, *"Freedom from Exploitative Debt"*, *"Unprecedented Flow Visibility"*, *"No black boxes. Mathematical transparency."*) with natural, professional, and accessible fintech language.
3. **Establish Functional Integrity:** Ensure that every CTA, slider, interactive widget button, navigation anchor, and footer link executes real routing, launches modals, or triggers validated state changes with zero dead buttons.
4. **Clarify Financial Claims & Disclaimers:** Accurately distinguish illustrative interactive simulations from formal credit sanctions, emphasizing that credit decisions are made by regulated partner banks and NBFCs.

---

## 2. Comprehensive Inventory of Copy Rewrites

| Section / Component | Previous AI-Sounding / Complex Copy | Rewritten Professional & Human Copy | Rationale & User Benefit |
|---|---|---|---|
| **Hero Heading & Subtitle** | *"Beyond credit. Beyond barriers. Empowering India's credit-invisible micro and small enterprises through verifiable cash-flow intelligence..."* | *"Financial visibility for growing Indian businesses. Turn your real daily sales and transaction history into verified credit eligibility—without physical property collateral."* | Clarifies immediately what UDYOGA does for small businesses without abstract startup slogans. |
| **Hero CTA Buttons** | *"Check Credit Vitality"*, *"Lender Underwriting Desk"*, *"Fairness & Audit"* | *"Check Loan Eligibility"*, *"Lender Underwriting Desk"*, *"Fair Lending & Governance"* | Plain-English button labels that clearly communicate where the user will be taken. |
| **Split Waveform Hero** | *"Institutional Credit Vitality Model Output"*, *"ACIE Vitality 742"*, *"Zero Collateral"* | *"Your Business Financial Overview"*, *"Sample Credit Vitality: 742 / 900"*, *"No Property Pledged"* | Clarifies that the score and terms are illustrative samples based on daily UPI velocity. |
| **Moving Stats Ticker** | *"0 Bias · Disparate Impact = 0"*, *"Verifiable Flow-Based Underwriting"*, *"Pure Cashflow"* | *"DIR > 0.80 · Monitored Parity"*, *"Loan assessments based on actual business transactions"*, *"Cash-Flow Based"* | Removes unrealistic absolute claims ("0 Bias") and replaces them with measurable statutory fair-lending metrics. |
| **Sticky Storyteller (Step 3)** | *"Institutional Credit Vitality Model Output"*, *"Freedom from Exploitative Debt"* | *"Your Business Financial Overview"*, *"Clearer access to suitable business finance"* | Directly addresses the exact design prompt guidelines, making algorithmic scoring understandable. |
| **Problem & Solution** | *"The Credit-Invisible Paradox"*, *"Predatory 36%–120% APR from Informal Lenders"* | *"The Credit Challenge for Small Businesses"*, *"High-cost informal debt with steep penalties"* | Respectful, factual framing of the collateral deficit faced by 85% of Indian micro-merchants. |
| **How It Works** | *"From thin-file anonymity to institutional capital in under 5 minutes, backed by India's digital public infrastructure."* | *"How UDYOGA works in four straightforward steps: Connect & Verify $\rightarrow$ Cash-Flow Assessment $\rightarrow$ Underwriter Review $\rightarrow$ Manageable Repayments."* | Sets realistic expectations: data linking is instant, but credit review involves human-in-the-loop underwriting. |
| **Explainable AI (ACIE)** | *"No black boxes. Mathematical transparency. Every loan assessment ... is backed by visual Shapley additive explanations (SHAP)..."* | *"Understand how your financial information is assessed. Understand what factors supported the evaluation, what held it back, and how to improve eligibility."* | Translates theoretical computer science terms into actionable guidance for merchants. |
| **Benefits (Borrowers)** | *"Freedom from Exploitative Debt"*, *"Instant Disbursal: Sanction decisions in under 5 minutes"* | *"Clearer access to suitable business finance"*, *"Fast Assessment: Clear evaluation in minutes; funds transferred directly to your bank account."* | Grounded and credible; avoids promising instant disbursal before lender review. |
| **Benefits (Lenders)** | *"Unprecedented Flow Visibility"*, *"Underwriters maintain sovereign control"* | *"Understand how money moves through your business"*, *"Full Underwriter Control: Officers retain final authority to calibrate loan terms."* | Professional enterprise framing for credit risk committees. |
| **Trust & Compliance** | *"Regulatory Integrity"*, *"Built strictly compliant with RBI & DPDP standards."* | *"Security & Regulatory Compliance"*, *"Designed in line with RBI Guidelines and DPDP Privacy Standards."* | Regulatory precision adhering to Digital Lending Guidelines (DLG). |
| **FAQ Section** | Jargon-heavy bureau explanations and absolute guarantees. | Plain-language questions addressing collateral, credit scores, data revocation, and lender sanction authority. | Directly answers user concerns without confusing acronyms. |

---

## 3. Interactive Component & Button Action Audit

| Button / Element | Location | Previous Behaviour | Verified & Connected Behaviour |
|---|---|---|---|
| **Sign In / Demo** | `Navbar.tsx` | Non-functional (onClick handler missing in parent `App.tsx`) | Connected to `setIsAuthModalOpen(true)`: opens the one-click persona and credentials login dialog. |
| **Apply for Credit** | `Navbar.tsx` | Navigated to borrower apply | Routes directly to `/borrower/apply` onboarding pipeline. |
| **Section Anchor Links** | `Navbar.tsx` | Some links had jerky jumps or missing target IDs | Standardized to smooth-scrolling `handleScrollTo` targeting verified section DOM IDs. |
| **Check Loan Eligibility (Primary CTA)** | Hero Section | Navigated to apply | Preserved and streamlined into borrower onboarding flow. |
| **Lender Underwriting Desk (CTA)** | Hero Section | Switched app mode to lender | Preserved: opens the live underwriter pipeline and workbench. |
| **Fairness & Audit (CTA)** | Hero Section | Switched app mode to admin | Preserved: opens the algorithmic fairness and statutory governance console. |
| **Claim Line Button** | `SplitWaveformHero.tsx` | Non-functional (no onClick handler) | Connected: passes calibrated daily volume to borrower application view. |
| **Lock Calibration & Apply** | `LiveTunerWidget.tsx` | Non-functional (no onClick handler) | Connected: passes tuned amount (₹25k–₹5L) and tenor (30–180d) into the application pipeline. |
| **Experience Live Demo** | `PhoneSimulator.tsx` | Non-functional (no onClick handler) | Connected: opens `AuthModal` in demo mode with pre-seeded personas. |
| **Contact Support Form** | `ContactSection.tsx` | Mock alert without phone number validation | Validates 10-digit Indian phone number format, logs request, and displays realistic confirmation. |
| **Footer Navigation Links** | Footer | Anchor tags jumping to top or missing targets | Connected to smooth-scroll handlers for RBI, DPDP, and Account Aggregator sections. |

---

## 4. Financial Claims & Compliance Guardrails

1. **Collateral Claims:** Clarified that loans are evaluated on verified cash flows (UPI, Account Aggregator, and GST) rather than immovable property; removed misleading claims of "universal approval."
2. **Turnaround & Disbursal Timelines:** Distinguish between *automated assessment* (which runs in seconds) and *final loan disbursal* (which requires underwriter sanction and digital mandate authorization).
3. **Interest Rates & APRs:** All interest rates (14.2%–14.8% APR) are explicitly marked as *illustrative estimates* from partner NBFCs, with final rates determined by individual underwriting.
4. **Data Privacy (DPDP):** Emphasized that customer data is never accessed without explicit OTP consent, and can be revoked at any time via the Consent Management dashboard.
