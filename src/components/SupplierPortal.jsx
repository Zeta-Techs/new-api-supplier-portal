import React, { useCallback, useEffect, useMemo, useState } from 'react';
import BillingCard from './BillingCard.jsx';
import ChangePasswordCard from './ChangePasswordCard.jsx';
import ChannelList from './ChannelList.jsx';
import ChannelDetail from './ChannelDetail.jsx';
import { getChannel, listAllChannels, refreshChannelBalance, testChannel, updateChannel } from '../lib/api.js';

import { t } from '../lib/i18n.js';

function can(grants, op) {
  const list = Array.isArray(grants) ? grants : [];
  return list.includes(op);
}

function grantFlags(grants) {
  return {
    canKeyUpdate: can(grants, 'channel.key.update'),
    canStatusUpdate: can(grants, 'channel.status.update'),
    canTest: can(grants, 'channel.test'),
    canUsageRefresh: can(grants, 'channel.usage.refresh'),
  };
}

export default function SupplierPortal({ lang, busy, onBusyChange, pushToast }) {
  const [channels, setChannels] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [channelQuery, setChannelQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const selected = useMemo(
    () => channels.find((c) => c.id === selectedId) || null,
    [channels, selectedId],
  );

  const filteredChannels = useMemo(() => {
    const q = (channelQuery || '').trim().toLowerCase();
    return channels
      .filter((c) => {
        if (statusFilter === 'enabled' && c.status !== 1) return false;
        if (statusFilter === 'disabled' && c.status === 1) return false;
        if (q) {
          const name = String(c.name || '').toLowerCase();
          const id = String(c.id || '');
          if (!name.includes(q) && !id.includes(q)) return false;
        }
        return true;
      })
      .slice()
      .sort((a, b) => Number(a.id) - Number(b.id));
  }, [channels, channelQuery, statusFilter]);

  const refreshChannels = useCallback(async () => {
    onBusyChange?.(true);
    try {
      const data = await listAllChannels({ pageSize: 100, maxPages: 200 });
      const items = (data?.items || []).slice().sort((a, b) => Number(a.id) - Number(b.id));
      setChannels(items);
      setSelectedId((prev) => {
        if (!prev && items.length) return items[0].id;
        if (prev && !items.some((c) => c.id === prev)) return items.length ? items[0].id : null;
        return prev;
      });
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed to load channels');
    } finally {
      onBusyChange?.(false);
    }
  }, [onBusyChange, pushToast]);

  useEffect(() => {
    refreshChannels();
  }, [refreshChannels]);

  useEffect(() => {
    if (!filteredChannels.length) {
      if (selectedId) setSelectedId(null);
      return;
    }
    if (!selectedId || !filteredChannels.some((c) => c.id === selectedId)) {
      setSelectedId(filteredChannels[0].id);
    }
  }, [filteredChannels, selectedId]);

  const onToggle = async (channelId, enabled) => {
    try {
      onBusyChange?.(true);
      const status = enabled ? 1 : 2;
      await updateChannel({ id: channelId, status });
      pushToast?.(t(lang, 'toast_saved'), enabled ? t(lang, 'enable') : t(lang, 'disable'));
      await refreshChannels();
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed to update channel');
    } finally {
      onBusyChange?.(false);
    }
  };

  const onUpdateKey = async (channelId, key) => {
    try {
      onBusyChange?.(true);
      await updateChannel({ id: channelId, key });
      pushToast?.(t(lang, 'toast_saved'), t(lang, 'key_write_only'));
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed to submit key');
    } finally {
      onBusyChange?.(false);
    }
  };

  const onRefreshQuota = async (channelId) => {
    try {
      onBusyChange?.(true);
      await refreshChannelBalance(channelId);
      // Fetch the channel to get updated used_quota if needed.
      const updated = await getChannel(channelId);
      setChannels((prev) => prev.map((c) => (c.id === channelId ? { ...c, ...updated } : c)));
      pushToast?.(t(lang, 'toast_saved'), t(lang, 'refresh_usage'));
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed to refresh usage');
    } finally {
      onBusyChange?.(false);
    }
  };

  const onTest = async (channelId) => {
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

  const grantsByChannelId = useMemo(() => {
    const m = new Map();
    (filteredChannels || []).forEach((c) => {
      const grants = c?.grant_operations || c?.operations || [];
      m.set(String(c.id), grantFlags(grants));
    });
    return m;
  }, [filteredChannels]);

  const grantsForSelected = selected?.grant_operations || selected?.operations || [];
  const flagsForSelected = grantFlags(grantsForSelected);

  return (
    <>
      <div className='grid-2'>
        <BillingCard lang={lang} busy={busy} onBusyChange={onBusyChange} pushToast={pushToast} />
        <ChangePasswordCard lang={lang} busy={busy} onBusyChange={onBusyChange} pushToast={pushToast} />
      </div>

      <div style={{ height: 14 }} />

      <div className='grid'>
        <ChannelList
          lang={lang}
          channels={filteredChannels}
          totalCount={channels.length}
          selectedId={selectedId}
          onSelect={setSelectedId}
          query={channelQuery}
          onQueryChange={setChannelQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          grantsByChannelId={grantsByChannelId}
          onToggle={onToggle}
          onTest={onTest}
          onRefreshQuota={onRefreshQuota}
        />
        <ChannelDetail
          lang={lang}
          channel={selected}
          busy={busy}
          onToggle={flagsForSelected.canStatusUpdate ? onToggle : undefined}
          onUpdateKey={flagsForSelected.canKeyUpdate ? onUpdateKey : undefined}
          onRefreshQuota={flagsForSelected.canUsageRefresh ? onRefreshQuota : undefined}
          onTest={flagsForSelected.canTest ? onTest : undefined}
        />
      </div>
    </>
  );
}
