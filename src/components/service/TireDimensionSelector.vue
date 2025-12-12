<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import type { TireDimension } from '@/mocks/tireDimensions'
import { formatTireDimension } from '@/mocks/tireDimensions'

interface Props {
  suggestedDimensions: TireDimension[]
  explanationImage?: string
  explanationText?: string
  modelValue?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

/**
 * Mode de sélection: 'suggested' ou 'manual'
 */
const selectionMode = ref<'suggested' | 'manual'>('suggested')

/**
 * Dimension suggérée sélectionnée
 */
const selectedSuggested = ref<string>('')

/**
 * Sélecteurs manuels
 */
const largeur = ref<string>('')
const hauteur = ref<string>('')
const diametre = ref<string>('')
const charge = ref<string>('')
const vitesse = ref<string>('')

/**
 * Toggle image d'explication
 */
const showExplanation = ref(false)

/**
 * Dimension manuelle formatée
 */
const manualDimension = computed(() => {
  if (!largeur.value || !hauteur.value || !diametre.value || !charge.value || !vitesse.value) {
    return ''
  }
  return formatTireDimension(largeur.value, hauteur.value, diametre.value, charge.value, vitesse.value)
})

/**
 * Valeur finale (suggérée ou manuelle)
 */
const finalValue = computed(() => {
  if (selectionMode.value === 'suggested') {
    return selectedSuggested.value
  }
  return manualDimension.value
})

/**
 * Emit la valeur finale
 */
watch(finalValue, (newValue) => {
  emit('update:modelValue', newValue)
})

/**
 * Sélectionner une dimension suggérée
 */
function selectSuggestedDimension(dimension: TireDimension) {
  selectionMode.value = 'suggested'
  selectedSuggested.value = dimension.value
  
  // Auto-remplir les sélecteurs manuels aussi (pour référence)
  largeur.value = dimension.largeur
  hauteur.value = dimension.hauteur
  diametre.value = dimension.diametre
  charge.value = dimension.charge
  vitesse.value = dimension.vitesse
}

/**
 * Switch vers mode manuel
 */
function switchToManual() {
  selectionMode.value = 'manual'
}

/**
 * Watch des sélecteurs manuels pour switcher en mode manuel
 */
watch([largeur, hauteur, diametre, charge, vitesse], () => {
  if (selectionMode.value === 'suggested' && manualDimension.value) {
    // Si modification manuelle → switch mode
    selectionMode.value = 'manual'
  }
})

/**
 * Init depuis modelValue si fourni
 */
if (props.modelValue) {
  const suggested = props.suggestedDimensions.find(d => d.value === props.modelValue)
  if (suggested) {
    selectSuggestedDimension(suggested)
  }
}
</script>

<template>
  <div class="space-y-2">
    <!-- Dimensions suggérées (selon véhicule) -->
    <div v-if="suggestedDimensions.length > 0" class="space-y-1.5">
      <p class="text-[11px] md:text-xs text-gray-600">
        Dimensions compatibles avec votre véhicule :
      </p>
      
