import React from 'react';

function statusLabel(status) {
  return status === 1 ? 'Enabled' : 'Disabled';
}

export default function ChannelList({
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
            Channels
          </h2>
          <span className='small'>
            {shown} shown · {total} total
          </span>
        </div>

        <div style={{ height: 12 }} />

        <div className='filterbar'>
          <div className='filterbar-left'>
            <div className='label'>Search</div>
            <input
              className='input input-search'
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder='Search channel name'
              autoCapitalize='none'
              autoCorrect='off'
              spellCheck={false}
            />
          </div>

          <div className='filterbar-right'>
            <div className='label'>Status</div>
            <div className='segmented'>
              <button
                className={`seg ${statusFilter === 'all' ? 'seg-active' : ''}`}
                onClick={() => onStatusFilterChange('all')}
                type='button'
              >
                All
              </button>
              <button
                className={`seg ${statusFilter === 'enabled' ? 'seg-active' : ''}`}
                onClick={() => onStatusFilterChange('enabled')}
                type='button'
              >
                Enabled
              </button>
              <button
                className={`seg ${statusFilter === 'disabled' ? 'seg-active' : ''}`}
                onClick={() => onStatusFilterChange('disabled')}
                type='button'
              >
                Disabled
              </button>
            </div>
          </div>
        </div>

        <div style={{ height: 12 }} />

        {!channels?.length ? (
          <div className='small'>No channels match your filters.</div>
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
                      Type {c.type} · {statusLabel(c.status)}
                    </div>
                  </div>
                  <div className='badge'>
                    <span className={`dot ${c.status === 1 ? 'dot-on' : 'dot-off'}`} />
                    <span>Used {Number(c.used_quota ?? 0).toLocaleString()}</span>
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
