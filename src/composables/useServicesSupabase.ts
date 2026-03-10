import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import type { Tables, Enums } from '@/types/database.types'

type Service = Tables<'services'>
type ServiceCategory = Enums<'service_category'>

/**
 * Composable for service catalog with Supabase
 */
export function useServicesSupabase() {
  const services = ref<Service[]>([])
  const currentService = ref<Service | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const categories = computed<ServiceCategory[]>(() => {
    const cats = new Set(services.value.map(s => s.category))
    return Array.from(cats) as ServiceCategory[]
  })

  const popularServices = computed(() =>
    services.value.filter(s => s.is_popular)
  )

  const servicesByCategory = computed(() => {
    const grouped: Record<string, Service[]> = {}
    for (const service of services.value) {
      if (!grouped[service.category]) {
        grouped[service.category] = []
      }
      grouped[service.category].push(service)
    }
    return grouped
  })

  /**
   * Fetch all active services
   */
  async function fetchServices() {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      if (fetchError) throw fetchError

      services.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch services'
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch a single service with details
   */
  async function fetchService(serviceIdOrSlug: string) {
    loading.value = true
    error.value = null

    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(serviceIdOrSlug)

      const { data, error: fetchError } = await supabase
        .from('services')
        .select(`
          *,
          questions:service_questions(*),
          tiers:service_tiers(*),
          options:service_options(*)
        `)
        .eq(isUUID ? 'id' : 'slug', serviceIdOrSlug)
        .single()

      if (fetchError) throw fetchError

      currentService.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch service'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Search services
   */
  async function searchServices(query: string) {
    try {
      const { data, error: searchError } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('is_popular', { ascending: false })
        .limit(10)

      if (searchError) throw searchError

      return data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Search failed'
      return []
    }
  }

  /**
   * Get services by category
   */
  async function fetchByCategory(category: ServiceCategory) {
    try {
      const { data, error: fetchError } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .eq('category', category)
        .order('display_order')

      if (fetchError) throw fetchError

      return data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch services'
      return []
    }
  }

  return {
    services,
    currentService,
    categories,
    popularServices,
    servicesByCategory,
    loading,
    error,
    fetchServices,
    fetchService,
    searchServices,
    fetchByCategory
  }
}
