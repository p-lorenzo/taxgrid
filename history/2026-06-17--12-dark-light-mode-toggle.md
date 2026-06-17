# History Details: Manual Dark/Light Theme Toggle

**Date**: 2026-06-17

## Lessons Learned & Decisions Made
1. **Tailwind CSS v4 Configuration**: Since Tailwind CSS v4 is "CSS-first" and does not use `tailwind.config.js`, enabling class-based dark mode requires redefining the `dark` variant inside the main CSS file using `@custom-variant dark (&:where(.dark, .dark *));`. This ensures `dark:` utility classes respond to the presence of the `.dark` class on the root element.
2. **Preventing Flash of Unstyled Content (FOUC)**: To prevent a temporary flash of light theme on initial page load for dark-mode users, a small, blocking inline `<script>` was placed directly inside `<head>` in `index.html` to instantly evaluate the localStorage preference (or system preference fallback) and apply the correct class.
3. **Synchronous Watcher**: Used `flush: 'sync'` inside the `useDarkMode.ts` composable's watcher. This guarantees that UI theme switches and localStorage writes happen instantly, eliminating any race conditions or test execution delays during component test tick updates.
4. **Accessible Segments UI**: Designed a segmented pill control in the Header using modern border styles, backdrop blurs, and interactive state animations, while fully maintaining accessibility (Aria labels and titles on each option).

## Issues Encountered
- **Unused Import**: Initially imported `Theme` type in the `ThemeToggle.vue` component, which triggered a TypeScript compiler error `TS6133` because the type was only declared but never read. This was resolved by pruning the unused import.
- **Asynchronous watch timing in tests**: The unit tests initially checked the state mutations synchronously after triggering a setter. Since Vue watchers run asynchronously by default, this led to test assertion failures when querying `localStorage` before the next tick. Resolving this with `flush: 'sync'` ensured the tests pass synchronously and robustly.
