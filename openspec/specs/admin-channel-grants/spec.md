# admin-channel-grants Specification

## Purpose
TBD - created by archiving change add-admin-channel-grant-ui. Update Purpose after archive.
## Requirements
### Requirement: Admin Can Browse All Channels
The system SHALL allow an Admin to view and browse all channels from new-api.

#### Scenario: Admin edits pricing factor inline
- **WHEN** an Admin views the channel list
- **THEN** they can edit a channel's pricing factor inline (no secondary navigation)

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

