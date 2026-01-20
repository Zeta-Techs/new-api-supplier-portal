import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { openDb, initDb } from './db.js';
import { getCookieName, hashPassword, sanitizeUser, verifyPassword } from './auth.js';
import { getCfgKeys, getNewApiConfig, hasNewApiConfig, setConfigValue } from './config.js';
import {
  countAdmins,
  createSession,
  createUser,
  deleteSession,
  getGrant,
  getSession,
  getUserById,
  getUserByUsername,
  listGrantsForSupplier,
  listUsers,
  revokeGrant,
  setGrant,
} from './repo.js';
import { getLastConnectionTest, runConnectionTest, saveConnectionTest } from './connection_test.js';
import { OPS, hasOp, normalizeOps } from './permissions.js';
import { newApiRequest } from './newapi.js';

const PORT = Number(process.env.PORTAL_PORT || 3001);
const app = express();
const db = openDb();
initDb(db);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

function setSessionCookie(res, sessionId) {
  res.cookie(getCookieName(), sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
  });
}

function clearSessionCookie(res) {
  res.cookie(getCookieName(), '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    expires: new Date(0),
    path: '/',
  });
}

function getSessionId(req) {
  return req.cookies?.[getCookieName()] || null;
}

function requireAuth(req, res, next) {
  const sid = getSessionId(req);
  const sess = getSession(db, sid);
  if (!sess) return res.status(401).json({ success: false, message: 'not authenticated' });
  const user = getUserById(db, sess.user_id);
  if (!user) return res.status(401).json({ success: false, message: 'not authenticated' });
  req.portalUser = user;
  req.portalSession = sess;
  next();
}

function requireAdmin(req, res, next) {
  if (req.portalUser?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'admin required' });
  }
  next();
}

function jsonOk(res, data) {
  return res.json({ success: true, data });
}

function jsonErr(res, status, message) {
  return res.status(status).json({ success: false, message });
}

// --- Setup ---
app.get('/api/portal/setup/status', (req, res) => {
  jsonOk(res, {
    has_admin: countAdmins(db) > 0,
    has_new_api_config: hasNewApiConfig(db),
  });
});

app.post('/api/portal/setup/admin', async (req, res) => {
  if (countAdmins(db) > 0) return jsonErr(res, 409, 'admin already exists');
  const { username, password } = req.body || {};
  if (!username || !password) return jsonErr(res, 400, 'username and password required');

  const existing = getUserByUsername(db, username);
  if (existing) return jsonErr(res, 409, 'username already exists');

  const passwordHash = await hashPassword(String(password));
  const user = createUser(db, {
    username: String(username).trim(),
    passwordHash,
    role: 'admin',
  });
  jsonOk(res, sanitizeUser(user));
});

// --- Auth ---
app.post('/api/portal/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  const u = getUserByUsername(db, String(username || '').trim());
  if (!u) return jsonErr(res, 401, 'invalid credentials');

  const ok = await verifyPassword(String(password || ''), u.password_hash);
  if (!ok) return jsonErr(res, 401, 'invalid credentials');

  const sess = createSession(db, u.id);
  setSessionCookie(res, sess.id);
  jsonOk(res, { user: sanitizeUser(u) });
});

app.post('/api/portal/auth/logout', (req, res) => {
  const sid = getSessionId(req);
  if (sid) deleteSession(db, sid);
  clearSessionCookie(res);
  jsonOk(res, { ok: true });
});

app.get('/api/portal/me', requireAuth, (req, res) => {
  const u = sanitizeUser(req.portalUser);
  if (u?.role === 'supplier') {
    u.grants = listGrantsForSupplier(db, u.id);
  }
  jsonOk(res, { user: u });
});

// --- Admin: new-api config ---
app.get('/api/portal/admin/new-api', requireAuth, requireAdmin, (req, res) => {
  const cfg = getNewApiConfig(db);
  jsonOk(res, {
    base_url: cfg.baseUrl,
    user_id: cfg.userId,
    configured: hasNewApiConfig(db),
    last_test: getLastConnectionTest(db),
  });
});

app.post('/api/portal/admin/new-api', requireAuth, requireAdmin, async (req, res) => {
  const { base_url, access_token, user_id } = req.body || {};
  if (!base_url || !user_id) return jsonErr(res, 400, 'missing config fields');

  const existing = getNewApiConfig(db);
  const token = String(access_token || '').trim();
  if (!token && !existing.accessToken) return jsonErr(res, 400, 'access_token required');

  const keys = getCfgKeys();
  setConfigValue(db, keys.NEW_API_BASE_URL, String(base_url).trim());
  if (token) setConfigValue(db, keys.NEW_API_ACCESS_TOKEN, token);
  setConfigValue(db, keys.NEW_API_USER_ID, String(user_id).trim());

  // Reset last test on config change.
  saveConnectionTest(db, { ok: false, message: 'not tested yet' });

  jsonOk(res, { configured: true, last_test: getLastConnectionTest(db) });
});

