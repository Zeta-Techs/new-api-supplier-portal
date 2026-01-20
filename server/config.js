const CFG_KEYS = {
  NEW_API_BASE_URL: 'new_api.base_url',
  NEW_API_ACCESS_TOKEN: 'new_api.access_token',
  NEW_API_USER_ID: 'new_api.user_id',
};

export function getCfgKeys() {
  return { ...CFG_KEYS };
}

export function getConfigValue(db, key) {
  const row = db.prepare('SELECT value FROM portal_config WHERE key = ?').get(key);
  return row?.value ?? null;
}

export function setConfigValue(db, key, value) {
  db.prepare(
    'INSERT INTO portal_config(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
  ).run(key, String(value));
}

export function getNewApiConfig(db) {
  const baseUrl = getConfigValue(db, CFG_KEYS.NEW_API_BASE_URL);
  const accessToken = getConfigValue(db, CFG_KEYS.NEW_API_ACCESS_TOKEN);
  const userId = getConfigValue(db, CFG_KEYS.NEW_API_USER_ID);
  return {
    baseUrl,
    accessToken,
    userId: userId ? Number(userId) : null,
  };
}

export function hasNewApiConfig(db) {
  const c = getNewApiConfig(db);
  return Boolean(c.baseUrl && c.accessToken && c.userId);
}
