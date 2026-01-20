## 1. Implementation
- [x] 1.1 Add `ChangePasswordCard` to the admin experience (visible for `user.role === 'admin'`).
- [x] 1.2 Refactor `src/components/SupplierManagement.jsx` supplier list into a table:
  - keep supplier info + billing summary + actions on one row
  - keep missing-factor info visible (e.g., badge/cell)
  - keep reset password input + button inline
  - keep enable/disable and delete actions inline
- [x] 1.3 Add a rightmost per-supplier “settlement ledger” toggle button; collapsed by default.
- [x] 1.4 Render settlement ledger as an expanded details row and preserve totals derivation.
- [x] 1.5 Update `src/components/SettlementLedger.jsx` to support being embedded without an internal expand/collapse button.
- [x] 1.6 Update translations in `src/lib/i18n.js` for any new/changed labels.
- [x] 1.7 Adjust CSS as needed for table column sizing and mobile behavior.

## 2. Validation
- [ ] 2.1 Manual: login as Admin; change password (current + new), then verify login works with the new password.
- [ ] 2.2 Manual: supplier table renders; actions (reset password, disable/enable, delete) remain functional.
- [ ] 2.3 Manual: settlement ledger button is rightmost; default collapsed; expands and loads entries; can collapse again.
