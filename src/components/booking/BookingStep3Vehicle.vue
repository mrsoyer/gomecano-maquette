<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useVehicleSearch, type VehicleSearchMode } from '@/composables/useVehicleSearch'
import type { Vehicle } from '@/types/vehicle'
import { vehicleBrands } from '@/data/vehicleBrands'

/**
 * Props
 */
interface Props {
  licensePlate?: string
  isCompleted?: boolean
  selectedVehicle?: Vehicle | null
  searchMode?: VehicleSearchMode
}

const props = withDefaults(defineProps<Props>(), {
  licensePlate: '',
  isCompleted: false,
  selectedVehicle: null,
  searchMode: 'license'
})

/**
 * Emits
 */
const emit = defineEmits<{
  select: [vehicle: Vehicle]
  validate: []
  reset: []
  'update:licensePlate': [value: string]
  'update:searchMode': [mode: VehicleSearchMode]
}>()

/**
 * Local state
 */
const localLicensePlate = ref(props.licensePlate)
const isPlateValid = computed(() => localLicensePlate.value.length >= 9)

// Vehicle search state (initialize with prop searchMode)
const vehicleSearchMode = ref<VehicleSearchMode>(props.searchMode)
const vinNumber = ref('')
const selectedBrand = ref('')
const selectedModel = ref('')
const selectedVersion = ref('')

/**
 * References to inputs for blur (close keyboard)
 */
const licensePlateInputRef = ref<HTMLInputElement | null>(null)
const vinInputRef = ref<HTMLInputElement | null>(null)
const registrationPhoto = ref<File | null>(null)
const vehicleKilometers = ref('')

// Watch searchMode and emit to parent
watch(vehicleSearchMode, (newMode) => {
  emit('update:searchMode', newMode)
})

// Initialize fields if vehicle is already selected
watch(() => props.selectedVehicle, (vehicle) => {
  if (vehicle) {
    // Initialize license plate if available
    if (vehicle.plate && !localLicensePlate.value) {
      localLicensePlate.value = vehicle.plate
    }
    // Initialize VIN if available
    if (vehicle.vin && !vinNumber.value) {
      vinNumber.value = vehicle.vin
    }
  }
}, { immediate: true })
const { isLoading: isSearchingVehicle, error: vehicleSearchError, foundVehicle: foundVehicleFromSearch, searchByLicensePlate: searchVehicleByPlate, searchByVIN, searchByModel, processRegistrationPhoto, clearResults: clearVehicleResults } = useVehicleSearch()

// Use selectedVehicle from props if available, otherwise use foundVehicleFromSearch
const foundVehicle = computed(() => props.selectedVehicle || foundVehicleFromSearch.value)

// Note: We don't auto-emit foundVehicle anymore
// Vehicle is only validated when user clicks "Valider le véhicule" button

/**
 * Reference to found vehicle element for scrolling
 */
const foundVehicleRef = ref<HTMLElement | null>(null)

// Computed for vehicle models based on selected brand
const availableModels = computed(() => {
  if (!selectedBrand.value) return []
  const brand = vehicleBrands.find(b => b.id === selectedBrand.value)
  return brand?.models || []
})

// Computed for vehicle versions based on selected model  
const availableVersions = computed(() => {
  if (!selectedModel.value) return []
  const model = availableModels.value.find(m => m.id === selectedModel.value)
  return model?.versions || []
})

/**
 * Format license plate
 */
function formatLicensePlate() {
  let value = localLicensePlate.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  
  if (value.length > 2) {
    value = value.substring(0, 2) + '-' + value.substring(2)
  }
  if (value.length > 6) {
    value = value.substring(0, 6) + '-' + value.substring(6)
  }
  if (value.length > 9) {
    value = value.substring(0, 9)
  }
  
  localLicensePlate.value = value
  emit('update:licensePlate', value)
}

/**
 * Format VIN
 */
function formatVIN() {
  vinNumber.value = vinNumber.value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 17)
}

