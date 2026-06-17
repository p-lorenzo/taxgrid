# Feature Specification: Color Scheme Update

**Feature Branch**: `02-color-scheme-update`

**Created**: 2026-06-17

**Status**: COMPLETE

## Status: COMPLETE

**Input**: User description: "cambiamo lo schema colori da quel violaceo a un bluastro scuro e giallo #e2af0d. non differenziamo colori per vari regimi"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Uniformazione e Modifica Palette Colori (Priority: P1)

Come utente, voglio che l'intera applicazione utilizzi un unico schema colori coerente basato su tonalità di bluastro scuro (dark blue) e accenti in giallo (#e2af0d), eliminando i colori differenziati (indaco, viola, rosa) per i singoli regimi.

**Why this priority**: L'utente richiede un design visivo più professionale e coerente con il proprio brand (blu scuro e giallo oro), rinunciando alla distinzione cromatica dei regimi che al momento rende la UI troppo variopinta.

**Independent Test**: Lanciando l'app, l'header, i pulsanti, i gradienti, i toggle e gli header delle singole card dei regimi devono presentare esclusivamente tinte basate sul blu scuro (ad es. `blue-900`, `slate-800` o colori custom se necessario) e sull'accento giallo specifico `#e2af0d`.

**Acceptance Scenarios**:

1. **Given** il file `src/App.vue`, **When** vengono ispezionate le classi Tailwind relative ai regimi (Forfettario, Ordinario, SRL), **Then** i colori specifici (es. `indigo-50`, `purple-50`, `pink-50`, testate, testi colorati) devono essere sostituiti con una classe coerente per tutte le card (es. uno sfondo neutro o bluastro uniforme per tutte le testate delle card).
2. **Given** i testi decorati (es. l'H1 principale "TaxGrid" che usava `from-indigo-500 via-purple-500 to-pink-500`), **When** vengono renderizzati, **Then** devono utilizzare il nuovo schema colori con sfumature di blu e/o il giallo `#e2af0d` come colore d'accento.
3. **Given** gli elementi interattivi (come il componente `<Switch>` per l'Aliquota Startup o i valori finali del "Netto in Tasca"), **When** sono attivi o evidenziati, **Then** devono utilizzare il colore giallo `#e2af0d` (che su Tailwind può essere configurato come `bg-[#e2af0d]` / `text-[#e2af0d]` o aggiunto in configurazione) invece dell'indaco, rosa o verde smeraldo precedente, per mantenere la coerenza visiva o comunque far risaltare il giallo come colore primario.
4. **Given** la UI complessiva, **When** controllata, **Then** non deve essere presente alcun residuo della palette precedente (indaco, viola, rosa). Tutti i regimi appaiono cromaticamente identici.

---

<!-- NR_OF_TRIES: 1 -->
