## Overview
This change adds two distinct capabilities:
1) Portal account management (roles: admin/supplier)
2) Billing summary and settlement tracking per supplier

## Data Model

### Users
Extend `portal_users` with:
- `disabled` (boolean/int)
- `updated_at` (timestamp)

### Supplier billing
Add `supplier_billing` table keyed by `supplier_user_id`:
- `settled_amount` (numeric stored as TEXT or INTEGER cents)
- `updated_at`

We will keep it simple initially:
- Store currency amounts as integer micro-units or cents to avoid float drift.
- Compute `used_amount` on demand from channels data, not persisted.

## Computation
- `used_amount = sum(channel.used_quota) / 500000`
- `balance = settled_amount - used_amount`

## API Approach
- Portal backend adds admin endpoints for:
  - list users, create user, delete user, disable/enable user, reset password
  - list suppliers with computed billing totals
  - set supplier settled amount
- Portal backend adds supplier endpoint for:
  - change own password
  - get own billing summary

## UI Approach
- Supplier page: add a small billing card above the channel list
- Admin page: add a "Suppliers" section with:
  - supplier list + totals
  - edit settled amount
  - account actions (disable/reset/delete)

## Open Questions (resolved)
- Settlement edit is Admin-only.
- Suppliers do not manage sub-accounts.
