# History Details: Drag & Drop Card Regimi

**Date**: 2026-06-17

## Lessons Learned & Decisions Made
1. **Component Modularization**: Extracted the markup of each of the 4 regimes (Forfettario, Ordinario, SRL, Dipendente) into separate Vue components (`CardForfettario.vue`, `CardOrdinario.vue`, `CardSrl.vue`, `CardDipendente.vue`) to clean up `App.vue` and enable dynamic rendering in a loop.
2. **Synchronized Reactive Sorting**: Implemented a computed `visibleCards` property with a custom getter and setter in `App.vue`. The getter filters `store.cardOrder` to only contain visible card IDs, preventing DOM mismatch/rendering issues in `vuedraggable`. The setter merges reordered visible cards with the hidden cards to preserve the master order array in the Pinia store.
3. **Draggable Wrapper**: Wrapped each dynamic component inside `<draggable>` with a standard `div` with `class="h-full"` to guarantee that SortableJS can perform DOM mutations safely on native DOM nodes while keeping cards at equal heights inside the grid.
4. **State Persistence**: The sorting order is watched and persisted to `localStorage` under `taxgrid_state.cardOrder` in `taxStore.ts`.

## Issues Encountered
- None. Adding a local `formatCurrency` helper inside each card component kept them clean and self-contained. `vuedraggable@next` worked seamlessly with Vue 3 and Vitest.