/**
 * Get vehicle image URL
 * Uses placeholder service or generates URL based on make/model
 */
function getVehicleImageUrl(vehicle: Vehicle | null): string | null {
  if (!vehicle) return null
  
  // Use placeholder service for vehicle images
  // Format: https://via.placeholder.com/200x150?text=Make+Model
  const makeModel = `${vehicle.make}+${vehicle.model}`.replace(/\s+/g, '+')
  return `https://via.placeholder.com/200x150/4B5563/FFFFFF?text=${makeModel}`
}

/**
 * Handle image loading error
 */
function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

/**
 * Handle vehicle search
 */
async function handleVehicleSearch() {
  if (vehicleSearchMode.value === 'license' && isPlateValid.value) {
    await searchVehicleByPlate(localLicensePlate.value)
  } else if (vehicleSearchMode.value === 'vin' && vinNumber.value.length === 17) {
    await searchByVIN(vinNumber.value)
  } else if (vehicleSearchMode.value === 'model' && selectedBrand.value && selectedModel.value && selectedVersion.value) {
    const brand = vehicleBrands.find(b => b.id === selectedBrand.value)?.name || ''
    const model = availableModels.value.find(m => m.id === selectedModel.value)?.name || ''
    await searchByModel(brand, model)
  }
}

/**
 * Handle photo upload
 */
async function handlePhotoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    // Reset selected vehicle before processing photo
    if (props.selectedVehicle) {
      emit('reset')
    }
    registrationPhoto.value = file
    await processRegistrationPhoto(file)
  }
}

/**
 * Validate vehicle
 */
function validateVehicle() {
  const vehicleToValidate = props.selectedVehicle || foundVehicleFromSearch.value
  if (vehicleToValidate) {
    emit('select', vehicleToValidate)
    emit('validate')
  }
}

// Watch for auto-search on license plate
watch(() => localLicensePlate.value, async (newValue) => {
  if (vehicleSearchMode.value === 'license' && newValue.length === 9) {
    // Reset selected vehicle before new search
    if (props.selectedVehicle) {
      emit('reset')
    }
    handleVehicleSearch()
    // Close keyboard automatically when license plate is complete
    await nextTick()
    if (licensePlateInputRef.value) {
      licensePlateInputRef.value.blur()
    }
  }
})

// Watch for auto-search on VIN
watch(vinNumber, async (newValue) => {
  if (vehicleSearchMode.value === 'vin' && newValue.length === 17) {
    // Reset selected vehicle before new search
    if (props.selectedVehicle) {
      emit('reset')
    }
    handleVehicleSearch()
    // Close keyboard automatically when VIN is complete
    await nextTick()
    if (vinInputRef.value) {
      vinInputRef.value.blur()
    }
  }
})

// Watch for auto-search on model selection
watch([selectedBrand, selectedModel, selectedVersion], () => {
  if (vehicleSearchMode.value === 'model' && selectedBrand.value && selectedModel.value && selectedVersion.value) {
    // Reset selected vehicle before new search
    if (props.selectedVehicle) {
      emit('reset')
    }
    handleVehicleSearch()
  }
})

/**
 * Auto-scroll to found vehicle when it appears
 */
watch(() => foundVehicle.value, async (newVehicle, oldVehicle) => {
  // Only scroll if a new vehicle appears (not on initial load with selectedVehicle)
  if (newVehicle && !oldVehicle) {
    // Wait for DOM to update
    await nextTick()
    // Scroll to found vehicle
    if (foundVehicleRef.value) {
      foundVehicleRef.value.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      })
    }
  }
})
</script>

