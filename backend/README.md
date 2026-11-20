# UDYOGA — Backend Service Architecture

This directory is reserved for the backend services, databases, authentication/RBAC enforcement, OCR pipeline, and Alternative Credit Intelligence Engine (ACIE).

## Architectural Boundaries

- **Authentication & RBAC**: API Gateway token verification and session management.
- **Alternative Credit Intelligence Engine (ACIE)**: Risk scoring, cash-flow velocity algorithms, and SHAP attribution generation.
- **Data Ingestion Rails**: Sahamati Account Aggregator (FIP/FIU), GSTN GSP connectors, UPI AutoPay webhooks, and DigiLocker OAuth adapters.
- **Data Privacy & DPDP**: Encryption at rest, automated cryptographic log generation, and right-to-be-forgotten purges.

See `frontend/docs/api-contracts.md` for the agreed REST and WebSocket API interfaces.
