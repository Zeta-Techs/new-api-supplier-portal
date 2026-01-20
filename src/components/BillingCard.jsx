import React, { useEffect, useMemo, useState } from 'react';
import { getMyBilling, getMySettlements } from '../lib/api.js';
import { t } from '../lib/i18n.js';
import { centsToRmb, centsToUsd } from '../lib/money.js';
import { formatTs } from '../lib/time.js';

export default function BillingCard({ lang, busy, onBusyChange, pushToast }) {
  const [data, setData] = useState(null);
  const [settlements, setSettlements] = useState([]);

  const refresh = async () => {
    try {
      onBusyChange?.(true);
      const [d, s] = await Promise.all([getMyBilling(), getMySettlements()]);
      setData(d);
      setSettlements(s?.items || []);
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
  const settledUsd = useMemo(() => centsToUsd(data?.settled_cents), [data?.settled_cents]);
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
            <div className='table-wrap'>
              <table className='table'>
                <thead>
                  <tr>
                    <th>{t(lang, 'billing')}</th>
                    <th style={{ width: 220 }} />
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='small'>{t(lang, 'used_total_usd')}</td>
                    <td style={{ fontFamily: 'var(--mono)', textAlign: 'right' }}>{usedUsd}</td>
                  </tr>
                  <tr>
                    <td className='small'>{t(lang, 'used_total_rmb')}</td>
                    <td style={{ fontFamily: 'var(--mono)', textAlign: 'right' }}>{usedRmb}</td>
                  </tr>
                  <tr>
                    <td className='small'>{t(lang, 'settled_amount')} (USD)</td>
                    <td style={{ fontFamily: 'var(--mono)', textAlign: 'right' }}>{settledUsd}</td>
                  </tr>
                  <tr>
                    <td className='small'>{t(lang, 'settled_rmb')}</td>
                    <td style={{ fontFamily: 'var(--mono)', textAlign: 'right' }}>{settledRmb}</td>
                  </tr>
                  <tr>
                    <td className='small'>{t(lang, 'balance_rmb')}</td>
                    <td style={{ fontFamily: 'var(--mono)', textAlign: 'right' }}>{balanceRmb}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {missing.length ? (
              <div style={{ height: 10 }} />
            ) : null}

            {missing.length ? (
              <div className='small' style={{ color: 'rgba(255, 99, 99, 0.95)' }}>
                {t(lang, 'missing_factor')}: ({missing.join(', ')})
              </div>
            ) : null}

            <div style={{ height: 12 }} />

            <div className='row row-spread'>
              <h3 style={{ margin: 0 }}>{t(lang, 'ledger')}</h3>
              <span className='small'>{settlements.length ? `${settlements.length}` : '-'}</span>
            </div>

            <div style={{ height: 8 }} />

            {!settlements.length ? (
              <div className='small'>-</div>
            ) : (
              <div className='table-wrap'>
                <table className='table'>
                  <thead>
                    <tr>
                      <th>{t(lang, 'time')}</th>
                      <th style={{ width: 140 }}>{t(lang, 'amount')} (USD)</th>
                      <th style={{ width: 140 }}>{t(lang, 'amount')} (RMB)</th>
                      <th>{t(lang, 'note')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settlements
                      .slice()
                      .sort((a, b) => Number(b.created_at) - Number(a.created_at))
                      .map((s) => (
                        <tr key={s.id}>
                          <td style={{ fontFamily: 'var(--mono)' }}>{formatTs(lang, Number(s.created_at))}</td>
                          <td style={{ fontFamily: 'var(--mono)', textAlign: 'right' }}>{centsToUsd(s.amount_usd_cents)}</td>
                          <td style={{ fontFamily: 'var(--mono)', textAlign: 'right' }}>{centsToRmb(s.amount_rmb_cents)}</td>
                          <td>{s.note || ''}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </>

        )}
      </div>
    </div>
  );
}
