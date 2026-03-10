<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useBookingContext } from '@/composables/useBookingContext'
import { useCartStore } from '@/stores/cart.store'
import { useRouter } from 'vue-router'

const router = useRouter()
const cartStore = useCartStore()
const { savedVehicle, savedCity, openContextModal } = useBookingContext()

/**
 * Auth state (placeholder for future implementation)
 */
const isAuthenticated = false // TODO: use userStore when auth is implemented
const userFirstName = 'Thomas' // TODO: from userStore
const userLastName = 'Martin' // TODO: from userStore

/**
 * Open modal at step 1 (always start from beginning)
 */
function openVehicleModal() {
  openContextModal() // Always start at step 1
}

/**
 * Open modal at step 1 (always start from beginning)
 */
function openCityModal() {
  openContextModal() // Always start at step 1
}

/**
 * Navigate to cart/devis page
 */
function goToDevis() {
  router.push('/devis')
}
</script>

<template>
  <div class="bg-gray-100 border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between h-[48px] md:h-[60px] py-2 md:py-3 text-sm">
        <!-- Left: Vehicle + City -->
        <div class="flex items-center gap-1 sm:gap-2 md:gap-3">
          <!-- Vehicle -->
          <button 
            @click="openVehicleModal"
            class="flex items-center gap-1 md:gap-1.5 text-gray-700 hover:text-blue-primary font-medium transition-colors group min-h-[44px] px-1 sm:px-2"
            :title="savedVehicle ? `${savedVehicle.brand} ${savedVehicle.model}` : 'Choisir votre véhicule'"
          >
            <Icon icon="mdi:car" class="w-5 h-5 md:w-4 md:h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
            <!-- Mobile/Tablet : Juste la marque tronquée -->
            <span v-if="savedVehicle" class="hidden sm:inline lg:hidden text-xs md:text-sm truncate max-w-[80px]">
              {{ savedVehicle.brand }}
            </span>
            <!-- Desktop : Marque + Modèle complet -->
            <span v-if="savedVehicle" class="hidden lg:inline text-sm">
              {{ savedVehicle.brand }} {{ savedVehicle.model }}
            </span>
            <!-- Placeholder si pas de véhicule -->
            <span v-if="!savedVehicle" class="hidden md:inline text-sm">
              Véhicule
            </span>
          </button>

          <!-- Separator -->
          <span class="text-gray-300 hidden sm:inline text-xs">|</span>

          <!-- City -->
          <button 
            @click="openCityModal"
            class="flex items-center gap-1 md:gap-1.5 text-gray-700 hover:text-blue-primary font-medium transition-colors group min-h-[44px] px-1 sm:px-2"
            :title="savedCity ? `${savedCity.name} (${savedCity.postalCode})` : 'Choisir votre ville'"
          >
            <Icon icon="mdi:map-marker" class="w-5 h-5 md:w-4 md:h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
            <!-- Mobile/Tablet : Juste la ville tronquée -->
            <span v-if="savedCity" class="hidden sm:inline lg:hidden text-xs md:text-sm truncate max-w-[60px]">
              {{ savedCity.name }}
            </span>
            <!-- Desktop : Ville + Code postal -->
            <span v-if="savedCity" class="hidden lg:inline text-sm">
              {{ savedCity.name }} ({{ savedCity.postalCode }})
            </span>
            <!-- Placeholder si pas de ville -->
            <span v-if="!savedCity" class="hidden md:inline text-sm">
              Ville
            </span>
          </button>
        </div>

        <!-- Right: Cart + Auth -->
        <div class="flex items-center gap-1 sm:gap-2 md:gap-3">
          <!-- Cart / Devis -->
          <button 
            @click="goToDevis"
            class="flex items-center gap-1 sm:gap-2 text-gray-700 hover:text-orange-primary font-medium transition-colors group relative min-h-[44px] px-1 sm:px-2"
            title="Mon devis"
          >
            <Icon icon="mdi:cart-outline" class="w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0" />
            <span class="hidden sm:inline text-xs md:text-sm">Devis</span>
            <!-- Badge count -->
            <span 
              v-if="cartStore.serviceCount > 0" 
              class="absolute -top-1 -right-1 sm:relative sm:top-0 sm:right-0 bg-orange-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            >
              {{ cartStore.serviceCount }}
            </span>
          </button>

          <!-- Separator - masqué sur mobile -->
          <span class="text-gray-300 hidden md:inline">|</span>

          <!-- Auth: Masqué sur mobile (sera dans menu burger) -->
          <div class="hidden md:flex items-center gap-3">
            <!-- Auth: Not authenticated -->
            <template v-if="!isAuthenticated">
              <button class="text-gray-700 hover:text-orange-primary font-medium transition-colors">
                Connexion
              </button>
              <span class="text-gray-300">|</span>
              <button class="text-gray-700 hover:text-orange-primary font-medium transition-colors">
                Inscription
              </button>
            </template>

            <!-- Auth: Authenticated -->
            <template v-else>
              <button class="flex items-center gap-2 text-gray-700 hover:text-orange-primary font-medium transition-colors">
                <Icon icon="mdi:account-circle" class="w-5 h-5" />
                <span class="hidden lg:inline">{{ userFirstName }} {{ userLastName }}</span>
                <span class="lg:hidden">{{ userFirstName }}</span>
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
