# Spec 12: Toggle Manuale Tema Chiaro / Scuro

## Obiettivo
Fornire all'utente un controllo esplicito sull'aspetto visivo dell'app (tema chiaro o scuro), slegandolo dalle preferenze di sistema se lo desidera.

## Requisiti
1. Aggiungere un interruttore (toggle o icona interattiva Sole/Luna) posizionato nell'Header dell'applicazione (in alto a destra).
2. L'applicazione deve supportare tre possibili stati concettuali per il tema:
   - `light` (forzato)
   - `dark` (forzato)
   - `system` (predefinito in assenza di salvataggi)
3. La preferenza selezionata manualmente deve essere persistita nel `localStorage` (es. `theme-preference`). Al riavvio dell'applicazione, TaxGrid deve ricaricare la modalità corretta.
4. Implementare la logica aggiungendo dinamicamente la classe `dark` all'elemento radice `<html class="dark">`.

## Implementazione
- Aggiornare `tailwind.config.js` assicurandosi che sia configurato `darkMode: 'class'` invece di `media` (che di default risponde solo all'OS).
- Mantenere la prevenzione del FOUC (Flash of Unstyled Content): inserire se possibile un breve snippet `<script>` nativo dentro `index.html` che valuti la preferenza da localStorage ancor prima di montare l'app Vue.
- Implementare un piccolo composable Vue (`useDarkMode.ts`) o gestire lo stato globale dentro Pinia per reattività.
