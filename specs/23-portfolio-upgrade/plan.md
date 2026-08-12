# Implementation Plan: Portfolio Upgrade (SRL removal + Scadenze fiscali + Glassmorphism)

**Branch**: `23-portfolio-upgrade` | **Date**: 2026-08-13 | **Status**: COMPLETE

## Obiettivo

Upgrade medio-lungo respiro di TaxGrid per renderla attrattiva come progetto portfolio:

1. **Rimuovere SRL del tutto** (decisione utente: "Rimuovere SRL del tutto")
2. **Simulatore scadenze fiscali 2026 dettagliato** (decisione utente: "Modello più dettagliato")
3. **Redesign glassmorphism completo** (decisione utente: "Glassmorphism completo"), palette invariata (blu + oro `#e2af0d`)

## Stato attuale (esplorazione completata)

- Vite 8 + Vue 3.5 (Composition API) + TS 6 + Pinia 3 + Tailwind CSS v4 + Headless UI + vuedraggable + vite-plugin-pwa.
- Build OK (`npm run build`), 57 test passano (`npx vitest run`).
- File principali: `src/App.vue` (566 righe, controlli globali + toggle), `src/store/taxStore.ts` (845 righe, calcoli forfettario/ordinario/srl/dipendente), 4 card regime, `ComparisonChart.vue`, `PrintReport.vue`, `CalculationBreakdown.vue`.
- Modello fiscale: `src/fiscal-rules/2026.ts` (IRPEF scaglioni 2026, INPS GS 26.07%/24%, Artigiani/Commercianti con minimale, forfettario 5%/15% e soglie 85k/100k, SRL IRES 24%/IRAP 3.9%/dividendi 26%).
- Tax engine: `src/tax-engine/` (irpef.ts, personalTax.ts, contributions.ts — tutti testati).
- Store persistito in localStorage + share URL compattato (v2).
- Costituzione progetto: `.specify/memory/constitution.md` — YOLO mode, git autonomy enabled, specs in `specs/`.

## Fase 1 — Rimozione SRL

### Scopo
Eliminare ogni riferimento SRL da UI, store, grafico, stampa.

### Stato: COMPLETA (2026-08-13)
- Rimosso: `CardSrl.vue`, `srlResult` e tutti i ref SRL da `taxStore.ts` (import, refs, computed, snapshot, applyState, share URL v2, return), `showSrl` da App.vue (import, activeRegimesCount, visibleCards, openBreakdown, grid 3 colonne, toggle Visibilità), blocco SRL da `ComparisonChart.vue`, colonne/righe/steps SRL da `PrintReport.vue`, blocco `srl` da `fiscal-rules/2026.ts`, `calculateAdministratorContributions` + `AdministratorContributionResult` da `tax-engine/contributions.ts`.
- Migrazione soft: `applyState` filtra `'srl'` da `cardOrder` salvato; campi SRL in JSON salvato vengono ignorati.
- Test: rimossi 2 test SRL da `taxStore.test.ts`, 2 test admin da `contributions.test.ts`, aggiornato `ComparisonChart.test.ts` (3 regimi).
- Verifica: build OK, 53 test verdi.

### Modifiche
- `src/store/taxStore.ts`: rimuovere `srlDistribuzione`, `srlCostiFissi`, `srlSocioLavoratore`, `srlSocioCassa`, `srlContributionRelief`, `srlCassa`, `srlRiduzione50`, `srlResult`, campi SRL in `stateSnapshot`/`applyState`/`buildShareUrl`/`applyUrlState`, `showSrl`, `cardOrder` ('srl').
- `src/App.vue`: rimuovere `CardSrl`, toggle Visibilità SRL, `showSrl` da `activeRegimesCount`/`visibleCards`/`openBreakdown`, logica grid 4 colonne.
- `src/components/CardSrl.vue`: eliminare.
- `src/components/ComparisonChart.vue`: rimuovere blocco SRL.
- `src/components/PrintReport.vue`: rimuovere sezione SRL.
- Compatibilità stato salvato: `applyState` deve tollerare la presenza di campi SRL nel JSON salvato (migrazione soft, ignorandoli).
- Test: aggiornare `src/App.test.ts` se referenzia SRL; mantenere verdi tutti gli altri.

## Fase 2 — Simulatore Scadenze Fiscali 2026

### Stato: COMPLETA (2026-08-13)
- Nuovo `src/tax-engine/deadlines.ts` (`buildDeadlines`): saldo 2025 + 1°/2° acconto (metodi storico/previsionale), saldo 2026 a conguaglio, INPS Gestione Separata 2 rate 50/50 (30/06 e 30/11), Artigiani/Commercianti 40/30/30 (acconto 18/05 per weekend 16/05), addizionali regionali/comunali (acconto 30% 30/11, saldo 70% 30/06/2027). Esportato da `tax-engine/index.ts`.
- Nuovo `src/components/TaxDeadlines.vue`: timeline verticale con dot colorati per tipo (saldo/acconto/contributi/addizionali), selettore regime forfettario/ordinario, metodo acconto + override imposta prevista, totale versamenti, nota legale.
- Store: ref `deadlineRegime`, `accontoMethod`, `expectedTax` + computed `deadlines`; persistiti in localStorage e share URL (v2→v3, backward compat).
- Integrato in App.vue sotto il grafico.
- Test: 7 engine + 3 store + 3 componente = 13 nuovi, 66 totali verdi. Commit `f9b7d0d` pushato.

