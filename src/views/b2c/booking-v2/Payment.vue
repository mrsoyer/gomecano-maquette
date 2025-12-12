<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useCartStore } from '@/stores/cart.store'
import { useBookingStore } from '@/stores/booking.store'
import type { MockPaymentData } from '@/types/booking'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'

const router = useRouter()
const cartStore = useCartStore()
const bookingStore = useBookingStore()

/**
 * Payment form state
 */
const paymentForm = ref<MockPaymentData>({
  cardNumber: '',
  expiryDate: '',
  cvc: '',
  cardholderName: ''
})

/**
 * Processing state
 */
const isProcessing = ref(false)
const error = ref<string | null>(null)

/**
 * Computed - Form is valid
 */
const isFormValid = computed(() => {
  return (
    paymentForm.value.cardNumber.replace(/\s/g, '').length === 16 &&
    paymentForm.value.expiryDate.length === 5 &&
    paymentForm.value.cvc.length === 3 &&
    paymentForm.value.cardholderName.trim() !== ''
  )
})

/**
 * Computed - Total with discount
 */
const totalWithDiscount = computed(() => {
  const baseTotal = cartStore.total
  const discountAmount = baseTotal * bookingStore.discount
  return baseTotal - discountAmount
})

/**
 * Format card number with spaces (4 digits groups)
 * Automatically adds spaces every 4 digits (e.g., "4242 4242 4242 4242")
 * 
 * @param value - Raw card number input
 */
function formatCardNumber(value: string): void {
  const cleaned = value.replace(/\s/g, '')
  const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned
  paymentForm.value.cardNumber = formatted.substring(0, 19) // Max 16 digits + 3 spaces
}

/**
 * Format expiry date (MM/YY)
 * Automatically adds slash between month and year
 * 
 * @param value - Raw expiry date input
 */
function formatExpiryDate(value: string): void {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length >= 2) {
    paymentForm.value.expiryDate = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4)
  } else {
    paymentForm.value.expiryDate = cleaned
  }
}

/**
 * Format CVC (3 digits only)
 * Restricts input to 3 numeric digits
 * 
 * @param value - Raw CVC input
 */
function formatCVC(value: string): void {
  paymentForm.value.cvc = value.replace(/\D/g, '').substring(0, 3)
}

/**
 * Handle mock payment processing
 * Simulates payment with test cards (4242... = success, 4000... = declined)
 * Clears localStorage and redirects to success page on successful payment
 */
