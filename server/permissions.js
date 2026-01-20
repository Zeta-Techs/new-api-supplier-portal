export const OPS = {
  KEY_UPDATE: 'channel.key.update',
  STATUS_UPDATE: 'channel.status.update',
  TEST: 'channel.test',
  USAGE_VIEW: 'channel.usage.view',
  USAGE_REFRESH: 'channel.usage.refresh',
};

export function normalizeOps(input) {
  const arr = Array.isArray(input) ? input : [];
  const set = new Set(arr.map((x) => String(x).trim()).filter(Boolean));
  return Array.from(set);
}

export function hasOp(ops, op) {
  if (!Array.isArray(ops)) return false;
  return ops.includes(op);
}
