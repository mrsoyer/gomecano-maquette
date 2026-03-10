<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useCartStore } from '@/stores/cart.store'
import { useCartDrawer } from '@/composables/useCartDrawer'

/**
 * Cart store and drawer
 */
const cartStore = useCartStore()
const router = useRouter()
const { isDrawerOpen, closeDrawer } = useCartDrawer()

/**
 * Navigate to devis page
 */
function goToDevis() {
  closeDrawer()
  router.push('/devis')
}

/**
 * Navigate to collecte
 */
function validateDevis() {
  closeDrawer()
  router.push('/collecte-restitution')
}

/**
 * Remove service from cart
 */
function removeService(serviceId: string) {
  cartStore.removeService(serviceId)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div
        v-if="isDrawerOpen"
        class="fixed inset-0 z-[9998] hidden lg:block"
      >
        <!-- Overlay -->
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          @click="closeDrawer"
        ></div>

        <!-- Drawer panel -->
        <Transition name="drawer-slide">
          <div
            class="absolute top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl overflow-y-auto"
          >
            <!-- Header -->
            <div class="sticky top-0 bg-white border-b-2 border-gray-200 p-4 z-10">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Icon icon="mdi:cart" class="w-6 h-6 text-orange-primary" />
                  Mon devis
                </h2>
                <button
                  @click="closeDrawer"
                  class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all"
                >
                  <span class="text-2xl text-gray-600">×</span>
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="p-4">
              <!-- Services list -->
              <div v-if="cartStore.services.length > 0" class="space-y-3 mb-6">
                <div
                  v-for="service in cartStore.services"
                  :key="service.id"
                  class="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div class="flex-1">
                    <p class="font-semibold text-gray-900 text-sm">{{ service.name }}</p>
                    <p class="text-xs text-gray-600 mt-1">{{ service.duration }} min</p>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="font-bold text-orange-primary">{{ service.price }}€</span>
                    <button
                      @click="removeService(service.id)"
                      class="text-red-600 hover:text-red-700 text-sm"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Total -->
                <div class="pt-4 border-t-2 border-gray-300">
                  <div class="flex justify-between items-center mb-4">
                    <span class="font-bold text-gray-900 text-lg">Total TTC</span>
                    <span class="text-3xl font-bold text-gray-900">{{ cartStore.total }}€</span>
                  </div>

                  <!-- Actions -->
                  <div class="space-y-2">
                    <button
                      @click="validateDevis"
                      class="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl"
                    >
                      Valider le devis
                    </button>
                    <button
                      @click="goToDevis"
                      class="w-full py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-all"
                    >
                      Voir le devis complet
                    </button>
                  </div>
                </div>
              </div>

              <!-- Empty state -->
              <div v-else class="text-center py-12">
                <Icon icon="mdi:cart-off" class="w-24 h-24 mx-auto mb-4 text-gray-300" />
                <p class="text-gray-500 font-medium mb-4">Votre devis est vide</p>
                <button
                  @click="closeDrawer"
                  class="text-orange-primary hover:text-orange-hover font-semibold"
                >
                  Découvrir nos services
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Drawer fade animation */
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

/* Drawer slide animation */
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}
</style>
