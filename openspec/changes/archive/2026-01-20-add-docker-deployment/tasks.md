## 1. Implementation
- [x] 1.1 Add a production Dockerfile that:
  - builds the Vite frontend into `dist/`
  - runs the portal backend (`node server/index.js`) to serve both `/api/*` and the SPA
  - sets sensible defaults for `PORTAL_PORT` and `PORTAL_DB_FILE`
  - exposes the configured port
- [x] 1.2 Add `.dockerignore` to keep images small and reproducible.
- [x] 1.3 Add an example `docker-compose.yml` that:
  - builds the image from the repository
  - maps host port -> `PORTAL_PORT`
  - mounts a persistent directory/volume for the SQLite DB
  - (optional) includes a simple healthcheck against `/api/health`
- [x] 1.4 Update `README.md` with Docker usage:
  - build/run via `docker build` + `docker run`
  - run via `docker compose up --build`
  - explain how to persist DB and what ports/env vars are used

## 2. Validation
- [ ] 2.1 `docker build` succeeds locally.
- [ ] 2.2 `docker run` starts the service; `/api/health` returns OK and the SPA loads.
- [ ] 2.3 `docker compose up --build` works; DB persists across container restarts (confirm by creating admin once).
