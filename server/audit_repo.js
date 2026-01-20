import { nowMs } from './auth.js';

export const AUDIT_ACTIONS = {
  SUPPLIER_TEST: 'supplier.channel.test',
  SUPPLIER_STATUS: 'supplier.channel.status',
  SUPPLIER_KEY: 'supplier.channel.key',
  SUPPLIER_REFRESH: 'supplier.channel.refresh',

  ADMIN_FACTOR: 'admin.channel.factor',
  ADMIN_GRANT: 'admin.channel.grant',
  ADMIN_SETTLED_RMB: 'admin.supplier.settled_rmb',
  ADMIN_SETTLEMENT_ENTRY: 'admin.supplier.settlement_entry',
};

export function writeAudit(db, {
  actor_role,
  actor_user_id,
  action,
  channel_id,
  supplier_user_id,
  message,
}) {
  const t = nowMs();
  db.prepare(
    `INSERT INTO audit_log(
      created_at,
      actor_role,
      actor_user_id,
      action,
      channel_id,
      supplier_user_id,
      message
    ) VALUES(?, ?, ?, ?, ?, ?, ?)`
  ).run(
    t,
    String(actor_role),
    Number(actor_user_id),
    String(action),
    channel_id === undefined || channel_id === null ? null : Number(channel_id),
    supplier_user_id === undefined || supplier_user_id === null ? null : Number(supplier_user_id),
    message ? String(message) : null,
  );
}

export function listAuditByChannel(db, channelId, { limit = 50 } = {}) {
  return db
    .prepare(
      `SELECT id, created_at, actor_role, actor_user_id, action, channel_id, supplier_user_id, message
       FROM audit_log
       WHERE channel_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
    )
    .all(Number(channelId), Number(limit));
}
