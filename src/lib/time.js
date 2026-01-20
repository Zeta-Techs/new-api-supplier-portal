import { LANG } from './i18n.js';

export function getPortalTimeZone() {
  // Build-time setting. For Docker deployments, set via build arg `VITE_TZ`.
  return import.meta.env.VITE_TZ || 'Asia/Shanghai';
}

function localeForLang(lang) {
  return lang === LANG.ZH ? 'zh-CN' : 'en-US';
}

export function formatTs(lang, tsMs) {
  const ms = Number(tsMs);
  if (!Number.isFinite(ms)) return '-';

  const tz = getPortalTimeZone();
  return new Intl.DateTimeFormat(localeForLang(lang), {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(ms));
}

export function formatDatetimeLocal(tsMs) {
  const ms = Number(tsMs);
  if (!Number.isFinite(ms)) return '';

  const tz = getPortalTimeZone();
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(ms));

  const byType = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  // datetime-local expects: YYYY-MM-DDTHH:mm
  return `${byType.year}-${byType.month}-${byType.day}T${byType.hour}:${byType.minute}`;
}

function tzOffsetMs(timeZone, atMs) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date(atMs));

  const byType = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const asUtc = Date.UTC(
    Number(byType.year),
    Number(byType.month) - 1,
    Number(byType.day),
    Number(byType.hour),
    Number(byType.minute),
    Number(byType.second),
  );
  return asUtc - atMs;
}

export function parseDatetimeLocal(value) {
  const v = String(value || '').trim();
  // Expect: YYYY-MM-DDTHH:mm
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!m) return null;

  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const hh = Number(m[4]);
  const mm = Number(m[5]);
  if (![y, mo, d, hh, mm].every((x) => Number.isFinite(x))) return null;

  // Treat the input as wall-clock time in configured timezone.
  const tz = getPortalTimeZone();

  // First pass: assume the wall time is UTC.
  let guess = Date.UTC(y, mo - 1, d, hh, mm, 0);
  // Convert wall time in tz -> real epoch by subtracting tz offset.
  const off1 = tzOffsetMs(tz, guess);
  guess = guess - off1;

  // Second pass to stabilize around DST boundaries.
  const off2 = tzOffsetMs(tz, guess);
  const out = Date.UTC(y, mo - 1, d, hh, mm, 0) - off2;

  return Number.isFinite(out) ? out : null;
}
