import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  CompanyAccount,
  CompanySite,
  CompanyUser,
  FleetVehicle,
  FleetBudget,
  FleetAnalytics
} from '@/types/fleet'
import {
  getCompanyById,
  getCompanyUsers,
  getCompanyFleetVehicles,
  getFleetBudget,
  getFleetAnalytics,
  mockCompanySites
} from '@/mocks/companies'

/**
 * Fleet Store - Manages company fleet for B2B accounts
 */
export const useFleetStore = defineStore('fleet', () => {
  // State
  const company = ref<CompanyAccount | null>(null)
  const fleetVehicles = ref<FleetVehicle[]>([])
  const sites = ref<CompanySite[]>([])
  const companyUsers = ref<CompanyUser[]>([])
  const budget = ref<FleetBudget | null>(null)
  const analytics = ref<FleetAnalytics | null>(null)
  const selectedSite = ref<string | null>(null) // 'all' or site ID
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const totalVehicles = computed(() => fleetVehicles.value.length)
  
  const activeVehicles = computed(() =>
    fleetVehicles.value.filter(v => v.status === 'active').length
  )

  const maintenanceVehicles = computed(() =>
    fleetVehicles.value.filter(v => v.status === 'maintenance').length
  )

  const monthlySpend = computed(() => budget.value?.currentMonthSpent || 0)

  const monthlyBudget = computed(() => budget.value?.monthly || 0)

  const budgetUtilization = computed(() => {
    if (!budget.value || budget.value.monthly === 0) return 0
    return Math.round((budget.value.currentMonthSpent / budget.value.monthly) * 100)
  })

  const budgetAlerts = computed(() => budget.value?.alerts || [])

  const hasBudgetAlert = computed(() => budgetAlerts.value.length > 0)

  const totalSites = computed(() => sites.value.length)

  const totalUsers = computed(() => companyUsers.value.length)

  const activeUsers = computed(() =>
    companyUsers.value.filter(u => u.status === 'active').length
  )

  /**
   * Filtered vehicles by selected site
   */
  const filteredVehicles = computed(() => {
    if (!selectedSite.value || selectedSite.value === 'all') {
      return fleetVehicles.value
    }
    return fleetVehicles.value.filter(v => v.siteId === selectedSite.value)
  })

  /**
   * Fetch company data by ID
   * 
   * @param companyId - Company ID
   */
  async function fetchCompanyData(companyId: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      const data = getCompanyById(companyId)
      if (!data) {
        throw new Error('Company not found')
      }

      company.value = data
      sites.value = data.sites
      companyUsers.value = getCompanyUsers(companyId)

      console.log('[Fleet] Company data loaded:', data.name)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fetch failed'
      console.error('[Fleet] Fetch error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch fleet vehicles
   * 
   * @param companyId - Company ID
   */
  async function fetchFleetVehicles(companyId: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await new Promise(resolve => setTimeout(resolve, 400))

      fleetVehicles.value = getCompanyFleetVehicles(companyId)

      console.log('[Fleet] Vehicles loaded:', fleetVehicles.value.length)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fetch failed'
      console.error('[Fleet] Fetch vehicles error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch budget data
   * 
   * @param companyId - Company ID
   */
  async function fetchBudget(companyId: string): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      budget.value = getFleetBudget(companyId) || null

      console.log('[Fleet] Budget loaded')
    } catch (err) {
      console.error('[Fleet] Fetch budget error:', err)
    }
  }

  /**
   * Fetch analytics data
   * 
   * @param companyId - Company ID
   */
  async function fetchAnalytics(companyId: string): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      analytics.value = getFleetAnalytics(companyId) || null

      console.log('[Fleet] Analytics loaded')
    } catch (err) {
      console.error('[Fleet] Fetch analytics error:', err)
    }
  }

  /**
   * Fetch all fleet data
   * 
   * @param companyId - Company ID
   */
  async function fetchAllFleetData(companyId: string): Promise<void> {
    await Promise.all([
      fetchCompanyData(companyId),
      fetchFleetVehicles(companyId),
      fetchBudget(companyId),
      fetchAnalytics(companyId)
    ])
  }

  /**
   * Select site for filtering
   * 
   * @param siteId - Site ID or 'all'
   */
  function selectSite(siteId: string | null): void {
    selectedSite.value = siteId
    console.log('[Fleet] Site selected:', siteId || 'all')
  }

  /**
   * Add user to company
   * 
   * @param user - Company user to add
   */
  async function addUser(user: CompanyUser): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))

      companyUsers.value.push(user)

      console.log('[Fleet] User added:', user.email)
    } catch (err) {
      console.error('[Fleet] Add user error:', err)
    }
  }

  /**
   * Remove user from company
   * 
   * @param userId - User ID to remove
   */
  async function removeUser(userId: string): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))

      const index = companyUsers.value.findIndex(u => u.id === userId)
      if (index !== -1) {
        companyUsers.value.splice(index, 1)
      }

      console.log('[Fleet] User removed:', userId)
    } catch (err) {
      console.error('[Fleet] Remove user error:', err)
    }
  }

  /**
   * Update budget
   * 
   * @param updates - Budget updates
   */
  async function updateBudget(updates: Partial<FleetBudget>): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))

      if (budget.value) {
        budget.value = {
          ...budget.value,
          ...updates
        }
      }

      console.log('[Fleet] Budget updated')
    } catch (err) {
      console.error('[Fleet] Update budget error:', err)
    }
  }

  return {
    // State
    company,
    fleetVehicles,
    sites,
    companyUsers,
    budget,
    analytics,
    selectedSite,
    isLoading,
    error,

    // Getters
    totalVehicles,
    activeVehicles,
    maintenanceVehicles,
    monthlySpend,
    monthlyBudget,
    budgetUtilization,
    budgetAlerts,
    hasBudgetAlert,
    totalSites,
    totalUsers,
    activeUsers,
    filteredVehicles,

    // Actions
    fetchCompanyData,
    fetchFleetVehicles,
    fetchBudget,
    fetchAnalytics,
    fetchAllFleetData,
    selectSite,
    addUser,
    removeUser,
    updateBudget
  }
})
