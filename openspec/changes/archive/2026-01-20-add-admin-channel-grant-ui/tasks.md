## 1. new-api connection status
- [x] 1.1 Add backend endpoint to test new-api connectivity using stored credentials
- [x] 1.2 Add UI "Test connection" button and status badge in admin panel
- [x] 1.3 Persist/display last test result (success/failure + message + timestamp)

## 2. Admin channel list + bulk grants
- [x] 2.1 Add admin-only channel browsing UI (search/filter + pagination if needed)
- [x] 2.2 Add channel multi-select + "grant to supplier" workflow
- [x] 2.3 Add one-click "grant default operations" for selected channels
- [x] 2.4 Keep existing per-channel grant editing (revoke / override operations) available

## 3. i18n (CN default) + EN toggle
- [x] 3.1 Add i18n scaffolding (language state + dictionary) and store selection in localStorage
- [x] 3.2 Translate key UI surfaces (login/setup, admin panel, supplier portal, buttons, labels, toasts)
- [x] 3.3 Add error message mapping/wrapping layer for common backend errors

## 4. Verification
- [ ] 4.1 Manual test: config new-api, test connection shows clear success and failure cases
- [ ] 4.2 Manual test: admin can view all channels and bulk grant to a supplier
- [ ] 4.3 Manual test: supplier sees only granted channels
- [ ] 4.4 Manual test: CN/EN toggle changes UI language; default CN
- [x] 4.5 Run `npm run build`
