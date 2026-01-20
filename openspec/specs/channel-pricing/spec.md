# channel-pricing Specification

## Purpose
TBD - created by archiving change add-channel-pricing-and-rmb-billing. Update Purpose after archive.
## Requirements
### Requirement: Per-Channel Pricing Factor
The system SHALL support a portal-managed pricing factor per channel.

#### Scenario: Admin sets factor
- **WHEN** an Admin sets a pricing factor for a channel
- **THEN** the factor is persisted and used for RMB billing computation

#### Scenario: Factor is missing
- **WHEN** a channel has no pricing factor record
- **THEN** that channel is excluded from RMB totals
- **AND** its channel ID is listed in missing-factor warnings

### Requirement: Supplier Can View Factor
The system SHALL allow a Supplier to view the pricing factor for authorized channels.

#### Scenario: Supplier views channel row
- **WHEN** a Supplier views a granted channel
- **THEN** the UI shows the channel's pricing factor (if set)

