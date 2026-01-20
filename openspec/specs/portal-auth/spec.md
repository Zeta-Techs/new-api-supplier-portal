# portal-auth Specification

## Purpose
TBD - created by archiving change add-admin-supplier-channel-permissions. Update Purpose after archive.
## Requirements
### Requirement: Portal Login
The portal SHALL authenticate users against the portal's own user store and maintain an authenticated session for subsequent portal actions.

#### Scenario: User logs in successfully
- **WHEN** the user submits valid portal credentials
- **THEN** the portal establishes a session and allows access to authorized portal features

#### Scenario: User logs out
- **WHEN** the user logs out
- **THEN** the portal clears local user state and requires login again

### Requirement: Admin Configures new-api Connection
The portal SHALL allow an Admin to configure the connection to a target new-api instance.

#### Scenario: Admin sets connection settings
- **WHEN** an Admin provides `base_url`, a Root `access_token`, and `New-Api-User`
- **THEN** the portal backend stores the configuration securely and uses it for proxied calls to new-api

### Requirement: Role-Aware UI
The portal SHALL support at least two roles: Admin and Supplier, and render UI features based on the logged-in user's role.

#### Scenario: Admin user signs in
- **WHEN** an Admin user signs in
- **THEN** the portal shows admin management features

#### Scenario: Supplier user signs in
- **WHEN** a Supplier user signs in
- **THEN** the portal shows only supplier-allowed channel management features

