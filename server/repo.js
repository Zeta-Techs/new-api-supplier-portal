import { createSessionId, nowMs, sessionExpiryMs } from './auth.js';
import { normalizeOps } from './permissions.js';

export function getUserByUsername(db, username) {
  return db
    .prepare(
      'SELECT id, username, password_hash, role, disabled, created_at, updated_at FROM portal_users WHERE username = ?',
    )
    .get(username);
}

export function getUserById(db, id) {
  return db
    .prepare(
      'SELECT id, username, password_hash, role, disabled, created_at, updated_at FROM portal_users WHERE id = ?',
    )
    .get(id);
}

export function listUsers(db, role) {
  if (role) {
    return db
      .prepare(
        'SELECT id, username, role, disabled, created_at, updated_at FROM portal_users WHERE role = ? ORDER BY id DESC',
      )
      .all(role);
  }
  return db
    .prepare('SELECT id, username, role, disabled, created_at, updated_at FROM portal_users ORDER BY id DESC')
    .all();
}

export function createUser(db, { username, passwordHash, role }) {
  const t = nowMs();
  const info = db
    .prepare(
      'INSERT INTO portal_users(username, password_hash, role, disabled, created_at, updated_at) VALUES(?, ?, ?, 0, ?, ?)',
    )
    .run(username, passwordHash, role, t, t);

  return getUserById(db, info.lastInsertRowid);
}

export function countAdmins(db) {
  const row = db.prepare("SELECT COUNT(1) AS c FROM portal_users WHERE role = 'admin'").get();
  return Number(row?.c || 0);
}

export function createSession(db, userId) {
  const id = createSessionId();
  const createdAt = nowMs();
  const expiresAt = sessionExpiryMs(createdAt);
  db.prepare('INSERT INTO portal_sessions(id, user_id, created_at, expires_at) VALUES(?, ?, ?, ?)').run(
    id,
    userId,
    createdAt,
    expiresAt,
  );
  return { id, createdAt, expiresAt };
}

export function getSession(db, sessionId) {
  if (!sessionId) return null;
  const row = db
    .prepare('SELECT id, user_id, created_at, expires_at FROM portal_sessions WHERE id = ?')
    .get(sessionId);
  if (!row) return null;
  if (Number(row.expires_at) <= nowMs()) {
    db.prepare('DELETE FROM portal_sessions WHERE id = ?').run(sessionId);
    return null;
  }
  return row;
}

export function deleteSession(db, sessionId) {
  if (!sessionId) return;
  db.prepare('DELETE FROM portal_sessions WHERE id = ?').run(sessionId);
}

export function setGrant(db, supplierUserId, channelId, operations) {
  const createdAt = nowMs();
  const ops = normalizeOps(operations);
  db.prepare(
    `INSERT INTO supplier_grants(supplier_user_id, channel_id, operations_json, created_at)
     VALUES(?, ?, ?, ?)
     ON CONFLICT(supplier_user_id, channel_id) DO UPDATE SET
       operations_json = excluded.operations_json`,
  ).run(supplierUserId, channelId, JSON.stringify(ops), createdAt);
}

export function revokeGrant(db, supplierUserId, channelId) {
  db.prepare('DELETE FROM supplier_grants WHERE supplier_user_id = ? AND channel_id = ?').run(
    supplierUserId,
    channelId,
  );
}

export function listGrantsForSupplier(db, supplierUserId) {
  return db
    .prepare(
      'SELECT supplier_user_id, channel_id, operations_json, created_at FROM supplier_grants WHERE supplier_user_id = ? ORDER BY channel_id ASC',
    )
    .all(supplierUserId)
    .map((r) => ({
      ...r,
      operations: safeJsonArray(r.operations_json),
    }));
}

export function getGrant(db, supplierUserId, channelId) {
  const row = db
    .prepare(
      'SELECT supplier_user_id, channel_id, operations_json, created_at FROM supplier_grants WHERE supplier_user_id = ? AND channel_id = ?',
    )
    .get(supplierUserId, channelId);
  if (!row) return null;
  return {
    ...row,
    operations: safeJsonArray(row.operations_json),
  };
}

export function listAllSupplierGrants(db) {
  return db
    .prepare(
      'SELECT supplier_user_id, channel_id, operations_json, created_at FROM supplier_grants ORDER BY channel_id ASC, supplier_user_id ASC',
    )
    .all()
    .map((r) => ({
      ...r,
      operations: safeJsonArray(r.operations_json),
    }));
}

export function listChannelGrants(db, channelId) {
  return db
    .prepare(
      `SELECT g.supplier_user_id, g.channel_id, g.operations_json, g.created_at,
              u.username, u.disabled
       FROM supplier_grants g
       JOIN portal_users u ON u.id = g.supplier_user_id
       WHERE g.channel_id = ?
       ORDER BY u.username ASC`,
    )
    .all(Number(channelId))
    .map((r) => ({
      supplier_user_id: r.supplier_user_id,
      channel_id: r.channel_id,
      operations: safeJsonArray(r.operations_json),
      created_at: r.created_at,
      username: r.username,
      disabled: Boolean(r.disabled),
    }));
}

function safeJsonArray(s) {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
