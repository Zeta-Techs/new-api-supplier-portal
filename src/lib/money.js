export function centsToUsd(cents) {
  const c = Number(cents ?? 0);
  const usd = c / 100;
  return `$${usd.toFixed(2)}`;
}

export function usdToCents(usd) {
  const n = Number(usd);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export function centsToRmb(cents) {
  const c = Number(cents ?? 0);
  const rmb = c / 100;
  return `¥${rmb.toFixed(2)}`;
}

export function rmbToCents(rmb) {
  const n = Number(rmb);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}
