# Change: Admin + Supplier users with channel-scoped permissions (proxying existing new-api /api/channel endpoints)

## Why
The current portal is a supplier-token-only UI that calls custom supplier endpoints (e.g. `/api/supplier/channels`). The desired target is to align with the existing QuantumNous `new-api` project and documentation, and manage channels through the existing `/api/channel/*` endpoints (do not invent new channel APIs).

The required operating model is:
- A new-api Root provides this portal with:
  - new-api base URL
  - a system access token (new-api `access_token`, Root role)
  - `New-Api-User` (the root user id required by new-api auth middleware)
- Supplier users do NOT receive the root token.
- Supplier users operate inside this portal; the portal enforces per-channel + per-operation permissions and then performs channel actions against new-api *using the root token*.

## What Changes
- Add a lightweight portal backend (BFF) to securely store the new-api connection credentials and to proxy requests.
- Replace the portal authentication model:
  - Admin and Supplier accounts are managed by the portal (not by new-api)
  - Users log into the portal; the portal backend issues a session for the UI
- Add an Admin area in the portal:
  - Configure the new-api connection (base URL + access token + `New-Api-User`)
  - Create/manage supplier portal users
  - Assign per-supplier channel grants with per-operation permissions
- Update channel management integration:
  - The portal backend proxies existing new-api `/api/channel/*` endpoints
  - Supplier users can only access channels/actions allowed by portal grants
  - The portal backend injects the required headers for new-api admin auth:
    - `Authorization: <access_token>`
    - `New-Api-User: <root_user_id>`
  - The portal does not display existing channel keys; it only supports key updates (write-only) using existing channel update semantics

## Out of Scope (for this change)
- Replacing the entire new-api admin console UI
- Complex IAM (full RBAC engine, groups/teams, audit export)
- Exposing the admin token to suppliers (explicitly disallowed)

## Impact
- Affected specs:
  - `portal-auth` (new) - portal-managed login and role-aware UI
  - `admin-supplier-management` (new) - admin manages supplier users and grants
  - `channel-browse` (MODIFIED) - browsing/selection now reflects per-user visibility
  - `channel-api-integration` (new) - proxy mapping to new-api `/api/channel/*`
- Affected code:
  - Portal backend (new, this repo): credential storage, portal users, grants, `/api/channel/*` proxy
  - Frontend (this repo): login flow, admin screens, channel screens using the proxy
  - Backend (QuantumNous/new-api): ideally none (we call existing endpoints); only required if we later need additional capabilities
- Security considerations:
  - The admin token MUST only exist server-side in the portal backend
  - Portal backend enforces channel visibility and per-operation permissions before proxying
