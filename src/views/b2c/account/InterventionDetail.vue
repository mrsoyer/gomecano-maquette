<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useRealtimeIntervention } from '@/composables/useRealtimeIntervention'
import { useGeolocation } from '@/composables/useGeolocation'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import InterventionProgressBar from '@/components/account/interventions/InterventionProgressBar.vue'
import LiveMechanicMapCard from '@/components/account/interventions/LiveMechanicMapCard.vue'
import InterventionTimelineCard from '@/components/account/interventions/InterventionTimelineCard.vue'
import LiveChatCard from '@/components/account/interventions/LiveChatCard.vue'
import TechnicalChecklistCard from '@/components/account/interventions/TechnicalChecklistCard.vue'
import MechanicCard from '@/components/account/shared/MechanicCard.vue'
import ModifyAppointmentModal from '@/components/booking/ModifyAppointmentModal.vue'
import CancelAppointmentModal from '@/components/booking/CancelAppointmentModal.vue'
import RescheduleAppointmentModal from '@/components/booking/RescheduleAppointmentModal.vue'
import type { CancellationPolicy, RescheduleOptions } from '@/types/booking'

const route = useRoute()
const router = useRouter()
const interventionId = route.params.id as string

// Real-time intervention
const {
  intervention,
  interventionTimeline,
  chatMessages,
  checklist,
  isLoading,
  error,
  sendMessage
} = useRealtimeIntervention(interventionId)

// GPS tracking (only if en_route)
const isEnRoute = computed(() => intervention.value?.status === 'en_route')
const { mechanicLocation, estimatedArrival } = useGeolocation(
  computed(() => intervention.value?.mechanic.id || ''),
  isEnRoute
)

// Progress steps
const progressSteps = ['Confirmé', 'En route', 'Sur place', 'En cours', 'Terminé']

// Booking modification modals
const activeModal = ref<'modify' | 'cancel' | 'reschedule' | null>(null)

// Mock cancellation policy
const cancellationPolicy: CancellationPolicy = {
  id: 'policy-1',
  minHoursBeforeAppointment: 24,
  refundPercentage: 80,
  cancellationFee: 15,
  description: 'Annulation gratuite jusqu\'à 24h avant le rendez-vous. Au-delà, des frais de 15€ s\'appliquent et 80% du montant sera remboursé.'
}

// Mock reschedule options
const rescheduleOptions: RescheduleOptions = {
  id: 'reschedule-1',
  interventionId: interventionId,
  availableSlots: [
    { date: '2025-12-15', time: '09:00', available: true },
    { date: '2025-12-15', time: '14:00', available: true },
    { date: '2025-12-16', time: '10:00', available: true },
    { date: '2025-12-16', time: '15:00', available: true },
    { date: '2025-12-17', time: '08:00', available: true },
    { date: '2025-12-17', time: '13:00', available: true }
  ],
  rescheduleFee: 10,
  minHoursNotice: 48
}

// Check if intervention can be modified/cancelled
const canModify = computed(() => {
  return intervention.value?.status === 'scheduled' || intervention.value?.status === 'confirmed'
})

/**
 * Handle send message
 */
function handleSendMessage(content: string): void {
  sendMessage(content)
}

/**
 * Handle cancel intervention
 */
async function handleCancelIntervention(reason: string, requestRefund: boolean): Promise<void> {
  console.log('[InterventionDetail] Cancel intervention:', reason, requestRefund)
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  activeModal.value = null
  alert('Intervention annulée avec succès. Un email de confirmation vous a été envoyé.')
  router.push('/account/dashboard')
}

/**
 * Handle reschedule intervention
 */
