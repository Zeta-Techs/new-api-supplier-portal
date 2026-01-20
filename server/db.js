import Database from 'better-sqlite3';

const DB_FILE = process.env.PORTAL_DB_FILE || './portal.sqlite';

export function openDb() {
  const db = new Database(DB_FILE);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

export function initDb(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS portal_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','supplier')),
      disabled INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS portal_sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES portal_users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_portal_sessions_user_id ON portal_sessions(user_id);

    CREATE TABLE IF NOT EXISTS portal_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS new_api_connection_test (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      ok INTEGER NOT NULL,
      message TEXT NOT NULL,
      checked_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS supplier_billing (
      supplier_user_id INTEGER PRIMARY KEY,
      settled_cents INTEGER NOT NULL DEFAULT 0,
      settled_rmb_cents INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY(supplier_user_id) REFERENCES portal_users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS channel_pricing (
      channel_id INTEGER PRIMARY KEY,
      factor_rmb_per_usd REAL NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS supplier_grants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_user_id INTEGER NOT NULL,
      channel_id INTEGER NOT NULL,
      operations_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      UNIQUE(supplier_user_id, channel_id),
      FOREIGN KEY(supplier_user_id) REFERENCES portal_users(id) ON DELETE CASCADE
    );

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

    CREATE INDEX IF NOT EXISTS idx_supplier_grants_supplier ON supplier_grants(supplier_user_id);

    CREATE INDEX IF NOT EXISTS idx_supplier_grants_channel ON supplier_grants(channel_id);
  `);
}
