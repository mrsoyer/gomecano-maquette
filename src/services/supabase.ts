import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Re-export types for convenience
export type { Database } from '@/types/database.types'
export * from '@/types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.')
}

/**
 * Supabase client instance for frontend operations
 * Uses anon key with RLS policies for security
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  return user
}

/**
 * Get current session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error getting session:', error)
    return null
  }
  return session
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

// ============================================
// RPC Helpers
// ============================================

/**
 * Call a Supabase RPC function with typed response
 * @param functionName - Name of the database function
 * @param params - Function parameters
 */
export async function callRpc<T>(
  functionName: string,
  params?: Record<string, unknown>
): Promise<{ data: T | null; error: Error | null }> {
  const { data, error } = await supabase.rpc(functionName, params)

  if (error) {
    console.error(`RPC error (${functionName}):`, error)
    return { data: null, error: new Error(error.message) }
  }

  return { data: data as T, error: null }
}

// ============================================
// Edge Function Helpers
// ============================================

interface EdgeFunctionResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

/**
 * Call a Supabase Edge Function
 * @param functionName - Name of the edge function
 * @param body - Request body
 * @param options - Additional fetch options
 */
export async function callEdgeFunction<T>(
  functionName: string,
  body?: Record<string, unknown>,
  options?: { method?: 'GET' | 'POST' | 'PUT' | 'DELETE' }
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.functions.invoke<EdgeFunctionResponse<T>>(
      functionName,
      {
        body,
        method: options?.method || 'POST',
      }
    )

    if (error) {
      console.error(`Edge function error (${functionName}):`, error)
      return { data: null, error: new Error(error.message) }
    }

    if (data && !data.success && data.error) {
      return { data: null, error: new Error(data.error.message) }
    }

    return { data: data?.data || null, error: null }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Edge function exception (${functionName}):`, err)
    return { data: null, error: new Error(errorMessage) }
  }
}

// ============================================
// Core Reference Data Helpers
// ============================================

export interface VehicleMake {
  id: string
  name: string
  slug: string
  logo_url: string | null
  country: string | null
  is_active: boolean
}

export interface VehicleModel {
  id: string
  make_id: string
  name: string
  slug: string
  start_year: number | null
  end_year: number | null
}

export interface ServiceCategory {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  display_order: number
  services_count: number
}

export interface PartsCatalogItem {
  id: string
  reference: string
  name: string
  description: string | null
  brand: string | null
  category: string | null
  quality: string | null
  price: number
  image_url: string | null
  total_count: number
}

/**
 * Get all vehicle makes
 */
export async function getVehicleMakes() {
  return callRpc<VehicleMake[]>('core_get_vehicle_makes')
}

/**
 * Get vehicle models by make
 * @param makeIdOrSlug - Make ID (UUID) or slug
 */
export async function getVehicleModels(makeIdOrSlug: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(makeIdOrSlug)

  return callRpc<VehicleModel[]>('core_get_vehicle_models', {
    p_make_id: isUuid ? makeIdOrSlug : null,
    p_make_slug: isUuid ? null : makeIdOrSlug,
  })
}

/**
 * Get all service categories
 */
export async function getServiceCategories() {
  return callRpc<ServiceCategory[]>('core_get_service_categories')
}

/**
 * Get parts catalog with filters
 */
export async function getPartsCatalog(filters?: {
  category?: string
  brand?: string
  search?: string
  limit?: number
  offset?: number
}) {
  return callRpc<PartsCatalogItem[]>('core_get_parts_catalog', {
    p_category: filters?.category || null,
    p_brand: filters?.brand || null,
    p_search: filters?.search || null,
    p_limit: filters?.limit || 50,
    p_offset: filters?.offset || 0,
  })
}

// ============================================
// Session 10: Core Utils Helpers
// ============================================

export type SearchType = 'services' | 'blog' | 'faq' | 'mechanics'

export interface SearchResultItem {
  id: string
  type: string
  title: string
  description: string
  url?: string
  category?: string
  price_from?: number
  icon?: string
  image?: string
  published_at?: string
  reading_time?: number
  name?: string
  rating?: number
  reviews_count?: number
  specialties?: string[]
  years_experience?: number
}

export interface GlobalSearchResult {
  services: SearchResultItem[]
  blog: SearchResultItem[]
  faq: SearchResultItem[]
  mechanics: SearchResultItem[]
  total_count: number
  query: string
  error?: string
}

export interface AvailableMechanic {
  id: string
  profile_id: string
  name: string
  avatar_url: string | null
  rating: number
  reviews_count: number
  specialties: string[]
  certifications: string[]
  years_experience: number
  completed_jobs: number
  distance_km: number
  available_slots: Array<{ start: string; end: string }>
}

export interface MechanicsAvailableResult {
  mechanics: AvailableMechanic[]
  date: string
  location: { lat: number; lng: number }
  total_found: number
  error?: string
}

/**
 * Global search across services, blog, FAQ, and mechanics
 * @param query - Search term (min 2 characters)
 * @param types - Types to search (default: all)
 * @param limit - Max results per type (default: 5)
 */
export async function searchGlobal(
  query: string,
  types: SearchType[] = ['services', 'blog', 'faq', 'mechanics'],
  limit = 5
) {
  return callRpc<GlobalSearchResult>('core_search_global', {
    p_query: query,
    p_types: types,
    p_limit: limit,
  })
}

/**
 * Find available mechanics by location and date
 * @param latitude - Location latitude
 * @param longitude - Location longitude
 * @param date - Appointment date (YYYY-MM-DD)
 * @param serviceCategory - Optional service category filter
 * @param limit - Max results (default: 10)
 */
export async function getMechanicsAvailable(
  latitude: number,
  longitude: number,
  date: string,
  serviceCategory?: string,
  limit = 10
) {
  return callRpc<MechanicsAvailableResult>('core_get_mechanics_available', {
    p_latitude: latitude,
    p_longitude: longitude,
    p_date: date,
    p_service_category: serviceCategory || null,
    p_limit: limit,
  })
}
