/**
 * Emergency Composable
 */

import { ref } from 'vue'
import type { EmergencyRequest, SOSSession } from '@/types/emergency'
import { mockEmergencyRequests, createEmergencyRequest, getSOSSession } from '@/mocks/emergency.mock'

export function useEmergency(userId: string) {
  const requests = ref<EmergencyRequest[]>([...mockEmergencyRequests])
  const activeSession = ref<SOSSession | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function createSOS(data: Partial<EmergencyRequest>): Promise<EmergencyRequest> {
    isLoading.value = true
    error.value = null
    try {
      const request = await createEmergencyRequest({ ...data, userId })
      requests.value.unshift(request)
      
      // Start session
      activeSession.value = await getSOSSession(request.id)
      return request
    } catch (err) {
      error.value = 'Erreur lors de la création de la demande'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function cancelSOS(): void {
    activeSession.value = null
  }

  return {
    requests,
    activeSession,
    isLoading,
    error,
    createSOS,
    cancelSOS
  }
}

