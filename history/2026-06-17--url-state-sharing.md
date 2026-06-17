# Spec 18: URL State Sharing (Deep Linking)

## Decisions Made
- Used base64-encoded JSON in a single `?data=` query parameter instead of individual `?key=value` params. Chose this because there are 27+ state fields and base64 keeps the URL clean and compact.
- URL state has highest priority: defaults → localStorage → URL params (URL overrides everything).
- Share button placed in the Parametri Globali header next to the print button, with a yellow (#e2af0d) outline style to match the app's accent color.
- Toast notification uses Vue `<Transition>` component with slide-up animation, auto-dismisses after 2.5 seconds.

## Issues Encountered
- App.test.ts broke because the new share button has `print:hidden` class just like the print button, and the test was finding the wrong button. Fixed by filtering buttons by text content.
- `window` is not available in node test environment (taxStore tests). Added a `typeof window === 'undefined'` guard in `applyUrlState()` and `buildShareUrl()`, and set up a mock `globalThis.window` in the URL test suite.

## Files Changed
- `src/store/taxStore.ts`: Added `applyUrlState()` (parses `?data=` from URL and applies to state), `buildShareUrl()` (serializes state to base64 URL), exported `buildShareUrl` from store return
- `src/App.vue`: Added `copyShareUrl()` function, share button in header, toast notification with transition
- `src/components/PrintReport.vue`: QR code `value` changed from hardcoded `"https://taxgrid.it"` to `store.buildShareUrl()`
- `src/store/taxStore.test.ts`: Added 6 new tests for URL serialization/deserialization, URL priority over localStorage, graceful error handling
- `src/App.test.ts`: Fixed print button selectors to account for the new share button
- `specs/18-url-state-sharing.md`: Marked COMPLETE
- `history.md`: Added 1-line summary
