<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useCartStore } from '@/stores/cart.store'
import { useAdvancedBookingSlots } from '@/composables/useAdvancedBookingSlots'
import { useBookingContext } from '@/composables/useBookingContext'
import { useGoogleMapsAutocomplete } from '@/composables/useGoogleMapsAutocomplete'
import type { GoogleMapsAddress } from '@/services/googleMaps'
import type { TimeSlotDetailed } from '@/types/booking'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Breadcrumbs from '@/components/layout/Breadcrumbs.vue'
import CartSidebar from '@/components/cart/CartSidebar.vue'
import VehicleWidget from '@/components/context/VehicleWidget.vue'
import LocationWidget from '@/components/context/LocationWidget.vue'
import BookingAccordionModal from '@/components/booking/BookingAccordionModal.vue'
import Container from '@/components/layout/Container.vue'

const router = useRouter()
const cartStore = useCartStore()
const { isContextModalOpen, closeContextModal } = useBookingContext()

/**
 * Address state
 */
const collectAddress = ref({
  street: '',
  complement: '',
  city: cartStore.location?.city || '',
  postalCode: cartStore.location?.postalCode || ''
})

const isAddressSelected = ref(false)

/**
 * Google Maps Autocomplete
 */
const { inputRef, isLoading: isLoadingGoogleMaps, error: googleMapsError, isConfigured } = useGoogleMapsAutocomplete(
  (address: GoogleMapsAddress) => {
    // Callback when address is selected from Google Maps
    collectAddress.value.street = address.street
    collectAddress.value.city = address.city
    collectAddress.value.postalCode = address.postalCode
    isAddressSelected.value = true
    
    // Fetch available slots for the new postal code
    fetchAvailableSlots()
  }
)

/**
 * Reset address selection
 */
function resetAddressSelection(): void {
  isAddressSelected.value = false
  collectAddress.value.street = ''
  collectAddress.value.complement = ''
  collectAddress.value.city = ''
  collectAddress.value.postalCode = ''
  
  // Clear input value
  if (inputRef.value) {
    inputRef.value.value = ''
  }
}

/**
 * Advanced booking slots with multi-selection
 */
const slots = useAdvancedBookingSlots()

/**
 * Hovered slot for preview
 */
const hoveredSlotTime = ref<string | null>(null)

/**
 * Computed - Estimated return (based on first selected range)
 */
const estimatedReturn = computed(() => {
  if (slots.selectedRanges.value.length === 0) return null
  
  const firstRange = slots.selectedRanges.value[0]
  const date = new Date(firstRange.date)
  return date.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  })
})

/**
 * Check if a slot is in the hover preview range
 * Shows visual preview of consecutive slots that will be selected
 * 
 * @param slot - Slot to check
 * @returns true if slot is in hover range (consecutive slots based on service duration)
 */
function isSlotInHoverRange(slot: TimeSlotDetailed): boolean {
  if (!hoveredSlotTime.value || !slots.selectedDate.value) return false
  
  const daySlots = slots.selectedDaySlots.value
  const hoveredIndex = daySlots.findIndex(s => s.time === hoveredSlotTime.value)
  const currentIndex = daySlots.findIndex(s => s.time === slot.time)
  
  if (hoveredIndex === -1 || currentIndex === -1) return false
  
  const slotsNeeded = Math.ceil(slots.totalServiceDuration.value / 30)
  
  return currentIndex >= hoveredIndex && currentIndex < hoveredIndex + slotsNeeded
}

/**
 * Get CSS class for a slot button based on its status and selection state
 * 
 * @param slot - Slot to get class for
 * @returns CSS class string with Tailwind classes
 */
function getSlotClass(slot: TimeSlotDetailed): string {
  const isPartOfRange = slots.selectedDate.value && slots.isSlotPartOfSelectedRange(slot, slots.selectedDate.value)
  const isInHoverRange = isSlotInHoverRange(slot)
  
  const baseClass = 'px-2 md:px-3 py-2 md:py-2.5 rounded-lg border-2 font-semibold text-xs md:text-sm transition-all relative'
  
  // Selected range (green)
  if (isPartOfRange) {
    return `${baseClass} border-green-500 bg-green-50 text-green-700 shadow-md`
  }
  
  // Hover preview range (orange/yellow)
  if (isInHoverRange && slot.status === 'available') {
    return `${baseClass} border-orange-400 bg-orange-100 text-orange-900 shadow-sm scale-105`
  }
  
  switch (slot.status) {
    case 'available':
      return `${baseClass} border-gray-200 hover:border-orange-500 hover:bg-orange-50 text-gray-700 cursor-pointer`
    case 'full':
      return `${baseClass} border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed`
    case 'unavailable':
      return `${baseClass} border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed opacity-50`
    default:
      return baseClass
  }
}

