import React from 'react';
import { t } from '../lib/i18n.js';
import { channelTypeLabel, formatRmbCostFromQuotaAndFactor, formatUsdFromQuota, rmbCentsFromQuotaAndFactor } from '../lib/format.js';

function statusLabel(lang, status) {
  return status === 1 ? t(lang, 'enable') : t(lang, 'disable');
}

function sortMark(sortKey, sortDir, key) {
  if (sortKey !== key) return '';
  return sortDir === 'asc' ? ' ^' : ' v';
}

export default function ChannelList({
  lang,
  channels,
  totalCount,
  selectedId,
  onSelect,
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  grantsByChannelId,
  onToggle,
  onTest,
  onRefreshQuota,
}) {
  const shown = channels?.length || 0;
  const total = Number.isFinite(totalCount) ? totalCount : shown;

  const [sortKey, setSortKey] = React.useState('id');
  const [sortDir, setSortDir] = React.useState('asc');

  const visible = React.useMemo(() => {
    const dir = sortDir === 'desc' ? -1 : 1;

    const getVal = (c) => {
      if (sortKey === 'id') return Number(c.id);
      if (sortKey === 'name') return String(c.name || '');
      if (sortKey === 'type') {
        const n = Number(c.type);
        return Number.isFinite(n) ? n : String(channelTypeLabel(c.type));
      }
      if (sortKey === 'status') return Number(c.status);
      if (sortKey === 'used') return Number(c.used_quota ?? 0);
      if (sortKey === 'factor') {
        const f = c.price_factor;
        return f === null || f === undefined ? -Infinity : Number(f);
      }
      if (sortKey === 'rmb_cost') {
        const rmbCents = rmbCentsFromQuotaAndFactor(c.used_quota, c.price_factor);
        return rmbCents === null ? -Infinity : Number(rmbCents);
      }
      return Number(c.id);
    };

    return (channels || [])
      .slice()
      .sort((a, b) => {
        const va = getVal(a);
        const vb = getVal(b);

        if (Number.isFinite(Number(va)) && Number.isFinite(Number(vb))) {
          const diff = (Number(va) - Number(vb)) * dir;
          if (diff !== 0) return diff;
          return (Number(a.id) - Number(b.id)) * dir;
        }

        const cmp = String(va).localeCompare(String(vb)) * dir;
        if (cmp !== 0) return cmp;
        return (Number(a.id) - Number(b.id)) * dir;
      });
  }, [channels, sortKey, sortDir]);

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

  return (
    <div className='card animate-in'>
      <div className='card-inner'>
        <div className='row row-spread'>
          <h2 className='card-title' style={{ margin: 0 }}>
            {t(lang, 'channels')}
          </h2>
          <span className='small'>
            {shown} shown · {total} total
          </span>
        </div>

        <div style={{ height: 12 }} />

        <div className='filterbar'>
          <div className='filterbar-left'>
            <div className='label'>{t(lang, 'search_channels')}</div>
            <input
              className='input input-search'
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder={t(lang, 'search_channels')}
              autoCapitalize='none'
              autoCorrect='off'
              spellCheck={false}
            />
          </div>

          <div className='filterbar-right'>
            <div className='label'>{t(lang, 'status')}</div>
            <div className='segmented'>
              <button
                className={`seg ${statusFilter === 'all' ? 'seg-active' : ''}`}
                onClick={() => onStatusFilterChange('all')}
                type='button'
              >
                {t(lang, 'all')}
              </button>
              <button
                className={`seg ${statusFilter === 'enabled' ? 'seg-active' : ''}`}
                onClick={() => onStatusFilterChange('enabled')}
                type='button'
              >
                {t(lang, 'enable')}
              </button>
              <button
                className={`seg ${statusFilter === 'disabled' ? 'seg-active' : ''}`}
                onClick={() => onStatusFilterChange('disabled')}
                type='button'
              >
                {t(lang, 'disable')}
              </button>
            </div>
          </div>
        </div>

        <div style={{ height: 12 }} />

        {!channels?.length ? (
          <div className='small'>{t(lang, 'no_channels_loaded')}</div>
        ) : (
          <div className='table-wrap'>
            <table className='table'>
              <thead>
                <tr>
                  <th>
                    <button className='btn' type='button' onClick={() => setSort('id')}>
                      ID{sortMark(sortKey, sortDir, 'id')}
                    </button>
                  </th>
                  <th>
                    <button className='btn' type='button' onClick={() => setSort('name')}>
                      Name{sortMark(sortKey, sortDir, 'name')}
                    </button>
                  </th>
                  <th>
                    <button className='btn' type='button' onClick={() => setSort('type')}>
                      Type{sortMark(sortKey, sortDir, 'type')}
                    </button>
                  </th>
                  <th>
                    <button className='btn' type='button' onClick={() => setSort('status')}>
                      {t(lang, 'status')}{sortMark(sortKey, sortDir, 'status')}
                    </button>
                  </th>
                  <th>
                    <button className='btn' type='button' onClick={() => setSort('used')}>
                      {t(lang, 'used_quota')}{sortMark(sortKey, sortDir, 'used')}
                    </button>
                  </th>
                  <th>
                    <button className='btn' type='button' onClick={() => setSort('factor')}>
                      {t(lang, 'factor')}{sortMark(sortKey, sortDir, 'factor')}
                    </button>
                  </th>
                  <th>
                    <button className='btn' type='button' onClick={() => setSort('rmb_cost')}>
                      {t(lang, 'rmb_cost')}{sortMark(sortKey, sortDir, 'rmb_cost')}
                    </button>
                  </th>
                  <th style={{ width: 260 }}>{t(lang, 'actions')}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((c) => {
                  const isActive = selectedId === c.id;
                  const enabled = Number(c.status) === 1;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => onSelect(c.id)}
                      style={{ cursor: 'pointer', background: isActive ? 'rgba(45, 212, 191, 0.10)' : undefined }}
                    >
                      <td style={{ fontFamily: 'var(--mono)' }}>{c.id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                      </td>
                      <td>{channelTypeLabel(c.type)}</td>
                      <td>
                        <span className='badge'>
                          <span className={`dot ${enabled ? 'dot-on' : 'dot-off'}`} />
                          {enabled ? t(lang, 'enable') : t(lang, 'disable')}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--mono)' }}>{formatUsdFromQuota(c.used_quota)}</td>
                      <td style={{ fontFamily: 'var(--mono)' }}>{c.price_factor === null || c.price_factor === undefined ? '-' : c.price_factor}</td>
                      <td style={{ fontFamily: 'var(--mono)' }}>{formatRmbCostFromQuotaAndFactor(c.used_quota, c.price_factor)}</td>
                      <td>
                        <div className='row' style={{ gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            className={`btn ${enabled ? 'btn-danger' : 'btn-primary'}`}
                            type='button'
                            disabled={!grantsByChannelId?.get(String(c.id))?.canStatusUpdate}
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggle?.(c.id, !enabled);
                            }}
                          >
                            {enabled ? t(lang, 'disable') : t(lang, 'enable')}
                          </button>
                          <button
                            className='btn'
                            type='button'
                            disabled={!grantsByChannelId?.get(String(c.id))?.canUsageRefresh}
                            onClick={(e) => {
                              e.stopPropagation();
                              onRefreshQuota?.(c.id);
                            }}
                          >
                            {t(lang, 'refresh_usage')}
                          </button>
                          <button
                            className='btn'
                            type='button'
                            disabled={!grantsByChannelId?.get(String(c.id))?.canTest}
                            onClick={(e) => {
                              e.stopPropagation();
                              onTest?.(c.id);
                            }}
                          >
                            {t(lang, 'test')}
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
      </div>
    </div>
  );
}
