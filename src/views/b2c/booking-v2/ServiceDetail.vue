<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart.store'
import { useBookingContext } from '@/composables/useBookingContext'
import { useServicePricing } from '@/composables/useServicePricing'
import { mockServices } from '@/mocks/services'
import { Icon } from '@iconify/vue'

// Layout components
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Breadcrumbs from '@/components/layout/Breadcrumbs.vue'
import Container from '@/components/layout/Container.vue'

// Service components
import ServiceQuestionsModal from '@/components/service/ServiceQuestionsModal.vue'
import DynamicPriceSidebar from '@/components/service/DynamicPriceSidebar.vue'
import PricingTiersSelector from '@/components/service/PricingTiersSelector.vue'
import ServiceOptionsSelector from '@/components/service/ServiceOptionsSelector.vue'
import AddToCartModal from '@/components/service/AddToCartModal.vue'
import MobilePriceBar from '@/components/service/MobilePriceBar.vue'

// Sidebar components
import CartSidebar from '@/components/cart/CartSidebar.vue'
import VehicleWidget from '@/components/context/VehicleWidget.vue'
import LocationWidget from '@/components/context/LocationWidget.vue'
import BookingAccordionModal from '@/components/booking/BookingAccordionModal.vue'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const { 
  hasCompleteContext, 
  savedVehicle, 
  savedCity,
  isContextModalOpen, 
  closeContextModal, 
  openContextModal 
} = useBookingContext()

/**
 * Get service from route param
 */
const serviceSlug = route.params.serviceId as string
const service = computed(() => {
  return mockServices.find(s => s.slug === serviceSlug) || null
})

/**
 * Use pricing composable for dynamic price calculation
 */
const pricing = computed(() => {
  if (!service.value) return null
  return useServicePricing(service.value)
})

/**
 * Check if service is in cart
 */
const isInCart = computed(() => {
  if (!service.value) return false
  return cartStore.isInCart(service.value.id)
})

/**
 * Get service from cart
 */
const cartService = computed(() => {
  if (!service.value) return null
  return cartStore.services.find(s => s.id === service.value.id)
})

/**
 * Check if configuration has changed from what's in cart
 */
const hasConfigurationChanged = computed(() => {
  if (!isInCart.value || !service.value || !pricing.value || !cartService.value) {
    return false
  }
  
  const savedConfig = cartService.value.pricingConfig
  if (!savedConfig) {
    return true // Pas de config sauvegardée = considéré comme modifié
  }
  
  // Comparer les configurations
  const currentTier = pricing.value.selectedTier.value
  const currentOptions = [...pricing.value.selectedOptions.value].sort()
  const currentAnswers = pricing.value.answers.value
  
  const savedTier = savedConfig.tierId
  const savedOptions = [...(savedConfig.selectedOptions || [])].sort()
  const savedAnswers = savedConfig.answers || []
  
  // Comparer gamme
  if (currentTier !== savedTier) return true
  
  // Comparer options
  if (JSON.stringify(currentOptions) !== JSON.stringify(savedOptions)) return true
  
  // Comparer réponses
  if (JSON.stringify(currentAnswers) !== JSON.stringify(savedAnswers)) return true
  
  return false
})

/**
 * Auto-open modals avec priorité : Contexte > Questions
 * 1. Si véhicule OU localisation manquants → Modal contexte
 * 2. Sinon, si questions requises non répondues → Modal questions
 * 
 * Watch directement savedVehicle et savedCity pour détecter changements localStorage
 */
watch([service, pricing, savedVehicle, savedCity], () => {
  if (service.value && pricing.value) {
    // Petit délai pour laisser le temps aux composants de se mettre à jour
    setTimeout(() => {
      // PRIORITÉ 1 : Contexte (véhicule + localisation)
      if (!hasCompleteContext.value) {
        // Ne pas rouvrir la modal si elle est déjà ouverte
        if (!isContextModalOpen.value) {
          openContextModal()
        }
        return
      }
      
      // PRIORITÉ 2 : Questions requises
      if (service.value.questions && service.value.questions.length > 0) {
        if (!pricing.value.hasAnsweredRequiredQuestions.value) {
          // Ne pas rouvrir la modal questions si elle est déjà ouverte
          if (!pricing.value.isQuestionsModalOpen.value) {
            pricing.value.openQuestionsModal()
          }
        }
      }
    }, 300) // Délai réduit pour meilleure réactivité
  }
}, { immediate: true, deep: true })

