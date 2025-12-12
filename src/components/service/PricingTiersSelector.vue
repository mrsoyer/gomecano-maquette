<script setup lang="ts">
import type { ServiceTier } from '@/types/service'
import { Icon } from '@iconify/vue'
import { computed } from 'vue'

interface Props {
  tiers: ServiceTier[]
  selectedTier?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:selectedTier': [tierId: string]
}>()

/**
 * Détecte si les tiers sont des pneus (ont tirePerformance)
 */
const isTireService = computed(() => 
  props.tiers.some(t => t.tirePerformance)
)

/**
 * Titre section adapté
 */
const sectionTitle = computed(() =>  isTireService.value 
    ? 'Choisissez votre modèle de pneu'
    : 'Choisissez votre gamme'
)

/**
 * Mapping icônes caractéristiques pneus
 */
const seasonIcons: Record<string, string> = {
  'summer': 'mdi:white-balance-sunny',
  'winter': 'mdi:snowflake',
  'all-season': 'mdi:weather-partly-cloudy'
}

const seasonLabels: Record<string, string> = {
  'summer': 'Pneu été',
  'winter': 'Pneu hiver',
  'all-season': 'Pneu 4 saisons'
}

/**
 * Couleur badge selon type
 */
function getBadgeColor(badge?: string) {
  switch(badge) {
    case 'BUDGET':
      return 'bg-gray-600 text-white'
    case 'PREMIUM':
      return 'bg-amber-500 text-white'
    case 'STANDARD':
      return 'bg-blue-600 text-white'
    default:
      return 'bg-green-600 text-white'
  }
}

/**
 * Couleur rating (A=vert, G=rouge)
 */
function getRatingColor(rating: string): string {
  const colors: Record<string, string> = {
    'A': 'bg-green-500',
    'B': 'bg-lime-500',
    'C': 'bg-yellow-400',
    'D': 'bg-orange-400',
    'E': 'bg-orange-500',
    'F': 'bg-red-400',
    'G': 'bg-red-500'
  }
  return colors[rating] || 'bg-gray-400'
}

function selectTier(tierId: string) {
  emit('update:selectedTier', tierId)
}
</script>

<template>
  <div class="mb-3">
    <h3 class="text-sm md:text-base font-bold text-gray-900 mb-2">
      {{ sectionTitle }}
    </h3>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
      <button
        v-for="tier in tiers"
        :key="tier.id"
        @click="selectTier(tier.id)"
        class="relative p-3 border-2 rounded-lg text-left transition-all hover:shadow-md"
        :class="selectedTier === tier.id 
          ? 'border-orange-primary bg-orange-50 ring-2 ring-orange-primary/20' 
          : 'border-gray-200 hover:border-gray-300 bg-white'"
      >
        <!-- Badge (BUDGET / PREMIUM / RECOMMANDÉ) -->
        <div
          v-if="tier.badge || tier.recommended"
          :class="[
            'absolute -top-1.5 -right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md z-10',
            tier.badge ? getBadgeColor(tier.badge) : 'bg-green-600 text-white'
          ]"
        >
          {{ tier.badge || '⭐ RECOMMANDÉ' }}
        </div>
        
        <!-- Radio circle -->
        <div class="flex items-center gap-1.5 mb-1.5">
          <div
            class="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors"
            :class="selectedTier === tier.id 
              ? 'border-orange-primary bg-orange-primary' 
              : 'border-gray-300 bg-white'"
          >
            <div 
              v-if="selectedTier === tier.id" 
              class="w-1.5 h-1.5 bg-white rounded-full"
            />
          </div>
          
          <!-- Titre (nom du pneu OU nom de la gamme) -->
          <div class="text-xs md:text-sm font-bold text-gray-900 leading-tight">
            {{ tier.name }}
          </div>
        </div>
        
        <!-- Prix + montage -->
        <div class="mb-1.5">
          <div class="text-xl md:text-2xl font-black text-orange-primary leading-none">
            {{ tier.basePrice || tier.price }}€
          </div>
          <div class="text-[9px] md:text-[10px] text-gray-500">
            + montage
          </div>
        </div>
        
        <!-- Description (dimension pour pneus) -->
        <div class="text-[10px] md:text-xs text-gray-600 mb-2">
          {{ tier.description }}
        </div>
        
        <!-- PNEUS : Performances + Caractéristiques -->
        <template v-if="isTireService && tier.tirePerformance && tier.tireCharacteristics">
          <!-- Icônes de performance (Étiquette européenne) -->
          <div class="flex items-center gap-1.5 mb-2">
            <!-- Carburant -->
            <div class="flex flex-col items-center">
              <Icon icon="mdi:gas-station" class="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
              <span 
                :class="[
                  'text-[10px] font-bold px-1 py-0.5 rounded text-white',
                  getRatingColor(tier.tirePerformance.fuelEfficiency)
                ]"
              >
                {{ tier.tirePerformance.fuelEfficiency }}
              </span>
            </div>
            
            <!-- Adhérence mouillé -->
            <div class="flex flex-col items-center">
              <Icon icon="mdi:weather-rainy" class="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
              <span 
                :class="[
                  'text-[10px] font-bold px-1 py-0.5 rounded text-white',
                  getRatingColor(tier.tirePerformance.wetGrip)
                ]"
              >
                {{ tier.tirePerformance.wetGrip }}
              </span>
            </div>
            
            <!-- Bruit -->
            <div class="flex flex-col items-center">
              <Icon icon="mdi:volume-high" class="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
              <div class="flex items-center gap-0.5">
                <span class="text-[10px] font-bold text-gray-700">{{ tier.tirePerformance.noiseClass }}</span>
                <span class="text-[9px] text-gray-500">{{ tier.tirePerformance.noiseLevel }}db</span>
              </div>
            </div>
          </div>
          
          <!-- Caractéristiques saison -->
          <div class="flex items-center gap-1.5 mb-2 flex-wrap">
            <!-- Saison -->
            <div class="flex items-center gap-1 text-[10px] md:text-xs text-gray-700">
              <Icon 
                :icon="seasonIcons[tier.tireCharacteristics.season]" 
                class="w-3 h-3 md:w-4 md:h-4"
                :class="{
                  'text-orange-500': tier.tireCharacteristics.season === 'summer',
                  'text-blue-500': tier.tireCharacteristics.season === 'winter',
                  'text-green-600': tier.tireCharacteristics.season === 'all-season'
                }"
              />
              <span>{{ seasonLabels[tier.tireCharacteristics.season] }}</span>
            </div>
            
            <!-- Loi montagne -->
            <div 
              v-if="tier.tireCharacteristics.isMountainLaw"
              class="flex items-center gap-1 text-[10px] md:text-xs text-gray-700"
            >
              <Icon icon="mdi:image-filter-hdr" class="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
              <span>Loi montagne</span>
            </div>
          </div>
        </template>
        
        <!-- TOUS SERVICES : Features (3 premières lignes) -->
        <div class="text-[10px] md:text-xs space-y-0.5">
          <div
            v-for="(feature, idx) in tier.features.slice(0, 3)"
            :key="idx"
            class="flex items-start gap-1.5"
          >
            <Icon icon="mdi:check" class="w-3 h-3 md:w-4 md:h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span class="text-gray-700 leading-relaxed">{{ feature }}</span>
          </div>
          
          <!-- Indicateur si plus de features -->
          <div v-if="tier.features.length > 3" class="text-gray-500 pt-1">
            +{{ tier.features.length - 3 }} autre{{ tier.features.length > 4 ? 's' : '' }}...
          </div>
        </div>
      </button>
    </div>
  </div>
</template>


