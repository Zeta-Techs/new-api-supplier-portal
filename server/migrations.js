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
}
