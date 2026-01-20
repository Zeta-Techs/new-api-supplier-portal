# Change: Add RMB Cost Column to Supplier Channel List

## Why
- Suppliers currently see the pricing factor but not the per-channel RMB cost derived from usage.
- Adding an RMB cost column improves transparency and matches the admin channel table's RMB cost computation.

## What Changes
- In the Supplier portal channel list table, add a new column `RMB cost` immediately to the right of the pricing factor column.
- The RMB cost value is computed with the same method as the admin channel list RMB cost:
  - `used_usd = used_quota / 500000`
  - `rmb_cost = used_usd * price_factor`
  - display as `¥` with 2 decimals
- If `price_factor` is missing for the channel, show `-` for RMB cost.

## Impact
- Affected specs:
  - `openspec/specs/channel-browse/spec.md`
- Affected code (expected):
  - `src/components/ChannelList.jsx`
  - (optional helper) `src/lib/format.js` or `src/lib/money.js`
  - `src/lib/i18n.js` (only if a missing label is discovered; `rmb_cost` already exists)
