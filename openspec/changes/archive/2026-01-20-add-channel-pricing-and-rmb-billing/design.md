## Data model
- `channel_pricing`
  - `channel_id` (PK)
  - `factor_rmb_per_usd` (TEXT or numeric string; validated on write)
  - `updated_at`
- Extend `supplier_billing` with:
  - `settled_rmb_cents`

## Notes
- RMB amounts are stored as cents (integer).
- RMB totals exclude channels with missing factor records.
- UI highlights missing factor channel IDs in red.

## UI
- Admin channels section: add inline editable factor column + computed RMB cost column.
- Supplier portal: show factor + RMB cost in list rows.
- Supplier billing: show USD totals + RMB totals + missing-factor IDs.
- Admin supplier list: show all suppliers directly (no dropdown selection UX).
