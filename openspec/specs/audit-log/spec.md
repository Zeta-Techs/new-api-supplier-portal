# audit-log Specification

## Purpose
TBD - created by archiving change redesign-admin-channel-table-and-ledger. Update Purpose after archive.
## Requirements
### Requirement: Audit Log Events
The system SHALL record audit log events for relevant actions.

Events include (minimum set):
- supplier channel operations (test/status/key/usage refresh)
- admin pricing factor edits
- admin settlement edits and ledger writes
- admin grant edits

#### Scenario: Action performed
- **WHEN** a tracked action occurs
- **THEN** the system writes an audit log record with:
  - timestamp
  - actor (admin/supplier + user id)
  - action type
  - channel_id (when relevant)
  - supplier_user_id (when relevant)

### Requirement: Audit Log Viewing
The admin UI SHALL allow viewing audit logs scoped to a channel.

#### Scenario: Admin views logs
- **WHEN** an Admin expands a channel row
- **THEN** the UI displays recent audit log entries for that channel

