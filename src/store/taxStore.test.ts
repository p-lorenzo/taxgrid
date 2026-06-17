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
