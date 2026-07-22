// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import App from './App.vue'

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

// Mock ResizeObserver for Headless UI Dialog
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('renders print-only title and print button', () => {
    const wrapper = mount(App)
    
    // Check that we render the print report component
    const printReport = wrapper.find('.print-report')
    expect(printReport.exists()).toBe(true)
    expect(printReport.text()).toContain('Simulazione Fiscale')

    // Check that print button exists
    const buttons = wrapper.findAll('button.print\\:hidden')
    const printBtn = buttons.find(b => b.text().includes('Stampa Report / PDF'))
    expect(printBtn).toBeDefined()
  })

  it('triggers window.print when print button is clicked', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    const wrapper = mount(App)
    const buttons = wrapper.findAll('button.print\\:hidden')
    const printBtn = buttons.find(b => b.text().includes('Stampa Report / PDF'))
    
    await printBtn!.trigger('click')
    expect(printSpy).toHaveBeenCalled()
    printSpy.mockRestore()
  })

  it('opens calculation breakdown modal when card button is clicked', async () => {
    const wrapper = mount(App)
    
    const buttons = wrapper.findAll('button')
    const breakdownBtn = buttons.find(b => b.text().includes('Vedi dettaglio calcolo'))
    expect(breakdownBtn).toBeDefined()

    await breakdownBtn!.trigger('click')
    
    expect((wrapper.vm as any).isBreakdownOpen).toBe(true)
    expect((wrapper.vm as any).breakdownTitle).toBe('Regime Forfettario')
    expect((wrapper.vm as any).breakdownSteps.length).toBeGreaterThan(0)
  })

  it('shows contextual Ko-fi links with safe external-link attributes', async () => {
    const wrapper = mount(App, { attachTo: document.body })

    const resultsCta = wrapper.get('[data-testid="kofi-support"]')
    expect(resultsCta.attributes('href')).toBe('https://ko-fi.com/lorenzopesce')
    expect(resultsCta.attributes('target')).toBe('_blank')
    expect(resultsCta.attributes('rel')).toBe('noopener noreferrer')
    expect(resultsCta.text()).toContain('Offrimi un caffè')

    const breakdownBtn = wrapper.findAll('button').find(button => button.text().includes('Vedi dettaglio calcolo'))
    await breakdownBtn!.trigger('click')
    await nextTick()

    const contextualLinks = Array.from(document.body.querySelectorAll<HTMLAnchorElement>('[data-testid="kofi-support"]'))
    const breakdownCta = contextualLinks.find(link => link.textContent?.includes('Sostieni TaxGrid su Ko-fi'))
    expect(breakdownCta).toBeDefined()
    expect(breakdownCta?.href).toBe('https://ko-fi.com/lorenzopesce')
    expect(breakdownCta?.rel).toBe('noopener noreferrer')

    wrapper.unmount()
  })
})
