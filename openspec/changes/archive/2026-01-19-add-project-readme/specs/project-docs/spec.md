## ADDED Requirements

### Requirement: Bilingual Project README
The repository SHALL provide a root-level `README.md` written in both Chinese and English.

#### Scenario: New contributor opens the repository
- **WHEN** a supplier or developer views the repository root
- **THEN** they can find `README.md` with Chinese and English sections that describe the project

### Requirement: Supplier-Focused Usage Documentation
The `README.md` SHALL document the primary supplier-facing workflows for using the portal.

#### Scenario: Supplier uses portal
- **WHEN** a supplier follows the README instructions
- **THEN** they can log in with a supplier token, select a channel, toggle status, refresh quota, and submit a new API key

### Requirement: Configuration Documentation
The `README.md` SHALL document the supported runtime configuration options for local development.

#### Scenario: Developer runs the portal locally
- **WHEN** a developer needs to point the portal at a backend
- **THEN** the README documents `VITE_API_BASE_URL` and the Vite dev proxy `VITE_DEV_API_PROXY_TARGET`

### Requirement: Security Notes
The `README.md` SHALL document relevant security and data-handling constraints of the portal.

#### Scenario: Supplier updates a channel API key
- **WHEN** a supplier submits a new upstream API key in the UI
- **THEN** the README clarifies the key is treated as write-only by the portal UI and is not displayed after submission

#### Scenario: Supplier token persistence
- **WHEN** a supplier logs in
- **THEN** the README clarifies the token is stored in `localStorage` and can be cleared via logout
