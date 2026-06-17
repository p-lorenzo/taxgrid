// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
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
})
