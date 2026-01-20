# admin-channel-grants Specification

## Purpose
TBD - created by archiving change add-admin-channel-grant-ui. Update Purpose after archive.
## Requirements
### Requirement: Admin Can Browse All Channels
The system SHALL allow an Admin to view and browse all channels from new-api.

#### Scenario: Admin sees all channels
- **WHEN** an Admin opens the channel management section
- **THEN** the portal retrieves all available channels (not just the first page)
- **AND** the UI sorts channels by `id` ascending

### Requirement: Bulk Channel Grants
The system SHALL allow an Admin to bulk grant selected channels to a Supplier.

#### Scenario: Admin selects channels and grants
- **WHEN** an Admin selects one or more channels
- **AND** chooses a Supplier account
- **THEN** the portal grants those channels to that Supplier

### Requirement: One-Click Default Operation Grants
The system SHALL allow an Admin to grant a default set of operations when granting channels.

Default operations:
- `channel.key.update`
- `channel.status.update`
- `channel.test`
- `channel.usage.view`
- `channel.usage.refresh`

#### Scenario: Admin bulk grants with defaults
- **WHEN** an Admin bulk grants channels using the default operation set
- **THEN** the Supplier receives those operations for each granted channel

