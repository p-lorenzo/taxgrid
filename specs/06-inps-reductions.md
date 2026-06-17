# Feature Specification: Riduzioni Contributi INPS (35% e 50%)

**Feature Branch**: `06-inps-reductions`

**Created**: 2026-06-17

**Status**: COMPLETE

## Status: COMPLETE

**Input**: User description: "aggiungiamo un altra spec per aggiungere le possibili riduzioni dei contributi del 35% e 50%, cerca su internet quando possono esserci e a che regimi possono essere applicate, inoltre accanto a questi nuovi toggle mettiamo dei tooltip hint per spiegare cosa sono quando si applicano e cosa fanno."

## 1. Analisi Normativa e Contesto

Dalla normativa vigente e dalle linee guida INPS, emergono i seguenti scenari per le agevolazioni contributive nella Gestione Artigiani e Commercianti:

1.  **Riduzione del 35%**:
    *   **Applicabilità**: Esclusiva per chi opera in **Regime Forfettario** ed è iscritto alla Gestione **Artigiani e Commercianti**.
    *   **Funzionamento**: Sconta del 35% sia i contributi fissi (minimali) sia i contributi a percentuale sul reddito eccedente.
    *   **Nota bene**: Comporta una proporzionale riduzione dell'anzianità contributiva ai fini pensionistici.
2.  **Riduzione del 50%**:
    *   **Applicabilità**: Valida per tutti i regimi (Forfettario, Ordinario, S.R.L.), ma *solo* per soggetti iscritti alla Gestione **Artigiani e Commercianti** che sono **già pensionati presso le gestioni INPS con più di 65 anni d'età**. (Esiste anche una misura temporanea per i primi 3 anni dei neo-iscritti under-35 in alcuni casi regionali/nazionali, o per coadiuvanti).
    *   **Funzionamento**: Sconta del 50% l'intero carico contributivo INPS.
    *   **Incompatibilità**: Per un Forfettario, la riduzione del 50% non è cumulabile con quella del 35% (bisogna sceglierne una).

*Nessuna di queste riduzioni si applica agli iscritti alla Gestione Separata (professionisti senza cassa).*

## 2. Analisi e State Management (Pinia)

Nello store `taxStore.ts` aggiungiamo flag specifici per memorizzare le scelte dell'utente. Tali flag dovranno resettarsi a `false` o essere ignorati se la cassa selezionata passa da "Artigiani e Commercianti" a "Gestione Separata".

**Aggiornamento Store (Pseudo-codice):**
```typescript
  // Flag per Regime Forfettario
  const forfettarioRiduzione35 = ref(false)
  const forfettarioRiduzione50 = ref(false)

  // Flag per Regime Ordinario
  const ordinarioRiduzione50 = ref(false) // Il 35% non è applicabile all'Ordinario

  // Flag per S.R.L. (Socio/Amministratore)
  const srlRiduzione50 = ref(false)
```
Tutti i ref vanno aggiunti alla logica del `localStorage` per garantire la persistenza.
È necessario implementare una logica (nel componente o con uno store action/watcher) per garantire l'esclusività tra `forfettarioRiduzione35` e `forfettarioRiduzione50`: se uno diventa `true`, l'altro deve essere forzato a `false`.

## 3. Struttura del Componente UI e Tooltip (App.vue)

All'interno dei pannelli di configurazione per i singoli regimi, queste opzioni **devono apparire solo se la Cassa selezionata è "Artigiani e Commercianti"**.
Affiancare ai toggle un'icona "Info" (es. un cerchietto con la `i`) che al passaggio del mouse mostri un Tooltip esplicativo.

**Per il Regime Forfettario:**
*   **Toggle**: "Riduzione INPS 35%"
    *   *Tooltip*: "Esclusiva per Regime Forfettario (Artigiani/Commercianti). Riduce del 35% i contributi fissi e variabili. Attenzione: riduce proporzionalmente anche l'anzianità per la pensione."
*   **Toggle**: "Riduzione INPS 50%"
    *   *Tooltip*: "Applicabile ai pensionati Over 65 INPS o a specifici neo-iscritti. Incompatibile con la riduzione del 35%."

**Per il Regime Ordinario e S.R.L.:**
*   **Toggle**: "Riduzione INPS 50%"
    *   *Tooltip*: "Applicabile ai pensionati Over 65 (già titolari di pensione INPS) o a specifici neo-iscritti alla gestione Artigiani/Commercianti."

## 4. Logica Matematica (Vue 3 Snippet)

I calcoli INPS per la Gestione Artigiani e Commercianti vanno avvolti da un moltiplicatore di sconto calcolato in base ai flag attivi.

**Snippet di Aggiornamento Calcolo INPS Forfettario:**
```typescript
// Calcolo Base Artigiani
let inpsMinimale = 4208;
let redditoEccedente = Math.max(imponibile - 17504, 0);
let inpsEccedente = redditoEccedente * 0.24;

let totaleInpsLordo = inpsMinimale + inpsEccedente;

// Applicazione Riduzioni
if (forfettarioCassa.value === 'artigiani') {
  if (forfettarioRiduzione35.value) {
    totaleInpsLordo = totaleInpsLordo * 0.65; // Sconto 35%
  } else if (forfettarioRiduzione50.value) {
    totaleInpsLordo = totaleInpsLordo * 0.50; // Sconto 50%
  }
}
```

*Per l'Ordinario e la S.R.L. il calcolo è identico ma basato sui rispettivi imponibili e con un solo flag possibile (`0.50` se `Riduzione50` è true).*

## 5. User Scenarios & Testing *(mandatory)*

### User Story 1 - Mutualità Esclusiva e Calcolo Forfettario (Priority: P1)
**Acceptance Scenarios**:
1. **Given** il Regime Forfettario impostato su Gestione Separata, **When** guardo le opzioni, **Then** i toggle per le riduzioni del 35% e 50% non sono visibili.
2. **Given** il Regime Forfettario impostato su Artigiani e Commercianti, **When** attivo il toggle "Riduzione INPS 35%", **Then** il valore delle tasse INPS mostrato crolla esattamente del 35%.
3. **Given** la Riduzione 35% già attiva, **When** attivo il toggle "Riduzione INPS 50%", **Then** la Riduzione 35% si disattiva automaticamente, e il valore delle tasse INPS diviene esattamente la metà (50%) di quello base originale.
4. **Given** un hover sull'icona info accanto ai toggle, **Then** appare un tooltip leggibile che spiega i vincoli normativi della riduzione come da specifiche.

### User Story 2 - Ordinario e SRL (Priority: P2)
**Acceptance Scenarios**:
1. **Given** il Regime Ordinario o SRL, **When** seleziono la cassa "Artigiani e Commercianti", **Then** appare solo il toggle per la "Riduzione INPS 50%" e non quello del 35% (non ammesso dalla legge per questi regimi).
2. **Given** il toggle 50% attivo nell'Ordinario, **When** si elaborano i calcoli, **Then** il costo INPS si dimezza, causando un aumento dell'IRPEF netta (poiché l'INPS è deducibile) e un conseguente ri-bilanciamento del netto totale.

<!-- NR_OF_TRIES: 1 -->
