import { ref, computed } from 'vue'
import type { CompanyAccount } from '@/types/fleet'
import { supabase } from '@/services/supabase'
import { getCompanyById } from '@/mocks/companies.mock'
import { transformCompanyFromDB } from '@/utils/b2b-transforms'

/**
 * Toggle for mock data vs Supabase
 */
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

/**
 * Company management composable
 * Handles company account data and operations for B2B
 *
 * @returns Company state, getters and actions
 */
export function useCompany() {
  const company = ref<CompanyAccount | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Is company loaded
   */
  const isLoaded = computed(() => !!company.value)

  /**
   * Company name
   */
  const companyName = computed(() => company.value?.name || '')

  /**
   * Active subscription plan
   */
  const subscriptionPlan = computed(() => company.value?.subscription.plan || null)

  /**
   * Is subscription active
   */
  const isSubscriptionActive = computed(
    () => company.value?.subscription.status === 'active'
  )

  /**
   * Max vehicles allowed
   */
  const maxVehicles = computed(() => company.value?.subscription.maxVehicles || 0)

  /**
   * Max users allowed
   */
  const maxUsers = computed(() => company.value?.subscription.maxUsers || 0)

  /**
   * Current vehicle count
   */
  const currentVehicleCount = computed(() => {
    return company.value?.sites.reduce((sum, site) => sum + (site.vehiclesCount || 0), 0) || 0
  })

  /**
   * Current user count
   */
  const currentUserCount = computed(() => company.value?.users.length || 0)

  /**
   * Fetch company data
   *
   * @param companyId - Company ID
   */
  async function fetchCompany(companyId: string): Promise<void> {
    loading.value = true
    error.value = null

    try {
      if (USE_MOCK_DATA) {
        // Mock data path
        await new Promise(resolve => setTimeout(resolve, 300))
        const data = getCompanyById(companyId)
        if (!data) {
          throw new Error('Company not found')
        }
        company.value = data
        return
      }

      // Supabase RPC path
      const { data, error: rpcError } = await supabase.rpc('b2b_get_company', {
        p_company_id: companyId
      })

      if (rpcError) {
        throw new Error(rpcError.message)
      }

      if (!data) {
        throw new Error('Company not found')
      }

      company.value = transformCompanyFromDB(data as Record<string, unknown>)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('[useCompany] fetchCompany error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Update company settings
   *
   * @param updates - Partial company data
   */
  async function updateCompany(updates: Partial<CompanyAccount>): Promise<void> {
    if (!company.value) {
      error.value = 'No company loaded'
      return
    }

    loading.value = true
    error.value = null

    try {
      if (USE_MOCK_DATA) {
        // Mock data path - just update local state
        await new Promise(resolve => setTimeout(resolve, 200))
        company.value = { ...company.value, ...updates }
        return
      }

      // Supabase RPC path
      const updatePayload: Record<string, unknown> = {}
      if (updates.name) updatePayload.name = updates.name
      if (updates.settings) {
        updatePayload.auto_approve_under = updates.settings.autoApproveUnder
        updatePayload.requires_approval = updates.settings.requiresApproval
        updatePayload.email_notifications = updates.settings.emailNotifications
        updatePayload.sms_notifications = updates.settings.smsNotifications
        updatePayload.maintenance_alerts = updates.settings.maintenanceAlerts
      }

      const { data, error: rpcError } = await supabase.rpc('b2b_update_company', {
        p_company_id: company.value.id,
        p_updates: updatePayload
      })

      if (rpcError) {
        throw new Error(rpcError.message)
      }

      company.value = transformCompanyFromDB(data as Record<string, unknown>)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('[useCompany] updateCompany error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Clear company state
   */
  function clearCompany(): void {
    company.value = null
    error.value = null
  }

  return {
    // State
    company,
    loading,
    error,

    // Getters
    isLoaded,
    companyName,
    subscriptionPlan,
    isSubscriptionActive,
    maxVehicles,
    maxUsers,
    currentVehicleCount,
    currentUserCount,

    // Actions
    fetchCompany,
    updateCompany,
    clearCompany
  }
}
