import React, { useEffect, useMemo, useState } from 'react';
import { getMyBilling } from '../lib/api.js';
import { t } from '../lib/i18n.js';
import { centsToRmb, centsToUsd } from '../lib/money.js';

export default function BillingCard({ lang, busy, onBusyChange, pushToast }) {
  const [data, setData] = useState(null);

  const refresh = async () => {
    try {
      onBusyChange?.(true);
      const d = await getMyBilling();
      setData(d);
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed');
    } finally {
      onBusyChange?.(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const usedUsd = useMemo(() => centsToUsd(data?.used_usd_cents), [data?.used_usd_cents]);
  const usedRmb = useMemo(() => centsToRmb(data?.used_rmb_cents), [data?.used_rmb_cents]);
  const settledRmb = useMemo(() => centsToRmb(data?.settled_rmb_cents), [data?.settled_rmb_cents]);
  const balanceRmb = useMemo(() => centsToRmb(data?.balance_rmb_cents), [data?.balance_rmb_cents]);
  const missing = Array.isArray(data?.missing_factor_channel_ids) ? data.missing_factor_channel_ids : [];

  return (
    <div className='card animate-in'>
      <div className='card-inner'>
        <div className='row row-spread'>
          <h2 className='card-title' style={{ margin: 0 }}>
            {t(lang, 'billing')}
          </h2>
          <button className='btn' onClick={refresh} disabled={busy}>
            {t(lang, 'refresh')}
          </button>
        </div>

        <div style={{ height: 10 }} />

        {!data ? (
          <div className='small'>-</div>
        ) : (
          <>
            <div className='grid-3'>
              <div className='kv'>
                <div className='label'>{t(lang, 'used_total_usd')}</div>
                <div style={{ fontFamily: 'var(--mono)' }}>{usedUsd}</div>
              </div>
              <div className='kv'>
                <div className='label'>{t(lang, 'used_total_rmb')}</div>
                <div style={{ fontFamily: 'var(--mono)' }}>{usedRmb}</div>
              </div>
              <div className='kv'>
                <div className='label'>{t(lang, 'balance_rmb')}</div>
                <div style={{ fontFamily: 'var(--mono)' }}>{balanceRmb}</div>
              </div>
            </div>

            <div style={{ height: 10 }} />

            <div className='kv'>
              <div className='label'>{t(lang, 'settled_rmb')}</div>
              <div style={{ fontFamily: 'var(--mono)' }}>{settledRmb}</div>
            </div>

            {missing.length ? (
              <div style={{ height: 10 }} />
            ) : null}

            {missing.length ? (
              <div className='small' style={{ color: 'rgba(255, 99, 99, 0.95)' }}>
                {t(lang, 'missing_factor')}: ({missing.join(', ')})
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
