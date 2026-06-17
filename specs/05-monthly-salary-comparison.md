# Feature Specification: Paragone Netto Mensile (Mensilità)

**Feature Branch**: `05-monthly-salary-comparison`

**Created**: 2026-06-17

**Status**: COMPLETE

## Status: COMPLETE

**Input**: User description: "vorrei aggiungere alle tabelle 1 nuova riga per fare giá un calcolo di esempio per paragonare il netto annuo a delle mensilitá, in pratica vorrei uno slider che vada da 1 a 15 e semplicemente fa la divisione del netto annuo in n mensilitá in modo da poter vedere al volo quanto sarebbe il paragone di ogni regime a uno stipendio in mensilitá."

## 1. Analisi e State Management (Pinia)

Nello store `taxStore.ts` dobbiamo introdurre un nuovo ref per gestire il numero di mensilità su cui dividere il netto annuo. Il range sarà da 1 a 15.

**Aggiornamento Store (Pseudo-codice):**
```typescript
  // Numero di mensilità per il paragone stipendio
  const mesiParagone = ref(12) // Default a 12 mensilità
```
Aggiungere `mesiParagone` alla funzione `loadState()` e al `watch` per garantire la persistenza nel `localStorage`.

## 2. Struttura del Componente UI (App.vue)

1. **Parametri Globali / Sezione Slider**: Aggiungere una nuova sezione nei parametri globali per controllare le mensilità.
   - Introdurre un input di tipo `range` (slider) HTML nativo o Tailwind-styled che vada da `min="1"` a `max="15"`, con `step="1"`.
   - Affiancare allo slider un label dinamico che mostri il numero corrente (es: "Dividi per: 12 mensilità").

2. **Tabelle / Griglia Risultati**: All'interno del pannello o colonna di ogni regime (Forfettario, Ordinario, SRL), dove attualmente viene mostrato il "Netto Annuo", aggiungere una nuova riga sottostante.
   - Questa riga mostrerà "Paragone Mensile (su X mensilità): € Y.YYY".

## 3. Logica Matematica (Vue 3 Snippet)

La logica è puramente di presentazione e calcolo accessorio sul netto già calcolato.

**Snippet di Aggiornamento per i risultati (es. Forfettario, ma vale per tutti):**

```typescript
const forfettarioResult = computed(() => {
  // ... calcoli esistenti ...
  
  // 5. Netto
  const netto = fatturato.value - inps - tasse
  
  // Nuovo calcolo Mensile
  const nettoMensile = netto / mesiParagone.value

  return { inps, tasse, netto, nettoMensile }
})
```
*Da ripetere in `ordinarioResult` e `srlResult`, e utilizzare `nettoMensile` nel template di `App.vue`*.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Regolazione Mensilità e Comparazione Immediata (Priority: P1)

**Independent Test**: Eseguendo un test in browser, spostando lo slider delle mensilità (es. da 12 a 14), il valore del "Paragone Mensile" mostrato all'interno dei riquadri di ogni regime si aggiorna immediatamente dividendo il rispettivo Netto Annuo per il nuovo numero di mensilità scelto.

**Acceptance Scenarios**:

1. **Given** il caricamento base dell'App, **When** osservo le sezioni dei risultati per i vari regimi, **Then** vedo il nuovo indicatore "Paragone Mensile" calcolato di default su 12 mensilità.
2. **Given** lo slider delle mensilità, **When** lo sposto al valore 14, **Then** l'indicatore cambia per ogni regime in "Paragone Mensile (su 14 mensilità)" e i valori mostrati corrispondono esattamente a `Netto / 14`.
3. **Given** lo slider impostato a 1, **When** osservo i risultati mensili, **Then** il valore del paragone mensile deve essere esattamente uguale al Netto Annuo totale (Netto / 1).
4. **Given** l'inserimento di un valore nello slider (es. 13) e un refresh della pagina, **When** si ricarica l'App, **Then** lo slider rimane su 13 e i calcoli mensili vengono eseguiti su 13, confermando che lo state management sta persistendo correttamente il valore nel localStorage.

<!-- NR_OF_TRIES: 1 -->

