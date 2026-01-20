## MODIFIED Requirements

### Requirement: Admin Can Browse All Channels
The system SHALL allow an Admin to view and browse all channels from new-api.

#### Scenario: Admin sees all channels
- **WHEN** an Admin opens the channel management section
- **THEN** the portal retrieves all available channels (not just the first page)
- **AND** the UI sorts channels by `id` ascending
