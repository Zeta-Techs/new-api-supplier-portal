import { nowMs } from './auth.js';

export function setUserDisabled(db, userId, disabled) {
  const t = nowMs();
  db.prepare('UPDATE portal_users SET disabled = ?, updated_at = ? WHERE id = ?').run(disabled ? 1 : 0, t, userId);
}

export function updateUserPasswordHash(db, userId, passwordHash) {
  const t = nowMs();
  db.prepare('UPDATE portal_users SET password_hash = ?, updated_at = ? WHERE id = ?').run(passwordHash, t, userId);
}

export function deleteUser(db, userId) {
  db.prepare('DELETE FROM portal_users WHERE id = ?').run(userId);
}
