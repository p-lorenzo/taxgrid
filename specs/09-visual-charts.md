# Spec 09: Grafici Visivi (Data Visualization)

## Obiettivo
Aggiungere una rappresentazione visiva dei dati calcolati per fornire un confronto immediato tra i vari regimi (Forfettario, Ordinario, SRL, Dipendente).

## Requisiti
1. Integrare una libreria per grafici leggera (es. `chart.js` con `vue-chartjs`, oppure `apexcharts`, oppure costruire un grafico a barre nativo in HTML/CSS/SVG data la semplicità).
2. Creare un nuovo componente `ComparisonChart.vue` da inserire in `App.vue` subito sopra (o sotto) i controlli globali, o sopra la griglia delle card.
3. Il grafico deve essere a **barre impilate (stacked bar chart)**.
4. Per ogni regime visibile (in base ai toggle attivi), deve esserci una barra che mostri:
   - **Tasse** (es. rosso/arancio)
   - **INPS / Contributi** (es. blu)
   - **Netto in tasca** (es. verde o oro `#e2af0d`)
5. Il grafico deve essere reattivo: se l'utente spegne la visibilità di un regime dai controlli, la rispettiva barra deve sparire. Se cambia il fatturato, le proporzioni si aggiornano con una transizione fluida.
6. Assicurarsi che i colori del grafico supportino sia il light mode che il dark mode (es. colore del testo dell'asse X).

## Implementazione
- Passare le props necessarie dal `taxStore` al componente `ComparisonChart.vue`.
- Ottimizzare il rendering per non appesantire le prestazioni dell'app in modo eccessivo al variare veloce degli input numerici.
