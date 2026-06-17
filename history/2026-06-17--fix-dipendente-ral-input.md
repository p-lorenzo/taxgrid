# 2026-06-17 — Toggle Fatturato/RAL e Trattamento Integrativo Dipendente

**Spec**: `specs/19-fix-dipendente-ral-input.md`

## Changes Made

### Store (`src/store/taxStore.ts`)
- Added `inputMode` ref (`'fatturato' | 'ral'`, default `'fatturato'`)
- Added `effectiveFatturato` computed: in RAL mode returns `fatturato * 1.2381`, otherwise `fatturato`
- Updated `forfettarioResult`, `ordinarioResult`, `srlResult` to use `effectiveFatturato` instead of `fatturato`
- Updated `dipendenteResult`:
  - In RAL mode: uses input value directly as RAL
  - In fatturato mode: derives RAL = fatturato / 1.2381 (behavior unchanged)
  - Added Trattamento Integrativo (ex Bonus Renzi) calculation:
    - imponibile ≤ 15000: €1.200 credit
    - 15001-28000: €1.200 × (28000 - imponibile) / 13000
    - > 28000: €0
    - Capped at IRPEF netta due
  - Exposes `fatturatoEquivalente` in return value
- Added `inputMode` to localStorage load/save, URL state serialization, and watchers

### Global Controls (`src/App.vue`)
- Added Fatturato/RAL toggle switch (Headless UI) next to the global input
- Dynamic label: "Fatturato Annuo Stimato" / "RAL (Retribuzione Annua Lorda)"

### Dipendente Card (`src/components/CardDipendente.vue`)
- Dynamic explanatory paragraph: shows different text based on `inputMode`
- Fatturato mode: explains that fatturato is treated as total company cost
- RAL mode: explains that entered RAL is used directly, shows the equivalent fatturato for comparison

### Print Report (`src/components/PrintReport.vue`)
- All `store.fatturato` references replaced with `store.effectiveFatturato` for P.IVA calculations to maintain consistency in RAL mode

## Verification
- TypeScript compiles without errors (`vue-tsc --noEmit`)
- All 41 existing tests pass
- Production build succeeds

## Key Design Decisions
- `effectiveFatturato` is a computed that all three P.IVA cards share, avoiding per-card duplication
- Trattamento Integrativo is applied after IRPEF netta and capped at IRPEF due (FR8)
- Breakdown steps in `dipendenteResult` change based on inputMode: in RAL mode the INPS datore step is omitted since RAL is already the net payroll