<template>
  <div class="mt-2 p-3 bg-white rounded-xl border-2 border-gray-100">
    <!-- Mode selection tabs (TOUJOURS EN HAUT) -->
    <div class="mb-4">
      <p class="text-sm font-bold text-gray-900 mb-3 text-center">Comment souhaitez-vous identifier votre véhicule ?</p>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          @click="vehicleSearchMode = 'license'; clearVehicleResults(); if (props.selectedVehicle) emit('reset')"
          class="group relative p-3 rounded-lg border-2 transition-all"
          :class="vehicleSearchMode === 'license' 
            ? 'bg-blue-50 border-blue-primary shadow-md' 
            : 'bg-white border-gray-200 hover:border-blue-primary hover:shadow-md'"
        >
          <div class="flex flex-col items-center gap-2">
            <div 
              class="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              :class="vehicleSearchMode === 'license' ? 'bg-blue-primary text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-primary'"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span 
              class="text-xs font-semibold text-center transition-colors"
              :class="vehicleSearchMode === 'license' ? 'text-blue-primary' : 'text-gray-700 group-hover:text-blue-primary'"
            >
              Immatriculation
            </span>
          </div>
        </button>
        
        <button
          @click="vehicleSearchMode = 'vin'; clearVehicleResults(); if (props.selectedVehicle) emit('reset')"
          class="group relative p-3 rounded-lg border-2 transition-all"
          :class="vehicleSearchMode === 'vin' 
            ? 'bg-blue-50 border-blue-primary shadow-md' 
            : 'bg-white border-gray-200 hover:border-blue-primary hover:shadow-md'"
        >
          <div class="flex flex-col items-center gap-2">
            <div 
              class="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              :class="vehicleSearchMode === 'vin' ? 'bg-blue-primary text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-primary'"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
            </div>
            <span 
              class="text-xs font-semibold text-center transition-colors"
              :class="vehicleSearchMode === 'vin' ? 'text-blue-primary' : 'text-gray-700 group-hover:text-blue-primary'"
            >
              Numéro VIN
            </span>
          </div>
        </button>
        
        <button
          @click="vehicleSearchMode = 'model'; clearVehicleResults(); if (props.selectedVehicle) emit('reset')"
          class="group relative p-3 rounded-lg border-2 transition-all"
          :class="vehicleSearchMode === 'model' 
            ? 'bg-blue-50 border-blue-primary shadow-md' 
            : 'bg-white border-gray-200 hover:border-blue-primary hover:shadow-md'"
        >
          <div class="flex flex-col items-center gap-2">
            <div 
              class="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              :class="vehicleSearchMode === 'model' ? 'bg-blue-primary text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-primary'"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span 
              class="text-xs font-semibold text-center transition-colors"
              :class="vehicleSearchMode === 'model' ? 'text-blue-primary' : 'text-gray-700 group-hover:text-blue-primary'"
            >
              Par modèle
            </span>
          </div>
        </button>
        
        <button
          @click="vehicleSearchMode = 'photo'; clearVehicleResults(); if (props.selectedVehicle) emit('reset')"
          class="group relative p-3 rounded-lg border-2 transition-all"
          :class="vehicleSearchMode === 'photo' 
            ? 'bg-blue-50 border-blue-primary shadow-md' 
            : 'bg-white border-gray-200 hover:border-blue-primary hover:shadow-md'"
        >
          <div class="flex flex-col items-center gap-2">
            <div 
              class="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              :class="vehicleSearchMode === 'photo' ? 'bg-blue-primary text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-primary'"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span 
              class="text-xs font-semibold text-center transition-colors"
              :class="vehicleSearchMode === 'photo' ? 'text-blue-primary' : 'text-gray-700 group-hover:text-blue-primary'"
            >
              Photo carte grise
            </span>
          </div>
        </button>
      </div>
    </div>

    <!-- Search forms based on mode -->
    <div class="mb-4">
      <!-- License plate search with visual boxes -->
      <div v-if="vehicleSearchMode === 'license'">
        <label class="block text-sm font-bold text-gray-900 mb-2 text-center">Numéro d'immatriculation</label>
        <div class="flex justify-center">
          <div class="license-plate-container relative">
            <!-- 7 cases visuelles (AB-123-CD) -->
            <div class="license-plate-boxes">
              <div class="license-box" :class="{ 'filled': localLicensePlate[0] }">{{ localLicensePlate[0] || '' }}</div>
              <div class="license-box" :class="{ 'filled': localLicensePlate[1] }">{{ localLicensePlate[1] || '' }}</div>
              <div class="license-separator">-</div>
              <div class="license-box" :class="{ 'filled': localLicensePlate[3] }">{{ localLicensePlate[3] || '' }}</div>
              <div class="license-box" :class="{ 'filled': localLicensePlate[4] }">{{ localLicensePlate[4] || '' }}</div>
              <div class="license-box" :class="{ 'filled': localLicensePlate[5] }">{{ localLicensePlate[5] || '' }}</div>
              <div class="license-separator">-</div>
              <div class="license-box" :class="{ 'filled': localLicensePlate[7] }">{{ localLicensePlate[7] || '' }}</div>
              <div class="license-box" :class="{ 'filled': localLicensePlate[8] }">{{ localLicensePlate[8] || '' }}</div>
            </div>
            <!-- Input invisible par-dessus -->
            <input
              ref="licensePlateInputRef"
              type="text"
              v-model="localLicensePlate"
              @input="formatLicensePlate"
              maxlength="9"
              class="license-plate-input"
            />
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-1.5 text-center">
          <span v-if="isPlateValid" class="text-green-600 font-medium">✓ Format valide</span>
          <span v-else>Format: AB-123-CD</span>
        </p>
      </div>

      <!-- VIN search -->
      <div v-else-if="vehicleSearchMode === 'vin'">
        <label class="block text-sm font-bold text-gray-900 mb-2 text-center">Numéro VIN (17 caractères)</label>
        <div class="flex justify-center">
          <input
            ref="vinInputRef"
            type="text"
            v-model="vinNumber"
            @input="formatVIN"
            placeholder="1HGBH41JXMN109186"
            maxlength="17"
            class="max-w-md text-center font-bold text-base h-14 px-4 rounded-lg border-2 border-gray-300 hover:border-green-500 transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 bg-white uppercase tracking-wider"
          />
        </div>
        <p class="text-xs text-gray-500 mt-1.5 text-center">
          <span v-if="vinNumber.length === 17" class="text-green-600 font-medium">✓ VIN complet</span>
          <span v-else>{{ vinNumber.length }}/17 caractères</span>
        </p>
      </div>

      <!-- Model search -->
      <div v-else-if="vehicleSearchMode === 'model'" class="space-y-2">
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Marque</label>
          <select
            v-model="selectedBrand"
            class="w-full text-sm h-8 px-2 rounded-lg border-2 border-gray-300 hover:border-green-500 transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 bg-white"
          >
            <option value="" disabled>Sélectionnez une marque</option>
            <option v-for="brand in vehicleBrands" :key="brand.id" :value="brand.id">
              {{ brand.name }}
            </option>
          </select>
        </div>

        <div v-if="selectedBrand">
          <label class="block text-xs font-semibold text-gray-700 mb-1">Modèle</label>
          <select
            v-model="selectedModel"
            class="w-full text-sm h-8 px-2 rounded-lg border-2 border-gray-300 hover:border-green-500 transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 bg-white"
          >
            <option value="" disabled>Sélectionnez un modèle</option>
            <option v-for="model in availableModels" :key="model.id" :value="model.id">
              {{ model.name }}
            </option>
          </select>
        </div>

        <div v-if="selectedModel">
          <label class="block text-xs font-semibold text-gray-700 mb-1">Version</label>
          <select
            v-model="selectedVersion"
            class="w-full text-sm h-8 px-2 rounded-lg border-2 border-gray-300 hover:border-green-500 transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 bg-white"
          >
            <option value="" disabled>Sélectionnez une version</option>
            <option v-for="version in availableVersions" :key="version.id" :value="version.id">
              {{ version.name }} - {{ version.horsePower }}ch {{ version.fuelType }}
            </option>
          </select>
        </div>
      </div>

      <!-- Photo upload -->
      <div v-else-if="vehicleSearchMode === 'photo'">
        <label class="block text-xs font-semibold text-gray-700 mb-2">Photo de votre carte grise</label>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-all cursor-pointer">
          <input
            type="file"
            accept="image/*"
            @change="handlePhotoUpload"
            class="hidden"
            id="photo-upload"
          />
          <label for="photo-upload" class="cursor-pointer">
            <div class="text-4xl mb-2">📸</div>
            <p class="text-sm font-semibold text-gray-700">Cliquez pour prendre ou choisir une photo</p>
            <p class="text-xs text-gray-500 mt-1">Format: JPG, PNG (max 5MB)</p>
          </label>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="!props.selectedVehicle && isSearchingVehicle" class="text-center py-6">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      <p class="text-xs text-gray-500 mt-2">Recherche du véhicule...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="!props.selectedVehicle && vehicleSearchError" class="text-center py-4">
      <p class="text-xs text-red-600">{{ vehicleSearchError }}</p>
    </div>

    <!-- Found vehicle (EN BAS : soit véhicule sélectionné, soit véhicule trouvé par recherche) -->
    <div v-if="foundVehicle" ref="foundVehicleRef" class="mt-4">
      <p class="text-sm font-bold text-gray-900 mb-3 text-center">Votre véhicule</p>
      <div class="w-full p-4 bg-white border-2 border-gray-200 rounded-xl">
        <div class="flex items-center gap-4 mb-4">
          <!-- Vehicle image -->
          <div class="flex-shrink-0 w-24 h-24 rounded-lg bg-gray-100 border-2 border-gray-200 overflow-hidden flex items-center justify-center">
            <img
              v-if="getVehicleImageUrl(foundVehicle)"
              :src="getVehicleImageUrl(foundVehicle)"
              :alt="`${foundVehicle.make} ${foundVehicle.model}`"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
              <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
          </div>
          <div class="flex-1 text-left">
            <p class="font-bold text-base text-gray-900">
              {{ foundVehicle.make }} {{ foundVehicle.model }}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              {{ foundVehicle.year }}<template v-if="foundVehicle.fuelType"> • {{ foundVehicle.fuelType }}</template>
            </p>
          </div>
        </div>

        <!-- Optional: Kilometers -->
        <div class="pt-3 border-t border-gray-200 mb-3">
          <label class="block text-xs font-semibold text-gray-700 mb-1.5">
            Connaissez-vous le nombre de kilomètres ? <span class="text-gray-400 font-normal">(optionnel)</span>
          </label>
          <input
            type="text"
            v-model="vehicleKilometers"
            placeholder="Ex: 45 000 km"
            class="w-full text-sm h-9 px-3 rounded-lg border-2 border-gray-200 hover:border-green-500 transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 bg-white"
          />
        </div>

        <!-- Validate button -->
        <button
          @click="validateVehicle"
          class="w-full py-2.5 px-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold text-sm rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
        >
          <span>Valider le véhicule</span>
          <span class="group-hover:translate-x-1 transition-transform">✓</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* License Plate Input with 7 boxes (AB-123-CD) */
.license-plate-container {
  position: relative;
  display: inline-block;
}

.license-plate-boxes {
  display: flex;
  gap: 4px;
  align-items: center;
  pointer-events: none;
}

.license-box {
  width: 40px;
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

.license-box.filled {
  border-color: #10b981;
  background: #ecfdf5;
  color: #059669;
}

.license-separator {
  font-size: 1.5rem;
  font-weight: 700;
  color: #6b7280;
  padding: 0 4px;
}

.license-plate-input {
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

.license-plate-input:focus ~ .license-plate-boxes .license-box {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
}

.license-plate-container:hover .license-box {
  border-color: #10b981;
}
</style>
