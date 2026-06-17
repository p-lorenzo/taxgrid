# Research: Conversione Automatica al Toggle RAL/Fatturato

**Feature**: spec `21-ral-fatturato-conversione`  
**Date**: 2026-06-17

## 1. Conversion Formula

### Decision
Use the factor **1.2381**, derived from `1 + aliquota_inps_datore` (1 + 0.2381), matching the existing convention in the codebase.

### Rationale
- The codebase already uses 0.2381 as `aliquotaInpsDatore` at `src/store/taxStore.ts:1153`.
- The same factor is used in `effectiveFatturato` (line 37), `dipendenteResult` (lines 1164, 1166), and `CardDipendente` display.
- Consistency across all calculations is critical for user trust.

### Alternatives Considered
- **Use a different factor** (e.g., 1.30, 1.40): Rejected — would create inconsistency with displayed tax breakdowns.
- **Make factor configurable**: Rejected — spec explicitly says "deve essere lo stesso usato per il calcolo del netto dipendente" (FR6). No requirement for configurability.

## 2. Where to Implement the Conversion

### Decision
Implement in `App.vue` toggle handler (`@update:model-value` on the Switch component, lines 152-154).

### Rationale
- The toggle is the only trigger point for the conversion (FR3: "immediatamente al click del toggle").
- The input is bound via `v-model="store.fatturato"` — direct mutation of the ref is straightforward.
- Keeping logic in the template handler avoids adding indirection; it's a simple, self-contained operation.
- The store's `fatturato` ref is a plain `ref<number>` with no setter to hook into.

### Alternatives Considered
- **Pinia action/method**: Would be testable without mounting a component, but adds boilerplate for a 2-line conversion. If this logic grows, it can be extracted later.
- **Vue watcher on `inputMode`**: Would trigger conversion when inputMode changes from ANY source (URL sharing, localStorage restore), which would corrupt the stored value. Rejected — conversion must only happen on explicit user toggle.
- **Composable**: Overkill for a single toggle handler.

## 3. Rounding Strategy

### Decision
Round to 2 decimal places using `Math.round(value * 100) / 100`.

### Rationale
- FR4: "Il valore convertito deve essere arrotondato a due decimali (centesimi di euro)".
- JavaScript floating-point arithmetic produces artifacts (e.g., 42000 * 1.2381 = 52000.200000000004).
- `Math.round(value * 100) / 100` is the simplest, most reliable method for 2-decimal rounding without external libraries.
- The codebase has no existing rounding utility — this is consistent with the ad-hoc approach used elsewhere.

### Alternatives Considered
- `Number(value.toFixed(2))`: Works but involves string conversion; `Math.round` is more direct and slightly faster.
- **External library** (e.g., decimal.js): Overkill for a single arithmetic operation.

## 4. Constant Location

### Decision
Extract `ALIQUOTA_INPS_DATORE = 0.2381` to module-level scope in `taxStore.ts` (currently scoped inside `dipendenteResult` computed at line 1153).

### Rationale
- FR6: "Il fattore di conversione (1.2381) deve essere lo stesso usato per il calcolo del netto dipendente".
- Currently `aliquotaInpsDatore` is a local variable inside the `dipendenteResult` computed, inaccessible to the toggle handler.
- Extracting it to module scope makes it reusable by `effectiveFatturato` (line 37), `dipendenteResult`, and the App.vue toggle handler.
- If imported in App.vue, conversion formula becomes: `fatturato * (1 + ALIQUOTA_INPS_DATORE)` and `fatturato / (1 + ALIQUOTA_INPS_DATORE)`.

### Alternatives Considered
- **Hardcode 1.2381 in App.vue**: Works but violates FR6 (no guarantee of consistency if the store value changes).
- **Create a shared constants file** (e.g., `src/constants.ts`): More structured but overkill for one constant. Can be done later if more constants emerge.

## 5. Test Strategy

### Decision
Add unit tests to `src/store/taxStore.test.ts` for the conversion logic, plus an integration test in `src/App.test.ts` verifying the toggle click updates the input value.

### Rationale
- Vitest is already the testing framework.
- taxStore.test.ts (664 lines) has established patterns for Pinia store testing.
- App.test.ts (70 lines) has examples of component mounting with Headless UI Switch.
- SC1-SC4 (spec success criteria) require numeric verification of conversion results.

### Test Cases
1. RAL → Fatturato: toggle from RAL to Fatturato, verify value × 1.2381 rounded to 2 decimals
2. Fatturato → RAL: toggle from Fatturato to RAL, verify value / 1.2381 rounded to 2 decimals
3. Round-trip: double toggle returns original value ±1 cent
4. Zero value: toggling with 0 produces 0
5. High value: 999999 converts without overflow

## 6. No Unknowns Remain

All NEEDS CLARIFICATION items resolved:
- Formula: 1.2381 (1 + 0.2381 INPS employer rate)
- Implementation location: App.vue toggle handler
- Constant location: Module scope in taxStore.ts
- Rounding: Math.round × 100 / 100
- Testing: Vitest (existing framework)
