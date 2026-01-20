## MODIFIED Requirements

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
