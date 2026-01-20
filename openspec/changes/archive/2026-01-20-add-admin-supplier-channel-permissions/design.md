## Context
We have two related codebases:
- Portal (this repo): a Vite + React SPA
- Backend (QuantumNous/new-api): provides `/api/channel/*` management endpoints and supports admin auth via `access_token` header

Today, the portal uses supplier tokens and custom endpoints (`/api/supplier/...`). Target state is:
- Portal runs with a small backend (BFF)
- new-api Admin/Root provides the portal with `base_url + access_token + New-Api-User`
- Portal users (Admin/Supplier) are managed by the portal
- Supplier actions are authorized by the portal and executed against new-api by proxying existing `/api/channel/*` endpoints

## Goals / Non-Goals
- Goals:
  - Two user types: Admin and Supplier
  - Supplier can only see granted channels
  - Supplier can only perform allowed operations per channel (key, test, enable/disable, usage/balance)
  - Use existing `/api/channel/*` endpoints (do not invent new channel endpoints)
- Non-Goals:
  - Full RBAC system
  - Migrating new-api's existing web console

## Key Decisions

### Decision: Introduce a portal backend (BFF) to hold admin credentials
- Rationale: suppliers must never receive the new-api admin token; a pure SPA would leak it.
- Approach:
  - Portal backend stores new-api `base_url`, `access_token`, and `New-Api-User`
  - Portal backend proxies `/api/channel/*` requests to new-api and injects required headers

### Decision: Portal-managed users + server-side permission enforcement
- Rationale: UI gating is not sufficient; permissions must be enforced server-side.
- Approach:
  - Portal backend maintains:
    - portal users (Admin/Supplier)
    - per-supplier grants: (channel_id, allowed_operations)
  - For each supplier request, the portal backend:
    - verifies portal session
    - checks permission
    - forwards to new-api only if allowed

### Decision: Keys are write-only in the portal
- Rationale: channel key is highly sensitive, and new-api key retrieval is Root-only and guarded by secure verification.
- Approach:
  - The portal supports updating keys via existing `/api/channel/*` update semantics
  - The portal does not proxy key retrieval (`POST /api/channel/{id}/key`) and does not display stored keys

## Alternatives Considered
- Keep supplier token auth and keep using `/api/supplier/*` endpoints
  - Rejected: requirement is to manage channels via `/api/channel/*`
- Pure SPA that stores admin token in the browser
  - Rejected: would leak admin credentials to suppliers

## Migration Plan
- Phase 1: Add portal backend with portal user auth + persisted admin connection config
- Phase 2: Add supplier management (users + per-channel per-operation grants)
- Phase 3: Switch portal channel operations to proxy `/api/channel/*` and retire supplier-token flow

## Open Questions
- Key read/display is out of scope for this change.
  - new-api's `/api/channel/{id}/key` is Root + secure verification.
  - This portal will not proxy that endpoint; keys remain write-only here.
- Which channel fields should suppliers be allowed to see (balance, group, models, etc.)?
- Exact mapping of "usage" requirement:
  - use `channels.used_quota` from channel list/details, or call `GET /api/channel/update_balance/{id}` as a refresh action?
