# Quai Network Hackathon — Developer Resource Inventory

**Source Material**: Quai Network Hackathon — Developer Quick-Start & Resource Links (v11).pdf  
**Audit Timestamp**: 2026-11-20  
**Verification Level**: Cross-referenced with official Quai Network documentation and endpoints.

---

## 1. Hackathon Registration, Wallet & Official Guides

| Resource | Listed URL | Official / Current Status | Purpose & Developer Usage |
|---|---|---|---|
| **Hackathon Project Registration** | `https://www.quaisquad.com/` | Verified Official Portal | Official team registration, challenge submission, and milestone submission portal. |
| **Project Submission Guide** | `https://drive.google.com/drive/folders/1GXM3PC9bKTCxw5OHFr8qYuO1JVijTRTw` | Hosted Google Drive PDF | SpeedRun Hackathon #1 step-by-step submission criteria, video requirements, and repo submission guidelines. *(Requires Google authorization)* |
| **Quai Orchard Skill & Guide** | `https://drive.google.com/drive/folders/1nAcwPYx-HMp2Mx81z_ugzskVNNhfEBlb` | Hosted Google Drive Folder | AI coding agent skill ZIP (`SKILL.md` bundle) for automated Cyprus-1 contract scaffolding and RPC wiring. *(Requires Google authorization)* |
| **Pelagus Wallet** | `https://www.pelaguswallet.io/` | Verified Official (`pelaguswallet.io`) | Official open-source Chromium browser extension wallet for Quai Network; supports QUAI & Qi, EIP-1193 provider injection (`window.pelagus`), and multi-chain zone switching. |

---

## 2. x402 Work & Hashference (AI Inference & Micropayments)

| Resource | Listed URL | Verified Status | Technical Mechanism & Notes |
|---|---|---|---|
| **x402 Work Portal & Docs** | `https://x402.qu.ai` | Official Protocol Domain | HTTP 402 "Payment Required" specification adapted for Proof-of-Work (PoW). Client solves a lightweight hash puzzle (SHA-256d/RandomX/Scrypt) locally instead of paying fiat or requiring a funded crypto wallet. |
| **x402 Work Live Demo** | `https://x402.qu.ai/demo` | Official Interactive Demo | Interactive browser proof-of-work demonstration ('Reveal the image behind this 402' in ~2s client hashing). |
| **x402 Work Agent Spec** | `https://x402.qu.ai/llms.txt` | Standardized Agent Spec | Markdown specification for autonomous AI agents (Claude Code, Cursor, Cline) detailing HTTP 402 header handshakes and work submission. |
| **Hashference AI Gateway** | `https://hashference.com` | Official Gateway Platform | Unified inference API for 45+ frontier LLMs (Claude, GPT, Llama, DeepSeek) with zero KYC, OpenAI/Anthropic-compatible endpoints. |
| **Hashference Zero-Key Test** | `https://hashference.com/zero-key` | Interactive Testbench | Allows browser-based testing of AI model prompts paid via a 2-second x402 PoW hashing challenge without an API key or credit card. |
| **Hashference Agent Spec** | `https://hashference.com/llms.txt` | Standardized Agent Spec | Machine-readable specification for AI coding agents and local Model Context Protocol (MCP) server setup. |
| **Mine AI Credits Walkthrough**| `https://youtu.be/-VTuu8CdYVQ` | Official YouTube Tutorial | Step-by-step video guide explaining how to mine non-KYC compute tokens to fund Hashference gateway usage. |

---

## 3. Quai Network Core & Cyprus-1 Setup

| Resource | Listed Endpoint / URL | Official Verification | Configuration Specification |
|---|---|---|---|
| **Developer Documentation** | `https://docs.qu.ai` | Verified Primary Docs | Architecture guides, Solidity compatibility, RPC namespaces, and sharded address conventions. |
| **Quai Docs Agent Spec** | `https://docs.qu.ai/llms.txt` | Verified Agent Spec | Full machine-readable documentation index optimized for coding assistants. |
| **Orchard Testnet Faucet** | `https://orchard.faucet.quai.network` | Verified Testnet Faucet | Web faucet dispensing testnet QUAI on Cyprus-1 for gas fees and contract deployment. |
| **Quaidrop Testnet Faucet** | `https://testnet.quaidrop.xyz/7263` | Community/Hackathon Faucet | Backup faucet for hackathon developer address funding. |
| **Orchard Testnet Explorer** | `https://orchard.quaiscan.io` | Verified Block Explorer | Official block and transaction explorer for the Orchard Testnet (Cyprus-1). |
| **Orchard Testnet RPC (Cyprus 1)**| `https://orchard.rpc.quai.network/cyprus1` | Active RPC (Chain ID: `15000`) | JSON-RPC HTTP endpoint targeting Cyprus-1 zone (`[0 0]`), Chain ID `15000` (CAIP-2 `quai:15000`). |
| **Quai Mainnet Explorer** | `https://explorer.qu.ai` / `https://quaiscan.io` | Official Mainnet Explorer | Block explorer for live Quai Mainnet transactions and blocks. |
| **Quai Mainnet RPC (Cyprus 1)** | `https://rpc.quai.network/cyprus1` | Active RPC (Chain ID: `9`) | Mainnet JSON-RPC endpoint targeting Cyprus-1 zone, Chain ID `9`. |

---

## 4. Google Docs Source Assessment

- **Document URL**: `https://docs.google.com/document/d/1ypxFr6NvVs0VuDkZ2pQQvTusW_eTaPwq2az9U258oj4/edit?usp=drivesdk`
- **Access Status**: Gated / Access Restricted. Google Docs requires Google account sign-in and explicit document view permissions.
- **Protocol Action Taken**: Documented accurately as unavailable without interactive authentication. All technical specifications have been grounded directly in the v11 Developer Quick-Start PDF and official live Quai Network documentation.
