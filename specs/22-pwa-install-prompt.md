# Feature Specification: Prompt di Installazione PWA (Add to Home Screen)

**Feature Branch**: `22-pwa-install-prompt`

**Created**: 2026-06-18

**Status**: COMPLETE

## Status: COMPLETE

**Input**: User request: "App PWA (dovrebbe già esistere la spec forse ma non mi sembra sia stata implementata) vorrei che quando apri il sito da mobile, ti venga proposto di 'aggiungerlo alla home screen' in modo che puoi usarlo anche offline"

**Dependency**: Richiede il setup PWA di base della spec `15-pwa-support` (già completato a livello di configurazione build e manifest).

---

## 1. Analisi

Attualmente l'applicazione ha il supporto PWA di base (`vite-plugin-pwa` configurato con manifest e service worker). Tuttavia, la promozione e il prompt per l'installazione sono lasciati interamente al comportamento nativo del browser. Questo ha diversi limiti:
1. Su molti browser mobili il prompt nativo è poco visibile o compare solo dopo interazioni ripetute.
2. Su iOS (Safari), non esiste alcun prompt di installazione nativo automatico; l'utente deve avviare manualmente l'aggiunta tramite il menu "Condividi".
3. Mancanza di controllo dell'esperienza utente (nessuna possibilità di mostrare il prompt in momenti opportuni o di posticiparlo).

### Soluzione Proposta
Implementare un banner/pop-up personalizzato ed elegante ("Aggiungi alla Home Screen") che si attiva all'avvio su dispositivi mobile, differenziando il comportamento tra piattaforme Android/Desktop (basate su Chromium) e iOS (Safari).

#### Comportamento per Piattaforme Android / Desktop (Chromium)
1. Intercettare l'evento standard del browser `beforeinstallprompt`.
2. Prevenire il comportamento di default (`e.preventDefault()`) per evitare la barra nativa del browser.
3. Salvare il riferimento all'evento.
4. Mostrare il nostro banner personalizzato "Installa TaxGrid".
5. Quando l'utente clicca su "Installa", invocare il metodo `prompt()` sull'evento salvato per mostrare il dialogo di installazione nativo e gestire il risultato.

#### Comportamento per iOS (Safari)
1. Rilevare se l'utente sta navigando da un dispositivo iOS (iPhone/iPad).
2. Verificare se l'app NON è già in modalità standalone (ovvero l'utente è nel browser Safari normale).
3. Mostrare un banner informativo specifico per iOS con le istruzioni in italiano: *"Per installare l'app, tocca l'icona Condividi [icona condividi] nella barra di Safari e seleziona 'Aggiungi alla schermata Home' [icona più]"*.

#### Logica di Chiusura e Cooldown (LocalStorage)
Per evitare un'esperienza utente invadente, il banner deve includere un pulsante per la chiusura.
Se l'utente chiude il banner o rifiuta l'installazione:
- Memorizzare un timestamp in `localStorage` (es: `pwa-install-dismissed-at`).
- Non mostrare più alcun prompt per i successivi **14 giorni**.

---

## 2. User Scenarios & Testing

### User Story 1 — Installazione Guidata su Android / Chrome Mobile (Priority: P1)
Un utente Android apre il sito su Chrome per la prima volta. Vuole installare l'applicazione per poter simulare le tasse anche offline.

**Acceptance Scenarios**:
1. **Given** l'app è caricata in un browser mobile compatibile (Android/Chrome), **When** viene catturato l'evento `beforeinstallprompt` (e non vi è un cooldown attivo in localStorage), **Then** compare in basso un banner con scritto "Installa TaxGrid" e due pulsanti: "Installa" e "Chiudi".
2. **Given** il banner è mostrato, **When** l'utente clicca su "Installa", **Then** viene mostrato il prompt nativo di installazione del browser, il banner viene nascosto e l'evento `beforeinstallprompt` viene consumato.
3. **Given** il prompt nativo è visualizzato, **When** l'utente conferma l'installazione, **Then** l'app viene installata, viene rimosso il banner e l'applicazione cattura l'evento `appinstalled` (nascondendo la UI o mostrando un messaggio di conferma).

### User Story 2 — Istruzioni per iOS Safari (Priority: P1)
Un utente iOS apre il sito su Safari. Poiché iOS non supporta l'installazione automatica via codice, l'app gli mostra come procedere manualmente.

**Acceptance Scenarios**:
1. **Given** l'utente naviga da iPhone/iPad su Safari (non in modalità standalone) e non vi è un cooldown attivo, **When** la pagina viene caricata, **Then** dopo pochi secondi compare un banner informativo specifico per iOS in basso.
2. **Given** il banner per iOS è mostrato, **Then** deve contenere istruzioni testuali chiare e descrittive con i riferimenti alle icone di Safari ("Condividi" e "Aggiungi alla schermata Home").

### User Story 3 — Gestione del Cooldown (Priority: P2)
L'utente non vuole installare l'app al momento e chiude il prompt. L'app deve ricordare questa preferenza temporaneamente per non risultare fastidiosa.

**Acceptance Scenarios**:
1. **Given** il banner (Android o iOS) è visualizzato, **When** l'utente clicca sull'icona di chiusura o sul pulsante "Chiudi", **Then** il banner scompare immediatamente.
2. **Given** che il banner è stato chiuso, **When** l'utente ricarica la pagina o riapre il sito entro 14 giorni, **Then** il banner NON viene mostrato.
3. **Given** che sono passati più di 14 giorni dalla chiusura, **When** l'utente riapre il sito, **Then** il banner può essere riproposto.

