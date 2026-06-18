import { ref, onMounted, onUnmounted, computed } from 'vue'

const COOLDOWN_DAYS = 14
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000
const DISMISSED_KEY = 'pwa-install-dismissed-at'
const INSTALLED_KEY = 'pwa-installed'

export function usePwaInstall() {
  const deferredPrompt = ref<any>(null)
  const isInstalled = ref(false)
  const isDismissed = ref(false)

  // Standalone checks
  const getIsStandalone = (): boolean => {
    if (typeof window === 'undefined') return false
    return (
      (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) ||
      (window.navigator as any).standalone === true
    )
  }

  const isStandalone = ref(getIsStandalone())

  // iOS check
  const isIos = computed(() => {
    if (typeof window === 'undefined') return false
    const ua = window.navigator.userAgent
    const isIpadOS = window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1
    return /iPhone|iPad|iPod/.test(ua) || isIpadOS
  })

  // iOS not standalone
  const isIosSafari = computed(() => {
    return isIos.value && !isStandalone.value
  })

  // Cooldown check
  const hasCooldown = (): boolean => {
    if (typeof window === 'undefined' || !window.localStorage) return false
    const dismissedAt = localStorage.getItem(DISMISSED_KEY)
    if (!dismissedAt) return false
    const timestamp = parseInt(dismissedAt, 10)
    if (isNaN(timestamp)) return false
    return Date.now() - timestamp < COOLDOWN_MS
  }

  const getIsInstalledFlag = (): boolean => {
    if (typeof window === 'undefined' || !window.localStorage) return false
    return localStorage.getItem(INSTALLED_KEY) === 'true'
  }

  const showPrompt = computed(() => {
    // 1. If already in standalone mode, do not show
    if (isStandalone.value) return false

    // 2. If already marked as installed in localStorage, do not show
    if (getIsInstalledFlag() || isInstalled.value) return false

    // 3. If currently dismissed in local state, do not show
    if (isDismissed.value) return false

    // 4. If cooldown is active, do not show
    if (hasCooldown()) return false

    // 5. For iOS, we can show it (if not standalone)
    if (isIosSafari.value) return true

    // 6. For Android/Chromium, we show it only if beforeinstallprompt was fired
    return deferredPrompt.value !== null
  })

  const handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault()
    deferredPrompt.value = e
  }

  const handleAppInstalled = () => {
    isInstalled.value = true
    deferredPrompt.value = null
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(INSTALLED_KEY, 'true')
    }
  }

  onMounted(() => {
    if (typeof window === 'undefined') return

    // Update standalone state
    isStandalone.value = getIsStandalone()

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
  })

  onUnmounted(() => {
    if (typeof window === 'undefined') return
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.removeEventListener('appinstalled', handleAppInstalled)
  })

  const install = async () => {
    if (!deferredPrompt.value) return
    
    const promptEvent = deferredPrompt.value
    // Show the browser's install prompt
    promptEvent.prompt()

    // Wait for the user to respond to the prompt
    try {
      const choiceResult = await promptEvent.userChoice
      if (choiceResult.outcome === 'accepted') {
        isInstalled.value = true
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(INSTALLED_KEY, 'true')
        }
      } else {
        // User dismissed the prompt, treat as dismiss (14 days cooldown)
        dismiss()
      }
    } catch (err) {
      console.error('Error during PWA installation:', err)
    } finally {
      deferredPrompt.value = null
    }
  }

  const dismiss = () => {
    isDismissed.value = true
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(DISMISSED_KEY, Date.now().toString())
    }
  }

  return {
    deferredPrompt,
    isIos,
    isIosSafari,
    isStandalone,
    showPrompt,
    install,
    dismiss
  }
}
