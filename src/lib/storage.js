const KEY = 'portalUser';

export function loadUser() {
  try {
    const raw = localStorage.getItem(KEY) || '';
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUser(user) {
  try {
    localStorage.setItem(KEY, JSON.stringify(user || null));
  } catch {
    // ignore
  }
}

export function clearUser() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
