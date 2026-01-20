import { nowMs } from './auth.js';

export function listChannelPricing(db) {
  return db
    .prepare('SELECT channel_id, factor_rmb_per_usd, updated_at FROM channel_pricing ORDER BY channel_id ASC')
    .all();
}

export function getChannelFactor(db, channelId) {
  const row = db
    .prepare('SELECT factor_rmb_per_usd FROM channel_pricing WHERE channel_id = ?')
    .get(Number(channelId));
  return row ? Number(row.factor_rmb_per_usd) : null;
}

export function upsertChannelFactor(db, channelId, factor) {
  const t = nowMs();
  db.prepare(
    `INSERT INTO channel_pricing(channel_id, factor_rmb_per_usd, updated_at)
     VALUES(?, ?, ?)
     ON CONFLICT(channel_id) DO UPDATE SET factor_rmb_per_usd=excluded.factor_rmb_per_usd, updated_at=excluded.updated_at`,
  ).run(Number(channelId), Number(factor), t);
}
