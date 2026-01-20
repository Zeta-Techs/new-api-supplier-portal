# supplier-billing Specification

## Purpose
TBD - created by archiving change add-account-management-and-billing. Update Purpose after archive.
## Requirements
### Requirement: Supplier Billing Summary
The system SHALL show suppliers a billing summary derived from visible channel usage.

#### Scenario: Supplier views billing summary
- **WHEN** a Supplier views their dashboard
- **THEN** the portal displays:
  - `used_usd_total` (sum over visible channels of `(used_quota / 500000)`)
  - `used_rmb_total` (sum over channels with factor of `(used_usd * factor)`)
  - `missing_factor_channel_ids` (channels excluded from RMB totals)
  - `settled_rmb_cents` (admin-maintained)
  - `balance_rmb = settled_rmb - used_rmb_total`

### Requirement: Settled Amount Is Admin-Maintained
The system SHALL treat `settled_amount` as an Admin-maintained value.

#### Scenario: Supplier attempts to edit settled amount
- **WHEN** a Supplier attempts to change `settled_amount`
- **THEN** the system rejects the action

