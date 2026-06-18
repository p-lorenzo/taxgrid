// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createApp, h } from 'vue'
import { usePwaInstall } from './usePwaInstall'

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

// Helper to run composable within a component context
function withSetup<V>(composable: () => V) {
  let result: V = undefined as any
  const app = createApp({
    setup() {
      result = composable()
      return () => h('div')
    }
  })
  app.mount(document.createElement('div'))
  return [result, app] as const
}

describe('usePwaInstall composable', () => {
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

  it('should not show prompt initially if event is not fired', () => {
    const [result] = withSetup(() => usePwaInstall())
    expect(result.showPrompt.value).toBe(false)
  })

  it('should detect iOS platform correctly', () => {
    userAgentMock = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
    platformMock = 'iPhone'
    const [result] = withSetup(() => usePwaInstall())
    expect(result.isIos.value).toBe(true)
    expect(result.isIosSafari.value).toBe(true)
  })

  it('should detect iPadOS correctly', () => {
    userAgentMock = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Safari/605.1.15'
    platformMock = 'MacIntel'
    maxTouchPointsMock = 5
    const [result] = withSetup(() => usePwaInstall())
    expect(result.isIos.value).toBe(true)
    expect(result.isIosSafari.value).toBe(true)
  })

  it('should show prompt for iOS Safari if not standalone and no cooldown', () => {
    userAgentMock = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
    platformMock = 'iPhone'
    const [result] = withSetup(() => usePwaInstall())
    expect(result.showPrompt.value).toBe(true)
  })

  it('should not show prompt for iOS if in standalone mode', () => {
    userAgentMock = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
    platformMock = 'iPhone'
    standaloneMock = true
    const [result] = withSetup(() => usePwaInstall())
    expect(result.showPrompt.value).toBe(false)
  })

  it('should show prompt for Android/Desktop when beforeinstallprompt fires', () => {
    const [result] = withSetup(() => usePwaInstall())
    expect(result.showPrompt.value).toBe(false)

    // Dispatch beforeinstallprompt event
    const event = new Event('beforeinstallprompt') as any
    event.preventDefault = vi.fn()
    window.dispatchEvent(event)

    expect(result.showPrompt.value).toBe(true)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('should hide prompt and set cooldown when dismissed', () => {
    userAgentMock = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
    platformMock = 'iPhone'

    const [result] = withSetup(() => usePwaInstall())
    expect(result.showPrompt.value).toBe(true)

    result.dismiss()
    expect(result.showPrompt.value).toBe(false)
    expect(localStorage.getItem('pwa-install-dismissed-at')).not.toBeNull()
  })

  it('should respect the 14 days cooldown', () => {
    userAgentMock = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
    platformMock = 'iPhone'

    // Set cooldown inside 14 days (e.g. 5 days ago)
    const fiveDaysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000
    localStorage.setItem('pwa-install-dismissed-at', fiveDaysAgo.toString())

    const [result] = withSetup(() => usePwaInstall())
    expect(result.showPrompt.value).toBe(false)

    // Set cooldown outside 14 days (e.g. 15 days ago)
    const fifteenDaysAgo = Date.now() - 15 * 24 * 60 * 60 * 1000
    localStorage.setItem('pwa-install-dismissed-at', fifteenDaysAgo.toString())

    // Re-check
    const [result2] = withSetup(() => usePwaInstall())
    expect(result2.showPrompt.value).toBe(true)
  })

  it('should handle appinstalled event correctly', () => {
    const [result] = withSetup(() => usePwaInstall())
    
    // Dispatch beforeinstallprompt to make it show
    const event = new Event('beforeinstallprompt') as any
    event.preventDefault = vi.fn()
    window.dispatchEvent(event)
    expect(result.showPrompt.value).toBe(true)

    // Dispatch appinstalled event
    const appInstalledEvent = new Event('appinstalled')
    window.dispatchEvent(appInstalledEvent)

    expect(result.showPrompt.value).toBe(false)
    expect(localStorage.getItem('pwa-installed')).toBe('true')
  })
})
