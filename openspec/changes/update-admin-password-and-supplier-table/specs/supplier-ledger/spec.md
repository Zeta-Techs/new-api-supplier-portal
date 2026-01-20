## MODIFIED Requirements
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
- **WHEN** an Admin expands the settlement ledger UI for a supplier from the supplier list row
- **THEN** the system shows a table of historical settlement entries
- **AND** the ledger UI is collapsed by default
