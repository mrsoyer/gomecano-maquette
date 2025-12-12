<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useCartStore } from '@/stores/cart.store'
import { useBookingStore } from '@/stores/booking.store'
import { mockBookingMechanic } from '@/mocks/bookingData'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'

const router = useRouter()
const cartStore = useCartStore()
const bookingStore = useBookingStore()

/**
 * Computed - Mechanic (from mock data)
 */
const mechanic = computed(() => mockBookingMechanic)

/**
 * Computed - User first name
 */
const userFirstName = computed(() => bookingStore.userInfo?.firstName || 'Client')

/**
 * Computed - Collect date formatted
 */
const collectDateFormatted = computed(() => {
  if (!cartStore.collectDateTime?.date) return '-'
  
  return new Date(cartStore.collectDateTime.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

/**
 * Download invoice (mock)
 */
function downloadInvoice(): void {
  alert('Téléchargement de la facture - Feature en cours de développement')
}

/**
 * Add to calendar (mock)
 */
function addToCalendar(): void {
  alert('Ajout au calendrier - Feature en cours de développement')
}

/**
 * Share booking (mock)
 */
function shareBooking(): void {
  alert('Partage de la réservation - Feature en cours de développement')
}

/**
 * On mounted
 */
onMounted(() => {
  // Redirect if no confirmed booking
  if (!bookingStore.confirmedBooking) {
    alert('Aucune réservation confirmée')
    router.push('/')
    return
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header global avec TopBar -->
    <Header />

    <Container class="py-8 md:py-12">
      <div class="max-w-4xl mx-auto">
        <!-- Success Animation -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <Icon icon="mdi:check-circle" class="w-16 h-16 text-green-primary" />
          </div>
          <h1 class="text-4xl font-bold text-gray-900 mb-2">
            Réservation confirmée !
          </h1>
          <p class="text-xl text-gray-600 flex items-center gap-2 justify-center">
            Merci {{ userFirstName }} !
            <Icon icon="mdi:party-popper" class="w-6 h-6 text-orange-primary" />
          </p>
        </div>

        <!-- Booking Details Card -->
        <div class="bg-white rounded-lg border shadow-sm p-8 mb-6">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Détails de votre intervention</h2>

          <div class="space-y-4">
            <!-- Vehicle -->
            <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Icon icon="mdi:car" class="w-8 h-8 text-blue-primary flex-shrink-0" />
              <div>
                <p class="font-semibold text-gray-900">
                  {{ cartStore.vehicle?.make }} {{ cartStore.vehicle?.model }}
                </p>
                <p class="text-sm text-gray-600">
                  {{ cartStore.vehicle?.year }} · {{ cartStore.vehicle?.mileage.toLocaleString() }} km
                </p>
              </div>
            </div>

            <!-- Services -->
            <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Icon icon="mdi:wrench" class="w-8 h-8 text-blue-primary flex-shrink-0" />
              <div class="flex-1">
                <p class="font-semibold text-gray-900 mb-2">Services réservés</p>
                <ul class="space-y-1">
                  <li
                    v-for="service in cartStore.services"
                    :key="service.id"
                    class="text-sm text-gray-700"
                  >
                    • {{ service.name }} ({{ service.price }}€)
                  </li>
                </ul>
                <p class="text-sm font-bold text-gray-900 mt-2">
                  Total: {{ cartStore.total.toFixed(2) }}€
                </p>
              </div>
            </div>

            <!-- Date & Time -->
            <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Icon icon="mdi:calendar" class="w-8 h-8 text-blue-primary flex-shrink-0" />
              <div>
                <p class="font-semibold text-gray-900">Collecte</p>
                <p class="text-sm text-gray-700">
                  {{ collectDateFormatted }}
                </p>
                <p class="text-sm text-gray-700">
                  {{ cartStore.collectDateTime?.slot }}
                </p>
              </div>
            </div>

            <!-- Address -->
            <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Icon icon="mdi:map-marker" class="w-8 h-8 text-blue-primary flex-shrink-0" />
              <div>
                <p class="font-semibold text-gray-900">Lieu de collecte</p>
                <p class="text-sm text-gray-700">
                  {{ cartStore.location?.street }}
                </p>
                <p class="text-sm text-gray-700">
                  {{ cartStore.location?.city }} {{ cartStore.location?.postalCode }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Mechanic Card -->
        <div class="bg-white rounded-lg border shadow-sm p-8 mb-6">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Votre mécanicien</h2>

          <div class="flex items-start gap-6">
            <div class="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:account-wrench" class="w-12 h-12 text-gray-600" />
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <h3 class="text-lg font-bold text-gray-900">
                  {{ mechanic.firstName }} {{ mechanic.lastName }}
                </h3>
                <div class="flex items-center gap-1">
                  <Icon icon="mdi:star" class="w-4 h-4 text-orange-primary" />
                  <span class="font-semibold text-gray-900">{{ mechanic.rating }}</span>
                  <span class="text-sm text-gray-500">({{ mechanic.reviewsCount }} avis)</span>
                </div>
              </div>
              <p class="text-sm text-gray-600 mb-3">{{ mechanic.bio }}</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="specialty in mechanic.specialties"
                  :key="specialty"
                  class="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
                >
                  {{ specialty }}
                </span>
                <span class="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  {{ mechanic.experience }} ans d'expérience
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Next Steps Timeline -->
        <div class="bg-white rounded-lg border shadow-sm p-8 mb-6">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Prochaines étapes</h2>

          <div class="space-y-4">
            <div class="flex items-start gap-4">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon icon="mdi:check" class="w-5 h-5 text-green-primary" />
              </div>
              <div>
                <p class="font-semibold text-gray-900">Email de confirmation envoyé</p>
                <p class="text-sm text-gray-600">
                  Consultez {{ bookingStore.userInfo?.email }}
                </p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <p class="font-semibold text-gray-900">SMS de rappel 24h avant</p>
                <p class="text-sm text-gray-600">
                  Nous vous enverrons un rappel la veille de l'intervention
                </p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-blue-600 font-bold">3</span>
              </div>
              <div>
                <p class="font-semibold text-gray-900">SMS 1h avant l'arrivée du chauffeur</p>
                <p class="text-sm text-gray-600">
                  Vous serez notifié quand notre chauffeur sera en route
                </p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-blue-600 font-bold">4</span>
              </div>
              <div>
                <p class="font-semibold text-gray-900">Suivi en temps réel</p>
                <p class="text-sm text-gray-600">
                  Recevez des mises à jour SMS pendant l'intervention
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            @click="downloadInvoice"
            class="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            <Icon icon="mdi:file-document" class="w-5 h-5" />
            <span>Télécharger facture</span>
          </button>

          <button
            @click="addToCalendar"
            class="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            <Icon icon="mdi:calendar-plus" class="w-5 h-5" />
            <span>Ajouter au calendrier</span>
          </button>

          <button
            @click="shareBooking"
            class="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            <span>📤</span>
            <span>Partager</span>
          </button>
        </div>

        <!-- Preparation Tips -->
        <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 class="font-bold text-blue-900 mb-4 flex items-center gap-2">
            <Icon icon="mdi:lightbulb" class="w-5 h-5 text-orange-primary" />
            <span>En attendant votre rendez-vous</span>
          </h3>
          <ul class="space-y-2 text-sm text-blue-800">
            <li class="flex items-start gap-2">
              <span class="text-blue-600">•</span>
              <span>Assurez-vous que votre véhicule soit accessible au chauffeur</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-blue-600">•</span>
              <span>Préparez vos clés et carte grise</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-blue-600">•</span>
              <span>Notez les éventuels problèmes supplémentaires à signaler</span>
            </li>
          </ul>
        </div>

        <!-- Back to Home -->
        <div class="text-center mt-8">
          <button
            @click="router.push('/')"
            class="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold"
          >
            <span>←</span>
            <span>Retour à l'accueil</span>
          </button>
        </div>
      </div>
    </Container>
    
    <Footer />
  </div>
</template>
