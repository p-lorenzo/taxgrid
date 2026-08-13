// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import TaxDeadlines from './TaxDeadlines.vue'
import { useTaxStore } from '../store/taxStore'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString() },
    clear: () => { store = {} },
    removeItem: (key: string) => { delete store[key] },
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })

describe('TaxDeadlines Component', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('renders required forecast facts and incomplete warning', () => {
    const wrapper = mount(TaxDeadlines)
    expect(wrapper.text()).toContain('Scadenze Fiscali')
    expect(wrapper.text()).toContain('Dati necessari')
    expect(wrapper.text()).toContain('Data apertura obbligatoria')
    expect(wrapper.find('#activity-start-date').attributes('required')).toBeDefined()
    expect(wrapper.text()).toContain('Inserisci la data di apertura')
  })

  it('renders historical fields and timeline after opening date is entered', async () => {
    const store = useTaxStore()
    store.activityStartDate = '2024-01-01'
    store.previousYearTax = 5_000
    const wrapper = mount(TaxDeadlines)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Imposta netta dovuta 2025')
    expect(wrapper.text()).toContain('Reddito previdenziale 2025')
    expect(wrapper.findAll('input[type="number"]').length).toBeGreaterThanOrEqual(6)
    expect(wrapper.findAll('li').length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('Modello Redditi PF 2026')
    expect(wrapper.text()).toContain('Modello Redditi PF 2027')
    expect(wrapper.text()).toContain('Invio telematico')
    expect(wrapper.text()).toContain('Totale versamenti 2026')
    expect(wrapper.text()).toContain('Totale versamenti 2027')
  })

  it('hides historical fields for a 2026 opening and explains first-year rules', async () => {
    const store = useTaxStore()
    store.activityStartDate = '2026-07-01'
    const wrapper = mount(TaxDeadlines)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Prima attività nel 2026')
    expect(wrapper.text()).not.toContain('Imposta netta dovuta 2025')
    expect(wrapper.text()).not.toContain('Modello Redditi PF 2026')
    expect(wrapper.text()).toContain('Modello Redditi PF 2027')
  })

  it('switches regime selector to ordinario', async () => {
    const store = useTaxStore()
    const wrapper = mount(TaxDeadlines)
    const buttons = wrapper.findAll('button')
    const ordinarioBtn = buttons.find((b) => b.text() === 'Ordinario')
    await ordinarioBtn!.trigger('click')
    expect(store.deadlineRegime).toBe('ordinario')
    expect(wrapper.text()).toContain('Soggetto ISA / proroga 2026')
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
  })
})
