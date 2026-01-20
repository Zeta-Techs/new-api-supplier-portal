export function formatUsdFromQuota(q) {
  const n = Number(q ?? 0);
  const usd = n / 500000;
  return `$${usd.toFixed(4)}`;
}
