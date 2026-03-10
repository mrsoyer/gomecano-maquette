<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useCartStore } from '@/stores/cart.store'
import { useBookingContext } from '@/composables/useBookingContext'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import Breadcrumbs from '@/components/layout/Breadcrumbs.vue'
import VehicleWidget from '@/components/context/VehicleWidget.vue'
import LocationWidget from '@/components/context/LocationWidget.vue'
import BookingAccordionModal from '@/components/booking/BookingAccordionModal.vue'
import MobileDevisSummary from '@/components/devis/MobileDevisSummary.vue'

const router = useRouter()
const cartStore = useCartStore()
const { isContextModalOpen, closeContextModal } = useBookingContext()

/**
 * Navigate to services page
 */
function goToServices(): void {
  router.push('/services')
}

/**
 * Program intervention and go to booking
 * Redirects to collecte-restitution page if cart has services
 */
function validateDevis(): void {
  if (cartStore.services.length > 0) {
    router.push('/collecte-restitution')
  }
}

/**
 * Remove service from cart
 * 
 * @param serviceId - Service ID to remove
 */
function removeService(serviceId: string): void {
  cartStore.removeService(serviceId)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />
    
    <Container class="py-4 md:py-6">
      <!-- Breadcrumbs -->
      <Breadcrumbs />
      
      <!-- Page header -->
      <div class="mb-4 md:mb-6">
        <h1 class="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1.5 md:mb-2">Mon devis</h1>
        <p class="text-sm md:text-base text-gray-600">Récapitulatif de vos services sélectionnés</p>
      </div>
      
      <!-- Layout 2 colonnes -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <!-- Colonne principale : Liste services -->
        <div class="lg:col-span-2 space-y-3 md:space-y-4">
          <!-- Services list -->
          <div v-if="cartStore.services.length > 0" class="space-y-3">
            <div
              v-for="service in cartStore.services"
              :key="service.id"
              class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div class="flex items-start justify-between gap-3 md:gap-4">
                <!-- Service info -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg md:text-xl font-bold text-gray-900 mb-1.5 md:mb-2">{{ service.name }}</h3>
                  <p class="text-xs md:text-sm text-gray-600 mb-2">Durée estimée : {{ service.duration }} minutes</p>
                  
                  <!-- Included items -->
                  <div v-if="service.included && service.included.length > 0" class="mb-2">
                    <p class="text-[10px] md:text-xs font-semibold text-gray-700 mb-1.5">Prestations incluses :</p>
                    <ul class="space-y-0.5">
                      <li
                        v-for="(item, index) in service.included.slice(0, 3)"
                        :key="index"
                        class="flex items-start gap-1.5"
                      >
                        <Icon icon="mdi:check" class="w-3 h-3 md:w-4 md:h-4 text-green-primary flex-shrink-0" />
                        <span class="text-[10px] md:text-xs text-gray-700">{{ item }}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- Price and actions -->
                <div class="flex flex-col items-end gap-2 flex-shrink-0">
                  <span class="text-2xl md:text-3xl font-bold text-orange-primary whitespace-nowrap">
                    {{ service.price }}€
                  </span>
                  <button
                    @click="removeService(service.id)"
                    class="flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all text-xs md:text-sm font-medium"
                  >
                    <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Continue shopping -->
            <div class="mt-4 md:mt-6 text-center">
              <button
                @click="goToServices"
                class="inline-flex items-center gap-2 text-sm md:text-base text-blue-primary hover:text-blue-dark font-semibold transition-colors"
              >
                <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Ajouter d'autres services</span>
              </button>
            </div>
            
            <!-- Récapitulatif Mobile (visible uniquement mobile, en dessous des services) -->
            <div class="lg:hidden">
              <!-- Véhicule -->
              <VehicleWidget variant="card" />
            </div>
            
            <div class="lg:hidden">
              <!-- Localisation -->
              <LocationWidget variant="card" />
            </div>
            
            <div 
              v-if="cartStore.services.length > 0"
              class="lg:hidden bg-white rounded-lg border border-gray-200 p-2 md:p-3 shadow-sm"
              data-devis-summary-trigger
            >
              <h3 class="text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-3">Récapitulatif</h3>
              
              <!-- Services count -->
              <div class="flex justify-between text-xs md:text-sm mb-1.5">
                <span class="text-gray-600">{{ cartStore.serviceCount }} service<template v-if="cartStore.serviceCount > 1">s</template></span>
                <span class="font-semibold text-gray-900">{{ cartStore.total }}€</span>
              </div>

              <!-- Total duration -->
              <div class="flex justify-between text-xs md:text-sm mb-3">
                <span class="text-gray-600">Durée totale</span>
                <span class="font-semibold text-gray-900">{{ cartStore.totalDuration }} min</span>
              </div>

              <!-- Total TTC -->
              <div class="pt-3 md:pt-4 border-t-2 border-gray-300 mb-3 md:mb-4">
                <div class="flex justify-between items-center">
                  <span class="font-bold text-gray-900 text-base md:text-lg">Total TTC</span>
                  <span class="text-2xl md:text-3xl font-bold text-orange-primary">{{ cartStore.total }}€</span>
                </div>
              </div>

              <!-- Message encouragement -->
              <div class="bg-blue-50 rounded-lg p-2.5 md:p-3 mb-3">
                <div class="flex items-start gap-2">
                  <Icon icon="mdi:calendar-check" class="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p class="text-[11px] md:text-sm font-semibold text-blue-900 mb-0.5">
                      Prêt à programmer votre intervention ?
                    </p>
                    <p class="text-[10px] md:text-xs text-blue-700">
                      Choisissez votre créneau et nos mécaniciens viendront chez vous
                    </p>
                  </div>
                </div>
              </div>

              <!-- Validate button -->
              <button
                @click="validateDevis"
                class="w-full py-2.5 md:py-3 text-sm md:text-base bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold rounded-lg shadow-lg transition-all hover:shadow-xl flex items-center justify-center gap-2 group"
              >
                <Icon icon="mdi:calendar-clock" class="w-4 h-4 md:w-5 md:h-5" />
                <span>Programmer mon intervention</span>
                <span class="transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else class="bg-white rounded-xl border-2 border-gray-200 p-6 md:p-12 text-center">
            <Icon icon="mdi:cart-off" class="w-16 h-16 md:w-24 md:h-24 mx-auto mb-3 text-gray-300" />
            <h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-2">Votre devis est vide</h2>
            <p class="text-sm md:text-base text-gray-600 mb-4 md:mb-6">Découvrez nos services et ajoutez-les à votre devis</p>
            <button
              @click="goToServices"
              class="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 text-sm md:text-base bg-orange-primary hover:bg-orange-hover text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              <span>Découvrir nos services</span>
              <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Sidebar : Récapitulatif Desktop -->
        <div class="hidden lg:block lg:col-span-1">
          <div class="sticky top-20 space-y-3">
            <!-- Véhicule -->
            <VehicleWidget variant="card" />
            
            <!-- Localisation -->
            <LocationWidget variant="card" />
            
            <!-- Récapitulatif total -->
            <div 
              v-if="cartStore.services.length > 0" 
              class="bg-white rounded-lg border border-gray-200 p-3 shadow-sm"
            >
              <h3 class="text-lg font-bold text-gray-900 mb-3">Récapitulatif</h3>
              
              <!-- Services count -->
              <div class="flex justify-between text-sm mb-2">
                <span class="text-gray-600">{{ cartStore.serviceCount }} service<template v-if="cartStore.serviceCount > 1">s</template></span>
                <span class="font-semibold text-gray-900">{{ cartStore.total }}€</span>
              </div>

              <!-- Total duration -->
              <div class="flex justify-between text-sm mb-4">
                <span class="text-gray-600">Durée totale</span>
                <span class="font-semibold text-gray-900">{{ cartStore.totalDuration }} min</span>
              </div>

              <!-- Total TTC -->
              <div class="pt-4 border-t-2 border-gray-300 mb-4">
                <div class="flex justify-between items-center">
                  <span class="font-bold text-gray-900 text-lg">Total TTC</span>
                  <span class="text-3xl font-bold text-orange-primary">{{ cartStore.total }}€</span>
                </div>
              </div>

              <!-- Message encouragement -->
              <div class="bg-blue-50 rounded-lg p-3 mb-4">
                <div class="flex items-start gap-2">
                  <Icon icon="mdi:calendar-check" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p class="text-sm font-semibold text-blue-900 mb-1">
                      Prêt à programmer votre intervention ?
                    </p>
                    <p class="text-xs text-blue-700">
                      Choisissez votre créneau et nos mécaniciens viendront chez vous
                    </p>
                  </div>
                </div>
              </div>

              <!-- Validate button -->
              <button
                @click="validateDevis"
                class="w-full py-3 text-base bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold rounded-lg shadow-lg transition-all hover:shadow-xl flex items-center justify-center gap-2 group"
              >
                <Icon icon="mdi:calendar-clock" class="w-5 h-5" />
                <span>Programmer mon intervention</span>
                <span class="transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Container>

    <!-- Modal Booking Context -->
    <BookingAccordionModal
      :is-open="isContextModalOpen"
      @close="closeContextModal"
    />

    <!-- Mobile Sticky Summary -->
    <MobileDevisSummary
      :total="cartStore.total"
      :service-count="cartStore.serviceCount"
      :total-duration="cartStore.totalDuration"
      :has-services="cartStore.services.length > 0"
      @validate="validateDevis"
    />
    
    <Footer />
  </div>
</template>
