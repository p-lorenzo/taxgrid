# Feature Specification: Modalità Spese Semplice / Avanzata

**Feature Branch**: `04-advanced-expenses-mode`

**Created**: 2026-06-17

**Status**: COMPLETE

## Status: COMPLETE

**Input**: User description: "Introdurre un toggle UI per gestire spese deducibili e detraibili (Simple / Advanced mode). Semplice: un campo deducibile. Avanzata: due campi (deducibili, detraibili al 19%). Il forfettario non scala nessuna delle due spese."

## 1. Analisi e State Management (Pinia)

Nello store `taxStore.ts` dobbiamo separare l'attuale campo "spese" in due ref distinti (`speseDeducibili` e `speseDetraibili`) ed introdurre un flag per la modalità UI (`expensesMode`). Quando si passa alla modalità semplice, il valore delle spese detraibili viene ignorato matematicamente nel calcolo per evitare confusione (what you see is what you get), ma viene preservato nello stato (così se si fa toggle off/on l'utente non perde il dato).

**Aggiornamento Store (Pseudo-codice):**
```typescript
  // Modalità Spese
  const expensesMode = ref<'simple' | 'advanced'>('simple')
  const speseDeducibili = ref(5000)
  const speseDetraibili = ref(0)
  
  // N.B. Rimuovere globalmente la vecchia variabile `spese`
```
È necessario aggiornare il watcher e la funzione `loadState()` per garantire il fetch e salvataggio corretto dal `localStorage` per le nuove chiavi (`expensesMode`, `speseDeducibili`, `speseDetraibili`).

## 2. Struttura del Componente UI (App.vue)

Nel blocco dei Parametri Globali, strutturare l'interfaccia come segue:
1. Sostituire la semplice label "Spese Annue" con una riga flessibile (`flex items-center justify-between`) contenente la label e un componente `<Switch>` (Headless UI) per fare il toggle "Modalità Avanzata".
2. Se `expensesMode === 'simple'`, mostrare un solo input denominato "Spese Operative Generiche" (bindato con `v-model="store.speseDeducibili"`).
3. Se `expensesMode === 'advanced'`, mostrare due campi affiancati (grid o flex): "Spese Deducibili" (`speseDeducibili`) e "Spese Detraibili (Es. Mediche, Ristrutturazioni)" (`speseDetraibili`).
4. In modalità avanzata, includere un piccolo badge o testina esplicativa per ricordare che le spese detraibili scontano l'IRPEF netta al 19%.

## 3. Logica Matematica (Vue 3 Snippet)

I calcoli finali devono interpretare la natura fiscale della spesa.
- **Regime Forfettario**: Ignora completamente sia deducibili che detraibili (era così in precedenza per le deducibili e rimane intoccato).
- **Regime Ordinario**: Le deducibili riducono la base imponibile. Le detraibili decurtano in via diretta l'imposta IRPEF al 19%.
- **S.R.L.**: Segue lo stesso processo dell'Ordinario qualora l'IRPEF si applichi alla busta paga personale (Compenso Amministratore).

**Snippet di Aggiornamento per il Regime Ordinario:**

```typescript
const ordinarioResult = computed(() => {
  // 1. Deducibili (Riducono Imponibile Operativo)
  const imponibileBase = Math.max(fatturato.value - speseDeducibili.value, 0)
  
  const inpsRate = ordinarioCassa.value === 'gestione_separata' ? 0.2607 : 0.24
  let inps = imponibileBase * inpsRate
  if (ordinarioCassa.value === 'artigiani' && inps < 4208) {
    inps = 4208
  }

  // 2. Base imponibile fiscale
  const imponibileFiscale = Math.max(imponibileBase - inps, 0)
  
  // 3. Calcolo IRPEF Lorda
  let irpefLorda = 0
  if (imponibileFiscale <= 28000) {
    irpefLorda = imponibileFiscale * 0.23
  } else if (imponibileFiscale <= 50000) {
    irpefLorda = 28000 * 0.23 + (imponibileFiscale - 28000) * 0.35
  } else {
    irpefLorda = 28000 * 0.23 + 22000 * 0.35 + (imponibileFiscale - 50000) * 0.43
  }

  // 4. Detraibili (Riducono Imposta Lorda Direttamente del 19%)
  // Viene applicata solo se in 'advanced' mode
  const scontoDetraibili = expensesMode.value === 'advanced' ? speseDetraibili.value * 0.19 : 0;
  
  const irpefNetta = Math.max(irpefLorda - scontoDetraibili, 0)

  // 5. Netto
  const netto = fatturato.value - speseDeducibili.value - inps - irpefNetta

  return { inps, tasse: irpefNetta, netto }
})
```
*Identico sconto (`speseDetraibili * 0.19`) deve essere applicato sull'`irpefLorda` nell'algoritmo della S.R.L.*

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Attivazione e Utilizzo Spese Avanzate (Priority: P1)

**Independent Test**: Eseguendo un test in browser, il passaggio da "Simple" ad "Advanced" mode adatta la UI, espone il campo "Detraibili", e inserendo valori le tasse del Regime Ordinario e SRL calano, mentre le tasse per il regime Forfettario restano fisse.

**Acceptance Scenarios**:

1. **Given** il caricamento base dell'App, **When** osservo i Parametri Globali, **Then** vedo un solo campo "Spese Operative Generiche" e la UI si trova in "Simple Mode".
2. **Given** che ci sono 5000 nel campo "Generiche", **When** abilito il toggle per "Modalità Avanzata", **Then** appaiono due campi, e il campo "Spese Deducibili" eredita i 5000 già presenti.
3. **Given** la Modalità Avanzata, **When** inserisco `10.000` nel campo "Spese Detraibili", **Then** l'imposta IRPEF (Ordinario / SRL Compenso) scende esattamente di 1.900 euro (19% di 10.000). Il regime Forfettario non deve subire sconti o modifiche al calcolo delle imposte o del netto in tasca.
4. **Given** che sono state applicate delle detrazioni, **When** il toggle viene riportato su "Simple Mode", **Then** il campo scompare visivamente, l'impatto fiscale (i 1.900€ di sconto) viene annullato dai risultati, ma se riattivo "Advanced Mode" ritrovo 10.000 nel campo perché è persistito.

---

<!-- NR_OF_TRIES: 1 -->
