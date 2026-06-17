# Spec 10: Stampa e Report PDF

## Status: COMPLETE

## Obiettivo
Fornire all'utente la possibilità di generare un report pulito (PDF o stampa cartacea) della propria simulazione fiscale, pronto per essere inviato al commercialista o per uso interno.

## Requisiti
1. Aggiungere classi Tailwind specifiche per la stampa (utilizzando il modificatore `print:` per richiamare la media query `@media print`).
2. Quando l'utente decide di stampare (`Ctrl+P` o tramite apposito bottone), l'interfaccia deve adattarsi nascondendo:
   - Header superfluo, descrizioni troppo lunghe, o bottoni interattivi (es. switch, dropdown).
   - Eventuali toggle della "Visibilità Regimi".
   - Footer o altri elementi decorativi non essenziali al risultato numerico.
3. Riformattare la griglia dei regimi affinché in fase di stampa le card vengano disposte correttamente e non ci siano interruzioni di pagina indesiderate (page breaks).
4. Assicurarsi che i colori di sfondo delle card (specialmente per il risparmio inchiostro) vengano preservati usando `-webkit-print-color-adjust: exact;` (con la classe `print-color-adjust-exact` se in Tailwind), o resi ben leggibili su carta bianca se il tema attivo dell'utente al momento della stampa è scuro.
5. Inserire un pulsante visibile "Stampa Report / PDF" vicino o dentro ai "Parametri Globali" che invoca `window.print()`.

## Implementazione
- Utilizzare in abbondanza utility classes di Tailwind con il prefisso `print:` (es. `print:hidden`, `print:block`, `print:bg-white`, `print:text-black`).

<!-- NR_OF_TRIES: 1 -->
