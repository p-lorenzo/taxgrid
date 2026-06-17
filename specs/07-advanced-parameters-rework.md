# Feature Specification: Rework Parametri Avanzati (RAL, Addizionali e INPS)

**Feature Branch**: `07-advanced-parameters-rework`

**Created**: 2026-06-17

**Status**: COMPLETE

## Status: COMPLETE

**Input**: User request: a) Spostare il flag avanzato delle spese annue per creare una vera e propria sezione "Parametri Avanzati". Includere qui la suddivisione spese e un toggle per il "Lavoro Dipendente" con RAL. Gestire eleggibilità forfettario (>35k) e scaglioni cumulativi IRPEF. b) Campi addizionali regionali/comunali con tooltip di medie italiane. c) Massimale INPS configurabile (default 119.650) con tooltip. d) Aliquote ridotte INPS (24% GS) e esenzione totale Artigiani per dipendenti full-time.

## 1. Analisi e State Management (Pinia)

Nello store `taxStore.ts` dobbiamo trasformare il precedente `expensesMode` in un più generico flag `advancedMode`. Aggiungiamo i nuovi ref per gestire il quadro fiscale completo:

**Aggiornamento Store (Pseudo-codice):**
```typescript
  // Modalità
  const advancedMode = ref(false) // Sostituisce expensesMode

  // Lavoro Dipendente Parallelo
  const hasLavoroDipendente = ref(false)
  const ralDipendente = ref(0)
  const dipendenteFullTime = ref(false)

  // Addizionali (IRPEF Ordinario/SRL)
  const addizionaleRegionale = ref(1.73) // Default (es. media Lombardia)
  const addizionaleComunale = ref(0.8)   // Default (es. media Milano/Grandi Comuni)

  // Massimale INPS
  const massimaleInps = ref(119650)      // Default 2025
```
*(Da ricordare: inserire tutti questi nuovi parametri nella logica del `localStorage` e watch).*

## 2. Struttura del Componente UI (App.vue)

### Sezione Parametri Globali
Rimuovere il toggle "Modalità Avanzata" precedentemente inserito nella riga "Spese Annue" (Spec 04). Inserire invece un pulsante / interruttore "Mostra Parametri Avanzati" in calce alla sezione dei Parametri Globali.

### Pannello "Parametri Avanzati" (se attivo)
1.  **Spese**: Mostrare i due input "Spese Deducibili" e "Spese Detraibili (19%)".
2.  **Lavoro Dipendente Concomitante**:
    *   Toggle: "Hai un lavoro dipendente?"
    *   Se attivo, mostra:
        *   Input: "RAL (Reddito Lordo Annuo)"
        *   Checkbox: "Il contratto è Full-Time (Tempo Pieno)?"
        *   *Banner Alert:* Se la RAL inserita è `> 35000`, mostrare un banner rosso ben visibile: "Attenzione: con redditi da lavoro dipendente > 35.000€ non è consentito aderire al Regime Forfettario."
3.  **Tasse Locali**:
    *   Input: "Addizionale Regionale (%)". *Tooltip:* "Percentuali medie: Lombardia (1.23-1.73%), Lazio e Campania (fino a 3.33%)."
    *   Input: "Addizionale Comunale (%)". *Tooltip:* "Percentuali medie: Milano 0.8%, Roma e Napoli 0.9%."
4.  **Massimale INPS**:
    *   Input numerico: "Massimale Contributivo INPS". *Tooltip:* "Default 119.650€ (Aggiornato al 2025, soggetto a variazioni annuali INPS). Oltre questa soglia di imponibile non sono dovuti ulteriori contributi in Gestione Separata e Artigiani/Commercianti."

## 3. Logica Matematica (Vue 3 Snippet)

I calcoli cambiano profondamente per garantire accuratezza sul cumulo dei redditi.

