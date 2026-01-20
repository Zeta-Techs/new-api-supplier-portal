export function usdNumberFromQuota(q) {
  const n = Number(q ?? 0);
  return n / 500000;
}

export function formatUsdFromQuota(q) {
  const usd = usdNumberFromQuota(q);
  return `$${usd.toFixed(4)}`;
}