/**
 * State pour AddToCartModal
 */
const isAddToCartModalOpen = ref(false)

/**
 * Handle add to cart - Ajoute au devis IMMÉDIATEMENT puis ouvre la modal
 */
function handleAddToCart(): void {
  if (!service.value || !pricing.value) return
  
  // Vérifier contexte complet
  if (!hasCompleteContext.value) {
    openContextModal()
    return
  }
  
  // Vérifier questions requises
  if (!pricing.value.hasAnsweredRequiredQuestions.value) {
    pricing.value.openQuestionsModal()
    return
  }
  
  // NOUVEAU : Ajouter au devis IMMÉDIATEMENT (avant modal)
  const tierLabel = service.value.pricingTiers?.find(
    t => t.id === pricing.value?.selectedTier.value
  )?.label
  
  cartStore.addService(service.value.id, {
    tierId: pricing.value.selectedTier.value,
    tierLabel: tierLabel,
    selectedOptions: pricing.value.selectedOptions.value,
    answers: pricing.value.answers.value,
    calculatedPrice: pricing.value.totalPrice.value,
    totalDuration: pricing.value.totalDuration.value
  })
  
  console.log('Service added to cart immediately:', {
    price: pricing.value.totalPrice.value,
    duration: pricing.value.totalDuration.value,
    tier: tierLabel,
    options: pricing.value.selectedOptions.value.length
  })
  
  // Puis ouvrir la modal cross-sell
  isAddToCartModalOpen.value = true
}

/**
 * Handle update service in cart - Met à jour IMMÉDIATEMENT puis ouvre la modal
 */
function handleUpdateCart(): void {
  if (!service.value || !pricing.value) return
  
  // NOUVEAU : Mettre à jour le devis IMMÉDIATEMENT (avant modal)
  const tierLabel = service.value.pricingTiers?.find(
    t => t.id === pricing.value?.selectedTier.value
  )?.label
  
  cartStore.updateService(service.value.id, {
    tierId: pricing.value.selectedTier.value,
    tierLabel: tierLabel,
    selectedOptions: pricing.value.selectedOptions.value,
    answers: pricing.value.answers.value,
    calculatedPrice: pricing.value.totalPrice.value,
    totalDuration: pricing.value.totalDuration.value
  })
  
  console.log('Service updated in cart immediately:', {
    price: pricing.value.totalPrice.value,
    duration: pricing.value.totalDuration.value,
    tier: tierLabel,
    options: pricing.value.selectedOptions.value.length
  })
  
  // Puis ouvrir la modal cross-sell
  isAddToCartModalOpen.value = true
}

/**
 * Handle CTA go to cart
 */
function goToCart(): void {
  router.push('/devis')
}

/**
 * Détecte si c'est un service pneus (a des tirePerformance)
 */
const isTireService = computed(() => 
  pricing.value?.dynamicTiers.value.some(t => t.tirePerformance) || false
)

/**
 * Show comparison table toggle
 * Masqué pour services pneus car infos déjà dans cartes
 */
const showComparison = computed(() => {
  if (isTireService.value) return false
  return service.value?.comparisonTable && service.value.comparisonTable.length > 0
})

const isComparisonExpanded = computed({
  get: () => false,
  set: () => {}
})
</script>

