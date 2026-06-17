# Implementation Plan: Conversione Automatica al Toggle RAL/Fatturato

**Branch**: `21-ral-fatturato-conversione` | **Date**: 2026-06-17 | **Spec**: [spec.md](../21-ral-fatturato-conversione.md)

**Input**: Feature specification from `/specs/21-ral-fatturato-conversione.md`

## Summary

When the user toggles the Fatturato/RAL switch, the current input value is automatically converted using the INPS employer contribution factor (1.2381). RAL → Fatturato multiplies by 1.2381; Fatturato → RAL divides by 1.2381. Result is rounded to 2 decimals. The conversion is implemented in the toggle handler in `App.vue`, reusing the existing `ALIQUOTA_INPS_DATORE` constant extracted from the store.

## Technical Context

**Language/Version**: TypeScript 5.x (Vue 3 Composition API)

**Primary Dependencies**: Vue 3, Pinia, Tailwind CSS v4, Headless UI, Vite

**Storage**: localStorage (via Pinia state persistence)

**Testing**: Vitest 4.x + @vue/test-utils + jsdom

**Target Platform**: Web browser (SPA, client-side only)

**Project Type**: Frontend single-page application

**Performance Goals**: Toggle conversion <16ms (imperceptible to user)

**Constraints**: No backend, offline-capable, privacy-first (no data leaves browser)

**Scale/Scope**: Single-page app, 4 regime cards, 1 toggle + input binding. This feature touches 2 files (App.vue + taxStore.ts).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| User experience first | PASS | Instant conversion improves UX; user no longer needs to manually recalculate |
| Zero-friction privacy | PASS | All logic runs client-side, no data sent anywhere |
| Type safety and correctness | PASS | TypeScript, simple arithmetic, rounding to 2 decimals; uses existing PINia store patterns |
| Keep it simple | PASS | ~5 lines of conversion logic in toggle handler; extracting one constant from store |

**Verdict**: All principles satisfied. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/21-ral-fatturato-conversione/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output (N/A - no external interfaces)
```

### Source Code (repository root)

```text
src/
├── App.vue              # Toggle handler change (@update:model-value)
├── store/
│   └── taxStore.ts      # Extract ALIQUOTA_INPS_DATORE constant to module scope
└── store/
    └── taxStore.test.ts # Tests for conversion logic
```

**Structure Decision**: Single frontend project. Changes are minimal (2 source files + 1 test file). No new files or directories needed.

## Complexity Tracking

> No violations to justify.
