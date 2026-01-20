import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

const SESSION_TTL_MS = Number(process.env.PORTAL_SESSION_TTL_MS || 1000 * 60 * 60 * 24); // 24h
const COOKIE_NAME = process.env.PORTAL_SESSION_COOKIE || 'portal_session';

export function getCookieName() {
  return COOKIE_NAME;
}

export function nowMs() {
  return Date.now();
}

export function createSessionId() {
  return crypto.randomBytes(24).toString('hex');
}

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function sessionExpiryMs(createdAtMs) {
  return createdAtMs + SESSION_TTL_MS;
}

export function sanitizeUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    username: u.username,
    role: u.role,
    created_at: u.created_at,
  };
}