<template>
  <div v-if="service && pricing" class="min-h-screen bg-gray-50">
    <!-- Header global avec TopBar -->
    <Header />

    <!-- Main Content -->
    <Container class="py-3 md:py-4">
      <!-- Breadcrumbs -->
      <Breadcrumbs />
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <!-- Colonne principale : Service Detail (2/3) -->
        <div class="lg:col-span-2 space-y-3 md:space-y-4">
          <!-- Service Header Card -->
          <div class="bg-white rounded-lg border border-gray-200 p-2 md:p-4 shadow-sm">
            <!-- Title & Badges -->
            <div class="mb-3">
              <h1 class="text-xl lg:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                {{ service.name }}
              </h1>
              
              <div v-if="service.badges && service.badges.length > 0" class="flex flex-wrap gap-1.5 mb-2">
                <span
                  v-for="badge in service.badges"
                  :key="badge"
                  class="inline-flex items-center px-2 py-0.5 bg-green-50 border border-green-200 text-green-900 text-[10px] md:text-xs font-semibold rounded-full"
                >
                  {{ badge }}
                </span>
              </div>
            </div>

            <!-- Description -->
            <div>
              <p class="text-gray-700 text-xs md:text-sm leading-relaxed">
                {{ service.description }}
              </p>
            </div>
          </div>

          <!-- Réponses aux questions (si répondues) -->
          <div 
            v-if="pricing.answers.value.length > 0" 
            class="bg-blue-50 rounded-lg border border-blue-200 p-2 md:p-3"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <h3 class="text-xs md:text-sm font-bold text-blue-900 mb-1.5">Votre configuration</h3>
                <div class="space-y-0.5">
                  <div 
                    v-for="answer in pricing.answers.value" 
                    :key="answer.questionId"
                    class="flex items-center gap-1.5 text-xs md:text-sm text-blue-800"
                  >
                    <Icon icon="mdi:check-circle" class="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                    <span>{{ answer.label }}</span>
                  </div>
                </div>
              </div>
              <button
                @click="pricing.openQuestionsModal()"
                class="px-3 py-1.5 text-xs md:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
              >
                Modifier
              </button>
            </div>
          </div>

          <!-- Gammes de prix / Modèles de pneus -->
          <div 
            v-if="pricing.dynamicTiers.value || pricing.isGeneratingTiers.value" 
            class="bg-white rounded-lg border border-gray-200 p-2 md:p-4 shadow-sm"
          >
            <!-- Loader si génération en cours -->
            <div v-if="pricing.isGeneratingTiers.value && pricing.dynamicTiers.value.length === 0" class="text-center py-8">
              <Icon icon="mdi:loading" class="w-8 h-8 md:w-12 md:h-12 text-orange-primary animate-spin mx-auto mb-3" />
              <p class="text-sm md:text-base font-semibold text-gray-900">Génération des modèles de pneus...</p>
              <p class="text-xs md:text-sm text-gray-600 mt-1">Calcul en fonction de vos choix</p>
            </div>
            
            <!-- Pneus / Gammes -->
            <PricingTiersSelector
              v-else-if="pricing.dynamicTiers.value.length > 0"
              :tiers="pricing.dynamicTiers.value"
              :selected-tier="pricing.selectedTier.value"
              @update:selected-tier="pricing.selectTier"
            />
            
            <!-- Tableau comparatif (collapsible) -->
            <div v-if="showComparison" class="mt-3">
              <details class="group">
                <summary class="flex items-center gap-1.5 text-xs md:text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
                  <Icon icon="mdi:chevron-down" class="w-4 h-4 md:w-5 md:h-5 transition-transform group-open:rotate-180" />
                  Voir le tableau comparatif détaillé
                </summary>
                
                <div class="mt-2 overflow-x-auto">
                  <table class="w-full text-[10px] md:text-sm border-collapse">
                    <thead>
                      <tr class="bg-gray-100">
                        <th class="text-left p-1.5 md:p-2 font-semibold text-gray-900">Caractéristique</th>
                        <th class="text-center p-1.5 md:p-2 font-semibold text-gray-900">{{ pricing.dynamicTiers.value[0]?.name }}</th>
                        <th class="text-center p-1.5 md:p-2 font-semibold text-gray-900 bg-orange-50">
                          {{ pricing.dynamicTiers.value[1]?.name }} ⭐
                        </th>
                        <th class="text-center p-1.5 md:p-2 font-semibold text-gray-900">{{ pricing.dynamicTiers.value[2]?.name }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, idx) in service.comparisonTable" :key="idx" class="border-b border-gray-200">
                        <td class="p-1.5 md:p-2 text-gray-700 font-medium">{{ row.feature }}</td>
                        <td class="p-1.5 md:p-2 text-center">
                          <Icon v-if="row.eco === true" icon="mdi:check" class="w-4 h-4 md:w-5 md:h-5 text-green-600 mx-auto" />
                          <Icon v-else-if="row.eco === false" icon="mdi:close" class="w-4 h-4 md:w-5 md:h-5 text-red-500 mx-auto" />
                          <span v-else class="text-gray-600 text-[10px] md:text-xs">{{ row.eco }}</span>
                        </td>
                        <td class="p-1.5 md:p-2 text-center bg-orange-50">
                          <Icon v-if="row.standard === true" icon="mdi:check" class="w-4 h-4 md:w-5 md:h-5 text-green-600 mx-auto font-bold" />
                          <Icon v-else-if="row.standard === false" icon="mdi:close" class="w-4 h-4 md:w-5 md:h-5 text-red-500 mx-auto" />
                          <span v-else class="text-gray-700 text-[10px] md:text-xs font-medium">{{ row.standard }}</span>
                        </td>
                        <td class="p-1.5 md:p-2 text-center">
                          <Icon v-if="row.premium === true" icon="mdi:check" class="w-4 h-4 md:w-5 md:h-5 text-green-600 mx-auto" />
                          <Icon v-else-if="row.premium === false" icon="mdi:close" class="w-4 h-4 md:w-5 md:h-5 text-red-500 mx-auto" />
                          <span v-else class="text-gray-600 text-[10px] md:text-xs">{{ row.premium }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </details>
            </div>
          </div>

          <!-- Options supplémentaires -->
          <div v-if="pricing.dynamicOptions.value && pricing.dynamicOptions.value.length > 0" class="bg-white rounded-lg border border-gray-200 p-2 md:p-4 shadow-sm">
            <ServiceOptionsSelector
              :options="pricing.dynamicOptions.value"
              :selected-options="pricing.selectedOptions.value"
              @update:selected-options="(opts) => pricing.selectedOptions.value = opts"
            />
          </div>

          <!-- Prestations incluses -->
          <div class="bg-white rounded-lg border border-gray-200 p-2 md:p-4 shadow-sm">
            <h3 class="text-sm md:text-base font-bold text-gray-900 mb-2">Prestations incluses</h3>
            <ul class="space-y-1.5">
              <li
                v-for="(item, index) in service.included"
                :key="index"
                class="flex items-start gap-2"
              >
                <Icon icon="mdi:check-circle" class="w-4 h-4 md:w-5 md:h-5 text-green-primary flex-shrink-0 mt-0.5" />
                <span class="text-gray-800 text-xs md:text-sm leading-relaxed">{{ item }}</span>
              </li>
            </ul>
          </div>

          <!-- Informations pratiques -->
          <div class="bg-blue-50 rounded-lg border border-blue-200 p-2 md:p-3">
            <h3 class="text-sm md:text-base font-bold text-blue-900 mb-2">
              Informations pratiques
            </h3>
            <div class="space-y-1.5">
              <div class="flex items-start gap-2">
                <Icon icon="mdi:clock-outline" class="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p class="text-xs md:text-sm text-gray-800 leading-relaxed">
                  Durée estimée : <span class="font-semibold">{{ pricing.totalDuration.value }} minutes</span>
                </p>
              </div>
              <div class="flex items-start gap-2">
                <Icon icon="mdi:shield-check" class="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p class="text-xs md:text-sm text-gray-800 leading-relaxed">
                  Garantie 24 mois pièces et main d'œuvre
                </p>
              </div>
              <div class="flex items-start gap-2">
                <Icon icon="mdi:home-map-marker" class="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p class="text-xs md:text-sm text-gray-800 leading-relaxed">
                  Intervention à domicile ou sur votre lieu de travail
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar : Prix + Widgets (1/3) -->
        <div class="lg:col-span-1">
          <div class="space-y-2 md:space-y-3">
            <!-- Prix dynamique sidebar -->
            <div data-mobile-price-trigger>
              <DynamicPriceSidebar
                :service="service"
                :selected-tier="pricing.selectedTier.value"
                :selected-options="pricing.selectedOptions.value"
                :answers="pricing.answers.value"
                :is-in-cart="isInCart"
                :has-complete-context="hasCompleteContext"
                :has-config-changed="hasConfigurationChanged"
                :dynamic-tiers="pricing.dynamicTiers.value"
                :dynamic-options="pricing.dynamicOptions.value"
                @add-to-cart="handleAddToCart"
                @update-cart="handleUpdateCart"
                @go-to-cart="goToCart"
                @open-questions="pricing.openQuestionsModal"
                @open-context-modal="openContextModal"
              />
            </div>
            
            <!-- Panier -->
            <CartSidebar />
            
            <!-- Véhicule -->
            <VehicleWidget variant="card" />
            
            <!-- Localisation -->
            <LocationWidget variant="card" />
          </div>
        </div>
      </div>
    </Container>
    
    <!-- Modal Questions -->
    <ServiceQuestionsModal
      v-if="service.questions"
      :is-open="pricing.isQuestionsModalOpen.value"
      :questions="service.questions"
      :initial-answers="pricing.answers.value"
      :service-name="service.name"
      :service-id="service.id"
      @close="pricing.closeQuestionsModal"
      @submit="pricing.submitAnswers"
    />
    
    <!-- Modal Booking Context -->
    <BookingAccordionModal
      :is-open="isContextModalOpen"
      @close="closeContextModal"
    />
    
    <!-- Add to Cart Modal (Options + Recommandations + Navigation) -->
    <AddToCartModal
      v-if="service && pricing"
      :is-open="isAddToCartModalOpen"
      :service="service"
      :selected-tier="pricing.selectedTier.value"
      :selected-options="pricing.selectedOptions.value"
      :total-price="pricing.totalPrice.value"
      :total-duration="pricing.totalDuration.value"
      :is-in-cart="isInCart"
      @close="isAddToCartModalOpen = false"
      @update:selected-options="(opts) => pricing.selectedOptions.value = opts"
      @update-cart="handleUpdateCart"
    />
    
    <!-- Mobile Price Bar (sticky bottom) -->
    <MobilePriceBar
      v-if="service && pricing"
      :service="service"
      :price="pricing.totalPrice.value"
      :duration="pricing.totalDuration.value"
      :tier-label="service.pricingTiers?.find(t => t.id === pricing.selectedTier.value)?.label"
      :can-add-to-cart="hasCompleteContext && pricing.hasAnsweredRequiredQuestions.value"
      :is-in-cart="isInCart"
      :has-config-changed="hasConfigurationChanged"
      :should-show-price="pricing.shouldShowPrice.value"
      @add-to-cart="handleAddToCart"
      @update-cart="handleUpdateCart"
      @go-to-cart="goToCart"
    />
    
    <Footer />
  </div>

  <!-- Service not found -->
  <div v-else class="min-h-screen bg-gray-50">
    <Header />
    <Container class="py-12 md:py-24">
      <div class="text-center">
        <div class="text-4xl md:text-6xl mb-3">🔍</div>
        <h1 class="text-xl md:text-2xl font-bold text-gray-900 mb-3">Service non trouvé</h1>
        <p class="text-sm md:text-base text-gray-600 mb-4">Le service que vous recherchez n'existe pas ou a été supprimé.</p>
        <button
          @click="router.push('/services')"
          class="px-4 py-2 md:px-6 md:py-3 bg-orange-primary hover:bg-orange-hover text-white text-sm md:text-base font-semibold rounded-lg transition-all shadow-lg"
        >
          Découvrir nos services
        </button>
      </div>
    </Container>
    <Footer />
  </div>
</template>
