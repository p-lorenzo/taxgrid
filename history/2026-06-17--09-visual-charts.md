# History of Feature: Grafici Visivi (Data Visualization)

**Date**: 2026-06-17
**Feature Branch**: `09-visual-charts`

## Decisions Made
- Chose to build a custom stacked bar chart component `src/components/ComparisonChart.vue` using native HTML, CSS, and Tailwind. This avoids the overhead and potential dependency resolution issues of external charting libraries, keeping the SPA lightning-fast.
- Placed the chart in `src/App.vue` directly below the global controls section to give the user immediate visual feedback when adjusting parameters.
- Modeled the visual representation to display:
  - Netto in tasca (using the primary yellow `#e2af0d`)
  - INPS / Contributi (using blue)
  - Tasse / Imposte (using red)
  - Spese / Costi Fissi (using grey)
- Proportioned segments using dynamic inline widths calculated as a percentage of the total costs (sum of positive segments) to ensure the bar is always 100% wide and directly comparable.
- Utilized Vue's `<TransitionGroup>` to animate the entry/exit of rows when the visibility toggles are toggled.
- Added custom tooltip overlays that show the absolute values and percentages on hover of each segment.

## Lessons Learned & Issues Encountered
- An initial compilation error occurred due to an unused variable (`fatturato`) in the script block, which was resolved promptly.
- Implementing the chart natively allowed for much finer control over dark/light mode styles and smoother transitions than standard JS charting library wrappers.