async function handleRescheduleIntervention(newDate: string, newTime: string, reason: string): Promise<void> {
  console.log('[InterventionDetail] Reschedule intervention:', newDate, newTime, reason)
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  activeModal.value = null
  alert(`Intervention reportée au ${new Date(newDate).toLocaleDateString('fr-FR')} à ${newTime}. Un email de confirmation vous a été envoyé.`)
  window.location.reload()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <Container class="py-4 md:py-6">
      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-12">
        <Icon icon="mdi:loading" class="w-12 h-12 mx-auto text-blue-primary animate-spin mb-3" />
        <p class="text-gray-600">Chargement de l'intervention...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-12">
        <Icon icon="mdi:alert-circle" class="w-16 h-16 mx-auto text-red-500 mb-3" />
        <p class="text-red-600 font-semibold mb-4">{{ error }}</p>
        <button @click="router.push('/account/dashboard')" class="btn-primary">
          Retour au dashboard
        </button>
      </div>

      <!-- Intervention Detail -->
      <div v-else-if="intervention">
        <!-- Back Button -->
        <button
          @click="router.push('/account/dashboard')"
          class="flex items-center gap-2 text-sm md:text-base font-semibold text-blue-primary hover:underline mb-3 md:mb-4"
        >
          <Icon icon="mdi:arrow-left" class="w-5 h-5" />
          <span>Retour au dashboard</span>
        </button>

        <!-- Progress Bar -->
        <InterventionProgressBar
          :current-step="intervention.currentStep"
          :steps="progressSteps"
        />

        <!-- Modify/Cancel Actions (only if scheduled or confirmed) -->
        <div v-if="canModify" class="mb-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-gray-900">Besoin de modifier votre rendez-vous ?</p>
              <p class="text-xs text-gray-600 mt-1">Vous pouvez reporter ou annuler votre intervention</p>
            </div>
            <div class="flex gap-2 w-full sm:w-auto">
              <button
                @click="activeModal = 'modify'"
                class="flex-1 sm:flex-initial px-4 py-2 text-sm font-semibold text-blue-primary border border-blue-primary rounded-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                <Icon icon="mdi:calendar-edit" class="w-4 h-4" />
                <span>Modifier</span>
              </button>
            </div>
          </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-4 md:gap-6">
          <!-- Main Content (2/3) -->
          <div class="lg:col-span-2 space-y-4">
            <!-- Live Map (if en_route) -->
            <LiveMechanicMapCard
              v-if="intervention.status === 'en_route' && mechanicLocation"
              :mechanic-location="mechanicLocation"
              :client-location="intervention.address"
              :eta="estimatedArrival"
            />

            <!-- Timeline -->
            <InterventionTimelineCard :events="interventionTimeline" />

            <!-- Chat -->
            <LiveChatCard
              :messages="chatMessages"
              :mechanic="intervention.mechanic"
              @send-message="handleSendMessage"
            />

            <!-- Checklist (if en_cours) -->
            <TechnicalChecklistCard
              v-if="intervention.status === 'en_cours'"
              :items="checklist"
              :readonly="true"
            />
          </div>

          <!-- Sidebar (1/3) -->
          <aside class="space-y-4">
            <!-- Mechanic -->
            <MechanicCard
              :mechanic="intervention.mechanic"
              :show-call-button="true"
              :show-chat-button="false"
            />

            <!-- Service Details -->
            <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
              <h3 class="text-sm md:text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Icon icon="mdi:wrench" class="w-5 h-5 text-blue-primary" />
                Service
              </h3>
              <div class="space-y-2">
                <p class="text-sm md:text-base font-semibold text-gray-900">{{ intervention.service.name }}</p>
                <div class="flex items-center gap-2 text-xs text-gray-600">
                  <Icon icon="mdi:clock-outline" class="w-4 h-4" />
                  <span>{{ intervention.quote.duration }} minutes</span>
                </div>
                <div class="flex items-center gap-2 text-xs text-gray-600">
                  <Icon icon="mdi:cash" class="w-4 h-4" />
                  <span class="font-semibold text-base text-gray-900">{{ intervention.quote.totalPrice }}€</span>
                </div>
              </div>
            </div>

            <!-- Vehicle -->
            <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
              <h3 class="text-sm md:text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Icon icon="mdi:car" class="w-5 h-5 text-blue-primary" />
                Véhicule
              </h3>
              <p class="text-sm md:text-base font-semibold text-gray-900 mb-1">
                {{ intervention.vehicle.make }} {{ intervention.vehicle.model }}
              </p>
              <p class="text-xs text-gray-600">{{ intervention.vehicle.plate }}</p>
            </div>

            <!-- Address -->
            <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
              <h3 class="text-sm md:text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Icon icon="mdi:map-marker" class="w-5 h-5 text-blue-primary" />
                Lieu
              </h3>
              <p class="text-xs md:text-sm text-gray-700">
                {{ intervention.address.street }}<br>
                {{ intervention.address.postalCode }} {{ intervention.address.city }}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </Container>

    <!-- Booking modification modals -->
    <ModifyAppointmentModal
      v-if="activeModal === 'modify' && intervention"
      :intervention="intervention"
      @cancel="activeModal = null"
      @open-reschedule="activeModal = 'reschedule'"
      @open-cancel="activeModal = 'cancel'"
    />

    <CancelAppointmentModal
      v-if="activeModal === 'cancel' && intervention"
      :intervention="intervention"
      :policy="cancellationPolicy"
      @cancel="activeModal = null"
      @confirm="handleCancelIntervention"
    />

    <RescheduleAppointmentModal
      v-if="activeModal === 'reschedule' && intervention"
      :intervention="intervention"
      :options="rescheduleOptions"
      @cancel="activeModal = null"
      @confirm="handleRescheduleIntervention"
    />

    <Footer />
  </div>
</template>