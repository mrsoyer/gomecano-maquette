<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useCartStore } from '@/stores/cart.store'
import { useBookingStore } from '@/stores/booking.store'
import { useBookingContext } from '@/composables/useBookingContext'
import { useAutoSave } from '@/composables/useAutoSave'
import { useSaveForLater } from '@/composables/useSaveForLater'
import type { BookingUserInfo, BillingAddress } from '@/types/booking'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Breadcrumbs from '@/components/layout/Breadcrumbs.vue'
import VehicleWidget from '@/components/context/VehicleWidget.vue'
import LocationWidget from '@/components/context/LocationWidget.vue'
import BookingAccordionModal from '@/components/booking/BookingAccordionModal.vue'
import Container from '@/components/layout/Container.vue'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const bookingStore = useBookingStore()
const { isContextModalOpen, closeContextModal } = useBookingContext()
const { saveAndSendEmail, loadFromToken, isLoading: isSavingForLater } = useSaveForLater()

/**
 * User form state with auto-save
 */
const userForm = ref<BookingUserInfo>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  createAccount: false,
  password: ''
})

const { clear: clearUserFormSave } = useAutoSave('booking_userForm', userForm, 1000)

/**
 * Billing address state (optional)
 */
const hasDifferentBillingAddress = ref(false)
const billingAddress = ref<BillingAddress>({
  street: '',
  complement: '',
  city: '',
  postalCode: ''
})

const { clear: clearBillingAddressSave } = useAutoSave('booking_billingAddress', billingAddress, 1000)

/**
 * UI state
 */
const showLoginSection = ref(false)
const isAuthenticated = ref(false) // TODO: Connect to real auth
const isSaveForLaterModalOpen = ref(false)

/**
 * Computed - Form is valid
 */