### User Story 4 — Nessun Prompt se Già Installato (Priority: P1)
Se l'app è già aperta in modalità standalone (sia su iOS che su Android/Desktop), il prompt non ha senso e non deve essere visualizzato.

**Acceptance Scenarios**:
1. **Given** l'utente apre l'app dall'icona sulla Home Screen (modalità standalone), **When** la pagina viene caricata, **Then** nessun banner di installazione viene mostrato, indipendentemente dallo stato di `localStorage`.

---

## 3. Functional Requirements

- **FR1**: Creare una logica di rilevamento PWA (`usePwaInstall` composable o logica interna a un componente `PwaInstallPrompt.vue`) per catturare l'evento `beforeinstallprompt` del window.
- **FR2**: Implementare il metodo `preventDefault()` sull'evento `beforeinstallprompt` per bloccare il banner automatico nativo.
- **FR3**: Creare il componente `PwaInstallPrompt.vue` posizionato in basso (`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md`), con una transizione animata fluida di slide-up all'apparizione.
- **FR4**: Il design del banner deve includere:
  - L'icona dell'app (`icon-192.png` o SVG).
  - Un titolo in italiano ("Installa TaxGrid").
  - Un testo descrittivo ("Accedi istantaneamente e calcola offline aggiungendo l'app alla schermata home.").
  - Il pulsante primario "Installa" (per Android/Desktop).
  - Un pulsante di chiusura "Annulla" o "X".
- **FR5**: Rilevare se il browser è iOS e non standalone (`navigator.userAgent` contiene iPhone/iPad/iPod e `window.navigator.standalone === false`). Per questo target, non mostrare il pulsante "Installa", ma mostrare la guida testuale step-by-step con le icone indicative.
- **FR6**: Al click su "Installa", chiamare `deferredPrompt.prompt()`. Gestire la promessa `deferredPrompt.userChoice`: se l'utente accetta (`outcome === 'accepted'`), nascondere il banner; se rifiuta, impostare il cooldown in `localStorage` e nascondere il banner.
- **FR7**: Gestire la persistenza del cooldown salvando in `localStorage` sotto la chiave `pwa-install-dismissed-at` il timestamp corrente al momento del dismiss (chiusura o rifiuto). Verificare che la differenza tra il timestamp corrente e quello salvato sia superiore a 14 giorni (1.209.600.000 ms) prima di mostrare nuovamente il banner.
- **FR8**: Gestire il ricalcolo e la reattività della visualizzazione: se l'utente ha installato l'app con successo (ascoltando anche `appinstalled`), rimuovere il banner per sempre (impostando ad esempio un flag di installato in `localStorage` o nascondendolo reattivamente).

---

## 4. Success Criteria

- **SC1**: Il prompt viene visualizzato correttamente solo sui dispositivi mobile (o in modalità responsive / simulazione mobile con evento prima dell'installazione).
- **SC2**: Su Android/Chrome, il click su "Installa" avvia la procedura nativa del browser.
- **SC3**: Su iOS, viene visualizzato il banner con i passi per l'installazione manuale tramite Safari.
- **SC4**: La chiusura del banner tramite la "X" nasconde il banner e imposta un blocco di 14 giorni per la riapparizione.
- **SC5**: Se l'app è già in modalità standalone (verificato tramite `display-mode: standalone` o `window.navigator.standalone`), il banner non viene visualizzato in nessun caso.
- **SC6**: Il banner supporta la modalità chiara e scura in modo perfettamente coerente con il design di TaxGrid.

---

## 5. Key Entities

- **deferredPrompt**: L'evento `beforeinstallprompt` memorizzato per attivare l'installazione.
- **localStorage.pwa-install-dismissed-at**: Timestamp dell'ultima volta che l'utente ha chiuso il prompt di installazione.
- **isStandalone**: Stato booleano che indica se l'applicazione è in esecuzione all'interno della shell di sistema (PWA installata).

---

## 6. Assumptions

- L'app viene ospitata su un dominio sicuro (HTTPS) o in localhost, altrimenti i browser non spareranno mai `beforeinstallprompt` e non consentiranno l'installazione come PWA.
- La rilevazione dell'ambiente standalone è affidabile sia su Safari mobile che su Chrome.

---

## 7. Edge Cases

- **Navigazione privata / Incognito**: In modalità incognito, l'installazione PWA potrebbe essere inibita dal browser e l'evento `beforeinstallprompt` non verrà sparato. Il banner non deve generare errori JS e rimarrà nascosto.
- **Supporto multi-browser**: Se l'utente visita il sito da un browser in-app (es. Telegram, Facebook, Instagram), le PWA non sono solitamente supportate. La logica deve tollerare la mancanza di eventi PWA e non mostrare nulla o nascondersi silenziosamente.
- **Dimensioni schermo**: Se un utente desktop riduce lo schermo a dimensioni mobili, il banner non deve apparire se non è supportato o se l'utente non è effettivamente da mobile (opzionale, ma l'evento `beforeinstallprompt` su desktop Chrome permette comunque l'installazione, il che è positivo).

<!-- NR_OF_TRIES: 0 -->
