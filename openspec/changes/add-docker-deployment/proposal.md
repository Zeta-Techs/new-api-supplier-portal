# Change: Add Docker Deployment Support

## Why
- The portal currently relies on local Node.js setup; Docker support simplifies repeatable deployment and onboarding.
- A `docker-compose.yml` example enables a one-command boot for demos and small self-hosted installs.

## What Changes
- Add a Docker build target that produces a runnable container for the portal backend + bundled frontend.
- Provide an example `docker-compose.yml` that:
  - builds/runs the image
  - exposes the portal port
  - persists the SQLite database via a volume/bind mount
- Document Docker usage in `README.md`.

## Impact
- Affected specs:
  - `openspec/specs/project-docs/spec.md`
  - (new) `openspec/specs/docker-deployment/spec.md`
- Affected code/artifacts (expected):
  - `Dockerfile`
  - `.dockerignore`
  - `docker-compose.yml`
  - `README.md`
