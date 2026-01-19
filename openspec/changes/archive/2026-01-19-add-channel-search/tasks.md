## 1. Implementation
- [x] 1.1 Add search query + status filter state in `src/App.jsx`
- [x] 1.2 Implement filtered channel list rendering in `src/components/ChannelList.jsx`
- [x] 1.3 Ensure selection behavior is stable when filters change (auto-select first visible channel if needed)
- [x] 1.4 Add minimal UI styling for search/filter controls in `src/styles.css`

## 2. Verification
- [ ] 2.1 Manual test: searching filters list by substring match (case-insensitive)
- [ ] 2.2 Manual test: status filter shows enabled-only / disabled-only / all
- [ ] 2.3 Manual test: selecting a channel then filtering it out results in a clear empty-state (or auto-select) without errors
- [x] 2.4 Run `npm run build`
