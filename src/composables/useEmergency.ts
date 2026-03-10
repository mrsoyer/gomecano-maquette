import { ref } from 'vue'
import { supabase } from '@/services/supabase'

interface EmergencyRequest {
  id: string
  client_id: string
  vehicle_id: string | null
  mechanic_id: string | null
  description: string
  category: string
  photos: string[]
  location: unknown
  address: string | null
  status: 'pending' | 'accepted' | 'en_route' | 'in_progress' | 'completed' | 'cancelled'
  cancelled_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  mechanic?: {
    id: string
    profile: {
      first_name: string
      last_name: string
      phone: string | null
      avatar_url: string | null
    }
  }
}

interface SOSUpdate {
  id: string
  request_id: string
  update_type: string
  message: string | null
  location: unknown | null
  created_at: string
}

/**
 * Composable for emergency/SOS requests
 * Uses Supabase RPC functions with built-in RLS
 */
export function useEmergency() {
  const currentRequest = ref<EmergencyRequest | null>(null)
  const updates = ref<SOSUpdate[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Create an emergency request via RPC
   */
  async function createEmergencyRequest(request: {
    vehicleId?: string
    description: string
    category?: string
    photos?: string[]
    location: { lat: number; lng: number }
    address?: string
  }) {
    loading.value = true
    error.value = null

    try {
      const { data, error: createError } = await supabase
        .rpc('account_create_emergency_request', {
          p_vehicle_id: request.vehicleId || null,
          p_description: request.description,
          p_category: request.category || 'breakdown',
          p_photos: request.photos || [],
          p_location_lat: request.location.lat,
          p_location_lng: request.location.lng,
          p_address: request.address || null
        })

      if (createError) throw createError

      currentRequest.value = data as EmergencyRequest
      return { success: true, request: data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create request'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch current active emergency request via RPC
   */
  async function fetchActiveRequest(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('account_get_active_emergency_request')

      if (fetchError) throw fetchError

      currentRequest.value = data as EmergencyRequest | null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch request'
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch SOS updates for a request via RPC
   */
  async function fetchUpdates(requestId: string): Promise<void> {
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('account_get_sos_updates', {
          p_request_id: requestId
        })

      if (fetchError) throw fetchError

      updates.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch updates'
    }
  }

  /**
   * Cancel emergency request via RPC
   */
  async function cancelRequest(requestId: string) {
    loading.value = true
    error.value = null

    try {
      const { error: cancelError } = await supabase
        .rpc('account_cancel_emergency_request', {
          p_request_id: requestId
        })

      if (cancelError) throw cancelError

      currentRequest.value = null
      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to cancel request'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Subscribe to real-time updates
   * Returns cleanup function
   */
  function subscribeToUpdates(requestId: string): () => void {
    const channel = supabase
      .channel(`emergency:${requestId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_requests',
          filter: `id=eq.${requestId}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            currentRequest.value = payload.new as EmergencyRequest
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sos_updates',
          filter: `request_id=eq.${requestId}`
        },
        (payload) => {
          updates.value = [...updates.value, payload.new as SOSUpdate]
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  return {
    // State
    currentRequest,
    updates,
    loading,
    error,

    // Methods
    createEmergencyRequest,
    fetchActiveRequest,
    fetchUpdates,
    cancelRequest,
    subscribeToUpdates
  }
}
