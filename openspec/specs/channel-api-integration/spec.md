# channel-api-integration Specification

## Purpose
TBD - created by archiving change add-admin-supplier-channel-permissions. Update Purpose after archive.
## Requirements
### Requirement: Proxy Existing Channel Management Endpoints
The portal backend SHALL proxy existing new-api `/api/channel/*` endpoints to manage channels.

#### Scenario: List channels (supplier)
- **WHEN** a Supplier loads the channel list
- **THEN** the portal backend calls new-api `GET /api/channel/` using the configured admin credentials
- **AND** the portal returns only channels granted to that Supplier

#### Scenario: List channels (admin)
- **WHEN** an Admin loads the channel list
- **THEN** the portal backend calls new-api `GET /api/channel/` using the configured admin credentials

#### Scenario: Enable or disable channel
- **WHEN** a user toggles a channel and has `channel.status.update` permission
- **THEN** the portal backend updates the channel via `PUT /api/channel/` with the channel `id` and desired `status`

#### Scenario: Test channel
- **WHEN** a user triggers a channel test and has `channel.test` permission
- **THEN** the portal backend calls `GET /api/channel/test/{id}`

#### Scenario: View channel usage
- **WHEN** a user views channel usage and has `channel.usage.view` permission
- **THEN** the portal backend returns `used_quota` from new-api `GET /api/channel/` and/or `GET /api/channel/{id}`

#### Scenario: Refresh channel usage/balance
- **WHEN** a user requests a usage refresh and has `channel.usage.refresh` permission
- **THEN** the portal backend calls `GET /api/channel/update_balance/{id}`

### Requirement: Admin Credential Injection
The portal backend SHALL authenticate to new-api using the configured Root credentials.

#### Scenario: Proxy call to new-api
- **WHEN** the portal backend calls new-api
- **THEN** it sets `Authorization: <access_token>` and `New-Api-User: <root_user_id>` headers

### Requirement: Key Update Uses Existing Channel Update Endpoint
The portal SHALL support updating a channel API key via existing new-api channel update semantics.

#### Scenario: Supplier updates channel key
- **WHEN** a Supplier with `channel.key.update` permission submits a new key for a granted channel
- **THEN** the portal backend updates the channel via `PUT /api/channel/` with the channel `id` and new `key`

### Requirement: Keys Are Not Readable In Portal
The portal SHALL NOT display or proxy retrieval of existing channel keys.

#### Scenario: Supplier attempts to view an existing key
- **WHEN** a Supplier requests to view a channel key
- **THEN** the portal denies the request and does not call new-api `POST /api/channel/{id}/key`

