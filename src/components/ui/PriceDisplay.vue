<script setup lang="ts">
import { computed } from 'vue'
import { useBookingContext } from '@/composables/useBookingContext'
import type { Service } from '@/types/service'

/**
 * Props
 */
interface Props {
  service: Service
  showCallToAction?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  showCallToAction: true,
  size: 'lg'
})

/**
 * Emits
 */
const emit = defineEmits<{
  'open-context-modal': []
}>()

/**
 * Booking context
 */
const { hasPricing, savedVehicle } = useBookingContext()

/**
 * Price to display (could be calculated based on vehicle in the future)
 */
const displayPrice = computed(() => {
  if (hasPricing.value) {
    // In the future, calculate price based on vehicle
    // For now, use priceFrom
    return props.service.priceFrom
  }
  return null
})

/**
 * Text size classes based on size prop
 */
const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-2xl'
    case 'md':
      return 'text-3xl'
    case 'lg':
      return 'text-4xl lg:text-5xl'
    default:
      return 'text-4xl lg:text-5xl'
  }
})

/**
 * Handle CTA click
 */
function handleCtaClick() {
  emit('open-context-modal')
}
</script>

<template>
  <!-- Prix personnalisé (avec contexte véhicule) -->
  <div v-if="hasPricing && displayPrice" class="flex items-baseline gap-3">
    <span :class="[sizeClasses, 'font-bold text-orange-primary']">
      {{ displayPrice }}€
    </span>
    <span v-if="savedVehicle" class="text-sm text-gray-500">
      pour votre {{ savedVehicle.make }} {{ savedVehicle.model }}
    </span>
  </div>

  <!-- Prix sur devis (sans contexte) -->
  <div v-else class="space-y-3">
    <div class="flex items-baseline gap-3">
      <span :class="[sizeClasses, 'font-bold text-gray-400']">
        Prix sur devis
      </span>
    </div>
    
    <!-- Call to action pour choisir véhicule -->
    <div v-if="showCallToAction" class="inline-flex items-center gap-2">
      <button
        @click="handleCtaClick"
        class="inline-flex items-center gap-2 px-4 py-2 bg-orange-primary hover:bg-orange-hover text-white font-semibold text-sm rounded-lg transition-all shadow-md hover:shadow-lg"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <span>Choisir mon véhicule pour voir le prix</span>
      </button>
    </div>
    
    <!-- Prix indicatif -->
    <p class="text-sm text-gray-600">
      À partir de <span class="font-bold text-gray-700">{{ service.priceFrom }}€</span>*
      <span class="text-xs italic ml-1">(prix indicatif)</span>
    </p>
  </div>
</template>
