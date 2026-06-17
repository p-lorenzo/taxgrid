# Feature Specification: Toggle Fatturato/RAL e Trattamento Integrativo Dipendente

**Feature Branch**: `19-dipendente-ral-toggle`

**Created**: 2026-06-17

**Status**: COMPLETE

**Input**: User report: "il calcolo matematico del dipendente non mi torna [...] io ho una ral di 42000 e su 13 mensilitá il mio netto é circa 2300E al mese, su taxgrid invece risulta 1866,97, mi sembra bassissimo". L'utente chiede un toggle sull'input globale per inserire RAL invece di fatturato, e l'aggiunta del Trattamento Integrativo.

## 1. Problema

La card Dipendente tratta il valore inserito in "Fatturato Annuo Stimato" come **Costo Aziendale Totale** (RAL + contributi INPS a carico datore), derivando la RAL con la formula inversa `RAL = fatturato / 1.2381`. Un utente che conosce la propria RAL (es. €42.000) la inserisce come fatturato, ottenendo un netto calcolato su una RAL derivata di ~€33.923 anziché €42.000. Il risultato è un netto mensile di €1.867 anziché ~€2.170 (su 13 mensilità).

## 2. Soluzione

### 2.1 Toggle Fatturato / RAL

Accanto all'input globale "Fatturato Annuo Stimato", aggiungere un toggle a due stati:

- **Fatturato** (default, comportamento attuale): l'utente inserisce il fatturato/costo aziendale. Le card P.IVA lo usano come ricavo lordo; la card Dipendente lo interpreta come costo aziendale totale e deriva la RAL.
- **RAL**: l'utente inserisce direttamente la propria RAL. La card Dipendente la usa come base per il calcolo del netto. Le card P.IVA usano il **fatturato equivalente** = `RAL × (1 + aliquota_inps_datore)` = `RAL × 1.2381`, in modo da mantenere la comparabilità "a parità di costo azienda".

La label dell'input deve cambiare dinamicamente: "Fatturato Annuo Stimato" in modalità Fatturato, "RAL (Retribuzione Annua Lorda)" in modalità RAL.

### 2.2 Modifica Testo Card Dipendente

Il paragrafo esplicativo nella card Dipendente deve riflettere il toggle:

- **Modalità Fatturato**: "Il Fatturato Annuo (X €) viene considerato come il Costo Aziendale Totale. Da qui si ricava la RAL (Y €) sottraendo i contributi a carico dell'azienda."
- **Modalità RAL**: "La RAL inserita (X €) corrisponde al tuo lordo annuo. Per il confronto con gli altri regimi, viene calcolato un fatturato equivalente (Y € = RAL + contributi a carico azienda)."

Dove X è il valore inserito e Y è il valore derivato (RAL o fatturato equivalente).

### 2.3 Trattamento Integrativo (ex Bonus Renzi)

Aggiungere al calcolo del netto dipendente il Trattamento Integrativo, un credito d'imposta per lavoratori dipendenti con imponibile fiscale ≤ €28.000.

| Imponibile fiscale | Credito annuo |
|---|---|
| ≤ €15.000 | €1.200 |
| €15.001 – €28.000 | €1.200 × (28.000 − imponibile) / 13.000 |
| > €28.000 | €0 |

Il credito si applica dopo il calcolo IRPEF netta e non può eccedere l'imposta dovuta: `creditoEffettivo = min(creditoTeorico, irpefNetta)`.

## 3. User Scenarios & Testing

### User Story 1 — Inserimento RAL Diretto (Priority: P1)

Un lavoratore dipendente conosce la propria RAL e vuole verificare il netto mensile senza dover calcolare il costo aziendale equivalente.

**Independent Test**: L'utente imposta il toggle su "RAL", inserisce 42.000, imposta 13 mensilità. La card Dipendente mostra un netto mensile di ~€2.170.

**Acceptance Scenarios**:

1. **Given** toggle su "RAL", **When** l'utente inserisce 42.000 e 13 mensilità, **Then** il netto mensile dipendente è ~€2.170 (±€50) e le altre card usano fatturato equivalente = 42.000 × 1.2381 ≈ 52.000.
2. **Given** toggle su "RAL", **When** l'utente inserisce 30.000 e 12 mensilità, **Then** il netto mensile dipendente è ~€1.870 (±€50).
3. **Given** toggle su "RAL", **When** l'utente passa a "Fatturato", **Then** lo stesso valore numerico viene ora interpretato come costo aziendale e il netto dipendente cala coerentemente.

### User Story 2 — Comportamento Default (Fatturato) Invariato (Priority: P1)

