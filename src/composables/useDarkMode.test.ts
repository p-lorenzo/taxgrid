// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { useDarkMode } from './useDarkMode'

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

describe('useDarkMode composable', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
  })

  it('defaults to system theme', () => {
    const { theme } = useDarkMode()
    expect(theme.value).toBe('system')
  })

  it('updates theme state and localStorage when setTheme is called', () => {
    const { theme, setTheme } = useDarkMode()
    
    setTheme('dark')
    expect(theme.value).toBe('dark')
    expect(localStorage.getItem('theme-preference')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    setTheme('light')
    expect(theme.value).toBe('light')
    expect(localStorage.getItem('theme-preference')).toBe('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
