import React from 'react';
import { t } from '../lib/i18n.js';
import { formatUsdFromQuota } from '../lib/format.js';

function statusLabel(lang, status) {
  return status === 1 ? t(lang, 'enable') : t(lang, 'disable');
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
}) {
  const shown = channels?.length || 0;
  const total = Number.isFinite(totalCount) ? totalCount : shown;

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
          <div className='list'>
            {channels.map((c, idx) => (
              <div
                key={c.id}
                className={`item ${selectedId === c.id ? 'item-active' : ''}`}
                style={{ animationDelay: `${Math.min(idx * 30, 180)}ms` }}
                onClick={() => onSelect(c.id)}
              >
                <div className='row row-spread'>
                  <div>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div className='small'>
                      Type {c.type} · {statusLabel(lang, c.status)}
                    </div>
                  </div>
                  <div className='badge'>
                    <span className={`dot ${c.status === 1 ? 'dot-on' : 'dot-off'}`} />
                     <span>{t(lang, 'used_quota')}: {formatUsdFromQuota(c.used_quota)}</span>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