Il comportamento pre-esistente in modalità Fatturato deve rimanere identico per non rompere l'esperienza degli utenti abituali.

**Acceptance Scenarios**:

1. **Given** toggle su "Fatturato" (default), **When** l'utente inserisce 50.000, **Then** la card Dipendente deriva RAL = 50.000 / 1.2381 ≈ 40.371 e il netto è calcolato su tale RAL (comportamento identico a prima).

### User Story 3 — Trattamento Integrativo (Priority: P1)

Il netto dipendente include il Trattamento Integrativo quando l'imponibile fiscale lo consente.

**Acceptance Scenarios**:

1. **Given** toggle su "RAL" e RAL = 14.000, **When** il calcolo viene eseguito, **Then** il trattamento integrativo di €1.200/anno è applicato e il netto mensile aumenta di ~€100 rispetto al calcolo senza trattamento.
2. **Given** toggle su "Fatturato" e fatturato = 17.000 (RAL derivata ~13.731, imponibile ~12.469), **When** il calcolo viene eseguito, **Then** il trattamento integrativo di €1.200 è applicato (imponibile ≤ 15.000).
3. **Given** toggle su "RAL" e RAL = 42.000, **When** il calcolo viene eseguito, **Then** nessun trattamento integrativo è applicato (imponibile > 28.000).

## 4. Functional Requirements

- **FR1**: Deve esistere un toggle a due stati ("Fatturato" / "RAL") accanto all'input globale "Fatturato Annuo Stimato".
- **FR2**: In modalità "Fatturato" (default), il comportamento è identico all'attuale: la card Dipendente deriva RAL = fatturato / 1.2381.
- **FR3**: In modalità "RAL", la card Dipendente usa il valore inserito direttamente come RAL per il calcolo del netto.
- **FR4**: In modalità "RAL", le altre card (Forfettario, Ordinario, SRL) ricevono un fatturato equivalente = RAL × 1.2381.
- **FR5**: La label dell'input globale deve riflettere la modalità attiva: "Fatturato Annuo Stimato" o "RAL (Retribuzione Annua Lorda)".
- **FR6**: Il paragrafo esplicativo nella card Dipendente deve aggiornarsi dinamicamente in base al toggle (vedi sezione 2.2).
- **FR7**: Il calcolo del netto dipendente deve includere il Trattamento Integrativo quando l'imponibile fiscale è ≤ €28.000, con le regole descritte in sezione 2.3.
- **FR8**: Il trattamento integrativo non può eccedere l'IRPEF netta (nessun rimborso oltre l'imposta dovuta).
- **FR9**: Il netto mensile dipendente continua a essere diviso per `mesiParagone`.

## 5. Success Criteria

- **SC1**: In modalità RAL con input 42.000 e 13 mensilità, il netto mensile dipendente è ~€2.170 (±5%).
- **SC2**: In modalità Fatturato con input 50.000, il netto mensile dipendente è identico al valore pre-modifica.
- **SC3**: Passando da Fatturato a RAL (e viceversa), il ricalcolo è immediato e tutte le card si aggiornano.
- **SC4**: Con imponibile ≤ €15.000, il netto mensile include ~€100/mese in più grazie al trattamento integrativo.
- **SC5**: Con imponibile > €28.000, il trattamento integrativo è €0 e il netto non cambia rispetto al calcolo base.

## 6. Key Entities

- **Modalità Input**: Stato del toggle (Fatturato | RAL), determina come interpretare il valore inserito.
- **Fatturato Equivalente**: In modalità RAL, il valore RAL × 1.2381 passato alle card P.IVA.
- **Trattamento Integrativo**: Credito d'imposta annuo per dipendenti, calcolato sull'imponibile fiscale.

## 7. Assumptions

- L'aliquota INPS datore (23,81%) è fissa e usata per le conversioni RAL ↔ fatturato.
- Il toggle è globale e condiviso da tutte le card (non per-card).
- In modalità RAL, il "fatturato equivalente" è un'approssimazione del costo aziendale; non vengono applicati altri contributi (INAIL, TFR, etc.).
- Le soglie del trattamento integrativo (€15.000 / €28.000 / €1.200) sono quelle 2024-2025.

## 8. Edge Cases

- RAL = 0: fatturato equivalente = 0, nessun errore.
- Toggle cambiato senza modificare il valore: il netto dipendente cambia perché cambia l'interpretazione del numero (es. 42.000 come RAL dà netto più alto che 42.000 come costo aziendale).
- RAL molto bassa (es. €5.000): trattamento integrativo €1.200 ma IRPEF netta = 0, credito effettivo = 0.
- Imponibile esattamente €15.000: credito pieno €1.200.
- Imponibile esattamente €28.000: credito €0.
