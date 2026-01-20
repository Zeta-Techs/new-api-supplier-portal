import React, { useMemo, useState } from 'react';

import { t } from '../lib/i18n.js';

function statusInfo(lang, status) {
  const enabled = status === 1;
  return {
    enabled,
    label: enabled ? t(lang, 'enable') : t(lang, 'disable'),
  };
}

export default function ChannelDetail({ lang, channel, onToggle, onUpdateKey, onRefreshQuota, onTest, busy }) {
  const [newKey, setNewKey] = useState('');

  const info = useMemo(() => statusInfo(lang, channel?.status), [lang, channel?.status]);

  if (!channel) {
    return (
      <div className='card animate-in'>
        <div className='card-inner'>
          <h2 className='card-title'>{t(lang, 'channels')}</h2>
          <div className='small'>{t(lang, 'select_supplier_to_view')}</div>
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
          <div className='label'>{t(lang, 'used_quota')}</div>
          <div style={{ fontFamily: 'var(--mono)' }}>{Number(channel.used_quota ?? 0).toLocaleString()}</div>
        </div>

        <div className='kv'>
          <div className='label'>{t(lang, 'balance')}</div>
          <div style={{ fontFamily: 'var(--mono)' }}>
            {channel.balance === undefined || channel.balance === null
              ? '-'
              : `$${Number(channel.balance).toFixed(4)}`}
          </div>
        </div>

        <div className='kv'>
          <div className='label'>{t(lang, 'actions')}</div>
          <div className='row'>
            <button
              className={`btn ${info.enabled ? 'btn-danger' : 'btn-primary'}`}
              disabled={busy}
              onClick={() => onToggle(channel.id, !info.enabled)}
            >
              {info.enabled ? t(lang, 'disable') : t(lang, 'enable')}
            </button>
            <button className='btn' disabled={busy} onClick={() => onRefreshQuota(channel.id)}>
              {t(lang, 'refresh_usage')}
            </button>
            <button className='btn' disabled={busy || !onTest} onClick={() => onTest?.(channel.id)}>
              {t(lang, 'test')}
            </button>
          </div>
        </div>

        <div style={{ height: 8 }} />

        <div className='label'>{t(lang, 'key_write_only')}</div>
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
            {t(lang, 'submit_key')}
          </button>
          <span className='small'>{t(lang, 'notes_key_write_only')}</span>
        </div>
      </div>
    </div>
  );
}
