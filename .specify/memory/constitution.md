# TaxGrid Constitution

> TaxGrid is a single page application (SPA) frontend-only dashboard for simulating and comparing Italian tax regimes (Partita IVA Forfettaria, Ordinaria, SRL). It provides a real-time, side-by-side comparative grid where users can adjust variables (like total revenue, expenses, ATECO) and instantly see the impact on their taxes, INPS contributions, and net income. It aims to solve the opacity of the Italian tax system with a zero-friction, privacy-first tool.

---

## Context Detection

**Ralph Loop Mode** (started by ralph-loop*.sh):
- Pick highest priority incomplete spec from `specs/`
- Implement, test, commit, push
- Output `<promise>DONE</promise>` only when 100% complete
- Output `<promise>ALL_DONE</promise>` when no work remains

**Interactive Mode** (normal conversation):
- Be helpful, guide decisions, create specs

---

## Core Principles

- User experience first (clean & modern dark/light mode, rich aesthetics, dynamic interactions)
- Zero-friction privacy (no login, no backend, all state saved in localStorage)
- Type safety and correctness (finance calculations must be accurate)
- Keep it simple

---

## Technical Stack

- Vite
- Vue 3 (Composition API)
- TypeScript
- Tailwind CSS v4
- Headless UI
- Pinia (for state management & localStorage persistence)

---

## Autonomy

YOLO Mode: ENABLED
Git Autonomy: ENABLED

---

## Specs

Specs live in `specs/` as markdown files. Pick the highest priority incomplete spec (lower number = higher priority). A spec is incomplete if it lacks `## Status: COMPLETE`.

Spec template: https://raw.githubusercontent.com/github/spec-kit/refs/heads/main/templates/spec-template.md

When all specs are complete, re-verify a random one before signaling done.

---

## NR_OF_TRIES

Track attempts per spec via `<!-- NR_OF_TRIES: N -->` at the bottom of the spec file. Increment each attempt. At 10+, the spec is too hard — split it into smaller specs.

---

## History

Append a 1-line summary to `history.md` after each spec completion. For details, create `history/YYYY-MM-DD--spec-name.md` with lessons learned, decisions made, and issues encountered. Check history before starting work on any spec.

---

## Completion Signal

All acceptance criteria verified, tests pass, changes committed and pushed → output `<promise>DONE</promise>`. Never output this until truly complete.
