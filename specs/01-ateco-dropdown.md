# Feature Specification: ATECO Dropdown Selection

**Feature Branch**: `01-ateco-dropdown`

**Created**: 2026-06-17

**Status**: COMPLETE

**Input**: User description: "invece che avere il coefficente di redditivitá ateco tra i parametri globali, permettiamo di scegliere il codice ateco da un dropdown e in base al codice ateco scelto impostiamo il coefficente di redditifvitá per il forfettario"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sostituzione Input con Dropdown ATECO (Priority: P1)

Come utente, voglio selezionare la mia categoria ATECO da un menu a tendina (dropdown) invece di dover inserire a mano la percentuale del coefficiente di redditività, così da non dover cercare il coefficiente corretto su internet.

**Why this priority**: Migliora nettamente la User Experience, riducendo l'attrito per gli utenti che non conoscono a memoria il proprio coefficiente di redditività.

**Independent Test**: L'utente può aprire il dropdown nella UI dei parametri globali, selezionare una categoria e vedere i calcoli del regime Forfettario aggiornarsi automaticamente in base al nuovo coefficiente.

**Acceptance Scenarios**:

1. **Given** la sezione "Parametri Globali" nella UI, **When** l'utente cerca il campo ATECO, **Then** deve vedere una `<select>` (o dropdown equivalente) al posto dell'attuale `<input type="number">`.
2. **Given** il dropdown ATECO, **When** viene aperto, **Then** deve mostrare una lista delle macro-categorie ATECO più comuni per il regime forfettario (es: "Professionisti (78%)", "Artigiani e Imprese (67%)", "Commercio (40%)", "Servizi (67%)", "Industrie alimentari (40%)", "Commercio ambulante (40% / 54%)", "Costruzioni e immobiliari (86%)").
3. **Given** la selezione di un'opzione dal dropdown, **When** l'utente cambia categoria, **Then** la variabile di stato `atecoCoef` nel Pinia store (`src/store/taxStore.ts`) deve essere aggiornata al valore decimale corrispondente (es. 0.78 per Professionisti).
4. **Given** l'aggiornamento di `atecoCoef`, **When** lo stato di Pinia cambia, **Then** i risultati del calcolo per la card del "Regime Forfettario" devono aggiornarsi reattivamente.
5. **Given** l'avvio dell'applicazione, **When** i dati vengono caricati dal `localStorage`, **Then** il dropdown deve mostrare correttamente la categoria salvata in precedenza (il `taxStore.ts` potrebbe necessitare un refactor per salvare la categoria scelta anziché solo il numero, oppure dedurre la categoria dal numero se i valori sono unici o sufficienti per l'MVP).

---

<!-- NR_OF_TRIES: 1 -->
