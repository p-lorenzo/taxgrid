# History Details: ATECO Dropdown Selection

**Date**: 2026-06-17

## Lessons Learned & Decisions Made
1. **Dropdown over raw inputs**: Replaced the error-prone numeric input for ATECO profitability coefficient with a dropdown (`select` component) displaying user-friendly names (e.g. "Professionisti (78%)", "Commercio (40%)") which match the official Italian Forfettario categories.
2. **Reactivity & Synchronization**: Used a dual-field approach (`atecoCategory` + `atecoCoef`) inside the Pinia store. When the category is changed, a watcher updates the coefficient, which then reactively recalculates the Forfettario tax/INPS variables.
3. **State Persistence & Fallback**: Updated the localStorage logic to save the selected category string. To maintain backward compatibility, the store checks if an existing state is loaded without a category but with a coefficient and automatically deduces the corresponding category string.
4. **Testing**: Configured unit tests using Vitest (and a mock `localStorage` interface for standard Node test executions) to verify all scenarios including default states, reactive recalculation, UI binding, and state load/fallback.

## Issues Encountered
- Initial test execution without browser context failed because `localStorage` was missing. Implemented a mock `localStorage` interface directly at the top of the unit test to execute tests reliably under the Node environment.
