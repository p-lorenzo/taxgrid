# History: Rework Parametri Avanzati

## Spec: 07-advanced-parameters-rework

## Date: 2026-06-17

## Details of Work
- Replaced the simple `expensesMode` string state in `taxStore.ts` with a primary `advancedMode` boolean state.
- Provided computed properties/backward-compatible getters/setters for `expensesMode` to prevent breaking existing tests/localStorage values.
- Integrated new variables for concurrent employment: `hasLavoroDipendente`, `ralDipendente`, `dipendenteFullTime`.
- Implemented cumulative IRPEF calculations for Ordinario and SRL Compenso, ensuring the tax rate climbs progressively into the correct marginal bracket.
- Implemented concurrent employment GS rate reduction to 24% and full-time subordinated employee Artigiani cassa exemption (INPS drops to 0).
- Handled regional and municipal surtaxes (`addizionaleRegionale` and `addizionaleComunale`) on taxable income.
- Allowed configurability of the INPS massimale cap (default 119,650€).
- Reworked UI in `src/App.vue` to show a clean simple "Spese" input in simple mode, a placeholder directing to the advanced parameters when active, and a gorgeous collapsed/expanded "Parametri Avanzati" panel at the bottom of the Parametri Globali card.
- Showed a warning banner on the Regime Forfettario card when RAL is `> 35000`.

## Lessons Learned
- When introducing local surtaxes/addizionali to a state model that affects existing unit tests, we should ensure the tests set these taxes to `0` if they do not expect them, or update assertions accordingly to avoid failing on default non-zero values.
- In Italy, GS contributions drop to 24% for employees who are already covered by another mandatory pension cassa, and this affects the deductible INPS calculation, which mathematically increases taxable IRPEF slightly compared to standard calculations.
