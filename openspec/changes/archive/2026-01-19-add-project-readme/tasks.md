## 1. Authoring
- [x] 1.1 Create `README.md` with bilingual sections (中文/English)
- [x] 1.2 Document portal purpose and core features (token login, channel list, enable/disable, quota refresh, write-only key update)
- [x] 1.3 Document supplier usage steps and UI notes (write-only key, quota is read-only)
- [x] 1.4 Document local development commands (`npm install`, `npm run dev`, `npm run build`, `npm run preview`)
- [x] 1.5 Document configuration/env vars (`VITE_API_BASE_URL`, `VITE_DEV_API_PROXY_TARGET`) and dev proxy behavior
- [x] 1.6 Document API expectations at a high level (endpoints and auth header) without leaking secrets

## 2. Verification
- [x] 2.1 Ensure README is accurate to current code (matches `package.json` scripts and `vite.config.js`)
- [x] 2.2 Ensure README contains no real tokens/keys and uses safe examples
- [x] 2.3 Run `npm run build` to confirm instructions match reality