/**
 * Get icon for slot status
 * 
 * @param slot - Slot to get icon for
 * @returns Material Design Icon name (mdi:*)
 */
function getSlotIcon(slot: TimeSlotDetailed): string {
  const isPartOfRange = slots.selectedDate.value && slots.isSlotPartOfSelectedRange(slot, slots.selectedDate.value)
  if (isPartOfRange) return 'mdi:check-circle'
  switch (slot.status) {
    case 'full': return 'mdi:account-multiple'
    case 'unavailable': return 'mdi:clock-alert-outline'
    default: return 'mdi:clock-outline'
  }
}

/**
 * Navigate to confirmation page
 * Validates address and 3 time ranges before proceeding
 */
function goToConfirmation(): void {
  if (!isAddressSelected.value) {
    alert('Veuillez sélectionner une adresse')
    return
  }

  if (!slots.hasThreeRanges.value) {
    alert('Veuillez sélectionner exactement 3 plages horaires préférées')
    return
  }

  // Save to store
  cartStore.setLocation({
    street: collectAddress.value.street,
    complement: collectAddress.value.complement,
    city: collectAddress.value.city,
    postalCode: collectAddress.value.postalCode
  })

  // Save selected time ranges (we'll use the first one as primary)
  const primaryRange = slots.selectedRanges.value[0]
  cartStore.setCollectDateTime({
    date: primaryRange.date,
    slot: `${primaryRange.startTime}-${primaryRange.endTime}`,
    preferredSlots: slots.selectedRanges.value.map(r => `${r.date} ${r.startTime}-${r.endTime}`)
  })

  router.push('/confirmation')
}

/**
 * On mounted
 */
