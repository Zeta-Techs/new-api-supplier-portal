import { nowMs } from './auth.js';
import { setSettledCents, setSettledRmbCents } from './billing_repo.js';

export function listSettlements(db, supplierUserId, { limit = 50 } = {}) {
  return db
    .prepare(
      'SELECT id, supplier_user_id, created_at, amount_usd_cents, amount_rmb_cents, settled_total_rmb_cents, balance_rmb_cents, note FROM supplier_settlements WHERE supplier_user_id = ? ORDER BY created_at DESC LIMIT ?',
    )
    .all(Number(supplierUserId), Number(limit));
}

function sumLedgerRmb(db, supplierUserId) {
  const row = db
    .prepare('SELECT COALESCE(SUM(amount_rmb_cents), 0) AS s FROM supplier_settlements WHERE supplier_user_id = ?')
    .get(Number(supplierUserId));
  return Number(row?.s || 0);
}

function sumLedgerUsd(db, supplierUserId) {
  const row = db
    .prepare('SELECT COALESCE(SUM(amount_usd_cents), 0) AS s FROM supplier_settlements WHERE supplier_user_id = ?')
    .get(Number(supplierUserId));
  return Number(row?.s || 0);
}

export function getSettlementTotals(db, supplierUserId) {
  return {
    settled_usd_cents: sumLedgerUsd(db, supplierUserId),
    settled_rmb_cents: sumLedgerRmb(db, supplierUserId),
  };
}

export function appendSettlement(db, supplierUserId, { amount_usd_cents = 0, amount_rmb_cents, balance_rmb_cents, note }) {
  const amountUsd = Number(amount_usd_cents) || 0;
  const amountRmb = Number(amount_rmb_cents) || 0;
  const t = nowMs();

  const nextSettledTotalRmb = sumLedgerRmb(db, supplierUserId) + amountRmb;

  // Caller provides current balance snapshot; ledger stores post-settlement balance.
  const preBalance = Number(balance_rmb_cents) || 0;
  const postBalance = preBalance + amountRmb;

  db.prepare(
    `INSERT INTO supplier_settlements(
      supplier_user_id,
      created_at,
      amount_usd_cents,
      amount_rmb_cents,
      settled_total_rmb_cents,
      balance_rmb_cents,
      note
    ) VALUES(?, ?, ?, ?, ?, ?, ?)
    `,
  ).run(
    Number(supplierUserId),
    t,
    amountUsd,
    amountRmb,
    nextSettledTotalRmb,
    postBalance,
    note ? String(note) : null,
  );

  // keep supplier_billing in sync (legacy fields used across billing calculations)
  setSettledCents(db, supplierUserId, sumLedgerUsd(db, supplierUserId));
  setSettledRmbCents(db, supplierUserId, nextSettledTotalRmb);

  return nextSettledTotalRmb;
}

export function updateSettlement(db, supplierUserId, settlementId, patch) {
  const row = db
    .prepare(
      'SELECT id, supplier_user_id, created_at, amount_usd_cents, amount_rmb_cents, note FROM supplier_settlements WHERE id = ? AND supplier_user_id = ?',
    )
    .get(Number(settlementId), Number(supplierUserId));
  if (!row) return { ok: false, message: 'not found' };

  const createdAt = patch?.created_at === undefined ? Number(row.created_at) : Number(patch.created_at);
  const usd =
    patch?.amount_usd_cents === undefined ? Number(row.amount_usd_cents || 0) : Number(patch.amount_usd_cents);
  const rmb =
    patch?.amount_rmb_cents === undefined ? Number(row.amount_rmb_cents || 0) : Number(patch.amount_rmb_cents);
  const note = patch?.note === undefined ? row.note : patch.note;

  if (!Number.isFinite(createdAt) || createdAt <= 0) return { ok: false, message: 'invalid created_at' };
  if (!Number.isFinite(usd)) return { ok: false, message: 'invalid amount_usd_cents' };
  if (!Number.isFinite(rmb)) return { ok: false, message: 'invalid amount_rmb_cents' };

  db.prepare(
    'UPDATE supplier_settlements SET created_at = ?, amount_usd_cents = ?, amount_rmb_cents = ?, note = ? WHERE id = ? AND supplier_user_id = ?',
  ).run(createdAt, usd, rmb, note ? String(note) : null, Number(settlementId), Number(supplierUserId));

  // recompute totals for the supplier ledger + keep billing settled cents in sync
  const nextSettledTotalRmb = sumLedgerRmb(db, supplierUserId);
  setSettledCents(db, supplierUserId, sumLedgerUsd(db, supplierUserId));
  setSettledRmbCents(db, supplierUserId, nextSettledTotalRmb);

  return { ok: true, settled_total_rmb_cents: nextSettledTotalRmb };
}

export function deleteSettlement(db, supplierUserId, settlementId) {
  const row = db
    .prepare('SELECT id FROM supplier_settlements WHERE id = ? AND supplier_user_id = ?')
    .get(Number(settlementId), Number(supplierUserId));
  if (!row) return { ok: false, message: 'not found' };

  db.prepare('DELETE FROM supplier_settlements WHERE id = ? AND supplier_user_id = ?').run(
    Number(settlementId),
    Number(supplierUserId),
  );

  const nextSettledTotalRmb = sumLedgerRmb(db, supplierUserId);
  setSettledCents(db, supplierUserId, sumLedgerUsd(db, supplierUserId));
  setSettledRmbCents(db, supplierUserId, nextSettledTotalRmb);

  return { ok: true, settled_total_rmb_cents: nextSettledTotalRmb };
}
