## 1. Implementation
- [x] 1.1 Update the supplier channel list UI to include an RMB cost column to the right of pricing factor.
- [x] 1.2 Compute and render RMB cost per row using `used_quota` and `price_factor` (same as admin channel table).
- [x] 1.3 Ensure missing factor behavior is clear (RMB cost shows `-` when factor missing).
- [x] 1.4 Confirm column layout remains usable on smaller screens (table scroll behavior).

## 2. Validation
- [ ] 2.1 Manual: login as Supplier; verify the channel list shows columns: used USD, factor, RMB cost.
- [ ] 2.2 Manual: verify RMB cost matches admin computation for the same channel usage and factor.
- [ ] 2.3 Manual: channels with missing factor show `-` for RMB cost.