app.post('/api/portal/admin/new-api/test', requireAuth, requireAdmin, async (req, res) => {
  if (!hasNewApiConfig(db)) return jsonErr(res, 409, 'new-api is not configured');

  try {
    const result = await runConnectionTest(db);
    const saved = saveConnectionTest(db, result);
    return jsonOk(res, { result: saved });
  } catch (e) {
    const saved = saveConnectionTest(db, { ok: false, message: e?.message || 'connection failed' });
    return jsonOk(res, { result: saved });
  }
});

// --- Admin: users ---
app.get('/api/portal/admin/users', requireAuth, requireAdmin, (req, res) => {
  jsonOk(res, { users: listUsers(db) });
});

app.post('/api/portal/admin/users', requireAuth, requireAdmin, async (req, res) => {
  const { username, password, role } = req.body || {};
  if (!username || !password || !role) return jsonErr(res, 400, 'missing fields');
  if (!['admin', 'supplier'].includes(String(role))) return jsonErr(res, 400, 'invalid role');

  const existing = getUserByUsername(db, String(username).trim());
  if (existing) return jsonErr(res, 409, 'username already exists');

  const passwordHash = await hashPassword(String(password));
  const user = createUser(db, {
    username: String(username).trim(),
    passwordHash,
    role: String(role),
  });

  jsonOk(res, { user: sanitizeUser(user) });
});

// --- Admin: grants ---
app.get('/api/portal/admin/suppliers/:id/grants', requireAuth, requireAdmin, (req, res) => {
  const supplierUserId = Number(req.params.id);
  const u = getUserById(db, supplierUserId);
  if (!u || u.role !== 'supplier') return jsonErr(res, 404, 'supplier not found');
  jsonOk(res, { grants: listGrantsForSupplier(db, supplierUserId) });
});

app.post('/api/portal/admin/suppliers/:id/grants', requireAuth, requireAdmin, (req, res) => {
  const supplierUserId = Number(req.params.id);
  const u = getUserById(db, supplierUserId);
  if (!u || u.role !== 'supplier') return jsonErr(res, 404, 'supplier not found');

  const { channel_id, operations } = req.body || {};
  const channelId = Number(channel_id);
  if (!channelId) return jsonErr(res, 400, 'channel_id required');

  const ops = normalizeOps(operations);
  if (!ops.length) return jsonErr(res, 400, 'operations required');

  setGrant(db, supplierUserId, channelId, ops);
  jsonOk(res, { ok: true });
});

app.delete('/api/portal/admin/suppliers/:id/grants/:channelId', requireAuth, requireAdmin, (req, res) => {
  const supplierUserId = Number(req.params.id);
  const channelId = Number(req.params.channelId);
  revokeGrant(db, supplierUserId, channelId);
  jsonOk(res, { ok: true });
});

// --- Proxy: /api/channel/* ---
function requireNewApiConfigured(req, res, next) {
  if (!hasNewApiConfig(db)) return jsonErr(res, 409, 'new-api is not configured');
  next();
}

function parseChannelIdFromPath(path) {
  // examples:
  // /api/channel/123
  // /api/channel/test/123
  // /api/channel/update_balance/123
  const parts = String(path).split('/').filter(Boolean);
  const idx = parts.findIndex((p) => p === 'channel');
  if (idx === -1) return null;
  // if next segment is numeric
  const next = parts[idx + 1];
  if (next && /^\d+$/.test(next)) return Number(next);
  // patterns with prefix then id
  const maybe = parts[idx + 2];
  if (maybe && /^\d+$/.test(maybe)) return Number(maybe);
  return null;
}

function requiredOpForChannelRequest(req) {
  const p = req.path;
  if (req.method === 'GET' && (p === '/api/channel/' || p === '/api/channel')) return OPS.USAGE_VIEW; // list implies view
  if (req.method === 'GET' && /^\/api\/channel\/\d+$/.test(p)) return OPS.USAGE_VIEW;
  if (req.method === 'GET' && /^\/api\/channel\/test\/\d+$/.test(p)) return OPS.TEST;
  if (req.method === 'GET' && /^\/api\/channel\/update_balance\/\d+$/.test(p)) return OPS.USAGE_REFRESH;
  if (req.method === 'PUT' && p === '/api/channel/') return null; // depends on payload
  return null;
}

