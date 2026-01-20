# Change: Fix channel list completeness, sorting, and usage display

## Why
- Channel lists are currently incomplete because the portal only fetches a single page (`page_size=100`) from new-api.
- Channel lists should be consistently sorted by channel ID to make it easier to find/compare channels.
- `used_quota` is currently displayed as raw token/quota units; the portal should display it as a monetary amount by dividing by 500000.

## What Changes
1) Fetch all channels for Admin browsing
- Update the admin channel browsing flow to page through `GET /api/channel/` until all pages are retrieved (or until `total` is satisfied).

2) Fetch all visible channels for Supplier lists
- Update supplier channel list flow to page through `GET /api/channel/` until complete for that supplier (backend already filters by grants).

3) Sorting
- Sort channel lists by `id` ascending (Admin + Supplier lists).

4) Usage display conversion
- Display used quota as USD amount: `$${(used_quota / 500000).toFixed(4)}`.

## Impact
- Affected specs:
  - `channel-browse` (MODIFIED) - sorting + completeness + usage display semantics
  - `admin-channel-grants` (MODIFIED) - admin channel browsing completeness
- Affected code (expected):
  - `src/components/AdminPanel.jsx` (load all pages; sort; display usage amount)
  - `src/components/SupplierPortal.jsx` + `src/components/ChannelList.jsx` + `src/components/ChannelDetail.jsx` (sort; display usage amount)
  - `src/lib/api.js` may gain a helper to fetch all pages

## Out of Scope
- Changing new-api backend pagination behavior
- Changing the meaning of 500000 conversion factor
