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

  it('renders title and regime selector', () => {
    const wrapper = mount(TaxDeadlines)
    expect(wrapper.text()).toContain('Scadenze Fiscali')
    expect(wrapper.text()).toContain('Forfettario')
    expect(wrapper.text()).toContain('Ordinario')
  })

  it('renders timeline events from the store', () => {
    const store = useTaxStore()
    store.deadlineRegime = 'forfettario'
    store.accontoMethod = 'storico'
    const wrapper = mount(TaxDeadlines)
    // Timeline: almeno un evento + totale
    expect(wrapper.findAll('li').length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('Totale versamenti stimati')
  })

  it('switches regime selector to ordinario', async () => {
    const store = useTaxStore()
    const wrapper = mount(TaxDeadlines)
    const buttons = wrapper.findAll('button')
    const ordinarioBtn = buttons.find((b) => b.text() === 'Ordinario')
    await ordinarioBtn!.trigger('click')
    expect(store.deadlineRegime).toBe('ordinario')
  })
})
