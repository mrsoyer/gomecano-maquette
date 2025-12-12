import { ref } from 'vue'

/**
 * Interface for city result
 */
export interface CityResult {
  name: string
  postalCode: string
  formattedAddress: string
}

/**
 * Composable to use Google Places API for postal code search
 * 
 * @returns Methods and state for Google Places search
 */
export function useGooglePlaces() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const cities = ref<CityResult[]>([])

  /**
   * Search cities by postal code using Google Geocoding API
   * 
   * @param postalCode - French postal code (5 digits)
   */
  async function searchByPostalCode(postalCode: string): Promise<void> {
    // Reset state
    error.value = null
    cities.value = []

    // Validate postal code format (5 digits)
    if (!/^\d{5}$/.test(postalCode)) {
      error.value = 'Code postal invalide (5 chiffres requis)'
      return
    }

    isLoading.value = true

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      
      if (!apiKey) {
        throw new Error('Google Maps API key is missing')
      }

      // Use Geocoding API with postal code and country restriction
      // Also search for all localities with this postal code
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${postalCode},France&components=postal_code:${postalCode}|country:FR&key=${apiKey}`
      
      const response = await fetch(url)
      const data = await response.json()

      console.log('Google Maps API Response:', data) // Debug log

      if (data.status === 'OK' && data.results.length > 0) {
        const cityResults: CityResult[] = []

        data.results.forEach((result: any) => {
          const postalCodeComponent = result.address_components.find(
            (component: any) => component.types.includes('postal_code')
          )

          const postalCodeValue = postalCodeComponent?.long_name || postalCode

          // Check if there are multiple cities for this postal code
          if (result.postcode_localities && Array.isArray(result.postcode_localities)) {
            // Add all cities from postcode_localities
            result.postcode_localities.forEach((cityName: string) => {
              cityResults.push({
                name: cityName,
                postalCode: postalCodeValue,
                formattedAddress: `${postalCodeValue} ${cityName}, France`
              })
            })
          } else {
            // Fallback: get city from address_components
            const localityComponent = result.address_components.find(
              (component: any) => component.types.includes('locality')
            )

            const cityName = localityComponent?.long_name

            if (cityName) {
              cityResults.push({
                name: cityName,
                postalCode: postalCodeValue,
                formattedAddress: result.formatted_address
              })
            }
          }
        })

        // Remove duplicates based on city name
        const uniqueCities = cityResults.filter(
          (city, index, self) => 
            index === self.findIndex((c) => c.name === city.name)
        )

        cities.value = uniqueCities

        console.log('Cities found:', cities.value) // Debug log

        if (cities.value.length === 0) {
          error.value = 'Aucune ville trouvée pour ce code postal'
        }
      } else if (data.status === 'ZERO_RESULTS') {
        error.value = 'Aucune ville trouvée pour ce code postal'
      } else {
        throw new Error(data.error_message || 'Erreur de recherche')
      }
    } catch (err) {
      console.error('Error searching postal code:', err)
      error.value = err instanceof Error ? err.message : 'Erreur lors de la recherche'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clear search results
   */
  function clearResults(): void {
    cities.value = []
    error.value = null
  }

  return {
    isLoading,
    error,
    cities,
    searchByPostalCode,
    clearResults
  }
}



