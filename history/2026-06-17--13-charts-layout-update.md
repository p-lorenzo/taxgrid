# History Details: Spostamento Grafici (Layout Update)

**Date**: 2026-06-17

## Lessons Learned & Decisions Made
1. **Visual Hierarchy**: Spacing out the layout by moving the visual charts below the comparison cards helps the user first digest the numeric details of each regime, before viewing the overall composition of costs and net pocket income in the stacked bar chart.
2. **Layout Consistency**: Wrapped the `<ComparisonChart />` in a `<div class="max-w-[1600px] w-full mx-auto mt-12">` container to match the width and alignment of the regimes grid container (`max-w-[1600px]`). Used `mt-12` to provide a clear, balanced vertical margin.
3. **No Calculation Impact**: Validated that the visual update did not touch any computation state or props, preserving the performance and correctness of the app.

## Issues Encountered
- None. The component shift was straightforward and all existing unit tests passed without modifications because their selectors and expectations were position-independent.
