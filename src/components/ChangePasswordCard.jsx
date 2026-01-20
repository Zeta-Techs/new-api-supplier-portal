import React, { useState } from 'react';
import { changeMyPassword } from '../lib/api.js';
import { t } from '../lib/i18n.js';

export default function ChangePasswordCard({ lang, busy, onBusyChange, pushToast, titleKey = 'change_password', inline = false }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');

  const submit = async () => {
    if (!current || !next || !confirm) return;
    if (next !== confirm) {
      pushToast?.(t(lang, 'toast_error'), t(lang, 'password_mismatch'));
      return;
    }
    try {
      onBusyChange?.(true);
      await changeMyPassword(current, next);
      setCurrent('');
      setNext('');
      setConfirm('');
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
        {!inline ? (
          <>
            <div className='row row-spread'>
              <h2 className='card-title' style={{ margin: 0 }}>
                {t(lang, titleKey)}
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

            <div className='label'>{t(lang, 'password_confirm')}</div>
            <div style={{ height: 6 }} />
            <input
              className='input'
              type='password'
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={busy}
            />

            <div style={{ height: 10 }} />

            <button className='btn btn-primary' onClick={submit} disabled={busy || !current || !next || !confirm || next !== confirm}>
              {t(lang, 'save')}
            </button>
          </>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <div className='row' style={{ alignItems: 'center', flexWrap: 'nowrap' }}>
              <h2 className='card-title' style={{ margin: 0, whiteSpace: 'nowrap' }}>
                {t(lang, titleKey)}
              </h2>

              <input
                className='input'
                style={{ padding: '8px 10px', width: 180 }}
                type='password'
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                disabled={busy}
                placeholder={t(lang, 'password_current')}
              />

              <input
                className='input'
                style={{ padding: '8px 10px', width: 180 }}
                type='password'
                value={next}
                onChange={(e) => setNext(e.target.value)}
                disabled={busy}
                placeholder={t(lang, 'password_new')}
              />

              <input
                className='input'
                style={{ padding: '8px 10px', width: 180 }}
                type='password'
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={busy}
                placeholder={t(lang, 'password_confirm')}
              />

              <button className='btn btn-primary' onClick={submit} disabled={busy || !current || !next || !confirm || next !== confirm}>
                {t(lang, 'save')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
