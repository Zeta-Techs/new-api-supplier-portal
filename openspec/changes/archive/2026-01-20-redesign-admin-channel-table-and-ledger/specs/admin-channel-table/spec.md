## ADDED Requirements

### Requirement: Admin Channel Table
The system SHALL present the admin channel list as a table with aligned columns.

#### Scenario: Admin views channel table
- **WHEN** an Admin opens the channel list
- **THEN** channels are shown in a table with aligned columns for:
  - channel ID, name, type, status
  - used USD, pricing factor, RMB cost
  - granted suppliers

### Requirement: Sortable Columns
The system SHALL support sorting the channel table by column.

#### Scenario: Admin sorts by a column
- **WHEN** an Admin clicks a column header
- **THEN** the channel table is sorted by that column

### Requirement: Inline Supplier Grant Management
The system SHALL allow managing supplier grants for a channel within the channel table.

#### Scenario: Admin adds/removes supplier grant
- **WHEN** an Admin uses the granted suppliers control for a channel
- **THEN** the system adds/removes the supplier grant without navigating to a different page

### Requirement: Expandable Channel Row
The system SHALL allow expanding a channel row to view details.

#### Scenario: Admin expands a channel
- **WHEN** an Admin clicks a channel row
- **THEN** an expanded panel shows:
  - the list of granted suppliers
  - per-supplier operation permissions editing
  - audit log entries scoped to that channel
