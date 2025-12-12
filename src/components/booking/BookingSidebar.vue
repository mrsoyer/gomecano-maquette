<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart.store'
import { useBookingStore } from '@/stores/booking.store'

/**
 * Props
 */
interface Props {
  showPromo?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showPromo: false
})

/**
 * Stores
 */
const cartStore = useCartStore()
const bookingStore = useBookingStore()

/**
 * Computed - Total with discount
 */
const totalWithDiscount = computed(() => {
  const baseTotal = cartStore.total
  const discountAmount = baseTotal * bookingStore.discount
  return baseTotal - discountAmount
})
</script>

<template>
  <aside class="sticky top-6 w-full">
    <div class="bg-orange-50/30 rounded-2xl shadow-lg overflow-hidden border border-orange-100">
      <!-- Header -->
      <div class="bg-white px-5 py-4 flex justify-between items-center border-b">
        <h3 class="text-lg font-bold text-gray-900">Mon panier</h3>
        <button class="text-xs text-orange-600 hover:underline font-medium">
          Modifier le panier
        </button>
      </div>

      <!-- Vehicle with Photo -->
      <div v-if="cartStore.vehicle" class="bg-white px-5 py-4 border-b">
        <div class="flex items-center gap-3">
          <div class="flex-1 min-w-0">
            <p class="font-bold text-gray-900 text-sm">
              {{ cartStore.vehicle.make }} {{ cartStore.vehicle.model }}
            </p>
            <p class="text-xs text-gray-600 mt-0.5">
              {{ cartStore.vehicle.year }}
            </p>
            <p class="text-xs text-gray-600">
              {{ cartStore.vehicle.year }} · {{ cartStore.vehicle.mileage?.toLocaleString() }} km
            </p>
          </div>
        </div>
      </div>

      <!-- Services List -->
      <div class="px-5 py-4 space-y-3">
        <div v-if="cartStore.services.length === 0" class="text-center py-4 text-gray-500">
          <p class="text-xs">Aucun service sélectionné</p>
        </div>

        <div
          v-for="service in cartStore.services"
          :key="service.id"
          class="flex justify-between items-start gap-3"
        >
          <span class="text-xs text-gray-800 leading-snug">
            {{ service.name }}
          </span>
          <span class="text-xs font-bold text-gray-900 whitespace-nowrap">
            {{ service.price.toFixed(2) }}€
          </span>
        </div>

        <!-- Collecte & Restitution (gratuit) -->
        <div v-if="cartStore.collectDateTime" class="flex justify-between items-start gap-3">
          <span class="text-xs text-gray-800 leading-snug">
            Collecte et restitution
          </span>
          <span class="text-xs font-bold text-orange-600 whitespace-nowrap flex items-center gap-1">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
            </svg>
            Gratuit
          </span>
        </div>
      </div>

      <!-- Total -->
      <div class="bg-white px-5 py-4 border-t">
        <div class="flex justify-between items-baseline mb-1">
          <span class="text-sm font-semibold text-gray-900">Total TTC</span>
          <span class="text-2xl font-bold text-gray-900">
            {{ totalWithDiscount.toFixed(2) }}€
          </span>
        </div>
        <button class="text-xs text-orange-600 hover:underline">
          Voir le prix détaillé
        </button>
      </div>

      <!-- Credits -->
      <div class="px-5 py-3 border-t">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
            </svg>
            <span class="text-xs text-gray-800">Vos crédits: 0€</span>
          </div>
          <button class="text-xs text-gray-400 font-medium">
            Appliquer
          </button>
        </div>
      </div>

      <!-- Code Promo -->
      <div class="px-5 py-3 border-t">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            <span class="text-xs text-gray-800">Code Promo</span>
          </div>
          <button class="text-xs text-orange-600 hover:underline font-medium">
            Ajouter
          </button>
        </div>
      </div>

      <!-- Promo Slot (when expanded) -->
      <div v-if="showPromo" class="px-5 py-3 border-t bg-white">
        <slot name="promo" />
      </div>
    </div>

    <!-- Vehicle & Location Info Block -->
    <div v-if="cartStore.vehicle || cartStore.location" class="mt-4 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      <!-- Vehicle Section -->
      <div v-if="cartStore.vehicle" class="px-5 py-4 border-b border-gray-100">
        <h4 class="text-sm font-bold text-gray-900 mb-3">Véhicule</h4>
        <div class="flex items-start gap-3">
          <!-- Vehicle Photo -->
          <div class="flex-shrink-0">
            <div 
              class="w-28 h-20 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center"
            >
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
              </svg>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-gray-900 text-sm mb-1">
              {{ cartStore.vehicle.make }} {{ cartStore.vehicle.model }}
            </p>
            <p class="text-xs text-gray-700 mb-1">
              {{ cartStore.vehicle.year }}
            </p>
            <div class="flex items-center gap-2 mt-2">
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
              </svg>
              <span class="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                {{ cartStore.vehicle.plate }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Location Section -->
      <div v-if="cartStore.location" class="px-5 py-4">
        <h4 class="text-sm font-bold text-gray-900 mb-3">Localisation</h4>
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <div>
            <p class="text-xs font-semibold text-gray-900">
              {{ cartStore.location.postalCode }} {{ cartStore.location.city }}
            </p>
            <p v-if="cartStore.location.street" class="text-xs text-gray-600 mt-0.5">
              {{ cartStore.location.street }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
