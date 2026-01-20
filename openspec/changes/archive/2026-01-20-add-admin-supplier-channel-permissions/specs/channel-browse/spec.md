## MODIFIED Requirements

### Requirement: Channel List Search
The system SHALL allow the user to search visible channels by name within the channel list UI.

#### Scenario: Supplier searches channels
- **WHEN** a Supplier enters a search query
- **THEN** the channel list shows only channels granted to that Supplier whose names match the query

#### Scenario: Admin searches channels
- **WHEN** an Admin enters a search query
- **THEN** the channel list shows channels available to the Admin whose names match the query

### Requirement: Channel Status Filtering
The system SHALL allow the user to filter visible channels by enabled/disabled status within the channel list UI.

#### Scenario: Filtering respects visibility
- **WHEN** a user applies status filters
- **THEN** only channels the user is authorized to view are included in the filtered results

### Requirement: Selection Behavior With Filters
The system SHALL handle channel selection predictably when search and filters change.

#### Scenario: Selected channel filtered out
- **WHEN** the currently selected channel is no longer visible due to search or status filtering
- **THEN** the system selects the first visible channel if one exists; otherwise it clears the selection
