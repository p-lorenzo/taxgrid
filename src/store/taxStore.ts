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
  const advancedMode = ref(false) // Sostituisce expensesMode come stato primario
  const speseDeducibili = ref(5000)
  const speseDetraibili = ref(0)
  const atecoCategory = ref('professionisti')
  const atecoCoef = ref(0.78) // default 78% for professionisti
  const mesiParagone = ref(12) // Default a 12 mensilità

  // Lavoro Dipendente Parallelo
  const hasLavoroDipendente = ref(false)
  const ralDipendente = ref(0)
  const dipendenteFullTime = ref(false)

  // Addizionali (IRPEF Ordinario/SRL)
  const addizionaleRegionale = ref(1.73) // Default (es. media Lombardia)
  const addizionaleComunale = ref(0.8)   // Default (es. media Milano/Grandi Comuni)

  // Massimale INPS
  const massimaleInps = ref(119650)      // Default 2025

  // Sostituisce expensesMode mantenendo retrocompatibilità
  const expensesMode = computed({
    get: () => advancedMode.value ? 'advanced' : 'simple',
    set: (val: 'simple' | 'advanced') => {
      advancedMode.value = (val === 'advanced')
    }
  })

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
        
        if (parsed.advancedMode !== undefined) {
          advancedMode.value = parsed.advancedMode
        } else if (parsed.expensesMode !== undefined) {
          advancedMode.value = parsed.expensesMode === 'advanced'
        } else {
          advancedMode.value = false
        }
        
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

        // New properties:
        hasLavoroDipendente.value = parsed.hasLavoroDipendente ?? hasLavoroDipendente.value
        ralDipendente.value = parsed.ralDipendente ?? ralDipendente.value
        dipendenteFullTime.value = parsed.dipendenteFullTime ?? dipendenteFullTime.value
        addizionaleRegionale.value = parsed.addizionaleRegionale ?? addizionaleRegionale.value
        addizionaleComunale.value = parsed.addizionaleComunale ?? addizionaleComunale.value
        massimaleInps.value = parsed.massimaleInps ?? massimaleInps.value
      } catch (e) {
        console.error('Failed to load state', e)
      }
    }
  }

  loadState()

  watch(
    [
      fatturato, advancedMode, speseDeducibili, speseDetraibili, atecoCategory, atecoCoef,
      forfettarioCassa, forfettarioStartup, forfettarioRiduzione35, forfettarioRiduzione50,
      ordinarioCassa, ordinarioRiduzione50,
      srlDistribuzione, srlCassa, srlRiduzione50,
      mesiParagone, hasLavoroDipendente, ralDipendente, dipendenteFullTime,
      addizionaleRegionale, addizionaleComunale, massimaleInps
    ],
    () => {
      localStorage.setItem('taxgrid_state', JSON.stringify({
        fatturato: fatturato.value,
        advancedMode: advancedMode.value,
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
        mesiParagone: mesiParagone.value,
        hasLavoroDipendente: hasLavoroDipendente.value,
        ralDipendente: ralDipendente.value,
        dipendenteFullTime: dipendenteFullTime.value,
        addizionaleRegionale: addizionaleRegionale.value,
        addizionaleComunale: addizionaleComunale.value,
        massimaleInps: massimaleInps.value
      }))
    },
    { deep: true }
  )

  // Calculations: Forfettario
  const forfettarioResult = computed(() => {
    const imponibile = fatturato.value * atecoCoef.value
    let inps = 0
    
    const hasJob = advancedMode.value && hasLavoroDipendente.value
    const isFullTime = hasJob && dipendenteFullTime.value
    const capInps = advancedMode.value ? massimaleInps.value : 119650
    
    if (forfettarioCassa.value === 'gestione_separata') {
      const aliquotaGs = hasJob ? 0.24 : 0.2607
      const imponibileInps = Math.min(imponibile, capInps)
      inps = imponibileInps * aliquotaGs
    } else {
      if (isFullTime) {
        inps = 0
      } else {
        const imponibileInps = Math.min(imponibile, capInps)
        const inpsMinimale = 4208
        const redditoEccedente = Math.max(imponibileInps - 17504, 0)
        const inpsEccedente = redditoEccedente * 0.24
        inps = inpsMinimale + inpsEccedente

        if (forfettarioRiduzione35.value) {
          inps = inps * 0.65
        } else if (forfettarioRiduzione50.value) {
          inps = inps * 0.50
        }
      }
    }
    
    // Tasse
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
    
    const hasJob = advancedMode.value && hasLavoroDipendente.value
    const isFullTime = hasJob && dipendenteFullTime.value
    const capInps = advancedMode.value ? massimaleInps.value : 119650
    
    if (ordinarioCassa.value === 'gestione_separata') {
      const aliquotaGs = hasJob ? 0.24 : 0.2607
      const imponibileInps = Math.min(imponibileBase, capInps)
      inps = imponibileInps * aliquotaGs
    } else {
      if (isFullTime) {
        inps = 0
      } else {
        const imponibileInps = Math.min(imponibileBase, capInps)
        const inpsMinimale = 4208
        const redditoEccedente = Math.max(imponibileInps - 17504, 0)
        const inpsEccedente = redditoEccedente * 0.24
        inps = inpsMinimale + inpsEccedente

        if (ordinarioRiduzione50.value) {
          inps = inps * 0.50
        }
      }
    }

    const imponibilePivaFiscale = Math.max(imponibileBase - inps, 0)
    const ral = hasJob ? ralDipendente.value : 0
    const imponibileTotale = imponibilePivaFiscale + ral

    const irpefCumulativa = calcolaIrpefLorda(imponibileTotale)
    const irpefGiaPagataSuRal = ral > 0 ? calcolaIrpefLorda(ral) : 0
    const irpefLordaImpresa = irpefCumulativa - irpefGiaPagataSuRal

    const scontoDetraibili = advancedMode.value ? speseDetraibili.value * 0.19 : 0
    const irpefNetta = Math.max(irpefLordaImpresa - scontoDetraibili, 0)

    const addizionaleRegionaleVal = advancedMode.value ? addizionaleRegionale.value : 0
    const addizionaleComunaleVal = advancedMode.value ? addizionaleComunale.value : 0
    const tasseRegionali = imponibilePivaFiscale * (addizionaleRegionaleVal / 100)
    const tasseComunali = imponibilePivaFiscale * (addizionaleComunaleVal / 100)

    const tasseTotali = irpefNetta + tasseRegionali + tasseComunali

    const netto = fatturato.value - speseDeducibili.value - inps - tasseTotali
    const nettoMensile = netto / mesiParagone.value
    return { inps, tasse: tasseTotali, netto, nettoMensile }
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
    let inpsTotaleSostenutoDaUtente = 0;
    let tasseTotali = 0;
    let netto = 0;

    const hasJob = advancedMode.value && hasLavoroDipendente.value;
    const isFullTime = hasJob && dipendenteFullTime.value;
    const ral = hasJob ? ralDipendente.value : 0;
    const capInps = advancedMode.value ? massimaleInps.value : 119650;

    if (srlCassa.value === 'gestione_separata') {
      if (srlDistribuzione.value === 'compenso') {
        const aliquotaGsAzienda = hasJob ? 0.16 : 0.2239;
        const aliquotaGsAmministratore = hasJob ? 0.08 : 0.1120;
        
        const compensoLordo = utileLordoOperativo / (1 + aliquotaGsAzienda);
        
        const imponibileInps = Math.min(compensoLordo, capInps);
        const inpsAzienda = imponibileInps * aliquotaGsAzienda;
        const inpsAmministratore = imponibileInps * aliquotaGsAmministratore;
        
        const imponibileFiscale = Math.max(compensoLordo - inpsAmministratore, 0);
        
        const imponibileFiscaleTotal = imponibileFiscale + ral;
        const irpefLordaTotale = calcolaIrpefLorda(imponibileFiscaleTotal);
        const irpefGiaPagataSuRal = ral > 0 ? calcolaIrpefLorda(ral) : 0;
        const irpefLordaImpresa = irpefLordaTotale - irpefGiaPagataSuRal;

        const detrazioniTotale = calcolaDetrazioniDipendente(imponibileFiscaleTotal);
        const detrazioniSuRal = ral > 0 ? calcolaDetrazioniDipendente(ral) : 0;
        const detrazioniImpresa = Math.max(detrazioniTotale - detrazioniSuRal, 0);

        const scontoDetraibili = advancedMode.value ? speseDetraibili.value * 0.19 : 0;
        const irpefNetta = Math.max(irpefLordaImpresa - detrazioniImpresa - scontoDetraibili, 0);
        
        const addizionaleRegionaleVal = advancedMode.value ? addizionaleRegionale.value : 0;
        const addizionaleComunaleVal = advancedMode.value ? addizionaleComunale.value : 0;
        const tasseRegionali = imponibileFiscale * (addizionaleRegionaleVal / 100);
        const tasseComunali = imponibileFiscale * (addizionaleComunaleVal / 100);

        inpsTotaleSostenutoDaUtente = inpsAzienda + inpsAmministratore; 
        tasseTotali = irpefNetta + tasseRegionali + tasseComunali;
        netto = compensoLordo - inpsAmministratore - tasseTotali;
      } else {
        tasseSrl = utileLordoOperativo * 0.279;
        const utileNetto = utileLordoOperativo - tasseSrl;
        const tasseDividendi = utileNetto * 0.26;
        
        inpsTotaleSostenutoDaUtente = 0;
        tasseTotali = tasseSrl + tasseDividendi;
        netto = utileNetto - tasseDividendi;
      }
    } else { // artigiani
      if (srlDistribuzione.value === 'compenso') {
        const compensoLordo = utileLordoOperativo;
        let inps = 0;
        
        if (isFullTime) {
          inps = 0;
        } else {
          const imponibileInps = Math.min(compensoLordo, capInps);
          const inpsMinimale = 4208;
          const redditoEccedente = Math.max(imponibileInps - 17504, 0);
          const inpsEccedente = redditoEccedente * 0.24;
          inps = inpsMinimale + inpsEccedente;
          if (srlRiduzione50.value) {
            inps = inps * 0.50;
          }
        }

        const imponibileFiscale = Math.max(compensoLordo - inps, 0);
        
        const imponibileFiscaleTotal = imponibileFiscale + ral;
        const irpefLordaTotale = calcolaIrpefLorda(imponibileFiscaleTotal);
        const irpefGiaPagataSuRal = ral > 0 ? calcolaIrpefLorda(ral) : 0;
        const irpefLordaImpresa = irpefLordaTotale - irpefGiaPagataSuRal;

        const detrazioniTotale = calcolaDetrazioniDipendente(imponibileFiscaleTotal);
        const detrazioniSuRal = ral > 0 ? calcolaDetrazioniDipendente(ral) : 0;
        const detrazioniImpresa = Math.max(detrazioniTotale - detrazioniSuRal, 0);

        const scontoDetraibili = advancedMode.value ? speseDetraibili.value * 0.19 : 0;
        const irpefNetta = Math.max(irpefLordaImpresa - detrazioniImpresa - scontoDetraibili, 0);

        const addizionaleRegionaleVal = advancedMode.value ? addizionaleRegionale.value : 0;
        const addizionaleComunaleVal = advancedMode.value ? addizionaleComunale.value : 0;
        const tasseRegionali = imponibileFiscale * (addizionaleRegionaleVal / 100);
        const tasseComunali = imponibileFiscale * (addizionaleComunaleVal / 100);

        inpsTotaleSostenutoDaUtente = inps;
        tasseTotali = irpefNetta + tasseRegionali + tasseComunali;
        netto = compensoLordo - inps - tasseTotali;
      } else {
        tasseSrl = utileLordoOperativo * 0.279;
        const utileNetto = utileLordoOperativo - tasseSrl;
        const tasseDividendi = utileNetto * 0.26;

        let inps = 0;
        if (isFullTime) {
          inps = 0;
        } else {
          const imponibileInps = Math.min(utileLordoOperativo, capInps);
          const inpsMinimale = 4208;
          const redditoEccedente = Math.max(imponibileInps - 17504, 0);
          const inpsEccedente = redditoEccedente * 0.24;
          inps = inpsMinimale + inpsEccedente;
          if (srlRiduzione50.value) {
            inps = inps * 0.50;
          }
        }

        inpsTotaleSostenutoDaUtente = inps;
        tasseTotali = tasseSrl + tasseDividendi;
        netto = utileNetto - tasseDividendi - inps;
      }
    }

    const nettoMensile = netto / mesiParagone.value;
    return { 
      inps: inpsTotaleSostenutoDaUtente, 
      tasse: tasseTotali, 
      netto,
      nettoMensile
    }
  })

  // Calculations: Dipendente
  const dipendenteResult = computed(() => {
    // Fatturato = Costo Aziendale totale (RAL + Contributi INPS Datore)
    // Assumiamo: INPS Datore ~ 23.81%, INPS Dipendente ~ 9.19%
    const aliquotaInpsDatore = 0.2381;
    const aliquotaInpsDipendente = 0.0919;

    const ral = fatturato.value / (1 + aliquotaInpsDatore);
    const inpsDatore = ral * aliquotaInpsDatore;
    const inpsDipendente = ral * aliquotaInpsDipendente;
    
    const imponibileFiscale = Math.max(ral - inpsDipendente, 0);
    const irpefLorda = calcolaIrpefLorda(imponibileFiscale);
    const detrazioni = calcolaDetrazioniDipendente(imponibileFiscale);
    const irpefNetta = Math.max(irpefLorda - detrazioni, 0);

    const addizionaleRegionaleVal = advancedMode.value ? addizionaleRegionale.value : 0;
    const addizionaleComunaleVal = advancedMode.value ? addizionaleComunale.value : 0;
    const tasseRegionali = imponibileFiscale * (addizionaleRegionaleVal / 100);
    const tasseComunali = imponibileFiscale * (addizionaleComunaleVal / 100);

    const tasseTotali = irpefNetta + tasseRegionali + tasseComunali;
    const inpsTotale = inpsDatore + inpsDipendente;
    
    const netto = ral - inpsDipendente - tasseTotali;
    const nettoMensile = netto / mesiParagone.value;

    return {
      inps: inpsTotale,
      inpsDipendente,
      inpsDatore,
      ral,
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
    fatturato, expensesMode, advancedMode, speseDeducibili, speseDetraibili, atecoCategory, atecoCoef, ATECO_CATEGORIES,
    forfettarioCassa, forfettarioStartup, forfettarioRiduzione35, forfettarioRiduzione50,
    ordinarioCassa, ordinarioRiduzione50,
    srlDistribuzione, srlCassa, srlRiduzione50,
    forfettarioResult, ordinarioResult, srlResult, dipendenteResult,
    mesiParagone,
    hasLavoroDipendente, ralDipendente, dipendenteFullTime,
    addizionaleRegionale, addizionaleComunale, massimaleInps
  }
})
