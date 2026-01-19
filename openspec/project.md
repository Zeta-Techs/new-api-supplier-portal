# Project Context

## Purpose
This repository is a small, single-page "Supplier Channel Portal" frontend.

Primary goals:
- Allow a supplier to authenticate using a supplier token (Bearer token)
- List channels granted to that supplier
- For a selected channel, toggle enabled/disabled status
- For a selected channel, submit (write-only) an upstream API key
- For a selected channel, view and refresh used quota (read-only)

## Tech Stack
- Runtime/build: Node.js (Vite 5), npm (`package-lock.json` present)
- Frontend: React 18 (functional components + hooks)
- Language: JavaScript (ESM) + JSX (no TypeScript)
- Styling: plain CSS in `src/styles.css` with CSS variables (dark, glassy UI)
- Networking: browser `fetch` with a small wrapper in `src/lib/api.js`
- Storage: `localStorage` for persisting the supplier token (`src/lib/storage.js`)

### Local Dev
- `npm run dev` starts Vite
- Vite dev proxy forwards `/api/*` to `VITE_DEV_API_PROXY_TARGET` (default `http://localhost:3000`) in `vite.config.js`

### Environment Variables
- `VITE_API_BASE_URL`
  - If set, requests are sent to `${VITE_API_BASE_URL}/api/...`
  - If not set, requests are sent to `/api/...` (paired with the Vite proxy in dev)
- `VITE_DEV_API_PROXY_TARGET`
  - Vite-only dev proxy target for `/api`

## Project Conventions

### Code Style
- React components live in `src/components/*.jsx` and use default exports.
- Shared utilities live in `src/lib/*.js` and use named exports.
- Prefer simple, readable code over abstraction; this app is intentionally small.
- API and storage helpers should remain side-effect free (except for the `fetch`/`localStorage` operations they encapsulate).

### Architecture Patterns
- Single-page app entry: `src/main.jsx` renders `src/App.jsx`.
- `src/App.jsx` owns top-level state (token, channels, selected channel, busy flag, toasts).
- Data flow:
  - Token is loaded from `localStorage` at startup
  - On token set, the app fetches channel list and sets a default selection
  - Mutations (toggle status, submit key) call the backend then refresh local state as needed
- Error handling:
  - `src/lib/api.js` throws `Error` for non-2xx responses or `success === false`
  - UI surfaces errors via toast notifications (`src/components/Toast.jsx`)

### API Conventions
- Authentication: `Authorization: Bearer <supplierToken>`
- JSON response shape expected by `src/lib/api.js`:
  - `res.ok` must be true
  - `json.success` must not be `false`
  - `json.data` is returned to callers
  - `json.message` is used for error messages when present

Current endpoints used:
- `GET /api/supplier/channels` -> `{ items: [...] }`
- `POST /api/supplier/channels/:id/status` body `{ enabled: boolean }`
- `POST /api/supplier/channels/:id/key` body `{ key: string }`
- `GET /api/supplier/channels/:id/quota`

Channel object shape (as used by UI):
- `id` (string/number)
- `name` (string)
- `type` (string/number)
- `status` (number; `1` means enabled)
- `used_quota` (number; optional)

### UI / Styling
- Global CSS variables live under `:root` in `src/styles.css`.
- Layout patterns: `card`, `grid`, `row`, `badge`, and `btn*` utility classes.
- Fonts are loaded via Google Fonts in `index.html`:
  - `Space Grotesk` for UI
  - `JetBrains Mono` for tokens/IDs

### Testing Strategy
- No automated test harness is currently configured (no Vitest/Jest/Cypress present).
- Current expectation is manual verification via `npm run dev` and exercising the key flows.

### Git Workflow
- Repository currently has a single initial commit.
- Suggested conventions for future work:
  - Create feature branches off `main`
  - Keep commits small and focused; imperative messages (e.g. "Add channel search")
  - Use OpenSpec proposals for new features, breaking changes, or architecture shifts

## Domain Context
- "Supplier token": a credential that grants access to a supplier's allowed channels.
- "Channel": a supplier-scoped integration entry that can be enabled/disabled.
- "Upstream API key": a per-channel secret submitted by the supplier.
  - Important: this UI treats the key as write-only and never attempts to display it.
- "Used quota": a per-channel usage counter shown in the UI; refreshed on demand.

## Important Constraints
- Security: do not display stored upstream API keys in the UI; they are write-only here.
- Token persistence: token is stored in `localStorage` (trade-off: convenience vs. security).
- Small app constraint: prefer minimal dependencies and straightforward patterns.

## External Dependencies
- Backend API server that serves the `/api/supplier/...` endpoints.
- Google Fonts (optional runtime dependency for typography): `fonts.googleapis.com`, `fonts.gstatic.com`.
