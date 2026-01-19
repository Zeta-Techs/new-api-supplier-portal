import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Login from './components/Login.jsx';
import ChannelList from './components/ChannelList.jsx';
import ChannelDetail from './components/ChannelDetail.jsx';
import Toast from './components/Toast.jsx';
import { clearToken, loadToken, saveToken } from './lib/storage.js';
import {
  getChannelQuota,
  listSupplierChannels,
  setChannelEnabled,
  updateChannelKey,
} from './lib/api.js';

let toastSeq = 0;

export default function App() {
  const [token, setToken] = useState(loadToken());
  const [channels, setChannels] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toasts, setToasts] = useState([]);

  const [channelQuery, setChannelQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const selected = useMemo(
    () => channels.find((c) => c.id === selectedId) || null,
    [channels, selectedId],
  );

  const filteredChannels = useMemo(() => {
    const q = (channelQuery || '').trim().toLowerCase();
    return channels.filter((c) => {
      if (statusFilter === 'enabled' && c.status !== 1) return false;
      if (statusFilter === 'disabled' && c.status === 1) return false;
      if (q && !String(c.name || '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [channels, channelQuery, statusFilter]);

  const pushToast = useCallback((title, message) => {
    const id = ++toastSeq;
    setToasts((t) => [...t, { id, title, message }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const refreshChannels = useCallback(async () => {
    if (!token) return;
    const data = await listSupplierChannels(token);
    const items = data?.items || [];

    setChannels(items);
    setSelectedId((prev) => {
      if (!prev && items.length) return items[0].id;
      if (prev && !items.some((c) => c.id === prev)) return items.length ? items[0].id : null;
      return prev;
    });
  }, [token]);

  useEffect(() => {
    setChannelQuery('');
    setStatusFilter('all');
  }, [token]);

  useEffect(() => {
    let alive = true;
    if (!token) return;

    (async () => {
      try {
        setBusy(true);
        await refreshChannels();
        if (alive) pushToast('Connected', 'Supplier token accepted.');
      } catch (e) {
        if (!alive) return;
        clearToken();
        setToken('');
        setChannels([]);
        setSelectedId(null);
        pushToast('Auth failed', e?.message || 'Invalid token');
      } finally {
        if (alive) setBusy(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [token, refreshChannels, pushToast]);

  useEffect(() => {
    if (!token) return;

    if (!filteredChannels.length) {
      if (selectedId) setSelectedId(null);
      return;
    }

    if (!selectedId || !filteredChannels.some((c) => c.id === selectedId)) {
      setSelectedId(filteredChannels[0].id);
    }
  }, [token, filteredChannels, selectedId]);

  const onLogin = async (newToken) => {
    const t = (newToken || '').trim();
    if (!t) {
      pushToast('Missing token', 'Paste your supplier token first.');
      return;
    }
    saveToken(t);
    setToken(t);
  };

  const onLogout = () => {
    clearToken();
    setToken('');
    setChannels([]);
    setSelectedId(null);
    pushToast('Logged out', 'Token cleared.');
  };

  const onToggle = async (channelId, enabled) => {
    try {
      setBusy(true);
      await setChannelEnabled(token, channelId, enabled);
      pushToast('Updated', enabled ? 'Channel enabled.' : 'Channel disabled.');
      await refreshChannels();
    } catch (e) {
      pushToast('Error', e?.message || 'Failed to update channel');
    } finally {
      setBusy(false);
    }
  };

  const onUpdateKey = async (channelId, key) => {
    try {
      setBusy(true);
      await updateChannelKey(token, channelId, key);
      pushToast('Key submitted', 'New key stored (write-only).');
    } catch (e) {
      pushToast('Error', e?.message || 'Failed to submit key');
    } finally {
      setBusy(false);
    }
  };

  const onRefreshQuota = async (channelId) => {
    try {
      setBusy(true);
      const data = await getChannelQuota(token, channelId);
      const used = data?.used_quota;
      setChannels((prev) =>
        prev.map((c) => (c.id === channelId ? { ...c, used_quota: used } : c)),
      );
      pushToast('Refreshed', 'Quota updated.');
    } catch (e) {
      pushToast('Error', e?.message || 'Failed to refresh quota');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className='background-grid' />
      <div className='container'>
        <div className='header'>
          <div className='brand'>
            <div className='brand-title'>Supplier Channel Portal</div>
            <div className='brand-sub'>Manage granted channels only (key write-only, quota read-only).</div>
          </div>

          {token ? (
            <div className='pill'>
              <code>{token.slice(0, 12)}…</code>
              <button className='btn' onClick={() => refreshChannels()} disabled={busy}>
                Refresh
              </button>
              <button className='btn' onClick={onLogout}>
                Logout
              </button>
            </div>
          ) : null}
        </div>

        {!token ? (
          <div className='grid'>
            <Login initialToken={token} onSubmit={onLogin} />
            <div className='card animate-in'>
              <div className='card-inner'>
                <h2 className='card-title'>Notes</h2>
                <div className='small'>
                  This portal never displays stored channel keys. After you submit a key, it cannot be
                  retrieved here.
                </div>
                <div style={{ height: 10 }} />
                <div className='small'>
                  If you run this locally in dev, Vite can proxy `/api` to your backend.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='grid'>
            <ChannelList
              channels={filteredChannels}
              totalCount={channels.length}
              selectedId={selectedId}
              onSelect={setSelectedId}
              query={channelQuery}
              onQueryChange={setChannelQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
            <ChannelDetail
              channel={selected}
              busy={busy}
              onToggle={onToggle}
              onUpdateKey={onUpdateKey}
              onRefreshQuota={onRefreshQuota}
            />
          </div>
        )}
      </div>

      <div className='toast-wrap'>
        {toasts.map((t) => (
          <Toast key={t.id} id={t.id} title={t.title} message={t.message} onClose={removeToast} />
        ))}
      </div>
    </>
  );
}
