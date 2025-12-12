/**
 * PWA Composable - Install prompt and updates
 */

import { ref, onMounted } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

export function usePWA() {
  const showInstallPrompt = ref(false)
  const deferredPrompt = ref<any>(null)

  // Service Worker registration
  const {
    needRefresh,
    updateServiceWorker
  } = useRegisterSW()

  onMounted(() => {
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt.value = e
      showInstallPrompt.value = true
      console.log('[PWA] Install prompt available')
    })

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('[PWA] App is running in standalone mode')
      showInstallPrompt.value = false
    }
  })

  async function install(): Promise<void> {
    if (!deferredPrompt.value) {
      console.log('[PWA] No install prompt available')
      return
    }

    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    
    console.log('[PWA] Install outcome:', outcome)
    
    if (outcome === 'accepted') {
      showInstallPrompt.value = false
      deferredPrompt.value = null
    }
  }

  function dismissInstallPrompt(): void {
    showInstallPrompt.value = false
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  return {
    showInstallPrompt,
    needRefresh,
    install,
    dismissInstallPrompt,
    updateServiceWorker
  }
}

