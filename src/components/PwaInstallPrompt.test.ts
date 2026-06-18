// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PwaInstallPrompt from './PwaInstallPrompt.vue'

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

describe('PwaInstallPrompt Component', () => {
  let userAgentMock = ''
  let platformMock = ''
  let maxTouchPointsMock = 0
  let standaloneMock = false
  let matchMediaMock: (query: string) => { matches: boolean } = () => ({ matches: false })

  beforeEach(() => {
    localStorage.clear()
    userAgentMock = 'Mozilla/5.0 (Linux; Android 10; SM-A505F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36'
    platformMock = 'Linux armv8l'
    maxTouchPointsMock = 5
    standaloneMock = false
    matchMediaMock = (query: string) => {
      if (query === '(display-mode: standalone)') {
        return { matches: standaloneMock }
      }
      return { matches: false }
    }

    Object.defineProperty(window.navigator, 'userAgent', {
      get: () => userAgentMock,
      configurable: true
    })
    Object.defineProperty(window.navigator, 'platform', {
      get: () => platformMock,
      configurable: true
    })
    Object.defineProperty(window.navigator, 'maxTouchPoints', {
      get: () => maxTouchPointsMock,
      configurable: true
    })
    Object.defineProperty(window.navigator, 'standalone', {
      get: () => standaloneMock,
      configurable: true
    })
    Object.defineProperty(window, 'matchMedia', {
      value: matchMediaMock,
      writable: true,
      configurable: true
    })
  })

  it('renders nothing initially when install event not fired', () => {
    const wrapper = mount(PwaInstallPrompt)
    expect(wrapper.find('div.fixed').exists()).toBe(false)
  })

  it('renders Android/Desktop install prompt when beforeinstallprompt fires', async () => {
    const wrapper = mount(PwaInstallPrompt)
    expect(wrapper.find('div.fixed').exists()).toBe(false)

    // Dispatch event
    const event = new Event('beforeinstallprompt')
    window.dispatchEvent(event)

    await wrapper.vm.$nextTick()
    expect(wrapper.find('div.fixed').exists()).toBe(true)
    expect(wrapper.text()).toContain('Installa TaxGrid')
    expect(wrapper.text()).toContain('Accedi istantaneamente e calcola offline')
    
    const installBtn = wrapper.findAll('button').find(b => b.text() === 'Installa')
    expect(installBtn).toBeDefined()
  })

  it('renders iOS instructions if user is on iOS and not standalone', async () => {
    userAgentMock = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
    platformMock = 'iPhone'

    const wrapper = mount(PwaInstallPrompt)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('div.fixed').exists()).toBe(true)
    expect(wrapper.text()).toContain('Installa TaxGrid')
    expect(wrapper.text()).toContain('Tocca il pulsante Condividi nella barra di Safari')
    expect(wrapper.text()).toContain('Aggiungi alla schermata Home')
    
    const installBtn = wrapper.findAll('button').find(b => b.text() === 'Installa')
    expect(installBtn).toBeUndefined()
  })

  it('hides the prompt when X or Annulla is clicked', async () => {
    const wrapper = mount(PwaInstallPrompt)
    
    // Dispatch event to show prompt
    const event = new Event('beforeinstallprompt')
    window.dispatchEvent(event)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('div.fixed').exists()).toBe(true)

    // Click Annulla
    const annullaBtn = wrapper.findAll('button').find(b => b.text() === 'Annulla')
    await annullaBtn?.trigger('click')

    expect(wrapper.find('div.fixed').exists()).toBe(false)
    expect(localStorage.getItem('pwa-install-dismissed-at')).not.toBeNull()
  })
})
