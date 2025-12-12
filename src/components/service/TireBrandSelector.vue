<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { tireBrands, type TireBrand } from '@/mocks/tireBrands'

interface Props {
  modelValue?: string
  // Sélections actuelles pour recalcul dynamique
  nombrePneus?: string
  dimension?: string
  typePneu?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  nombrePneus: undefined,
  dimension: undefined,
  typePneu: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'dropdown-opened': [] // Émit quand dropdown s'ouvre (pour scroll auto)
}>()

// State
const isOpen = ref(false)
const isLoadingBrands = ref(false)

/**
 * Recalcule les prix et disponibilités selon les sélections
 */
const dynamicBrands = computed(() => {
  return tireBrands.map(brand => {
    // Multiplicateur selon nombre de pneus (défaut 2 si non renseigné)
    const quantityMultiplier = props.nombrePneus === '4' ? 4 : 2
    
    // Modificateur selon type de pneu
    let typeModifier = 0
    if (props.typePneu === 'hiver') {
      typeModifier = 15
    } else if (props.typePneu === '4-saisons') {
      typeModifier = 10
    }
    
    // Recalcul prix
    const newPriceMin = (brand.priceMin + typeModifier) * quantityMultiplier
    const newPriceMax = (brand.priceMax + typeModifier) * quantityMultiplier
    
    // Recalcul types disponibles (simulé - en réalité viendrait d'une API)
    let typesAvailable = brand.typesAvailable
    if (props.typePneu === 'hiver' && brand.id === 'budget') {
      typesAvailable = 1 // Budget a moins de choix en hiver
    }
    
    return {
      ...brand,
      priceMin: newPriceMin,
      priceMax: newPriceMax,
      typesAvailable
    }
  })
})

// Selected brand (dynamique)
const selectedBrand = computed(() => {
  if (!props.modelValue) return null
  return dynamicBrands.value.find(b => b.id === props.modelValue) || null
})

/**
 * Watch des sélections pour simuler loader
 */
watch([() => props.nombrePneus, () => props.dimension, () => props.typePneu], async () => {
  if (props.nombrePneus && props.typePneu) {
    // Fermer le dropdown avant le rechargement
    isOpen.value = false
    
    // Simuler chargement API
    isLoadingBrands.value = true
    await new Promise(resolve => setTimeout(resolve, 400))
    isLoadingBrands.value = false
  }
})

/**
 * Watch isOpen pour émettre événement scroll
 */
watch(isOpen, (newValue) => {
  if (newValue) {
    // Dropdown ouvert → trigger scroll
    emit('dropdown-opened')
  }
})

/**
 * Toggle dropdown
 */
function toggleDropdown() {
  if (!isLoadingBrands.value) {
    isOpen.value = !isOpen.value
  }
}

/**
 * Select a brand
 */
function selectBrand(brand: TireBrand) {
  emit('update:modelValue', brand.id)
  isOpen.value = false
}

/**
 * Close dropdown when clicking outside
 */
function closeDropdown() {
  isOpen.value = false
}
</script>

<template>
  <div class="relative">
    <!-- Trigger Button -->
    <button
      type="button"
      class="w-full flex items-center justify-between gap-2 p-2.5 md:p-3 border-2 rounded-lg transition-all"
      :class="[
        isOpen ? 'border-orange-primary ring-2 ring-orange-primary/20' : '',
        selectedBrand 
          ? 'border-orange-primary bg-orange-50' 
          : 'border-gray-200 hover:border-gray-300 bg-white',
        isLoadingBrands ? 'opacity-70 cursor-wait' : ''
      ]"
      @click="toggleDropdown"
      :disabled="isLoadingBrands"
    >
      <!-- Loader -->
      <Icon 
        v-if="isLoadingBrands" 
        icon="mdi:loading" 
        class="w-5 h-5 md:w-6 md:h-6 text-orange-primary animate-spin flex-shrink-0"
      />
      
      <!-- Selected brand -->
      <div v-else-if="selectedBrand" class="flex items-center gap-2 flex-1 text-left min-w-0">
        <Icon :icon="selectedBrand.logo" class="w-6 h-6 md:w-7 md:h-7 text-gray-700 flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <div class="text-sm md:text-base font-bold text-gray-900 truncate">{{ selectedBrand.name }}</div>
          <div class="text-[10px] md:text-xs text-gray-600 truncate">
            {{ selectedBrand.typesAvailable }} types • {{ selectedBrand.priceMin }}-{{ selectedBrand.priceMax }}€
          </div>
        </div>
      </div>
      
      <!-- Placeholder -->
      <div v-else class="flex-1 text-left text-sm md:text-base text-gray-500">
        Sélectionner une marque
      </div>
      
      <Icon 
        v-if="!isLoadingBrands"
        :icon="isOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'" 
        class="w-5 h-5 text-gray-400 flex-shrink-0"
      />
    </button>
    
    <!-- Dropdown (s'ouvre en dessous) -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-xl border-2 border-gray-200 z-50 max-h-[400px] overflow-hidden flex flex-col"
      >
        <!-- Options List -->
        <div class="overflow-y-auto relative">
          <!-- Overlay loader pendant recalcul -->
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div v-if="isLoadingBrands" class="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div class="flex flex-col items-center gap-2">
                <Icon icon="mdi:loading" class="w-8 h-8 text-orange-primary animate-spin" />
                <p class="text-xs text-gray-600 font-medium">Mise à jour des prix...</p>
              </div>
            </div>
          </Transition>
          
          <button
            v-for="brand in dynamicBrands"
            :key="brand.id"
            type="button"
            class="w-full flex items-center gap-2 p-2 md:p-2.5 border-b border-gray-100 last:border-b-0 transition-all text-left hover:bg-gray-50"
            :class="selectedBrand?.id === brand.id ? 'bg-orange-50' : ''"
            @click="selectBrand(brand)"
            :disabled="isLoadingBrands"
          >
            <!-- Logo -->
            <Icon 
              :icon="brand.logo" 
              class="w-7 h-7 md:w-8 md:h-8 text-gray-700 flex-shrink-0"
            />
            
            <!-- Content -->
            <div class="flex-1 min-w-0">
              <!-- Brand name + badge -->
              <div class="flex items-center gap-1.5 mb-0.5">
                <span class="text-sm md:text-base font-bold text-gray-900 truncate">{{ brand.name }}</span>
                <span 
                  v-if="brand.isPopular" 
                  class="text-[9px] md:text-[10px] px-1.5 py-0.5 bg-orange-primary text-white rounded-full flex-shrink-0"
                >
                  TOP
                </span>
              </div>
              
              <!-- Info compact -->
              <div class="flex items-center gap-2 text-[10px] md:text-xs text-gray-600">
                <span class="font-medium">{{ brand.typesAvailable }} types</span>
                <span class="text-orange-600 font-bold">{{ brand.priceMin }}-{{ brand.priceMax }}€</span>
                <span class="text-green-600 flex items-center gap-0.5">
                  <Icon icon="mdi:check-circle" class="w-3 h-3" />
                  Pose
                </span>
              </div>
            </div>
            
            <!-- Check icon -->
            <Icon
              v-if="selectedBrand?.id === brand.id"
              icon="mdi:check-circle"
              class="w-5 h-5 text-orange-primary flex-shrink-0"
            />
          </button>
        </div>
      </div>
    </Transition>
    
    <!-- Backdrop pour fermer le dropdown (mobile) -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 md:hidden"
      @click="closeDropdown"
    />
  </div>
</template>


