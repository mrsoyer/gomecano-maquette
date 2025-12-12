/**
 * Push Notifications Composable (Mock)
 */

import { ref } from 'vue'

export function usePushNotifications() {
  const isEnabled = ref(false)
  const permission = ref<NotificationPermission>('default')
  const isLoading = ref(false)

  async function requestPermission(): Promise<boolean> {
    isLoading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock permission
      permission.value = 'granted'
      isEnabled.value = true
      
      console.log('[PushNotifications] Permission granted (mock)')
      window.alert('✓ Notifications push activées')
      return true
    } catch (err) {
      console.error('[PushNotifications] Error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  function disable(): void {
    isEnabled.value = false
    permission.value = 'denied'
    console.log('[PushNotifications] Disabled')
  }

  return {
    isEnabled,
    permission,
    isLoading,
    requestPermission,
    disable
  }
}
