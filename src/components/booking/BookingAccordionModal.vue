<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import type { CityResult } from '@/composables/useGooglePlaces'
import type { Vehicle } from '@/types/vehicle'
import { useCartStore } from '@/stores/cart.store'
import { mockBookingVehicle } from '@/mocks/bookingData'
import { mockServices } from '@/mocks/services'
import { useLocalStorage } from '@/composables/useLocalStorage'
import BookingStep1Service from '@/components/booking/BookingStep1Service.vue'
import BookingStep2City from '@/components/booking/BookingStep2City.vue'
import BookingStep3Vehicle from '@/components/booking/BookingStep3Vehicle.vue'

/**
 * Props
 */
interface Props {
  isOpen: boolean
  licensePlate?: string
  selectedService?: string
  selectedCity?: string
  preSelectedStep?: 1 | 2 | 3 | null
}

const props = withDefaults(defineProps<Props>(), {
  licensePlate: '',
  selectedService: '',
  selectedCity: '',
  preSelectedStep: null
})

/**
 * Emits
 */
const emit = defineEmits<{
  close: []
  'update:licensePlate': [value: string]
  'update:selectedService': [value: string]
  'update:selectedCity': [value: string]
  submit: []
}>()

/**
 * Local state with localStorage persistence for city and vehicle
 */
const localLicensePlate = ref(props.licensePlate)
const localSelectedService = ref(props.selectedService)

// Persist city selection in localStorage
const localSelectedCity = ref(props.selectedCity)
const savedCity = useLocalStorage<CityResult | null>('booking-city', null)
const selectedCityObject = ref<CityResult | null>(savedCity.value)

// Persist vehicle selection in localStorage
const savedVehicle = useLocalStorage<Vehicle | null>('booking-vehicle', null)
const foundVehicle = ref<Vehicle | null>(savedVehicle.value)

// Persist vehicle search mode
const vehicleSearchMode = ref<'license' | 'vin' | 'model' | 'photo'>('license')

// Initialize city if saved in localStorage
if (savedCity.value && !localSelectedCity.value) {
  localSelectedCity.value = savedCity.value.name
}

// Track validated steps
const validatedSteps = ref<number[]>([])

// Computed properties for step completion
const isStep1Completed = computed(() => !!localSelectedService.value)
const isStep2Completed = computed(() => !!localSelectedCity.value)
const isStep3Completed = computed(() => !!foundVehicle.value)
const allStepsCompleted = computed(() => isStep1Completed.value && isStep2Completed.value && isStep3Completed.value)

// Initialize validated steps based on saved data
if (savedCity.value) {
  validatedSteps.value.push(2)
}
if (savedVehicle.value) {
  validatedSteps.value.push(3)
}

// Watch for pre-selected service from props
watch(() => props.selectedService, (newService) => {
  if (newService && !validatedSteps.value.includes(1)) {
    localSelectedService.value = newService
    validatedSteps.value.push(1)
    // Open step 2 if not completed
    if (!isStep2Completed.value) {
      currentStep.value = 2
    }
  }
}, { immediate: true })

/**
 * Determine which step should be open based on completion
 */
const getInitialStep = () => {
  // If preSelectedStep is provided, open that step directly
  if (props.preSelectedStep) {
    return props.preSelectedStep
  }
  
  // If service is pre-selected (from props), mark step 1 as completed and open step 2
  if (props.selectedService && !isStep2Completed.value) {
    return 2
  }
  
  // If nothing is completed, open step 1
  if (!isStep1Completed.value) return 1
  // If step 1 done but not step 2, open step 2
  if (isStep1Completed.value && !isStep2Completed.value) return 2
  // If steps 1 & 2 done but not step 3, open step 3
  if (isStep1Completed.value && isStep2Completed.value && !isStep3Completed.value) return 3
  // If all completed, close all
  return 0
}

/**
 * Current step state
 * Start with the accordion that needs to be filled
 */
const currentStep = ref(getInitialStep())

/**
 * Watch for preSelectedStep changes (when modal reopens)
 */
watch(() => props.preSelectedStep, (newStep) => {
  if (newStep && props.isOpen) {
    currentStep.value = newStep
  }
})

/**
 * References to accordion steps for scrolling
 */
const step1Ref = ref<HTMLElement | null>(null)
const step2Ref = ref<HTMLElement | null>(null)
const step3Ref = ref<HTMLElement | null>(null)

/**
 * Auto-scroll to accordion when it opens
 */
