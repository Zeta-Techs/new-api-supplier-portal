import React, { useEffect, useMemo, useState } from 'react';
import SupplierManagement from './SupplierManagement.jsx';
import ChangePasswordCard from './ChangePasswordCard.jsx';
import {
  createPortalUser,
  getNewApiConfig,
  listAllChannels,
  listAllGrants,
  listChannelAudit,
  listChannelGrants,
  listChannelPricing,
  listPortalUsers,
  listSupplierGrants,
  revokeSupplierGrant,
  setNewApiConfig,
  testNewApiConnection,
  upsertChannelPricing,
  refreshChannelBalance,
  testChannel,
  updateChannel,
  upsertSupplierGrant,
} from '../lib/api.js';
import { t } from '../lib/i18n.js';
import { channelTypeLabel, formatUsdFromQuota, usdNumberFromQuota } from '../lib/format.js';

const OPS = [
  { id: 'channel.key.update', labelKey: 'op_key_update' },
  { id: 'channel.status.update', labelKey: 'op_status_update' },
  { id: 'channel.test', labelKey: 'op_test' },
  { id: 'channel.usage.view', labelKey: 'op_usage_view' },
  { id: 'channel.usage.refresh', labelKey: 'op_usage_refresh' },
];

export default function AdminPanel({ lang, busy, onBusyChange, pushToast }) {
  const [cfg, setCfg] = useState(null);
  const [users, setUsers] = useState([]);

  const [connTest, setConnTest] = useState(null);

  const [baseUrl, setBaseUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [newApiUserId, setNewApiUserId] = useState('');

  const [newUserName, setNewUserName] = useState('');
  const [newUserPass, setNewUserPass] = useState('');

  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const selectedSupplier = useMemo(
    () => users.find((u) => String(u.id) === String(selectedSupplierId)) || null,
    [users, selectedSupplierId],
  );

  const [grants, setGrants] = useState([]);
  const [grantChannelId, setGrantChannelId] = useState('');
  const [grantOps, setGrantOps] = useState(['channel.usage.view']);

  const suppliers = useMemo(() => users.filter((u) => u.role === 'supplier'), [users]);

  const [channels, setChannels] = useState([]);
  const [channelQuery, setChannelQuery] = useState('');

  const [pricing, setPricing] = useState([]);
  const [allGrants, setAllGrants] = useState([]);

  const [selectedChannelIds, setSelectedChannelIds] = useState(new Set());

  const [expandedChannelId, setExpandedChannelId] = useState(null);
  const [expandedGrants, setExpandedGrants] = useState([]);
  const [expandedAudit, setExpandedAudit] = useState([]);
  const [opsEditBySupplierId, setOpsEditBySupplierId] = useState({});

  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState('asc');

  const [addSupplierByChannel, setAddSupplierByChannel] = useState({});
  // removeSupplierByChannel was used for inline row revocation; now revoke lives in the details panel.

  const refresh = async () => {
    onBusyChange?.(true);
    try {
      const c = await getNewApiConfig();
      setCfg(c);
      setConnTest(c?.last_test || null);
      setBaseUrl(c?.base_url || '');
      setNewApiUserId(c?.user_id ? String(c.user_id) : '');

      const u = await listPortalUsers();
      setUsers(u?.users || []);

      if (c?.configured) {
        const ch = await listAllChannels({ pageSize: 100, maxPages: 200 });
        const items = (ch?.items || []).slice().sort((a, b) => Number(a.id) - Number(b.id));
        setChannels(items);
      } else {
        setChannels([]);
      }

      // pricing factors
      try {
        const p = await listChannelPricing();
        setPricing(p?.items || []);
      } catch {
        setPricing([]);
      }

      // grants (for channel table)
      try {
        const gAll = await listAllGrants();
        setAllGrants(gAll?.items || []);
      } catch {
        setAllGrants([]);
      }

      if (selectedSupplierId) {
        const g = await listSupplierGrants(selectedSupplierId);
        setGrants(g?.grants || []);
      }
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed to load admin data');
    } finally {
      onBusyChange?.(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    (async () => {
      if (!selectedSupplierId) {
        setGrants([]);
        return;
      }
      try {
        onBusyChange?.(true);
        const g = await listSupplierGrants(selectedSupplierId);
        setGrants(g?.grants || []);
      } catch (e) {
        pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed to load grants');
      } finally {
        onBusyChange?.(false);
      }
    })();
  }, [selectedSupplierId]);

  const saveCfg = async () => {
    try {
      onBusyChange?.(true);
      const res = await setNewApiConfig({ base_url: baseUrl, access_token: accessToken, user_id: newApiUserId });
      setConnTest(res?.last_test || null);
      pushToast?.(t(lang, 'toast_saved'), t(lang, 'toast_saved'));
      setAccessToken('');
      await refresh();
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed to save config');
    } finally {
      onBusyChange?.(false);
    }
  };

  const createSupplier = async () => {
    try {
      onBusyChange?.(true);
      await createPortalUser({ username: newUserName, password: newUserPass, role: 'supplier' });
      setNewUserName('');
      setNewUserPass('');
      pushToast?.(t(lang, 'create_supplier'), t(lang, 'toast_saved'));
      await refresh();
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed to create user');
    } finally {
      onBusyChange?.(false);
    }
  };

  const doTestConnection = async () => {
    try {
      onBusyChange?.(true);
      const r = await testNewApiConnection();
      setConnTest(r?.result || null);
      if (r?.result?.ok) pushToast?.(t(lang, 'connected'), r?.result?.message || 'OK');
      else pushToast?.(t(lang, 'failed'), r?.result?.message || 'Connection failed');
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed to test connection');
    } finally {
      onBusyChange?.(false);
    }
  };

  const toggleOp = (op) => {
    setGrantOps((prev) => {
      const set = new Set(prev);
      if (set.has(op)) set.delete(op);
      else set.add(op);
      return Array.from(set);
    });
  };

  const DEFAULT_OPS = [
    'channel.key.update',
    'channel.status.update',
    'channel.test',
    'channel.usage.view',
    'channel.usage.refresh',
  ];

  const saveGrant = async () => {
    try {
      onBusyChange?.(true);
      await upsertSupplierGrant(selectedSupplierId, {
        channel_id: Number(grantChannelId),
        operations: grantOps,
      });
      pushToast?.(t(lang, 'toast_granted'), t(lang, 'toast_granted'));
      setGrantChannelId('');
      setGrantOps(['channel.usage.view']);
      const g = await listSupplierGrants(selectedSupplierId);
      setGrants(g?.grants || []);
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed to update grant');
    } finally {
      onBusyChange?.(false);
    }
  };

  const pricingByChannelId = useMemo(() => {
    const m = new Map();
    (pricing || []).forEach((p) => m.set(String(p.channel_id), Number(p.factor_rmb_per_usd)));
    return m;
  }, [pricing]);

  const grantsByChannelId = useMemo(() => {
    const m = new Map();
    (allGrants || []).forEach((g) => {
      const cid = String(g.channel_id);
      const arr = m.get(cid) || [];
      arr.push(g);
      m.set(cid, arr);
    });
    return m;
  }, [allGrants]);

  const suppliersById = useMemo(() => {
    const m = new Map();
    (suppliers || []).forEach((s) => m.set(String(s.id), s));
    return m;
  }, [suppliers]);

  const visibleChannels = useMemo(() => {
    const q = (channelQuery || '').trim().toLowerCase();
    let rows = (channels || []).filter((c) => {
      if (!q) return true;
      return String(c.name || '').toLowerCase().includes(q) || String(c.id).includes(q);
    });

    const dir = sortDir === 'desc' ? -1 : 1;
    const key = sortKey;

    const getVal = (c) => {
      if (key === 'id') return Number(c.id);
      if (key === 'name') return String(c.name || '');
      if (key === 'type') return Number(c.type);
      if (key === 'status') return Number(c.status);
      if (key === 'used_usd') return usdNumberFromQuota(c.used_quota);
      if (key === 'factor') {
        const f = pricingByChannelId.get(String(c.id));
        return f === undefined ? -Infinity : Number(f);
      }
      if (key === 'rmb_cost') {
        const f = pricingByChannelId.get(String(c.id));
        return f === undefined ? -Infinity : usdNumberFromQuota(c.used_quota) * Number(f);
      }
      if (key === 'granted') {
        const arr = grantsByChannelId.get(String(c.id)) || [];
        return arr.length;
      }
      return Number(c.id);
    };

    rows = rows.slice().sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);

      // numeric
      if (Number.isFinite(Number(va)) && Number.isFinite(Number(vb))) {
        const diff = (Number(va) - Number(vb)) * dir;
        if (diff !== 0) return diff;
        return (Number(a.id) - Number(b.id)) * dir;
      }

      // string fallback
      const cmp = String(va).localeCompare(String(vb)) * dir;
      if (cmp !== 0) return cmp;
      return (Number(a.id) - Number(b.id)) * dir;
    });



    return rows;
  }, [channels, channelQuery, sortKey, sortDir, pricingByChannelId, grantsByChannelId]);

  const setSort = (key) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDir('asc');
      return key;
    });
  };

  const sortMark = (key) => {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' ^' : ' v';
  };

  const toggleSupplierOpForExpanded = (supplierUserId, opId) => {
    const sid = String(supplierUserId);
    setOpsEditBySupplierId((prev) => {
      const set = new Set(prev?.[sid] || []);
      if (set.has(opId)) set.delete(opId);
      else set.add(opId);
      return { ...prev, [sid]: Array.from(set) };
    });
  };

  const loadExpandedChannelDetails = async (channelId) => {
    const id = Number(channelId);
    if (!id) return;

    const g = await listChannelGrants(id);
    const items = g?.items || [];
    setExpandedGrants(items);
    setOpsEditBySupplierId(() => {
      const next = {};
      items.forEach((it) => {
        next[String(it.supplier_user_id)] = Array.isArray(it.operations) ? it.operations.slice() : [];
      });
      return next;
    });

    const a = await listChannelAudit(id);
    setExpandedAudit(a?.items || []);
  };

  const saveExpandedSupplierOps = async (channelId, supplierUserId) => {
    const id = Number(channelId);
    const sid = Number(supplierUserId);
    if (!id || !sid) return;

    const ops = opsEditBySupplierId?.[String(sid)] || [];
    if (!ops.length) return;

    try {
      onBusyChange?.(true);
      await upsertSupplierGrant(sid, {
        channel_id: id,
        operations: ops,
      });
      pushToast?.(t(lang, 'toast_saved'), t(lang, 'toast_saved'));

      // refresh grant list and the table's grants cache
      await loadExpandedChannelDetails(id);
      const gAll = await listAllGrants();
      setAllGrants(gAll?.items || []);
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed');
    } finally {
      onBusyChange?.(false);
    }
  };

  const toggleChannelSelect = (id) => {
    setSelectedChannelIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleExpandChannel = async (channelId) => {
    const id = Number(channelId);
    if (!id) return;

    if (expandedChannelId === id) {
      setExpandedChannelId(null);
      setExpandedGrants([]);
      setExpandedAudit([]);
      setOpsEditBySupplierId({});
      return;
    }

    setExpandedChannelId(id);
    try {
      onBusyChange?.(true);
      await loadExpandedChannelDetails(id);
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed to load channel details');
      setExpandedGrants([]);
      setExpandedAudit([]);
      setOpsEditBySupplierId({});
    } finally {
      onBusyChange?.(false);
    }
  };


  const addSupplierGrantForChannel = async (channelId) => {
    const supplierId = Number(addSupplierByChannel?.[channelId]);
    if (!supplierId) return;
    try {
      onBusyChange?.(true);
      await upsertSupplierGrant(supplierId, {
        channel_id: Number(channelId),
        operations: DEFAULT_OPS,
      });
      pushToast?.(t(lang, 'toast_granted'), t(lang, 'toast_granted'));
      setAddSupplierByChannel((prev) => ({ ...prev, [channelId]: '' }));
      await refresh();
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed');
    } finally {
      onBusyChange?.(false);
    }
  };

  const removeSupplierGrantForChannel = async (channelId, supplierUserId) => {
    try {
      onBusyChange?.(true);
      await revokeSupplierGrant(supplierUserId, Number(channelId));
      pushToast?.(t(lang, 'toast_revoked'), t(lang, 'toast_revoked'));
      await refresh();
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed');
    } finally {
      onBusyChange?.(false);
    }
  };

  const saveFactor = async (channelId, factorStr) => {
    const v = String(factorStr || '').trim();
    if (!v) return;
    const f = Number(v);
    if (!Number.isFinite(f) || f <= 0) {
      pushToast?.(t(lang, 'toast_error'), 'invalid factor');
      return;
    }

    try {
      onBusyChange?.(true);
      await upsertChannelPricing(channelId, f);
      pushToast?.(t(lang, 'toast_saved'), t(lang, 'toast_saved'));
      await refresh();
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed');
    } finally {
      onBusyChange?.(false);
    }
  };

  const adminToggle = async (channelId, enabled) => {
    try {
      onBusyChange?.(true);
      const status = enabled ? 1 : 2;
      await updateChannel({ id: channelId, status });
      pushToast?.(t(lang, 'toast_saved'), enabled ? t(lang, 'enable') : t(lang, 'disable'));
      await refresh();
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed to update channel');
    } finally {
      onBusyChange?.(false);
    }
  };

  const adminRefreshUsage = async (channelId) => {
    try {
      onBusyChange?.(true);
      await refreshChannelBalance(channelId);
      pushToast?.(t(lang, 'toast_saved'), t(lang, 'refresh_usage'));
      await refresh();
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed to refresh usage');
    } finally {
      onBusyChange?.(false);
    }
  };

  const adminTestChannel = async (channelId) => {
    try {
      onBusyChange?.(true);
      await testChannel(channelId);
      pushToast?.(t(lang, 'toast_saved'), t(lang, 'test'));
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed to test channel');
    } finally {
      onBusyChange?.(false);
    }
  };

  const bulkGrantSelected = async () => {
    if (!selectedSupplierId) return;
    const ids = Array.from(selectedChannelIds);
    if (!ids.length) return;

    try {
      onBusyChange?.(true);
      await Promise.all(
        ids.map((channelId) =>
          upsertSupplierGrant(selectedSupplierId, {
            channel_id: Number(channelId),
            operations: DEFAULT_OPS,
          }),
        ),
      );
      pushToast?.(t(lang, 'toast_granted'), t(lang, 'granted_n', { n: ids.length }));
      setSelectedChannelIds(new Set());
      const g = await listSupplierGrants(selectedSupplierId);
      setGrants(g?.grants || []);
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed to bulk grant');
    } finally {
      onBusyChange?.(false);
    }
  };

  const removeGrant = async (channelId) => {
    try {
      onBusyChange?.(true);
      await revokeSupplierGrant(selectedSupplierId, channelId);
      pushToast?.(t(lang, 'toast_revoked'), t(lang, 'toast_revoked'));
      const g = await listSupplierGrants(selectedSupplierId);
      setGrants(g?.grants || []);
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed to revoke grant');
    } finally {
      onBusyChange?.(false);
    }
  };

  return (
    <div className='card animate-in'>
      <div className='card-inner'>
        <div className='row row-spread'>
          <h2 className='card-title' style={{ margin: 0 }}>
            {t(lang, 'admin_title')}
          </h2>
          <button className='btn' onClick={refresh} disabled={busy}>
            {t(lang, 'refresh')}
          </button>
        </div>

        <div style={{ height: 14 }} />

        <h3 style={{ margin: '0 0 8px 0' }}>{t(lang, 'conn_title')}</h3>
        <div className='small'>{t(lang, 'conn_desc')}</div>
        <div style={{ height: 10 }} />

        <div className='row' style={{ alignItems: 'end', gap: 10 }}>
          <div style={{ flex: 2, minWidth: 260 }}>
            <div className='label'>{t(lang, 'base_url')}</div>
            <div style={{ height: 6 }} />
            <input
              className='input'
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder='http://localhost:3000'
              disabled={busy}
            />
          </div>
          <div style={{ width: 240 }}>
            <div className='label'>{t(lang, 'new_api_user_id')}</div>
            <div style={{ height: 6 }} />
            <input
              className='input'
              value={newApiUserId}
              onChange={(e) => setNewApiUserId(e.target.value)}
              placeholder='1'
              disabled={busy}
            />
          </div>
          <div style={{ flex: 2, minWidth: 260 }}>
            <div className='label'>{t(lang, 'root_token')}</div>
            <div style={{ height: 6 }} />
            <input
              className='input'
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder={cfg?.configured ? '(leave blank to keep existing)' : 'paste access token'}
              disabled={busy}
            />
          </div>
        </div>
        <div style={{ height: 10 }} />
        <div className='row'>
          <button className='btn btn-primary' onClick={saveCfg} disabled={busy || !baseUrl || !newApiUserId}>
            {t(lang, 'save_conn')}
          </button>
          <button className='btn' onClick={doTestConnection} disabled={busy || !cfg?.configured}>
            {t(lang, 'test_conn')}
          </button>
          {cfg?.configured ? (
            <span className='small'>{t(lang, 'configured')}</span>
          ) : (
            <span className='small'>{t(lang, 'not_configured')}</span>
          )}
          {connTest ? (
            <span className='small'>
              · {t(lang, 'conn_tested')} · {connTest.ok ? t(lang, 'connected') : t(lang, 'failed')} ·{' '}
              {new Date(connTest.checked_at).toLocaleString()} · {connTest.message}
            </span>
          ) : null}
        </div>

        <div style={{ height: 18 }} />

        <ChangePasswordCard
          lang={lang}
          busy={busy}
          onBusyChange={onBusyChange}
          pushToast={pushToast}
          titleKey='change_admin_password'
          inline
        />

        <div style={{ height: 18 }} />

        <SupplierManagement lang={lang} busy={busy} onBusyChange={onBusyChange} pushToast={pushToast} />

        <div style={{ height: 18 }} />

        <h3 style={{ margin: '0 0 8px 0' }}>{t(lang, 'create_supplier')}</h3>
        <div className='row' style={{ alignItems: 'end' }}>
          <div style={{ flex: 1 }}>
            <div className='label'>{t(lang, 'username')}</div>
            <div style={{ height: 6 }} />
            <input
              className='input'
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder='supplier-acme'
              disabled={busy}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div className='label'>{t(lang, 'password')}</div>
            <div style={{ height: 6 }} />
            <input
              className='input'
              value={newUserPass}
              onChange={(e) => setNewUserPass(e.target.value)}
              placeholder='••••••••'
              type='password'
              disabled={busy}
            />
          </div>
          <button className='btn btn-primary' onClick={createSupplier} disabled={busy || !newUserName || !newUserPass}>
            {t(lang, 'create')}
          </button>
        </div>

        <div style={{ height: 18 }} />

        <h3 style={{ margin: '0 0 8px 0' }}>{t(lang, 'supplier_grants')}</h3>
        <div className='small'>{t(lang, 'supplier_grants')}</div>
        <div style={{ height: 10 }} />

        <div className='row' style={{ alignItems: 'end' }}>
          <div style={{ flex: 1 }}>
            <div className='label'>{t(lang, 'supplier')}</div>
            <div style={{ height: 6 }} />
            <select
              className='input'
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              disabled={busy}
            >
              <option value=''>{t(lang, 'select_supplier')}</option>
              {suppliers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} (id {u.id})
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <div className='label'>{t(lang, 'channel_id')}</div>
            <div style={{ height: 6 }} />
            <input
              className='input'
              value={grantChannelId}
              onChange={(e) => setGrantChannelId(e.target.value)}
              placeholder='123'
              disabled={busy || !selectedSupplier}
            />
          </div>
          <button
            className='btn btn-primary'
            onClick={saveGrant}
            disabled={busy || !selectedSupplier || !grantChannelId || !grantOps.length}
          >
            {t(lang, 'grant')}
          </button>
        </div>

        <div style={{ height: 10 }} />

        <div className='row' style={{ flexWrap: 'wrap', gap: 10 }}>
          {OPS.map((o) => (
            <label key={o.id} className='small' style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type='checkbox'
                checked={grantOps.includes(o.id)}
                onChange={() => toggleOp(o.id)}
                disabled={busy || !selectedSupplier}
              />
              {t(lang, o.labelKey)}
            </label>
          ))}
        </div>

        <div style={{ height: 18 }} />

        <h3 style={{ margin: '0 0 8px 0' }}>{t(lang, 'channels')}</h3>
        <div className='small'>{t(lang, 'channels_desc')}</div>

        <div style={{ height: 10 }} />

        <div className='row row-spread'>
          <input
            className='input'
            style={{ flex: 1 }}
            value={channelQuery}
            onChange={(e) => setChannelQuery(e.target.value)}
            placeholder={t(lang, 'search_channels')}
            disabled={busy || !cfg?.configured}
          />
          <button
            className='btn btn-primary'
            onClick={bulkGrantSelected}
            disabled={busy || !cfg?.configured || !selectedSupplierId || !selectedChannelIds.size}
          >
            {t(lang, 'grant_selected_n', { n: selectedChannelIds.size })}
          </button>
        </div>

        <div style={{ height: 10 }} />

         {!cfg?.configured ? (
           <div className='small'>{t(lang, 'configure_first')}</div>
         ) : !channels.length ? (
           <div className='small'>{t(lang, 'no_channels_loaded')}</div>
         ) : (
           <div className='table-wrap'>
             <table className='table'>
               <thead>
                 <tr>
                   <th style={{ width: 40 }} />
                    <th>
                      <button className='btn' type='button' onClick={() => setSort('id')} disabled={busy}>
                        ID{sortMark('id')}
                      </button>
                    </th>
                    <th>
                      <button className='btn' type='button' onClick={() => setSort('name')} disabled={busy}>
                        Name{sortMark('name')}
                      </button>
                    </th>
                    <th>
                      <button className='btn' type='button' onClick={() => setSort('type')} disabled={busy}>
                        Type{sortMark('type')}
                      </button>
                    </th>
                    <th>
                      <button className='btn' type='button' onClick={() => setSort('status')} disabled={busy}>
                        {t(lang, 'status')}{sortMark('status')}
                      </button>
                    </th>
                    <th>
                      <button className='btn' type='button' onClick={() => setSort('used_usd')} disabled={busy}>
                        Used (USD){sortMark('used_usd')}
                      </button>
                    </th>
                    <th>
                      <button className='btn' type='button' onClick={() => setSort('factor')} disabled={busy}>
                        {t(lang, 'factor')}{sortMark('factor')}
                      </button>
                    </th>
                    <th>
                      <button className='btn' type='button' onClick={() => setSort('rmb_cost')} disabled={busy}>
                        {t(lang, 'rmb_cost')}{sortMark('rmb_cost')}
                      </button>
                    </th>
                    <th>
                      <button className='btn' type='button' onClick={() => setSort('granted')} disabled={busy}>
                        {t(lang, 'granted_suppliers')}{sortMark('granted')}
                      </button>
                    </th>
                    <th style={{ width: 230 }}>{t(lang, 'actions')}</th>
                    <th style={{ width: 110 }}>{t(lang, 'details')}</th>
                 </tr>
               </thead>
               <tbody>
                 {visibleChannels.map((c) => {
                   const channelId = Number(c.id);
                   const factor = pricingByChannelId.get(String(c.id));
                   const usdUsed = usdNumberFromQuota(c.used_quota);
                   const rmbCost = factor === undefined ? null : usdUsed * Number(factor);

                    const channelGrants = grantsByChannelId.get(String(c.id)) || [];


                   const isExpanded = expandedChannelId === channelId;

                   return (
                     <React.Fragment key={c.id}>
                       <tr>
                         <td>
                           <input
                             type='checkbox'
                             checked={selectedChannelIds.has(c.id)}
                             onChange={() => toggleChannelSelect(c.id)}
                             disabled={busy || !selectedSupplierId}
                           />
                         </td>
                         <td style={{ fontFamily: 'var(--mono)' }}>{c.id}</td>
                         <td>{c.name}</td>
                         <td>{channelTypeLabel(c.type)}</td>
                         <td>
                           <span className='badge'>
                             <span className={`dot ${Number(c.status) === 1 ? 'dot-on' : 'dot-off'}`} />
                             {Number(c.status) === 1 ? t(lang, 'enable') : t(lang, 'disable')}
                           </span>
                         </td>
                         <td style={{ fontFamily: 'var(--mono)' }}>{formatUsdFromQuota(c.used_quota)}</td>
                         <td>
                           <input
                             className='input'
                             style={{ width: 78, padding: '6px 8px' }}
                             defaultValue={factor === undefined ? '' : String(factor)}
                             placeholder=''
                             disabled={busy}
                             onBlur={(e) => saveFactor(c.id, e.target.value)}
                           />
                         </td>
                         <td style={{ fontFamily: 'var(--mono)' }}>{rmbCost === null ? '-' : `¥${rmbCost.toFixed(2)}`}</td>
                          <td>
                            <span className='badge'>
                              {t(lang, 'granted_suppliers')}: {channelGrants.length}
                            </span>
                          </td>

                          <td>
                            <div className='row' style={{ gap: 8, justifyContent: 'flex-end' }}>
                              <button
                                className={`btn ${Number(c.status) === 1 ? 'btn-danger' : 'btn-primary'}`}
                                type='button'
                                disabled={busy}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  adminToggle(channelId, Number(c.status) !== 1);
                                }}
                              >
                                {Number(c.status) === 1 ? t(lang, 'disable') : t(lang, 'enable')}
                              </button>
                              <button
                                className='btn'
                                type='button'
                                disabled={busy}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  adminRefreshUsage(channelId);
                                }}
                              >
                                {t(lang, 'refresh_usage')}
                              </button>
                              <button
                                className='btn'
                                type='button'
                                disabled={busy}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  adminTestChannel(channelId);
                                }}
                              >
                                {t(lang, 'test')}
                              </button>
                            </div>
                          </td>
                          <td>
                            <button className='btn' type='button' disabled={busy} onClick={() => toggleExpandChannel(channelId)}>
                              {isExpanded ? t(lang, 'close') : t(lang, 'details')}
                            </button>
                          </td>

                       </tr>

                       {!isExpanded ? null : (
                         <tr>
                           <td colSpan={11}>
                             <div className='card' style={{ margin: 10 }}>
                               <div className='card-inner'>
                                 <div className='row row-spread'>
                                   <div>
                                     <div style={{ fontWeight: 700 }}>{c.name}</div>
                                     <div className='small'>Channel {c.id}</div>
                                   </div>
                                   <button className='btn' type='button' disabled={busy} onClick={() => toggleExpandChannel(channelId)}>
                                     {t(lang, 'close')}
                                   </button>
                                 </div>

                                 <div style={{ height: 12 }} />

                                 <div className='row row-spread'>
                                   <h3 style={{ margin: '0 0 8px 0' }}>{t(lang, 'granted_suppliers')}</h3>
                                   <div className='row' style={{ alignItems: 'center', gap: 10 }}>
                                     <select
                                       className='input'
                                       style={{ padding: '8px 10px', minWidth: 200 }}
                                       value={addSupplierByChannel?.[channelId] || ''}
                                       onChange={(e) => setAddSupplierByChannel((prev) => ({ ...prev, [channelId]: e.target.value }))}
                                       disabled={busy}
                                     >
                                       <option value=''>{t(lang, 'add_supplier')}</option>
                                       {suppliers.map((s) => (
                                         <option key={s.id} value={s.id}>
                                           {s.username} (id {s.id})
                                         </option>
                                       ))}
                                     </select>
                                     <button
                                       className='btn btn-primary'
                                       type='button'
                                       disabled={busy || !addSupplierByChannel?.[channelId]}
                                       onClick={() => addSupplierGrantForChannel(channelId)}
                                     >
                                       {t(lang, 'add')}
                                     </button>
                                   </div>
                                 </div>

                                 {!expandedGrants.length ? (
                                   <div className='small'>-</div>
                                 ) : (
                                   <div className='table-wrap'>
                                     <table className='table'>
                                       <thead>
                                         <tr>
                                           <th>{t(lang, 'supplier')}</th>
                                           <th>{t(lang, 'ops')}</th>
                                           <th style={{ width: 140 }} />
                                         </tr>
                                       </thead>
                                       <tbody>
                                         {expandedGrants.map((g) => {
                                           const sid = String(g.supplier_user_id);
                                           const currentOps = opsEditBySupplierId?.[sid] || [];
                                           const supplierName =
                                             suppliersById.get(String(g.supplier_user_id))?.username ||
                                             g.username ||
                                             `#${g.supplier_user_id}`;

                                           return (
                                             <tr key={g.supplier_user_id}>
                                               <td>
                                                 {supplierName}{' '}
                                                 <span className='small'>(id {g.supplier_user_id})</span>
                                               </td>
                                               <td>
                                                 <div className='row' style={{ flexWrap: 'wrap', gap: 10 }}>
                                                   {OPS.map((o) => (
                                                     <label
                                                       key={o.id}
                                                       className='small'
                                                       style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                                                     >
                                                       <input
                                                         type='checkbox'
                                                         checked={currentOps.includes(o.id)}
                                                         onChange={() => toggleSupplierOpForExpanded(g.supplier_user_id, o.id)}
                                                         disabled={busy}
                                                       />
                                                       {t(lang, o.labelKey)}
                                                     </label>
                                                   ))}
                                                 </div>
                                               </td>
                                               <td>
                                                 <div className='row' style={{ justifyContent: 'flex-end' }}>
                                                   <button
                                                     className='btn'
                                                     type='button'
                                                     disabled={busy || !currentOps.length}
                                                     onClick={() => saveExpandedSupplierOps(channelId, g.supplier_user_id)}
                                                   >
                                                     {t(lang, 'save')}
                                                   </button>
                                                   <button
                                                     className='btn btn-danger'
                                                     type='button'
                                                     disabled={busy}
                                                     onClick={() => removeSupplierGrantForChannel(channelId, g.supplier_user_id)}
                                                   >
                                                     {t(lang, 'revoke')}
                                                   </button>
                                                 </div>
                                               </td>
                                             </tr>
                                           );
                                         })}
                                       </tbody>
                                     </table>
                                   </div>
                                 )}

                                 <div style={{ height: 14 }} />

                                 <h3 style={{ margin: '0 0 8px 0' }}>{t(lang, 'audit_log')}</h3>
                                 {!expandedAudit.length ? (
                                   <div className='small'>-</div>
                                 ) : (
                                   <div className='table-wrap'>
                                     <table className='table'>
                                       <thead>
                                         <tr>
                                           <th>{t(lang, 'time')}</th>
                                           <th>Actor</th>
                                           <th>Action</th>
                                           <th>{t(lang, 'supplier')}</th>
                                           <th>{t(lang, 'note')}</th>
                                         </tr>
                                       </thead>
                                       <tbody>
                                         {expandedAudit.map((a) => (
                                           <tr key={a.id}>
                                             <td style={{ fontFamily: 'var(--mono)' }}>{new Date(Number(a.created_at)).toLocaleString()}</td>
                                             <td style={{ fontFamily: 'var(--mono)' }}>
                                               {a.actor_role} #{a.actor_user_id}
                                             </td>
                                             <td style={{ fontFamily: 'var(--mono)' }}>{a.action}</td>
                                             <td style={{ fontFamily: 'var(--mono)' }}>{a.supplier_user_id || ''}</td>
                                             <td>{a.message || ''}</td>
                                           </tr>
                                         ))}
                                       </tbody>
                                     </table>
                                   </div>
                                 )}
                               </div>
                             </div>
                           </td>
                         </tr>
                       )}
                     </React.Fragment>
                   );
                 })}
               </tbody>
             </table>
           </div>
         )}


        <div style={{ height: 14 }} />

        {!selectedSupplier ? (
          <div className='small'>{t(lang, 'select_supplier_to_view')}</div>
        ) : !grants.length ? (
          <div className='small'>
            {t(lang, 'no_grants')} {selectedSupplier.username}
          </div>
        ) : (
          <div className='list'>
            {grants.map((g) => (
              <div key={g.channel_id} className='item'>
                <div className='row row-spread'>
                  <div>
                    <div style={{ fontWeight: 600 }}>Channel {g.channel_id}</div>
                    <div className='small'>{(g.operations || []).join(', ')}</div>
                  </div>
                  <button className='btn btn-danger' disabled={busy} onClick={() => removeGrant(g.channel_id)}>
                    {t(lang, 'revoke')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
