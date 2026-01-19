import React, { useMemo, useState } from 'react';

function statusInfo(status) {
  const enabled = status === 1;
  return {
    enabled,
    label: enabled ? 'Enabled' : 'Disabled',
  };
}

export default function ChannelDetail({ channel, onToggle, onUpdateKey, onRefreshQuota, busy }) {
  const [newKey, setNewKey] = useState('');

  const info = useMemo(() => statusInfo(channel?.status), [channel?.status]);

  if (!channel) {
    return (
      <div className='card animate-in'>
        <div className='card-inner'>
          <h2 className='card-title'>Channel</h2>
          <div className='small'>Select a channel on the left.</div>
        </div>
      </div>
    );
  }

  return (
    <div className='card animate-in'>
      <div className='card-inner'>
        <div className='row row-spread'>
          <div>
            <h2 className='card-title' style={{ margin: 0 }}>
              {channel.name}
            </h2>
            <div className='small'>ID {channel.id} · Type {channel.type}</div>
          </div>
          <div className='badge'>
            <span className={`dot ${info.enabled ? 'dot-on' : 'dot-off'}`} />
            <span>{info.label}</span>
          </div>
        </div>

        <div style={{ height: 14 }} />

        <div className='kv'>
          <div className='label'>Used quota</div>
          <div style={{ fontFamily: 'var(--mono)' }}>
            {Number(channel.used_quota ?? 0).toLocaleString()}
          </div>
        </div>

        <div className='kv'>
          <div className='label'>Actions</div>
          <div className='row'>
            <button
              className={`btn ${info.enabled ? 'btn-danger' : 'btn-primary'}`}
              disabled={busy}
              onClick={() => onToggle(channel.id, !info.enabled)}
            >
              {info.enabled ? 'Disable' : 'Enable'}
            </button>
            <button className='btn' disabled={busy} onClick={() => onRefreshQuota(channel.id)}>
              Refresh quota
            </button>
          </div>
        </div>

        <div style={{ height: 8 }} />

        <div className='label'>Update API key (write-only)</div>
        <div style={{ height: 6 }} />
        <input
          className='input'
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder='Paste new upstream API key'
          autoCapitalize='none'
          autoCorrect='off'
          spellCheck={false}
        />
        <div style={{ height: 10 }} />
        <div className='row row-spread'>
          <button
            className='btn btn-primary'
            disabled={busy || !newKey}
            onClick={() => {
              const v = newKey;
              setNewKey('');
              onUpdateKey(channel.id, v);
            }}
          >
            Submit key
          </button>
          <span className='small'>Key is never displayed after submission.</span>
        </div>
      </div>
    </div>
  );
}
