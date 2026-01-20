export function usdNumberFromQuota(q) {
  const n = Number(q ?? 0);
  return n / 500000;
}

export function usdCentsFromQuota(q) {
  const n = Number(q ?? 0);
  // USD = q / 500000
  // cents = USD * 100
  return Math.round((n * 100) / 500000);
}

export function rmbCentsFromQuotaAndFactor(q, factor) {
  if (factor === null || factor === undefined || factor === '') return null;
  const f = Number(factor);
  if (!Number.isFinite(f)) return null;
  const usdCents = usdCentsFromQuota(q);
  return Math.round(usdCents * f);
}

export function formatRmbCostFromQuotaAndFactor(q, factor) {
  const rmbCents = rmbCentsFromQuotaAndFactor(q, factor);
  if (rmbCents === null) return '-';
  return `¥${(rmbCents / 100).toFixed(2)}`;
}

export function formatUsdFromQuota(q) {
  const usd = usdNumberFromQuota(q);
  return `$${usd.toFixed(4)}`;
}

export function channelTypeLabel(type) {
  if (type === undefined || type === null) return '-';
  return String(type);
}
