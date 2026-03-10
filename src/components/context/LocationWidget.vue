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
const { savedCity, openContextModal } = useBookingContext()

/**
 * Handle click - Open modal on city step
 */
function handleClick() {
  openContextModal(2) // Open on step 2 (city)
}
</script>

<template>
  <!-- Variant: Compact (pour TopBar) -->
  <button
    v-if="variant === 'compact'"
    @click="handleClick"
    class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
  >
    <Icon icon="mdi:map-marker" class="w-5 h-5 text-blue-primary" />
    <div v-if="savedCity" class="text-left">
      <p class="text-xs font-semibold text-gray-900 leading-tight">
        {{ savedCity.name }}
      </p>
      <p class="text-xs text-gray-500 leading-tight">
        {{ savedCity.postalCode }}
      </p>
    </div>
    <span v-else class="text-sm font-medium text-gray-700">
      Votre ville
    </span>
  </button>

  <!-- Variant: Card (pour Sidebar) -->
  <button
    v-else
    @click="handleClick"
    class="w-full bg-white rounded-lg border p-3 shadow-sm transition-all text-left"
    :class="savedCity ? 'border-green-500 hover:border-green-600' : 'border-orange-primary hover:border-orange-hover'"
  >
    <h3 class="text-xs md:text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
      <Icon icon="mdi:map-marker" class="w-4 h-4 md:w-5 md:h-5 text-blue-primary" />
      Localisation
    </h3>
    
    <div v-if="savedCity">
      <p class="font-bold text-sm md:text-base text-gray-900">
        {{ savedCity.name }}
      </p>
      <p class="text-[10px] md:text-xs text-gray-500 mt-0.5">
        {{ savedCity.postalCode }}
      </p>
      <p class="text-[10px] md:text-xs text-blue-600 mt-1.5 flex items-center gap-1">
        <span>✏️</span>
        Modifier la ville
      </p>
    </div>
    <div v-else class="flex items-center gap-2">
      <span class="text-xs md:text-sm text-orange-primary font-semibold">Quelle est votre ville ?</span>
      <svg class="w-3 h-3 md:w-4 md:h-4 text-orange-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </button>
</template>
