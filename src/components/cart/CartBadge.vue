<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart.store'
import { useCartDrawer } from '@/composables/useCartDrawer'

/**
 * Cart store
 */
const cartStore = useCartStore()
const router = useRouter()
const { toggleDrawer } = useCartDrawer()

/**
 * Service count
 */
const serviceCount = computed(() => cartStore.serviceCount)

/**
 * Total price
 */
const total = computed(() => cartStore.total)

/**
 * Check if mobile
 */
const isMobile = computed(() => {
  return window.innerWidth < 1024 // lg breakpoint
})

/**
 * Handle click
 * Desktop: open drawer
 * Mobile: navigate to /devis
 */
function handleClick() {
  if (isMobile.value) {
    router.push('/devis')
  } else {
    toggleDrawer()
  }
}
</script>

<template>
  <button
    @click="handleClick"
    class="relative flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
  >
    <!-- Icon -->
    <div class="relative">
      <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      
      <!-- Badge count -->
      <div
        v-if="serviceCount > 0"
        class="absolute -top-2 -right-2 w-5 h-5 bg-orange-primary text-white text-xs font-bold rounded-full flex items-center justify-center"
      >
        {{ serviceCount }}
      </div>
    </div>

    <!-- Text -->
    <div class="hidden md:block text-left">
      <p class="text-xs font-semibold text-gray-900 leading-tight">
        Mon devis
      </p>
      <p class="text-xs text-gray-600 leading-tight">
        {{ total }}€
      </p>
    </div>
  </button>
</template>
