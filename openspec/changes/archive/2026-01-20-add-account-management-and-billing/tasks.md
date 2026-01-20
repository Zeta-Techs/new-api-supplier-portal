## 1. Account management (backend)
- [x] 1.1 Add `disabled` flag to portal users and enforce it at login
- [x] 1.2 Add admin APIs: list users (incl. suppliers/admins), create, delete, disable/enable, reset password
- [x] 1.3 Add supplier API: change own password (requires current password)

## 2. Billing persistence (backend)
- [x] 2.1 Add `supplier_billing` storage for admin-maintained `settled_amount`
- [x] 2.2 Add supplier API: read billing summary (used, settled, balance)
- [x] 2.3 Add admin API: list supplier billing summary for all suppliers
- [x] 2.4 Add admin API: update settled amount for a supplier

## 3. Frontend UI
- [x] 3.1 Supplier: add billing summary card (used total, settled, balance)
- [x] 3.2 Supplier: add "change password" UI
- [x] 3.3 Admin: add supplier list section with account actions (disable/reset/delete)
- [x] 3.4 Admin: add settled amount editor per supplier + totals display

## 4. Verification
- [ ] 4.1 Manual test: disabled user cannot log in
- [ ] 4.2 Manual test: supplier can change own password
- [ ] 4.3 Manual test: admin can create/disable/delete/reset users
- [ ] 4.4 Manual test: supplier billing summary totals match sum of visible channels
- [ ] 4.5 Manual test: admin can update settled amount; supplier sees updated balance
- [x] 4.6 Run `npm run build`
