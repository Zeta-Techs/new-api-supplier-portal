import React, { useEffect, useMemo, useState } from 'react';
import SettlementLedger from './SettlementLedger.jsx';
import { deletePortalUser, listPortalUsers, listSupplierBilling, resetUserPassword, setUserDisabled } from '../lib/api.js';

import { t } from '../lib/i18n.js';
import { centsToRmb, centsToUsd } from '../lib/money.js';

function sumLedgerTotals(rows) {
  const list = Array.isArray(rows) ? rows : [];
  return list.reduce(
    (acc, r) => {
      acc.usd += Number(r?.amount_usd_cents || 0);
      acc.rmb += Number(r?.amount_rmb_cents || 0);
      return acc;
    },
    { usd: 0, rmb: 0 },
  );
}


export default function SupplierManagement({ lang, busy, onBusyChange, pushToast }) {
  const [users, setUsers] = useState([]);
  const [billing, setBilling] = useState([]);

  const [resetPassById, setResetPassById] = useState({});
  const [ledgerTotalsBySupplierId, setLedgerTotalsBySupplierId] = useState({});
  const [expandedSupplierId, setExpandedSupplierId] = useState(null);

  const refresh = async () => {
    try {
      onBusyChange?.(true);
      const u = await listPortalUsers();
      setUsers(u?.users || []);
      const b = await listSupplierBilling();
      setBilling(b?.items || []);
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed');
    } finally {
      onBusyChange?.(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const suppliers = useMemo(() => users.filter((u) => u.role === 'supplier'), [users]);

  const billingBySupplierId = useMemo(() => {
    const m = new Map();
    (billing || []).forEach((x) => {
      if (x?.supplier?.id) m.set(String(x.supplier.id), x);
    });
    return m;
  }, [billing]);

  const toggleDisable = async (userId, disabled) => {
    try {
      onBusyChange?.(true);
      await setUserDisabled(userId, disabled);
      pushToast?.(t(lang, 'toast_saved'), t(lang, 'toast_saved'));
      await refresh();
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed');
    } finally {
      onBusyChange?.(false);
    }
  };

  const doDelete = async (userId) => {
    try {
      onBusyChange?.(true);
      await deletePortalUser(userId);
      pushToast?.(t(lang, 'toast_saved'), t(lang, 'toast_saved'));
      await refresh();
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed');
    } finally {
      onBusyChange?.(false);
    }
  };

  const doResetPassword = async (userId) => {
    const pwd = String(resetPassById?.[userId] || '').trim();
    if (!pwd) return;

    try {
      onBusyChange?.(true);
      await resetUserPassword(userId, pwd);
      setResetPassById((prev) => ({ ...prev, [userId]: '' }));
      pushToast?.(t(lang, 'toast_saved'), t(lang, 'toast_saved'));
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed');
    } finally {
      onBusyChange?.(false);
    }
  };

  // USD settled is now derived from the settlement ledger and is read-only in this view.

  // Settled USD/RMB is now derived from the settlement ledger and is read-only in this view.

  return (
    <div className='card animate-in'>
      <div className='card-inner'>
        <div className='row row-spread'>
          <h2 className='card-title' style={{ margin: 0 }}>
            {t(lang, 'supplier_mgmt')}
          </h2>
          <button className='btn' onClick={refresh} disabled={busy}>
            {t(lang, 'refresh')}
          </button>
        </div>

        <div style={{ height: 10 }} />

        <div className='small'>{t(lang, 'supplier_mgmt_desc')}</div>

        <div style={{ height: 16 }} />

        <h3 style={{ margin: '0 0 8px 0' }}>{t(lang, 'reset_password')}</h3>
        <div className='small'>{t(lang, 'reset_password_row')}</div>

        <div style={{ height: 18 }} />

        <h3 style={{ margin: '0 0 8px 0' }}>{t(lang, 'supplier_list')}</h3>

        {!suppliers.length ? (
          <div className='small'>-</div>
        ) : (
          <div className='table-wrap'>
            <table className='table'>
              <thead>
                <tr>
                  <th style={{ minWidth: 220 }}>{t(lang, 'supplier')}</th>
                  <th style={{ minWidth: 120 }}>{t(lang, 'used_total_usd')}</th>
                  <th style={{ minWidth: 120 }}>{t(lang, 'used_total_rmb')}</th>
                  <th style={{ minWidth: 120 }}>{t(lang, 'balance_rmb')}</th>
                  <th style={{ minWidth: 120 }}>{t(lang, 'settled_amount')}</th>
                  <th style={{ minWidth: 120 }}>{t(lang, 'settled_rmb')}</th>
                  <th style={{ minWidth: 220 }}>{t(lang, 'missing_factor')}</th>
                  <th style={{ minWidth: 260 }}>{t(lang, 'reset_password')}</th>
                  <th style={{ minWidth: 200 }}>{t(lang, 'actions')}</th>
                  <th style={{ width: 140, textAlign: 'right' }}>{t(lang, 'ledger')}</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((u) => {
                  const supplierId = Number(u.id);
                  const b = billingBySupplierId.get(String(u.id));

                  const usedUsd = centsToUsd(b?.used_usd_cents);
                  const usedRmb = centsToRmb(b?.used_rmb_cents);
                  const balanceRmb = centsToRmb(b?.balance_rmb_cents);

                  const missing = Array.isArray(b?.missing_factor_channel_ids) ? b.missing_factor_channel_ids : [];
                  const settledUsd = centsToUsd(ledgerTotalsBySupplierId?.[supplierId]?.usd ?? b?.settled_cents);
                  const settledRmb = centsToRmb(ledgerTotalsBySupplierId?.[supplierId]?.rmb ?? b?.settled_rmb_cents);

                  const isExpanded = expandedSupplierId === supplierId;

                  return (
                    <React.Fragment key={u.id}>
                      <tr>
                        <td>
                          <div style={{ fontWeight: 700 }}>
                            {u.username} <span className='small'>(id {u.id})</span>
                            {u.disabled ? (
                              <span className='badge' style={{ marginLeft: 10 }}>
                                {t(lang, 'disabled')}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td style={{ fontFamily: 'var(--mono)' }}>{usedUsd}</td>
                        <td style={{ fontFamily: 'var(--mono)' }}>{usedRmb}</td>
                        <td style={{ fontFamily: 'var(--mono)' }}>{balanceRmb}</td>
                        <td style={{ fontFamily: 'var(--mono)' }}>{settledUsd}</td>
                        <td style={{ fontFamily: 'var(--mono)' }}>{settledRmb}</td>
                        <td style={{ fontFamily: 'var(--mono)' }}>
                          {!missing.length ? (
                            '-'
                          ) : (
                            <span style={{ color: 'rgba(255, 99, 99, 0.95)' }}>{missing.join(', ')}</span>
                          )}
                        </td>
                        <td>
                          <div className='row' style={{ alignItems: 'center', flexWrap: 'nowrap' }}>
                            <input
                              className='input'
                              style={{ padding: '8px 10px', minWidth: 150 }}
                              type='password'
                              value={resetPassById?.[u.id] || ''}
                              onChange={(e) => setResetPassById((prev) => ({ ...prev, [u.id]: e.target.value }))}
                              disabled={busy}
                              placeholder={t(lang, 'password_new')}
                            />
                            <button
                              className='btn'
                              disabled={busy || !String(resetPassById?.[u.id] || '').trim()}
                              onClick={() => doResetPassword(u.id)}
                              type='button'
                            >
                              {t(lang, 'reset_password')}
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className='row' style={{ justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                            <button className='btn' disabled={busy} onClick={() => toggleDisable(u.id, !u.disabled)}>
                              {u.disabled ? t(lang, 'enable') : t(lang, 'disable')}
                            </button>
                            <button className='btn btn-danger' disabled={busy} onClick={() => doDelete(u.id)}>
                              {t(lang, 'delete')}
                            </button>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className='btn'
                            type='button'
                            disabled={busy}
                            onClick={() => setExpandedSupplierId((prev) => (prev === supplierId ? null : supplierId))}
                          >
                            {isExpanded ? t(lang, 'collapse') : t(lang, 'expand')} {t(lang, 'ledger')}
                          </button>
                        </td>
                      </tr>

                      {!isExpanded ? null : (
                        <tr>
                          <td colSpan={10}>
                            <div className='card' style={{ margin: 10 }}>
                              <div className='card-inner'>
                                <SettlementLedger
                                  lang={lang}
                                  busy={busy}
                                  onBusyChange={onBusyChange}
                                  pushToast={pushToast}
                                  supplierId={supplierId}
                                  balanceRmbCents={b?.balance_rmb_cents}
                                  open
                                  showToggle={false}
                                  onTotalsChange={(rows) => {
                                    const totals = sumLedgerTotals(rows);
                                    setLedgerTotalsBySupplierId((prev) => ({ ...prev, [supplierId]: totals }));
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
