// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ComparisonChart from './ComparisonChart.vue'
import { useTaxStore } from '../store/taxStore'

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

describe('ComparisonChart Component', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('renders the component with correct title and legend', () => {
    const wrapper = mount(ComparisonChart)
    expect(wrapper.text()).toContain('Confronto Visivo dei Regimi')
    expect(wrapper.text()).toContain('Netto in tasca')
    expect(wrapper.text()).toContain('INPS / Contributi')
    expect(wrapper.text()).toContain('Tasse / Imposte')
    expect(wrapper.text()).toContain('Spese / Costi Fissi')
  })

  it('renders active regimes based on store visibility', async () => {
    const store = useTaxStore()
    
    // Default: all 4 are visible
    store.showForfettario = true
    store.showOrdinario = true
    store.showSrl = true
    store.showDipendente = true
    
    const wrapper = mount(ComparisonChart)
    
    // Check that we see the titles of the regimes
    expect(wrapper.text()).toContain('Regime Forfettario')
    expect(wrapper.text()).toContain('Regime Ordinario')
    expect(wrapper.text()).toContain('Società (S.R.L.)')
    expect(wrapper.text()).toContain('Lavoro Dipendente')

    // Disable all except Forfettario
    store.showOrdinario = false
    store.showSrl = false
    store.showDipendente = false
    
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Regime Forfettario')
    expect(wrapper.text()).not.toContain('Regime Ordinario')
    expect(wrapper.text()).not.toContain('Società (S.R.L.)')
    expect(wrapper.text()).not.toContain('Lavoro Dipendente')
  })

  it('renders empty state when no regimes are visible', async () => {
    const store = useTaxStore()
    store.showForfettario = false
    store.showOrdinario = false
    store.showSrl = false
    store.showDipendente = false

    const wrapper = mount(ComparisonChart)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Seleziona almeno un regime nei controlli')
  })
})