async function handlePayment(): Promise<void> {
  if (!isFormValid.value) {
    error.value = 'Veuillez remplir tous les champs'
    return
  }
  
  isProcessing.value = true
  error.value = null
  
  try {
    // Simulate payment processing (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Check card number (without spaces)
    const cardNumber = paymentForm.value.cardNumber.replace(/\s/g, '')
    
    // Test cards
    if (cardNumber === '4242424242424242') {
      // SUCCESS
      const transactionId = 'MOCK_' + Date.now()
      bookingStore.confirmBooking(transactionId)
      
      // Clear auto-save localStorage
      localStorage.removeItem('booking_userForm')
      localStorage.removeItem('booking_billingAddress')
      
      console.log('[Payment] Success - Transaction ID:', transactionId)
      router.push('/success')
    } else if (cardNumber === '4000000000000002') {
      // CARD DECLINED
      throw new Error('Carte refusée par votre banque')
    } else if (cardNumber === '4000000000009995') {
      // INSUFFICIENT FUNDS
      throw new Error('Fonds insuffisants')
    } else {
      // UNKNOWN CARD
      throw new Error('Numéro de carte invalide. Utilisez 4242 4242 4242 4242 pour tester.')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erreur de paiement'
    console.error('[Payment] Error:', err)
  } finally {
    isProcessing.value = false
  }
}

/**
 * On mounted - Validate booking data
 */
onMounted(() => {
  if (!bookingStore.userInfo || cartStore.serviceCount === 0) {
    alert('Veuillez d\'abord remplir vos coordonnées')
    router.push('/confirmation')
    return
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header global avec TopBar -->
    <Header />

    <!-- Main Content -->
    <Container class="py-4 md:py-6">
      <!-- Progress Bar -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs md:text-sm font-semibold text-gray-700">Étape 3 sur 3</span>
          <span class="text-xs md:text-sm text-gray-600">100% - Dernière étape !</span>
        </div>
        <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all" style="width: 100%"></div>
        </div>
      </div>
      
      <div class="grid lg:grid-cols-3 gap-4 md:gap-6">
        <!-- Main Content (2/3) -->
        <main class="lg:col-span-2 space-y-3 md:space-y-4">
          
          <!-- Page Title -->
          <div>
            <h1 class="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Paiement sécurisé
            </h1>
            <p class="text-sm md:text-base text-gray-600">
              Dernière étape pour confirmer votre intervention
            </p>
          </div>

          <!-- Error message -->
          <div v-if="error" class="bg-red-50 border-l-4 border-red-400 p-3 md:p-4">
            <div class="flex items-center gap-2">
              <Icon icon="mdi:alert-circle" class="w-5 h-5 text-red-600" />
              <p class="text-sm font-medium text-red-800">{{ error }}</p>
            </div>
          </div>

          <!-- Mock Payment Form -->
          <div class="bg-white rounded-lg shadow-sm p-3 md:p-4 border border-gray-200">
            <h2 class="text-base md:text-lg font-bold text-gray-900 mb-4">Informations de paiement</h2>
            
            <!-- Info: Mock payment -->
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-2 md:p-3 mb-4">
              <p class="text-xs md:text-sm text-yellow-800 font-medium flex items-center gap-2">
                <Icon icon="mdi:information" class="w-4 h-4 flex-shrink-0" />
                <span>
                  <strong>Mode maquette :</strong> Utilisez la carte 
                  <code class="bg-yellow-100 px-1.5 py-0.5 rounded font-mono">4242 4242 4242 4242</code> 
                  pour simuler un paiement réussi.
                </span>
              </p>
            </div>

            <div class="space-y-4">
              <!-- Card Number -->
              <div>
                <label class="block text-xs md:text-sm font-semibold text-gray-900 mb-1.5">
                  Numéro de carte *
                </label>
                <div class="relative">
                  <input
                    :value="paymentForm.cardNumber"
                    @input="formatCardNumber(($event.target as HTMLInputElement).value)"
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    maxlength="19"
                    class="w-full px-3 py-2.5 md:py-3 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 pr-12"
                  />
                  <Icon icon="mdi:credit-card" class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  Test : <code class="bg-gray-100 px-1.5 py-0.5 rounded">4242 4242 4242 4242</code> (Succès) 
                  | <code class="bg-gray-100 px-1.5 py-0.5 rounded">4000 0000 0000 0002</code> (Refusée)
                </p>
              </div>

              <!-- Expiry & CVC -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs md:text-sm font-semibold text-gray-900 mb-1.5">
                    Date d'expiration *
                  </label>
                  <input
                    :value="paymentForm.expiryDate"
                    @input="formatExpiryDate(($event.target as HTMLInputElement).value)"
                    type="text"
                    placeholder="MM/YY"
                    maxlength="5"
                    class="w-full px-3 py-2.5 md:py-3 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>
                
                <div>
                  <label class="block text-xs md:text-sm font-semibold text-gray-900 mb-1.5">
                    CVC *
                  </label>
                  <input
                    :value="paymentForm.cvc"
                    @input="formatCVC(($event.target as HTMLInputElement).value)"
                    type="text"
                    placeholder="123"
                    maxlength="3"
                    class="w-full px-3 py-2.5 md:py-3 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>
              </div>

              <!-- Cardholder Name -->
              <div>
                <label class="block text-xs md:text-sm font-semibold text-gray-900 mb-1.5">
                  Nom du titulaire *
                </label>
                <input
                  v-model="paymentForm.cardholderName"
                  type="text"
                  placeholder="JEAN DUPONT"
                  class="w-full px-3 py-2.5 md:py-3 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 uppercase"
                />
              </div>
            </div>
          </div>

          <!-- Payment Button -->
          <button
            @click="handlePayment"
            :disabled="!isFormValid || isProcessing"
            :class="[
              'w-full py-3 md:py-4 font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 group text-base md:text-lg',
              isFormValid && !isProcessing
                ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            ]"
          >
            <Icon 
              v-if="isProcessing" 
              icon="mdi:loading" 
              class="w-6 h-6 animate-spin" 
            />
            <Icon 
              v-else 
              icon="mdi:lock" 
              class="w-6 h-6" 
            />
            <span>{{ isProcessing ? 'Paiement en cours...' : `Payer ${totalWithDiscount.toFixed(2)}€` }}</span>
          </button>
          
          <!-- Security info -->
          <div class="flex items-center justify-center gap-2 text-xs text-gray-600">
            <Icon icon="mdi:shield-check" class="w-4 h-4 text-green-600" />
            <span>Paiement sécurisé par Stripe - Vos données sont protégées</span>
          </div>
        </main>
        
        <!-- Sidebar Récap (1/3) -->
        <aside class="lg:col-span-1">
          <div class="sticky top-20 space-y-3 md:space-y-4">
            <!-- Récap complet -->
            <div class="bg-white rounded-lg shadow-sm p-3 md:p-4 border border-gray-200">
              <h3 class="text-sm md:text-base font-bold text-gray-900 mb-3">Récapitulatif</h3>
              
              <!-- User info -->
              <div class="mb-3 pb-3 border-b border-gray-200">
                <p class="text-xs font-semibold text-gray-700 mb-1">Client</p>
                <p class="text-sm font-medium text-gray-900">
                  {{ bookingStore.userInfo?.firstName }} {{ bookingStore.userInfo?.lastName }}
                </p>
                <p class="text-xs text-gray-600">{{ bookingStore.userInfo?.email }}</p>
                <p class="text-xs text-gray-600">{{ bookingStore.userInfo?.phone }}</p>
              </div>
              
              <!-- Services -->
              <div class="mb-3 pb-3 border-b border-gray-200">
                <p class="text-xs font-semibold text-gray-700 mb-2">Services</p>
                <div class="space-y-1.5">
                  <div 
                    v-for="service in cartStore.services" 
                    :key="service.id"
                    class="flex items-start justify-between gap-2"
                  >
                    <div class="flex-1">
                      <p class="text-xs md:text-sm font-medium text-gray-900">{{ service.name }}</p>
                      <p v-if="service.pricingConfig?.tierLabel" class="text-xs text-gray-600">
                        {{ service.pricingConfig.tierLabel }}
                      </p>
                    </div>
                    <p class="text-sm font-semibold text-gray-900">{{ service.price }}€</p>
                  </div>
                </div>
              </div>
              
              <!-- Address & Time -->
              <div class="mb-3 pb-3 border-b border-gray-200">
                <p class="text-xs font-semibold text-gray-700 mb-1">Intervention</p>
                <div class="flex items-start gap-1.5 mb-2">
                  <Icon icon="mdi:map-marker" class="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <p class="text-xs text-gray-900">
                    {{ cartStore.location?.street }}, {{ cartStore.location?.city }} {{ cartStore.location?.postalCode }}
                  </p>
                </div>
                <div class="flex items-start gap-1.5">
                  <Icon icon="mdi:clock-outline" class="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <p class="text-xs text-gray-900">
                    {{ cartStore.collectDateTime?.date ? new Date(cartStore.collectDateTime.date).toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long' 
                    }) : '-' }}
                  </p>
                </div>
              </div>
              
              <!-- Billing address (if different) -->
              <div v-if="bookingStore.billingAddress" class="mb-3 pb-3 border-b border-gray-200">
                <p class="text-xs font-semibold text-gray-700 mb-1">Adresse de facturation</p>
                <p class="text-xs text-gray-900">
                  {{ bookingStore.billingAddress.street }}, 
                  {{ bookingStore.billingAddress.city }} {{ bookingStore.billingAddress.postalCode }}
                </p>
              </div>
              
              <!-- Total -->
              <div class="flex items-center justify-between pt-3 border-t-2 border-gray-300">
                <span class="text-sm md:text-base font-bold text-gray-900">Total TTC</span>
                <span class="text-lg md:text-2xl font-bold text-green-600">{{ totalWithDiscount.toFixed(2) }}€</span>
              </div>
            </div>
            
            <!-- Trust signals -->
            <div class="space-y-2">
              <div class="bg-green-50 rounded-lg p-2.5 md:p-3 border border-green-200">
                <div class="flex items-center gap-2 text-xs md:text-sm">
                  <Icon icon="mdi:shield-check" class="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                  <span class="font-semibold text-green-800">Paiement 100% sécurisé</span>
                </div>
              </div>
              
              <div class="bg-blue-50 rounded-lg p-2.5 md:p-3 border border-blue-200">
                <div class="flex items-center gap-2 text-xs md:text-sm">
                  <Icon icon="mdi:lock" class="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" />
                  <span class="font-semibold text-blue-800">Données chiffrées SSL</span>
                </div>
              </div>
              
              <div class="bg-orange-50 rounded-lg p-2.5 md:p-3 border border-orange-200">
                <div class="flex items-center gap-2 text-xs md:text-sm">
                  <Icon icon="mdi:information" class="w-4 h-4 md:w-5 md:h-5 text-orange-600 flex-shrink-0" />
                  <span class="text-orange-800">Débit après prestation uniquement</span>
                </div>
              </div>
            </div>
            
            <!-- Test cards info -->
            <div class="bg-gray-100 rounded-lg p-3 border border-gray-300">
              <p class="text-xs font-bold text-gray-700 mb-2">Cartes de test (maquette) :</p>
              <ul class="text-xs text-gray-600 space-y-1">
                <li class="flex items-start gap-1">
                  <Icon icon="mdi:check-circle" class="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><code class="bg-white px-1 rounded">4242 4242 4242 4242</code> : Succès</span>
                </li>
                <li class="flex items-start gap-1">
                  <Icon icon="mdi:close-circle" class="w-3 h-3 text-red-600 flex-shrink-0 mt-0.5" />
                  <span><code class="bg-white px-1 rounded">4000 0000 0000 0002</code> : Refusée</span>
                </li>
                <li class="flex items-start gap-1">
                  <Icon icon="mdi:close-circle" class="w-3 h-3 text-red-600 flex-shrink-0 mt-0.5" />
                  <span><code class="bg-white px-1 rounded">4000 0000 0000 9995</code> : Fonds insuffisants</span>
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </Container>

    <!-- Footer -->
    <Footer />
  </div>
</template>
