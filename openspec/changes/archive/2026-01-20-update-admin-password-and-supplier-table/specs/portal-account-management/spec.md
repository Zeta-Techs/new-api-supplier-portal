## RENAMED Requirements
- FROM: `### Requirement: Supplier Changes Own Password`
- TO: `### Requirement: Portal User Changes Own Password`

## MODIFIED Requirements
### Requirement: Portal User Changes Own Password
The system SHALL allow a portal user (Supplier or Admin) to change their own password by providing their current password, a new password, and confirmation of the new password.

#### Scenario: Supplier changes password
- **WHEN** a Supplier provides their current password, a new password, and a matching confirmation
- **THEN** the system updates their password

#### Scenario: Admin changes password
- **WHEN** an Admin provides their current password, a new password, and a matching confirmation
- **THEN** the system updates their password

#### Scenario: Portal user provides mismatched confirmation
- **WHEN** a portal user provides a new password and a confirmation that do not match
- **THEN** the system rejects the password change
