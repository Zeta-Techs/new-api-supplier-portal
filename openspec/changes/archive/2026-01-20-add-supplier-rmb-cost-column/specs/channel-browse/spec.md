## ADDED Requirements
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
