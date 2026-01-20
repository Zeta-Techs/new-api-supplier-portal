## Context
- This repository contains:
  - a React/Vite frontend built into `dist/`
  - an Express portal backend (`server/index.js`) that serves API routes under `/api/...`
  - the backend can also serve the built frontend from `dist/` when present.
- The backend uses SQLite via `better-sqlite3` and stores the DB at `PORTAL_DB_FILE` (default `./portal.sqlite`).
- The backend listens on `PORTAL_PORT` (default `3001`).

## Goals / Non-Goals
- Goals:
  - Provide a production-oriented Docker image that runs the portal backend and serves the built frontend.
  - Provide a minimal `docker-compose.yml` example that persists SQLite state and exposes the service.
  - Keep configuration straightforward and avoid introducing runtime template/substitution systems.
- Non-Goals:
  - Kubernetes manifests/Helm charts.
  - A runtime-configurable frontend build (we will keep `VITE_API_BASE_URL` as a build-time concern).
  - Hardening for internet-exposed deployments (TLS termination, secure cookies, etc.).

## Decisions
- Single service container:
  - Use the existing Express backend to serve both API and frontend, avoiding a separate Nginx container.
- Build-time frontend configuration:
  - The Docker build may optionally set `VITE_API_BASE_URL` at build time, but the default container will work with relative `/api/...` when frontend and backend are served from the same origin.
- Persistence:
  - The compose example will mount a volume/bind mount and set `PORTAL_DB_FILE` to a path inside the mounted directory.

## Risks / Trade-offs
- Native dependency (`better-sqlite3`):
  - Docker builds may require a base image compatible with the module's prebuilds or a toolchain to compile.
  - Mitigation: prefer Debian-based Node images and validate `docker build` as part of the tasks.

## Migration Plan
- No data migration.
- Docker deployment is additive; existing local development remains unchanged.

## Open Questions
- None. Assumptions confirmed:
  - Production static site (not Vite dev server).
  - Backend URL configuration is build-time (not runtime).
