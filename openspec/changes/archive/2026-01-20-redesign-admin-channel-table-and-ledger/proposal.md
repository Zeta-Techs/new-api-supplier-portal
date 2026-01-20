# Change: Responsive layout + admin channel table + supplier settlement ledger + audit log

## Why
- The current UI is not optimally responsive; container width is fixed by max-width and does not follow the desired 90%/98% rule.
- Supplier settled amounts need better persistence and history: keep a per-supplier settlement ledger (time, amount, totals, balance).
- Admin channel list should be a proper table with aligned columns, sortable by columns, and support managing channel grants per supplier.
- Admin needs to inspect supplier permissions per channel and see operational/audit logs.

## Scope
- Layout: container uses 90% width on desktop and 98% width on narrower screens.
- Settlement ledger:
  - per-supplier entries
  - default collapsed in UI
  - stores: timestamp, amount, post-settlement totals, balance snapshot
- Channel list table:
  - columns: channel_id, name, type, status, used(USD), factor, RMB cost, granted suppliers
  - sorting by any column
  - click row to expand and show:
    - supplier list for that channel
    - per-supplier operation permissions editing
    - audit log view
- Audit log includes: supplier channel ops + admin billing edits + pricing factor changes.

## What Changes
1) Responsive layout
- Replace fixed `max-width` container layout with percentage-based layout rule.

2) Settlement ledger
- Add DB table for settlement entries.
- Add UI to append settlement entry and show history table (collapsed by default).

3) Admin channel table
- Replace current list-style channel display with a table layout.
- Add sortable headers.
- Add inline grant management (add/remove supplier grants via dropdown).
- Add row expansion panel with supplier-permission editing.

4) Audit log
- Add DB table for audit log events.
- Record key events:
  - supplier: test/status/key/usage-refresh
  - admin: settled RMB edits and settlement ledger writes, pricing factor edits, grant edits
- Expose admin UI to view audit logs in channel row expansion.

## Impact
- New specs:
  - `portal-layout`
  - `supplier-ledger`
  - `admin-channel-table`
  - `audit-log`
- Existing specs likely affected:
  - `admin-channel-grants`, `admin-billing`, `supplier-billing`, `channel-pricing`

## Decisions (Draft)
- Settlement ledger is additive: it does not remove the existing ability for Admin to set `settled_rmb_cents`, but ledger entries and "set settled" actions SHOULD both be audited.
- Channel table sorting is client-side by default (expected channel counts are small), with a stable tie-breaker by `channel_id`.

## Open Questions
- Should "Admin updates settled RMB" be restricted to "append settlement entry" only (ledger is source of truth), or do we keep both paths long-term?
- Audit log retention: keep indefinitely, or implement a retention window (e.g. 90 days) + export?
- Do we need pagination for audit log and settlement ledger immediately (recommended), or can we ship with a fixed "latest N" view first?
