# Spec 20: Impatto Spese su Forfettario e Dipendente

**Date**: 2026-06-17
**Branch**: `20-spese-comparazione-regimi`

## Summary

Extended `speseDeducibili` to affect Forfettario and Dipendente regimes. Previously, spese were only deducted pre-tax for Ordinario and SRL, creating an unfair comparison. Now spese are subtracted post-tax from Forfettario and Dipendente netto, with a floor at €0.

## Changes

### taxStore.ts
- `forfettarioResult`: `netto = max(effFatt - inps - tasse - speseDeducibili, 0)`, added "Netto Fiscale (al lordo spese)" and "Spese (non deducibili)" intermediate breakdown steps
- `dipendenteResult`: `netto = max(nettoFiscale - speseDeducibili, 0)`, same breakdown changes
- Final breakdown step renamed from "Netto in Tasca" to "Netto Finale" for Forfettario and Dipendente

### ComparisonChart.vue
- Added "Spese (non deducibili)" segment to Forfettario stacked bar
- Added "Spese (non deducibili)" segment to Dipendente stacked bar

### Tests
- Updated expected `forfettarioResult.netto` values in ATECO and advanced mode tests
- All 41 tests pass

## Decisions
- Kept Ordinario/SRL completely unchanged (spec FR3)
- When speseDeducibili = 0, no "Spese" or "Netto Fiscale" voice appears in breakdown (spec FR7)
- ComparisonChart spese segments grouped with netto to preserve total = fatturato relationship
