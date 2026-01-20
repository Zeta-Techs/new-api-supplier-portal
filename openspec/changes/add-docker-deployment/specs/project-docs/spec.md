## ADDED Requirements
### Requirement: Docker Deployment Documentation
The `README.md` SHALL document how to run the portal using Docker.

#### Scenario: Operator deploys with Docker
- **WHEN** an operator follows the README's Docker instructions
- **THEN** they can build and run the portal using `docker build`/`docker run` or `docker compose`
- **AND** the documentation explains how to persist the SQLite database for the portal
