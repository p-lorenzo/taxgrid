# Data Model: Conversione Automatica al Toggle RAL/Fatturato

**Feature**: spec `21-ral-fatturato-conversione`  
**Date**: 2026-06-17

## State

No new entities. This feature extends the existing Pinia store state transition on toggle change.

### Existing State (modified behavior)

| Field | Type | Location | Change |
|-------|------|----------|--------|
| `fatturato` | `ref<number>` | `taxStore.ts:31` | Now auto-converted on toggle change (was: unchanged) |
| `inputMode` | `ref<'fatturato' \| 'ral'>` | `taxStore.ts:32` | No change to the ref itself; the toggle handler that sets it now also converts `fatturato` |

### Extracted Constant

| Field | Value | Location | Purpose |
|-------|-------|----------|---------|
| `ALIQUOTA_INPS_DATORE` | `0.2381` | `taxStore.ts` (module scope) | Used by conversion formula and all INPS calculations |

## State Transitions

### Toggle: RAL → Fatturato

```
Trigger: User clicks toggle when inputMode === 'ral'
Pre-condition: fatturato contains the RAL value
Action:       fatturato = round(fatturato × (1 + ALIQUOTA_INPS_DATORE), 2)
              inputMode = 'fatturato'
Post-condition: fatturato now contains the equivalent fatturato value
```

### Toggle: Fatturato → RAL

```
Trigger: User clicks toggle when inputMode === 'fatturato'
Pre-condition: fatturato contains the fatturato value
Action:       fatturato = round(fatturato / (1 + ALIQUOTA_INPS_DATORE), 2)
              inputMode = 'fatturato'
Post-condition: fatturato now contains the equivalent RAL value
```

## Validation Rules

| Rule | Constraint | Source |
|------|------------|--------|
| Conversion factor | Must be `1 + ALIQUOTA_INPS_DATORE` (i.e., 1.2381) | FR6 |
| Rounding | Result rounded to 2 decimal places | FR4 |
| Zero handling | If value is 0, result is 0 (multiplication/division identity) | FR5 |
| Round-trip | Double toggle returns original value ±0.01 | SC3 |
| Direction | RAL→Fatturato multiplies, Fatturato→RAL divides | FR1, FR2 |

## Relationships

```
ALIQUOTA_INPS_DATORE (constant)
  ├── effectiveFatturato computed (fatturato × 1.2381 in RAL mode)
  ├── dipendenteResult computed (ral ↔ fatturato derivations)
  └── toggle conversion handler (new: auto-convert on toggle)
```
