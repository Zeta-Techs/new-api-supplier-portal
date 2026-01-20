import { nowMs } from './auth.js';

export function getSettledCents(db, supplierUserId) {
  const row = db
    .prepare('SELECT settled_cents, settled_rmb_cents FROM supplier_billing WHERE supplier_user_id = ?')
    .get(supplierUserId);
  return {
    settled_cents: Number(row?.settled_cents || 0),
    settled_rmb_cents: Number(row?.settled_rmb_cents || 0),
  };
}

export function setSettledCents(db, supplierUserId, settledCents) {
  const t = nowMs();
  db.prepare(
    `INSERT INTO supplier_billing(supplier_user_id, settled_cents, updated_at)
     VALUES(?, ?, ?)
     ON CONFLICT(supplier_user_id) DO UPDATE SET settled_cents=excluded.settled_cents, updated_at=excluded.updated_at`,
  ).run(supplierUserId, Number(settledCents) || 0, t);
}

export function setSettledRmbCents(db, supplierUserId, settledRmbCents) {
  const t = nowMs();
  db.prepare(
    `INSERT INTO supplier_billing(supplier_user_id, settled_rmb_cents, updated_at)
     VALUES(?, ?, ?)
     ON CONFLICT(supplier_user_id) DO UPDATE SET settled_rmb_cents=excluded.settled_rmb_cents, updated_at=excluded.updated_at`,
  ).run(supplierUserId, Number(settledRmbCents) || 0, t);
}

export function listSupplierBillingRows(db) {
  return db
    .prepare(
      'SELECT supplier_user_id, settled_cents, settled_rmb_cents, updated_at FROM supplier_billing ORDER BY supplier_user_id ASC',
    )
    .all();
}
