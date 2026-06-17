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

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('renders print-only title and print button', () => {
    const wrapper = mount(App)
    
    // Check that we render the print-only title container
    const printTitle = wrapper.find('.print\\:block')
    expect(printTitle.exists()).toBe(true)
    expect(printTitle.text()).toContain('TaxGrid - Report Simulazione Fiscale')

    // Check that print button exists
    const printBtn = wrapper.find('button.print\\:hidden')
    expect(printBtn.exists()).toBe(true)
    expect(printBtn.text()).toContain('Stampa Report / PDF')
  })

  it('triggers window.print when print button is clicked', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    const wrapper = mount(App)
    const printBtn = wrapper.find('button.print\\:hidden')
    
    await printBtn.trigger('click')
    expect(printSpy).toHaveBeenCalled()
    printSpy.mockRestore()
  })
})
