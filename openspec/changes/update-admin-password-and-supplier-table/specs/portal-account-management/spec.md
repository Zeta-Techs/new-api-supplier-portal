## RENAMED Requirements
- FROM: `### Requirement: Supplier Changes Own Password`
- TO: `### Requirement: Portal User Changes Own Password`

## MODIFIED Requirements
### Requirement: Portal User Changes Own Password
The system SHALL allow a portal user (Supplier or Admin) to change their own password by providing their current password and a new password.

#### Scenario: Supplier changes password
- **WHEN** a Supplier provides their current password and a new password
- **THEN** the system updates their password

#### Scenario: Admin changes password
- **WHEN** an Admin provides their current password and a new password
- **THEN** the system updates their password
