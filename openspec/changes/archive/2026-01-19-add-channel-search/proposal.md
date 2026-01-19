# Change: Add channel search and filtering

## Why
When a supplier has many granted channels, it becomes slow and error-prone to find the right one by scrolling. A lightweight search/filter improves navigation without changing backend behavior.

## What Changes
- Add a search input to filter the channel list by channel name (client-side)
- Add quick filters for enabled/disabled status (client-side)
- Preserve selection behavior when the current selection is filtered out
- No backend API changes required

## Impact
- Affected specs: (new) `channel-browse` capability
- Affected code: `src/components/ChannelList.jsx`, `src/App.jsx`, `src/styles.css` (small UI additions)
