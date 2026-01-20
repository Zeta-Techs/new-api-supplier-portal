import { LANG } from './i18n.js';

const MAP = {
  // Portal auth / permissions
  'not authenticated': {
    zh: '未登录',
    en: 'Not authenticated',
  },
  'admin required': {
    zh: '需要管理员权限',
    en: 'Admin required',
  },
  'supplier required': {
    zh: '需要供应商权限',
    en: 'Supplier required',
  },
  'user disabled': {
    zh: '账号已被禁用',
    en: 'User disabled',
  },
  'cannot delete last admin': {
    zh: '无法删除最后一个管理员',
    en: 'Cannot delete last admin',
  },
  'new-api is not configured': {
    zh: '尚未配置 new-api 连接',
    en: 'new-api is not configured',
  },
  'no permission for channel operation': {
    zh: '无权执行该渠道操作',
    en: 'No permission for channel operation',
  },
  'proxy failed': {
    zh: '代理请求失败',
    en: 'Proxy failed',
  },
  'key retrieval is not supported in this portal': {
    zh: '本门户不支持读取渠道 Key（仅写入）',
    en: 'Key retrieval is not supported (write-only)',
  },

  // Setup
  'admin already exists': {
    zh: '管理员账号已存在',
    en: 'Admin already exists',
  },
  'username already exists': {
    zh: '用户名已存在',
    en: 'Username already exists',
  },
  'invalid credentials': {
    zh: '用户名或密码错误',
    en: 'Invalid credentials',
  },
};

export function localizeErrorMessage(lang, message) {
  const raw = String(message || '').trim();
  if (!raw) return raw;
  const entry = MAP[raw];
  if (!entry) return raw;
  return lang === LANG.EN ? entry.en : entry.zh;
}
