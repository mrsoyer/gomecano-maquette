<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { mockServices } from '@/mocks/services'
import { useCartStore } from '@/stores/cart.store'
import { useBookingContext } from '@/composables/useBookingContext'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import Breadcrumbs from '@/components/layout/Breadcrumbs.vue'
import BookingStep1Service from '@/components/booking/BookingStep1Service.vue'
import BookingAccordionModal from '@/components/booking/BookingAccordionModal.vue'
import CartSidebar from '@/components/cart/CartSidebar.vue'
import VehicleWidget from '@/components/context/VehicleWidget.vue'
import LocationWidget from '@/components/context/LocationWidget.vue'

const router = useRouter()
const cartStore = useCartStore()

/**
 * Booking context
 */
const { savedCity, savedVehicle, hasCompleteContext, isContextModalOpen, closeContextModal } = useBookingContext()

/**
 * Pre-selected service for modal
 */
const preSelectedService = ref<string>('')

/**
 * Map old service IDs to service slugs from mockServices
 * Used for popular services with simple IDs (revision, pneus, etc.)
 */
const serviceIdMapping: Record<string, string> = {
  'revision': 'revision-complete',
  'vidange': 'vidange-moteur',
  'freins': 'plaquettes-frein-avant',
  'pneus': 'changement-pneus',
  'courroie': 'courroie-distribution',
  'clim': 'recharge-climatisation',
  'embrayage': 'changement-embrayage',
  'plaquettes': 'plaquettes-frein-avant',
  'amortisseurs': 'amortisseurs-avant',
  'radiateur': 'radiateur-moteur',
  'diagnostic': 'diagnostic-electronique'
}

/**
 * Handle service selection
 * If city/vehicle not set, open modal. Otherwise add to cart and navigate.
 */
function handleServiceSelect(serviceId: string) {
  // Always check if city and vehicle are saved first
  if (!hasCompleteContext.value) {
    // Open modal with pre-selected service
    preSelectedService.value = serviceId
    isContextModalOpen.value = true
    return
  }
  
  // City and vehicle are both saved, navigate directly
  
  // Find service in mockServices by ID
  const service = mockServices.find(s => s.id === serviceId)
  
  if (service) {
    // Navigate to service detail page (NO auto-add to cart)
    // User will click "AJOUTER AU DEVIS" button on service page
    router.push(`/service/${service.slug}`)
    return
  }
  
  // For old service IDs, use mapping
  const mappedSlug = serviceIdMapping[serviceId]
  if (mappedSlug) {
    // Navigate using mapped slug (booking-v2 route)
    router.push(`/service/${mappedSlug}`)
    return
  }
  
  // Fallback: if no mapping found, open modal
  console.warn('Service not found:', serviceId)
  preSelectedService.value = serviceId
  isContextModalOpen.value = true
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />
    
    <Container class="py-4 md:py-6">
      <!-- Breadcrumbs -->
      <Breadcrumbs />
      
      <!-- Page header -->
      <div class="mb-6 text-center">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Quel est votre besoin ?</h1>
        <p class="text-base text-gray-600">Choisissez le service dont vous avez besoin</p>
      </div>
      
      <!-- Layout 2 colonnes : Contenu + Sidebar -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Colonne principale : Services -->
        <div class="lg:col-span-2">
          <BookingStep1Service
            @select="handleServiceSelect"
          />
          
          <!-- Section informative -->
          <div class="mt-6">
            <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h3 class="text-lg font-bold text-gray-900 mb-2">🚀 Réponse en 30 secondes</h3>
              <p class="text-gray-600 mb-4">
                Sélectionnez votre service pour obtenir un devis gratuit et prendre rendez-vous avec un mécanicien certifié.
              </p>
              <div class="flex flex-wrap justify-center gap-4 text-sm text-gray-700">
                <span class="flex items-center gap-1.5">
                  <span class="text-green-600 font-bold">✓</span>
                  Intervention à domicile
                </span>
                <span class="flex items-center gap-1.5">
                  <span class="text-green-600 font-bold">✓</span>
                  Garantie 24 mois
                </span>
                <span class="flex items-center gap-1.5">
                  <span class="text-green-600 font-bold">✓</span>
                  Paiement sécurisé
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Sidebar : Panier + Véhicule + Ville -->
        <div class="lg:col-span-1">
          <div class="sticky top-20 space-y-3">
            <!-- Panier (nouveau composant) -->
            <CartSidebar />
            
            <!-- Véhicule (nouveau composant) -->
            <VehicleWidget variant="card" />
            
            <!-- Localisation (nouveau composant) -->
            <LocationWidget variant="card" />
          </div>
        </div>
      </div>
    </Container>
    
    <!-- Modal Booking -->
    <BookingAccordionModal
      :is-open="isContextModalOpen"
      :selected-service="preSelectedService"
      @close="closeContextModal"
    />
    
    <Footer />
  </div>
</template>




