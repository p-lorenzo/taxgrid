import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'system'

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = window.localStorage.getItem('theme-preference') as Theme
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved
    }
  }
  return 'system'
}

const theme = ref<Theme>(getInitialTheme())

export function useDarkMode() {
  const updateDOM = () => {
    if (typeof window === 'undefined') return
    const isDark =
      theme.value === 'dark' ||
      (theme.value === 'system' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)

    if (isDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  }

  // Set up listeners safely
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => {
      if (theme.value === 'system') {
        updateDOM()
      }
    }
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener)
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(listener)
    }
  }

  // Watch for theme changes and persist + update DOM
  watch(
    theme,
    (newTheme) => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('theme-preference', newTheme)
      }
      updateDOM()
    },
    { immediate: true, flush: 'sync' }
  )

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
  }

  return {
    theme,
    setTheme
  }
}
