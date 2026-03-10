import { ref, computed } from 'vue'
import { mockServices } from '@/mocks'
import type { Service } from '@/types/service'

/**
 * Composable to access mock services data
 * Simule comportement API avec loading/error states
 *
 * @returns Services data, loading state, error, and methods
 */
export function useMockData() {
  const services = ref<Service[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Simulate API call to fetch services
   */
  async function fetchServices(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))

      services.value = mockServices
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get service by ID
   *
   * @param id - Service ID
   * @returns Service or undefined if not found
   */
  function getServiceById(id: string): Service | undefined {
    return services.value.find(s => s.id === id)
  }

  /**
   * Get service by slug
   *
   * @param slug - Service slug
   * @returns Service or undefined if not found
   */
  function getServiceBySlug(slug: string): Service | undefined {
    return services.value.find(s => s.slug === slug)
  }

  /**
   * Get recommended services
   */
  const recommendedServices = computed(() => {
    return services.value.filter(s => s.recommended === true)
  })

  /**
   * Get services by category
   */
  const getServicesByCategory = (category: string) => {
    return services.value.filter(s => s.category === category)
  }

  return {
    services,
    isLoading,
    error,
    fetchServices,
    getServiceById,
    getServiceBySlug,
    recommendedServices,
    getServicesByCategory
  }
}
