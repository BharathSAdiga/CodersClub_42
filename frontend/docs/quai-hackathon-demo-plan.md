# UDYOGA & Quai Network — Hackathon Demonstration & Presentation Script

## 1. Hackathon Narrative & Pitch Angle

### The Problem
"In India, 63 million MSMEs face a \$300B credit deficit because traditional banks evaluate property deeds rather than cash flow. When alternative credit intelligence platforms evaluate small merchants using digital public rails, institutional lenders and secondary debt syndicators ask: **How do we know the borrower's cash-flow assessment and underwriting terms haven't been tampered with or retrospectively forged?**"

### The Quai Network Solution
"UDYOGA combines India Stack's digital public infrastructure with **Quai Network's energy-based, high-throughput Cyprus-1 zone**. We maintain zero borrower friction for rural kirana stores, while cryptographically anchoring every assessment digest, human underwriting haircut, and DPDP consent revocation on the Quai Orchard testnet for less than a tenth of a cent."

---

## 2. 3-Minute Live Hackathon Demonstration Flow

### Minute 1: The Frictionless Borrower Flow (Web2)
1. **Action**: Open the UDYOGA Borrower Portal as **Ramesh Kumar (Kirana store owner)**.
2. **Showcase**:
   - Ramesh logs in with phone OTP.
   - He connects his Account Aggregator (AA) and merchant UPI QR stream in 3 clicks.
   - He submits his working capital application for ₹1,50,000.
3. **Judge Takeaway**: "Notice that Ramesh never touched a crypto wallet, never paid gas fees, and never had his PII exposed. The user experience is 100% familiar to an Indian small business owner."

### Minute 2: ACIE Intelligence & Quai Cryptographic Anchoring
1. **Action**: Transition to the **Lender Underwriting Workbench** as **Vikram Deshmukh (Credit Officer, Pragati FinServe NBFC)**.
2. **Showcase**:
   - The 3-Way Triangulation Radar reconciles Bank AA (₹5.84L), GST (₹6.10L), and UPI (₹5.12L) with 95.8% congruence.
   - ACIE generates a 768/900 Vitality Score with visual SHAP ribbons.
   - Point to the **Quai Cyprus-1 Live Anchor Card**:
     - *State*: "EVALUATED & CRYPTOGRAPHICALLY ANCHORED"
     - *Block*: #49,120
     - *Digest*: `0x7f9a84b2e811c09930f7e...`
3. **Action**: Click the **"Inspect on QuaiScan"** button, opening `orchard.quaiscan.io` in real time to show the verified contract event.
4. **Judge Takeaway**: "The exact mathematical features of this loan assessment are now immutably sealed on Quai Cyprus-1. Neither the lender nor the borrower can retrospectively alter the terms."

### Minute 3: Independent Auditor Verification & Pelagus Signing
1. **Action**: Switch persona to **Dr. Sunita Rao (`ETHICS_AUDITOR`)**.
2. **Showcase**:
   - Open the **Algorithmic Fairness & Audit Console**.
   - Show the 80% Rule Adverse Impact dial (0.91 ratio).
   - Show the SHA-256 Merkle root and verified Quai Cyprus-1 transaction receipts.
   - Demonstrate optional Pelagus Wallet connection (`window.pelagus`) for signing regulatory attestations.
3. **Conclusion**: "By pairing India's DPI with Quai Network's low-fee sharded execution, UDYOGA proves that credit inclusion and institutional auditability can coexist seamlessly."

---

## 3. Submission Checklist for Hackathon Evaluators

- [x] **Smart Contract Source Code**: Cleanly organized in `backend/contracts/UdyogaAuditAnchor.sol`.
- [x] **Deployment Evidence**: Deployed to Quai Orchard Testnet (`Cyprus-1`, Chain ID `15000`).
- [x] **Live Contract Address**: Provided with direct `orchard.quaiscan.io` URL.
- [x] **Verified Transaction Hashes**: Documented for sample evaluation, sanction, and consent revocation events.
- [x] **Architecture Diagram**: End-to-end Mermaid diagram showing frontend, backend boundaries, and Quai Cyprus-1 settlement.
- [x] **Demo Video Recording**: 3-minute video covering the borrower, lender, and QuaiScan verification flow.
