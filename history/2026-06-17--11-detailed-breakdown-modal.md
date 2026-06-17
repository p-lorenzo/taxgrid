# Spec 11: Spaccato Dettagliato dei Calcoli (Math Breakdown)

## Obiettivo Completato
Rendere trasparenti e tracciabili i calcoli matematici alla base del netto in tasca mostrato nelle card dei vari regimi fiscali, offrendo una modale di dettaglio con tutti i passaggi matematici intermedi, operatori ed descrizioni per guidare l'utente.

## Decisioni di Progetto & Dettagli di Implementazione
1. **Struttura Dati dei Dettagli (Math Breakdown)**:
   - Aggiornato `src/store/taxStore.ts` aggiungendo l'interfaccia `BreakdownStep` con i campi: `label` (titolo del passaggio), `value` (valore numerico in Euro), `operator` (operatore matematico come `+`, `-`, `=`, `*`), e `details` (spiegazione testuale o formula applicata).
   - Esteso ciascun computed property dei risultati dei regimi (`forfettarioResult`, `ordinarioResult`, `srlResult`, `dipendenteResult`) per calcolare e restituire in tempo reale la lista sequenziale di passaggi matematici (`breakdown.steps`).
2. **Precisione di Calcolo & Trasparenza**:
   - Inserite descrizioni dinamiche ed esplicative per ciascuna voce di calcolo, come la scomposizione in scaglioni IRPEF (23%, 35%, 43%) tramite l'helper `descriviIrpefScaglioni`, le riduzioni INPS (35%, 50%), l'esenzione INPS per contratti dipendenti full-time, la scomposizione IRES/IRAP per le SRL e le ritenute sui dividendi distribuiti.
3. **Componente Modale `CalculationBreakdown.vue`**:
   - Creato un nuovo componente Vue 3 (`src/components/CalculationBreakdown.vue`) che monta un dialogo Headless UI (`Dialog`) con transizioni animate di entrata/uscita, supporto nativo alle preferenze Dark Mode, e una tabella responsive formattata.
   - Gli operatori matematici sono evidenziati tramite badge colorati di design: verdi per le entrate/somme (`+`), rossi per imposte e contributi (`-`), e dorati per i subtotali ed il netto finale (`=`).
   - Gli elementi interattivi o informativi si adattano correttamente e si nascondono automaticamente in stampa (`print:hidden`).
4. **Trigger di Apertura nelle Card**:
   - Aggiunto un pulsante moderno "Vedi dettaglio calcolo" all'interno di ciascuna card dei regimi in `src/App.vue`, con icona a calcolatrice, posizionato subito sotto il confronto mensile e configurato per nascondersi in fase di stampa.
5. **Unit Testing & Qualità del Codice**:
   - Aggiunto un test di integrazione in `src/App.test.ts` che simula il click del pulsante del dettaglio calcolo, assevera che la modale si apra con il titolo corretto del regime, e che i passaggi matematici vengano effettivamente valorizzati e passati al componente.
   - Risolte le incompatibilità JSDOM per la modale mockando la classe `ResizeObserver` globalmente prima del mount dei test.
