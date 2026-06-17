# Spec 13: Spostamento Grafici (Layout Update)

## Obiettivo
Migliorare l'esperienza visiva spostando la sezione dei grafici (ComparisonChart) in fondo all'app, subito dopo le card dei regimi, anziché prima.

## Requisiti
1. Aprire `src/App.vue`.
2. Trovare il componente `<ComparisonChart />` (o la sezione che contiene il grafico).
3. Spostarlo più in basso, in modo che compaia **sotto** il contenitore che ospita la griglia dei regimi (le card).
4. Assicurarsi che la spaziatura (margin/padding) tra la griglia dei regimi e il grafico sia corretta e bilanciata, usando le classi di Tailwind (es. `mt-12` o simili).

## Implementazione
- Il contenitore del grafico dovrebbe avere una larghezza in sintonia con il resto della pagina (es. `max-w-[1600px] mx-auto` se non è già così).
- Nessuna modifica alla logica di calcolo, solo un refactoring del template.
