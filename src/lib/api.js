function getApiBase() {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (!base) return '';
  return String(base).replace(/\/$/, '');
}

export async function apiRequest(path, { method = 'GET', body, mapError } = {}) {
  const url = `${getApiBase()}${path}`;
  const headers = {
    'Content-Type': 'application/json',
  };

  const res = await fetch(url, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error(`HTTP ${res.status}`);
  }

  const rawMessage = json?.message || `HTTP ${res.status}`;

  if (!res.ok) {
    throw new Error(mapError ? mapError(rawMessage) : rawMessage);
  }
  if (json?.success === false) {
    throw new Error(mapError ? mapError(json?.message || 'Request failed') : json?.message || 'Request failed');
  }
  return json?.data;
}

// --- Portal auth ---
export async function getSetupStatus() {
  return apiRequest('/api/portal/setup/status');
}

export async function setupAdmin(username, password) {
  return apiRequest('/api/portal/setup/admin', { method: 'POST', body: { username, password } });
}

export async function login(username, password) {
  return apiRequest('/api/portal/auth/login', { method: 'POST', body: { username, password } });
}

export async function logout() {
  return apiRequest('/api/portal/auth/logout', { method: 'POST' });
}

export async function me() {
  return apiRequest('/api/portal/me');
}

// --- Admin APIs ---
export async function getNewApiConfig() {
  return apiRequest('/api/portal/admin/new-api');
}

export async function setNewApiConfig({ base_url, access_token, user_id }) {
  return apiRequest('/api/portal/admin/new-api', {
    method: 'POST',
    body: { base_url, access_token, user_id },
  });
}

export async function testNewApiConnection() {
  return apiRequest('/api/portal/admin/new-api/test', { method: 'POST' });
}

export async function listPortalUsers() {
  return apiRequest('/api/portal/admin/users');
}

export async function createPortalUser({ username, password, role }) {
  return apiRequest('/api/portal/admin/users', {
    method: 'POST',
    body: { username, password, role },
  });
}

export async function listSupplierGrants(supplierUserId) {
  return apiRequest(`/api/portal/admin/suppliers/${supplierUserId}/grants`);
}

export async function upsertSupplierGrant(supplierUserId, { channel_id, operations }) {
  return apiRequest(`/api/portal/admin/suppliers/${supplierUserId}/grants`, {
    method: 'POST',
    body: { channel_id, operations },
  });
}

export async function revokeSupplierGrant(supplierUserId, channelId) {
  return apiRequest(`/api/portal/admin/suppliers/${supplierUserId}/grants/${channelId}`, {
    method: 'DELETE',
  });
}

// --- Proxied new-api channel APIs ---
export async function listChannels(query = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    params.set(k, String(v));
  });
  const qs = params.toString();
  return apiRequest(`/api/channel${qs ? `?${qs}` : ''}`);
}

export async function listAllChannels({ pageSize = 100, maxPages = 200 } = {}) {
  // new-api caps page_size to 100, so use an effective page size
  // when determining whether we've reached the last page.
  const effectivePageSize = Math.min(Number(pageSize) || 100, 100);

  const items = [];
  let total = null;

  for (let p = 1; p <= maxPages; p++) {
    const data = await listChannels({ p, page_size: pageSize });
    const pageItems = Array.isArray(data?.items) ? data.items : [];
    items.push(...pageItems);

    if (typeof data?.total === 'number') total = data.total;

    // stop conditions
    if (!pageItems.length) break;
    if (total !== null && items.length >= total) break;
    if (pageItems.length < effectivePageSize) break;
  }

  return { items, total: total ?? items.length };
}

export async function getChannel(id) {
  return apiRequest(`/api/channel/${id}`);
}

export async function testChannel(id) {
  return apiRequest(`/api/channel/test/${id}`);
}

export async function refreshChannelBalance(id) {
  return apiRequest(`/api/channel/update_balance/${id}`);
}

export async function updateChannel({ id, key, status }) {
  const body = { id };
  if (key !== undefined) body.key = key;
  if (status !== undefined) body.status = status;
  return apiRequest('/api/channel/', { method: 'PUT', body });
}
