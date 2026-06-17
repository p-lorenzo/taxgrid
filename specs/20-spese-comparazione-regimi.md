# Feature Specification: Impatto Spese su Forfettario e Dipendente

**Feature Branch**: `20-spese-comparazione-regimi`

**Created**: 2026-06-17

**Status**: COMPLETE

**Input**: User report: "quando noi alziamo le spese, si abbassano i ricavi per regime ordinario e srl ma non per il regime forfettario, perché effettivamente quelle spese il forfettario non le registra come spese di impresa. eppure per un paragone corretto se abbiamo delle spese, per il regime ordinario e srl quelle spese le deduci mentre per forfettario no, quindi, o le sottraiamo dal netto nel forfettario, oppure aggiungiamo una nuova voce nel forfettario per mostrare quanto sarebbero al netto delle spese i ricavi finali, idem per il dipendente"

## 1. Analisi

Attualmente le `speseDeducibili` influenzano il calcolo di Ordinario e SRL (deduzione pre-imposta che riduce l'imponibile), ma non hanno alcun effetto su Forfettario e Dipendente.

| Regime | Trattamento spese |
|--------|-------------------|
| Forfettario | Ignorate — l'imponibile è `fatturato × coefficiente ATECO`, le spese reali non rilevano |
| Ordinario | Dedotte pre-imposta: `imponibile = fatturato − speseDeducibili` |
| SRL | Dedotte pre-imposta: `utileLordoOperativo = fatturato − speseDeducibili − 4.000` |
| Dipendente | Ignorate — un dipendente non ha spese aziendali |

Questo crea un'asimmetria nel confronto: un utente che sostiene €10.000 di spese reali vede il netto di Ordinario e SRL ridursi (correttamente, perché le spese riducono l'imponibile), mentre Forfettario e Dipendente restano invariati, dando l'impressione errata che siano più convenienti di quanto non lo siano realmente al netto delle spese vive.

**Esempio numerico**: Fatturato €50.000, Spese €10.000, coefficiente ATECO 78%.
- Forfettario: netto calcolato su imponibile €39.000 (50k × 78%) → il netto NON riflette le spese reali.
- Se le spese reali fossero €10.000, il netto effettivo sarebbe `netto − 10.000`, sensibilmente più basso.

## 2. Soluzione Proposta

Per Forfettario e Dipendente, le spese vanno sottratte **dopo le imposte** (post-tax), poiché in questi regimi non sono fiscalmente deducibili. Per Ordinario e SRL le spese sono già dedotte pre-imposta e non serve alcuna modifica.

**Approccio scelto**: Le spese vengono sottratte direttamente dal "Netto" mostrato sulla card (`Netto Finale = max(netto_fiscale − speseDeducibili, 0)`), ma nel dettaglio/breakdown viene aggiunta una voce intermedia che mostra il calcolo:

1. Netto fiscale (al lordo delle spese): X
2. Spese (non deducibili): −Y
3. **Netto Finale**: X − Y

In questo modo la card mostra subito il valore reale (al netto di tutto), e il breakdown spiega trasparentemente come ci si arriva, distinguendo la componente fiscale da quella delle spese vive.

## 3. User Scenarios & Testing

### User Story 1 — Confronto equo con spese (Priority: P1)

Un freelancer con fatturato €50.000 e spese reali €10.000 vuole confrontare i 4 regimi in modo equo. Le spese devono impattare anche Forfettario e Dipendente, non solo Ordinario e SRL.

**Independent Test**: Con fatturato 50.000, spese 10.000, il Forfettario mostra un netto (o netto dopo spese) ridotto di €10.000 rispetto al calcolo attuale.

**Acceptance Scenarios**:

1. **Given** fatturato = 50.000, speseDeducibili = 10.000, **When** si guarda la card Forfettario, **Then** il "Netto Finale" mostrato è ridotto di €10.000 rispetto al netto fiscale, e il breakdown mostra: Netto fiscale X, Spese −10.000, Netto Finale X−10.000.
2. **Given** fatturato = 50.000, speseDeducibili = 0, **When** si guarda qualsiasi card, **Then** il netto è identico al comportamento attuale e nessuna voce "Spese" appare nel breakdown.
3. **Given** fatturato = 50.000, speseDeducibili = 10.000, **When** si guarda la card Ordinario, **Then** il netto è identico al comportamento attuale (le spese sono già dedotte pre-imposta — nessuna doppia sottrazione).

### User Story 2 — Dipendente con spese (Priority: P2)

