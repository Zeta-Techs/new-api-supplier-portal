## Context
- The supplier portal already renders a password change form via `src/components/ChangePasswordCard.jsx` (calls `/api/portal/me/change-password`).
- The admin panel (`src/components/AdminPanel.jsx`) currently does not render any password change UI.
- The admin supplier list (`src/components/SupplierManagement.jsx`) is implemented as stacked “list items” with multi-line content.
- Settlement history is implemented as `src/components/SettlementLedger.jsx` with its own internal expand/collapse button.

## Goals / Non-Goals
- Goals:
  - Allow Admin users to change their own password by providing current + new password.
  - Make the admin supplier list scan-friendly by aligning fields/actions in a single table row.
  - Keep settlement history hidden by default; expand via a per-row button located at the far right.
- Non-Goals:
  - Backend API changes or database migrations.
  - Adding password strength rules beyond what the backend already enforces.
  - A full responsive redesign of the admin panel; the change is scoped to the supplier list section.

## Decisions
- Reuse existing UI and API:
  - Render `ChangePasswordCard` for Admin as well as Supplier.
  - Continue using `/api/portal/me/change-password` (current password required).
- Supplier list layout:
  - Replace the current card/list layout with a `<table>` using the existing `.table` / `.table-wrap` styling already used by channel tables.
  - Add explicit column widths for high-variance columns (actions, ledger toggle) and allow horizontal scroll when needed.
- Settlement ledger interaction:
  - Lift the expand/collapse control to the supplier row (rightmost “结算记录/ledger” button).
  - Render the ledger in an expanded “details row” immediately below the supplier’s table row (similar to the admin channel “details” row pattern).
  - Update `SettlementLedger` so it can be rendered without its own toggle button (parent controls whether it is visible).

## Risks / Trade-offs
- Table width: placing “all info and actions” in one row will be wide.
  - Mitigation: use `.table-wrap` horizontal scrolling; keep inputs compact; use short labels.
- Busy-state coupling: many per-row actions share a global `busy` flag.
  - Mitigation: keep behavior unchanged for now (minimal change); consider per-row busy later only if requested.

## Migration Plan
- No data migration.
- Safe rollout: UI-only changes; backend endpoints stay the same.

## Open Questions
- None; decisions confirmed:
  - Admin password change requires current password.
  - Supplier row actions should remain fully inline.
