import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock localStorage for node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString() },
    clear: () => { store = {} },
    removeItem: (key: string) => { delete store[key] }
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })

import { useTaxStore } from './taxStore'

describe('TaxStore ATECO Dropdown Logic', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('should initialize with default values', () => {
    const store = useTaxStore()
    expect(store.atecoCategory).toBe('professionisti')
    expect(store.atecoCoef).toBe(0.78)
  })

  it('should update atecoCoef when atecoCategory changes', async () => {
    const store = useTaxStore()
    
    store.atecoCategory = 'artigiani_imprese'
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(store.atecoCoef).toBe(0.67)

    store.atecoCategory = 'commercio'
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(store.atecoCoef).toBe(0.40)
  })

  it('should calculate forfettario values reactively based on atecoCategory', async () => {
    const store = useTaxStore()
    store.fatturato = 100000
    store.forfettarioCassa = 'gestione_separata'
    store.forfettarioStartup = false

    expect(store.forfettarioResult.inps).toBeCloseTo(20334.60, 2)
    expect(store.forfettarioResult.tasse).toBeCloseTo(8649.81, 2)
    expect(store.forfettarioResult.netto).toBeCloseTo(71015.59, 2)

    store.atecoCategory = 'commercio'
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(store.forfettarioResult.inps).toBeCloseTo(10428.00, 2)
    expect(store.forfettarioResult.tasse).toBeCloseTo(4435.80, 2)
    expect(store.forfettarioResult.netto).toBeCloseTo(85136.20, 2)
  })

  it('should load state from localStorage with atecoCategory', () => {
    localStorage.setItem('taxgrid_state', JSON.stringify({
      fatturato: 60000,
      spese: 8000,
      atecoCategory: 'costruzioni_immobiliari',
      atecoCoef: 0.86,
      forfettarioCassa: 'artigiani',
      forfettarioStartup: true,
      ordinarioCassa: 'artigiani',
      srlDistribuzione: 'utili'
    }))

    const store = useTaxStore()
    expect(store.fatturato).toBe(60000)
    expect(store.speseDeducibili).toBe(8000)
    expect(store.atecoCategory).toBe('costruzioni_immobiliari')
    expect(store.atecoCoef).toBe(0.86)
    expect(store.forfettarioCassa).toBe('artigiani')
    expect(store.forfettarioStartup).toBe(true)
    expect(store.ordinarioCassa).toBe('artigiani')
    expect(store.srlDistribuzione).toBe('utili')
  })

  it('should fallback and deduce atecoCategory if only atecoCoef is in localStorage', () => {
    localStorage.setItem('taxgrid_state', JSON.stringify({
      fatturato: 60000,
      speseDeducibili: 8000,
      atecoCoef: 0.54,
      forfettarioCassa: 'artigiani',
      forfettarioStartup: true,
      ordinarioCassa: 'artigiani',
      srlDistribuzione: 'utili'
    }))

    const store = useTaxStore()
    expect(store.atecoCategory).toBe('commercio_ambulante_non_alim')
    expect(store.atecoCoef).toBe(0.54)
  })
})

