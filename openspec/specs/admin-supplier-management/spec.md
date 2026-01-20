# admin-supplier-management Specification

## Purpose
TBD - created by archiving change add-admin-supplier-channel-permissions. Update Purpose after archive.
## Requirements
### Requirement: Admin Creates Supplier Users
The system SHALL allow a portal Admin to create supplier accounts for portal access.

#### Scenario: Admin creates a supplier account
- **WHEN** a portal Admin creates a new supplier user
- **THEN** the supplier user can log into the portal using portal credentials

### Requirement: Per-Channel Permission Grants
The system SHALL allow an Admin to grant a Supplier permissions scoped to specific channels.

#### Scenario: Admin grants channel access
- **WHEN** an Admin grants a Supplier access to a channel
- **THEN** the Supplier can view that channel in the portal

### Requirement: Per-Operation Permission Grants
The system SHALL allow an Admin to grant per-operation permissions per channel for a Supplier.

Supported operations (minimum set):
- `channel.key.update` (update key)
- `channel.status.update` (enable/disable)
- `channel.test` (test channel)
- `channel.usage.view` (view used quota)
- `channel.usage.refresh` (refresh balance/usage)

#### Scenario: Admin grants limited operations
- **WHEN** an Admin grants only specific operations for a channel (e.g., `channel.usage.view` but not `channel.key.update`)
- **THEN** the portal disables or hides disallowed operations
- **AND** the portal backend rejects disallowed operations if called

