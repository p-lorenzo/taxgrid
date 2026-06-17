# Quickstart: Conversione Automatica al Toggle RAL/Fatturato

**Feature**: spec `21-ral-fatturato-conversione`  
**Date**: 2026-06-17

## Prerequisites

- Node.js (as specified in project)
- `npm install` completed
- Spec 19 (`19-fix-dipendente-ral-input`) implemented (toggle Fatturato/RAL exists)

## Validation Scenarios

### Scenario 1: RAL → Fatturato Conversion

**Given**: Toggle is set to RAL, input value is 42000.  
**Action**: Click the toggle switch to switch to Fatturato.  
**Expected**: Input displays ~52000.20. Toggle label changes to "Fatturato Annuo Stimato". All 4 regime cards recalculate.

**Manual test**:
```bash
npm run dev
```
1. Open http://localhost:5173
2. Click toggle to RAL mode
3. Enter 42000 in the input
4. Click toggle to Fatturato
5. Verify input shows ~52000.20

### Scenario 2: Fatturato → RAL Conversion

**Given**: Toggle is set to Fatturato, input value is 52000.20.  
**Action**: Click the toggle switch to switch to RAL.  
**Expected**: Input displays ~42000. Toggle label changes to "RAL (Retribuzione Annua Lorda)".

### Scenario 3: Round-Trip (andata e ritorno)

**Given**: Toggle is set to RAL, input value is 42000.  
**Action**: Click toggle twice (RAL → Fatturato → RAL).  
**Expected**: Input displays 42000 (±1 cent).

### Scenario 4: Zero Value

**Given**: Toggle is set to RAL, input value is 0.  
**Action**: Click toggle to Fatturato.  
**Expected**: Input displays 0.

### Scenario 5: Rapid Clicks

**Given**: Toggle is set to RAL, input value is 42000.  
**Action**: Rapidly click toggle 3 times (RAL → Fatturato → RAL → Fatturato).  
**Expected**: Input ends up at ~52000.20 (Fatturato mode). No errors or NaN.

## Automated Tests

```bash
npx vitest run
```

Relevant test file: `src/store/taxStore.test.ts`

## Implementation Notes

- Conversion factor: `1 + ALIQUOTA_INPS_DATORE` (= 1.2381)
- The constant `ALIQUOTA_INPS_DATORE = 0.2381` is extracted to module scope in `taxStore.ts`
- Conversion happens in `App.vue` toggle handler on `@update:model-value`
- All calculations recalculate automatically via Vue reactivity and Pinia computed properties
