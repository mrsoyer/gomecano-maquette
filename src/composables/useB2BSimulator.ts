import { ref, computed } from 'vue'

/**
 * Simulator inputs
 */
export interface SimulatorInputs {
  fleetSize: number
  averageKmPerYear: number
  currentMaintenanceCostPerVehicle: number
}

/**
 * Simulator results
 */
export interface SimulatorResults {
  currentAnnualCost: number
  gomecanoAnnualCost: number
  annualSavings: number
  savingsPercent: number
  monthlyPaymentGomecano: number
  roiMonths: number
  co2Savings: number
}

/**
 * B2B fleet cost simulator composable
 * Calculates ROI and savings for Gomecano B2B offering
 * 
 * @returns Simulator state and calculations
 */
export function useB2BSimulator() {
  // Inputs
  const fleetSize = ref(10)
  const averageKmPerYear = ref(15000)
  const currentMaintenanceCostPerVehicle = ref(800)

  // Constants
  const GOMECANO_DISCOUNT_RATE = 0.30 // 30% savings
  const AVERAGE_DOWNTIME_HOURS_TRADITIONAL = 4
  const AVERAGE_DOWNTIME_HOURS_GOMECANO = 0.5
  const HOURLY_COST_DOWNTIME = 50 // €/hour
  const CO2_PER_KM_SAVED = 0.02 // kg CO2 saved per km (less travel to garage)

  /**
   * Current annual maintenance cost
   */
  const currentAnnualCost = computed(() => 
    fleetSize.value * currentMaintenanceCostPerVehicle.value
  )

  /**
   * Gomecano annual cost (with discount)
   */
  const gomecanoAnnualCost = computed(() => 
    Math.round(currentAnnualCost.value * (1 - GOMECANO_DISCOUNT_RATE))
  )

  /**
   * Annual savings
   */
  const annualSavings = computed(() => 
    currentAnnualCost.value - gomecanoAnnualCost.value
  )

  /**
   * Savings percentage
   */
  const savingsPercent = computed(() => 
    Math.round((annualSavings.value / currentAnnualCost.value) * 100)
  )

  /**
   * Monthly payment with Gomecano
   */
  const monthlyPaymentGomecano = computed(() => 
    Math.round(gomecanoAnnualCost.value / 12)
  )

  /**
   * Downtime cost savings
   */
  const downtimeSavings = computed(() => {
    const traditionalDowntimeCost = 
      fleetSize.value * AVERAGE_DOWNTIME_HOURS_TRADITIONAL * HOURLY_COST_DOWNTIME * 3 // 3 interventions/year average
    
    const gomecanoDowntimeCost = 
      fleetSize.value * AVERAGE_DOWNTIME_HOURS_GOMECANO * HOURLY_COST_DOWNTIME * 3
    
    return Math.round(traditionalDowntimeCost - gomecanoDowntimeCost)
  })

  /**
   * Total annual savings (maintenance + downtime)
   */
  const totalAnnualSavings = computed(() => 
    annualSavings.value + downtimeSavings.value
  )

  /**
   * ROI in months (setup cost amortization)
   */
  const roiMonths = computed(() => {
    const setupCost = 500 // One-time setup cost
    const monthlySavings = totalAnnualSavings.value / 12
    
    if (monthlySavings <= 0) return 0
    
    return Math.round((setupCost / monthlySavings) * 10) / 10
  })

  /**
   * CO2 savings estimate (kg/year)
   */
  const co2Savings = computed(() => {
    // Less km driven to garage
    const avgKmToGarage = 10
    const interventionsPerYear = 3
    const totalKmSaved = fleetSize.value * avgKmToGarage * 2 * interventionsPerYear // round trip
    
    return Math.round(totalKmSaved * CO2_PER_KM_SAVED)
  })

  /**
   * Get complete simulator results
   */
  const results = computed<SimulatorResults>(() => ({
    currentAnnualCost: currentAnnualCost.value,
    gomecanoAnnualCost: gomecanoAnnualCost.value,
    annualSavings: totalAnnualSavings.value,
    savingsPercent: savingsPercent.value,
    monthlyPaymentGomecano: monthlyPaymentGomecano.value,
    roiMonths: roiMonths.value,
    co2Savings: co2Savings.value
  }))

  /**
   * Update inputs
   * 
   * @param inputs - Simulator inputs
   */
  function updateInputs(inputs: Partial<SimulatorInputs>): void {
    if (inputs.fleetSize !== undefined) {
      fleetSize.value = Math.max(1, Math.min(1000, inputs.fleetSize))
    }
    if (inputs.averageKmPerYear !== undefined) {
      averageKmPerYear.value = Math.max(1000, Math.min(100000, inputs.averageKmPerYear))
    }
    if (inputs.currentMaintenanceCostPerVehicle !== undefined) {
      currentMaintenanceCostPerVehicle.value = Math.max(100, Math.min(5000, inputs.currentMaintenanceCostPerVehicle))
    }
  }

  /**
   * Reset to defaults
   */
  function reset(): void {
    fleetSize.value = 10
    averageKmPerYear.value = 15000
    currentMaintenanceCostPerVehicle.value = 800
  }

  /**
   * Get shareable quote data
   */
  function getQuoteData() {
    return {
      inputs: {
        fleetSize: fleetSize.value,
        averageKmPerYear: averageKmPerYear.value,
        currentMaintenanceCostPerVehicle: currentMaintenanceCostPerVehicle.value
      },
      results: results.value,
      createdAt: new Date().toISOString()
    }
  }

  return {
    // Inputs
    fleetSize,
    averageKmPerYear,
    currentMaintenanceCostPerVehicle,

    // Results
    results,
    currentAnnualCost,
    gomecanoAnnualCost,
    annualSavings,
    savingsPercent,
    monthlyPaymentGomecano,
    downtimeSavings,
    totalAnnualSavings,
    roiMonths,
    co2Savings,

    // Actions
    updateInputs,
    reset,
    getQuoteData
  }
}
