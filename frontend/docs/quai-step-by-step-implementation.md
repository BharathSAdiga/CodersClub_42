# UDYOGA & Quai Network — Step-by-Step Implementation Roadmap

This document provides a beginner-friendly, actionable engineering roadmap for integrating Quai Network into the UDYOGA platform.

---

## Phase 0: Environment & Repository Baseline

### Objective
Ensure clean workspace separation between the existing React 18/TypeScript frontend and the newly introduced Quai contracts and web3 services.

### Directory Structure to Create
```
backend/
├── contracts/
│   ├── UdyogaAuditAnchor.sol      # Solidity tamper-evident state anchor
│   └── hardhat.config.cjs        # Quai Cyprus-1 compiler & network config
└── scripts/
    └── deploy.js                 # Deployment script targeting Orchard (Chain ID 15000)

frontend/
├── src/
│   ├── services/
│   │   └── quaiService.ts        # Browser RPC & Pelagus wallet connector
│   └── components/web3/
│       ├── QuaiAnchorBadge.tsx   # Verified on Quai Cyprus-1 UI pill
│       └── PelagusConnectBtn.tsx # Connect Pelagus button for lenders/auditors
```

---

## Phase 1: Quai Environment & Wallet Setup

### 1. Install Pelagus Wallet
1. Open Google Chrome or Brave.
2. Visit [pelaguswallet.io](https://www.pelaguswallet.io/) or the Chrome Web Store.
3. Install the **Pelagus** extension.
4. Create a new testnet wallet and store your 12-word seed phrase safely (never commit it to git).
5. Switch the active network to **Orchard Testnet** (`Cyprus-1`).
6. Copy your Cyprus-1 wallet address (starts with `0x...`).

### 2. Fund Account via Faucet
1. Visit the **Orchard Testnet Faucet**: `https://orchard.faucet.quai.network`.
2. Input your Cyprus-1 address and request testnet QUAI.
3. Verify your balance appears in Pelagus or via `https://orchard.quaiscan.io`.

---

## Phase 2: Smart Contract Design (`UdyogaAuditAnchor.sol`)

### Contract Specifications
- **Language**: Solidity `^0.8.20`
- **Target Network**: Quai Network Orchard Testnet (`Cyprus-1`, Chain ID `15000`)
- **Key Functions**:
  - `recordAssessmentDigest(bytes32 appId, bytes32 digest, string memory modelVersion)`
  - `recordSanctionDecision(bytes32 appId, uint8 decisionCode, uint16 haircutBps)`
  - `recordConsentRevocation(bytes32 appId, bytes32 revocationProof)`
  - `getAuditRecord(bytes32 appId) external view returns (...)`

### Implementation Blueprint
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title UdyogaAuditAnchor
 * @notice Anchors cryptographic SHA-256 digests of MSME credit assessments and lender decisions.
 * @dev Zero PII is stored on-chain. Conforms to Indian DPDP Act 2023 principles.
 */
contract UdyogaAuditAnchor {
    enum ApplicationState { NONE, SUBMITTED, EVALUATED, SANCTIONED, DECLINED, CONSENT_REVOKED }

    struct AuditRecord {
        bytes32 assessmentDigest;
        bytes32 consentRevocationDigest;
        string modelVersion;
        uint256 timestamp;
        uint16 haircutBps;
        ApplicationState state;
        address recordedBy;
    }

    mapping(bytes32 => AuditRecord) public records;

    event AssessmentAnchored(bytes32 indexed appId, bytes32 digest, string modelVersion, address indexed recorder);
    event DecisionRecorded(bytes32 indexed appId, ApplicationState state, uint16 haircutBps, address indexed recorder);
    event ConsentRevoked(bytes32 indexed appId, bytes32 revocationDigest, address indexed recorder);

    function recordAssessment(
        bytes32 appId,
        bytes32 digest,
        string calldata modelVersion
    ) external {
        AuditRecord storage rec = records[appId];
        rec.assessmentDigest = digest;
        rec.modelVersion = modelVersion;
        rec.timestamp = block.timestamp;
        rec.state = ApplicationState.EVALUATED;
        rec.recordedBy = msg.sender;

        emit AssessmentAnchored(appId, digest, modelVersion, msg.sender);
    }

    function recordDecision(
        bytes32 appId,
        ApplicationState state,
        uint16 haircutBps
    ) external {
        AuditRecord storage rec = records[appId];
        require(rec.state != ApplicationState.NONE, "Assessment not anchored");
        rec.state = state;
        rec.haircutBps = haircutBps;

        emit DecisionRecorded(appId, state, haircutBps, msg.sender);
    }

    function recordConsentRevocation(bytes32 appId, bytes32 revocationDigest) external {
        AuditRecord storage rec = records[appId];
        rec.state = ApplicationState.CONSENT_REVOKED;
        rec.consentRevocationDigest = revocationDigest;

        emit ConsentRevoked(appId, revocationDigest, msg.sender);
    }
}
```

---

## Phase 3: Contract Compilation & Testnet Deployment

### 1. Developer Dependencies
In `backend/`:
```bash
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox quais dotenv
```

### 2. Hardhat Network Configuration (`backend/hardhat.config.cjs`)
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    cyprus1: {
      url: "https://orchard.rpc.quai.network/cyprus1",
      chainId: 15000,
      accounts: process.env.QUAI_PRIVATE_KEY ? [process.env.QUAI_PRIVATE_KEY] : [],
    },
  },
};
```

### 3. Deploy Script Execution
```bash
npx hardhat run scripts/deploy.js --network cyprus1
```
Expected output:
```
Deploying UdyogaAuditAnchor to Quai Orchard (Cyprus-1)...
UdyogaAuditAnchor deployed to: 0x... (Cyprus-1)
Transaction confirmed in block: #49120
View on Explorer: https://orchard.quaiscan.io/address/0x...
```

---

## Phase 4: Frontend Integration & Quai Service Layer

### 1. Quai Browser Service (`frontend/src/services/quaiService.ts`)
- Implements `connectPelagus()` checking `window.pelagus`.
- Implements `verifyAssessmentOnChain(appId)` querying the Cyprus-1 RPC endpoint (`https://orchard.rpc.quai.network/cyprus1`).
- Falls back gracefully to simulation mode when Pelagus is not installed.

### 2. User Interface Enhancements
- **Lender Workbench (`ApplicantDetailWorkbench.tsx`)**:
  - Displays a dedicated **"Quai Cyprus-1 Cryptographic Anchor"** card.
  - Shows transaction digest, block number, and live link to `orchard.quaiscan.io`.
  - Optional: Allows credit officer to click **"Sign Sanction on Quai"** using Pelagus.
- **Fairness & Auditor Console (`AuditLogsView.tsx`)**:
  - Links audit entries directly to confirmed Quai Cyprus-1 transaction hashes.
