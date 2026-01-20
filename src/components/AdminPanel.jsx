import React, { useEffect, useMemo, useState } from 'react';
import {
  createPortalUser,
  getNewApiConfig,
  listChannels,
  listPortalUsers,
  listSupplierGrants,
  revokeSupplierGrant,
  setNewApiConfig,
  testNewApiConnection,
  upsertSupplierGrant,
} from '../lib/api.js';
import { t } from '../lib/i18n.js';

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
  const [selectedChannelIds, setSelectedChannelIds] = useState(() => new Set());

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
        const ch = await listChannels({ p: 1, page_size: 100 });
        setChannels(ch?.items || []);
      } else {
        setChannels([]);
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

  const toggleChannelSelect = (id) => {
    setSelectedChannelIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
        <div className='label'>{t(lang, 'base_url')}</div>
        <div style={{ height: 6 }} />
        <input
          className='input'
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder='http://localhost:3000'
          disabled={busy}
        />
        <div style={{ height: 10 }} />
        <div className='label'>{t(lang, 'new_api_user_id')}</div>
        <div style={{ height: 6 }} />
        <input
          className='input'
          value={newApiUserId}
          onChange={(e) => setNewApiUserId(e.target.value)}
          placeholder='1'
          disabled={busy}
        />
        <div style={{ height: 10 }} />
        <div className='label'>{t(lang, 'root_token')}</div>
        <div style={{ height: 6 }} />
        <input
          className='input'
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          placeholder={cfg?.configured ? '(leave blank to keep existing)' : 'paste access token'}
          disabled={busy}
        />
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
          <div className='list'>
            {channels
              .filter((c) => {
                const q = (channelQuery || '').trim().toLowerCase();
                if (!q) return true;
                return String(c.name || '').toLowerCase().includes(q) || String(c.id).includes(q);
              })
              .slice(0, 100)
              .map((c) => (
                <div key={c.id} className='item'>
                  <div className='row row-spread'>
                    <label className='row' style={{ gap: 10 }}>
                      <input
                        type='checkbox'
                        checked={selectedChannelIds.has(c.id)}
                        onChange={() => toggleChannelSelect(c.id)}
                        disabled={busy || !selectedSupplierId}
                      />
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div className='small'>ID {c.id} · Type {c.type} · Status {c.status}</div>
                      </div>
                    </label>
                    <div className='small'>{t(lang, 'used_quota')}: {Number(c.used_quota ?? 0).toLocaleString()}</div>
                  </div>
                </div>
              ))}
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
