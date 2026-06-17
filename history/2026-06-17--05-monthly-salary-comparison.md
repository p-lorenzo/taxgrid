# History Details: Paragone Netto Mensile (Mensilità)

**Date**: 2026-06-17

## Lessons Learned & Decisions Made
1. **Range Slider Integration**: Implemented a responsive HTML range slider (`min="1"`, `max="15"`, `step="1"`) inside the "Parametri Globali" section. To make it fit cleanly and responsively, the global control layout was updated from a 3-column layout to a 4-column layout (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`).
2. **Computed Netto Mensile**: Refactored the computed properties (`forfettarioResult`, `ordinarioResult`, and `srlResult`) in `taxStore.ts` to return `nettoMensile` by dividing the computed `netto` by the user's selected `mesiParagone`.
3. **Reactive Layout & Persistence**: Bound the slider and displayed information reactively. Persisted the selected number of months under the key `mesiParagone` in the local storage, preserving user configuration upon page refresh.

## Issues Encountered
- Wording check: Plural form in Italian for "mensilità" is invariant ("1 mensilità", "12 mensilità"), simplifying display logic.
