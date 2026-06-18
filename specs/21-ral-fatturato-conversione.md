# Feature Specification: Conversione Automatica al Toggle RAL/Fatturato

**Feature Branch**: `21-ral-fatturato-conversione`

**Created**: 2026-06-17

**Status**: COMPLETE

## Status: COMPLETE

**Input**: User request: "quando clicchiamo sul toggle tra fatturato e ral, facciamo la conversione on the fly del valore, per esempio: se ho il toggle su RAL e c'é impostato 42000, appena clicco sul toggle e lo faccio diventare fatturato, il valore automaticamente diventa l'equivalente in fatturato (55k circa)"

**Dependency**: Richiede il toggle Fatturato/RAL della spec `19-dipendente-ral-toggle`.

## 1. Analisi

Il toggle Fatturato/RAL (spec 19) permette all'utente di scegliere se il valore inserito nell'input globale rappresenta il fatturato (costo aziendale) o la RAL. Attualmente, cambiando modalità il valore numerico resta invariato, ma la sua interpretazione cambia — causando un netto completamente diverso. Questo è corretto se l'utente sta inserendo un nuovo valore, ma scomodo se l'utente vuole vedere l'equivalente nell'altra modalità.

**Scenario tipico**: L'utente conosce la propria RAL (€42.000), la inserisce in modalità RAL, e vuole vedere quanto sarebbe il fatturato equivalente. Deve fare il calcolo a mente (42.000 × 1,2381 ≈ 52.000) e reinserire manualmente il valore dopo aver cambiato toggle.

**Soluzione**: Al cambio di toggle, il valore nell'input viene automaticamente convertito usando il fattore di conversione basato sull'aliquota INPS datore di lavoro:

| Direzione | Formula | Esempio |
|-----------|---------|---------|
| RAL → Fatturato | `valore × 1.2381` | 42.000 → 52.000,20 |
| Fatturato → RAL | `valore / 1.2381` | 52.000,20 → 42.000 |

Il fattore 1.2381 deriva da: `1 + aliquota_inps_datore` = `1 + 0,2381` (23,81% contributi a carico azienda).

## 2. User Scenarios & Testing

### User Story 1 — Conversione RAL → Fatturato (Priority: P1)

L'utente ha inserito la propria RAL e vuole vedere il fatturato equivalente (costo aziendale) con un click.

**Independent Test**: Toggle su RAL, input = 42.000. L'utente clicca il toggle portandolo su Fatturato. Il valore nell'input diventa ~52.000.

**Acceptance Scenarios**:

1. **Given** toggle = RAL e input = 42.000, **When** l'utente clicca il toggle, **Then** il toggle passa a Fatturato e l'input mostra 52.000,20.
2. **Given** toggle = RAL e input = 30.000, **When** l'utente clicca il toggle, **Then** l'input mostra 37.143.
3. **Given** toggle = RAL e input = 0, **When** l'utente clicca il toggle, **Then** l'input resta 0 (nessuna conversione significativa).

### User Story 2 — Conversione Fatturato → RAL (Priority: P1)

L'utente ha inserito un fatturato e vuole sapere a quale RAL corrisponde.

**Independent Test**: Toggle su Fatturato, input = 52.000. L'utente clicca il toggle portandolo su RAL. Il valore nell'input diventa ~42.000.

**Acceptance Scenarios**:

1. **Given** toggle = Fatturato e input = 52.000,20, **When** l'utente clicca il toggle, **Then** il toggle passa a RAL e l'input mostra ~42.000.
2. **Given** toggle = Fatturato e input = 100.000, **When** l'utente clicca il toggle, **Then** l'input mostra ~80.768.

### User Story 3 — Andata e ritorno (Priority: P2)

La conversione deve essere reversibile: un doppio toggle riporta (approssimativamente) al valore originale.

**Acceptance Scenarios**:

1. **Given** toggle = RAL e input = 42.000, **When** l'utente clicca due volte il toggle (RAL → Fatturato → RAL), **Then** l'input torna a 42.000 (±1 per arrotondamento).
2. **Given** toggle = Fatturato e input = 50.000, **When** l'utente clicca due volte il toggle, **Then** l'input torna a 50.000 (±1 per arrotondamento).

## 3. Functional Requirements

- **FR1**: Quando l'utente cambia il toggle da "RAL" a "Fatturato", il valore nell'input deve essere automaticamente convertito con la formula `nuovo_valore = valore_corrente × 1.2381`.
- **FR2**: Quando l'utente cambia il toggle da "Fatturato" a "RAL", il valore nell'input deve essere automaticamente convertito con la formula `nuovo_valore = valore_corrente / 1.2381`.
- **FR3**: La conversione deve avvenire immediatamente al click del toggle, senza richiedere azioni aggiuntive da parte dell'utente.
- **FR4**: Il valore convertito deve essere arrotondato a due decimali (centesimi di euro).
- **FR5**: Se il valore corrente è 0, la conversione produce 0 in entrambe le direzioni.
- **FR6**: Il fattore di conversione (1.2381) deve essere lo stesso usato per il calcolo del netto dipendente (coerente con l'aliquota INPS datore).
- **FR7**: Dopo la conversione, tutte le card devono ricalcolarsi automaticamente con il nuovo valore.

## 4. Success Criteria

- **SC1**: Toggle RAL→Fatturato con input 42.000: il nuovo valore è 52.000,20 (±1 cent).
- **SC2**: Toggle Fatturato→RAL con input 52.000,20: il nuovo valore è 42.000 (±1 cent).
- **SC3**: Doppio toggle (andata e ritorno) restituisce il valore originale entro ±1 centesimo.
- **SC4**: La conversione è percepita come istantanea dall'utente (nessun ritardo visibile).

## 5. Key Entities

- **Fattore di conversione**: 1.2381 = 1 + 0,2381 (aliquota INPS a carico datore di lavoro).
- **Valore input**: Il numero nell'input globale, la cui interpretazione (RAL o Fatturato) dipende dallo stato del toggle.

## 6. Assumptions

- L'aliquota INPS datore (23,81%) è quella di default usata in tutta l'applicazione.
- La conversione è puramente matematica e non tiene conto di altre variabili (es. massimali, agevolazioni).
- Il toggle è lo stesso previsto dalla spec 19. Se la spec 19 non è ancora implementata, questa feature va realizzata insieme ad essa.
- L'arrotondamento a 2 decimali è sufficiente; non servono precisioni maggiori.

## 7. Edge Cases

- Valore input = 0: conversione produce 0, nessun effetto collaterale.
- Valore input molto alto (es. 999.999): conversione gestita correttamente senza overflow.
- Valore input con molti decimali (es. 42.000,12345): la conversione usa il valore pieno e arrotonda solo il risultato finale a 2 decimali.
- Toggle cliccato rapidamente più volte: ogni click esegue la conversione sul valore corrente; il comportamento è deterministico.

<!-- NR_OF_TRIES: 1 -->
