# Last Push Summary

- **Commit**: `2d6db44` — Added filtering mechanism for the jobs list
- **Date**: 2025-11-05

## Highlights

- **Filter UX overhaul** (`src/components/jobs/filter-list.tsx`, `src/components/jobs/filter-option.tsx`)
  - Introduced an expandable filter panel with debounced keyword search, date range pickers, AI approval, and "posted by" selectors.
  - Added reusable `FilterOption` inputs backed by shared configuration for easier maintenance.
  - Wired in new filter icons (`public/icons/filter.svg`, `public/icons/filter_off.svg`, `public/icons/discover_tune.svg`) to clarify the expand/collapse affordance.

- **Jobs list filtering & presentation** (`src/components/jobs/jobs-list.tsx`)
  - Added client-side filtering via `useMemo`, covering keyword, posting date range, AI approval status, and poster source.
  - Highlighted matched keywords inside titles, companies, locations, and descriptions to improve scanability.
  - Exposed a loading banner while refetching and scrolled descriptions back to the top when switching cards.

- **Job card polish** (`src/components/jobs/job-card.tsx`)
  - Updated layout and styling for better readability and integrated optional keyword highlighting.
  - Preserved AI approval badges while ensuring the active card state matches the selection.