watch(currentStep, async (newStep) => {
  if (newStep > 0) {
    // Wait for DOM to update
    await nextTick()
    
    let targetRef: HTMLElement | null = null
    if (newStep === 1 && step1Ref.value) {
      targetRef = step1Ref.value
    } else if (newStep === 2 && step2Ref.value) {
      targetRef = step2Ref.value
    } else if (newStep === 3 && step3Ref.value) {
      targetRef = step3Ref.value
    }
    
    if (targetRef) {
      targetRef.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      })
    }
  }
})

// Get display label for selected vehicle
const selectedVehicleLabel = computed(() => {
  if (foundVehicle.value) {
    return `${foundVehicle.value.make} ${foundVehicle.value.model}`
  }
  return ''
})

// Get display label for selected service
const selectedServiceLabel = computed(() => {
  // First check static mapping for popular services
  const serviceLabels: Record<string, string> = {
    'vidange': '🛢️ Vidange + Filtre',
    'freins': '🔴 Freins (Plaquettes)',
    'revision': 'Révision & Vidange',
    'pneus': 'Changer vos pneus',
    'courroie': 'Courroie de distribution',
    'clim': 'Compresseur de climatisation',
    'embrayage': 'Embrayage',
    'plaquettes': 'Plaquettes de frein',
    'amortisseurs': 'Amortisseurs',
    'radiateur': 'Radiateur',
    'autres': 'Autres prestations'
  }
  
  // If found in static mapping, return it
  if (serviceLabels[localSelectedService.value]) {
    return serviceLabels[localSelectedService.value]
  }
  
  // Otherwise, search in mockServices by ID
  const service = mockServices.find(s => s.id === localSelectedService.value)
  if (service) {
    return service.name
  }
  
  // Fallback: return the value as is
  return localSelectedService.value
})

// Get display label for selected city
const selectedCityLabel = computed(() => {
  if (selectedCityObject.value) {
    return `${selectedCityObject.value.name} (${selectedCityObject.value.postalCode})`
  }
  return localSelectedCity.value || ''
})


/**
 * Methods
 */
const closeModal = () => {
  emit('close')
}

const toggleStep = (step: number) => {
  // Only one accordion can be open at a time
  // Clicking on the open accordion closes it
  // Clicking on a different accordion closes the current one and opens the clicked one
  
  if (step === 1) {
    // Step 1 is always accessible
    currentStep.value = currentStep.value === step ? 0 : step
  } else if (step === 2 && isStep1Completed.value) {
    // Step 2 only if step 1 is completed
    currentStep.value = currentStep.value === step ? 0 : step
  } else if (step === 3 && isStep1Completed.value && isStep2Completed.value) {
    // Step 3 only if steps 1 and 2 are completed
    currentStep.value = currentStep.value === step ? 0 : step
  }
  // If conditions not met, accordion stays closed (currentStep doesn't change)
}

/**
 * Handle service selection from Step1Service component
 */
function handleServiceSelect(service: string) {
  localSelectedService.value = service
  emit('update:selectedService', service)
  
  // Mark step 1 as validated
  if (!validatedSteps.value.includes(1)) {
    validatedSteps.value.push(1)
  }
  
  // Auto-open next step
  currentStep.value = 2
}

/**
 * Handle city selection from Step2City component
 */
function handleCitySelect(city: CityResult) {
  selectedCityObject.value = city
  localSelectedCity.value = city.name
  emit('update:selectedCity', city.name)
  
  // Save to localStorage
  savedCity.value = city
  
  // Mark step 2 as validated
  if (!validatedSteps.value.includes(2)) {
    validatedSteps.value.push(2)
  }
  
  // Auto-open next step
  currentStep.value = 3
}

/**
 * Handle vehicle selection from Step3Vehicle component
 */
function handleVehicleSelect(vehicle: Vehicle) {
  foundVehicle.value = vehicle
  
  // Save to localStorage
  savedVehicle.value = vehicle
  
  // Mark step 3 as validated
  if (!validatedSteps.value.includes(3)) {
    validatedSteps.value.push(3)
  }
  
  // Don't close accordion here - let handleVehicleValidate do it
}

/**
 * Handle vehicle validation from Step3Vehicle component
 */
function handleVehicleValidate() {
  // Close accordion (all steps completed)
  currentStep.value = 0
}

/**
 * Handle city reset from Step2City component
 */
