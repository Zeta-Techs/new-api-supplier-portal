## Scope Notes
This change spans frontend and portal backend.

- Connection test: add a small backend endpoint that calls a cheap new-api route (e.g. `GET /api/status` if available in the target new-api build, otherwise `GET /api/channel/?p=1&page_size=1`).
- Bulk grants: implemented in portal admin UI; backend already supports upsert-per-channel grants, so bulk is a UI workflow (with batch API calls). Optionally add a batch endpoint later if needed.
- i18n: keep it lightweight (a dictionary + a `t(key)` helper) rather than introducing a full i18n framework.

## Error Localization Strategy
Because backend errors do not provide stable error codes, start with a conservative mapping:
- Map known portal errors (e.g. "not authenticated", "admin required", "new-api is not configured")
- Map a short list of new-api/proxy errors (e.g. "proxy failed", "no permission")
- Fallback: show the raw message as-is

## UI Approach
- Add a small language toggle button in the header.
- For connection status, show a compact badge (Not configured / Connected / Failed) near the new-api config section.
- For channel grants, show a channel table with checkboxes + a supplier selector + a bulk grant button.
