# History Details: Advanced Expenses Mode

**Date**: 2026-06-17

## Lessons Learned & Decisions Made
1. **Expenses Split**: Separated business-related operating expenses (`speseDeducibili`) and personal tax-deductible expenses (`speseDetraibili`). Forfettario ignores both, while Ordinario and S.R.L. (compenso mode) compute tax benefits differently.
2. **Advanced Switch/Toggle**: Implemented a responsive toggle inside the "Spese Annue" section. When turned on, it shows both deductible and detraibile fields, with an explanatory message noting the 19% deduction.
3. **Persistence Backward Compatibility**: Updated local state loading logic so that legacy saves containing `spese` fallback gracefully to `speseDeducibili`.

## Issues Encountered
- Floating point precision edge case occurred in unit tests when asserting `toBeCloseTo` on the exact tax/net results for 45000/39000 imponibile values. Resolved by specifying exact decimal representations (`6383.975`, `26884.525`, etc.) in test assertions.
