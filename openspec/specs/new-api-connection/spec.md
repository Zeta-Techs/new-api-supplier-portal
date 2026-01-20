# new-api-connection Specification

## Purpose
TBD - created by archiving change add-admin-channel-grant-ui. Update Purpose after archive.
## Requirements
### Requirement: Connection Test Endpoint
The portal backend SHALL provide an endpoint for testing connectivity to the configured new-api instance.

#### Scenario: Admin requests a connection test
- **WHEN** an Admin triggers a connection test
- **THEN** the portal backend calls a lightweight new-api endpoint using the stored Root credentials
- **AND** it returns success/failure plus a human-readable message

### Requirement: Connection Status Indicator
The portal UI SHALL display a clear new-api connection status.

#### Scenario: Connection not configured
- **WHEN** the admin has not configured new-api settings
- **THEN** the UI shows "not configured" status

#### Scenario: Connection succeeds
- **WHEN** the connection test succeeds
- **THEN** the UI shows a "connected" status with timestamp

#### Scenario: Connection fails
- **WHEN** the connection test fails
- **THEN** the UI shows a "failed" status and the last error message

