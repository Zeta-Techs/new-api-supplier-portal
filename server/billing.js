// NOTE: server-side uses cents to avoid float drift.

export function quotaToCents(usedQuota) {
  const q = Number(usedQuota ?? 0);
  // USD = q / 500000
  // cents = USD * 100
  return Math.round((q * 100) / 500000);
}

export function quotaToUsdNumber(usedQuota) {
  return quotaToCents(usedQuota) / 100;
}

export function quotaToUsdString(usedQuota) {
  const usd = quotaToUsdNumber(usedQuota);
  return `$${usd.toFixed(4)}`;
}

export function centsToUsdNumber(cents) {
  const c = Number(cents ?? 0);
  return c / 100;
}

export function centsToUsdString(cents) {
  const usd = centsToUsdNumber(cents);
  return `$${usd.toFixed(2)}`;
}
