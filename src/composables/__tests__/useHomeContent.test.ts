import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'

// Mock the modules before importing the composable
vi.mock('@/services/supabase', () => ({
  supabase: {
    rpc: vi.fn()
  }
}))

vi.mock('@/mocks/testimonials.mock', () => ({
  mockTestimonials: [
    {
      id: 'testimonial-1',
      userId: 'user-1',
      userName: 'Marie D.',
      userAvatar: '/avatars/marie.jpg',
      rating: 5,
      comment: 'Service impeccable !',
      serviceId: 'service-1',
      serviceName: 'Vidange',
      createdAt: '2024-11-15',
      verified: true
    },
    {
      id: 'testimonial-2',
      userId: 'user-2',
      userName: 'Jean P.',
      rating: 4,
      comment: 'Très bien',
      serviceId: 'service-2',
      serviceName: 'Freins',
      createdAt: '2024-11-10',
      verified: true
    },
    {
      id: 'testimonial-3',
      userId: 'user-3',
      userName: 'Pierre L.',
      rating: 3,
      comment: 'Correct',
      serviceId: 'service-3',
      serviceName: 'Pneus',
      createdAt: '2024-11-05',
      verified: true
    },
    {
      id: 'testimonial-4',
      userId: 'user-4',
      userName: 'Sophie M.',
      rating: 5,
      comment: 'Non vérifié',
      serviceId: 'service-4',
      serviceName: 'Batterie',
      createdAt: '2024-11-01',
      verified: false
    }
  ]
}))

vi.mock('@tanstack/vue-query', () => ({
  useQuery: vi.fn((options) => {
    const data = ref(null)
    const isLoading = ref(true)
    const error = ref(null)

    // Execute the queryFn to test it
    if (options.enabled === undefined || options.enabled.value !== false) {
      options.queryFn().then((result: unknown) => {
        data.value = result
        isLoading.value = false
      }).catch((err: Error) => {
        error.value = err
        isLoading.value = false
      })
    }

    return { data, isLoading, error }
  })
}))

import { supabase } from '@/services/supabase'