describe('TaxStore SRL Logic', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('should calculate SRL values in compenso mode correctly and differ from Ordinario', async () => {
    const store = useTaxStore()
    store.fatturato = 50000
    store.speseDeducibili = 5000
    store.srlDistribuzione = 'compenso'

    // Verify S.R.L. Compenso values (costiFissiSrl = 4000)
    // utileLordoOperativo = 41000
    // compensoLordo = 41000 / 1.2239 = 33499.4689
    // inpsAzienda = 33499.4689 * 0.2239 = 7500.5311
    // inpsAmministratore = 33499.4689 * 0.1120 = 3751.9405
    // inpsTotale = 11252.47
    // imponibileFiscale = 33499.4689 - 3751.9405 = 29747.5284
    // irpefLorda = 6440 + 1747.5284 * 0.35 = 7051.6349
    // detrazioni = 1910 * (20252.4716 / 22000) = 1758.2828
    // irpefNetta = 5293.3522
    // netto = 33499.4689 - 3751.9405 - 5293.3522 = 24454.1762
    expect(store.srlResult.inps).toBeCloseTo(11252.47, 2)
    expect(store.srlResult.tasse).toBeCloseTo(5293.35, 2)
    expect(store.srlResult.netto).toBeCloseTo(24454.18, 2)

    // Verify they are different from Ordinario
    // ordinario: inps = 11731.5, tasse = 8283.98, netto = 24984.53
    expect(store.srlResult.inps).not.toBeCloseTo(store.ordinarioResult.inps, 1)
    expect(store.srlResult.tasse).not.toBeCloseTo(store.ordinarioResult.tasse, 1)
    expect(store.srlResult.netto).not.toBeCloseTo(store.ordinarioResult.netto, 1)
  })

  it('should deduct corporate fixed costs of 4000 before calculating distributions in compenso and utili mode', () => {
    const store = useTaxStore()
    
    // Scenario A: Revenue doesn't exceed corporate costs + expenses
    store.fatturato = 3000
    store.speseDeducibili = 0
    store.srlDistribuzione = 'compenso'
    expect(store.srlResult.inps).toBe(0)
    expect(store.srlResult.tasse).toBe(0)
    expect(store.srlResult.netto).toBe(0)

    store.srlDistribuzione = 'utili'
    expect(store.srlResult.inps).toBe(0)
    expect(store.srlResult.tasse).toBe(0)
    expect(store.srlResult.netto).toBe(0)

    // Scenario B: Revenue slightly exceeds costs + expenses
    store.fatturato = 4500
    store.speseDeducibili = 0
    store.srlDistribuzione = 'utili'
    // utileLordoOperativo = 500
    // tasseSrl = 500 * 0.279 = 139.5
    // utileNetto = 500 - 139.5 = 360.5
    // tasseDividendi = 360.5 * 0.26 = 93.73
    // tasseTotali = 139.5 + 93.73 = 233.23
    // netto = 360.5 - 93.73 = 266.77
    expect(store.srlResult.tasse).toBeCloseTo(233.23, 2)
    expect(store.srlResult.netto).toBeCloseTo(266.77, 2)
  })
})

