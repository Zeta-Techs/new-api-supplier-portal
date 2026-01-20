# Change: Add account management + supplier billing summary

## Why
- The portal currently has only minimal account lifecycle support (create supplier users, login/logout). Day-2 operations like password change, disable/enable, and deletion are missing.
- Suppliers need a simple billing summary: total used amount across all their channels and a settlement balance maintained by admins.
- Admins need a supplier management view to manage supplier accounts and to review/maintain settlement amounts and overall supplier balances.

## Scope (confirmed)
- Settlement math: `balance = settled_amount - used_amount`
- Settled amount input: Admin-only (supplier can view)
- No supplier sub-accounts: suppliers only change their own password
- Admin operations: create/delete/disable suppliers, reset passwords, manage admin accounts too

## What Changes

### 1) Account management
- Add user fields and APIs to support:
  - Admin: create/delete users, disable/enable users, reset password
  - Supplier: change own password
- Enforce disabled users cannot log in.

### 2) Supplier billing summary
- For a supplier user:
  - Compute total `used_amount` = sum over visible channels of `(used_quota / 500000)`
  - Store `settled_amount` as a portal-managed value (admin-maintained)
  - Display `balance = settled_amount - used_amount`

### 3) Admin supplier billing management
- Add an Admin panel section that:
  - Lists suppliers with their current totals (used, settled, balance)
  - Allows editing `settled_amount` per supplier
  - Supports basic synchronization flow by recomputing used totals from new-api channel list (no new new-api endpoints)

## Impact
- Affected specs:
  - `portal-account-management` (new)
  - `supplier-billing` (new)
  - `admin-billing` (new)
- Affected code:
  - Portal backend: DB schema, auth/login checks, user management APIs, billing persistence
  - Frontend: admin UI for user mgmt + supplier list + billing editor; supplier view for billing summary
- Security:
  - Password reset/change must require current password for self-service changes
  - Only admins can view/manage other users and billing inputs
