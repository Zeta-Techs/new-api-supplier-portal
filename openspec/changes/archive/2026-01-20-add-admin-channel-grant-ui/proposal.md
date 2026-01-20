# Change: Add new-api connection status + bulk channel grants + bilingual UI

## Why
- Admin config currently cannot clearly verify whether the portal can successfully connect to the configured new-api instance.
- Admin channel authorization is currently manual (entering channel IDs), which is slow and error-prone.
- The portal UI is currently English-first; we need Chinese support with CN/EN language toggle (default Chinese).

## What Changes
1) new-api connection status
- Add a "Test connection" action after configuring new-api settings.
- Display a clear status indicator (connected / failed / not configured) with last checked time and error message.

2) Admin channel management + bulk grants
- In admin view, allow listing/browsing all channels (via proxied `GET /api/channel/`).
- Allow selecting channels (multi-select) and granting to a selected supplier.
- Provide a one-click "grant default operations" flow; default operations include:
  - `channel.key.update`
  - `channel.status.update`
  - `channel.test`
  - `channel.usage.view`
  - `channel.usage.refresh`

3) Chinese/English bilingual UI (default Chinese)
- Add an in-app language toggle (CN/EN) stored in localStorage.
- Translate UI labels, titles, and toasts.
- Add basic mapping/wrapping for common backend error messages so user-facing errors are bilingual.

## Impact
- Affected specs:
  - `new-api-connection` (new) - connection test and status indicator
  - `admin-channel-grants` (new) - admin can browse channels and bulk grant
  - `portal-i18n` (new) - bilingual UI and error-message mapping
- Affected code:
  - `server/index.js` (new endpoint for connection test; optional cached status)
  - `src/components/AdminPanel.jsx` (channel list + multi-select grants)
  - `src/App.jsx` + UI components (language toggle + translations)
  - `src/lib/api.js` (error mapping)

## Out of Scope
- Full localization of new-api raw error messages without stable error codes
- Complex permission templates beyond a single default operation set
