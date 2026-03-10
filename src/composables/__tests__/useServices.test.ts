import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'

// Mock the modules before importing the composable
vi.mock('@/services/supabase', () => ({
  supabase: {
    rpc: vi.fn()
  }
}))

vi.mock('@/mocks/services.mock', () => ({
  mockServices: [
    {
      id: 'service-1',
      slug: 'vidange-huile-moteur',
      name: 'Vidange huile moteur',
      description: 'Test description',
      priceFrom: 69,
      duration: 45,
      category: 'entretien',
      recommended: true
    },
    {
      id: 'service-2',
      slug: 'freins-avant',
      name: 'Freins avant',
      description: 'Remplacement freins',
      priceFrom: 149,
      duration: 90,
      category: 'freinage',
      recommended: false
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

describe('useServices', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the module to test different USE_MOCK_DATA scenarios
    vi.resetModules()
  })

  describe('with mock data (default)', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_USE_MOCK_DATA', 'true')
    })

    it('should use mock data when VITE_USE_MOCK_DATA is true', async () => {
      const { useServices } = await import('../useServices')
      const { data } = useServices()

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 600))

      expect(supabase.rpc).not.toHaveBeenCalled()
    })

    it('should return recommended services from mock', async () => {
      const { useRecommendedServices } = await import('../useServices')
      const { data } = useRecommendedServices(6)

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 500))

      expect(supabase.rpc).not.toHaveBeenCalled()
    })
  })

  describe('with Supabase (USE_MOCK_DATA=false)', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_USE_MOCK_DATA', 'false')
    })

    it('should call supabase.rpc for home_get_services', async () => {
      const mockResponse = {
        success: true,
        data: [
          { id: '1', slug: 'test', name: 'Test Service', priceFrom: 50 }
        ],
        count: 1
      }

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockResponse,
        error: null
      } as any)

      const { useServices } = await import('../useServices')
      useServices()

      // Wait for query to execute
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(supabase.rpc).toHaveBeenCalledWith('home_get_services')
    })

    it('should call supabase.rpc for home_get_featured_services with limit', async () => {
      const mockResponse = {
        success: true,
        data: [{ id: '1', slug: 'test', name: 'Featured Service', recommended: true }],
        count: 1
      }

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockResponse,
        error: null
      } as any)

      const { useRecommendedServices } = await import('../useServices')
      useRecommendedServices(3)

      await new Promise(resolve => setTimeout(resolve, 100))

      expect(supabase.rpc).toHaveBeenCalledWith('home_get_featured_services', { p_limit: 3 })
    })

    it('should handle Supabase error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      } as any)

      const { useServices } = await import('../useServices')
      const { error } = useServices()

      await new Promise(resolve => setTimeout(resolve, 100))

      // Error should be captured
      expect(error.value).toBeTruthy()
    })

    it('should handle unsuccessful response', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: { success: false, error: 'Custom error' },
        error: null
      } as any)

      const { useServices } = await import('../useServices')
      const { error } = useServices()

      await new Promise(resolve => setTimeout(resolve, 100))

      expect(error.value).toBeTruthy()
    })
  })

  describe('useServiceSearch', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_USE_MOCK_DATA', 'true')
    })

    it('should filter services by search query', async () => {
      const { useServiceSearch } = await import('../useServices')
      const searchQuery = ref('vidange')

      useServiceSearch(searchQuery)

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 400))

      expect(supabase.rpc).not.toHaveBeenCalled()
    })

    it('should return all services for short query', async () => {
      const { useServiceSearch } = await import('../useServices')
      const searchQuery = ref('a')

      useServiceSearch(searchQuery)

      await new Promise(resolve => setTimeout(resolve, 400))

      // Should not call Supabase in mock mode
      expect(supabase.rpc).not.toHaveBeenCalled()
    })
  })

  describe('useService (by slug)', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_USE_MOCK_DATA', 'false')
    })

    it('should call supabase.rpc for home_get_service with slug', async () => {
      const mockResponse = {
        success: true,
        data: { id: '1', slug: 'vidange-huile-moteur', name: 'Vidange' }
      }

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockResponse,
        error: null
      } as any)

      const { useService } = await import('../useServices')
      const slug = ref('vidange-huile-moteur')
      useService(slug)

      await new Promise(resolve => setTimeout(resolve, 100))

      expect(supabase.rpc).toHaveBeenCalledWith('home_get_service', { p_slug: 'vidange-huile-moteur' })
    })
  })
})