onMounted(async () => {
  if (cartStore.serviceCount === 0) {
    alert('Veuillez d\'abord sélectionner des services')
    router.push('/')
    return
  }
  
  // Slots are generated automatically via computed properties
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header global avec TopBar -->
    <Header />

    <!-- Main Content -->
    <Container class="py-4 md:py-6">
      <!-- Breadcrumbs -->
      <Breadcrumbs />
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <!-- Left: Main Form (2/3 de la largeur) -->
        <main class="lg:col-span-2 space-y-3 md:space-y-4">
          <!-- Page Title -->
          <div class="mb-3 md:mb-4">
            <h1 class="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
              Programmer votre intervention
            </h1>
            <p class="text-sm md:text-base text-gray-600 mt-1.5">
              Choisissez votre créneau pour la collecte de votre véhicule
            </p>
          </div>

          <!-- Address Section -->
          <div class="bg-white rounded-lg shadow-sm p-3 md:p-4 border border-gray-200">
            <h2 class="text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-3">
              Adresse de collecte
            </h2>
            <p class="text-xs md:text-sm text-gray-600 mb-3">
              Où souhaitez-vous que nous récupérions votre véhicule ?
            </p>
            
            <div class="space-y-3">
              <!-- Google Maps Error (if API key not configured) -->
              <div v-if="!isConfigured && !isLoadingGoogleMaps" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                <Icon icon="mdi:alert" class="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p class="text-xs md:text-sm text-yellow-800 font-semibold">Configuration requise</p>
                  <p class="text-xs text-yellow-700 mt-0.5">
                    Ajoutez VITE_GOOGLE_MAPS_API_KEY dans votre fichier .env
                  </p>
                </div>
              </div>
              
              <!-- Address Search avec Google Maps Autocomplete -->
              <div class="relative">
                <input
                  ref="inputRef"
                  type="text"
                  placeholder="Rechercher une adresse..."
                  class="w-full pl-9 pr-10 py-2 md:py-2.5 text-xs md:text-sm border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  :disabled="isLoadingGoogleMaps"
                />
                <Icon 
                  icon="mdi:map-marker" 
                  class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" 
                />
                
                <!-- Loading indicator -->
                <Icon 
                  v-if="isLoadingGoogleMaps"
                  icon="mdi:loading" 
                  class="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" 
                />
                
                <!-- Button pour réinitialiser si adresse sélectionnée -->
                <button
                  v-else-if="isAddressSelected"
                  @click="resetAddressSelection"
                  type="button"
                  class="absolute right-2.5 top-1/2 -translate-y-1/2 text-orange-600 hover:text-orange-700 transition-colors"
                >
                  <Icon icon="mdi:close-circle" class="w-4 h-4" />
                </button>
              </div>

              <!-- Formulaire détaillé (affiché uniquement après sélection) -->
              <div v-if="isAddressSelected" class="space-y-2.5 pt-2 border-t border-gray-200">
                <div>
                  <label class="block text-xs md:text-sm font-semibold text-gray-900 mb-1.5">Adresse *</label>
                  <input
                    v-model="collectAddress.street"
                    type="text"
                    readonly
                    class="w-full px-2.5 py-2 text-xs md:text-sm border-2 border-gray-200 bg-gray-50 rounded-lg text-gray-700"
                  />
                </div>

                <div>
                  <label class="block text-xs md:text-sm font-semibold text-gray-900 mb-1.5">Complément (facultatif)</label>
                  <input
                    v-model="collectAddress.complement"
                    type="text"
                    placeholder="Bâtiment, étage, digicode..."
                    class="w-full px-2.5 py-2 text-xs md:text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>

                <div class="grid grid-cols-2 gap-2.5">
                  <div>
                    <label class="block text-xs md:text-sm font-semibold text-gray-900 mb-1.5">Ville *</label>
                    <input
                      v-model="collectAddress.city"
                      type="text"
                      readonly
                      class="w-full px-2.5 py-2 text-xs md:text-sm border-2 border-gray-200 bg-gray-50 rounded-lg text-gray-700"
                    />
                  </div>
                  <div>
                    <label class="block text-xs md:text-sm font-semibold text-gray-900 mb-1.5">Code postal *</label>
                    <input
                      v-model="collectAddress.postalCode"
                      type="text"
                      readonly
                      class="w-full px-2.5 py-2 text-xs md:text-sm border-2 border-gray-200 bg-gray-50 rounded-lg text-gray-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Date & Time Selection (if address selected) -->
          <div v-if="isAddressSelected" class="bg-white rounded-lg shadow-sm p-3 md:p-4 border border-gray-200">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
              <h2 class="text-base md:text-lg font-bold text-gray-900">
                Choisissez 3 plages horaires préférées
              </h2>
              
              <!-- Indicateur plages sélectionnées (très visible) -->
              <div class="flex items-center gap-2">
                <div class="text-xs md:text-sm text-gray-600">
                  Durée intervention : <span class="font-semibold text-orange-600">{{ slots.totalServiceDuration.value }}min</span>
                  <span class="text-gray-500 ml-1">({{ Math.ceil(slots.totalServiceDuration.value / 30) }} créneaux)</span>
                </div>
                <div 
                  :class="[
                    'px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-bold text-sm md:text-base border-2',
                    slots.hasThreeRanges.value 
                      ? 'bg-green-50 border-green-500 text-green-700' 
                      : 'bg-orange-50 border-orange-500 text-orange-700'
                  ]"
                >
                  <span class="text-lg md:text-xl">{{ slots.selectedRanges.value.length }}</span>
                  <span class="text-sm">/3</span>
                  <Icon 
                    v-if="slots.hasThreeRanges.value" 
                    icon="mdi:check-circle" 
                    class="inline-block w-4 h-4 md:w-5 md:h-5 ml-1" 
                  />
                </div>
              </div>
            </div>

            <!-- Week Navigation -->
            <div class="bg-gray-50 rounded-lg p-2 md:p-3 mb-3 flex items-center justify-between">
              <button
                @click="slots.previousWeek()"
                :disabled="slots.currentWeekOffset.value === 0"
                class="px-2 md:px-3 py-1.5 md:py-2 border-2 border-gray-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:border-orange-500 transition-colors flex items-center gap-1"
              >
                <Icon icon="mdi:chevron-left" class="w-4 h-4 md:w-5 md:h-5" />
                <span class="text-xs md:text-sm font-medium hidden md:inline">Précédent</span>
              </button>
              
              <div class="text-center">
                <p class="font-bold text-sm md:text-base">
                  {{ slots.currentWeekOffset.value === 0 ? 'Cette semaine' : `Semaine +${slots.currentWeekOffset.value}` }}
                </p>
                <p class="text-xs text-gray-600">
                  {{ slots.currentWeek.value.startDate }} → {{ slots.currentWeek.value.endDate }}
                </p>
              </div>
              
              <button
                @click="slots.nextWeek()"
                class="px-2 md:px-3 py-1.5 md:py-2 border-2 border-gray-300 rounded-lg hover:border-orange-500 transition-colors flex items-center gap-1"
              >
                <span class="text-xs md:text-sm font-medium hidden md:inline">Suivant</span>
                <Icon icon="mdi:chevron-right" class="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            <!-- Day Selection -->
            <div class="mb-3">
              <p class="text-xs md:text-sm font-semibold text-gray-700 mb-2">Sélectionnez un ou plusieurs jours :</p>
              <div class="flex gap-1.5 md:gap-2 overflow-x-auto pb-2 -mx-3 px-3 md:mx-0 md:px-0">
                <button
                  v-for="day in slots.availableDays.value"
                  :key="day.date"
                  @click="slots.selectDay(day.date)"
                  :class="[
                    'flex-shrink-0 px-3 md:px-4 py-2 md:py-2.5 rounded-lg border-2 transition-all min-w-[80px]',
                    slots.selectedDate.value === day.date
                      ? 'border-orange-600 bg-orange-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  ]"
                >
                  <div class="text-[10px] md:text-xs text-gray-600 uppercase font-medium">
                    {{ day.dayName.substring(0, 3) }}
                  </div>
                  <div class="font-bold text-xs md:text-sm" :class="slots.selectedDate.value === day.date ? 'text-orange-700' : 'text-gray-900'">
                    {{ new Date(day.date).getDate() }}
                  </div>
                  <div class="text-[10px] md:text-xs text-green-600 font-medium">
                    {{ day.slots.filter(s => s.status === 'available').length }} dispos
                  </div>
                </button>
              </div>
            </div>

            <!-- Message d'erreur -->
            <div v-if="slots.errorMessage.value" class="mb-3 bg-red-50 border-l-4 border-red-400 p-2 md:p-3">
              <p class="text-xs md:text-sm text-red-800 font-medium flex items-center gap-2">
                <Icon icon="mdi:alert-circle" class="w-4 h-4" />
                <span>{{ slots.errorMessage.value }}</span>
              </p>
            </div>

            <!-- Plages horaires déjà sélectionnées (recap) -->
            <div v-if="slots.selectedRanges.value.length > 0" class="mb-3">
              <p class="text-xs md:text-sm font-semibold text-gray-700 mb-2">Plages horaires sélectionnées :</p>
              <div class="space-y-1.5">
                <div
                  v-for="(range, index) in slots.selectedRanges.value"
                  :key="`range-${range.date}-${range.startTime}`"
                  class="flex items-center justify-between bg-green-50 border border-green-300 rounded-lg p-2 md:p-2.5"
                >
                  <div class="flex items-center gap-2">
                    <Icon icon="mdi:check-circle" class="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                    <span class="text-xs md:text-sm font-medium text-gray-900">
                      {{ index + 1 }}. {{ range.dayName }} {{ new Date(range.date).getDate() }} - 
                      {{ range.startTime }}-{{ range.endTime }}
                      <span class="text-gray-500 ml-1">({{ range.slotsCount }} créneaux)</span>
                    </span>
                  </div>
                  <button
                    @click="slots.toggleSlot(range.startSlot, range.date)"
                    class="text-red-500 hover:text-red-700 transition-colors p-1"
                    title="Supprimer cette plage"
                  >
                    <Icon icon="mdi:close-circle" class="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Time Slots Selection -->
            <div v-if="slots.selectedDate.value" class="space-y-2">
              <div class="bg-blue-50 border-l-4 border-blue-400 p-2 md:p-3 mb-2">
                <p class="text-xs md:text-sm text-blue-800 font-medium flex items-center gap-2">
                  <Icon icon="mdi:information" class="w-4 h-4" />
                  <span>Cliquez sur un créneau de départ : <strong>{{ Math.ceil(slots.totalServiceDuration.value / 30) }} créneaux consécutifs</strong> seront automatiquement sélectionnés. Choisissez 3 plages horaires.</span>
                </p>
              </div>
              
              <div class="grid grid-cols-3 md:grid-cols-4 gap-1.5 md:gap-2">
                <button
                  v-for="slot in slots.selectedDaySlots.value"
                  :key="slot.time"
                  @click="slots.toggleSlot(slot, slots.selectedDate.value!)"
                  @mouseenter="slot.status === 'available' ? hoveredSlotTime = slot.time : null"
                  @mouseleave="hoveredSlotTime = null"
                  :disabled="slot.status !== 'available' && !slots.isSlotPartOfSelectedRange(slot, slots.selectedDate.value!)"
                  :class="getSlotClass(slot)"
                  :title="slot.reason || slot.time"
                >
                  <div class="flex items-center justify-center gap-1">
                    <Icon :icon="getSlotIcon(slot)" class="w-3 h-3 md:w-4 md:h-4" />
                    <span>{{ slot.time.split('-')[0] }}</span>
                  </div>
                  <div v-if="slot.reason && slot.status !== 'available'" class="text-[8px] md:text-[10px] mt-0.5 line-clamp-1">
                    {{ slot.reason }}
                  </div>
                </button>
              </div>

              <!-- Legend -->
              <div class="flex flex-wrap gap-2 md:gap-3 pt-2 border-t border-gray-200 text-[10px] md:text-xs">
                <div class="flex items-center gap-1">
                  <Icon icon="mdi:check-circle" class="w-3 h-3 text-green-600" />
                  <span class="text-gray-600">Sélectionné</span>
                </div>
                <div class="flex items-center gap-1">
                  <Icon icon="mdi:clock-outline" class="w-3 h-3 text-gray-600" />
                  <span class="text-gray-600">Disponible</span>
                </div>
                <div class="flex items-center gap-1">
                  <Icon icon="mdi:account-multiple" class="w-3 h-3 text-gray-400" />
                  <span class="text-gray-600">Complet</span>
                </div>
                <div class="flex items-center gap-1">
                  <Icon icon="mdi:clock-alert-outline" class="w-3 h-3 text-gray-300" />
                  <span class="text-gray-600">Indisponible</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Estimated Return -->
          <div v-if="estimatedReturn" class="bg-blue-50 rounded-lg p-3 md:p-4 border border-blue-200">
            <div class="flex items-start gap-2">
              <Icon icon="mdi:information" class="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 class="text-sm md:text-base font-bold text-blue-900 mb-1">
                  Restitution estimée
                </h3>
                <p class="text-xs md:text-sm text-blue-800 font-semibold mb-1.5">
                  {{ estimatedReturn }}, dans l'après-midi
                </p>
                <p class="text-xs md:text-sm text-blue-700 leading-relaxed">
                  Nous vous tiendrons informé par email et SMS de l'avancement des travaux
                </p>
              </div>
            </div>
          </div>

          <!-- Continue Button -->
          <button
            @click="goToConfirmation"
            :disabled="!slots.hasThreeRanges.value || !isAddressSelected"
            :class="[
              'w-full py-2.5 md:py-3 font-bold text-sm md:text-base rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 group',
              slots.hasThreeRanges.value && isAddressSelected
                ? 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            ]"
          >
            <Icon icon="mdi:check-circle" class="w-4 h-4 md:w-5 md:h-5" />
            <span>Confirmer les créneaux</span>
            <span class="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </main>

        <!-- Sidebar : Panier + Véhicule + Ville (1/3 de la largeur) -->
        <div class="lg:col-span-1">
          <div class="sticky top-20 space-y-3">
            <CartSidebar />
            <VehicleWidget variant="card" />
            <LocationWidget variant="card" />
          </div>
        </div>
      </div>
    </Container>
    
    <!-- Modal Booking Context -->
    <BookingAccordionModal
      :is-open="isContextModalOpen"
      @close="closeContextModal"
    />
    
    <Footer />
  </div>
</template>
