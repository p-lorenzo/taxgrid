# Detailed History: PWA Install Prompt (Spec 22)

**Date**: 2026-06-18  
**Author**: Antigravity AI  

## Summary of Work
Implemented the promotional PWA install banner to improve app discovery, installation rates, and offline usability, fulfilling all functional requirements of Specification 22.

## Decisions Made
1. **Separation of Logic & Presentation**:
   - Created a clean composable (`usePwaInstall.ts`) to handle the capturing of `beforeinstallprompt`, check standalone mode (supporting both standard Chromium and iOS navigator checks), check platform details (including newer iPadOS detection), and coordinate cooldown persistence.
   - Encapsulated the UI in `PwaInstallPrompt.vue` with appropriate styling matches (Tailwind CSS, high aesthetics, and Vue native transitions).

2. **iOS Support Plan**:
   - Since iOS Safari does not fire standard `beforeinstallprompt` event, we check if the platform is iOS and currently not running as standalone. If so, a customized guide is displayed pointing out Safari's "Share" and "Add to Home Screen" actions.

3. **Persistent Cooldown**:
   - Implemented a 14-day local storage cooldown triggered by explicit dismissals (closing or canceling the prompt) to optimize UX and respect user choices. If the app is successfully installed (`appinstalled` event fires or user accepts Chromium prompt), installation state is remembered permanently.

## Issues Encountered & Resolved
- **Vue Lifecycle in Composable Testing**:
  - The `vitest` unit tests initially failed because calling `usePwaInstall` directly outside a Vue component setup did not execute `onMounted` / `onUnmounted` lifecycle hooks.
  - *Solution*: Created a custom helper `withSetup` to mount a dummy Vue application instance and retrieve the reactive results within setup, allowing full hook executions and proper event listening.
- **Missing matchMedia in Test Environment**:
  - `App.test.ts` failed due to `window.matchMedia` not being defined in the default JSDOM environment.
  - *Solution*: Made the standalone detection function in `usePwaInstall.ts` guard against undefined `window.matchMedia`, checking `typeof window.matchMedia === 'function'` before executing the query.
