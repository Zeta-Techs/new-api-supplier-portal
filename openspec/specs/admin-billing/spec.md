# admin-billing Specification

## Purpose
TBD - created by archiving change add-account-management-and-billing. Update Purpose after archive.
## Requirements
### Requirement: Admin Sees Supplier Billing Overview
The system SHALL allow an Admin to view billing totals for all supplier accounts in a table with aligned columns, showing key metrics and controls on a single row per supplier.

#### Scenario: Admin views supplier list
- **WHEN** an Admin opens the supplier management section
- **THEN** the portal shows each supplier on a single row with:
  - supplier identity (username, supplier user ID, disabled state)
  - USD totals (all channels)
  - RMB totals (factor channels only)
  - missing-factor channel IDs
  - settled RMB amount
  - RMB balance
- **AND** the row provides inline management controls including:
  - reset supplier password
  - disable/enable supplier user
  - delete supplier user
  - a rightmost button to expand/collapse the supplier settlement ledger

### Requirement: Admin Updates Settled Amount
The system SHALL allow an Admin to update RMB settled amount for a supplier.

#### Scenario: Admin updates RMB settled
- **WHEN** an Admin sets a new RMB `settled_rmb_cents` for a supplier
- **THEN** the supplier's billing summary reflects the updated RMB balance

