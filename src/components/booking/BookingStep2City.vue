<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useGooglePlaces, type CityResult } from '@/composables/useGooglePlaces'

/**
 * Props
 */
interface Props {
  selectedCity?: string
  isCompleted?: boolean
  savedCity?: CityResult | null
}

const props = withDefaults(defineProps<Props>(), {
  selectedCity: '',
  isCompleted: false,
  savedCity: null
})

/**
 * Emits
 */
const emit = defineEmits<{
  select: [city: CityResult]
  reset: []
  'update:selectedCity': [value: string]
}>()

/**
 * City search state
 */
const postalCode = ref('')
const selectedCityObject = ref<CityResult | null>(null)
const { isLoading: isSearchingCity, error: citySearchError, cities: citiesFound, searchByPostalCode, clearResults } = useGooglePlaces()

/**
 * Reference to cities list element for scrolling
 */
const citiesListRef = ref<HTMLElement | null>(null)

/**
 * Reference to postal code input for blur
 */
const postalCodeInputRef = ref<HTMLInputElement | null>(null)

/**
 * Watch postal code and trigger search when 5 digits entered
 */
watch(postalCode, async (newValue, oldValue) => {
  // If user is modifying and there's a saved city, reset it
  if (props.savedCity && newValue !== oldValue && newValue.length > 0) {
    emit('reset')
  }
  
  if (newValue.length === 5) {
    await searchByPostalCode(newValue)
    // Close keyboard automatically when postal code is complete
    await nextTick()
    if (postalCodeInputRef.value) {
      postalCodeInputRef.value.blur()
    }
  } else {
    clearResults()
  }
})

/**
 * Auto-scroll to cities list when cities appear
 */
watch(citiesFound, async (newCities) => {
  if (newCities.length > 0) {
    // Wait for DOM to update
    await nextTick()
    // Scroll to cities list
    if (citiesListRef.value) {
      citiesListRef.value.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      })
    }
  }
})

/**
 * Format postal code input
 */
function formatPostalCode() {
  // Keep only digits and limit to 5
  postalCode.value = postalCode.value.replace(/\D/g, '').substring(0, 5)
}

/**
 * Handle city selection
 */
function selectCity(city: CityResult) {
  selectedCityObject.value = city
  emit('update:selectedCity', city.name)
  emit('select', city)
}
</script>

<template>
  <div class="mt-2 p-3 bg-white rounded-xl border-2 border-gray-100">
    <!-- Input Code Postal avec 5 cases visuelles -->
    <div class="mb-4">
      <label class="block text-sm font-bold text-gray-900 mb-2 text-center">Code postal</label>
      <div class="flex justify-center">
        <div class="postal-code-container relative">
          <!-- 5 cases visuelles en background -->
          <div class="postal-code-boxes">
            <div class="postal-box" :class="{ 'filled': postalCode[0] }">{{ postalCode[0] || '' }}</div>
            <div class="postal-box" :class="{ 'filled': postalCode[1] }">{{ postalCode[1] || '' }}</div>
            <div class="postal-box" :class="{ 'filled': postalCode[2] }">{{ postalCode[2] || '' }}</div>
            <div class="postal-box" :class="{ 'filled': postalCode[3] }">{{ postalCode[3] || '' }}</div>
            <div class="postal-box" :class="{ 'filled': postalCode[4] }">{{ postalCode[4] || '' }}</div>
          </div>
          <!-- Input invisible par-dessus -->
          <input
            ref="postalCodeInputRef"
            type="text"
            inputmode="numeric"
            v-model="postalCode"
            @input="formatPostalCode"
            maxlength="5"
            class="postal-code-input"
          />
        </div>
      </div>
      <p class="text-xs text-gray-500 mt-1.5 text-center">5 chiffres</p>
    </div>

    <!-- Loading state -->
    <div v-if="isSearchingCity" class="text-center py-4">
      <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-primary"></div>
      <p class="text-xs text-gray-500 mt-2">Recherche en cours...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="citySearchError" class="text-center py-3">
      <p class="text-xs text-red-600">{{ citySearchError }}</p>
    </div>

    <!-- Cities list -->
    <div v-else-if="citiesFound.length > 0" ref="citiesListRef" class="space-y-2">
      <p class="text-sm font-bold text-gray-900 mb-3 text-center">
        Choisissez votre ville
      </p>
      <button
        v-for="city in citiesFound"
        :key="city.name"
        @click="selectCity(city)"
        class="w-full p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-orange-primary hover:bg-orange-50 transition-all text-left group"
      >
        <p class="font-bold text-sm text-gray-900 group-hover:text-orange-primary">{{ city.name }}</p>
        <p class="text-xs text-gray-500 mt-0.5">{{ city.postalCode }}</p>
      </button>
    </div>

    <!-- Empty state -->
    <div v-else-if="postalCode.length === 5" class="text-center py-3">
      <p class="text-xs text-gray-500">Entrez un code postal valide</p>
    </div>
    
    <!-- Initial state -->
    <div v-else class="text-center py-3">
      <p class="text-xs text-gray-500">Entrez votre code postal (5 chiffres)</p>
    </div>
  </div>
</template>

<style scoped>
/* Postal Code Input with 5 boxes */
.postal-code-container {
  position: relative;
  display: inline-block;
}

.postal-code-boxes {
  display: flex;
  gap: 8px;
  pointer-events: none;
}

.postal-box {
  width: 48px;
  height: 56px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  background: white;
  transition: all 0.2s ease;
}

.postal-box.filled {
  border-color: #10b981;
  background: #ecfdf5;
  color: #059669;
}

.postal-code-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: text;
  font-size: 1.25rem;
  text-align: center;
  z-index: 10;
}

.postal-code-input:focus ~ .postal-code-boxes .postal-box {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
}

.postal-code-container:hover .postal-box {
  border-color: #10b981;
}
</style>
