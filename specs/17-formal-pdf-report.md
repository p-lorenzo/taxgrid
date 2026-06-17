# Spec 17: Report PDF Tabellare e Formale

## Obiettivo
Migliorare la funzione di stampa esistente (che si limita a nascondere/mostrare elementi della pagina) sostituendola con un report PDF dedicato, formale e impaginato in stile tabellare, ideale per essere condiviso con i commercialisti.

## Requisiti
1. Invece di stampare le card dell'interfaccia utente (che risultano troppo "da app" su carta), creare un componente nascosto a schermo (`hidden print:block`) che rappresenti esclusivamente l'impaginazione del report formale.
2. Il report deve avere un layout sobrio, senza sfondi colorati (sfondo bianco, testo nero o grigio scuro).
3. I dati devono essere presentati in una o più tabelle comparative ben strutturate. Le righe della tabella dovrebbero includere tutte le voci matematiche (Fatturato, INPS, Tasse, Netto in tasca, Paragone Mensile) incolonnando i regimi affiancati per un confronto analitico immediato.
4. L'intestazione del report deve riportare il titolo "Simulazione Fiscale - TaxGrid" e magari la data della simulazione.
5. In fondo all'ultima pagina del report, deve essere presente un **QR Code** ben visibile che punta all'URL `https://taxgrid.it`, accompagnato da una breve dicitura esplicativa (es. "Scansiona per ricreare la simulazione su TaxGrid").

## Implementazione
- Per generare il QR Code, integrare una libreria leggera come `qrcode.vue` o `qrcode` nativa per JS.
- Mantenere la logica basata su `@media print`. Quando l'utente clicca "Stampa/Esporta PDF", l'interfaccia principale (`App.vue`) viene nascosta (`print:hidden`), e viene mostrato solo il div del report formale (`print:block`).
- Assicurarsi che le tabelle non vengano tagliate in mezzo (utilizzare `print:break-inside-avoid` su righe o blocchi chiave).
