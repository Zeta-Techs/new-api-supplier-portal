import React, { useCallback, useEffect, useState } from 'react';
import PortalLogin from './components/PortalLogin.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import SupplierPortal from './components/SupplierPortal.jsx';
import Toast from './components/Toast.jsx';
import { clearUser, loadUser, saveUser } from './lib/storage.js';
import { logout, me } from './lib/api.js';
import { LANG, loadLang, saveLang, t } from './lib/i18n.js';
import { localizeErrorMessage } from './lib/error_i18n.js';

let toastSeq = 0;

export default function App() {
  const [user, setUser] = useState(loadUser());
  const [lang, setLang] = useState(loadLang());
  const [busy, setBusy] = useState(false);
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback(
    (title, message) => {
      const id = ++toastSeq;
      const titleStr = localizeErrorMessage(lang, title);
      const msgStr = message ? localizeErrorMessage(lang, message) : message;
      setToasts((t) => [...t, { id, title: titleStr, message: msgStr }]);
    },
    [lang],
  );

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const data = await me();
      const u = data?.user || null;
      if (u) {
        saveUser(u);
        setUser(u);
      } else {
        clearUser();
        setUser(null);
      }
    } catch {
      // not logged in
      clearUser();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const onLogout = async () => {
    try {
      setBusy(true);
      await logout();
    } catch {
      // ignore
    } finally {
      clearUser();
      setUser(null);
      setBusy(false);
      pushToast(t(lang, 'logout'), t(lang, 'logout')); // simple toast
    }
  };

  return (
    <>
      <div className='background-grid' />
      <div className='container'>
        <div className='header'>
          <div className='brand'>
            <div className='brand-title'>{t(lang, 'app_title')}</div>
            <div className='brand-sub'>{t(lang, 'app_sub')}</div>
          </div>

          <div className='pill'>
            <button
              className='btn'
              onClick={() => {
                const next = lang === LANG.ZH ? LANG.EN : LANG.ZH;
                setLang(next);
                saveLang(next);
              }}
              disabled={busy}
              type='button'
            >
              {lang === LANG.ZH ? '中文' : 'EN'}
            </button>

            {user ? (
              <>
                <span className='small'>
                  {user.username} · {user.role}
                </span>
                <button className='btn' onClick={onLogout} disabled={busy}>
                  {t(lang, 'logout')}
                </button>
              </>
            ) : null}
          </div>
        </div>

        {!user ? (
          <div className='grid'>
            <PortalLogin
              lang={lang}
              pushToast={pushToast}
              onAuthed={(u) => {
                saveUser(u);
                setUser(u);
                pushToast(t(lang, 'login_title'), `${u?.username}`);
              }}
            />
            <div className='card animate-in'>
              <div className='card-inner'>
                <h2 className='card-title'>{t(lang, 'notes_title')}</h2>
                <div className='small'>{t(lang, 'notes_proxy')}</div>
                <div style={{ height: 10 }} />
                <div className='small'>{t(lang, 'notes_key_write_only')}</div>
              </div>
            </div>
          </div>
        ) : user.role === 'admin' ? (
          <AdminPanel lang={lang} busy={busy} onBusyChange={setBusy} pushToast={pushToast} />
        ) : (
          <SupplierPortal lang={lang} busy={busy} onBusyChange={setBusy} pushToast={pushToast} />
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
