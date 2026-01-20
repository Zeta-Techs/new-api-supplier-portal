# channel-browse Specification

## Purpose
TBD - created by archiving change add-channel-search. Update Purpose after archive.
## Requirements
### Requirement: Channel List Search
The system SHALL allow the user to search visible channels within the channel list UI.

#### Scenario: Supplier searches channels
- **WHEN** a Supplier enters a search query
- **THEN** the channel list shows only channels granted to that Supplier whose name or ID contains the query (case-insensitive)

#### Scenario: Admin searches channels
- **WHEN** an Admin enters a search query
- **THEN** the channel list shows channels available to the Admin whose name or ID contains the query (case-insensitive)

### Requirement: Channel Status Filtering
The system SHALL allow the user to filter visible channels by enabled/disabled status within the channel list UI.

#### Scenario: Filtering preserves ID ordering
- **WHEN** the user applies search or status filters
- **THEN** the resulting channel list remains sorted by channel ID ascending

### Requirement: Selection Behavior With Filters
The system SHALL handle channel selection predictably when search and filters change.

#### Scenario: Selected channel filtered out
- **WHEN** the currently selected channel is no longer visible due to search or status filtering
- **THEN** the system selects the first visible channel if one exists; otherwise it clears the selection

### Requirement: Channel List Ordering
The system SHALL present visible channels in a stable, predictable order.

#### Scenario: Default channel list order
- **WHEN** the channel list is displayed
- **THEN** channels are sorted by `id` ascending

### Requirement: Usage Display
The system SHALL display used quota as a monetary amount.

#### Scenario: Used quota shown as USD amount
- **WHEN** used quota is displayed in the channel list or channel detail
- **THEN** the UI shows `$${(used_quota / 500000).toFixed(4)}`

### Requirement: RMB Cost Display
The system SHALL display per-channel RMB cost in the Supplier channel list, derived from used quota and pricing factor.

#### Scenario: Supplier views RMB cost for a channel
- **GIVEN** a channel row has `used_quota` and a `price_factor`
- **WHEN** the Supplier views the channel list
- **THEN** the UI shows an `RMB cost` column to the right of the pricing factor column
- **AND** the UI computes RMB cost as `(used_quota / 500000) * price_factor` and displays it as a `¥` amount with 2 decimals

#### Scenario: Supplier views a channel with missing factor
- **GIVEN** a channel row has no pricing factor
- **WHEN** the Supplier views the channel list
- **THEN** the UI shows `-` for the RMB cost value

