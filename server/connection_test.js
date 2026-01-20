import { nowMs } from './auth.js';
import { newApiRequest } from './newapi.js';

export function getLastConnectionTest(db) {
  const row = db
    .prepare('SELECT ok, message, checked_at FROM new_api_connection_test WHERE id = 1')
    .get();
  if (!row) return null;
  return {
    ok: Boolean(row.ok),
    message: row.message,
    checked_at: Number(row.checked_at),
  };
}

export function saveConnectionTest(db, { ok, message }) {
  const checkedAt = nowMs();
  db.prepare(
    `INSERT INTO new_api_connection_test(id, ok, message, checked_at)
     VALUES(1, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET ok=excluded.ok, message=excluded.message, checked_at=excluded.checked_at`,
  ).run(ok ? 1 : 0, String(message || ''), checkedAt);
  return { ok: Boolean(ok), message: String(message || ''), checked_at: checkedAt };
}

export async function runConnectionTest(db) {
  // Prefer /api/status if available; otherwise fallback to channel list with size 1.
  try {
    await newApiRequest(db, '/api/status', { method: 'GET' });
    return { ok: true, message: 'OK (/api/status)' };
  } catch (e1) {
    try {
      await newApiRequest(db, '/api/channel/', { method: 'GET', query: { p: 1, page_size: 1 } });
      return { ok: true, message: 'OK (/api/channel/)' };
    } catch (e2) {
      return { ok: false, message: e2?.message || e1?.message || 'connection failed' };
    }
  }
}
