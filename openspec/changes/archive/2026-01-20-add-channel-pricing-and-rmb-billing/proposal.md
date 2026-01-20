# Change: Add per-channel pricing factor and RMB billing settlement

## Why
- Each channel may have a different effective price/markup.
- We need RMB-based settlement: channel used USD amount times a per-channel pricing factor becomes that channel's RMB cost.
- Admin wants to edit pricing factors inline (no secondary menu) and have them visible to suppliers.
- Admin supplier management should show all suppliers in a list (no dropdown selection UX for supplier list).

## Scope (confirmed)
- Pricing factor meaning: `rmb_cost = used_usd * factor` (factor in RMB per USD, can include FX + markup)
- RMB rounding: 2 decimals
- Factor "unset": absence of record in DB means unset; these channels are excluded from RMB totals and flagged
- Settlement storage: introduce new `settled_rmb_cents`; keep existing USD settlement fields for USD stats
- Supplier channel list display: show factor + RMB cost per channel

## What Changes

### 1) Channel pricing factor management
- Add portal-managed channel pricing records keyed by `channel_id`.
- Admin can edit factor directly in the channel list (inline input).
- Factors are visible to suppliers for granted channels.

### 2) RMB billing computation
- For each supplier:
  - Compute `used_usd` from `used_quota / 500000`
  - Compute `rmb_cost_per_channel = used_usd * factor`
  - Sum to `used_rmb` across channels that have a factor record
  - Track `missing_factor_channel_ids` and show them in UI (red) when present

### 3) RMB settlement
- Add `settled_rmb_cents` per supplier (admin-maintained).
- Compute RMB balance: `balance_rmb = settled_rmb - used_rmb`.

### 4) Admin supplier list UX tweak
- Supplier list remains a direct list/table of all suppliers and their billing totals.
- Remove dropdown-based selection in supplier management (e.g., password reset uses inline row actions).

## Impact
- Affected specs:
  - `channel-pricing` (new)
  - `supplier-billing` (MODIFIED)
  - `admin-billing` (MODIFIED)
  - `admin-channel-grants` (MODIFIED - inline factor editing in channel list)
- Affected code:
  - Portal backend: DB + endpoints for pricing factors + RMB billing fields
  - Frontend: Admin channels list row editing; supplier list row display; supplier billing card
