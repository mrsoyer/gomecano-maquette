import { ref, computed } from 'vue'
import type { CompanySite } from '@/types/fleet'
import { supabase } from '@/services/supabase'
import { mockCompanySites } from '@/mocks/companies.mock'
import { transformSiteFromDB, transformSiteToDB } from '@/utils/b2b-transforms'

/**
 * Toggle for mock data vs Supabase
 */
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

/**
 * Extended site type with optional DB fields
 */
interface CompanySiteExtended extends CompanySite {
  is_active?: boolean
  is_main?: boolean
}

/**
 * Company sites management composable
 * Handles multi-site operations for B2B fleet management
 *
 * @returns Sites state, getters and actions
 */
export function useSites() {
  const sites = ref<CompanySiteExtended[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Active sites only
   */
  const activeSites = computed(() =>
    sites.value.filter(site => site.is_active !== false)
  )

  /**
   * Main site
   */
  const mainSite = computed(() =>
    sites.value.find(site => site.is_main === true) || null
  )

  /**
   * Sites grouped by region (based on city)
   */
  const sitesByRegion = computed(() => {
    const regions: Record<string, CompanySiteExtended[]> = {}

    activeSites.value.forEach(site => {
      const city = site.address?.city || 'Unknown'
      if (!regions[city]) {
        regions[city] = []
      }
      regions[city].push(site)
    })

    return regions
  })

  /**
   * Total vehicles count across all sites
   */
  const totalVehicles = computed(() =>
    sites.value.reduce((sum, site) => sum + (site.vehiclesCount || 0), 0)
  )

  /**
   * Fetch sites for a company
   *
   * @param companyId - Company ID
   */
  async function fetchSites(companyId: string): Promise<void> {
    loading.value = true
    error.value = null

    try {
      if (USE_MOCK_DATA) {
        // Mock data path
        await new Promise(resolve => setTimeout(resolve, 200))
        // Filter sites by company prefix (mock data convention)
        const companyPrefix = companyId === 'company-1' ? 'site-1' : 'site-2'
        sites.value = mockCompanySites.filter(s => s.id.startsWith(companyPrefix))
        return
      }

      // Supabase RPC path
      const { data, error: rpcError } = await supabase.rpc('b2b_get_sites', {
        p_company_id: companyId
      })

      if (rpcError) {
        throw new Error(rpcError.message)
      }

      sites.value = Array.isArray(data)
        ? data.map((item: Record<string, unknown>) => transformSiteFromDB(item))
        : []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('[useSites] fetchSites error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new site
   *
   * @param companyId - Company ID
   * @param site - Site data
   */
  async function createSite(
    companyId: string,
    site: Omit<CompanySite, 'id' | 'vehiclesCount'>
  ): Promise<CompanySite | null> {
    loading.value = true
    error.value = null

    try {
      if (USE_MOCK_DATA) {
        // Mock data path
        await new Promise(resolve => setTimeout(resolve, 200))
        const newSite: CompanySite = {
          ...site,
          id: `site-${Date.now()}`,
          vehiclesCount: 0
        }
        sites.value.push(newSite)
        return newSite
      }

      // Supabase RPC path
      const { data, error: rpcError } = await supabase.rpc('b2b_create_site', {
        p_company_id: companyId,
        p_site_data: transformSiteToDB(site)
      })

      if (rpcError) {
        throw new Error(rpcError.message)
      }

      const newSite = transformSiteFromDB(data as Record<string, unknown>)
      sites.value.push(newSite)
      return newSite
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('[useSites] createSite error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Update a site
   *
   * @param siteId - Site ID
   * @param updates - Partial site data
   */
  async function updateSite(siteId: string, updates: Partial<CompanySite>): Promise<void> {
    loading.value = true
    error.value = null

    try {
      if (USE_MOCK_DATA) {
        // Mock data path
        await new Promise(resolve => setTimeout(resolve, 200))
        const index = sites.value.findIndex(s => s.id === siteId)
        if (index !== -1) {
          sites.value[index] = { ...sites.value[index], ...updates }
        }
        return
      }

      // Supabase RPC path
      const { data, error: rpcError } = await supabase.rpc('b2b_update_site', {
        p_site_id: siteId,
        p_updates: transformSiteToDB(updates)
      })

      if (rpcError) {
        throw new Error(rpcError.message)
      }

      // Update local state
      const index = sites.value.findIndex(s => s.id === siteId)
      if (index !== -1) {
        sites.value[index] = transformSiteFromDB(data as Record<string, unknown>)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('[useSites] updateSite error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a site (soft delete: set is_active = false)
   *
   * @param siteId - Site ID
   */
  async function deleteSite(siteId: string): Promise<void> {
    loading.value = true
    error.value = null

    try {
      if (USE_MOCK_DATA) {
        // Mock data path - remove from local state
        await new Promise(resolve => setTimeout(resolve, 200))
        sites.value = sites.value.filter(s => s.id !== siteId)
        return
      }

      // Supabase RPC path
      const { error: rpcError } = await supabase.rpc('b2b_delete_site', {
        p_site_id: siteId
      })

      if (rpcError) {
        throw new Error(rpcError.message)
      }

      // Remove from local state
      sites.value = sites.value.filter(s => s.id !== siteId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('[useSites] deleteSite error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Get site by ID
   *
   * @param siteId - Site ID
   */
  function getSiteById(siteId: string): CompanySite | undefined {
    return sites.value.find(site => site.id === siteId)
  }

  /**
   * Clear sites state
   */
  function clearSites(): void {
    sites.value = []
    error.value = null
  }

  return {
    // State
    sites,
    loading,
    error,

    // Getters
    activeSites,
    mainSite,
    sitesByRegion,
    totalVehicles,

    // Actions
    fetchSites,
    createSite,
    updateSite,
    deleteSite,
    getSiteById,
    clearSites
  }
}
