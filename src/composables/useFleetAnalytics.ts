import { computed, type Ref } from 'vue'
import type { FleetVehicle, FleetAnalytics } from '@/types/fleet'

/**
 * Fleet analytics composable
 * Calculates KPIs and analytics for fleet management
 * 
 * @param vehicles - Fleet vehicles ref
 * @returns Computed analytics and KPIs
 */
export function useFleetAnalytics(vehicles: Ref<FleetVehicle[]>) {
  /**
   * Total vehicles count
   */
  const totalVehicles = computed(() => vehicles.value.length)

  /**
   * Active vehicles count (status = 'active')
   */
  const activeVehicles = computed(() =>
    vehicles.value.filter(v => v.status === 'active').length
  )

  /**
   * Vehicles in maintenance
   */
  const maintenanceVehicles = computed(() =>
    vehicles.value.filter(v => v.status === 'maintenance').length
  )

  /**
   * Total maintenance costs (all vehicles)
   */
  const totalMaintenanceCosts = computed(() =>
    vehicles.value.reduce((sum, v) => sum + v.maintenanceCosts, 0)
  )

  /**
   * Average maintenance cost per vehicle
   */
  const averageMaintenanceCost = computed(() => {
    if (totalVehicles.value === 0) return 0
    return Math.round(totalMaintenanceCosts.value / totalVehicles.value)
  })

  /**
   * Total costs (maintenance + other)
   */
  const totalCosts = computed(() =>
    vehicles.value.reduce((sum, v) => sum + v.totalCosts, 0)
  )

  /**
   * Top 5 spending vehicles
   */
  const topSpendingVehicles = computed(() =>
    [...vehicles.value]
      .sort((a, b) => b.totalCosts - a.totalCosts)
      .slice(0, 5)
  )

  /**
   * Vehicles grouped by category
   */
  const vehiclesByCategory = computed(() => {
    const categories: Record<string, number> = {}
    vehicles.value.forEach(v => {
      categories[v.category] = (categories[v.category] || 0) + 1
    })
    return categories
  })

  /**
   * Vehicles grouped by site
   */
  const vehiclesBySite = computed(() => {
    const sites: Record<string, FleetVehicle[]> = {}
    vehicles.value.forEach(v => {
      if (!sites[v.siteId]) {
        sites[v.siteId] = []
      }
      sites[v.siteId].push(v)
    })
    return sites
  })

  /**
   * Average vehicle age
   */
  const averageVehicleAge = computed(() => {
    if (totalVehicles.value === 0) return 0
    const currentYear = new Date().getFullYear()
    const totalAge = vehicles.value.reduce((sum, v) => sum + (currentYear - v.year), 0)
    return Math.round(totalAge / totalVehicles.value * 10) / 10
  })

  /**
   * Total mileage (all vehicles)
   */
  const totalMileage = computed(() =>
    vehicles.value.reduce((sum, v) => sum + (v.mileage || 0), 0)
  )

  /**
   * Average mileage per vehicle
   */
  const averageMileage = computed(() => {
    if (totalVehicles.value === 0) return 0
    return Math.round(totalMileage.value / totalVehicles.value)
  })

  /**
   * Cost per km (approximation)
   */
  const costPerKm = computed(() => {
    if (totalMileage.value === 0) return 0
    return Math.round((totalCosts.value / totalMileage.value) * 100) / 100
  })

  /**
   * Vehicle utilization rate (mock)
   */
  const vehicleUtilization = computed(() => {
    // Mock: Between 75-95%
    return Math.round(75 + Math.random() * 20)
  })

  /**
   * Downtime percentage (mock)
   */
  const downtime = computed(() => {
    // Mock: Between 1-5%
    return Math.round((1 + Math.random() * 4) * 10) / 10
  })

  return {
    // Counts
    totalVehicles,
    activeVehicles,
    maintenanceVehicles,

    // Costs
    totalMaintenanceCosts,
    averageMaintenanceCost,
    totalCosts,
    costPerKm,

    // Top lists
    topSpendingVehicles,

    // Grouping
    vehiclesByCategory,
    vehiclesBySite,

    // Stats
    averageVehicleAge,
    totalMileage,
    averageMileage,
    vehicleUtilization,
    downtime
  }
}
