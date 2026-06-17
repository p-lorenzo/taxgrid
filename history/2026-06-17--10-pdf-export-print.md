# Spec 10: Stampa e Report PDF

## Obiettivo Completato
Fornita all'utente la possibilità di generare un report pulito (PDF o stampa cartacea) della propria simulazione fiscale, pronto per essere inviato al commercialista o per uso interno.

## Decisioni di Progetto & Dettagli di Implementazione
1. **Titolo Report Stampa Dedicato**:
   - Creato un header specifico per la stampa (`hidden print:block`) in `App.vue` che mostra un titolo pulito "TaxGrid - Report Simulazione Fiscale" con un sottotitolo di riferimento alla normativa 2025.
   - Nascosto l'header della pagina dello schermo (`print:hidden`).
2. **Ottimizzazioni per la Stampa**:
   - Aggiunto un pulsante visivo "Stampa Report / PDF" accanto al titolo "Parametri Globali" che invoca la funzione nativa `window.print()`. Questo pulsante viene nascosto nella stampa finale (`print:hidden`).
   - Nascoste tutte le descrizioni non essenziali, le guide dei tooltip, e i bottoni interattivi (es. switch, dropdown select, range slider).
   - Per ciascun input/select e switch, è stata creata una controparte statica visibile solo su stampa (`hidden print:block` o `print:inline-block`), ad esempio visualizzando "Startup: Sì/No", o la stringa della categoria ATECO attiva, o i valori monetari formattati.
3. **Gestione del Tema e Colori su Carta**:
   - Scritte regole `@media print` in `src/style.css` per forzare il background bianco, testo nero/grigio scuro e bordi grigio chiaro, ignorando le classi scure di Tailwind (`dark:bg-*`) per garantire il massimo risparmio di inchiostro e un'ottima leggibilità.
   - Preservati i colori originali dei segmenti del grafico di confronto e delle legende attraverso la proprietà CSS `print-color-adjust: exact` e `-webkit-print-color-adjust: exact`.
4. **Layout e Page Breaks**:
   - Aggiunta la classe `print:break-inside-avoid` su tutte le card dei regimi fiscali per impedire che si verifichino interruzioni di pagina indesiderate nel mezzo di una card.
   - Configurato il layout della griglia a 2 colonne in stampa (`print:grid-cols-2`) quando ci sono più di 1 regime attivo per ottimizzare lo spazio su fogli A4.
5. **Unit Testing**:
   - Creato il file di test `src/App.test.ts` per verificare il corretto rendering del pulsante di stampa e del titolo per la stampa, e per testare l'invocazione di `window.print()` al click del pulsante.
