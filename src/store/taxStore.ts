import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export interface AtecoCategory {
  id: string
  name: string
  coef: number
}

export const ATECO_CATEGORIES: AtecoCategory[] = [
  { id: 'professionisti', name: 'Professionisti (78%)', coef: 0.78 },
  { id: 'artigiani_imprese', name: 'Artigiani e Imprese (67%)', coef: 0.67 },
  { id: 'commercio', name: 'Commercio (40%)', coef: 0.40 },
  { id: 'servizi', name: 'Servizi (67%)', coef: 0.67 },
  { id: 'industrie_alimentari', name: 'Industrie alimentari (40%)', coef: 0.40 },
  { id: 'commercio_ambulante_alim', name: 'Commercio ambulante alimentari (40%)', coef: 0.40 },
  { id: 'commercio_ambulante_non_alim', name: 'Commercio ambulante altri prodotti (54%)', coef: 0.54 },
  { id: 'costruzioni_immobiliari', name: 'Costruzioni e immobiliari (86%)', coef: 0.86 },
  { id: 'intermediari', name: 'Intermediari del commercio (62%)', coef: 0.62 },
]

export const useTaxStore = defineStore('taxStore', () => {
  // Global Variables
  const fatturato = ref(50000)
  const spese = ref(5000)
  const atecoCategory = ref('professionisti')
  const atecoCoef = ref(0.78) // default 78% for professionisti

  // Sync category selection to coefficient
  watch(atecoCategory, (newCatId) => {
    const cat = ATECO_CATEGORIES.find(c => c.id === newCatId)
    if (cat) {
      atecoCoef.value = cat.coef
    }
  })

  // Forfettario Config
  const forfettarioCassa = ref<'gestione_separata' | 'artigiani'>('gestione_separata')
  const forfettarioStartup = ref(true) // 5% vs 15%

  // Ordinario Config
  const ordinarioCassa = ref<'gestione_separata' | 'artigiani'>('gestione_separata')

  // SRL Config
  const srlDistribuzione = ref<'compenso' | 'utili'>('compenso')

  // Persist to LocalStorage
  const loadState = () => {
    const saved = localStorage.getItem('taxgrid_state')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        fatturato.value = parsed.fatturato ?? fatturato.value
        spese.value = parsed.spese ?? spese.value
        atecoCoef.value = parsed.atecoCoef ?? atecoCoef.value
        
        if (parsed.atecoCategory) {
          atecoCategory.value = parsed.atecoCategory
        } else if (parsed.atecoCoef !== undefined) {
          const matchingCat = ATECO_CATEGORIES.find(c => c.coef === parsed.atecoCoef)
          if (matchingCat) {
            atecoCategory.value = matchingCat.id
          }
        }

        forfettarioCassa.value = parsed.forfettarioCassa ?? forfettarioCassa.value
        forfettarioStartup.value = parsed.forfettarioStartup ?? forfettarioStartup.value
        ordinarioCassa.value = parsed.ordinarioCassa ?? ordinarioCassa.value
        srlDistribuzione.value = parsed.srlDistribuzione ?? srlDistribuzione.value
      } catch (e) {
        console.error('Failed to load state', e)
      }
    }
  }

  loadState()

  watch(
    [fatturato, spese, atecoCategory, atecoCoef, forfettarioCassa, forfettarioStartup, ordinarioCassa, srlDistribuzione],
    () => {
      localStorage.setItem('taxgrid_state', JSON.stringify({
        fatturato: fatturato.value,
        spese: spese.value,
        atecoCategory: atecoCategory.value,
        atecoCoef: atecoCoef.value,
        forfettarioCassa: forfettarioCassa.value,
        forfettarioStartup: forfettarioStartup.value,
        ordinarioCassa: ordinarioCassa.value,
        srlDistribuzione: srlDistribuzione.value
      }))
    },
    { deep: true }
  )

  // Calculations: Forfettario
  const forfettarioResult = computed(() => {
    const imponibile = fatturato.value * atecoCoef.value
    const inpsRate = forfettarioCassa.value === 'gestione_separata' ? 0.2607 : 0.24 // Simplified
    let inps = imponibile * inpsRate
    // Fixed minimal for artigiani
    if (forfettarioCassa.value === 'artigiani' && inps < 4208) {
      inps = 4208 // Minimal INPS
    }
    
    // Tasse (Contributi previdenziali sono deducibili dal reddito imponibile l'anno successivo,
    // per l'MVP li deduciamo direttamente nell'anno corrente per semplicità)
    const imponibileNetto = Math.max(imponibile - inps, 0)
    const taxRate = forfettarioStartup.value ? 0.05 : 0.15
    const tasse = imponibileNetto * taxRate
    
    const netto = fatturato.value - inps - tasse
    
    return { inps, tasse, netto }
  })

  // Calculations: Ordinario
  const ordinarioResult = computed(() => {
    const imponibileBase = Math.max(fatturato.value - spese.value, 0)
    const inpsRate = ordinarioCassa.value === 'gestione_separata' ? 0.2607 : 0.24
    let inps = imponibileBase * inpsRate
    if (ordinarioCassa.value === 'artigiani' && inps < 4208) {
      inps = 4208
    }

    const imponibileFiscale = Math.max(imponibileBase - inps, 0)
    // Simplified IRPEF Scaglioni 2024
    let tasse = 0
    if (imponibileFiscale <= 28000) {
      tasse = imponibileFiscale * 0.23
    } else if (imponibileFiscale <= 50000) {
      tasse = 28000 * 0.23 + (imponibileFiscale - 28000) * 0.35
    } else {
      tasse = 28000 * 0.23 + 22000 * 0.35 + (imponibileFiscale - 50000) * 0.43
    }

    const netto = fatturato.value - spese.value - inps - tasse
    return { inps, tasse, netto }
  })

