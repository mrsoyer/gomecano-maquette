<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useBookingContext } from '@/composables/useBookingContext'

/**
 * Props
 */
interface Props {
  variant?: 'compact' | 'card'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'card'
})

/**
 * Booking context
 */
const { savedVehicle, openContextModal } = useBookingContext()

/**
 * Handle click - Open modal on vehicle step
 */
function handleClick() {
  openContextModal(3) // Open on step 3 (vehicle)
}
</script>

<template>
  <!-- Variant: Compact (pour TopBar) -->
  <button
    v-if="variant === 'compact'"
    @click="handleClick"
    class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
  >
    <Icon icon="mdi:car" class="w-5 h-5 text-blue-primary" />
    <div v-if="savedVehicle" class="text-left">
      <p class="text-xs font-semibold text-gray-900 leading-tight">
        {{ savedVehicle.make }} {{ savedVehicle.model }}
      </p>
      <p class="text-xs text-gray-500 leading-tight">
        {{ savedVehicle.year }}
      </p>
    </div>
    <span v-else class="text-sm font-medium text-gray-700">
      Votre véhicule
    </span>
  </button>

  <!-- Variant: Card (pour Sidebar) -->
  <button
    v-else
    @click="handleClick"
    class="w-full bg-white rounded-lg border p-3 shadow-sm transition-all text-left"
    :class="savedVehicle ? 'border-green-500 hover:border-green-600' : 'border-orange-primary hover:border-orange-hover'"
  >
    <h3 class="text-xs md:text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
      <Icon icon="mdi:car" class="w-4 h-4 md:w-5 md:h-5 text-blue-primary" />
      Véhicule
    </h3>
    
    <div v-if="savedVehicle">
      <p class="font-bold text-sm md:text-base text-gray-900">
        {{ savedVehicle.make }} {{ savedVehicle.model }}
      </p>
      <p class="text-[10px] md:text-xs text-gray-500 mt-0.5">
        {{ savedVehicle.year }}<template v-if="savedVehicle.fuelType"> • {{ savedVehicle.fuelType }}</template>
      </p>
      <p class="text-[10px] md:text-xs text-blue-600 mt-1.5 flex items-center gap-1">
        <span>✏️</span>
        Modifier le véhicule
      </p>
    </div>
    <div v-else class="flex items-center gap-2">
      <span class="text-xs md:text-sm text-orange-primary font-semibold">Quel est votre véhicule ?</span>
      <svg class="w-3 h-3 md:w-4 md:h-4 text-orange-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </button>
</template>
