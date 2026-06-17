# Tasks: Conversione Automatica al Toggle RAL/Fatturato

**Feature**: spec `21-ral-fatturato-conversione`
**Date**: 2026-06-17
**Branch**: `21-ral-fatturato-conversione`

## Phase 1: Setup

- [X] **T1**: Extract `ALIQUOTA_INPS_DATORE` constant to module scope in `src/store/taxStore.ts`
  - Move `const aliquotaInpsDatore = 0.2381` from inside `dipendenteResult` computed (line 1153) to top-level module scope
  - Rename to `ALIQUOTA_INPS_DATORE` (UPPER_SNAKE_CASE for module-level constant)
  - Update all references inside `dipendenteResult` to use the module-level constant
  - Update `effectiveFatturato` computed (line 37) to use `1 + ALIQUOTA_INPS_DATORE` instead of hardcoded `1.2381`

## Phase 2: Core Implementation

- [X] **T2**: Implement conversion logic in `src/App.vue` toggle handler
  - Import `ALIQUOTA_INPS_DATORE` from `taxStore` (or use `store.ALIQUOTA_INPS_DATORE`)
  - Modify `@update:model-value` handler on Switch (lines 152-154) to convert `store.fatturato` before changing `inputMode`
  - RAL → Fatturato: `store.fatturato = Math.round(store.fatturato * (1 + ALIQUOTA_INPS_DATORE) * 100) / 100`
  - Fatturato → RAL: `store.fatturato = Math.round(store.fatturato / (1 + ALIQUOTA_INPS_DATORE) * 100) / 100`

## Phase 3: Tests

- [X] **T3**: Add conversion tests to `src/store/taxStore.test.ts`
  - Test RAL → Fatturato conversion (42000 → 52000.20)
  - Test Fatturato → RAL conversion (52000.20 → 42000)
  - Test round-trip (double toggle returns original ±1 cent)
  - Test zero value (0 converts to 0)
  - Test high value (999999 converts without overflow)
  - Test negative/edge values if applicable

- [X] **T4**: Verify all existing tests pass with changes
  - Run `npx vitest run` and ensure no regressions

## Phase 4: Validation

- [X] **T5**: Manual quickstart validation per quickstart.md scenarios
  - Run `npm run dev`, verify RAL → Fatturato, Fatturato → RAL, round-trip, zero value

## Execution Order

```
T1 → T2 → T3 → T4 → T5
```

All tasks are sequential (each depends on the prior).
