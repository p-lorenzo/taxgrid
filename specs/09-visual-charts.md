# Spec 09: Grafici Visivi (Data Visualization)

**Feature Branch**: `09-visual-charts`

**Created**: 2026-06-17

**Status**: COMPLETE

## Status: COMPLETE

## Obiettivo
Aggiungere una rappresentazione visiva dei dati calcolati per fornire un confronto immediato tra i vari regimi (Forfettario, Ordinario, SRL, Dipendente).

## Requisiti
1. Integrare una libreria per grafici leggera (es. `chart.js` con `vue-chartjs`, oppure `apexcharts`, oppure costruire un grafico a barre nativo in HTML/CSS/SVG data la semplicità).
2. Creare un nuovo componente `ComparisonChart.vue` da inserire in `App.vue` subito sopra (o sotto) i controlli globali, o sopra la griglia delle card.
3. Il grafico deve essere a **barre impilate (stacked bar chart)**.
4. Per ogni regime visibile (in base ai toggle attivi), deve esserci una barra che mostri:
   - **Tasse** (es. rosso/arancio)
   - **INPS / Contributi** (es. blu)
   - **Netto in tasca** (es. verde o oro `#e2af0d`)
5. Il grafico deve essere reattivo: se l'utente spegne la visibilità di un regime dai controlli, la rispettiva barra deve sparire. Se cambia il fatturato, le proporzioni si aggiornano con una transizione fluida.
6. Assicurarsi che i colori del grafico supportino sia il light mode che il dark mode (es. colore del testo dell'asse X).

## Implementazione
- Costruito un grafico a barre impilate nativo in HTML/CSS. Ciò garantisce prestazioni elevate, assenza di librerie esterne che appesantiscano il bundle, perfetta integrazione responsive e adattamento per light/dark mode.
- I segmenti del grafico si adattano dinamicamente all'imponibile e mostrano dettagli su hover tramite eleganti tooltip.
- Aggiunte transizioni fluide e animazioni di entrata/uscita per i regimi attivati/disattivati tramite `<TransitionGroup>`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Riapertura e Reattività Visiva
**Independent Test**: Modificando il fatturato o modificando la visibilità di un regime dai controlli globali, il grafico si aggiorna allineando la proporzione dei segmenti di tasse, INPS, e netto o nascondendo/mostrando le righe del grafico.

**Acceptance Scenarios**:
1. **Given** l'app caricata con le impostazioni di default, **When** visualizzo il pannello del grafico, **Then** vedo 4 barre per i regimi Forfettario, Ordinario, SRL e Dipendente.
2. **Given** il toggle per disattivare un regime (es. SRL), **When** lo spengo, **Then** la barra del regime SRL scompare con una transizione fluida.
3. **Given** la modifica del fatturato (es. da 50k a 80k), **Then** la larghezza proporzionale del netto in tasca, INPS e tasse delle singole barre si aggiorna con un'animazione fluida.
4. **Given** tutti i regimi spenti, **Then** viene mostrato un messaggio descrittivo che invita a selezionare almeno un regime nei controlli.

<!-- NR_OF_TRIES: 1 -->
