const KEY = 'portalLang';

export const LANG = {
  ZH: 'zh',
  EN: 'en',
};

export function loadLang() {
  try {
    const v = localStorage.getItem(KEY);
    if (v === LANG.EN) return LANG.EN;
    return LANG.ZH;
  } catch {
    return LANG.ZH;
  }
}

export function saveLang(lang) {
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    // ignore
  }
}

export const DICT = {
  [LANG.ZH]: {
    app_title: '供应商渠道管理门户',
    app_sub: '仅管理已授权渠道（密钥仅写入，用量可查看/刷新）。',

    logout: '退出登录',

    notes_title: '说明',
    notes_proxy: '本系统通过服务端保存 Root Token 代理调用 new-api 的渠道管理接口。',
    notes_key_write_only: '渠道 Key 在此为“仅写入”：可更新，但不展示已保存 Key。',

    login_title: '登录',
    setup_title: '初始化',
    setup_hint: '当前系统尚无管理员账号，请创建第一个管理员。',
    username: '用户名',
    password: '密码',
    login_btn: '登录',
    setup_btn: '创建管理员并登录',

    admin_title: '管理员',
    refresh: '刷新',

    conn_title: 'new-api 连接',
    conn_desc: '配置目标 new-api 实例。access_token 仅保存在服务端。',
    base_url: 'Base URL',
    new_api_user_id: 'New-Api-User（root 用户 ID）',
    root_token: 'Root access_token',
    save_conn: '保存连接',
    test_conn: '测试连接',
    configured: '已配置',
    not_configured: '未配置',
    connected: '已连接',
    failed: '失败',

    create_supplier: '创建供应商账号',
    create: '创建',

    supplier_grants: '供应商授权',
    supplier: '供应商',
    select_supplier: '选择供应商…',
    channel_id: '渠道 ID',
    grant: '授权',
    status: '状态',
    all: '全部',

    channels: '渠道列表',
    channels_desc: '查看所有渠道并批量授权默认操作。',
    search_channels: '搜索渠道',
    grant_selected: '授权所选',
    configure_first: '请先配置 new-api 以加载渠道列表。',
    no_channels_loaded: '未加载到渠道。',
    channel_from_new_api: '来自 new-api 的渠道',
    grant_selected_n: '授权所选 ({n})',

    no_grants: '当前供应商尚无授权。',
    select_supplier_to_view: '选择供应商以查看已有授权。',
    revoke: '撤销',

    supplier_portal: '供应商',
    used_quota: '已用额度',
    balance: '余额',
    actions: '操作',
    enable: '启用',
    disable: '禁用',
    refresh_usage: '刷新用量',
    test: '测试',

    key_write_only: '更新 API Key（仅写入）',
    submit_key: '提交 Key',

    toast_saved: '已保存',
    toast_connected: '连接成功',
    toast_granted: '已授权',
    toast_revoked: '已撤销',
    toast_error: '错误',

    op_key_update: '更新 Key',
    op_status_update: '状态',
    op_test: '测试渠道',
    op_usage_view: '查看用量',
    op_usage_refresh: '刷新用量',

    granted_n: '已授权 {n} 个渠道',
    conn_tested: '已测试',

    billing: '费用统计',
    used_total: '已用总额',
    used_total_usd: '已用总额（USD）',
    used_total_rmb: '已用总额（RMB）',
    settled_amount: '已结算金额（USD）',
    settled_rmb: '已结算金额（RMB）',
    balance_amount: '费用结余',
    balance_rmb: '费用结余（RMB）',
    missing_factor: '缺失价格系数的渠道ID',

    factor: '价格系数',
    rmb_cost: '人民币费用',
    granted_suppliers: '授权供应商',
    add_supplier: '添加供应商',
    details: '详情',
    audit_log: '操作日志',
    ops: '权限',
    close: '关闭',
    sort: '排序',

    change_password: '修改密码',
    password_current: '当前密码',
    password_new: '新密码',
    save: '保存',

    supplier_mgmt: '供应商列表',
    supplier_mgmt_desc: '管理供应商账号：禁用/启用、删除、重置密码，以及维护已结算金额。',
    supplier_list: '供应商',
    reset_password: '重置密码',
    reset_password_row: '在每个供应商行内直接重置密码（无需下拉选择）。',
    delete: '删除',
    disabled: '已禁用',

    ledger: '结算记录',
    expand: '展开',
    collapse: '收起',
    settlement_amount_rmb: '本次结算金额（RMB）',
    settled_total: '结算总计',
    amount: '金额',
    add: '新增',
    time: '时间',
    note: '备注',
  },
  [LANG.EN]: {
    app_title: 'Supplier Channel Portal',
    app_sub: 'Manage granted channels only (key write-only, usage view/refresh).',

    logout: 'Logout',

    notes_title: 'Notes',
    notes_proxy: 'This portal proxies new-api channel management using a root token stored on the server.',
    notes_key_write_only: 'Keys are write-only here: you can update keys, but you cannot view stored keys.',

    login_title: 'Login',
    setup_title: 'First-time Setup',
    setup_hint: 'No admin exists yet. Create the first admin account.',
    username: 'Username',
    password: 'Password',
    login_btn: 'Login',
    setup_btn: 'Create admin & login',

    admin_title: 'Admin',
    refresh: 'Refresh',

    conn_title: 'new-api connection',
    conn_desc: 'Configure the target new-api instance. Access token is stored server-side.',
    base_url: 'Base URL',
    new_api_user_id: 'New-Api-User (root user id)',
    root_token: 'Root access_token',
    save_conn: 'Save connection',
    test_conn: 'Test connection',
    configured: 'Configured',
    not_configured: 'Not configured',
    connected: 'Connected',
    failed: 'Failed',

    create_supplier: 'Create supplier user',
    create: 'Create',

    supplier_grants: 'Supplier grants',
    supplier: 'Supplier',
    select_supplier: 'Select supplier…',
    channel_id: 'Channel ID',
    grant: 'Grant',
    status: 'Status',
    all: 'All',

    channels: 'Channels',
    channels_desc: 'Browse all channels and bulk grant default operations.',
    search_channels: 'Search channels',
    grant_selected: 'Grant selected',
    configure_first: 'Configure new-api first to load channels.',
    no_channels_loaded: 'No channels loaded.',
    channel_from_new_api: 'Channel from new-api',
    grant_selected_n: 'Grant selected ({n})',

    no_grants: 'No grants yet.',
    select_supplier_to_view: 'Select a supplier to view existing grants.',
    revoke: 'Revoke',

    supplier_portal: 'Supplier',
    used_quota: 'Used quota',
    balance: 'Balance',
    actions: 'Actions',
    enable: 'Enable',
    disable: 'Disable',
    refresh_usage: 'Refresh usage',
    test: 'Test',

    key_write_only: 'Update API key (write-only)',
    submit_key: 'Submit key',

    toast_saved: 'Saved',
    toast_connected: 'Connected',
    toast_granted: 'Granted',
    toast_revoked: 'Revoked',
    toast_error: 'Error',

    op_key_update: 'Update key',
    op_status_update: 'Status',
    op_test: 'Test channel',
    op_usage_view: 'View usage',
    op_usage_refresh: 'Refresh usage',

    granted_n: 'Granted {n} channels',
    conn_tested: 'Tested',

    billing: 'Billing',
    used_total: 'Used total',
    used_total_usd: 'Used total (USD)',
    used_total_rmb: 'Used total (RMB)',
    settled_amount: 'Settled (USD)',
    settled_rmb: 'Settled (RMB)',
    balance_amount: 'Balance',
    balance_rmb: 'Balance (RMB)',
    missing_factor: 'Missing factor channel IDs',

    factor: 'Factor',
    rmb_cost: 'RMB cost',
    granted_suppliers: 'Granted suppliers',
    add_supplier: 'Add supplier',
    details: 'Details',
    audit_log: 'Audit log',
    ops: 'Ops',
    close: 'Close',
    sort: 'Sort',

    change_password: 'Change password',
    password_current: 'Current password',
    password_new: 'New password',
    save: 'Save',

    supplier_mgmt: 'Suppliers',
    supplier_mgmt_desc: 'Manage supplier accounts: disable/enable, delete, reset password, and maintain settled amounts.',
    reset_password_row: 'Reset password inline per supplier row (no dropdown).',
    supplier_list: 'Suppliers',
    reset_password: 'Reset password',
    delete: 'Delete',
    disabled: 'Disabled',

    ledger: 'Settlement ledger',
    expand: 'Expand',
    collapse: 'Collapse',
    settlement_amount_rmb: 'Settlement amount (RMB)',
    settled_total: 'Settled total',
    amount: 'Amount',
    add: 'Add',
    time: 'Time',
    note: 'Note',
  },
};

export function t(lang, key, vars) {
  const table = DICT[lang] || DICT[LANG.ZH];
  let out = table[key] || key;
  if (vars && typeof vars === 'object') {
    for (const [k, v] of Object.entries(vars)) {
      out = out.replaceAll(`{${k}}`, String(v));
    }
  }
  return out;
}