const isFormValid = computed(() => {
  const basicInfoValid = (
    userForm.value.firstName.trim() !== '' &&
    userForm.value.lastName.trim() !== '' &&
    userForm.value.email.trim() !== '' &&
    userForm.value.phone.trim() !== ''
  )
  
  // If creating account, password is required
  if (userForm.value.createAccount && !userForm.value.password) {
    return false
  }
  
  // If different billing address, validate it
  if (hasDifferentBillingAddress.value) {
    return basicInfoValid && (
      billingAddress.value.street.trim() !== '' &&
      billingAddress.value.city.trim() !== '' &&
      billingAddress.value.postalCode.trim() !== ''
    )
  }
  
  return basicInfoValid
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
 * Computed - Formatted selected time ranges
 */
const formattedTimeRanges = computed(() => {
  if (!cartStore.collectDateTime?.preferredSlots) return []
  return cartStore.collectDateTime.preferredSlots.slice(0, 3)
})

/**
 * Handle social login (OAuth simulation)
 * 
 * @param provider - Social provider (google, facebook, apple)
 */
function handleSocialLogin(provider: 'google' | 'facebook' | 'apple'): void {
  console.log(`[Social Login] ${provider}`)
  alert(`Connexion avec ${provider} - Fonctionnalité en développement\n\nEn production : OAuth flow vers ${provider}`)
  // TODO: Implement real OAuth flow in production
}

/**
 * Handle login modal/redirect
 * Opens login modal or redirects to login page
 */
function handleLogin(): void {
  alert('Connexion - Fonctionnalité en développement\n\nEn production : Modal de connexion ou redirect vers /login')
  // TODO: Open login modal or redirect to /login
}

/**
 * Navigate to payment page
 * Validates form, saves user info and billing address to store, clears auto-save
 */
function goToPayment(): void {
  if (!isFormValid.value) {
    alert('Veuillez remplir tous les champs obligatoires')
    return
  }
  
  // Save user info to store
  bookingStore.setUserInfo(userForm.value)
  
  // Save billing address if different
  if (hasDifferentBillingAddress.value) {
    bookingStore.setBillingAddress(billingAddress.value)
  } else {
    bookingStore.setBillingAddress(null)
  }
  
  // Clear auto-save (data is now in store)
  clearUserFormSave()
  clearBillingAddressSave()
  
  // Navigate to payment
  router.push('/payment')
}

/**
 * Handle save for later - Send email with resume link
 * Generates token and sends simulated email
 */
async function handleSaveForLater(): Promise<void> {
  if (!userForm.value.email || !userForm.value.email.includes('@')) {
    alert('Veuillez renseigner votre email pour sauvegarder votre réservation')
    return
  }
  
  const token = await saveAndSendEmail(userForm.value.email, userForm.value)
  
  if (token) {
    isSaveForLaterModalOpen.value = true
  }
}

/**
 * Close save for later success modal
 */
function closeSaveForLaterModal(): void {
  isSaveForLaterModalOpen.value = false
}

/**
 * On mounted - Check for resume token and validate cart
 */
onMounted(() => {
  // Check if resuming from "save for later" link
  const token = route.query.token as string | undefined
  if (token) {
    const savedData = loadFromToken(token)
    if (savedData) {
      // Restore cart and user info
      cartStore.$patch({
        services: savedData.services,
        location: savedData.location,
        collectDateTime: savedData.collectDateTime
      })
      
      if (savedData.userInfo) {
        userForm.value = {
          firstName: savedData.userInfo.firstName || '',
          lastName: savedData.userInfo.lastName || '',
          email: savedData.userInfo.email || '',
          phone: savedData.userInfo.phone || '',
          createAccount: savedData.userInfo.createAccount || false,
          password: ''
        }
      }
      
      console.log('[Confirmation] Booking restored from token:', token)
    }
  }
  
  // Validate cart data
  if (cartStore.serviceCount === 0 || !cartStore.location || !cartStore.collectDateTime) {
    alert('Données de réservation incomplètes')
    router.push('/devis')
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
          <span class="text-xs md:text-sm font-semibold text-gray-700">Étape 2 sur 3</span>
          <span class="text-xs md:text-sm text-gray-600">66% complété</span>
        </div>
        <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all" style="width: 66%"></div>
        </div>
      </div>
      
      <div class="grid lg:grid-cols-3 gap-4 md:gap-6">
        <!-- Main Content (2/3) -->
        <main class="lg:col-span-2 space-y-3 md:space-y-4">
          
          <!-- Section 1 : Connexion (pliable) -->
          <div v-if="!isAuthenticated" class="bg-white rounded-lg shadow-sm p-3 md:p-4 border border-gray-200">
            <button 
              @click="showLoginSection = !showLoginSection" 
              class="w-full flex items-center justify-between group"
            >
              <div class="flex items-center gap-2">
                <Icon icon="mdi:account-circle" class="w-5 h-5 text-blue-primary" />
                <h2 class="text-sm md:text-base font-bold text-gray-900">Déjà client ?</h2>
              </div>
              <Icon 
                :icon="showLoginSection ? 'mdi:chevron-up' : 'mdi:chevron-down'" 
                class="w-5 h-5 text-gray-500 group-hover:text-orange-primary transition-colors" 
              />
            </button>
            
            <!-- Login options (expandable) -->
            <div v-if="showLoginSection" class="mt-4 space-y-3">
              <button 
                @click="handleLogin"
                class="w-full py-2.5 bg-blue-primary text-white font-semibold rounded-lg hover:bg-blue-dark transition-all flex items-center justify-center gap-2"
              >
                <Icon icon="mdi:login" class="w-5 h-5" />
                <span class="text-sm md:text-base">Se connecter</span>
              </button>
              
              <!-- Separator -->
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-300"></div>
                </div>
                <div class="relative flex justify-center text-xs md:text-sm">
                  <span class="px-2 bg-white text-gray-500">Ou continuer avec</span>
                </div>
              </div>
              
              <!-- Social login buttons -->
              <div class="grid grid-cols-3 gap-2">
                <button 
                  @click="handleSocialLogin('google')"
                  class="flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
                  title="Continuer avec Google"
                >
                  <Icon icon="mdi:google" class="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                  <span class="text-xs md:text-sm font-medium hidden md:inline">Google</span>
                </button>
                <button 
                  @click="handleSocialLogin('facebook')"
                  class="flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
                  title="Continuer avec Facebook"
                >
                  <Icon icon="mdi:facebook" class="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                  <span class="text-xs md:text-sm font-medium hidden md:inline">Facebook</span>
                </button>
                <button 
                  @click="handleSocialLogin('apple')"
                  class="flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
                  title="Continuer avec Apple"
                >
                  <Icon icon="mdi:apple" class="w-4 h-4 md:w-5 md:h-5 text-gray-900" />
                  <span class="text-xs md:text-sm font-medium hidden md:inline">Apple</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Section 2 : Coordonnées -->
          <div class="bg-white rounded-lg shadow-sm p-3 md:p-4 border border-gray-200">
            <h2 class="text-base md:text-lg font-bold text-gray-900 mb-3">Vos coordonnées</h2>

            <div class="space-y-3">
              <div class="grid md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs md:text-sm font-semibold text-gray-900 mb-1.5">Prénom *</label>
                  <input
                    v-model="userForm.firstName"
                    type="text"
                    placeholder="Jean"
                    class="w-full px-3 py-2 md:py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  />
                </div>
                <div>
                  <label class="block text-xs md:text-sm font-semibold text-gray-900 mb-1.5">Nom *</label>
                  <input
                    v-model="userForm.lastName"
                    type="text"
                    placeholder="Dupont"
                    class="w-full px-3 py-2 md:py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs md:text-sm font-semibold text-gray-900 mb-1.5">Email *</label>
                <input
                  v-model="userForm.email"
                  type="email"
                  placeholder="jean.dupont@example.com"
                  class="w-full px-3 py-2 md:py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                />
                <p class="text-xs text-gray-500 mt-1">Nous vous enverrons la confirmation par email</p>
              </div>

              <div>
                <label class="block text-xs md:text-sm font-semibold text-gray-900 mb-1.5">Téléphone *</label>
                <input
                  v-model="userForm.phone"
                  type="tel"
                  placeholder="06 12 34 56 78"
                  class="w-full px-3 py-2 md:py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                />
                <p class="text-xs text-gray-500 mt-1">Vous serez informé par SMS de l'avancement</p>
              </div>
            </div>
          </div>

          <!-- Section 3 : Adresse facturation (optionnelle) -->
          <div class="bg-white rounded-lg shadow-sm p-3 md:p-4 border border-gray-200">
            <label class="flex items-center gap-2 cursor-pointer group">
              <input 
                v-model="hasDifferentBillingAddress" 
                type="checkbox" 
                class="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span class="text-sm md:text-base font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                Mon adresse de facturation est différente
              </span>
            </label>
            
            <!-- Billing address form (if different) -->
            <div v-if="hasDifferentBillingAddress" class="mt-4 space-y-3 pl-6 border-l-2 border-orange-200">
              <div>
                <label class="block text-xs md:text-sm font-semibold text-gray-900 mb-1.5">Adresse *</label>
                <input
                  v-model="billingAddress.street"
                  type="text"
                  placeholder="15 rue de la République"
                  class="w-full px-3 py-2 md:py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>
              
              <div>
                <label class="block text-xs md:text-sm font-semibold text-gray-900 mb-1.5">Complément</label>
                <input
                  v-model="billingAddress.complement"
                  type="text"
                  placeholder="Bâtiment A, Appt 12"
                  class="w-full px-3 py-2 md:py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>
              
              <div class="grid md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs md:text-sm font-semibold text-gray-900 mb-1.5">Ville *</label>
                  <input
                    v-model="billingAddress.city"
                    type="text"
                    placeholder="Paris"
                    class="w-full px-3 py-2 md:py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>
                <div>
                  <label class="block text-xs md:text-sm font-semibold text-gray-900 mb-1.5">Code postal *</label>
                  <input
                    v-model="billingAddress.postalCode"
                    type="text"
                    placeholder="75001"
                    class="w-full px-3 py-2 md:py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Section 4 : Création compte (optionnelle) -->
          <div class="bg-blue-50 rounded-lg p-3 md:p-4 border border-blue-200">
            <label class="flex items-start gap-3 cursor-pointer group">
              <input 
                v-model="userForm.createAccount" 
                type="checkbox" 
                class="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div class="flex-1">
                <span class="block text-sm md:text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Créer un compte pour suivre mon intervention
                </span>
                <span class="block text-xs md:text-sm text-gray-700 mt-1">
                  Avantages : Historique des interventions, factures, suivi temps réel, gestion de votre véhicule
                </span>
              </div>
            </label>
            
            <!-- Password field (if creating account) -->
            <div v-if="userForm.createAccount" class="mt-3 pl-7">
              <label class="block text-xs md:text-sm font-semibold text-gray-900 mb-1.5">Mot de passe *</label>
              <input
                v-model="userForm.password"
                type="password"
                placeholder="Minimum 8 caractères"
                class="w-full px-3 py-2 md:py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <p class="text-xs text-gray-600 mt-1">Minimum 8 caractères</p>
            </div>
          </div>

          <!-- Section 5 : Actions -->
          <div class="flex flex-col md:flex-row gap-3">
            <button 
              @click="handleSaveForLater"
              :disabled="!userForm.email || isSavingForLater"
              class="py-2.5 md:py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              <Icon 
                :icon="isSavingForLater ? 'mdi:loading' : 'mdi:email-outline'" 
                :class="['w-5 h-5', isSavingForLater && 'animate-spin']" 
              />
              <span class="hidden md:inline">Sauvegarder et continuer plus tard</span>
              <span class="md:hidden">Sauvegarder</span>
            </button>
            
            <button 
              @click="goToPayment"
              :disabled="!isFormValid"
              :class="[
                'flex-1 py-2.5 md:py-3 font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 group text-sm md:text-base',
                isFormValid
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              ]"
            >
              <span>Continuer vers le paiement</span>
              <Icon icon="mdi:arrow-right" class="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </main>
        
        <!-- Sidebar Récap (1/3) -->
        <aside class="lg:col-span-1">
          <div class="sticky top-20 space-y-3 md:space-y-4">
            <!-- Récap services -->
            <div class="bg-white rounded-lg shadow-sm p-3 md:p-4 border border-gray-200">
              <h3 class="text-sm md:text-base font-bold text-gray-900 mb-3">Récapitulatif</h3>
              
              <!-- Services list -->
              <div class="space-y-2 mb-3 pb-3 border-b border-gray-200">
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
                  <p class="text-sm font-bold text-gray-900">{{ service.price }}€</p>
                </div>
              </div>
              
              <!-- Promo code (if any) -->
              <div v-if="bookingStore.promoCode" class="flex items-center justify-between text-xs md:text-sm text-green-600 mb-2">
                <span>Code promo ({{ bookingStore.promoCode }})</span>
                <span>-{{ bookingStore.discountPercentage }}%</span>
              </div>
              
              <!-- Total -->
              <div class="flex items-center justify-between pt-3 border-t border-gray-200">
                <span class="text-sm md:text-base font-bold text-gray-900">Total TTC</span>
                <span class="text-lg md:text-xl font-bold text-orange-600">{{ totalWithDiscount.toFixed(2) }}€</span>
              </div>
            </div>
            
            <!-- Infos intervention -->
            <div class="bg-white rounded-lg shadow-sm p-3 md:p-4 border border-gray-200">
              <h3 class="text-sm md:text-base font-bold text-gray-900 mb-3">Votre intervention</h3>
              
              <div class="space-y-3">
                <!-- Adresse -->
                <div class="flex items-start gap-2">
                  <Icon icon="mdi:map-marker" class="w-4 h-4 md:w-5 md:h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p class="text-xs font-semibold text-gray-700">Adresse</p>
                    <p class="text-xs text-gray-900">
                      {{ cartStore.location?.street }}<br>
                      {{ cartStore.location?.city }} {{ cartStore.location?.postalCode }}
                    </p>
                  </div>
                </div>
                
                <!-- Créneaux -->
                <div class="flex items-start gap-2">
                  <Icon icon="mdi:clock-outline" class="w-4 h-4 md:w-5 md:h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p class="text-xs font-semibold text-gray-700">Créneaux préférés</p>
                    <div class="space-y-0.5 mt-1">
                      <p 
                        v-for="(slot, index) in formattedTimeRanges" 
                        :key="index"
                        class="text-xs text-gray-900"
                      >
                        {{ index + 1 }}. {{ slot }}
                      </p>
                    </div>
                  </div>
                </div>
                
                <!-- Duration -->
                <div class="flex items-start gap-2">
                  <Icon icon="mdi:timer-outline" class="w-4 h-4 md:w-5 md:h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p class="text-xs font-semibold text-gray-700">Durée totale</p>
                    <p class="text-xs text-gray-900">
                      {{ cartStore.totalDuration }} minutes
                    </p>
                  </div>
                </div>
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
                  <Icon icon="mdi:cancel" class="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" />
                  <span class="font-semibold text-blue-800">Annulation gratuite 24h avant</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </Container>

    <!-- Footer -->
    <Footer />
    
    <!-- Context Modal (Vehicle + Location) -->
    <Teleport to="body">
      <BookingAccordionModal 
        v-if="isContextModalOpen" 
        @close="closeContextModal" 
      />
    </Teleport>
    
    <!-- Save for Later Success Modal -->
    <Teleport to="body">
      <div 
        v-if="isSaveForLaterModalOpen"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="closeSaveForLaterModal"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div class="flex items-center justify-center mb-4">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Icon icon="mdi:email-check" class="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <h3 class="text-xl font-bold text-center text-gray-900 mb-2">Email envoyé !</h3>
          <p class="text-sm text-gray-700 text-center mb-6">
            Nous vous avons envoyé un email à <strong>{{ userForm.email }}</strong> avec un lien pour reprendre votre réservation.
          </p>
          
          <p class="text-xs text-gray-600 text-center mb-4">
            Le lien est valide pendant 7 jours.
          </p>
          
          <button 
            @click="closeSaveForLaterModal"
            class="w-full py-2.5 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
          >
            J'ai compris
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