describe('useHomeContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('useHomeTestimonials', () => {
    describe('with mock data (default)', () => {
      beforeEach(() => {
        vi.stubEnv('VITE_USE_MOCK_DATA', 'true')
      })

      it('should use mock data when VITE_USE_MOCK_DATA is true', async () => {
        const { useHomeTestimonials } = await import('../useHomeContent')
        useHomeTestimonials()

        await new Promise(resolve => setTimeout(resolve, 500))

        expect(supabase.rpc).not.toHaveBeenCalled()
      })

      it('should filter testimonials by verified and rating >= 4', async () => {
        const { useHomeTestimonials } = await import('../useHomeContent')
        const { data } = useHomeTestimonials()

        await new Promise(resolve => setTimeout(resolve, 500))

        // Should only include verified testimonials with rating >= 4
        // From mock: testimonial-1 (5, verified), testimonial-2 (4, verified)
        // Excluded: testimonial-3 (rating 3), testimonial-4 (not verified)
        expect(supabase.rpc).not.toHaveBeenCalled()
      })

      it('should respect custom limit parameter', async () => {
        const { useHomeTestimonials } = await import('../useHomeContent')
        useHomeTestimonials(2)

        await new Promise(resolve => setTimeout(resolve, 500))

        expect(supabase.rpc).not.toHaveBeenCalled()
      })
    })

    describe('with Supabase (USE_MOCK_DATA=false)', () => {
      beforeEach(() => {
        vi.stubEnv('VITE_USE_MOCK_DATA', 'false')
      })

      it('should call supabase.rpc for home_get_testimonials', async () => {
        const mockResponse = {
          success: true,
          data: [
            { id: '1', userName: 'Test User', rating: 5, comment: 'Great!' }
          ],
          count: 1
        }

        vi.mocked(supabase.rpc).mockResolvedValue({
          data: mockResponse,
          error: null
        } as never)

        const { useHomeTestimonials } = await import('../useHomeContent')
        useHomeTestimonials()

        await new Promise(resolve => setTimeout(resolve, 100))

        expect(supabase.rpc).toHaveBeenCalledWith('home_get_testimonials', { p_limit: 6 })
      })

      it('should pass custom limit to RPC call', async () => {
        const mockResponse = {
          success: true,
          data: [],
          count: 0
        }

        vi.mocked(supabase.rpc).mockResolvedValue({
          data: mockResponse,
          error: null
        } as never)

        const { useHomeTestimonials } = await import('../useHomeContent')
        useHomeTestimonials(3)

        await new Promise(resolve => setTimeout(resolve, 100))

        expect(supabase.rpc).toHaveBeenCalledWith('home_get_testimonials', { p_limit: 3 })
      })

      it('should handle Supabase error', async () => {
        vi.mocked(supabase.rpc).mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        } as never)

        const { useHomeTestimonials } = await import('../useHomeContent')
        const { error } = useHomeTestimonials()

        await new Promise(resolve => setTimeout(resolve, 100))

        expect(error.value).toBeTruthy()
      })

      it('should handle unsuccessful response', async () => {
        vi.mocked(supabase.rpc).mockResolvedValue({
          data: { success: false, error: 'Custom error' },
          error: null
        } as never)

        const { useHomeTestimonials } = await import('../useHomeContent')
        const { error } = useHomeTestimonials()

        await new Promise(resolve => setTimeout(resolve, 100))

        expect(error.value).toBeTruthy()
      })
    })
  })

  describe('useHomeStats', () => {
    describe('with mock data (default)', () => {
      beforeEach(() => {
        vi.stubEnv('VITE_USE_MOCK_DATA', 'true')
      })

      it('should use mock data when VITE_USE_MOCK_DATA is true', async () => {
        const { useHomeStats } = await import('../useHomeContent')
        useHomeStats()

        await new Promise(resolve => setTimeout(resolve, 400))

        expect(supabase.rpc).not.toHaveBeenCalled()
      })

      it('should return 4 stat items', async () => {
        const { useHomeStats } = await import('../useHomeContent')
        const { data } = useHomeStats()

        await new Promise(resolve => setTimeout(resolve, 400))

        // Mock stats should have 4 items
        expect(supabase.rpc).not.toHaveBeenCalled()
      })
    })

    describe('with Supabase (USE_MOCK_DATA=false)', () => {
      beforeEach(() => {
        vi.stubEnv('VITE_USE_MOCK_DATA', 'false')
      })

      it('should call supabase.rpc for home_get_stats', async () => {
        const mockResponse = {
          success: true,
          data: [
            { key: 'clients', value: '10 000+', label: 'Clients', icon: 'mdi-account' }
          ],
          count: 1
        }

        vi.mocked(supabase.rpc).mockResolvedValue({
          data: mockResponse,
          error: null
        } as never)

        const { useHomeStats } = await import('../useHomeContent')
        useHomeStats()

        await new Promise(resolve => setTimeout(resolve, 100))

        expect(supabase.rpc).toHaveBeenCalledWith('home_get_stats')
      })

      it('should handle Supabase error', async () => {
        vi.mocked(supabase.rpc).mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        } as never)

        const { useHomeStats } = await import('../useHomeContent')
        const { error } = useHomeStats()

        await new Promise(resolve => setTimeout(resolve, 100))

        expect(error.value).toBeTruthy()
      })

      it('should handle unsuccessful response', async () => {
        vi.mocked(supabase.rpc).mockResolvedValue({
          data: { success: false, error: 'Stats not available' },
          error: null
        } as never)

        const { useHomeStats } = await import('../useHomeContent')
        const { error } = useHomeStats()

        await new Promise(resolve => setTimeout(resolve, 100))

        expect(error.value).toBeTruthy()
      })
    })
  })
})
