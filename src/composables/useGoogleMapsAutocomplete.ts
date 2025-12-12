import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import { initAutocomplete, isGoogleMapsConfigured, type GoogleMapsAddress } from '@/services/googleMaps'

/**
 * Composable for Google Maps Places Autocomplete
 * 
 * @param onAddressSelected - Callback when an address is selected
 * @returns Input ref and loading state
 * 
 * @example
 * ```vue
 * <script setup>
 * const { inputRef, isLoading, error } = useGoogleMapsAutocomplete((address) => {
 *   collectAddress.value = address
 *   isAddressSelected.value = true
 * })
 * </script>
 * 
 * <template>
 *   <input ref="inputRef" type="text" placeholder="Rechercher une adresse..." />
 *   <p v-if="error">{{ error }}</p>
 * </template>
 * ```
 */
export function useGoogleMapsAutocomplete(
  onAddressSelected: (address: GoogleMapsAddress) => void
) {
  const inputRef = ref<HTMLInputElement | null>(null)
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const isConfigured = ref(false)
  
  let cleanup: (() => void) | null = null
  
  /**
   * Initialize autocomplete when input is mounted
   */
  onMounted(async () => {
    // Check if API key is configured
    if (!isGoogleMapsConfigured()) {
      error.value = 'Google Maps API key not configured'
      isConfigured.value = false
      isLoading.value = false
      console.warn('VITE_GOOGLE_MAPS_API_KEY not found in environment variables')
      return
    }
    
    isConfigured.value = true
    
    if (!inputRef.value) {
      error.value = 'Input element not found'
      isLoading.value = false
      return
    }
    
    try {
      cleanup = await initAutocomplete(inputRef.value, (address) => {
        onAddressSelected(address)
      })
      
      isLoading.value = false
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to initialize autocomplete'
      isLoading.value = false
      console.error('Error in useGoogleMapsAutocomplete:', err)
    }
  })
  
  /**
   * Cleanup on unmount
   */
  onUnmounted(() => {
    if (cleanup) {
      cleanup()
    }
  })
  
  return {
    inputRef,
    isLoading,
    error,
    isConfigured
  }
}
