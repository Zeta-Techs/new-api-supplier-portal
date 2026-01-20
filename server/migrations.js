import { nowMs } from './auth.js';

export function migrateDb(db) {
  // Add columns to portal_users if needed.
  const cols = db.prepare('PRAGMA table_info(portal_users)').all();
  const names = new Set(cols.map((c) => c.name));

  if (!names.has('disabled')) {
    db.exec("ALTER TABLE portal_users ADD COLUMN disabled INTEGER NOT NULL DEFAULT 0");
  }
  if (!names.has('updated_at')) {
    const t = nowMs();
    db.exec(`ALTER TABLE portal_users ADD COLUMN updated_at INTEGER NOT NULL DEFAULT ${t}`);
    db.exec('UPDATE portal_users SET updated_at = created_at WHERE updated_at IS NULL');
  }

  // supplier_billing table
  db.exec(`
    CREATE TABLE IF NOT EXISTS supplier_billing (
      supplier_user_id INTEGER PRIMARY KEY,
      settled_cents INTEGER NOT NULL DEFAULT 0,
      settled_rmb_cents INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY(supplier_user_id) REFERENCES portal_users(id) ON DELETE CASCADE
    );
  `);

  // add settled_rmb_cents if table exists without it
  const billingCols = db.prepare('PRAGMA table_info(supplier_billing)').all();
  const billingNames = new Set(billingCols.map((c) => c.name));
  if (!billingNames.has('settled_rmb_cents')) {
    db.exec('ALTER TABLE supplier_billing ADD COLUMN settled_rmb_cents INTEGER NOT NULL DEFAULT 0');
  }

  // channel_pricing table
  db.exec(`
    CREATE TABLE IF NOT EXISTS channel_pricing (
      channel_id INTEGER PRIMARY KEY,
      factor_rmb_per_usd REAL NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  // supplier_settlements ledger
  db.exec(`
    CREATE TABLE IF NOT EXISTS supplier_settlements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_user_id INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      amount_usd_cents INTEGER NOT NULL DEFAULT 0,
      amount_rmb_cents INTEGER NOT NULL,
      settled_total_rmb_cents INTEGER NOT NULL,
      balance_rmb_cents INTEGER NOT NULL,
      note TEXT,
      FOREIGN KEY(supplier_user_id) REFERENCES portal_users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_supplier_settlements_supplier ON supplier_settlements(supplier_user_id);
    CREATE INDEX IF NOT EXISTS idx_supplier_settlements_created_at ON supplier_settlements(created_at);
  `);

  // add amount_usd_cents if table exists without it
  const settlementsCols = db.prepare('PRAGMA table_info(supplier_settlements)').all();
  const settlementsNames = new Set(settlementsCols.map((c) => c.name));
  if (!settlementsNames.has('amount_usd_cents')) {
    db.exec('ALTER TABLE supplier_settlements ADD COLUMN amount_usd_cents INTEGER NOT NULL DEFAULT 0');
  }

  // audit_log
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at INTEGER NOT NULL,
      actor_role TEXT NOT NULL,
      actor_user_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      channel_id INTEGER,
      supplier_user_id INTEGER,
      message TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
    CREATE INDEX IF NOT EXISTS idx_audit_log_channel_id ON audit_log(channel_id);
    CREATE INDEX IF NOT EXISTS idx_audit_log_supplier_user_id ON audit_log(supplier_user_id);
  `);
}
