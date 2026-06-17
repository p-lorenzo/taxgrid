# Spec 11: Spaccato Dettagliato dei Calcoli (Math Breakdown)

## Obiettivo
Rendere trasparenti i calcoli matematici alla base del netto in tasca mostrato nelle card, incrementando la fiducia dell'utente nei risultati e offrendo un valore consulenziale.

## Requisiti
1. Su ogni card dei regimi, vicino al "Netto in Tasca" (o in un pulsante a fondo card), aggiungere un link testuale o icona (es. "Vedi dettaglio calcolo").
2. Cliccando il pulsante, l'utente aprirà una Modale dedicata (oppure una sezione a soffietto / accordion) contenente lo spaccato matematico step-by-step per quel regime specifico.
3. Il dettaglio deve mostrare:
   - Fatturato / Costo Aziendale di partenza.
   - Coefficiente ATECO applicato (se pertinente).
   - Spese deducibili o detraibili.
   - La ripartizione dell'INPS (se calcolato su base minimale + eccedenza, mostrando il superamento delle soglie o massimali).
   - Imponibile Fiscale netto.
   - Calcolo delle imposte con gli scaglioni IRPEF interessati, l'aliquota Forfettaria applicata, o la divisione IRES/IRAP per la SRL.
   - Addizionali regionali/comunali.
4. Ogni riga deve riportare l'operatore matematico e i sub-totali per guidare la lettura (es. "Fatturato: 50.000 €", "- INPS: 12.000 €", "= Imponibile: 38.000 €").
5. Sfruttare per la UI componenti puliti, ad esempio `@headlessui/vue` per il `Dialog` o per pannelli `Disclosure`.

## Implementazione
- Aggiornare `taxStore` affinché ogni Computed prop (`forfettarioResult`, ecc.) ritorni, oltre ai totali macro, anche un oggetto `breakdown` con i risultati intermedi e i passaggi logici.
- Creare un componente `CalculationBreakdown.vue` per disaccoppiare la logica UI della modale/accordion.
