import React, { useEffect, useMemo, useState } from 'react';
import {
  appendSupplierSettlement,
  deleteSupplierSettlement,
  listSupplierSettlements,
  updateSupplierSettlement,
} from '../lib/api.js';
import { t } from '../lib/i18n.js';
import { centsToRmb, centsToUsd, rmbToCents, usdToCents } from '../lib/money.js';

export default function SettlementLedger({
  lang,
  busy,
  onBusyChange,
  pushToast,
  supplierId,
  balanceRmbCents,
  onTotalsChange,
  open: openProp,
  onOpenChange,
  showToggle = true,
}) {
  const [openInternal, setOpenInternal] = useState(false);
  const open = openProp === undefined ? openInternal : Boolean(openProp);
  const [rows, setRows] = useState([]);

  const [amountUsd, setAmountUsd] = useState('');
  const [amountRmb, setAmountRmb] = useState('');
  const [note, setNote] = useState('');

  const refresh = async () => {
    try {
      onBusyChange?.(true);
      const r = await listSupplierSettlements(supplierId);
      const items = r?.items || [];
      setRows(items);
      onTotalsChange?.(items);
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed');
    } finally {
      onBusyChange?.(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    refresh();
  }, [open, supplierId]);

  const submit = async () => {
    const usdCents = usdToCents(amountUsd);
    const rmbCents = rmbToCents(amountRmb);
    if (!usdCents && !rmbCents) return;

    try {
      onBusyChange?.(true);
      await appendSupplierSettlement(supplierId, {
        amount_usd_cents: usdCents,
        amount_rmb_cents: rmbCents,
        balance_rmb_cents: Number(balanceRmbCents) || 0,
        note: note || null,
      });
      setAmountUsd('');
      setAmountRmb('');
      setNote('');
      pushToast?.(t(lang, 'toast_saved'), t(lang, 'toast_saved'));
      await refresh();
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed');
    } finally {
      onBusyChange?.(false);
    }
  };

  const saveRow = async (id, patch) => {
    try {
      onBusyChange?.(true);
      await updateSupplierSettlement(supplierId, id, patch);
      pushToast?.(t(lang, 'toast_saved'), t(lang, 'toast_saved'));
      await refresh();
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed');
    } finally {
      onBusyChange?.(false);
    }
  };

  const deleteRow = async (id) => {
    try {
      onBusyChange?.(true);
      await deleteSupplierSettlement(supplierId, id);
      pushToast?.(t(lang, 'toast_saved'), t(lang, 'toast_saved'));
      await refresh();
    } catch (e) {
      pushToast?.(t(lang, 'toast_error'), e?.message || 'Failed');
    } finally {
      onBusyChange?.(false);
    }
  };

  const table = useMemo(() => {
    return rows
      .slice()
      .sort((a, b) => Number(b.created_at) - Number(a.created_at))
      .map((r) => ({
        ...r,
        timeInput: new Date(Number(r.created_at)).toISOString().slice(0, 16),
        usdInput: String((Number(r.amount_usd_cents || 0) / 100).toFixed(2)),
        rmbInput: String((Number(r.amount_rmb_cents || 0) / 100).toFixed(2)),
      }));
  }, [rows]);

  return (
    <div style={{ marginTop: showToggle ? 10 : 0 }}>
      {!showToggle ? null : (
        <button
          className='btn'
          type='button'
          disabled={busy}
          onClick={() => {
            if (openProp === undefined) setOpenInternal((v) => !v);
            else onOpenChange?.(!open);
          }}
        >
          {open ? t(lang, 'collapse') : t(lang, 'expand')} {t(lang, 'ledger')}
        </button>
      )}

      {!open ? null : (
        <>
          <div style={{ height: 10 }} />

          <div className='row' style={{ alignItems: 'end' }}>
            <div style={{ width: 160 }}>
              <div className='label'>{t(lang, 'amount')} (USD)</div>
              <div style={{ height: 6 }} />
              <input
                className='input'
                value={amountUsd}
                onChange={(e) => setAmountUsd(e.target.value)}
                disabled={busy}
                placeholder='0.00'
              />
            </div>
            <div style={{ width: 160 }}>
              <div className='label'>{t(lang, 'amount')} (RMB)</div>
              <div style={{ height: 6 }} />
              <input
                className='input'
                value={amountRmb}
                onChange={(e) => setAmountRmb(e.target.value)}
                disabled={busy}
                placeholder='0.00'
              />
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div className='label'>{t(lang, 'note')}</div>
              <div style={{ height: 6 }} />
              <input
                className='input'
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={busy}
                placeholder='optional'
              />
            </div>
            <button
              className='btn btn-primary'
              type='button'
              disabled={busy || (!String(amountUsd).trim() && !String(amountRmb).trim())}
              onClick={submit}
            >
              {t(lang, 'add')}
            </button>
          </div>

          <div style={{ height: 10 }} />

          {!table.length ? (
            <div className='small'>-</div>
          ) : (
            <div className='table-wrap'>
              <table className='table'>
                <thead>
                  <tr>
                    <th>{t(lang, 'time')}</th>
                    <th>{t(lang, 'amount')} (USD)</th>
                    <th>{t(lang, 'amount')} (RMB)</th>
                    <th>{t(lang, 'note')}</th>
                    <th style={{ width: 90 }} />
                  </tr>
                </thead>
                <tbody>
                  {table.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <input
                          className='input'
                          style={{ padding: '8px 10px', minWidth: 220 }}
                          type='datetime-local'
                          defaultValue={r.timeInput}
                          disabled={busy}
                          onBlur={(e) => {
                            const v = String(e.target.value || '').trim();
                            if (!v) return;
                            const tMs = Date.parse(v);
                            if (!Number.isFinite(tMs)) return;
                            saveRow(r.id, { created_at: tMs });
                          }}
                        />
                      </td>
                      <td>
                        <input
                          className='input'
                          style={{ padding: '8px 10px', width: 140, fontFamily: 'var(--mono)' }}
                          defaultValue={r.usdInput}
                          disabled={busy}
                          onBlur={(e) => {
                            const cents = usdToCents(e.target.value);
                            saveRow(r.id, { amount_usd_cents: cents });
                          }}
                        />
                        <div className='small'>{centsToUsd(r.amount_usd_cents)}</div>
                      </td>
                      <td>
                        <input
                          className='input'
                          style={{ padding: '8px 10px', width: 140, fontFamily: 'var(--mono)' }}
                          defaultValue={r.rmbInput}
                          disabled={busy}
                          onBlur={(e) => {
                            const cents = rmbToCents(e.target.value);
                            saveRow(r.id, { amount_rmb_cents: cents });
                          }}
                        />
                        <div className='small'>{centsToRmb(r.amount_rmb_cents)}</div>
                      </td>
                      <td>
                        <input
                          className='input'
                          style={{ padding: '8px 10px', minWidth: 220 }}
                          defaultValue={r.note || ''}
                          disabled={busy}
                          onBlur={(e) => saveRow(r.id, { note: e.target.value })}
                        />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className='btn btn-danger'
                          type='button'
                          disabled={busy}
                          onClick={() => deleteRow(r.id)}
                        >
                          {t(lang, 'delete')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
