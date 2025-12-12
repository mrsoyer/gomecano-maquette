import { ref } from 'vue'

export function useCalendarSync() {
  const isConnected = ref(false)
  const provider = ref<'google' | 'outlook' | null>(null)
  const isLoading = ref(false)

  async function connect(calendarProvider: 'google' | 'outlook'): Promise<void> {
    isLoading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      isConnected.value = true
      provider.value = calendarProvider
      window.alert(`✓ Connecté à ${calendarProvider === 'google' ? 'Google Calendar' : 'Outlook'}`)
    } finally {
      isLoading.value = false
    }
  }

  function disconnect(): void {
    isConnected.value = false
    provider.value = null
  }

  return { isConnected, provider, isLoading, connect, disconnect }
}
