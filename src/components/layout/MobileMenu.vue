<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { useBookingContext } from '@/composables/useBookingContext'
import { useCartStore } from '@/stores/cart.store'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  'open-vehicle-modal': []
  'open-city-modal': []
}>()

const router = useRouter()
const cartStore = useCartStore()
const { savedVehicle, savedCity } = useBookingContext()

const navLinks = [
  { label: 'Services', to: '/services', icon: 'mdi:wrench' },
  { label: 'Entreprises', to: '/entreprises', icon: 'mdi:office-building' },
  { label: 'Devenir mécanicien', to: '/devenir-mecanicien', icon: 'mdi:account-hard-hat' },
  { label: 'À propos', to: '/a-propos', icon: 'mdi:information' },
  { label: 'Contact', to: '/contact', icon: 'mdi:email' },
]

// Auth state (placeholder)
const isAuthenticated = false
const userFirstName = 'Thomas'

/**
 * Navigate to devis page and close menu
 */
function goToDevis() {
  router.push('/devis')
  emit('close')
}

/**
 * Close menu after navigation click
 */
function handleNavClick() {
  emit('close')
}

</script>

<template>
  <Teleport to="body">
    <Transition name="mobile-menu-overlay">
      <div v-if="isOpen" class="fixed inset-0 z-50 lg:hidden">
        <!-- Backdrop -->
        <div 
          class="fixed inset-0 bg-black/50 backdrop-blur-sm"
          @click="$emit('close')"
        />
        
        <!-- Panel -->
        <Transition name="mobile-menu-panel">
          <div v-if="isOpen" class="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl overflow-hidden flex flex-col">
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <div class="flex items-center gap-2">
                <Icon icon="mdi:menu" class="w-6 h-6 text-blue-primary" />
                <span class="font-bold text-lg text-gray-900">Menu</span>
              </div>
              <button 
                @click="$emit('close')"
                class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Fermer le menu"
              >
                <Icon icon="mdi:close" class="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <!-- Body : Scrollable -->
            <div class="flex-1 overflow-y-auto p-4">
              <!-- Section Devis (si panier non vide) -->
              <div v-if="cartStore.serviceCount > 0" class="mb-6">
                <div class="bg-orange-50 border-l-4 border-orange-primary p-4 rounded-r-lg">
                  <div class="flex items-start justify-between mb-3">
                    <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Icon icon="mdi:cart" class="w-5 h-5 text-orange-primary flex-shrink-0" />
                      <span>Mon devis ({{ cartStore.serviceCount }} service{{ cartStore.serviceCount > 1 ? 's' : '' }})</span>
                    </h3>
                    <span class="text-lg font-bold text-orange-primary">{{ cartStore.total }}€</span>
                  </div>
                  
                  <!-- Liste services (3 max) -->
                  <div class="space-y-2 mb-3">
                    <div 
                      v-for="service in cartStore.services.slice(0, 3)" 
                      :key="service.id"
                      class="text-xs text-gray-700 flex justify-between gap-2"
                    >
                      <span class="truncate">{{ service.name }}</span>
                      <span class="font-medium whitespace-nowrap">{{ service.price }}€</span>
                    </div>
                    <p v-if="cartStore.serviceCount > 3" class="text-xs text-gray-500 italic">
                      +{{ cartStore.serviceCount - 3 }} autre{{ cartStore.serviceCount - 3 > 1 ? 's' : '' }}...
                    </p>
                  </div>
                  
                  <!-- CTA Voir le devis -->
                  <button 
                    @click="goToDevis"
                    class="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-primary text-white rounded-lg font-semibold hover:bg-orange-hover transition-colors shadow-sm"
                  >
                    <Icon icon="mdi:eye" class="w-4 h-4" />
                    <span>Voir le devis complet</span>
                  </button>
                </div>
              </div>
              
              <!-- Section 1 : Compte -->
              <div class="mb-6">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Mon compte
                </h3>
                <div class="space-y-2">
                  <template v-if="!isAuthenticated">
                    <button class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <Icon icon="mdi:login" class="w-6 h-6 text-gray-600 flex-shrink-0" />
                      <span class="font-medium">Connexion</span>
                    </button>
                    <button class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <Icon icon="mdi:account-plus" class="w-6 h-6 text-gray-600 flex-shrink-0" />
                      <span class="font-medium">Inscription</span>
                    </button>
                  </template>
                  <template v-else>
                    <button class="w-full flex items-center gap-3 p-3 rounded-lg bg-blue-50 text-left">
                      <Icon icon="mdi:account-circle" class="w-6 h-6 text-blue-primary flex-shrink-0" />
                      <div>
                        <div class="font-medium">{{ userFirstName }}</div>
                        <div class="text-xs text-gray-500">Mon compte</div>
                      </div>
                    </button>
                  </template>
                </div>
              </div>
              
              <!-- Section 2 : Contexte -->
              <div class="mb-6">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Mon contexte
                </h3>
                <div class="space-y-2">
                  <button 
                    @click="$emit('open-vehicle-modal')"
                    class="w-full flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 border border-gray-200 transition-colors text-left"
                  >
                    <div class="flex items-center gap-3">
                      <Icon icon="mdi:car" class="w-6 h-6 text-blue-primary flex-shrink-0" />
                      <div>
                        <div class="font-medium text-gray-900">
                          {{ savedVehicle?.brand || 'Votre véhicule' }}
                        </div>
                        <div class="text-xs text-gray-500">
                          {{ savedVehicle?.model || 'Non renseigné' }}
                        </div>
                      </div>
                    </div>
                    <Icon icon="mdi:chevron-right" class="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </button>
                  
                  <button 
                    @click="$emit('open-city-modal')"
                    class="w-full flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 border border-gray-200 transition-colors text-left"
                  >
                    <div class="flex items-center gap-3">
                      <Icon icon="mdi:map-marker" class="w-6 h-6 text-blue-primary flex-shrink-0" />
                      <div>
                        <div class="font-medium text-gray-900">
                          {{ savedCity?.name || 'Votre ville' }}
                        </div>
                        <div class="text-xs text-gray-500">
                          {{ savedCity?.zipCode || 'Non renseigné' }}
                        </div>
                      </div>
                    </div>
                    <Icon icon="mdi:chevron-right" class="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </button>
                </div>
              </div>
              
              <!-- Section 3 : Navigation -->
              <div class="mb-6">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Navigation
                </h3>
                <nav class="space-y-1">
                  <RouterLink
                    v-for="link in navLinks"
                    :key="link.to"
                    :to="link.to"
                    class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    active-class="bg-blue-50 text-blue-primary"
                    @click="handleNavClick"
                  >
                    <Icon :icon="link.icon" class="w-5 h-5 flex-shrink-0" />
                    <span>{{ link.label }}</span>
                  </RouterLink>
                </nav>
              </div>
            </div>
            
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Backdrop fade */
.mobile-menu-overlay-enter-active,
.mobile-menu-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.mobile-menu-overlay-enter-from,
.mobile-menu-overlay-leave-to {
  opacity: 0;
}

/* Panel slide from right */
.mobile-menu-panel-enter-active,
.mobile-menu-panel-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-menu-panel-enter-from {
  transform: translateX(100%);
}

.mobile-menu-panel-leave-to {
  transform: translateX(100%);
}
</style>


