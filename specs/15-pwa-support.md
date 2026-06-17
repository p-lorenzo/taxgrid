# Spec 15: Supporto PWA (Progressive Web App)

## Status: COMPLETE

## Obiettivo
Trasformare TaxGrid in un'applicazione installabile su smartphone e desktop e capace di funzionare offline (dato che non vi sono chiamate backend necessarie per i calcoli).

## Requisiti
1. Integrare il plugin ufficiale Vite per PWA (`vite-plugin-pwa`).
2. Configurare in `vite.config.ts` il manifest della Web App: definire `name`, `short_name`, `description`, `theme_color` (in base allo schema colori dell'app) e le icone base.
3. Configurare la strategia di caching (Service Worker) affinché gli asset statici (HTML, JS, CSS, fonts) vengano messi in cache per il funzionamento offline nativo.
4. Generare/Aggiungere placeholder base per le icone `192x192` e `512x512` in `/public` da referenziare nel manifest.
5. Mantenere l'esperienza trasparente per l'utente, utilizzando preferibilmente un aggiornamento automatico del service worker (`registerType: 'autoUpdate'`).

## Implementazione
- Eseguire `npm install -D vite-plugin-pwa`.
- Creare il setup basilare in `vite.config.ts` secondo la documentazione ufficiale.

---

<!-- NR_OF_TRIES: 1 -->

