# Project TaxGrid: Simulatore Comparativo Regimi Fiscali

## Il Problema
Il passaggio verso la consulenza indipendente o la creazione di una nuova impresa in Italia è spesso frenato dall'opacità del sistema fiscale. Affidarsi unicamente a fogli di calcolo statici generici o a simulazioni "una tantum" non permette di avere una visione dinamica di come variano i margini di guadagno al mutare delle condizioni (es. un aumento del fatturato, l'ottimizzazione delle spese o la scelta tra diverse casse previdenziali). 

Manca uno strumento rapido, deterministico e visuale che permetta di affiancare e comparare in tempo reale i diversi regimi d'impresa (Partita IVA Forfettaria, Ordinaria, SRL) per capire esattamente quale sia il vero "netto in tasca" a parità di fattori, in modo da poter prendere decisioni ponderate sull'inquadramento migliore.

## La Soluzione
**TaxGrid** è una Single Page Application (SPA) frontend-only progettata per offrire un cruscotto di simulazione fiscale interattivo. 
Attraverso una griglia tabellare, l'utente può manipolare un set di variabili finanziarie e vedere immediatamente l'impatto su tasse, contributi INPS e utile netto aziendale e personale. Ogni colonna o sezione della tabella rappresenta uno specifico regime fiscale, permettendo un confronto visivo istantaneo.

## Tech Stack
Per garantire reattività immediata, un'architettura modulare e un'interfaccia pulita senza l'overhead di un backend, il progetto adotta il seguente stack:
*   **Framework:** Vue.js (sfruttando la Composition API per incapsulare la logica di calcolo matematico e fiscale in *composables* isolati).
*   **Styling:** Tailwind CSS per uno sviluppo rapido, responsivo e utility-first.
*   **Componenti UI:** Headless UI per garantire accessibilità e avere componenti interattivi (come toggle, dropdown, tab) robusti e facilmente personalizzabili senza vincoli di design preimpostati.

## Architettura dei Dati e Configurazione
Il modello di dati è logicamente diviso in due macro-categorie per massimizzare la flessibilità del paragone:

1.  **Parametri Generali (Globali):** Variabili che definiscono lo scenario di base dell'attività.
    *   Fatturato Totale Annuo stimato.
    *   Spese Annue (deducibili e detraibili - neutre ai fini del calcolo per il Forfettario).
    *   Codice ATECO (per la determinazione del coefficiente di redditività).
2.  **Parametri Specifici per Regime:** Configurazioni uniche per la tipologia di inquadramento, visualizzabili e modificabili all'interno delle rispettive colonne della tabella.
    *   *Forfettario:* Toggle Aliquota Sostitutiva (5% start-up / 15%), Selezione Cassa INPS (Gestione Separata vs. Artigiani e Commercianti con eventuale toggle per riduzione 35%).
    *   *Ordinario:* Selezione Cassa INPS.
    *   *SRL:* Logica a cascata (Utile aziendale -> Tassazione IRES/IRAP -> Netto Società) con simulazione di distribuzione fondi tramite Compenso Amministratore o Distribuzione Utili.

## Gestione dello Stato e Persistenza
Essendo un'applicazione *serverless* focalizzata esclusivamente sulla logica client-side, TaxGrid non richiede alcuna registrazione, login o gestione di database.

Tutte le configurazioni dell'utente (sia globali che specifiche) sono gestite tramite lo stato reattivo dell'applicazione e sincronizzate automaticamente nel **`localStorage`** del browser. 
Questo approccio *zero-friction* garantisce che l'utente possa aggiornare i dati, chiudere il browser e, al rientro successivo, ritrovare la propria simulazione fiscale esattamente come l'aveva lasciata, mantenendo totale privacy sui dati inseriti.