function supplierMustHaveGrant(req, res, { channelId, op }) {
  const u = req.portalUser;
  if (u.role !== 'supplier') return true;

  // Listing channels is allowed; results are filtered server-side.
  if (req.method === 'GET' && (req.path === '/api/channel/' || req.path === '/api/channel')) return true;

  if (!channelId) return false;

  const grant = getGrant(db, u.id, channelId);
  if (!grant) return false;

  if (op && !hasOp(grant.operations, op)) return false;
  return true;
}

const channelProxyPaths = ['/api/channel', '/api/channel/', '/api/channel/*'];

app.all(channelProxyPaths, requireAuth, requireNewApiConfigured, async (req, res) => {
  try {
    // Disallow key retrieval endpoint completely.
    if (req.path.match(/^\/api\/channel\/\d+\/key$/)) {
      return jsonErr(res, 403, 'key retrieval is not supported in this portal');
    }

    const channelId = parseChannelIdFromPath(req.path);
    let op = requiredOpForChannelRequest(req);

    // For supplier list, treat it as allowed and filter to granted+viewable channels.
    if (req.portalUser.role === 'supplier' && req.method === 'GET' && (req.path === '/api/channel/' || req.path === '/api/channel')) {
      op = OPS.USAGE_VIEW;
    }

    // For update, infer intent from payload.
    if (req.method === 'PUT' && req.path === '/api/channel/') {
      const body = req.body || {};
      const id = Number(body.id);
      if (!id) return jsonErr(res, 400, 'channel id is required');

      const isKeyUpdate = Object.prototype.hasOwnProperty.call(body, 'key');
      const isStatusUpdate = Object.prototype.hasOwnProperty.call(body, 'status');

      if (isKeyUpdate) op = OPS.KEY_UPDATE;
      else if (isStatusUpdate) op = OPS.STATUS_UPDATE;
      else return jsonErr(res, 400, 'unsupported channel update (only key/status supported)');

      if (!supplierMustHaveGrant(req, res, { channelId: id, op })) {
        return jsonErr(res, 403, 'no permission for channel operation');
      }

      const upstreamBody = { id };
      if (op === OPS.KEY_UPDATE) upstreamBody.key = body.key;
      if (op === OPS.STATUS_UPDATE) upstreamBody.status = body.status;

      const json = await newApiRequest(db, '/api/channel/', {
        method: 'PUT',
        body: upstreamBody,
      });
      return res.status(200).json(json);
    }

    if (!supplierMustHaveGrant(req, res, { channelId, op })) {
      return jsonErr(res, 403, 'no permission for channel operation');
    }

    // Map request to upstream.
    // Normalize list path so both /api/channel and /api/channel/ hit the upstream list endpoint.
    const upstreamPath =
      req.path === '/api/channel' ? '/api/channel/' : req.path === '/api/channel/' ? '/api/channel/' : req.path;
    const query = { ...req.query };
    const body = ['POST', 'PUT', 'PATCH'].includes(req.method) ? req.body : undefined;

    // Supplier channel list is special: to avoid leaking channels and to avoid pagination bugs,
    // fetch all upstream pages server-side and filter by grants.
    if (
      req.portalUser.role === 'supplier' &&
      req.method === 'GET' &&
      (req.path === '/api/channel/' || req.path === '/api/channel')
    ) {
      const grants = listGrantsForSupplier(db, req.portalUser.id);
      const allowed = new Set(
        grants
          .filter((g) => hasOp(g.operations, OPS.USAGE_VIEW))
          .map((g) => Number(g.channel_id)),
      );

      if (!allowed.size) {
        return res.status(200).json({ success: true, data: { items: [], total: 0 } });
      }

      const all = [];
      let total = null;
      for (let p = 1; p <= 500; p++) {
        const up = await newApiRequest(db, '/api/channel/', {
          method: 'GET',
          query: { p, page_size: 100 },
        });
        const data = up?.data;
        const pageItems = Array.isArray(data?.items) ? data.items : [];
        all.push(...pageItems);
        if (typeof data?.total === 'number') total = data.total;
        if (!pageItems.length) break;
        if (total !== null && all.length >= total) break;
        if (pageItems.length < 100) break;
      }

      const filtered = all.filter((c) => allowed.has(Number(c.id)));
      return res.status(200).json({ success: true, data: { items: filtered, total: filtered.length } });
    }

    const json = await newApiRequest(db, upstreamPath, {
      method: req.method,
      query,
      body,
    });

    return res.status(200).json(json);
  } catch (e) {
    return jsonErr(res, 500, e?.message || 'proxy failed');
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Serve built frontend if present.
try {
  const { default: path } = await import('node:path');
  const { default: fs } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const distDir = path.resolve(__dirname, '..', 'dist');
  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) return res.status(404).end();
      return res.sendFile(path.join(distDir, 'index.html'));
    });
  }
} catch {
  // ignore
}

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Portal backend listening on http://localhost:${PORT}`);
});
