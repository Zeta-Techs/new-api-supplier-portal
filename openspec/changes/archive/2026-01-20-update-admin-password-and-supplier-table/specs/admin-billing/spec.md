## MODIFIED Requirements
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
