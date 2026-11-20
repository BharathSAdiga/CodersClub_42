# Quai Network — Technology Deep-Dive & UDYOGA Relevance Analysis

## 1. Quai Network Core Architecture

### What It Is
Quai Network is an energy-based, Proof-of-Work sharded Layer-1 blockchain network. Unlike single-chain EVMs, Quai is organized hierarchically into **Prime, Region, and Zone chains** that run concurrent Proof-of-Work with merged mining:
- **Prime Chain**: Single chain with high difficulty, providing global settlement across the entire network.
- **Region Chains**: Intermediate chains nested under Prime (e.g. Cyprus).
- **Zone Chains**: High-throughput execution shards (e.g. `Cyprus-1`, `Cyprus-2`, `Cyprus-3`) where smart contracts execute and user accounts reside.

### EVM Compatibility & Tooling
- **EVM Execution**: Quai supports Solidity smart contracts (`solc`) with EVM opcode compatibility, but requires deployment to a specific Zone (such as Cyprus-1).
- **Protobuf Serialization**: Transactions use Google Protocol Buffers (Protobuf) instead of traditional Ethereum RLP encoding.
- **Provider API**: Quai web3 libraries (`quais.js` or standard EIP-1193 providers with Quai extensions) route JSON-RPC queries to zone endpoints.

### Relevance to UDYOGA
- **High Relevance for Immutability**: Provides an institutional, censorship-resistant anchor for credit audit trails and verifiable assessment proofs.
- **High Throughput / Low Fee**: Micro-lending applications in emerging markets cannot bear \$5–\$20 gas fees. Quai’s sharded design ensures negligible gas costs (&lt; \$0.001 per anchor) on Cyprus-1.

---

## 2. Orchard Testnet (Cyprus-1)

### What It Is
The primary developer testnet for Quai Network:
- **Zone Target**: `Cyprus-1` (Zone index `[0, 0]`)
- **RPC URL**: `https://orchard.rpc.quai.network/cyprus1`
- **Chain ID**: `15000` (Decimal) / `0x3a98` (Hex)
- **Explorer**: `https://orchard.quaiscan.io`
- **Faucet**: `https://orchard.faucet.quai.network`

### Relevance to UDYOGA
- **Immediate Relevance**: Perfect sandbox for deploying our tamper-evident credit audit contract (`UdyogaAuditAnchor.sol`) without risking real capital, providing live transaction hashes and explorer verification for hackathon judges.

---

## 3. Pelagus Wallet

### What It Is
An open-source browser extension wallet designed for Quai Network:
- Injects `window.pelagus` (standard EIP-1193 provider).
- Supports QUAI and Qi tokens, managing addresses across multiple Quai zones.

### Relevance to UDYOGA
- **Target Persona**: **Institutional Underwriting Officers (`LENDER_OFFICER`)** and **Independent Fairness Reviewers (`ETHICS_AUDITOR`)**.
- **Deliberate Exclusion**: **Do NOT impose Pelagus Wallet on MSME borrowers (Kirana owners, artisans).** Micro-merchants in India transact via phone numbers and UPI QR codes. Forcing them to install a crypto extension and manage seed phrases breaks the user experience. Instead, the borrower workflow remains 100% web2/India Stack, while the institutional lender/admin console connects Pelagus for cryptographic signing and audit ledger anchoring.

---

## 4. x402 Work (Proof-of-Work Micropayments)

### What It Is
An open protocol adapting HTTP status `402 Payment Required`:
- When a client hits an x402 endpoint without payment credentials, the server returns a 402 challenge header with a computational puzzle (e.g., finding a SHA-256d nonce with specific difficulty).
- The client CPU solves this in 1–3 seconds, re-attaches the solution in the `Authorization` or `Payment` header, and receives a `200 OK`.
- **Zero Account / Zero KYC / Zero Wallet**: Machine-to-machine micropayments without fiat payment gateways or crypto balances.

### Relevance to UDYOGA
- **High Value Use Case**: **Inter-Institutional Credit Inquiry Anti-Scraping / Pay-per-Call Bureau Inquiries**.
  - When non-consented third-party financial institutions or secondary NBFCs query the UDYOGA Alternative Credit Intelligence API for a business's aggregated risk vitality, requiring a 2-second x402 Work hash acts as a rate-limiting economic barrier against bulk data scraping without burdening legitimate underwriters.
- **Hackathon Status**: **Recommended as an optional/secondary demonstration**. The core loan lifecycle should not be gated by mining delays.

---

## 5. Hashference AI Gateway

### What It Is
A zero-KYC unified AI inference gateway for 45+ frontier models (Claude 3.5, GPT-4o, Llama 3.3, DeepSeek R1) payable via x402 Work or mined tokens.

### Critical Evaluation for UDYOGA & Team Boundaries
- **STRICT BOUNDARY**: Our teammate owns the Alternative Credit Intelligence Engine (ACIE) and ML risk scoring models.
- **PRIVACY REQUIREMENT**: Sending real MSME financial statements, GST filings, or bank data to external third-party cloud LLMs violates Indian DPDP Act 2023 regulations and data localization mandates.
- **Safe Evaluation**: Hashference **must NOT** replace ACIE or process raw financial data. However, it can be utilized in an isolated utility service for **Vernacular Borrower Financial Literacy & Counterfactual Advisory generation** (e.g., turning raw deterministic counterfactual deltas into conversational audio/text scripts in Hindi, Tamil, or Kannada) using anonymized parameters.
- **Hackathon Status**: **Optional secondary integration**.

---

## 6. Quai Orchard Deployment Skill Package

### What It Is
An agent skill bundle containing `SKILL.md` instructions, Cyprus-1 RPC configurations, and deployment helper scripts designed to guide AI coding assistants (such as Claude Code, Cursor, or Cline) in compiling and deploying Solidity contracts to Orchard Cyprus-1.

### Safe Usage Rules
- Inspect all scripts before execution.
- Maintain contract code in an isolated `backend/contracts` or `contracts/` directory without polluting or modifying the existing Vite React frontend build configuration.
