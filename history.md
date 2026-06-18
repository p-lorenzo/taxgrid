# TaxGrid Project History

- **2026-06-17**: Added ATECO category dropdown selection replacing the raw numeric input coefficient.
- **2026-06-17**: Updated color scheme to uniform dark blue and yellow (#e2af0d) across all tax regimes.
- **2026-06-17**: Implemented correct tax and INPS calculation logic for S.R.L. administrator compensation strategy.
- **2026-06-17**: Introduced Simple/Advanced expenses mode toggle with separate deductible and detraibile (19%) expenses.
- **2026-06-17**: Added monthly salary comparison slider and dynamic row to show monthly income comparisons.
- **2026-06-17**: Added INPS contribution reductions (35% and 50%) for eligible regimes under Artigiani & Commercianti cassa, with info tooltips and state synchronization.
- **2026-06-17**: Reworked advanced parameters section (RAL cumulo IRPEF, 24% GS rate, full-time Artigiani exemption, local addizionali, custom INPS cap, and layout changes).
- **2026-06-17**: Added static footer with credits (Lorenzo Pesce), GitHub and LinkedIn links, Open Source repository and issues links, and a legal disclaimer for 2025.
- **2026-06-17**: Added custom, responsive interactive ComparisonChart (stacked bar chart) showing taxes, INPS, expenses, and net pocket composition with animations and dark mode support.
- **2026-06-17**: Implemented print-friendly layout and PDF report generation button for global controls, parameters, and comparison cards.
- **2026-06-17**: Added detailed mathematical breakdown step-by-step modal (CalculationBreakdown) for each tax regime (Forfettario, Ordinario, SRL, Dipendente) showing starting fatturato, expenses, cassa INPS details, IRPEF brackets, corporate taxes, and regional/communal addizionali.
- **2026-06-17**: Implemented interactive theme toggle (light/dark/system theme selection) persisted via localStorage with Tailwind class variant custom utility and FOUC prevention.
- **2026-06-17**: Spostata la sezione dei grafici (ComparisonChart) in fondo alla pagina sotto le card dei regimi con layout coerente a max-w-[1600px] e spaziatura mt-12.
- **2026-06-17**: Added Drag & Drop card sorting for tax regimes, extracted card markups into separate Vue components, and persisted the custom order in localStorage.
- **2026-06-17**: Added PWA (Progressive Web App) support using vite-plugin-pwa, configured web app manifest and icons, caching strategy, auto-updates, and the theme-color meta tag.
- **2026-06-17**: Added InfoTooltip component and implemented diffuse glossary tooltips for core Italian tax terms (IRPEF, IRES, IRAP, Gestione Separata, ATECO coefficient, local taxes, RAL).
- **2026-06-17**: Verified and finalized formal PDF report (PrintReport.vue) with comparative table layout, QR code (qrcode.vue), analytical breakdown per regime, legal disclaimer, and print-optimized styling. Fixed TS margin type error and updated stale test assertion.
- **2026-06-17**: Implemented URL state sharing (deep linking) with base64-encoded `?data=` query parameter serialization/deserialization, buildShareUrl() in taxStore, "Condividi Simulazione" button with clipboard copy + toast, and updated PrintReport QR code to point to the serialized simulation URL.
- **2026-06-17**: Added Fatturato/RAL toggle on global input, dynamic label, RAL-mode logic (direct RAL for Dipendente, RAL × 1.2381 for P.IVA cards), Trattamento Integrativo calculation, and dynamic explanatory text in Dipendente card.
- **2026-06-17**: Extended speseDeducibili impact to Forfettario and Dipendente regimes: spese subtracted post-tax from netto (with floor at €0), added intermediate "Netto Fiscale" / "Spese (non deducibili)" / "Netto Finale" breakdown voices, and updated ComparisonChart to show spese segments for all regimes.
- **2026-06-18**: Implemented PWA install prompt banner (PwaInstallPrompt) with custom prompt logic for Android/Desktop, step-by-step instructions for iOS, and 14-day dismissal cooldown using localStorage.

