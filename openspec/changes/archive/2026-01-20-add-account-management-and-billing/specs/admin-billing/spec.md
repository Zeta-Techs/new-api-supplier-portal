## ADDED Requirements

### Requirement: Admin Sees Supplier Billing Overview
The system SHALL allow an Admin to view billing totals for all supplier accounts.

#### Scenario: Admin views supplier list
- **WHEN** an Admin opens the supplier management section
- **THEN** the portal shows each supplier with:
  - `used_amount` (computed)
  - `settled_amount` (stored)
  - `balance` (computed)

### Requirement: Admin Updates Settled Amount
The system SHALL allow an Admin to update `settled_amount` for a supplier.

#### Scenario: Admin updates settled amount
- **WHEN** an Admin sets a new `settled_amount` for a supplier
- **THEN** the supplier's billing summary reflects the updated value
