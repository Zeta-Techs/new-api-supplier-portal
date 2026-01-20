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
      created_at INTEGER NOT NULL
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

    CREATE TABLE IF NOT EXISTS supplier_grants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_user_id INTEGER NOT NULL,
      channel_id INTEGER NOT NULL,
      operations_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      UNIQUE(supplier_user_id, channel_id),
      FOREIGN KEY(supplier_user_id) REFERENCES portal_users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_supplier_grants_supplier ON supplier_grants(supplier_user_id);
    CREATE INDEX IF NOT EXISTS idx_supplier_grants_channel ON supplier_grants(channel_id);
  `);
}
