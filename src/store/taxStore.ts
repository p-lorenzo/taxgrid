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
  const expensesMode = ref<'simple' | 'advanced'>('simple')
  const speseDeducibili = ref(5000)
  const speseDetraibili = ref(0)
  const atecoCategory = ref('professionisti')
  const atecoCoef = ref(0.78) // default 78% for professionisti
  const mesiParagone = ref(12) // Default a 12 mensilità


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
  const forfettarioRiduzione35 = ref(false)
  const forfettarioRiduzione50 = ref(false)

  // Ordinario Config
  const ordinarioCassa = ref<'gestione_separata' | 'artigiani'>('gestione_separata')
  const ordinarioRiduzione50 = ref(false)

  // SRL Config
  const srlDistribuzione = ref<'compenso' | 'utili'>('compenso')
  const srlCassa = ref<'gestione_separata' | 'artigiani'>('gestione_separata')
  const srlRiduzione50 = ref(false)

  // Persist to LocalStorage
  const loadState = () => {
    const saved = localStorage.getItem('taxgrid_state')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        fatturato.value = parsed.fatturato ?? fatturato.value
        expensesMode.value = parsed.expensesMode ?? expensesMode.value
        speseDeducibili.value = parsed.speseDeducibili ?? parsed.spese ?? speseDeducibili.value
        speseDetraibili.value = parsed.speseDetraibili ?? speseDetraibili.value
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
        forfettarioRiduzione35.value = parsed.forfettarioRiduzione35 ?? forfettarioRiduzione35.value
        forfettarioRiduzione50.value = parsed.forfettarioRiduzione50 ?? forfettarioRiduzione50.value
        ordinarioCassa.value = parsed.ordinarioCassa ?? ordinarioCassa.value
        ordinarioRiduzione50.value = parsed.ordinarioRiduzione50 ?? ordinarioRiduzione50.value
        srlDistribuzione.value = parsed.srlDistribuzione ?? srlDistribuzione.value
        srlCassa.value = parsed.srlCassa ?? srlCassa.value
        srlRiduzione50.value = parsed.srlRiduzione50 ?? srlRiduzione50.value
        mesiParagone.value = parsed.mesiParagone ?? mesiParagone.value
      } catch (e) {
        console.error('Failed to load state', e)
      }
    }
  }

  loadState()

  watch(
    [
      fatturato, expensesMode, speseDeducibili, speseDetraibili, atecoCategory, atecoCoef,
      forfettarioCassa, forfettarioStartup, forfettarioRiduzione35, forfettarioRiduzione50,
      ordinarioCassa, ordinarioRiduzione50,
      srlDistribuzione, srlCassa, srlRiduzione50,
      mesiParagone
    ],
    () => {
      localStorage.setItem('taxgrid_state', JSON.stringify({
        fatturato: fatturato.value,
        expensesMode: expensesMode.value,
        speseDeducibili: speseDeducibili.value,
        speseDetraibili: speseDetraibili.value,
        atecoCategory: atecoCategory.value,
        atecoCoef: atecoCoef.value,
        forfettarioCassa: forfettarioCassa.value,
        forfettarioStartup: forfettarioStartup.value,
        forfettarioRiduzione35: forfettarioRiduzione35.value,
        forfettarioRiduzione50: forfettarioRiduzione50.value,
        ordinarioCassa: ordinarioCassa.value,
        ordinarioRiduzione50: ordinarioRiduzione50.value,
        srlDistribuzione: srlDistribuzione.value,
        srlCassa: srlCassa.value,
        srlRiduzione50: srlRiduzione50.value,
        mesiParagone: mesiParagone.value
      }))
    },
    { deep: true }
  )

  // Calculations: Forfettario
  const forfettarioResult = computed(() => {
    const imponibile = fatturato.value * atecoCoef.value
    let inps = 0
    if (forfettarioCassa.value === 'gestione_separata') {
      inps = imponibile * 0.2607
    } else {
      const inpsMinimale = 4208
      const redditoEccedente = Math.max(imponibile - 17504, 0)
      const inpsEccedente = redditoEccedente * 0.24
      inps = inpsMinimale + inpsEccedente

      if (forfettarioRiduzione35.value) {
        inps = inps * 0.65
      } else if (forfettarioRiduzione50.value) {
        inps = inps * 0.50
      }
    }
    
    // Tasse (Contributi previdenziali sono deducibili dal reddito imponibile l'anno successivo,
    // per l'MVP li deduciamo direttamente nell'anno corrente per semplicità)
    const imponibileNetto = Math.max(imponibile - inps, 0)
    const taxRate = forfettarioStartup.value ? 0.05 : 0.15
    const tasse = imponibileNetto * taxRate
    
    const netto = fatturato.value - inps - tasse
    const nettoMensile = netto / mesiParagone.value
    
    return { inps, tasse, netto, nettoMensile }
  })

  // Calculations: Ordinario
  const ordinarioResult = computed(() => {
    const imponibileBase = Math.max(fatturato.value - speseDeducibili.value, 0)
    let inps = 0
    if (ordinarioCassa.value === 'gestione_separata') {
      inps = imponibileBase * 0.2607
    } else {
      const inpsMinimale = 4208
      const redditoEccedente = Math.max(imponibileBase - 17504, 0)
      const inpsEccedente = redditoEccedente * 0.24
      inps = inpsMinimale + inpsEccedente

      if (ordinarioRiduzione50.value) {
        inps = inps * 0.50
      }
    }

    const imponibileFiscale = Math.max(imponibileBase - inps, 0)
    // Simplified IRPEF Scaglioni 2024
    let irpefLorda = 0
    if (imponibileFiscale <= 28000) {
      irpefLorda = imponibileFiscale * 0.23
    } else if (imponibileFiscale <= 50000) {
      irpefLorda = 28000 * 0.23 + (imponibileFiscale - 28000) * 0.35
    } else {
      irpefLorda = 28000 * 0.23 + 22000 * 0.35 + (imponibileFiscale - 50000) * 0.43
    }

    const scontoDetraibili = expensesMode.value === 'advanced' ? speseDetraibili.value * 0.19 : 0
    const irpefNetta = Math.max(irpefLorda - scontoDetraibili, 0)

    const netto = fatturato.value - speseDeducibili.value - inps - irpefNetta
    const nettoMensile = netto / mesiParagone.value
    return { inps, tasse: irpefNetta, netto, nettoMensile }
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
    const utileLordoOperativo = Math.max(fatturato.value - speseDeducibili.value - costiFissiSrl, 0);

    let tasseSrl = 0;
    let inpsTotaleSostenutoDaUtente = 0; // Costo visivo: ciò che esce dalle sue tasche o dalla sua azienda
    let tasseTotali = 0;
    let netto = 0;

    if (srlCassa.value === 'gestione_separata') {
      if (srlDistribuzione.value === 'compenso') {
        // Il budget operativo deve coprire il compenso lordo + i 2/3 di INPS a carico azienda
        // Aliquota INPS totale Co.co.co = 33.59% (22.39% azienda, 11.20% amministratore)
        const compensoLordo = utileLordoOperativo / 1.2239;
        const inpsAzienda = compensoLordo * 0.2239;
        const inpsAmministratore = compensoLordo * 0.1120;
        
        const imponibileFiscale = Math.max(compensoLordo - inpsAmministratore, 0);
        const irpefLorda = calcolaIrpefLorda(imponibileFiscale);
        const detrazioni = calcolaDetrazioniDipendente(imponibileFiscale);
        const scontoDetraibili = expensesMode.value === 'advanced' ? speseDetraibili.value * 0.19 : 0
        const irpefNetta = Math.max(irpefLorda - detrazioni - scontoDetraibili, 0);
        
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
    } else { // artigiani
      if (srlDistribuzione.value === 'compenso') {
        const compensoLordo = utileLordoOperativo;
        const inpsMinimale = 4208
        const redditoEccedente = Math.max(compensoLordo - 17504, 0)
        const inpsEccedente = redditoEccedente * 0.24
        let inps = inpsMinimale + inpsEccedente
        if (srlRiduzione50.value) {
          inps = inps * 0.50
        }

        const imponibileFiscale = Math.max(compensoLordo - inps, 0);
        const irpefLorda = calcolaIrpefLorda(imponibileFiscale);
        const detrazioni = calcolaDetrazioniDipendente(imponibileFiscale);
        const scontoDetraibili = expensesMode.value === 'advanced' ? speseDetraibili.value * 0.19 : 0
        const irpefNetta = Math.max(irpefLorda - detrazioni - scontoDetraibili, 0);

        inpsTotaleSostenutoDaUtente = inps;
        tasseTotali = irpefNetta;
        netto = compensoLordo - inps - irpefNetta;
      } else {
        // Distribuzione Utili: IRES 24% + IRAP ~3.9% sull'utile operativo
        tasseSrl = utileLordoOperativo * 0.279;
        const utileNetto = utileLordoOperativo - tasseSrl;
        // Tassazione soci dividendi (26%)
        const tasseDividendi = utileNetto * 0.26;

        const inpsMinimale = 4208
        const redditoEccedente = Math.max(utileLordoOperativo - 17504, 0)
        const inpsEccedente = redditoEccedente * 0.24
        let inps = inpsMinimale + inpsEccedente
        if (srlRiduzione50.value) {
          inps = inps * 0.50
        }

        inpsTotaleSostenutoDaUtente = inps;
        tasseTotali = tasseSrl + tasseDividendi;
        netto = utileNetto - tasseDividendi - inps;
      }
    }

    const nettoMensile = netto / mesiParagone.value
    return { 
      inps: inpsTotaleSostenutoDaUtente, 
      tasse: tasseTotali, 
      netto,
      nettoMensile
    }
  })

  // Watchers for mutual exclusivity and resets
  watch(forfettarioCassa, (newCassa) => {
    if (newCassa === 'gestione_separata') {
      forfettarioRiduzione35.value = false
      forfettarioRiduzione50.value = false
    }
  })

  watch(ordinarioCassa, (newCassa) => {
    if (newCassa === 'gestione_separata') {
      ordinarioRiduzione50.value = false
    }
  })

  watch(srlCassa, (newCassa) => {
    if (newCassa === 'gestione_separata') {
      srlRiduzione50.value = false
    }
  })

  watch(forfettarioRiduzione35, (active) => {
    if (active) {
      forfettarioRiduzione50.value = false
    }
  })

  watch(forfettarioRiduzione50, (active) => {
    if (active) {
      forfettarioRiduzione35.value = false
    }
  })


  return {
    fatturato, expensesMode, speseDeducibili, speseDetraibili, atecoCategory, atecoCoef, ATECO_CATEGORIES,
    forfettarioCassa, forfettarioStartup, forfettarioRiduzione35, forfettarioRiduzione50,
    ordinarioCassa, ordinarioRiduzione50,
    srlDistribuzione, srlCassa, srlRiduzione50,
    forfettarioResult, ordinarioResult, srlResult,
    mesiParagone
  }
})