- **IRPEF/imposta sostitutiva** (forfettario 15%/5%, ordinario IRPEF):
  - **Saldo** anno precedente (2025): entro 30/06/2026 (con 0,4% maggiorazione se a rate da luglio).
  - **1° acconto** (metodo storico 100% di 1/2 del saldo 2025, o previsionale 100% di 1/2 dell'imposta prevista 2026): entro 30/06/2026.
  - **2° acconto**: entro 30/11/2026.
  - **Saldo** 2026: entro 30/06/2027.
  - Scelta metodo: **storico** vs **previsionale** (parametro utente, default storico con possibilità di overrider con imposta prevista).
- **INPS Gestione Separata** (professionisti): 2 rate annuali — 30/06/2026 (50%) e 30/11/2026 (50%). Se 1° rata non pagata entro il 31/05: maggiorazione 1%.
- **INPS Artigiani/Commercianti**: acconto 40% entro 16/05 (o 20/07 +0,4%), saldo 30/06/2026, 2° acconto 30/11/2026; minimale.
- **Addizionali regionali/comunali**: acconto 30% entro 30/11/2026, saldo 30/06/2027 (rate 2026). Se "Modello più dettagliato": inclusi.
- Output: array di eventi `{ date: Date, label: string, amount: number, type: 'saldo' | 'acconto' | 'contributi' | 'addizionali', regime }` ordinati per data, per il regime selezionato (forfettario/ordinario).

### Nuovo componente: `src/components/TaxDeadlines.vue`
- Timeline verticale reattiva (svg/dashboard) con eventi raggruppati per data, importi formattati EUR.
- Selettore regime (forfettario/ordinario) + opzioni: metodo acconto (storico/previsionale), importo previsto override.
- Nota legale: stime, non sostituiscono consulenza; basate su regole 2026.
- Posizionamento: sezione sotto le card, sopra/nelle vicinanze del grafico.

### Store
- Nuovi ref: `deadlineRegime`, `accontoMethod` ('storico'|'previsionale'), `impostaPrevistaOverride`.
- Computed `deadlines` che combina dati dal tax-engine.
- Persistenza in `stateSnapshot`/`applyState`/share URL (bump versione share v2→v3 con backward compat).

### Test
- `src/tax-engine/deadlines.test.ts`: date chiave 2026, importi saldo+acconti, metodi storico/previsionale, INPS rate, addizionali.
- `src/components/TaxDeadlines.test.ts` (se del caso).

## Fase 3 — Redesign Glassmorphism

### Stato: COMPLETA (2026-08-13)
- `src/style.css`: nuove utility custom `tg-bg` (sfondo ambientale con gradienti radiali blu+oro fissi, light/dark), `tg-glass`, `tg-glass-header`, `tg-glass-soft`, `tg-input` (backdrop-blur + vetro), con override print che ripristinano il tema chiaro su stampa.
- Applicato a: root App (`tg-bg`), pannello Parametri Globali, tutti gli input/select (15), sezioni parametri avanzati, 3 card regime (header gradiente + corpo vetro), ComparisonChart, TaxDeadlines, Footer, modal CalculationBreakdown, pill anno fiscale.
- Palette invariata: blu primario + oro `#e2af0d`.
- Build OK, 66 test verdi. Commit `6726784` pushato.
- Blu: `blue-600/700` (primario), oro `#e2af0d` (accent), sfondi `gray-50` light / `gray-900` dark.

### Direzione visiva
- **Sfondo**: gradienti ambientali (blur radial blu + oro) su `bg-gray-50`/`dark:bg-gray-900`, con `bg-fixed`.
- **Card**: `bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-lg rounded-3xl` (glass).
- **Header**: hero con titolo in gradient (già presente), pill anno fiscale, badge "open source / privacy-first".
- **Controlli globali**: pannello glass, input `bg-white/60 dark:bg-gray-700/40 backdrop-blur`.
- **Card regime**: glass, header con gradiente per regime (blu per ordinario, oro per forfettario, verde per dipendente), hover elevate, netto in oro bold.
- **Grafico**: stesso glass; segmenti con colori attuali.
- **Dark/light**: entrambi coerenti (uso `useDarkMode.ts` esistente).
- **Animazioni**: transizioni `transition-all`, hover translate, `transition-transform` già presenti, da raffinare.
- **Accessibilità**: contrasto testi, focus ring.

### File toccati
- `src/style.css` (tokens, gradienti, glass utilities, print overrides da ripensare con glass).
- `src/App.vue`, tutte le card, `ComparisonChart.vue`, `Footer.vue`, `CalculationBreakdown.vue`, `PrintReport.vue`, `InfoTooltip.vue`, `ThemeToggle.vue`, `KoFiSupport.vue`, `PwaInstallPrompt.vue`.

## Ordinamento di esecuzione consigliato

1. Fase 1 (rimozione SRL) — indipendente, sblocca pulizia.
2. Fase 2 (scadenze) — su base pulita.
3. Fase 3 (glassmorphism) — ultima, tocca tutto; da fare su funzionalità stabili.
Ogni fase: build + test verdi + commit separato.

## Checklist di completamento

- [ ] `npm run build` senza errori
- [ ] `npx vitest run` tutti verdi (57+ nuovi)
- [ ] Nessun riferimento a `srl`/`SRL` rimasto in `src/`
- [ ] Timeline scadenze visibile con importi corretti per forfettario e ordinario
- [ ] Share URL + localStorage compatibili con stato vecchio
- [ ] Print/PDF coerente col nuovo design
- [ ] Commit e push (git autonomy enabled)

## Domande aperte (per prossima sessione)

- Confermare importi minimale INPS Artigiani/Commercianti 2026 (usare i valori in `fiscal-rules/2026.ts`: min 18.808 €, contributo minimo 4.521,36/4.611,64).
- Confermare che la maggiorazione 0,4% su saldi/acconti rateali vada modellata o solo citata.
