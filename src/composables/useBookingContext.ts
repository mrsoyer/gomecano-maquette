import { ref, computed } from 'vue'
import { useLocalStorage } from '@/composables/useLocalStorage'
import type { Vehicle } from '@/types/vehicle'
import type { CityResult } from '@/composables/useGooglePlaces'

/**
 * Global shared state (singleton pattern)
 * Created once and shared across all component instances
 */
const savedVehicle = useLocalStorage<Vehicle | null>('booking-vehicle', null)
const savedCity = useLocalStorage<CityResult | null>('booking-city', null)
const isContextModalOpen = ref(false)
const preSelectedStep = ref<1 | 2 | 3 | null>(null)

/**
 * Composable to manage booking context (vehicle + city) across the app
 * Provides centralized access to saved vehicle and city from localStorage
 * 
 * Uses singleton pattern to share state across all component instances
 * 
 * @returns Booking context state and methods
 */
export function useBookingContext() {
  /**
   * Check if both vehicle and city are defined
   */
  const hasCompleteContext = computed(() => {
    return !!savedVehicle.value && !!savedCity.value
  })

  /**
   * Check if we can show personalized pricing
   * Currently only depends on vehicle, but could include city for geographic pricing
   */
  const hasPricing = computed(() => {
    return !!savedVehicle.value
  })

  /**
   * Open context modal (BookingAccordionModal)
   * 
   * @param step - Optional step to open directly (1=service, 2=city, 3=vehicle)
   */
  function openContextModal(step?: 1 | 2 | 3) {
    if (step) {
      preSelectedStep.value = step
    }
    isContextModalOpen.value = true
  }

  /**
   * Close context modal
   */
  function closeContextModal() {
    isContextModalOpen.value = false
    preSelectedStep.value = null
  }

  /**
   * Clear all context (vehicle + city)
   * Used for logout or reset
   */
  function clearContext() {
    savedVehicle.value = null
    savedCity.value = null
  }

  /**
   * Clear only vehicle
   */
  function clearVehicle() {
    savedVehicle.value = null
  }

  /**
   * Clear only city
   */
  function clearCity() {
    savedCity.value = null
  }

  return {
    // State
    savedVehicle,
    savedCity,
    // Computed
    hasCompleteContext,
    hasPricing,
    // Modal state
    isContextModalOpen,
    preSelectedStep,
    // Methods
    openContextModal,
    closeContextModal,
    clearContext,
    clearVehicle,
    clearCity
  }
}
