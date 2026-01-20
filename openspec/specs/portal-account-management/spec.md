# portal-account-management Specification

## Purpose
TBD - created by archiving change add-account-management-and-billing. Update Purpose after archive.
## Requirements
### Requirement: User Disablement
The system SHALL support disabling portal users.

#### Scenario: Disabled user attempts login
- **GIVEN** a user account is disabled
- **WHEN** the user attempts to log in
- **THEN** the system rejects the login

### Requirement: Admin Manages Users
The system SHALL allow an Admin to manage portal user accounts.

#### Scenario: Admin creates a supplier user
- **WHEN** an Admin creates a supplier user
- **THEN** the user can log in (unless later disabled)

#### Scenario: Admin resets a user's password
- **WHEN** an Admin resets a user's password
- **THEN** the user can log in with the new password

#### Scenario: Admin deletes a user
- **WHEN** an Admin deletes a user
- **THEN** the user can no longer log in

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

