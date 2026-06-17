# History of Feature: Static Footer & Disclaimer

**Date**: 2026-06-17
**Feature Branch**: `08-static-footer`

## Decisions Made
- Implemented the footer as a separate Vue component `src/components/Footer.vue` to maintain clean separation of concerns and keep `App.vue` structured.
- Integrated the footer directly under the main viewport wrapper inside `src/App.vue`.
- Added all requested elements:
  - Personal credits to Lorenzo Pesce.
  - Profile links to GitHub and LinkedIn.
  - Open Source project mention with a direct link to the repository.
- Recommended and added the following crucial elements:
  - Legal Disclaimer stating that it is a non-official orientative simulator and calculations do not constitute professional advice.
  - Current fiscal year context (2025).
  - Call to Action to open GitHub issues for bug reports or feature requests.
- Tailored design for premium looks supporting both light and dark mode with micro-animations on links and buttons.

## Lessons Learned & Issues Encountered
- Ran into a missing tag syntax error after replacement in `App.vue` which was resolved by restoring the missing closing `div` for the regimes grid layout.
- The Tailwind v4 setup works perfectly with the custom component classes.
