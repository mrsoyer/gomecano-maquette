import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useEmergency } from '../useEmergency'
import { supabase } from '@/services/supabase'

// Mock Supabase with RPC support
vi.mock('@/services/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis()
    })),
    removeChannel: vi.fn()
  }
}))

describe('useEmergency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createEmergencyRequest', () => {
    it('should create emergency request via RPC', async () => {
      const mockRequest = {
        id: 'sos-1',
        client_id: 'user-1',
        vehicle_id: 'veh-1',
        mechanic_id: null,
        description: 'Car won\'t start',
        category: 'breakdown',
        photos: ['photo1.jpg'],
        location: { lat: 48.8566, lng: 2.3522 },
        address: 'Paris, France',
        status: 'pending' as const,
        cancelled_at: null,
        completed_at: null,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      }

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockRequest,
        error: null
      } as never)

      const { createEmergencyRequest, currentRequest, loading, error } = useEmergency()

      expect(loading.value).toBe(false)

      const result = await createEmergencyRequest({
        vehicleId: 'veh-1',
        description: 'Car won\'t start',
        category: 'breakdown',
        photos: ['photo1.jpg'],
        location: { lat: 48.8566, lng: 2.3522 },
        address: 'Paris, France'
      })

      expect(result.success).toBe(true)
      expect(result.request).toEqual(mockRequest)
      expect(currentRequest.value).toEqual(mockRequest)
      expect(error.value).toBe(null)
      expect(supabase.rpc).toHaveBeenCalledWith('account_create_emergency_request', {
        p_vehicle_id: 'veh-1',
        p_description: 'Car won\'t start',
        p_category: 'breakdown',
        p_photos: ['photo1.jpg'],
        p_location_lat: 48.8566,
        p_location_lng: 2.3522,
        p_address: 'Paris, France'
      })
    })

    it('should use default values when optional params not provided', async () => {
      const mockRequest = {
        id: 'sos-2',
        client_id: 'user-1',
        vehicle_id: null,
        mechanic_id: null,
        description: 'Flat tire',
        category: 'breakdown',
        photos: [],
        location: { lat: 48.8566, lng: 2.3522 },
        address: null,
        status: 'pending' as const,
        cancelled_at: null,
        completed_at: null,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      }

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockRequest,
        error: null
      } as never)

      const { createEmergencyRequest } = useEmergency()

      await createEmergencyRequest({
        description: 'Flat tire',
        location: { lat: 48.8566, lng: 2.3522 }
      })

      expect(supabase.rpc).toHaveBeenCalledWith('account_create_emergency_request', {
        p_vehicle_id: null,
        p_description: 'Flat tire',
        p_category: 'breakdown',
        p_photos: [],
        p_location_lat: 48.8566,
        p_location_lng: 2.3522,
        p_address: null
      })
    })

    it('should handle create error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Failed to create emergency request' }
      } as never)

      const { createEmergencyRequest, error, currentRequest } = useEmergency()

      const result = await createEmergencyRequest({
        description: 'Test',
        location: { lat: 0, lng: 0 }
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to create request')
      expect(error.value).toBe('Failed to create request')
      expect(currentRequest.value).toBe(null)
    })

    it('should set loading state during creation', async () => {
      vi.mocked(supabase.rpc).mockImplementationOnce(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({ data: { id: 'sos-1' }, error: null } as never), 100)
        )
      )

      const { createEmergencyRequest, loading } = useEmergency()

      const promise = createEmergencyRequest({
        description: 'Test',
        location: { lat: 0, lng: 0 }
      })
      expect(loading.value).toBe(true)

      await promise
      expect(loading.value).toBe(false)
    })
  })

  describe('fetchActiveRequest', () => {
    it('should fetch active emergency request via RPC', async () => {
      const mockRequest = {
        id: 'sos-1',
        client_id: 'user-1',
        vehicle_id: null,
        mechanic_id: 'mech-1',
        description: 'Car breakdown',
        category: 'breakdown',
        photos: [],
        location: { lat: 48.8566, lng: 2.3522 },
        address: 'Paris',
        status: 'accepted' as const,
        cancelled_at: null,
        completed_at: null,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:30:00Z',
        mechanic: {
          id: 'mech-1',
          profile: {
            first_name: 'Jean',
            last_name: 'Martin',
            phone: '+33612345678',
            avatar_url: null
          }
        }
      }

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockRequest,
        error: null
      } as never)

      const { fetchActiveRequest, currentRequest, error } = useEmergency()

      await fetchActiveRequest()

      expect(currentRequest.value).toEqual(mockRequest)
      expect(error.value).toBe(null)
      expect(supabase.rpc).toHaveBeenCalledWith('account_get_active_emergency_request')
    })

    it('should return null when no active request', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: null
      } as never)

      const { fetchActiveRequest, currentRequest } = useEmergency()

      await fetchActiveRequest()

      expect(currentRequest.value).toBe(null)
    })

    it('should handle fetch error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      } as never)

      const { fetchActiveRequest, error } = useEmergency()

      await fetchActiveRequest()

      expect(error.value).toBe('Failed to fetch request')
    })

    it('should set loading state during fetch', async () => {
      vi.mocked(supabase.rpc).mockImplementationOnce(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({ data: null, error: null } as never), 100)
        )
      )

      const { fetchActiveRequest, loading } = useEmergency()

      const promise = fetchActiveRequest()
      expect(loading.value).toBe(true)

      await promise
      expect(loading.value).toBe(false)
    })
  })

  describe('fetchUpdates', () => {
    it('should fetch SOS updates via RPC', async () => {
      const mockUpdates = [
        {
          id: 'upd-1',
          request_id: 'sos-1',
          update_type: 'mechanic_assigned',
          message: 'A mechanic has been assigned',
          location: null,
          created_at: '2024-01-15T10:15:00Z'
        },
        {
          id: 'upd-2',
          request_id: 'sos-1',
          update_type: 'en_route',
          message: 'Mechanic is on the way',
          location: { lat: 48.8600, lng: 2.3500 },
          created_at: '2024-01-15T10:20:00Z'
        }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockUpdates,
        error: null
      } as never)

      const { fetchUpdates, updates, error } = useEmergency()

      await fetchUpdates('sos-1')

      expect(updates.value).toEqual(mockUpdates)
      expect(error.value).toBe(null)
      expect(supabase.rpc).toHaveBeenCalledWith('account_get_sos_updates', {
        p_request_id: 'sos-1'
      })
    })

    it('should handle empty updates', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [],
        error: null
      } as never)

      const { fetchUpdates, updates } = useEmergency()

      await fetchUpdates('sos-1')

      expect(updates.value).toEqual([])
    })

    it('should handle fetch updates error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Failed to fetch updates' }
      } as never)

      const { fetchUpdates, error } = useEmergency()

      await fetchUpdates('sos-1')

      expect(error.value).toBe('Failed to fetch updates')
    })
  })

  describe('cancelRequest', () => {
    it('should cancel emergency request via RPC', async () => {
      // First set up a current request
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { id: 'sos-1', status: 'pending' },
        error: null
      } as never)

      const { fetchActiveRequest, cancelRequest, currentRequest, error } = useEmergency()

      await fetchActiveRequest()
      expect(currentRequest.value).not.toBe(null)

      // Now cancel it
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { success: true },
        error: null
      } as never)

      const result = await cancelRequest('sos-1')

      expect(result.success).toBe(true)
      expect(currentRequest.value).toBe(null)
      expect(error.value).toBe(null)
      expect(supabase.rpc).toHaveBeenCalledWith('account_cancel_emergency_request', {
        p_request_id: 'sos-1'
      })
    })

    it('should handle cancel error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Cannot cancel - mechanic already en route' }
      } as never)

      const { cancelRequest, error } = useEmergency()

      const result = await cancelRequest('sos-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to cancel request')
      expect(error.value).toBe('Failed to cancel request')
    })

    it('should set loading state during cancellation', async () => {
      vi.mocked(supabase.rpc).mockImplementationOnce(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({ data: { success: true }, error: null } as never), 100)
        )
      )

      const { cancelRequest, loading } = useEmergency()

      const promise = cancelRequest('sos-1')
      expect(loading.value).toBe(true)

      await promise
      expect(loading.value).toBe(false)
    })
  })

  describe('subscribeToUpdates', () => {
    it('should set up realtime subscription for request and updates', () => {
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis()
      }
      vi.mocked(supabase.channel).mockReturnValue(mockChannel as never)

      const { subscribeToUpdates } = useEmergency()

      const cleanup = subscribeToUpdates('sos-1')

      expect(supabase.channel).toHaveBeenCalledWith('emergency:sos-1')
      // First on() call for emergency_requests table
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_requests',
          filter: 'id=eq.sos-1'
        },
        expect.any(Function)
      )
      // Second on() call for sos_updates table
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sos_updates',
          filter: 'request_id=eq.sos-1'
        },
        expect.any(Function)
      )
      expect(mockChannel.subscribe).toHaveBeenCalled()
      expect(typeof cleanup).toBe('function')
    })

    it('should cleanup channel on unsubscribe', () => {
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis()
      }
      vi.mocked(supabase.channel).mockReturnValue(mockChannel as never)

      const { subscribeToUpdates } = useEmergency()

      const cleanup = subscribeToUpdates('sos-1')
      cleanup()

      expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel)
    })

    it('should update currentRequest when request is updated', () => {
      let updateCallback: ((payload: { eventType: string; new: unknown }) => void) | undefined

      const mockChannel = {
        on: vi.fn((event, config, callback) => {
          // Capture the first on() callback (emergency_requests)
          if (config.table === 'emergency_requests') {
            updateCallback = callback
          }
          return mockChannel
        }),
        subscribe: vi.fn().mockReturnThis()
      }
      vi.mocked(supabase.channel).mockReturnValue(mockChannel as never)

      const { subscribeToUpdates, currentRequest } = useEmergency()

      subscribeToUpdates('sos-1')

      // Simulate receiving an update
      const updatedRequest = {
        id: 'sos-1',
        status: 'en_route',
        mechanic_id: 'mech-1'
      }

      updateCallback?.({ eventType: 'UPDATE', new: updatedRequest })

      expect(currentRequest.value).toEqual(updatedRequest)
    })

    it('should add new SOS update when received', () => {
      let insertCallback: ((payload: { new: unknown }) => void) | undefined

      const mockChannel = {
        on: vi.fn((event, config, callback) => {
          // Capture the second on() callback (sos_updates)
          if (config.table === 'sos_updates') {
            insertCallback = callback
          }
          return mockChannel
        }),
        subscribe: vi.fn().mockReturnThis()
      }
      vi.mocked(supabase.channel).mockReturnValue(mockChannel as never)

      const { subscribeToUpdates, updates } = useEmergency()

      subscribeToUpdates('sos-1')

      // Simulate receiving a new update
      const newUpdate = {
        id: 'upd-3',
        request_id: 'sos-1',
        update_type: 'arrived',
        message: 'Mechanic has arrived',
        location: { lat: 48.8566, lng: 2.3522 },
        created_at: '2024-01-15T10:45:00Z'
      }

      insertCallback?.({ new: newUpdate })

      expect(updates.value).toContainEqual(newUpdate)
    })
  })
})
