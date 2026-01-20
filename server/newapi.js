import { getNewApiConfig } from './config.js';

function normalizeBaseUrl(baseUrl) {
  if (!baseUrl) return null;
  return String(baseUrl).replace(/\/$/, '');
}

export function getNewApiRequestHeaders(db) {
  const cfg = getNewApiConfig(db);
  if (!cfg.baseUrl || !cfg.accessToken || !cfg.userId) return null;
  return {
    baseUrl: normalizeBaseUrl(cfg.baseUrl),
    headers: {
      Authorization: String(cfg.accessToken),
      'New-Api-User': String(cfg.userId),
      'Content-Type': 'application/json',
    },
  };
}

export async function newApiRequest(db, path, { method = 'GET', query, body } = {}) {
  const conn = getNewApiRequestHeaders(db);
  if (!conn) throw new Error('new-api connection not configured');

  const url = new URL(`${conn.baseUrl}${path}`);
  if (query && typeof query === 'object') {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url.toString(), {
    method,
    headers: conn.headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error(`new-api HTTP ${res.status}`);
  }

  if (!res.ok) {
    throw new Error(json?.message || `new-api HTTP ${res.status}`);
  }
  if (json?.success === false) {
    throw new Error(json?.message || 'new-api request failed');
  }
  return json;
}
