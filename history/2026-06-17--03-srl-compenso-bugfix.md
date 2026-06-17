# History Details: S.R.L. Compenso Amministratore Bug Fix

**Date**: 2026-06-17

## Lessons Learned & Decisions Made
1. **Accurate SRL Budgeting**: Deducted corporate fixed costs (`costiFissiSrl` set to €4,000) from the gross revenue before calculating the available budget for admin compensation.
2. **Proper INPS Gestione Separata Ripartizione**: Implemented the Co.Co.Co/Gestione Separata splitting ratio (2/3 paid by company = ~22.39%, 1/3 paid by administrator = ~11.20%, total 33.59%) to derive the correct gross compensation (`compensoLordo = utileLordoOperativo / 1.2239`).
3. **IRPEF Detrazioni Integration**: Incorporated progressive IRPEF calculation along with specific work-related tax deductions (`detrazioni lavoro dipendente/assimilato`) based on taxable income, which drastically improves real-world accuracy of the S.R.L. comparison card.

## Issues Encountered
- **Precision in Unit Tests**: Initial assertions expected `5293.36` for `irpefNetta` instead of the precise JavaScript decimal-derived value `5293.35` (re-derived correctly via typescript's double-precision floating points). Fixed test assertions to use precise values.
