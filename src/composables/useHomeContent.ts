import { useQuery } from '@tanstack/vue-query'
import { supabase } from '@/services/supabase'
import type { Testimonial } from '@/types/composables.types'

// ============================================
// Types
// ============================================

/**
 * Homepage statistic item
 */
export interface HomeStat {
  key: string
  value: string
  label: string
  icon?: string
}

/**
 * Response type from home_get_testimonials()
 */
interface HomeTestimonialsResponse {
  success: boolean
  data: Testimonial[]
  count: number
  error?: string
}

/**
 * Response type from home_get_stats()
 */
interface HomeStatsResponse {
  success: boolean
  data: HomeStat[]
  count: number
  error?: string
}

// ============================================
// Fetch Functions
// ============================================

/**
 * Fetch testimonials for homepage
 * Uses home_get_testimonials(p_limit) DB function via RPC
 *
 * @param limit - Max number of testimonials (default: 6)
 * @returns Promise<Testimonial[]>
 */
async function fetchHomeTestimonials(limit: number = 6): Promise<Testimonial[]> {
  // Type assertion needed because RPC types are not auto-generated
  const { data, error } = await (supabase.rpc as CallableFunction)('home_get_testimonials', {
    p_limit: limit
  })

  if (error) {
    console.error('Error fetching testimonials:', error)
    throw new Error(error.message)
  }

  const response = data as HomeTestimonialsResponse
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch testimonials')
  }

  return response.data
}

/**
 * Fetch homepage statistics
 * Uses home_get_stats() DB function via RPC
 *
 * @returns Promise<HomeStat[]>
 */
async function fetchHomeStats(): Promise<HomeStat[]> {
  // Type assertion needed because RPC types are not auto-generated
  const { data, error } = await (supabase.rpc as CallableFunction)('home_get_stats')

  if (error) {
    console.error('Error fetching stats:', error)
    throw new Error(error.message)
  }

  const response = data as HomeStatsResponse
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch stats')
  }

  return response.data
}

// ============================================
// Composables
// ============================================

/**
 * Composable to fetch homepage testimonials with TanStack Query
 * Uses home_get_testimonials() DB function via RPC
 *
 * @param limit - Max number of testimonials (default: 6)
 * @returns Query result with testimonials, loading state, error
 */
export function useHomeTestimonials(limit: number = 6) {
  return useQuery({
    queryKey: ['home', 'testimonials', limit],
    queryFn: () => fetchHomeTestimonials(limit),
    staleTime: 10 * 60 * 1000 // Cache 10 minutes
  })
}

/**
 * Composable to fetch homepage statistics with TanStack Query
 * Uses home_get_stats() DB function via RPC
 *
 * @returns Query result with stats, loading state, error
 */
export function useHomeStats() {
  return useQuery({
    queryKey: ['home', 'stats'],
    queryFn: fetchHomeStats,
    staleTime: 30 * 60 * 1000 // Cache 30 minutes (stats change rarely)
  })
}
