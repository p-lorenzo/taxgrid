# Spec 16: Glossario Diffuso e Tooltip (2026-06-17)

## Lessons Learned
- CSS-only tooltips using Tailwind's `group-hover` and `group-focus` utilities provide a lightweight, accessible experience without introducing bulky JavaScript popover libraries or polyfills.
- Using `span` instead of `div` for the tooltip wrapper ensures HTML validation conformance, as tooltips are frequently nested inside `<label>` elements which expect inline/phrasing content.

## Decisions Made
- Abstracted the tooltip logic into a reusable `InfoTooltip.vue` component that accepts a text prop or defaults to a slot.
- Replaced all raw inline HTML tooltips with the newly created `<InfoTooltip>` component to dry up the code.
- Implemented tooltips for the primary candidates:
  - IRPEF (Imposta progressiva a scaglioni)
  - IRES (Imposta sul reddito delle società)
  - IRAP (Imposta regionale sulle attività produttive)
  - Gestione Separata INPS
  - Coefficiente di Redditività ATECO
  - Addizionali Regionali e Comunali
  - RAL (Retribuzione Annua Lorda)
- Added `tabindex="0"` and focus utilities (`group-focus:*`) to make tooltips accessible on mobile tap and keyboard navigation.

## Issues Encountered
- None. The implementation went smoothly and all unit tests passed.
