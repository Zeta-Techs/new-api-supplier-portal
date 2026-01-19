function getApiBase() {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (!base) return '';
  return String(base).replace(/\/$/, '');
}

export async function apiRequest(path, { token, method = 'GET', body } = {}) {
  const url = `${getApiBase()}${path}`;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error(`HTTP ${res.status}`);
  }

  if (!res.ok) {
    throw new Error(json?.message || `HTTP ${res.status}`);
  }
  if (json?.success === false) {
    throw new Error(json?.message || 'Request failed');
  }
  return json?.data;
}

export async function listSupplierChannels(token) {
  return apiRequest('/api/supplier/channels', { token });
}

export async function setChannelEnabled(token, channelId, enabled) {
  return apiRequest(`/api/supplier/channels/${channelId}/status`, {
    token,
    method: 'POST',
    body: { enabled },
  });
}

export async function updateChannelKey(token, channelId, key) {
  return apiRequest(`/api/supplier/channels/${channelId}/key`, {
    token,
    method: 'POST',
    body: { key },
  });
}

export async function getChannelQuota(token, channelId) {
  return apiRequest(`/api/supplier/channels/${channelId}/quota`, { token });
}
