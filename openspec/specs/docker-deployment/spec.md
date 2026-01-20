# docker-deployment Specification

## Purpose
TBD - created by archiving change add-docker-deployment. Update Purpose after archive.
## Requirements
### Requirement: Docker Image for Portal
The repository SHALL provide a Docker build configuration that produces a runnable container for the portal backend and the built frontend.

#### Scenario: Operator builds and runs the image
- **WHEN** an operator runs `docker build` for the repository
- **THEN** the build succeeds and produces an image that can be started
- **AND** starting the container serves the SPA and `/api/*` endpoints from the same process

### Requirement: Container Runtime Configuration
The container SHALL support runtime configuration via environment variables, at minimum:
- `PORTAL_PORT` (listening port)
- `PORTAL_DB_FILE` (SQLite database file path)
- `TZ` (system timezone)

#### Scenario: Operator configures port and DB path
- **WHEN** an operator starts the container with `PORTAL_PORT` and `PORTAL_DB_FILE` set
- **THEN** the service listens on `PORTAL_PORT`
- **AND** portal state is persisted in the SQLite file at `PORTAL_DB_FILE`

#### Scenario: Operator configures timezone
- **WHEN** an operator starts the container with `TZ` set
- **THEN** the container uses that timezone for system time

### Requirement: Compose Example
The repository SHALL provide an example `docker-compose.yml` for running the portal container.

#### Scenario: Operator uses docker compose
- **WHEN** an operator runs `docker compose up --build`
- **THEN** the portal service starts successfully
- **AND** the compose configuration persists the SQLite database across restarts

