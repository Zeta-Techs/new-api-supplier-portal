## 1. Responsive layout
- [x] 1.1 Update layout CSS: container width 90%, narrow screens 98%
- [x] 1.2 Verify admin/supplier views remain usable on mobile

## 2. Settlement ledger (backend)
- [x] 2.1 Add DB table `supplier_settlements` (supplier_user_id, created_at, amount_rmb_cents, settled_total_rmb_cents, balance_rmb_cents)
- [x] 2.2 Add APIs:
  - admin: list settlement entries per supplier
  - admin: append a settlement entry (also updates supplier_billing.settled_rmb_cents)

## 3. Settlement ledger (frontend)
- [x] 3.1 Add ledger UI (collapsed by default) under supplier row
- [x] 3.2 Add "append settlement" form (admin-only)

## 4. Admin channel table
- [x] 4.1 Replace channel list rendering with a table layout (aligned columns)
- [x] 4.2 Add sorting controls for each column
- [x] 4.3 Add granted suppliers column with dropdown to add/remove supplier grants
- [x] 4.4 Add row expand panel:
  - list suppliers granted
  - edit per-supplier operations

## 5. Audit log
- [x] 5.1 Add DB table `audit_log`
- [x] 5.2 Record events (supplier ops + admin billing/pricing/grant changes)
- [x] 5.3 Admin UI: show audit log in channel expand panel

## 6. Verification
- [x] 6.1 Manual test: responsive widths apply (90%/98%)
- [x] 6.2 Manual test: settlement ledger records and displays entries
- [x] 6.3 Manual test: channel table sorting works
- [x] 6.4 Manual test: grant add/remove supplier works
- [x] 6.5 Manual test: audit log shows expected events
- [x] 6.6 Run `npm run build`
