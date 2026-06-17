# Feature Specification: Bug Fix - Logica Fiscale Compenso Amministratore S.R.L.

**Feature Branch**: `03-srl-compenso-bugfix`

**Created**: 2026-06-17

**Status**: Incomplete

**Input**: User description: Implementare le corrette regole matematiche per la S.R.L. con "Tutto Compenso Amministratore", che si discosta dalle ditte individuali (1/3 INPS vs 2/3 INPS, detrazioni lavoro dipendente, e costi fissi societari).

## 1. Analisi Root-Cause del Problema Attuale

Nello stato reattivo attuale (`taxStore.ts`), il calcolo della S.R.L. con opzione `compenso` è fortemente accoppiato alla logica del Regime Ordinario: l'intero "Utile Lordo" viene assegnato al "Compenso", e su di esso viene applicata in modo errato una ritenuta INPS del 26,07% interamente a carico dell'amministratore, ignorando la ripartizione aziendale (2/3). Inoltre, l'IRPEF viene calcolata "lorda" senza applicare le detrazioni da lavoro dipendente/assimilato previste dalla normativa vigente, rendendo il netto finale identico a quello di una ditta individuale. 
Manca anche una deduzione iniziale dei costi fissi e di gestione specifici di una società di capitali.

## 2. Nuova Logica e Regole di Dominio

Per l'opzione "Tutto Compenso Amministratore":
1. **Budget Societario:** `Utile Lordo S.R.L.` = `Fatturato` - `Spese` - `Costi Fissi S.R.L.` (es. 4.000€ statici).
2. **Scorporo INPS Aziendale:** Il budget societario disponibile deve coprire il *Compenso Lordo* dell'amministratore **più** i 2/3 dell'INPS Gestione Separata a carico dell'azienda (2/3 del 33,59% = ~22,39%).
   - `Compenso Lordo` = `Utile Lordo S.R.L.` / `1.2239`
   - `INPS Azienda (2/3)` = `Compenso Lordo * 0.2239`
3. **Calcolo Busta Paga Amministratore:**
   - `INPS Amministratore (1/3)` = `Compenso Lordo * 0.1120`
   - `Imponibile Fiscale` = `Compenso Lordo - INPS Amministratore (1/3)`
4. **Calcolo IRPEF con Detrazioni:** 
   - `IRPEF Lorda` = Calcolo progressivo a scaglioni sull'`Imponibile Fiscale`
   - `Detrazioni Lavoro Dipendente` = Formula basata sull'imponibile (vedere implementazione).
   - `IRPEF Netta` = `IRPEF Lorda - Detrazioni Lavoro Dipendente` (minimo zero).
5. **Netto Finale:** `Netto in Tasca` = `Compenso Lordo` - `INPS Amministratore (1/3)` - `IRPEF Netta`.

## 3. Modifiche a `src/store/taxStore.ts`

### Snippet Vue 3 (Composition API) da integrare

Nel file `src/store/taxStore.ts`, separare le logiche e aggiornare il calcolo per la S.R.L.:

```typescript
// Helper: Calcolo IRPEF Lorda (Scaglioni 2024)
function calcolaIrpefLorda(imponibile: number) {
  if (imponibile <= 28000) return imponibile * 0.23;
  if (imponibile <= 50000) return (28000 * 0.23) + ((imponibile - 28000) * 0.35);
  return (28000 * 0.23) + (22000 * 0.35) + ((imponibile - 50000) * 0.43);
}

// Helper: Detrazioni Lavoro Dipendente/Assimilato
function calcolaDetrazioniDipendente(imponibile: number) {
  if (imponibile <= 15000) return 1955;
  if (imponibile <= 28000) return 1910 + 1190 * ((28000 - imponibile) / 13000);
  if (imponibile <= 50000) return 1910 * ((50000 - imponibile) / 22000);
  return 0;
}

// Update srlResult computed
const srlResult = computed(() => {
  const costiFissiSrl = 4000;
  const utileLordoOperativo = Math.max(fatturato.value - spese.value - costiFissiSrl, 0);

  let tasseSrl = 0;
  let inpsTotaleSostenutoDaUtente = 0; // Costo visivo: ciò che esce dalle sue tasche o dalla sua azienda
  let tasseTotali = 0;
  let netto = 0;

  if (srlDistribuzione.value === 'compenso') {
    // Il budget operativo deve coprire il compenso lordo + i 2/3 di INPS a carico azienda
    // Aliquota INPS totale Co.co.co = 33.59% (22.39% azienda, 11.20% amministratore)
    const compensoLordo = utileLordoOperativo / 1.2239;
    const inpsAzienda = compensoLordo * 0.2239;
    const inpsAmministratore = compensoLordo * 0.1120;
    
    const imponibileFiscale = Math.max(compensoLordo - inpsAmministratore, 0);
    const irpefLorda = calcolaIrpefLorda(imponibileFiscale);
    const detrazioni = calcolaDetrazioniDipendente(imponibileFiscale);
    const irpefNetta = Math.max(irpefLorda - detrazioni, 0);
    
    // Per un confronto equo nella dashboard, mostriamo l'INPS totale o solo quello trattenuto.
    // L'utente percepisce il carico fiscale, quindi INPS = inpsAzienda + inpsAmministratore
    inpsTotaleSostenutoDaUtente = inpsAzienda + inpsAmministratore; 
    tasseTotali = irpefNetta;
    netto = compensoLordo - inpsAmministratore - irpefNetta;
  } else {
    // Distribuzione Utili: IRES 24% + IRAP ~3.9% sull'utile operativo
    tasseSrl = utileLordoOperativo * 0.279;
    const utileNetto = utileLordoOperativo - tasseSrl;
    // Tassazione soci dividendi (26%)
    const tasseDividendi = utileNetto * 0.26;
    
    inpsTotaleSostenutoDaUtente = 0; // Gli utili non scontano INPS in GS
    tasseTotali = tasseSrl + tasseDividendi;
    netto = utileNetto - tasseDividendi;
  }

  return { 
    inps: inpsTotaleSostenutoDaUtente, 
    tasse: tasseTotali, 
    netto 
  }
});
```

## User Scenarios & Testing *(mandatory)*

### User Story 1 - S.R.L. Compenso Amministratore (Priority: P1)

**Independent Test**: Modificando la UI impostando `50.000` di fatturato e `5.000` di spese, la colonna "Regime Ordinario" e la colonna "S.R.L. con Compenso" devono ora restituire numeri **molto diversi**, riflettendo i costi fissi (4.000€), la ripartizione INPS (2/3 vs 1/3) e l'impatto delle detrazioni sul compenso assimilato.

**Acceptance Scenarios**:

1. **Given** l'esecuzione del codice aggiornato, **When** i dati globali vengono valutati dal watcher/store, **Then** il computed `srlResult` deve usare la funzione di calcolo specifica e non condividere più le formule del Regime Ordinario.
2. **Given** la selezione della strategia "Tutto Compenso Amministratore", **When** viene calcolata l'imposta, **Then** l'algoritmo deve applicare correttamente le detrazioni da lavoro dipendente/assimilato riducendo l'IRPEF lorda.
3. **Given** il calcolo del budget SRL, **When** viene determinato l'utile operativo, **Then** deve sempre sottoporre 4.000€ di `costiFissiSrl` come spesa di deduzione in testa prima di distribuire fondi.

---

<!-- NR_OF_TRIES: 0 -->
