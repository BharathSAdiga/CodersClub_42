# Quai Network Hackathon: Complete Winning Guide & Submission Pack

**Project**: UDYOGA – Beyond Credit. Beyond Barriers.  
**Track**: Quai Network Hackathon / SpeedRun #1  
**Hackathon Portal**: [quaisquad.com](https://www.quaisquad.com/)  
**Submission Folder**: [Google Drive Submission Guide Reference](https://drive.google.com/drive/folders/1GXM3PC9bKTCxw5OHFr8qYuO1JVijTRTw)  

---

## 1. What Makes UDYOGA a Winning Quai Project

Judges at Quai hackathons look for three things:
1. **Real-World Value**: Not another toy DEX or meme coin, but a genuine economic problem solved. UDYOGA addresses India's **₹25 Lakh Crore MSME credit gap** for 63 million credit-invisible Kirana stores and artisans.
2. **Authentic Quai Architecture**: Leveraging Quai's **Cyprus-1 zone** (Chain ID `15000` on Orchard, `9` on Mainnet) for high-throughput, low-fee audit anchors and **x402 Work** (HTTP 402 proof-of-work micro-payments).
3. **Flawless User Experience**: Borrowers never touch crypto or pay gas fees. Institutional lenders and auditors get cryptographic certainty on QuaiScan.

---

## 2. The 3 Quai Technologies Deployed in UDYOGA

### Technology 1: Quai Orchard Cyprus-1 Audit Anchor
- **Smart Contract**: `backend/contracts/UdyogaAuditAnchor.sol`
- **Network**: Quai Orchard Testnet (Zone: `Cyprus-1`, Chain ID: `15000`)
- **RPC Endpoint**: `https://orchard.rpc.quai.network/cyprus1`
- **Explorer**: `https://orchard.quaiscan.io`
- **Contract Address (Live Demo Anchor)**: `0x0027fB89a42E86358897E973E7eDe3C6B9e32a68`
- **Role in UDYOGA**: When our Alternative Credit Intelligence Engine (ACIE) generates a credit vitality score (0–900), the backend computes a canonical SHA-256 hash:
  $$\text{digest} = \text{SHA-256}(\text{appId} + \text{score} + \text{band} + \text{drivers} + \text{salt})$$
  This digest is permanently anchored on Cyprus-1. Any tampering with borrower data invalidates the hash. Zero PII is stored on-chain, preserving India's DPDP Act 2023 compliance.

### Technology 2: Pelagus Wallet Integration (EIP-1193)
- **Official Extension**: [pelaguswallet.io](https://www.pelaguswallet.io/)
- **Provider**: `window.pelagus`
- **Role in UDYOGA**: Institutional Underwriters and Bank Risk Officers use Pelagus to sign loan sanctions and underwrite covenants directly from the Underwriting Workbench.

### Technology 3: x402 Work (Anti-Scraping / AI Gateway Integration)
- **Protocol**: HTTP 402 "Payment Required" with Proof-of-Work (`x402.qu.ai`)
- **Role in UDYOGA**: Protects the public Credit Bureau Inquiry API from bot scraping. Instead of requiring credit cards or API keys, callers compute a 2-second SHA-256d client hash to unlock credit intelligence.

---

## 3. Step-by-Step Hackathon Checklist (Zero Confusion)

### Step 1: Wallet Setup
1. Install **Pelagus Wallet** in Chrome from [pelaguswallet.io](https://www.pelaguswallet.io/).
2. Select **Orchard Testnet** $\rightarrow$ **Cyprus-1** (Zone 0-0).
3. Copy your address (starts with `0x00...`).

### Step 2: Claim Testnet QUAI
1. Visit [orchard.faucet.quai.network](https://orchard.faucet.quai.network) or [testnet.quaidrop.xyz/7263](https://testnet.quaidrop.xyz/7263).
2. Paste your `0x00...` address and click **Request Funds**.
3. You will receive free testnet QUAI in 15 seconds.

### Step 3: Run the UDYOGA Demo
1. Run `cd frontend && npm run dev`
2. Open `http://localhost:5173`
3. Click **"Lender Underwriting Desk"** $\rightarrow$ select application `APP-2026-0891` (Ramesh Kumar - Sri Balaji Provisions).
4. See the **Quai Network Trust Anchor Banner** live at the top of the workbench:
   - Cyprus-1 Chain ID: `15000`
   - Real-time SHA-256 Digest
   - Quai Transaction Hash
   - One-click deep link to **QuaiScan Block Explorer**
   - Click **"Connect Pelagus"** to demonstrate live wallet connection.

---

## 4. 3-Minute Hackathon Pitch Script (Word-for-Word)

> *"Judges, 80% of India's 63 million small businesses operate without real estate collateral. When they apply for loans, banks reject them, and predatory moneylenders exploit them at 60% APR.*
>
> *UDYOGA replaces land collateral with real-time cash flow intelligence using India's digital public infrastructure.*
>
> *The biggest question banks ask us is: **'How do we know the borrower's digital cash-flow data wasn't manipulated post-rejection?'***
>
> *We solved this using **Quai Network**.*
>
> *Every time our AI assesses a business, we generate a canonical cryptographic fingerprint of the decision and anchor it onto **Quai Cyprus-1 (Chain ID 15000)**.*
>
> *This provides immutable proof on QuaiScan without placing a single byte of sensitive borrower personal data on-chain. It is 100% compliant with India's DPDP Privacy Act and gives institutional lenders mathematical trust in micro-enterprise lending.*
>
> *Beyond Credit. Beyond Barriers. Thank you."*

---

## 5. Submission Checklist for quaisquad.com

- [x] **Project Name**: UDYOGA – Beyond Credit. Beyond Barriers
- [x] **Category / Track**: SpeedRun #1 / Finance & DPI
- [x] **Smart Contract**: `backend/contracts/UdyogaAuditAnchor.sol` (Solidity 0.8.20 on Cyprus-1)
- [x] **GitHub Repository**: `https://github.com/BharathSAdiga/CodersClub_42`
- [x] **Quai Testnet Zone**: Cyprus-1 (Chain ID 15000)
- [x] **Block Explorer Links**: Configured for `https://orchard.quaiscan.io`
- [x] **Wallet Support**: Pelagus Wallet integration via `window.pelagus`
