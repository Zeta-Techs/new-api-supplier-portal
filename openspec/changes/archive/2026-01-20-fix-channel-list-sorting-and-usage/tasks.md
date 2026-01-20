## 1. Channel list completeness
- [x] 1.1 Add a shared helper to fetch all pages from `GET /api/channel/` (respecting `total` and a max safety cap)
- [x] 1.2 Update admin channel browsing to use the all-pages fetch helper
- [x] 1.3 Update supplier channel list to use the all-pages fetch helper

## 2. Sorting
- [x] 2.1 Sort Admin + Supplier channel lists by channel ID ascending

## 3. Usage display conversion
- [x] 3.1 Update list rows to display used quota as `$` amount (divide by 500000, 4 decimals)
- [x] 3.2 Update channel detail view to display used quota as `$` amount (divide by 500000, 4 decimals)

## 4. Verification
- [x] 4.1 Manual test: admin sees more than 100 channels when new-api has >100
- [x] 4.2 Manual test: supplier sees all granted channels even when >100
- [x] 4.3 Manual test: channels are sorted by ID ascending
- [x] 4.4 Manual test: used quota displays as `$` amount (used_quota/500000)
- [x] 4.5 Run `npm run build`
