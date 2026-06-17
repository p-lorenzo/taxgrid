# Feature Specification: Static Footer & Disclaimer

**Feature Branch**: `08-static-footer`

**Created**: 2026-06-17

**Status**: COMPLETE

## Status: COMPLETE

**Input**: User request: "Aggiungere un footer statico alla pagina con: credits (Lorenzo Pesce), link GitHub, link LinkedIn, menzione progetto Open Source con link al repository TaxGrid. Suggerire eventuali altre aggiunte."

## 1. Analisi e Suggerimenti

Oltre ai link personali e di progetto richiesti, trattandosi di un software di simulazione fiscale, è **fortemente raccomandato** (se non fondamentale) inserire nel footer le seguenti informazioni aggiuntive per tutelarsi e dare un servizio migliore agli utenti:

1.  **Disclaimer di non responsabilità (Legal Disclaimer)**: Una dicitura chiara che specifichi che lo strumento offre stime indicative basate su formule semplificate e che non sostituisce in alcun modo il parere di un commercialista professionista.
2.  **Anno Fiscale di Riferimento**: Specificare che le formule (es. massimale INPS, scaglioni IRPEF) fanno riferimento a un determinato anno (es. "Basato sulla normativa 2025"). Questo evita confusione se l'utente lo usa negli anni futuri prima di un eventuale aggiornamento.
3.  **Call-to-Action per Contributi**: Essendo Open Source, invitare direttamente l'utente a segnalare bug o proporre miglioramenti tramite le "Issues" o "Pull Requests" di GitHub.

## 2. Struttura del Componente UI (App.vue o Footer.vue)

Creare un nuovo blocco `<footer>` alla base del layout principale dell'applicazione, possibilmente distaccato visivamente tramite un padding superiore o un leggero cambio di sfondo/bordo.

**Layout suggerito:**
Il footer può essere diviso in due macro sezioni (mobile-friendly, impilate verticalmente su smartphone e distribuite in riga su desktop).

### Sezione Sinistra / Principale (Credits & Social)
*   **Testo base:** "Realizzato con ❤️ da **Lorenzo Pesce**."
*   **Icone/Link Social:**
    *   GitHub: [https://github.com/p-lorenzo/](https://github.com/p-lorenzo/)
    *   LinkedIn: [https://www.linkedin.com/in/p-lorenzo/](https://www.linkedin.com/in/p-lorenzo/)

### Sezione Centrale (Open Source)
*   **Testo base:** "TaxGrid è un progetto Open Source gratuito."
*   **Link Repository:** [https://github.com/p-lorenzo/taxgrid/](https://github.com/p-lorenzo/taxgrid/)
*   **Invito:** "Hai trovato un bug o hai idee? Apri una Issue su GitHub!"

### Sezione Bassa / Legale (Disclaimer)
*   **Avviso (in piccolo, font-size: text-xs, colore meno contrastante):** "Disclaimer: TaxGrid è un simulatore orientativo. Le aliquote (es. massimali, scaglioni) fanno riferimento all'anno fiscale in corso (2025). I calcoli generati non costituiscono consulenza fiscale o legale. Per decisioni finanziarie, rivolgiti sempre al tuo commercialista di fiducia."

## 3. Styling (Tailwind CSS)

Esempio di classi per il contenitore:
```html
<footer class="mt-12 border-t border-gray-200 bg-gray-50 py-8 text-sm text-gray-600">
  <div class="max-w-7xl mx-auto px-4 ...">
     <!-- Contenuti -->
  </div>
</footer>
```

## 4. User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigazione Links e Validazione (Priority: P2)

**Acceptance Scenarios**:
1. **Given** l'app in esecuzione, **When** scorro fino in fondo alla pagina, **Then** visualizzo il footer in modo chiaro e responsivo sia su Desktop che su Mobile.
2. **Given** i link ai profili social e alla repository, **When** ci clicco sopra, **Then** si aprono correttamente in una nuova scheda (`target="_blank"` e `rel="noopener noreferrer"` per motivi di sicurezza).
3. **Given** il footer, **Then** il disclaimer legale è chiaramente visibile ma non invasivo rispetto al design principale.

<!-- NR_OF_TRIES: 1 -->
