/**
 * Cart Store - Manages booking cart state
 * Handles services selection, vehicle, location and appointment details
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockBookingServices, getBookingServiceById } from '@/mocks/bookingData'
import { mockServices } from '@/mocks/services'
import type { BookingService, Location, DateTime, ServicePricingConfig } from '@/types/booking'
import type { Vehicle } from '@/types/vehicle'
import type { Service, ServiceAnswer } from '@/types/service'

export const useCartStore = defineStore('cart', () => {
  /**
   * State
   */
  const services = ref<BookingService[]>([])
  const vehicle = ref<Vehicle | null>(null)
  const location = ref<Location | null>(null)
  const collectDateTime = ref<DateTime | null>(null)

  /**
   * Computed - Total price
   */
  const total = computed(() => {
    return services.value.reduce((sum, service) => sum + service.price, 0)
  })

  /**
   * Computed - Total duration in minutes
   */
  const totalDuration = computed(() => {
    return services.value.reduce((sum, service) => sum + service.duration, 0)
  })

  /**
   * Computed - Check if cart has urgent services
   */
  const hasUrgentServices = computed(() => {
    return services.value.some(service => service.urgency === 'high')
  })

  /**
   * Computed - Service count
   */
  const serviceCount = computed(() => services.value.length)

  /**
   * Check if a service is in cart
   */
  function isInCart(serviceId: string): boolean {
    return services.value.some(s => s.id === serviceId)
  }

  /**
   * Convert Service (from mockServices) to BookingService format
   */
  function convertToBookingService(service: Service, config?: ServicePricingConfig): BookingService {
    return {
      id: service.id,
      name: service.name,
      category: service.category,
      price: config?.priceBreakdown ? 
        (config.priceBreakdown.base + config.priceBreakdown.tier + config.priceBreakdown.options + config.priceBreakdown.questionModifiers) 
        : service.priceFrom,
      basePrice: service.priceFrom,
      originalPrice: undefined,
      duration: service.duration, // Sera mis à jour si config fournie
      baseDuration: service.duration,
      description: service.description,
      longDescription: service.description,
      included: service.included,
      urgency: 'medium',
      badge: service.recommended ? 'RECOMMANDÉ' : undefined,
      reason: undefined,
      image: service.imageUrl,
      vehicleSpecific: undefined,
      pricingConfig: config
    }
  }

  /**
   * Add service to cart with optional pricing configuration
   * Accepts both BookingService IDs (from bookingData) and Service IDs/slugs (from mockServices)
   */
  function addService(
    serviceId: string, 
    config?: {
      tierId?: string
      tierLabel?: string
      selectedOptions?: string[]
      answers?: ServiceAnswer[]
      calculatedPrice: number
      totalDuration: number
    }
  ): void {
    // Check if already in cart
    if (isInCart(serviceId)) {
      console.warn(`Service ${serviceId} is already in cart, use updateService() instead`)
      return
    }

    let bookingService: BookingService | null = null
    let pricingConfig: ServicePricingConfig | undefined = undefined

    // Préparer la config si fournie
    if (config) {
      pricingConfig = {
        tierId: config.tierId,
        tierLabel: config.tierLabel,
        selectedOptions: config.selectedOptions || [],
        answers: config.answers || []
      }
    }

    // 1. Try to get service from bookingData first
    bookingService = getBookingServiceById(serviceId)
    
    // 2. If not found, try from mockServices by ID
    if (!bookingService) {
      const mockService = mockServices.find(s => s.id === serviceId)
      if (mockService) {
        console.log(`Service ${serviceId} found in mockServices, converting to BookingService`)
        bookingService = convertToBookingService(mockService, pricingConfig)
      }
    }
    
    // 3. If still not found, try by slug
    if (!bookingService) {
      const mockService = mockServices.find(s => s.slug === serviceId)
      if (mockService) {
        console.log(`Service ${serviceId} found by slug in mockServices, converting to BookingService`)
        bookingService = convertToBookingService(mockService, pricingConfig)
      }
    }
    
    // 4. Final check
    if (!bookingService) {
      console.error(`Service ${serviceId} not found in bookingData or mockServices`)
      return
    }

    // Appliquer prix et durée calculés si fournis
    if (config) {
      bookingService.price = config.calculatedPrice
      bookingService.duration = config.totalDuration
      bookingService.pricingConfig = pricingConfig
    }

    console.log('Adding service to cart:', bookingService.name, config ? 'with configuration' : '')
    services.value.push(bookingService)
  }

  /**
   * Update service configuration if already in cart
   */
  function updateService(
    serviceId: string,
    config: {
      tierId?: string
      tierLabel?: string
      selectedOptions?: string[]
      answers?: ServiceAnswer[]
      calculatedPrice: number
      totalDuration: number
    }
  ): void {
    const service = services.value.find(s => s.id === serviceId)
    
    if (!service) {
      console.warn(`Service ${serviceId} not found in cart, cannot update`)
      return
    }

    // Mettre à jour prix et durée
    service.price = config.calculatedPrice
    service.duration = config.totalDuration

    // Mettre à jour configuration
    service.pricingConfig = {
      tierId: config.tierId,
      tierLabel: config.tierLabel,
      selectedOptions: config.selectedOptions || [],
      answers: config.answers || []
    }

    console.log('Updated service in cart:', service.name)
  }

  /**
   * Remove service from cart
   */
  function removeService(serviceId: string): void {
    const index = services.value.findIndex(s => s.id === serviceId)
    if (index > -1) {
      services.value.splice(index, 1)
    }
  }

  /**
   * Set vehicle information
   */
  function setVehicle(v: Vehicle): void {
    vehicle.value = v
  }

  /**
   * Set location information
   */
  function setLocation(loc: Location): void {
    location.value = loc
  }

  /**
   * Set collect date and time
   */
  function setCollectDateTime(dt: DateTime): void {
    collectDateTime.value = dt
  }

  /**
   * Clear entire cart
   */
  function clearCart(): void {
    services.value = []
    vehicle.value = null
    location.value = null
    collectDateTime.value = null
  }

  /**
   * Clear only services (keep vehicle and location)
   */
  function clearServices(): void {
    services.value = []
  }

  return {
    // State
    services,
    vehicle,
    location,
    collectDateTime,
    // Computed
    total,
    totalDuration,
    hasUrgentServices,
    serviceCount,
    // Methods
    isInCart,
    addService,
    updateService,
    removeService,
    setVehicle,
    setLocation,
    setCollectDateTime,
    clearCart,
    clearServices
  }
}, {
  persist: true  // Persiste tout le store automatiquement
})
