/**
 * Google Maps API configuration
 */
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
let isScriptLoaded = false

/**
 * Load Google Maps JavaScript API script
 */
async function loadGoogleMapsScript(): Promise<void> {
  if (isScriptLoaded || !apiKey) {
    return
  }

  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google?.maps) {
      isScriptLoaded = true
      resolve()
      return
    }

    // Create script element
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`
    script.async = true
    script.defer = true

    // Callback when loaded
    window.initMap = () => {
      isScriptLoaded = true
      resolve()
    }

    script.onerror = () => {
      reject(new Error('Failed to load Google Maps script'))
    }

    document.head.appendChild(script)
  })
}

/**
 * Address result from Google Maps autocomplete
 */
export interface GoogleMapsAddress {
  description: string
  street: string
  city: string
  postalCode: string
  latitude?: number
  longitude?: number
}

/**
 * Parse Google Place result to our Address format
 * 
 * @param place - Google Place object
 * @returns Parsed address
 */
function parseGooglePlace(place: google.maps.places.PlaceResult): GoogleMapsAddress {
  const components = place.address_components || []
  
  let streetNumber = ''
  let route = ''
  let city = ''
  let postalCode = ''
  
  components.forEach((component) => {
    const types = component.types
    
    if (types.includes('street_number')) {
      streetNumber = component.long_name
    }
    if (types.includes('route')) {
      route = component.long_name
    }
    if (types.includes('locality')) {
      city = component.long_name
    }
    if (types.includes('postal_code')) {
      postalCode = component.long_name
    }
  })
  
  const street = streetNumber && route 
    ? `${streetNumber} ${route}` 
    : route || streetNumber
  
  return {
    description: place.formatted_address || '',
    street,
    city,
    postalCode,
    latitude: place.geometry?.location?.lat(),
    longitude: place.geometry?.location?.lng()
  }
}

/**
 * Initialize Google Maps Autocomplete on an input element
 * 
 * @param inputElement - HTML input element
 * @param onPlaceSelected - Callback when a place is selected
 * @returns Cleanup function
 */
export async function initAutocomplete(
  inputElement: HTMLInputElement,
  onPlaceSelected: (address: GoogleMapsAddress) => void
): Promise<() => void> {
  try {
    // Load Google Maps script
    await loadGoogleMapsScript()
    
    if (!window.google?.maps?.places) {
      throw new Error('Google Maps Places library not loaded')
    }
    
    const autocomplete = new google.maps.places.Autocomplete(inputElement, {
      componentRestrictions: { country: 'fr' },
      fields: ['address_components', 'formatted_address', 'geometry'],
      types: ['address']
    })
    
    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      
      if (!place.geometry || !place.address_components) {
        console.warn('No details available for input:', place.name)
        return
      }
      
      const address = parseGooglePlace(place)
      onPlaceSelected(address)
    })
    
    // Return cleanup function
    return () => {
      google.maps.event.removeListener(listener)
    }
  } catch (error) {
    console.error('Error initializing Google Maps Autocomplete:', error)
    throw error
  }
}

/**
 * Check if Google Maps API key is configured
 */
export function isGoogleMapsConfigured(): boolean {
  return !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY
}
