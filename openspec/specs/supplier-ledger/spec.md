# supplier-ledger Specification

## Purpose
TBD - created by archiving change redesign-admin-channel-table-and-ledger. Update Purpose after archive.
## Requirements
### Requirement: Supplier Settlement Ledger
The system SHALL maintain a per-supplier settlement ledger.

#### Scenario: Admin appends a settlement entry
- **WHEN** an Admin records a settlement amount for a supplier
- **THEN** the system stores an immutable settlement entry including:
  - timestamp
  - amount
  - post-settlement total settled
  - post-settlement balance snapshot

#### Scenario: Admin views settlement history
- **WHEN** an Admin opens the settlement ledger UI for a supplier
- **THEN** the system shows a table of historical settlement entries
- **AND** the ledger UI is collapsed by default

