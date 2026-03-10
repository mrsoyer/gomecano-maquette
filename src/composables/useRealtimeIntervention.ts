import { ref, onMounted, onUnmounted } from 'vue'
import type { Intervention, InterventionEvent, ChatMessage } from '@/types/account'
import { callRpc, supabase } from '@/services/supabase'

// Import mocks for fallback
import {
  getInterventionById as getInterventionByIdMock,
  getInterventionTimeline as getInterventionTimelineMock,
  getInterventionMessages as getInterventionMessagesMock,
  getInterventionChecklist,
  mockChatMessages
} from '@/mocks/interventions.mock'

// Toggle for mock vs real data
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true'

// Realtime data structure
interface RealtimeInterventionData {
  id: string
  status: string
  mechanicLocation: {
    lat: number | null
    lng: number | null
    updatedAt: string
  }
  timeline: Array<{
    step: number
    label: string
    completedAt: string | null
  }>
  estimatedArrival: string | null
  estimatedDuration: number
}

/**
 * Real-time intervention tracking composable
 *
 * @description Migrated to Supabase Functions-First architecture (Session 09)
 * Uses DB Function: mod_get_intervention_realtime + Supabase Realtime subscription
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
  const mechanicLocation = ref<{ lat: number | null; lng: number | null } | null>(null)

  let updateInterval: NodeJS.Timeout | null = null
  let realtimeSubscription: ReturnType<typeof supabase.channel> | null = null

  /**
   * Fetch intervention data
   */
  async function fetchIntervention(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      if (USE_MOCK_DATA) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300))

        const data = getInterventionByIdMock(interventionId)
        if (!data) {
          throw new Error('Intervention not found')
        }

        intervention.value = data
        interventionTimeline.value = getInterventionTimelineMock(interventionId)
        chatMessages.value = getInterventionMessagesMock(interventionId)
      } else {
        // Call Supabase RPC
        const result = await callRpc<RealtimeInterventionData>('mod_get_intervention_realtime', {
          p_appointment_id: interventionId
        })

        if (!result) {
          throw new Error('Intervention not found')
        }

        // Transform timeline to InterventionEvent format
        interventionTimeline.value = result.timeline.map((t, index) => ({
          id: `evt-${interventionId}-${index}`,
          timestamp: t.completedAt || new Date().toISOString(),
          type: 'status_change' as const,
          description: t.label,
          actor: 'system',
          metadata: { step: t.step }
        }))

        // Update mechanic location
        mechanicLocation.value = result.mechanicLocation

        // Basic intervention data (would need to fetch full appointment for complete data)
        intervention.value = {
          id: result.id,
          status: result.status as Intervention['status'],
          estimatedDuration: result.estimatedDuration
        } as Intervention

        // Fetch chat messages from appointments_messages table if exists
        const { data: messages } = await supabase
          .from('appointment_messages')
          .select('*')
          .eq('appointment_id', interventionId)
          .order('created_at', { ascending: true })

        if (messages) {
          chatMessages.value = messages.map(m => ({
            id: m.id,
            interventionId,
            content: m.content,
            sender: m.sender_type,
            timestamp: m.created_at,
            read: m.is_read
          }))
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('[RealtimeIntervention] Error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Subscribe to real-time updates
   * Uses Supabase Realtime for production, setInterval for mocks
   */
  function subscribeToRealtime(): void {
    if (!intervention.value) return

    if (USE_MOCK_DATA) {
      // Mock: Auto-update if intervention is active
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

          console.log(`[Realtime] Intervention ${interventionId} updated (mock)`)
        }, 5000)
      }
    } else {
      // Production: Subscribe to Supabase Realtime
      realtimeSubscription = supabase
        .channel(`intervention:${interventionId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments',
            filter: `id=eq.${interventionId}`
          },
          (payload) => {
            console.log('[Realtime] Appointment update received:', payload)
            // Refresh data on any change
            fetchIntervention()
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'appointment_messages',
            filter: `appointment_id=eq.${interventionId}`
          },
          (payload) => {
            console.log('[Realtime] New message received:', payload)
            // Add new message to chat
            const newMsg = payload.new as Record<string, unknown>
            chatMessages.value.push({
              id: newMsg.id as string,
              interventionId,
              content: newMsg.content as string,
              sender: newMsg.sender_type as string,
              timestamp: newMsg.created_at as string,
              read: newMsg.is_read as boolean
            })
          }
        )
        .subscribe()

      console.log(`[Realtime] Subscribed to intervention ${interventionId}`)
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
    if (realtimeSubscription) {
      supabase.removeChannel(realtimeSubscription)
      realtimeSubscription = null
      console.log(`[Realtime] Unsubscribed from intervention ${interventionId}`)
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
    mechanicLocation,
    isLoading,
    error,
    sendMessage,
    updateStatus,
    refetch: fetchIntervention
  }
}
