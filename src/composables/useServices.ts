import { useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { supabase } from '@/services/supabase'
import type { Service } from '@/types/service'

// ============================================
// Response Types from DB Functions
// ============================================

interface HomeServicesResponse {
  success: boolean
  data: Service[]
  count: number
  error?: string
}

interface HomeServiceResponse {
  success: boolean
  data: Service | null
  error?: string
}

interface HomeSearchResponse {
  success: boolean
  data: Service[]
  count: number
  query: string
  error?: string
}

// ============================================
// Fetch Functions
// ============================================

/**
 * Fetch all services
 * Uses home_get_services() DB function via RPC
 *
 * @returns Promise<Service[]>
 */
async function fetchServices(): Promise<Service[]> {
  const { data, error } = await supabase.rpc('home_get_services')

  if (error) {
    console.error('Error fetching services:', error)
    throw new Error(error.message)
  }

  const response = data as HomeServicesResponse
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch services')
  }

  return response.data
}

/**
 * Fetch service by slug
 * Uses home_get_service(p_slug) DB function via RPC
 *
 * @param slug - Service slug
 * @returns Promise<Service | null>
 */
async function fetchServiceBySlug(slug: string): Promise<Service | null> {
  const { data, error } = await supabase.rpc('home_get_service', {
    p_slug: slug
  })

  if (error) {
    console.error('Error fetching service:', error)
    throw new Error(error.message)
  }

  const response = data as HomeServiceResponse
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch service')
  }

  return response.data
}

/**
 * Fetch featured/recommended services
 * Uses home_get_featured_services(p_limit) DB function via RPC
 *
 * @param limit - Max number of services to return (default: 6)
 * @returns Promise<Service[]>
 */
async function fetchFeaturedServices(limit: number = 6): Promise<Service[]> {
  const { data, error } = await supabase.rpc('home_get_featured_services', {
    p_limit: limit
  })

  if (error) {
    console.error('Error fetching featured services:', error)
    throw new Error(error.message)
  }

  const response = data as HomeServicesResponse
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch featured services')
  }

  return response.data
}

/**
 * Search services by text query
 * Uses home_search_services(p_query) DB function via RPC
 *
 * @param query - Search query string
 * @returns Promise<Service[]>
 */
async function searchServices(query: string): Promise<Service[]> {
  const { data, error } = await supabase.rpc('home_search_services', {
    p_query: query
  })

  if (error) {
    console.error('Error searching services:', error)
    throw new Error(error.message)
  }

  const response = data as HomeSearchResponse
  if (!response.success) {
    throw new Error(response.error || 'Failed to search services')
  }

  return response.data
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
 * Composable to get recommended/featured services
 * Uses home_get_featured_services() DB function via RPC
 *
 * @param limit - Max number of services (default: 6)
 * @returns Query result with recommended services
 */
export function useRecommendedServices(limit: number = 6) {
  return useQuery({
    queryKey: ['services', 'recommended', limit],
    queryFn: () => fetchFeaturedServices(limit),
    staleTime: 10 * 60 * 1000 // Cache 10 minutes
  })
}

/**
 * Composable to search services
 * Uses home_search_services() DB function via RPC
 *
 * @param searchQuery - Search query (reactive)
 * @returns Query result with filtered services
 */
export function useServiceSearch(searchQuery: Ref<string>) {
  return useQuery({
    queryKey: ['services', 'search', searchQuery],
    queryFn: () => searchServices(searchQuery.value),
    enabled: computed(() => searchQuery.value.length >= 2)
  })
}
