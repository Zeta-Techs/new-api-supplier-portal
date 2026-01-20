import React, { useEffect, useState } from 'react';
import { getSetupStatus, login, setupAdmin } from '../lib/api.js';
import { t } from '../lib/i18n.js';

export default function PortalLogin({ lang, onAuthed, pushToast }) {
  const [loading, setLoading] = useState(true);
  const [setup, setSetup] = useState(null);
  const [mode, setMode] = useState('login'); // login | setup

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const refresh = async () => {
    setLoading(true);
    try {
      const s = await getSetupStatus();
      setSetup(s);
      if (!s?.has_admin) setMode('setup');
      else setMode('login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const submit = async () => {
    if (!username || !password) return;

    try {
      if (mode === 'setup') {
        await setupAdmin(username, password);
        await refresh();
      }

      const data = await login(username, password);
      onAuthed?.(data?.user);
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'error');
    }
  };

  return (
    <div className='card animate-in'>
      <div className='card-inner'>
        <h2 className='card-title'>
          {mode === 'setup' ? t(lang, 'setup_title') : t(lang, 'login_title')}
        </h2>
        {loading ? <div className='small'>Loading…</div> : null}

        {setup && mode === 'setup' ? <div className='small'>{t(lang, 'setup_hint')}</div> : null}

        <div style={{ height: 12 }} />

        <div className='label'>{t(lang, 'username')}</div>
        <div style={{ height: 6 }} />
        <input
          className='input'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder='admin'
          autoCapitalize='none'
          autoCorrect='off'
          spellCheck={false}
        />

        <div style={{ height: 12 }} />

        <div className='label'>{t(lang, 'password')}</div>
        <div style={{ height: 6 }} />
        <input
          className='input'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='••••••••'
          type='password'
          autoCapitalize='none'
          autoCorrect='off'
          spellCheck={false}
        />

        <div style={{ height: 12 }} />

        <div className='row row-spread'>
          <button className='btn btn-primary' onClick={submit} disabled={!username || !password}>
            {mode === 'setup' ? t(lang, 'setup_btn') : t(lang, 'login_btn')}
          </button>
          <span className='small'>Session cookie is stored by the server.</span>
        </div>
      </div>
    </div>
  );
}
