## Approach
- Update `src/components/ChannelList.jsx` to add a new table header and a per-row cell.
- Compute the RMB cost using the same math as the admin channel table.

## Computation Details
- `used_usd = used_quota / 500000`
- `rmb_cost = used_usd * price_factor`
- Display format: `¥{rmb_cost.toFixed(2)}`.

To avoid float drift and align with server-side billing rounding, the implementation MAY compute via cents:
- `usd_cents = round((used_quota * 100) / 500000)`
- `rmb_cents = round(usd_cents * price_factor)`
- Display format: `¥{(rmb_cents/100).toFixed(2)}`

## Notes
- `src/lib/i18n.js` already contains `rmb_cost` for both languages.
