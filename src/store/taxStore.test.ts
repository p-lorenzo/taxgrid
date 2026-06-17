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
    expect(store.spese).toBe(8000)
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
      spese: 8000,
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
    store.spese = 5000
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
    store.spese = 0
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
    store.spese = 0
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