describe('TaxStore Expenses Mode (Simple / Advanced)', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('should calculate tax discounts when advanced mode is active', async () => {
    const store = useTaxStore()
    store.fatturato = 50000
    store.expensesMode = 'advanced'
    store.addizionaleRegionale = 0
    store.addizionaleComunale = 0
    store.speseDeducibili = 5000
    store.speseDetraibili = 10000

    // Ordinario calculations:
    // imponibileBase = 50000 - 5000 = 45000
    // inps = 45000 * 0.2607 = 11731.50
    // imponibileFiscale = 45000 - 11731.50 = 33268.50
    // irpefLorda = 28000 * 0.23 + 5268.50 * 0.35 = 6440 + 1843.975 = 8283.975
    // scontoDetraibili = 10000 * 0.19 = 1900
    // irpefNetta = 8283.975 - 1900 = 6383.98 (rounded)
    // netto = 50000 - 5000 - 11731.50 - 6383.98 = 26884.52 (rounded)
    expect(store.ordinarioResult.inps).toBeCloseTo(11731.50, 2)
    expect(store.ordinarioResult.tasse).toBeCloseTo(6383.975, 2)
    expect(store.ordinarioResult.netto).toBeCloseTo(26884.525, 2)

    // Forfettario calculations:
    // unimpeded by expenses
    // base = 50000 * 0.78 = 39000
    // inps = 39000 * 0.2607 = 10167.3
    // imponibileNetto = 39000 - 10167.3 = 28832.7
    // tasse = 28832.7 * 0.05 = 1441.635
    // netto = 50000 - 10167.3 - 1441.635 = 38391.07
    expect(store.forfettarioResult.inps).toBeCloseTo(10167.30, 2)
    expect(store.forfettarioResult.tasse).toBeCloseTo(1441.635, 2)
    expect(store.forfettarioResult.netto).toBeCloseTo(38391.065, 2)

    // SRL compenso mode:
    // utileLordoOperativo = 50000 - 5000 - 4000 = 41000
    // compensoLordo = 41000 / 1.2239 = 33499.4689
    // inpsAzienda = 33499.4689 * 0.2239 = 7500.5311
    // inpsAmministratore = 33499.4689 * 0.1120 = 3751.9405
    // inpsTotale = 11252.47
    // imponibileFiscale = 33499.4689 - 3751.9405 = 29747.5284
    // irpefLorda = 6440 + 1747.5284 * 0.35 = 7051.6349
    // detrazioni = 1910 * (20252.4716 / 22000) = 1758.2828
    // scontoDetraibili = 10000 * 0.19 = 1900
    // irpefNetta = Math.max(7051.6349 - 1758.2828 - 1900, 0) = 3393.3521
    // netto = compensoLordo - inpsAmministratore - irpefNetta = 33499.4689 - 3751.9405 - 3393.3521 = 26354.1763
    expect(store.srlResult.inps).toBeCloseTo(11252.47, 2)
    expect(store.srlResult.tasse).toBeCloseTo(3393.35, 2)
    expect(store.srlResult.netto).toBeCloseTo(26354.18, 2)
  })

  it('should ignore detraibili expenses in simple mode', async () => {
    const store = useTaxStore()
    store.fatturato = 50000
    store.expensesMode = 'simple'
    store.speseDeducibili = 5000
    store.speseDetraibili = 10000 // should be ignored

    // Ordinario calculations (should be same as if detraibili = 0):
    // irpefNetta = 8283.98 (no 1900 discount)
    // netto = 24984.53
    expect(store.ordinarioResult.tasse).toBeCloseTo(8283.98, 2)
    expect(store.ordinarioResult.netto).toBeCloseTo(24984.53, 2)
  })
})

describe('TaxStore Monthly Salary Comparison Logic', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('should initialize with default 12 months for comparison', () => {
    const store = useTaxStore()
    expect(store.mesiParagone).toBe(12)
  })

  it('should calculate nettoMensile correctly for all regimes', () => {
    const store = useTaxStore()
    store.fatturato = 50000
    store.mesiParagone = 12

    const forfettarioNetto = store.forfettarioResult.netto
    expect(store.forfettarioResult.nettoMensile).toBeCloseTo(forfettarioNetto / 12, 2)

    const ordinarioNetto = store.ordinarioResult.netto
    expect(store.ordinarioResult.nettoMensile).toBeCloseTo(ordinarioNetto / 12, 2)

    const srlNetto = store.srlResult.netto
    expect(store.srlResult.nettoMensile).toBeCloseTo(srlNetto / 12, 2)
  })

  it('should update calculations immediately when mesiParagone changes', () => {
    const store = useTaxStore()
    store.fatturato = 50000
    store.mesiParagone = 14

    const forfettarioNetto = store.forfettarioResult.netto
    expect(store.forfettarioResult.nettoMensile).toBeCloseTo(forfettarioNetto / 14, 2)
  })

  it('should persist and load mesiParagone to/from localStorage', () => {
    localStorage.setItem('taxgrid_state', JSON.stringify({
      fatturato: 60000,
      speseDeducibili: 8000,
      mesiParagone: 13
    }))

    const store = useTaxStore()
    expect(store.mesiParagone).toBe(13)
  })
})