// Helper: Calcolo IRPEF Lorda (Scaglioni 2024)
  function calcolaIrpefLorda(imponibile: number) {
    if (imponibile <= 28000) return imponibile * 0.23;
    if (imponibile <= 50000) return (28000 * 0.23) + ((imponibile - 28000) * 0.35);
    return (28000 * 0.23) + (22000 * 0.35) + ((imponibile - 50000) * 0.43);
  }

  // Helper: Detrazioni Lavoro Dipendente/Assimilato
  function calcolaDetrazioniDipendente(imponibile: number) {
    if (imponibile <= 15000) return 1955;
    if (imponibile <= 28000) return 1910 + 1190 * ((28000 - imponibile) / 13000);
    if (imponibile <= 50000) return 1910 * ((50000 - imponibile) / 22000);
    return 0;
  }

  // Calculations: SRL
  const srlResult = computed(() => {
    const costiFissiSrl = 4000;
    const utileLordoOperativo = Math.max(fatturato.value - spese.value - costiFissiSrl, 0);

    let tasseSrl = 0;
    let inpsTotaleSostenutoDaUtente = 0; // Costo visivo: ciò che esce dalle sue tasche o dalla sua azienda
    let tasseTotali = 0;
    let netto = 0;

    if (srlDistribuzione.value === 'compenso') {
      // Il budget operativo deve coprire il compenso lordo + i 2/3 di INPS a carico azienda
      // Aliquota INPS totale Co.co.co = 33.59% (22.39% azienda, 11.20% amministratore)
      const compensoLordo = utileLordoOperativo / 1.2239;
      const inpsAzienda = compensoLordo * 0.2239;
      const inpsAmministratore = compensoLordo * 0.1120;
      
      const imponibileFiscale = Math.max(compensoLordo - inpsAmministratore, 0);
      const irpefLorda = calcolaIrpefLorda(imponibileFiscale);
      const detrazioni = calcolaDetrazioniDipendente(imponibileFiscale);
      const irpefNetta = Math.max(irpefLorda - detrazioni, 0);
      
      // Per un confronto equo nella dashboard, mostriamo l'INPS totale o solo quello trattenuto.
      // L'utente percepisce il carico fiscale, quindi INPS = inpsAzienda + inpsAmministratore
      inpsTotaleSostenutoDaUtente = inpsAzienda + inpsAmministratore; 
      tasseTotali = irpefNetta;
      netto = compensoLordo - inpsAmministratore - irpefNetta;
    } else {
      // Distribuzione Utili: IRES 24% + IRAP ~3.9% sull'utile operativo
      tasseSrl = utileLordoOperativo * 0.279;
      const utileNetto = utileLordoOperativo - tasseSrl;
      // Tassazione soci dividendi (26%)
      const tasseDividendi = utileNetto * 0.26;
      
      inpsTotaleSostenutoDaUtente = 0; // Gli utili non scontano INPS in GS
      tasseTotali = tasseSrl + tasseDividendi;
      netto = utileNetto - tasseDividendi;
    }

    return { 
      inps: inpsTotaleSostenutoDaUtente, 
      tasse: tasseTotali, 
      netto 
    }
  })


  return {
    fatturato, spese, atecoCategory, atecoCoef, ATECO_CATEGORIES,
    forfettarioCassa, forfettarioStartup,
    ordinarioCassa, srlDistribuzione,
    forfettarioResult, ordinarioResult, srlResult
  }
})