function handleCityReset() {
  // Clear city and mark step as not validated
  selectedCityObject.value = null
  localSelectedCity.value = ''
  savedCity.value = null
  validatedSteps.value = validatedSteps.value.filter(s => s !== 2)
}

/**
 * Handle vehicle reset from Step3Vehicle component
 */
function handleVehicleReset() {
  // Clear vehicle and mark step as not validated
  foundVehicle.value = null
  savedVehicle.value = null
  validatedSteps.value = validatedSteps.value.filter(s => s !== 3)
}

/**
 * Router for navigation
 */
const router = useRouter()
const cartStore = useCartStore()

/**
 * Map simple service IDs to mockServices slugs
 * Aligned with Services.vue for consistency
 */
const serviceIdMapping: Record<string, string> = {
  'revision': 'revision-complete',
  'vidange': 'vidange-moteur',
  'freins': 'plaquettes-frein-avant',
  'pneus': 'changement-pneus',
  'courroie': 'courroie-distribution',
  'clim': 'recharge-climatisation',
  'embrayage': 'changement-embrayage',
  'plaquettes': 'plaquettes-frein-avant',
  'amortisseurs': 'amortisseurs-avant',
  'radiateur': 'radiateur-moteur',
  'diagnostic': 'diagnostic-electronique'
}

/**
 * Handle submit - Navigate to devis page
 */