      <div class="grid grid-cols-2 gap-1.5">
        <button
          v-for="dimension in suggestedDimensions"
          :key="dimension.value"
          @click="selectSuggestedDimension(dimension)"
          class="relative p-2 border-2 rounded-lg text-left transition-all"
          :class="{
            'border-orange-primary bg-orange-50': selectedSuggested === dimension.value && selectionMode === 'suggested',
            'border-gray-200 hover:border-gray-300': selectedSuggested !== dimension.value || selectionMode !== 'suggested'
          }"
        >
          <!-- Badge d'origine -->
          <span
            v-if="dimension.isOEM"
            class="absolute -top-1.5 -right-1.5 bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full"
          >
            ORIGINE
          </span>
          
          <div class="flex items-center justify-between">
            <span class="text-xs md:text-sm font-bold text-gray-900">
              {{ dimension.label }}
            </span>
            <Icon
              v-if="selectedSuggested === dimension.value && selectionMode === 'suggested'"
              icon="mdi:check-circle"
              class="w-4 h-4 text-orange-primary"
            />
          </div>
        </button>
      </div>
    </div>

    <!-- Bouton toggle explication (compact) -->
    <button
      v-if="explanationImage || explanationText"
      @click="showExplanation = !showExplanation"
      class="w-full flex items-center justify-between gap-2 px-2 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
    >
      <div class="flex items-center gap-1.5">
        <Icon icon="mdi:information" class="w-4 h-4 text-blue-600 flex-shrink-0" />
        <span class="text-[11px] md:text-xs text-blue-800 font-medium">
          Où trouver les dimensions ?
        </span>
      </div>
      <Icon 
        :icon="showExplanation ? 'mdi:chevron-up' : 'mdi:chevron-down'" 
        class="w-4 h-4 text-blue-600"
      />
    </button>

    <!-- Image explication (togglable) -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div v-if="showExplanation" class="bg-blue-50 border border-blue-200 rounded-lg p-2">
        <p v-if="explanationText" class="text-[10px] md:text-xs text-blue-800 mb-2">
          {{ explanationText }}
        </p>
        <img
          v-if="explanationImage"
          :src="explanationImage"
          alt="Lecture dimensions pneu"
          class="w-full rounded-lg"
          loading="lazy"
        />
      </div>
    </Transition>

    <!-- Sélecteurs manuels (compacts) -->
    <div class="space-y-1.5">
      <p class="text-[11px] md:text-xs text-gray-600">
        Ou saisissez manuellement :
      </p>

      <div class="grid grid-cols-5 gap-1.5">
        <!-- Largeur -->
        <div>
          <label class="block text-[9px] md:text-[10px] text-gray-600 mb-0.5 font-medium">
            Largeur
          </label>
          <input
            v-model="largeur"
            type="number"
            placeholder="205"
            min="145"
            max="315"
            class="w-full px-1.5 py-1.5 text-[11px] md:text-xs border border-gray-300 rounded-md focus:border-blue-primary focus:ring-1 focus:ring-blue-primary"
          />
          <span class="text-[8px] md:text-[9px] text-gray-500 mt-0.5 block">mm</span>
        </div>

        <!-- Hauteur -->
        <div>
          <label class="block text-[9px] md:text-[10px] text-gray-600 mb-0.5 font-medium">
            Hauteur
          </label>
          <input
            v-model="hauteur"
            type="number"
            placeholder="55"
            min="25"
            max="85"
            class="w-full px-1.5 py-1.5 text-[11px] md:text-xs border border-gray-300 rounded-md focus:border-blue-primary focus:ring-1 focus:ring-blue-primary"
          />
          <span class="text-[8px] md:text-[9px] text-gray-500 mt-0.5 block">%</span>
        </div>

        <!-- Diamètre -->
        <div>
          <label class="block text-[9px] md:text-[10px] text-gray-600 mb-0.5 font-medium">
            Diamètre
          </label>
          <input
            v-model="diametre"
            type="number"
            placeholder="16"
            min="13"
            max="22"
            class="w-full px-1.5 py-1.5 text-[11px] md:text-xs border border-gray-300 rounded-md focus:border-blue-primary focus:ring-1 focus:ring-blue-primary"
          />
          <span class="text-[8px] md:text-[9px] text-gray-500 mt-0.5 block">pouces</span>
        </div>

        <!-- Charge -->
        <div>
          <label class="block text-[9px] md:text-[10px] text-gray-600 mb-0.5 font-medium">
            Charge
          </label>
          <input
            v-model="charge"
            type="number"
            placeholder="91"
            min="60"
            max="120"
            class="w-full px-1.5 py-1.5 text-[11px] md:text-xs border border-gray-300 rounded-md focus:border-blue-primary focus:ring-1 focus:ring-blue-primary"
          />
          <span class="text-[8px] md:text-[9px] text-gray-500 mt-0.5 block">indice</span>
        </div>

        <!-- Vitesse -->
        <div>
          <label class="block text-[9px] md:text-[10px] text-gray-600 mb-0.5 font-medium">
            Vitesse
          </label>
          <select
            v-model="vitesse"
            class="w-full px-1.5 py-1.5 text-[11px] md:text-xs border border-gray-300 rounded-md focus:border-blue-primary focus:ring-1 focus:ring-blue-primary"
          >
            <option value="">-</option>
            <option value="T">T</option>
            <option value="H">H</option>
            <option value="V">V</option>
            <option value="W">W</option>
            <option value="Y">Y</option>
            <option value="Z">Z</option>
          </select>
          <span class="text-[8px] md:text-[9px] text-gray-500 mt-0.5 block">code</span>
        </div>
      </div>

      <!-- Aperçu dimension manuelle (compact) -->
      <div v-if="manualDimension" class="bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-center">
        <p class="text-[9px] md:text-[10px] text-gray-600 mb-0.5">Dimension sélectionnée :</p>
        <p class="text-sm md:text-base font-black text-orange-primary">
          {{ manualDimension }}
        </p>
      </div>
    </div>
  </div>
</template>


