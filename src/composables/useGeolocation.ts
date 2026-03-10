import { ref, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * Geolocation coordinates
 */
export interface GeoCoordinates {
  lat: number
  lng: number
}

/**
 * Mock GPS tracking for mechanic location
 * Simulates mechanic moving towards client location
 * 
 * @param mechanicId - Mechanic ID
 * @param isActive - Whether tracking is active
 * @returns Reactive location data with ETA
 */
export function useGeolocation(mechanicId: string, isActive: Ref<boolean> | boolean) {
  const mechanicLocation = ref<GeoCoordinates | null>(null)
  const estimatedArrival = ref<number>(15) // minutes
  const isTracking = ref(false)

  let locationInterval: NodeJS.Timeout | null = null

  /**
   * Initialize mock GPS tracking
   * Starts with mechanic 5km away, moves closer every 10s
   */
  function initTracking(): void {
    const shouldTrack = typeof isActive === 'boolean' ? isActive : isActive.value
    if (!shouldTrack) return

    isTracking.value = true

    // Mock: Start 5km away from client (Paris coordinates)
    const clientLat = 48.8566
    const clientLng = 2.3522
    const offsetLat = 0.045 // ~5km
    const offsetLng = 0.045

    mechanicLocation.value = {
      lat: clientLat + offsetLat,
      lng: clientLng + offsetLng
    }

    estimatedArrival.value = 15

    // Update location every 10 seconds
    locationInterval = setInterval(() => {
      if (!mechanicLocation.value) return

      // Move closer to client
      const distanceLat = clientLat - mechanicLocation.value.lat
      const distanceLng = clientLng - mechanicLocation.value.lng

      mechanicLocation.value.lat += distanceLat * 0.1
      mechanicLocation.value.lng += distanceLng * 0.1

      // Update ETA
      estimatedArrival.value = Math.max(0, estimatedArrival.value - 1)

      console.log('[GPS] Mechanic location updated:', mechanicLocation.value, 'ETA:', estimatedArrival.value)

      // Stop tracking when arrived
      if (estimatedArrival.value === 0) {
        stopTracking()
      }
    }, 10000) // Every 10 seconds
  }

  /**
   * Stop GPS tracking
   */
  function stopTracking(): void {
    if (locationInterval) {
      clearInterval(locationInterval)
      locationInterval = null
    }
    isTracking.value = false
  }

  /**
   * Update location manually (mock)
   */
  function updateLocation(lat: number, lng: number): void {
    mechanicLocation.value = { lat, lng }
  }

  // Lifecycle
  onMounted(() => {
    initTracking()
  })

  onUnmounted(() => {
    stopTracking()
  })

  return {
    mechanicLocation,
    estimatedArrival,
    isTracking,
    updateLocation,
    stopTracking
  }
}