describe('TaxStore INPS Reductions Logic', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('should initialize with default values', () => {
    const store = useTaxStore()
    expect(store.forfettarioRiduzione35).toBe(false)
    expect(store.forfettarioRiduzione50).toBe(false)
    expect(store.ordinarioRiduzione50).toBe(false)
    expect(store.srlCassa).toBe('gestione_separata')
    expect(store.srlRiduzione50).toBe(false)
  })

  it('should guarantee mutual exclusivity for Forfettario reductions', async () => {
    const store = useTaxStore()
    store.forfettarioRiduzione35 = true
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(store.forfettarioRiduzione50).toBe(false)

    store.forfettarioRiduzione50 = true
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(store.forfettarioRiduzione35).toBe(false)
  })

  it('should reset reduction flags when cassa changes to gestione_separata', async () => {
    const store = useTaxStore()
    store.forfettarioCassa = 'artigiani'
    store.forfettarioRiduzione35 = true
    
    store.ordinarioCassa = 'artigiani'
    store.ordinarioRiduzione50 = true
    
    store.srlCassa = 'artigiani'
    store.srlRiduzione50 = true
    
    await new Promise((resolve) => setTimeout(resolve, 0))

    store.forfettarioCassa = 'gestione_separata'
    store.ordinarioCassa = 'gestione_separata'
    store.srlCassa = 'gestione_separata'
    
    await new Promise((resolve) => setTimeout(resolve, 0))
    
    expect(store.forfettarioRiduzione35).toBe(false)
    expect(store.forfettarioRiduzione50).toBe(false)
    expect(store.ordinarioRiduzione50).toBe(false)
    expect(store.srlRiduzione50).toBe(false)
  })

  it('should apply 35% and 50% reductions to Forfettario INPS correctly', async () => {
    const store = useTaxStore()
    store.fatturato = 50000
    store.forfettarioCassa = 'artigiani'
    
    // Base Artigiani for 50000 * 0.78 = 39000
    // inpsMinimale = 4208
    // redditoEccedente = 39000 - 17504 = 21496
    // inpsEccedente = 21496 * 0.24 = 5159.04
    // totaleBase = 4208 + 5159.04 = 9367.04
    await new Promise((resolve) => setTimeout(resolve, 0))
    const baseInps = store.forfettarioResult.inps
    expect(baseInps).toBeCloseTo(9367.04, 2)

    // Apply 35% reduction
    store.forfettarioRiduzione35 = true
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(store.forfettarioResult.inps).toBeCloseTo(baseInps * 0.65, 2)

    // Apply 50% reduction instead
    store.forfettarioRiduzione50 = true
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(store.forfettarioResult.inps).toBeCloseTo(baseInps * 0.50, 2)
  })

  it('should apply 50% reduction to Ordinario INPS correctly and affect tax calculation', async () => {
    const store = useTaxStore()
    store.fatturato = 50000
    store.speseDeducibili = 5000
    store.ordinarioCassa = 'artigiani'
    
    // imponibileBase = 45000
    // Base INPS: 4208 + (45000 - 17504) * 0.24 = 4208 + 27496 * 0.24 = 10807.04
    await new Promise((resolve) => setTimeout(resolve, 0))
    const baseInps = store.ordinarioResult.inps
    const baseTasse = store.ordinarioResult.tasse
    const baseNetto = store.ordinarioResult.netto
    expect(baseInps).toBeCloseTo(10807.04, 2)

    // Apply 50% reduction
    store.ordinarioRiduzione50 = true
    await new Promise((resolve) => setTimeout(resolve, 0))
    
    expect(store.ordinarioResult.inps).toBeCloseTo(baseInps * 0.50, 2)
    // Decreased INPS should increase IRPEF (tasse) since less INPS is deducted
    expect(store.ordinarioResult.tasse).toBeGreaterThan(baseTasse)
    // Net should still be higher because we saved on INPS
    expect(store.ordinarioResult.netto).toBeGreaterThan(baseNetto)
  })

  it('should apply 50% reduction to SRL INPS correctly', async () => {
    const store = useTaxStore()
    store.fatturato = 50000
    store.speseDeducibili = 5000
    store.srlCassa = 'artigiani'
    store.srlDistribuzione = 'compenso'

    // compensoLordo = 41000
    // Base INPS: 4208 + (41000 - 17504) * 0.24 = 4208 + 23496 * 0.24 = 9847.04
    await new Promise((resolve) => setTimeout(resolve, 0))
    const baseInps = store.srlResult.inps
    expect(baseInps).toBeCloseTo(9847.04, 2)

    // Apply 50% reduction
    store.srlRiduzione50 = true
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(store.srlResult.inps).toBeCloseTo(baseInps * 0.50, 2)
  })
})

