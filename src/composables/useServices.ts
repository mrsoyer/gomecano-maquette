import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { mockServices } from '@/mocks/services'
import type { Service } from '@/types/service'
// import { supabase } from '@/services/supabase'  // Pour /website/

/**
 * Configuration - Toggle between mock and real API
 * Maquette : true
 * Website : false
 */
const USE_MOCK_DATA = true

/**
 * Fetch all services
 * 
 * @returns Promise<Service[]>
 */
async function fetchServices(): Promise<Service[]> {
  if (USE_MOCK_DATA) {
    // MAQUETTE : Mock data avec délai simulé
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockServices
  }
  
  // WEBSITE : Supabase (décommentez pour production)
  // const { data, error } = await supabase
  //   .from('services')
  //   .select('*')
  //   .order('category', { ascending: true })
  // 
  // if (error) throw new Error(error.message)
  // return data as Service[]
  
  return []
}

/**
 * Fetch service by slug
 * 
 * @param slug - Service slug
 * @returns Promise<Service | null>
 */
async function fetchServiceBySlug(slug: string): Promise<Service | null> {
  if (USE_MOCK_DATA) {
    // MAQUETTE : Mock data
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockServices.find(s => s.slug === slug) || null
  }
  
  // WEBSITE : Supabase
  // const { data, error } = await supabase
  //   .from('services')
  //   .select('*')
  //   .eq('slug', slug)
  //   .single()
  // 
  // if (error) throw new Error(error.message)
  // return data as Service
  
  return null
}

/**
 * Composable to fetch all services with TanStack Query
 * Provides automatic caching, refetching, and state management
 * 
 * @returns Query result with services, loading state, error
 */
export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: fetchServices,
    staleTime: 5 * 60 * 1000  // Cache 5 minutes
  })
}

/**
 * Composable to fetch a single service by slug
 * 
 * @param slug - Service slug (reactive)
 * @returns Query result with service, loading state, error
 */
export function useService(slug: Ref<string>) {
  return useQuery({
    queryKey: ['service', slug],
    queryFn: () => fetchServiceBySlug(slug.value),
    enabled: computed(() => !!slug.value)
  })
}

/**
 * Composable to get recommended services
 * 
 * @returns Query result with recommended services
 */
export function useRecommendedServices() {
  return useQuery({
    queryKey: ['services', 'recommended'],
    queryFn: async () => {
      const allServices = await fetchServices()
      return allServices.filter(s => s.recommended === true)
    },
    staleTime: 10 * 60 * 1000  // Cache 10 minutes (change moins souvent)
  })
}

/**
 * Composable to search services (future)
 * 
 * @param searchQuery - Search query (reactive)
 * @returns Query result with filtered services
 */
export function useServiceSearch(searchQuery: Ref<string>) {
  return useQuery({
    queryKey: ['services', 'search', searchQuery],
    queryFn: async () => {
      const allServices = await fetchServices()
      const query = searchQuery.value.toLowerCase().trim()
      
      if (!query) return allServices
      
      return allServices.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)
      )
    },
    enabled: computed(() => searchQuery.value.length >= 2)
  })
}