**A) Massimale INPS ed Esenzioni/Riduzioni (Tutti i regimi)**
Prima di calcolare l'INPS (Sia GS che Artigiani), il reddito imponibile INPS deve essere cappato dal massimale.
```typescript
let imponibileInps = Math.min(imponibilePiva, massimaleInps.value);
let inps = 0;

if (cassa === 'gestione_separata') {
  // Aliquota agevolata al 24% se l'utente ha già un lavoro (e quindi versa già INPS)
  let aliquotaGs = hasLavoroDipendente.value ? 0.24 : 0.2607;
  inps = imponibileInps * aliquotaGs;
} else if (cassa === 'artigiani') {
  // Se ha un contratto subordinato Full-Time, non deve pagare INPS Artigiani/Commercianti
  if (hasLavoroDipendente.value && dipendenteFullTime.value) {
    inps = 0;
  } else {
    // Calcolo minimale + eccedente, ricordando di limitare l'eccedente in base al massimale
    // e applicando gli sconti 35/50% della spec 06
  }
}
```

**B) Cumulo IRPEF e Addizionali (Solo Ordinario e S.R.L. Compenso)**
Nel regime Ordinario, l'IRPEF si calcola sulla somma totale dei redditi. La P.IVA dovrà sostenere la differenza tra l'IRPEF calcolata sul reddito totale e quella già "trattenuta" teoricamente sulla RAL.
```typescript
// Funzione helper per calcolo IRPEF a scaglioni
function calcolaIrpef(reddito: number): number { /* logica scaglioni 2024/25 */ }

const imponibilePivaFiscale = Math.max(fatturato - speseDeducibili - inps, 0);
const imponibileTotale = imponibilePivaFiscale + (hasLavoroDipendente.value ? ralDipendente.value : 0);

// Calcolo IRPEF progressiva
let irpefCumulativa = calcolaIrpef(imponibileTotale);
let irpefGiaPagataSuRal = hasLavoroDipendente.value ? calcolaIrpef(ralDipendente.value) : 0;

// L'imposta lorda di stretta competenza della P.IVA è la differenza
let irpefLordaImpresa = irpefCumulativa - irpefGiaPagataSuRal;

// Sconto detraibili 19% (solo sulla parte impresa per semplicità)
let scontoDetraibili = advancedMode.value ? speseDetraibili.value * 0.19 : 0;
let irpefNetta = Math.max(irpefLordaImpresa - scontoDetraibili, 0);

// Calcolo Addizionali (applicate solo sull'imponibile d'impresa)
let tassaRegionale = imponibilePivaFiscale * (addizionaleRegionale.value / 100);
let tassaComunale = imponibilePivaFiscale * (addizionaleComunale.value / 100);

let tasseTotali = irpefNetta + tassaRegionale + tassaComunale;
```

## 4. User Scenarios & Testing *(mandatory)*

### User Story 1 - Cumulo IRPEF e Limite Forfettario (Priority: P1)
**Independent Test**: Spuntando "Lavoro Dipendente" e inserendo una RAL, l'IRPEF dell'ordinario aumenta sensibilmente a parità di fatturato.
**Acceptance Scenarios**:
1. **Given** un fatturato di 20.000€, **When** non ho lavoro dipendente, **Then** il regime Ordinario paga il 23% di IRPEF sull'imponibile.
2. **Given** lo stesso fatturato, **When** attivo il lavoro dipendente e inserisco RAL = 30.000€, **Then** l'intero imponibile d'impresa dell'Ordinario cade nel secondo scaglione e paga il 35% di IRPEF, diminuendo il netto.
3. **Given** RAL = 36.000€, **Then** sotto il riquadro del Regime Forfettario compare un alert rosso che avverte dell'impossibilità di aderire al regime per superamento limite RAL (35k).

### User Story 2 - Riduzioni INPS e Addizionali (Priority: P1)
**Acceptance Scenarios**:
1. **Given** la selezione di Gestione Separata e Lavoro Dipendente attivo, **Then** l'aliquota usata per i contributi in background passa dal 26.07% al 24%.
2. **Given** la selezione Cassa Artigiani e Lavoro Dipendente con spunta "Full-Time" attiva, **Then** i contributi INPS per l'Ordinario e il Forfettario crollano a zero (0€).
3. **Given** un fatturato estremo (es. 200.000€) in Gestione Separata, **Then** la voce INPS non supera `119650 * 0.2607` (o 0.24), dimostrando che il massimale è entrato in funzione.
4. **Given** un Regime Ordinario, **When** modifico l'Addizionale Regionale dall'1.73% al 3.33%, **Then** l'ammontare delle tasse mostrato cresce di conseguenza.

<!-- NR_OF_TRIES: 1 -->