describe('TaxStore Advanced Parameters (RAL, Local Taxes, INPS Cap, Full-Time Exemptions)', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('should apply cumulative IRPEF when RAL is present in Ordinario', () => {
    const store = useTaxStore()
    store.fatturato = 20000
    store.speseDeducibili = 0
    store.advancedMode = true
    store.hasLavoroDipendente = false
    store.addizionaleRegionale = 0
    store.addizionaleComunale = 0
    
    // Non-job: 20000 - inps (20000 * 0.2607 = 5214). Imponibile = 14786.
    // IRPEF = 14786 * 0.23 = 3400.78
    expect(store.ordinarioResult.tasse).toBeCloseTo(3400.78, 2)

    // With job RAL = 30000
    store.hasLavoroDipendente = true
    store.ralDipendente = 30000
    
    // Imponibile PIVA = 20000 - 4800 (INPS GS at 24%) = 15200. Total pooled = 15200 + 30000 = 45200.
    // IRPEF total = 28000 * 0.23 + (45200 - 28000) * 0.35 = 6440 + 6020 = 12460.00
    // IRPEF RAL = 28000 * 0.23 + (30000 - 28000) * 0.35 = 6440 + 700 = 7140.00
    // Net IRPEF on PIVA = 12460 - 7140 = 5320
    expect(store.ordinarioResult.tasse).toBeCloseTo(5320, 2)
  })

  it('should apply 24% GS rate for concurrent employment', () => {
    const store = useTaxStore()
    store.fatturato = 50000
    store.advancedMode = true
    store.hasLavoroDipendente = true
    
    // Forfettario GS INPS: 50000 * 0.78 = 39000. Rate = 24%. INPS = 9360.
    expect(store.forfettarioResult.inps).toBeCloseTo(9360, 2)
  })

  it('should exempt Artigiani INPS completely for full-time employees', () => {
    const store = useTaxStore()
    store.fatturato = 50000
    store.advancedMode = true
    store.hasLavoroDipendente = true
    store.dipendenteFullTime = true
    
    store.forfettarioCassa = 'artigiani'
    store.ordinarioCassa = 'artigiani'
    store.srlCassa = 'artigiani'
    store.srlDistribuzione = 'compenso'
    
    expect(store.forfettarioResult.inps).toBe(0)
    expect(store.ordinarioResult.inps).toBe(0)
    expect(store.srlResult.inps).toBe(0)
  })

  it('should cap INPS calculations based on custom massimaleInps', () => {
    const store = useTaxStore()
    store.fatturato = 200000
    store.advancedMode = true
    store.massimaleInps = 100000
    store.forfettarioCassa = 'gestione_separata'
    
    // Forfettario GS: base = 200000 * 0.78 = 156000. Capped at 100000.
    // INPS = 100000 * 0.2607 = 26070.
    expect(store.forfettarioResult.inps).toBeCloseTo(26070, 2)
  })

  it('should increase taxes when local addizionali are modified', () => {
    const store = useTaxStore()
    store.fatturato = 50000
    store.speseDeducibili = 5000
    store.advancedMode = true
    store.addizionaleRegionale = 1.73
    store.addizionaleComunale = 0.8
    
    const initialTasse = store.ordinarioResult.tasse
    
    store.addizionaleRegionale = 3.33
    const finalTasse = store.ordinarioResult.tasse
    
    expect(finalTasse).toBeGreaterThan(initialTasse)
  })
})


