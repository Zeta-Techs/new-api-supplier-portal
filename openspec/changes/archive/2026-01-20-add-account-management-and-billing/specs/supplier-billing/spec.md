## ADDED Requirements

### Requirement: Supplier Billing Summary
The system SHALL show suppliers a billing summary derived from visible channel usage.

#### Scenario: Supplier views billing summary
- **WHEN** a Supplier views their dashboard
- **THEN** the portal displays:
  - `used_amount` = sum over visible channels of `(used_quota / 500000)`
  - `settled_amount` (admin-maintained)
  - `balance = settled_amount - used_amount`

### Requirement: Settled Amount Is Admin-Maintained
The system SHALL treat `settled_amount` as an Admin-maintained value.

#### Scenario: Supplier attempts to edit settled amount
- **WHEN** a Supplier attempts to change `settled_amount`
- **THEN** the system rejects the action