function handleSubmit() {
  if (allStepsCompleted.value) {
    // Save vehicle to cart store
    if (foundVehicle.value) {
      cartStore.setVehicle(foundVehicle.value)
    } else {
      // Fallback to mock vehicle if search didn't work
      cartStore.setVehicle(mockBookingVehicle)
    }

    // Save location
    if (selectedCityObject.value) {
      cartStore.setLocation({
        city: selectedCityObject.value.name,
        postalCode: selectedCityObject.value.postalCode
      })
    }

    // Close modal
    emit('close')

    // Navigate to service detail page (NO auto-add to cart)
    // User will click "AJOUTER AU DEVIS" button on service page
    if (localSelectedService.value) {
      const serviceId = serviceIdMapping[localSelectedService.value] || localSelectedService.value
      router.push(`/service/${serviceId}`)
    }
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <div 
          class="relative w-full h-full md:w-[95vw] md:h-[95vh] md:max-w-[1600px] bg-white md:rounded-3xl shadow-2xl overflow-hidden animate-modal-in flex flex-col"
          @click.stop
        >
          <!-- Header avec progression (compact mobile) -->
          <div class="flex-shrink-0 bg-gradient-to-r from-orange-primary to-orange-hover p-2 md:p-3 text-white shadow-lg">
            <button 
              @click="closeModal"
              class="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all hover:rotate-90 z-10"
            >
              <span class="text-lg md:text-xl font-bold">×</span>
            </button>
            
            <div class="flex items-center justify-between gap-2 md:gap-3 pr-8 md:pr-0">
              <!-- Titre -->
              <div class="flex items-center gap-1.5 md:gap-2">
                <div class="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span class="text-base md:text-xl">⚡</span>
                </div>
                <div>
                  <h2 class="text-sm md:text-lg font-bold">Devis gratuit en 2 min</h2>
                  <p class="text-[10px] md:text-xs text-white/90">Réponse en 30s</p>
                </div>
              </div>
              
              <!-- Stepper progression -->
              <div class="hidden md:flex items-center gap-2 pr-8">
                <div class="flex items-center gap-1.5">
                  <div 
                    class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    :class="isStep1Completed ? 'bg-green-500 text-white' : currentStep === 1 ? 'bg-white text-orange-primary' : 'bg-white/30 text-white/70'"
                  >
                    <span v-if="isStep1Completed">✓</span>
                    <span v-else>1</span>
                  </div>
                  <div class="w-6 h-0.5 transition-all" :class="isStep1Completed ? 'bg-green-500' : 'bg-white/30'"></div>
                  <div 
                    class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    :class="isStep2Completed ? 'bg-green-500 text-white' : currentStep === 2 ? 'bg-white text-orange-primary' : 'bg-white/30 text-white/70'"
                  >
                    <span v-if="isStep2Completed">✓</span>
                    <span v-else>2</span>
                  </div>
                  <div class="w-6 h-0.5 transition-all" :class="isStep2Completed ? 'bg-green-500' : 'bg-white/30'"></div>
                  <div 
                    class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    :class="isStep3Completed ? 'bg-green-500 text-white' : currentStep === 3 ? 'bg-white text-orange-primary' : 'bg-white/30 text-white/70'"
                  >
                    <span v-if="isStep3Completed">✓</span>
                    <span v-else>3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Scrollable Content -->
          <div class="flex-1 overflow-y-auto p-1.5 md:p-3 lg:p-4 pb-16 md:pb-20">
            
            <!-- ÉTAPE 1 : QUEL EST VOTRE BESOIN -->
            <div ref="step1Ref" class="mb-1 md:mb-2">
              <button
                @click="toggleStep(1)"
                class="w-full flex items-center justify-between p-1.5 md:p-3 bg-gray-50 hover:bg-gray-100 rounded-lg md:rounded-xl transition-all"
                :class="{ 
                  'border-2': currentStep === 1,
                  'bg-green-50 border-2 border-green-500': isStep1Completed && currentStep !== 1
                }"
                :style="currentStep === 1 ? { backgroundColor: '#F3F3F3', borderColor: '#3D3333' } : {}"
              >
                <div class="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                  <div 
                    class="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm md:text-base"
                    :class="isStep1Completed ? 'bg-gradient-to-br from-green-600 to-green-500' : 'bg-gradient-to-br from-orange-primary to-orange-hover'"
                  >
                    <span v-if="isStep1Completed" class="text-base md:text-xl">✓</span>
                    <span v-else>1</span>
                  </div>
                  <div class="flex-1 text-left min-w-0">
                    <span class="font-semibold text-sm md:text-base block" :class="{ 'text-gray-500 text-xs md:text-sm': isStep1Completed && currentStep !== 1 }">Votre besoin ?</span>
                    <span v-if="isStep1Completed && currentStep !== 1" class="text-xs md:text-sm font-bold text-orange-primary truncate block mt-0.5">{{ selectedServiceLabel }}</span>
                  </div>
                </div>
                <svg class="w-5 h-5 transition-transform flex-shrink-0" :class="{ 'rotate-180': currentStep === 1 }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <Transition name="accordion">
                <BookingStep1Service
                  v-if="currentStep === 1"
                  :selected-service="localSelectedService"
                  :is-completed="isStep1Completed"
                  @select="handleServiceSelect"
                />
              </Transition>
            </div>

            <!-- ÉTAPE 2 : QUELLE EST VOTRE VILLE -->
            <div ref="step2Ref" class="mb-1 md:mb-2">
              <button
                @click="toggleStep(2)"
                :disabled="!isStep1Completed"
                class="w-full flex items-center justify-between p-1.5 md:p-3 rounded-lg md:rounded-xl transition-all"
                :class="{ 
                  'border-2': currentStep === 2,
                  'bg-green-50 border-2 border-green-500 hover:bg-green-100': isStep2Completed && currentStep !== 2,
                  'bg-gray-50 hover:bg-gray-100': (!isStep1Completed && !isStep2Completed) || (isStep1Completed && currentStep !== 2),
                  'opacity-50 cursor-not-allowed': !isStep1Completed,
                  'cursor-pointer': isStep1Completed
                }"
                :style="currentStep === 2 ? { backgroundColor: '#F3F3F3', borderColor: '#3D3333' } : {}"
              >
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <div 
                    class="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm"
                    :class="isStep2Completed ? 'bg-gradient-to-br from-green-600 to-green-500' : isStep1Completed ? 'bg-gradient-to-br from-orange-primary to-orange-hover' : 'bg-gray-300'"
                  >
                    <span v-if="isStep2Completed" class="text-base md:text-lg">✓</span>
                    <span v-else>2</span>
                  </div>
                  <div class="flex-1 text-left min-w-0">
                    <span class="font-semibold text-sm md:text-base block" :class="{ 'text-gray-500 text-xs md:text-sm': isStep2Completed && currentStep !== 2 }">Votre ville ?</span>
                    <span v-if="isStep2Completed && currentStep !== 2" class="text-xs md:text-sm font-bold text-orange-primary truncate block mt-0.5">{{ selectedCityLabel }}</span>
                  </div>
                </div>
                <svg class="w-5 h-5 transition-transform flex-shrink-0" :class="{ 'rotate-180': currentStep === 2 }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <Transition name="accordion">
                <BookingStep2City
                  v-if="currentStep === 2"
                  :selected-city="localSelectedCity"
                  :is-completed="isStep2Completed"
                  :saved-city="savedCity"
                  @select="handleCitySelect"
                  @reset="handleCityReset"
                  @update:selected-city="localSelectedCity = $event; emit('update:selectedCity', $event)"
                />
              </Transition>
            </div>

            <!-- ÉTAPE 3 : QUELLE EST VOTRE VOITURE -->
            <div ref="step3Ref" class="mb-1 md:mb-2">
              <button
                @click="toggleStep(3)"
                :disabled="!isStep1Completed || !isStep2Completed"
                class="w-full flex items-center justify-between p-1.5 md:p-3 rounded-lg md:rounded-xl transition-all"
                :class="{ 
                  'border-2': currentStep === 3,
                  'bg-green-50 border-2 border-green-500 hover:bg-green-100': isStep3Completed && currentStep !== 3,
                  'bg-gray-50 hover:bg-gray-100': ((!isStep1Completed || !isStep2Completed) && !isStep3Completed) || ((isStep1Completed && isStep2Completed) && currentStep !== 3),
                  'opacity-50 cursor-not-allowed': !isStep1Completed || !isStep2Completed,
                  'cursor-pointer': isStep1Completed && isStep2Completed
                }"
                :style="currentStep === 3 ? { backgroundColor: '#F3F3F3', borderColor: '#3D3333' } : {}"
              >
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <div 
                    class="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm"
                    :class="isStep3Completed ? 'bg-gradient-to-br from-green-600 to-green-500' : (isStep1Completed && isStep2Completed) ? 'bg-gradient-to-br from-orange-primary to-orange-hover' : 'bg-gray-300'"
                  >
                    <span v-if="isStep3Completed" class="text-base md:text-lg">✓</span>
                    <span v-else>3</span>
                  </div>
                  <div class="flex items-center gap-2 flex-1 min-w-0">
                    <div class="flex-1 text-left min-w-0">
                      <span class="font-semibold text-sm md:text-base block" :class="{ 'text-gray-500 text-xs md:text-sm': isStep3Completed && currentStep !== 3 }">Votre voiture ?</span>
                      <span v-if="isStep3Completed && currentStep !== 3" class="text-xs md:text-sm font-bold text-orange-primary truncate block mt-0.5">{{ selectedVehicleLabel }}</span>
                    </div>
                  </div>
                </div>
                <svg class="w-5 h-5 transition-transform flex-shrink-0" :class="{ 'rotate-180': currentStep === 3 }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <Transition name="accordion">
                <BookingStep3Vehicle
                  v-if="currentStep === 3"
                  :license-plate="localLicensePlate"
                  :is-completed="isStep3Completed"
                  :selected-vehicle="foundVehicle"
                  :search-mode="vehicleSearchMode"
                  @select="handleVehicleSelect"
                  @validate="handleVehicleValidate"
                  @reset="handleVehicleReset"
                  @update:license-plate="localLicensePlate = $event; emit('update:licensePlate', $event)"
                  @update:search-mode="vehicleSearchMode = $event"
                />
              </Transition>
            </div>

          </div>

          <!-- Footer sticky tout en bas (compact mobile) -->
          <div class="flex-shrink-0 sticky bottom-0 bg-white border-t-2 border-gray-100 p-2 md:p-3 shadow-2xl">
            <button
              @click="handleSubmit"
              :disabled="!allStepsCompleted"
              class="w-full px-4 py-2.5 md:py-3 rounded-lg font-bold text-sm md:text-base text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group"
              :class="allStepsCompleted 
                ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/50 cursor-pointer' 
                : 'bg-gray-400 cursor-not-allowed opacity-60'"
            >
              <span>VOIR LES TARIFS</span>
              <span class="transition-transform text-base md:text-lg" :class="{ 'group-hover:translate-x-1': allStepsCompleted }">→</span>
            </button>
            
            <div class="flex flex-wrap items-center justify-center gap-1 md:gap-1.5 mt-1 md:mt-1.5 text-[10px] md:text-xs text-gray-600">
              <span class="flex items-center gap-0.5 md:gap-1 whitespace-nowrap">
                <span class="text-orange-primary font-bold text-xs">✓</span>
                Sans engagement
              </span>
              <span class="text-gray-300">•</span>
              <span class="flex items-center gap-0.5 md:gap-1 whitespace-nowrap">
                <span class="text-orange-primary font-bold text-xs">✓</span>
                Réponse en <strong>30s</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Animation Modal Fade */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Animation Modal Scale In */
@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-modal-in {
  animation: modal-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Accordion Transition */
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.accordion-enter-to,
.accordion-leave-from {
  opacity: 1;
  max-height: 2000px;
  transform: translateY(0);
}

</style>

