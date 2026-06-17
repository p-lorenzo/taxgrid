# History Details: Riduzioni Contributi INPS (35% e 50%)

**Date**: 2026-06-17

## Lessons Learned & Decisions Made
1. **Cassa Selection for SRL**: Realized that the SRL regime did not have a Cassa Previdenziale selection in the UI. Added `srlCassa` state to the store and a corresponding Cassa selector to the SRL card in `App.vue` to allow selecting "Artigiani e Commercianti", which is required to unlock the 50% INPS reduction.
2. **Store Logic & Exclusivity**: Added state variables for INPS reductions (`forfettarioRiduzione35`, `forfettarioRiduzione50`, `ordinarioRiduzione50`, `srlRiduzione50`). Implemented watches to guarantee that changing cassa back to `gestione_separata` resets the reductions, and to enforce mutual exclusivity between 35% and 50% for Regime Forfettario.
3. **Math Calculations**: Refactored INPS calculations for Artigiani e Commercianti in all regimes to use the legal minimale (4208€) and eccedente (24% above 17504€) base before applying the active discount multiplier. Checked and confirmed that taxes (IRPEF/Substitute) and total net income rebalance correctly as INPS deductions change.

## Issues Encountered
- **Tooltip Implementation**: Used pure CSS tooltips via Tailwind's `group` and `group-hover` class patterns, positioning tooltips with `absolute bottom-full left-1/2 -translate-x-1/2` to avoid external JS rendering dependencies and ensure lightweight and reliable popups.
