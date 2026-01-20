# Change: Update Admin Password and Supplier Table UI

## Why
- Admin accounts currently lack a self-service password change UI, which is a basic security and usability need.
- The admin supplier list is visually inconsistent with the channel table and spreads key info/actions across multiple lines, making it slower to scan.
- Settlement history (结算记录) should be available on demand without taking vertical space by default.

## What Changes
- Add an Admin-visible “Change password” card that uses the existing portal “change my password” flow (requires current password).
- Redesign the admin supplier list to use a channel-table-like layout (aligned columns) and keep supplier info + actions on a single row.
- Add a rightmost “Settlement ledger” toggle button per supplier row; ledger is collapsed by default and expands inline.

## Impact
- Affected specs:
  - `openspec/specs/portal-account-management/spec.md`
  - `openspec/specs/admin-billing/spec.md`
  - `openspec/specs/supplier-ledger/spec.md`
- Affected code (expected):
  - `src/components/AdminPanel.jsx`
  - `src/components/SupplierManagement.jsx`
  - `src/components/SettlementLedger.jsx`
  - `src/styles.css`
  - `src/lib/i18n.js`
