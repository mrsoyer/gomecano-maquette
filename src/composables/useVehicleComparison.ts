/**
 * Vehicle Comparison Composable - Multi-vehicle expense comparison
 */

import { ref, computed } from 'vue'
import type { VehicleComparison, VehicleComparisonMetric } from '@/types/analytics'
import { getVehicleComparison } from '@/mocks/analytics.mock'

/**
 * Vehicle comparison composable
 * 
 * @param userId - User ID
 * @returns Comparison state and methods
 */
export function useVehicleComparison(userId: string) {
  const comparison = ref<VehicleComparison | null>(null)
  const selectedPeriod = ref<'month' | 'quarter' | 'year' | 'all'>('year')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const vehicles = computed(() => comparison.value?.vehicles || [])

  const mostExpensive = computed(() => {
    if (!comparison.value) return null
    return vehicles.value.find(v => v.vehicleId === comparison.value!.insights.mostExpensive)
  })

  const mostEfficient = computed(() => {
    if (!comparison.value) return null
    return vehicles.value.find(v => v.vehicleId === comparison.value!.insights.mostEfficient)
  })

  const totalExpenses = computed(() => 
    vehicles.value.reduce((sum, v) => sum + v.totalExpenses, 0)
  )

  const averageExpensePerVehicle = computed(() => {
    if (vehicles.value.length === 0) return 0
    return totalExpenses.value / vehicles.value.length
  })

  const sortedVehicles = computed(() => {
    return [...vehicles.value].sort((a, b) => b.totalExpenses - a.totalExpenses)
  })

  /**
   * Fetch comparison data
   */
  async function fetchComparison(period?: 'month' | 'quarter' | 'year' | 'all'): Promise<void> {
    isLoading.value = true
    error.value = null

    if (period) {
      selectedPeriod.value = period
    }

    try {
      console.log('[VehicleComparison] Fetching comparison for period:', selectedPeriod.value)
      comparison.value = await getVehicleComparison(userId, selectedPeriod.value)
      
      console.log('[VehicleComparison] Comparison loaded:', {
        vehicles: vehicles.value.length,
        totalExpenses: totalExpenses.value,
        period: selectedPeriod.value
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load comparison'
      console.error('[VehicleComparison] Error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get vehicle by ID
   */
  function getVehicle(vehicleId: string): VehicleComparisonMetric | undefined {
    return vehicles.value.find(v => v.vehicleId === vehicleId)
  }

  /**
   * Compare two vehicles
   */
  function compareVehicles(vehicleId1: string, vehicleId2: string) {
    const v1 = getVehicle(vehicleId1)
    const v2 = getVehicle(vehicleId2)

    if (!v1 || !v2) return null

    const expenseDiff = v1.totalExpenses - v2.totalExpenses
    const percentageDiff = ((expenseDiff / v2.totalExpenses) * 100).toFixed(1)

    return {
      vehicle1: v1,
      vehicle2: v2,
      expenseDifference: expenseDiff,
      percentageDifference: parseFloat(percentageDiff),
      moreExpensive: expenseDiff > 0 ? v1.vehicleName : v2.vehicleName,
      comparison: expenseDiff > 0
        ? `${v1.vehicleName} coûte ${Math.abs(expenseDiff)}€ de plus (${Math.abs(parseFloat(percentageDiff))}%)`
        : `${v2.vehicleName} coûte ${Math.abs(expenseDiff)}€ de plus (${Math.abs(parseFloat(percentageDiff))}%)`
    }
  }

  return {
    // State
    comparison,
    selectedPeriod,
    isLoading,
    error,

    // Computed
    vehicles,
    mostExpensive,
    mostEfficient,
    totalExpenses,
    averageExpensePerVehicle,
    sortedVehicles,

    // Methods
    fetchComparison,
    getVehicle,
    compareVehicles
  }
}

