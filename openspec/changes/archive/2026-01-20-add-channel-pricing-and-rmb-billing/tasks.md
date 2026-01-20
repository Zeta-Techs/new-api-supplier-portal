## 1. Backend: pricing factor persistence
- [x] 1.1 Add DB table `channel_pricing(channel_id, factor_rmb_per_usd, updated_at)`
- [x] 1.2 Add admin API: list channel pricing factors
- [x] 1.3 Add admin API: upsert channel pricing factor
- [x] 1.4 Add supplier API: read factors for visible channels (or include in list response)

## 2. Backend: RMB settlement + billing
- [x] 2.1 Extend supplier billing storage with `settled_rmb_cents`
- [x] 2.2 Update supplier billing endpoint to return:
  - `used_usd_total`
  - `used_rmb_total` (only channels with factor)
  - `missing_factor_channel_ids`
  - `settled_rmb_cents`
  - `balance_rmb_cents`
- [x] 2.3 Update admin supplier billing list endpoint to include RMB totals and missing-factor IDs
- [x] 2.4 Add admin API to update `settled_rmb_cents`

## 3. Frontend: admin channel list inline factor editing
- [x] 3.1 Add factor input column on admin channel list (inline)
- [x] 3.2 Display computed RMB cost per channel row
- [x] 3.3 Persist factor changes via admin API and refresh computed totals

## 4. Frontend: supplier billing UI
- [x] 4.1 Show USD total (all channels)
- [x] 4.2 Show RMB total (factor channels only) and RMB balance
- [x] 4.3 Show missing factor channel IDs in red text

## 5. Frontend: admin supplier list UX cleanup
- [x] 5.1 Replace supplier reset-password dropdown with per-row reset control
- [x] 5.2 Ensure supplier list shows all suppliers with RMB totals and missing-factor flags

## 6. Verification
- [x] 6.1 Manual test: admin can set factor for a channel in list view
- [x] 6.2 Manual test: supplier sees factor + RMB cost in channel list
- [x] 6.3 Manual test: RMB totals exclude missing-factor channels and show warning list
- [x] 6.4 Manual test: admin can set settled_rmb and supplier balance updates
- [x] 6.5 Run `npm run build`
