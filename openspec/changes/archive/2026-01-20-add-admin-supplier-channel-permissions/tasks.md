## 1. Planning / Backend Alignment
- [x] 1.1 Confirm new-api connection requirements for admin access token auth:
  - required headers: `Authorization` and `New-Api-User`
  - Root access token is required
- [x] 1.2 Confirm which existing new-api endpoints correspond to required operations:
  - list channels: `GET /api/channel/`
  - channel details: `GET /api/channel/{id}`
  - update channel (status/key): `PUT /api/channel/`
  - test channel: `GET /api/channel/test/{id}`
  - refresh usage/balance: `GET /api/channel/update_balance/{id}` (optional)
  - read usage: `used_quota` field from list/details
- [x] 1.3 Confirm key policy:
  - write-only only (portal does not display stored keys)

## 2. Portal Backend (BFF) (this repo)
- [x] 2.1 Add persisted new-api connection config (base URL, access token, New-Api-User)
- [x] 2.2 Add portal user auth (Admin/Supplier) and session handling
- [x] 2.3 Add portal permission model: per-supplier grants (channel_id + allowed_operations)
- [x] 2.4 Implement `/api/channel/*` proxy routes that:
  - inject admin headers
  - filter channel list responses to granted channels
  - enforce per-operation permission checks for supplier users
  - never leak admin credentials to the client

## 3. Frontend (this repo)
- [x] 3.1 Replace supplier-token login with portal login (username/password)
- [x] 3.2 Add admin UI:
  - configure new-api base URL + access token + New-Api-User
  - create supplier users
  - grant channels + allowed operations
- [x] 3.3 Update channel list/detail screens to use proxied `/api/channel/*` endpoints
- [x] 3.4 Add permission-aware UI states (hide/disable actions, show "no access" messages)

## 4. Verification
- [ ] 4.1 Manual test: admin config works; portal can list channels through proxy
- [ ] 4.2 Manual test: admin can create supplier user and grant a subset of channels + operations
- [ ] 4.3 Manual test: supplier sees only granted channels
- [ ] 4.4 Manual test: supplier cannot operate on non-granted channels (server returns access denied)
- [ ] 4.5 Manual test: supplier can perform allowed operations (key/test/enable/disable/usage)
- [x] 4.6 Run frontend build `npm run build`
