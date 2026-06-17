# Spec 18: Deep Linking e Condivisione Simulazione (URL State)

## Obiettivo
Permettere agli utenti di condividere una specifica simulazione (completa di tutti i parametri inseriti) semplicemente tramite un URL, o di generare un QR Code univoco per il report cartaceo.

## Requisiti
1. Modificare la logica di inizializzazione nel `taxStore` (o in `App.vue` al mount): prima di caricare i dati dal `localStorage`, l'app deve controllare l'URL alla ricerca di `query parameters` (es. `?fatturato=80000&ateco=78&mesi=14`).
2. Se sono presenti parametri validi nell'URL, questi devono avere priorità e sovrascrivere i valori predefiniti o salvati precedentemente in locale.
3. Creare una funzione globale o un action nel `taxStore` che "serializzi" lo stato corrente dell'utente in una stringa di query params (es. `buildShareUrl()`).
4. Nell'interfaccia utente (es. nell'Header o vicino ai parametri globali), aggiungere un pulsante **"Condividi Simulazione"**. Cliccandolo, l'app copierà negli appunti l'URL con i parametri correnti (es. `https://taxgrid.it/?fatturato=...`) e mostrerà un piccolo toast/feedback visivo di successo.
5. Aggiornare la **Spec 17 (Report PDF Tabellare)**: il QR Code stampato a fondo pagina non deve puntare all'URL generico `https://taxgrid.it`, ma all'URL *serializzato* (cioè quello generato da `buildShareUrl()`), permettendo a chi scansiona il foglio di ricaricare magicamente la stessa identica configurazione sul proprio telefono.

## Implementazione
- Usare l'API nativa `URLSearchParams` per leggere e scrivere agevolmente i parametri senza bisogno di librerie di routing complesse (come `vue-router`, che potrebbe essere overkill per una single-page senza navigazione).
- Usare l'API `navigator.clipboard.writeText` per copiare l'URL negli appunti.
- Valutare una serializzazione base64 dello stato JSON (es. `?state=eyJmYXR...`) se i parametri diventano troppi e la query string risulta troppo lunga o "brutta", altrimenti usare i semplici parametri `?chiave=valore`.

## Status: COMPLETE

<!-- NR_OF_TRIES: 1 -->
