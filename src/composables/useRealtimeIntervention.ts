import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import type { Intervention, InterventionEvent, ChatMessage } from '@/types/account'
import {
  getInterventionById,
  getInterventionTimeline,
  getInterventionMessages,
  getInterventionChecklist,
  mockChatMessages
} from '@/mocks/interventions'

/**
 * Real-time intervention tracking composable
 * Simulates Supabase Realtime with automatic updates
 * 
 * @param interventionId - Intervention ID to track
 * @returns Reactive intervention data with real-time updates
 */
export function useRealtimeIntervention(interventionId: string) {
  const intervention = ref<Intervention | null>(null)
  const interventionTimeline = ref<InterventionEvent[]>([])
  const chatMessages = ref<ChatMessage[]>([])
  const checklist = ref(getInterventionChecklist(interventionId))
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  
  let updateInterval: NodeJS.Timeout | null = null

  /**
   * Fetch intervention data
   */
  async function fetchIntervention(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300))

      const data = getInterventionById(interventionId)
      if (!data) {
        throw new Error('Intervention not found')
      }

      intervention.value = data
      interventionTimeline.value = getInterventionTimeline(interventionId)
      chatMessages.value = getInterventionMessages(interventionId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Simulate real-time subscription
   * Updates every 5 seconds if intervention is active
   */
  function subscribeToRealtime(): void {
    if (!intervention.value) return

    // Auto-update if intervention is active
    if (['en_route', 'sur_place', 'en_cours'].includes(intervention.value.status)) {
      updateInterval = setInterval(() => {
        // Simulate checklist progress
        if (intervention.value?.status === 'en_cours') {
          const unchecked = checklist.value.filter(item => !item.checked)
          if (unchecked.length > 0 && Math.random() > 0.6) {
            const item = unchecked[0]
            item.checked = true
            item.checkedAt = new Date().toISOString()
          }
        }

        // Log real-time update
        console.log(`[Realtime] Intervention ${interventionId} updated`)
      }, 5000)
    }
  }

  /**
   * Send chat message
   * 
   * @param content - Message content
   */
  async function sendMessage(content: string): Promise<void> {
    if (!intervention.value) return

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200))

      const newMessage: ChatMessage = {
        id: `msg-${interventionId}-${Date.now()}`,
        interventionId,
        content,
        sender: 'client',
        timestamp: new Date().toISOString(),
        read: false
      }

      chatMessages.value.push(newMessage)
      mockChatMessages.push(newMessage)

      console.log('[Chat] Message sent:', content)
    } catch (err) {
      console.error('[Chat] Error sending message:', err)
    }
  }

  /**
   * Update intervention status
   * 
   * @param newStatus - New status
   */
  async function updateStatus(newStatus: Intervention['status']): Promise<void> {
    if (!intervention.value) return

    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      intervention.value.status = newStatus

      // Add timeline event
      const event: InterventionEvent = {
        id: `evt-${interventionId}-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'status_change',
        description: `Statut changé : ${newStatus}`,
        actor: 'mechanic',
        metadata: { status: newStatus }
      }

      interventionTimeline.value.push(event)

      console.log('[Intervention] Status updated:', newStatus)
    } catch (err) {
      console.error('[Intervention] Error updating status:', err)
    }
  }

  /**
   * Cleanup on unmount
   */
  function cleanup(): void {
    if (updateInterval) {
      clearInterval(updateInterval)
      updateInterval = null
    }
  }

  // Lifecycle
  onMounted(async () => {
    await fetchIntervention()
    subscribeToRealtime()
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    intervention,
    interventionTimeline,
    chatMessages,
    checklist,
    isLoading,
    error,
    sendMessage,
    updateStatus,
    refetch: fetchIntervention
  }
}
