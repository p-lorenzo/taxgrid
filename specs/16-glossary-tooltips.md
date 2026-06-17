# Spec 16: Glossario Diffuso e Tooltip

## Obiettivo
Migliorare la comprensione dell'intricato gergo fiscale italiano aggiungendo piccoli tooltip esplicativi vicino ai termini "difficili" sparsi nell'interfaccia.

## Requisiti
1. Identificare la terminologia tecnica presente nell'app. Alcuni candidati primari:
   - "IRPEF" (Imposta sul Reddito delle Persone Fisiche)
   - "IRES" (Imposta sul Reddito delle Società)
   - "IRAP" (Imposta Regionale sulle Attività Produttive)
   - "Gestione Separata" (INPS per liberi professionisti senza cassa)
   - "Coefficiente di Redditività"
   - "Addizionali Regionali/Comunali"
   - "RAL" (Retribuzione Annua Lorda)
2. Uniformare e astrarre in un componente riutilizzabile la logica dei Tooltip (ispirandosi al tooltip già esistente nel toggle "Riduzione INPS 50%").
3. Posizionare una piccola icona testuale o SVG (es. `(i)` o `(?)` di colore grigio chiaro) vicino alle etichette dei termini complessi.
4. Al passaggio del mouse (o al tap su mobile) sopra l'icona, far apparire il fumetto con una spiegazione riassuntiva di 1-2 frasi.

## Implementazione
- Creare un componente `InfoTooltip.vue` che riceve la stringa di spiegazione come slot o prop testuale.
- Evitare di inserire link esterni nel testo del tooltip; mantenere spiegazioni "for dummies" e dirette.
