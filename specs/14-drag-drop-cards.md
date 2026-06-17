# Spec 14: Drag & Drop Card Regimi

## Obiettivo
Permettere all'utente di riordinare le card dei regimi (Forfettario, Ordinario, SRL, Dipendente) tramite Drag & Drop, personalizzando l'ordine di confronto visivo.

## Requisiti
1. Refactoring del layout delle card in `App.vue`: le 4 card (attualmente cablate nel template) dovrebbero essere gestite tramite un ciclo `v-for` basato su un array reattivo che definisce l'ordinamento attuale (es. `['forfettario', 'ordinario', 'srl', 'dipendente']`).
2. (Opzionale ma consigliato) Estrarre il markup di ogni card in componenti separati (es. `CardForfettario.vue`, `CardSrl.vue`) per mantenere `App.vue` pulito prima di applicare il ciclo.
3. Integrare una libreria come `vuedraggable` (o equivalente per Vue 3) per implementare il contenitore trascinabile.
4. Aggiungere su ogni card (ad esempio nell'header) una piccola icona "grip" (es. 6 puntini) per far capire chiaramente all'utente che l'elemento è trascinabile.
5. L'array con l'ordine delle card deve essere persistito nello store `taxStore` (e quindi in localStorage) per essere ricordato ai successivi riavvii.

## Implementazione
- Installare `vuedraggable@next`.
- Assicurarsi che le animazioni di transizione (come quelle create dalle classi flex o grid) cooperino bene con il drag and drop per offrire un feedback visivo immediato.

## Status: COMPLETE

<!-- NR_OF_TRIES: 1 -->