Un utente confronta il lavoro dipendente con la P.IVA. Le spese aziendali che sosterrebbe da freelancer devono essere visibili anche nel confronto col dipendente.

**Acceptance Scenarios**:

1. **Given** fatturato = 40.000, speseDeducibili = 8.000, modalità RAL, **When** si guarda la card Dipendente, **Then** il "Netto Finale" è ridotto di €8.000 rispetto al netto fiscale, e il breakdown mostra la voce intermedia "Spese (non deducibili)".
2. **Given** speseDeducibili = 0, **When** si guarda la card Dipendente, **Then** nessuna modifica rispetto al comportamento attuale.

### User Story 3 — Spese superiori al netto (Edge Case) (Priority: P3)

Se le spese superano il netto calcolato, il "Netto dopo Spese" non deve andare in negativo.

**Acceptance Scenarios**:

1. **Given** speseDeducibili > netto fiscale Forfettario, **When** il calcolo viene eseguito, **Then** il "Netto Finale" mostrato è €0 (mai negativo) e il breakdown mostra lo scorporo corretto.

## 4. Functional Requirements

- **FR1**: Per il regime Forfettario, il "Netto" mostrato sulla card deve includere la sottrazione delle `speseDeducibili` (post-tax): `Netto Finale = max(netto_fiscale − speseDeducibili, 0)`.
- **FR2**: Per il regime Dipendente, il "Netto" mostrato sulla card deve includere la sottrazione delle `speseDeducibili` (post-tax): `Netto Finale = max(netto_fiscale − speseDeducibili, 0)`.
- **FR3**: Per Ordinario e SRL, nessuna modifica: le spese sono già dedotte pre-imposta nel calcolo esistente.
- **FR4**: Il "Netto Finale" non deve mai essere negativo (minimo €0).
- **FR5**: Il breakdown/modale di dettaglio per Forfettario e Dipendente deve mostrare tre voci distinte: "Netto fiscale" (al lordo spese), "Spese (non deducibili)", e "Netto Finale" (differenza).
- **FR6**: Il "Netto Mensile" sulla card e nella dashboard deve essere calcolato come `Netto Finale / mesiParagone`.
- **FR7**: Se `speseDeducibili = 0`, la voce "Spese (non deducibili)" non deve apparire nel breakdown (comportamento pulito, nessuna riga a zero).

## 5. Success Criteria

- **SC1**: Con fatturato 50.000 e spese 10.000, il "Netto Finale" del Forfettario è esattamente €10.000 inferiore al netto calcolato con spese 0, e il breakdown mostra chiaramente le tre voci (netto fiscale, spese, netto finale).
- **SC2**: Con fatturato 50.000 e spese 10.000, il netto dell'Ordinario è identico a prima (nessuna doppia sottrazione).
- **SC3**: Con spese 0, il comportamento di tutte le card è invariato rispetto alla versione precedente, e nessuna voce "Spese" appare nei breakdown.
- **SC4**: Il "Netto Finale" non scende mai sotto €0 per nessun regime e nessuna combinazione di input.

## 6. Key Entities

- **Netto dopo Spese**: Valore derivato = `max(netto − speseDeducibili, 0)`. Rappresenta il guadagno effettivo al netto di tutte le uscite (tasse + spese vive).
- **Spese Deducibili (globali)**: Campo già esistente, ora il suo effetto si estende anche a Forfettario e Dipendente (post-tax).

## 7. Assumptions

- Le `speseDeducibili` rappresentano spese reali sostenute dall'utente (affitto, materiali, servizi) che in Ordinario/SRL sono deducibili fiscalmente ma in Forfettario/Dipendente no.
- La sottrazione post-tax è fiscalmente corretta: in assenza di deducibilità, le spese riducono il netto 1:1.
- Non si applica alcun coefficiente o trasformazione alle spese; il valore inserito viene sottratto tal quale.
- Per il Dipendente in modalità RAL, le spese vengono comunque sottratte dal netto (anche se atipico per un dipendente puro, serve al confronto equo).

## 8. Edge Cases

- `speseDeducibili = 0`: nessuna modifica visibile, nessuna voce aggiuntiva nei breakdown.
- `speseDeducibili > netto`: "Netto dopo Spese" = €0.
- `speseDeducibili` modificate in tempo reale: il ricalcolo è immediato su Forfettario e Dipendente.
- Combinazione con trattamento integrativo (spec 19): le spese si sottraggono DOPO il trattamento integrativo (il trattamento si applica all'IRPEF, le spese al netto finale).
