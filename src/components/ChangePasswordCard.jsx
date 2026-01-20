import React, { useState } from 'react';
import { changeMyPassword } from '../lib/api.js';
import { t } from '../lib/i18n.js';

export default function ChangePasswordCard({ lang, busy, onBusyChange, pushToast }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');

  const submit = async () => {
    if (!current || !next) return;
    try {
      onBusyChange?.(true);
      await changeMyPassword(current, next);
      setCurrent('');
      setNext('');
      pushToast?.(t(lang, 'toast_saved'), t(lang, 'toast_saved'));
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed');
    } finally {
      onBusyChange?.(false);
    }
  };

  return (
    <div className='card animate-in'>
      <div className='card-inner'>
        <div className='row row-spread'>
          <h2 className='card-title' style={{ margin: 0 }}>
            {t(lang, 'change_password')}
          </h2>
        </div>

        <div style={{ height: 10 }} />

        <div className='label'>{t(lang, 'password_current')}</div>
        <div style={{ height: 6 }} />
        <input
          className='input'
          type='password'
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          disabled={busy}
        />

        <div style={{ height: 10 }} />

        <div className='label'>{t(lang, 'password_new')}</div>
        <div style={{ height: 6 }} />
        <input
          className='input'
          type='password'
          value={next}
          onChange={(e) => setNext(e.target.value)}
          disabled={busy}
        />

        <div style={{ height: 10 }} />

        <button className='btn btn-primary' onClick={submit} disabled={busy || !current || !next}>
          {t(lang, 'save')}
        </button>
      </div>
    </div>
  );
}
