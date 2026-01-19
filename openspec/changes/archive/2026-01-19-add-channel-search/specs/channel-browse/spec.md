## ADDED Requirements

### Requirement: Channel List Search
The system SHALL allow the supplier to search granted channels by name within the channel list UI.

#### Scenario: Search shows matching channels
- **WHEN** the supplier enters a search query
- **THEN** the channel list shows only channels whose names contain the query (case-insensitive substring match)

#### Scenario: Clearing search restores full list
- **WHEN** the supplier clears the search query
- **THEN** the channel list shows all granted channels

### Requirement: Channel Status Filtering
The system SHALL allow the supplier to filter granted channels by enabled/disabled status within the channel list UI.

#### Scenario: Enabled-only filter
- **WHEN** the supplier selects the enabled-only filter
- **THEN** the channel list shows only channels where `status` indicates enabled

#### Scenario: Disabled-only filter
- **WHEN** the supplier selects the disabled-only filter
- **THEN** the channel list shows only channels where `status` indicates disabled

#### Scenario: All filter
- **WHEN** the supplier selects the all filter
- **THEN** the channel list shows both enabled and disabled channels

### Requirement: Selection Behavior With Filters
The system SHALL handle channel selection predictably when search and filters change.

#### Scenario: Selected channel filtered out
- **WHEN** the currently selected channel is no longer visible due to search or status filtering
- **THEN** the system selects the first visible channel if one exists; otherwise it clears the selection
