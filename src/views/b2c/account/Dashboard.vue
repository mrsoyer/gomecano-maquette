<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores/user.store'
import { useInterventionStore } from '@/stores/intervention.store'
import { useNotifications } from '@/composables/useNotifications'
import { useAnalytics } from '@/composables/useAnalytics'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import WelcomeSection from '@/components/account/dashboard/WelcomeSection.vue'
import StatCard from '@/components/account/dashboard/StatCard.vue'
import QuickActionCard from '@/components/account/dashboard/QuickActionCard.vue'
import ActiveInterventionCard from '@/components/account/interventions/ActiveInterventionCard.vue'
import NotificationsWidget from '@/components/account/shared/NotificationsWidget.vue'
import LoyaltyProgramWidget from '@/components/account/shared/LoyaltyProgramWidget.vue'
import BudgetAlertCard from '@/components/analytics/BudgetAlertCard.vue'

const router = useRouter()
const userStore = useUserStore()
const interventionStore = useInterventionStore()

// Analytics
const { criticalAlerts, dismissAlert, fetchDashboard } = useAnalytics('user-1')

// Auto-login user-1 for demo
onMounted(async () => {
  if (!userStore.isAuthenticated) {
    await userStore.loginById('user-1')
  }
  if (userStore.user) {
    await interventionStore.fetchInterventions(userStore.user.id)
    await fetchDashboard()
  }
})

// Notifications
const { recentNotifications, unreadCount } = useNotifications(
  computed(() => userStore.user?.id || '')
)

// Mock vehicle count (from interventions for now)
const vehicleCount = computed(() => {
  const uniqueVehicles = new Set(
    interventionStore.userInterventions.map(i => i.vehicle.id)
  )
  return uniqueVehicles.size || 1
})

/**
 * Navigate to services
 */
function goToServices(): void {
  router.push('/services')
}

/**
 * Navigate to vehicles
 */
function goToVehicles(): void {
  router.push('/account/vehicles')
}

/**
 * Navigate to active intervention
 */
function goToActiveIntervention(): void {
  if (interventionStore.activeIntervention) {
    router.push(`/account/interventions/${interventionStore.activeIntervention.id}`)
  }
}

/**
 * Open support (mock)
 */
function openSupport(): void {
  alert('Support - Fonctionnalité en développement\n\nEn production : Chat live ou formulaire de contact')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <Container class="py-4 md:py-6">
      <!-- Welcome Section -->
      <WelcomeSection
        v-if="userStore.user"
        :user-name="userStore.userFirstName"
        :account-type="userStore.user.accountType"
      />

      <!-- Quick Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <StatCard
          icon="mdi:car"
          :value="vehicleCount"
          label="Véhicules"
          color="blue"
          @click="goToVehicles"
        />
        <StatCard
          icon="mdi:calendar-check"
          :value="interventionStore.upcomingInterventionsCount"
          label="RDV à venir"
          color="green"
          :badge="interventionStore.nextInterventionDate || undefined"
        />
        <StatCard
          icon="mdi:clock-outline"
          :value="interventionStore.hasActiveIntervention ? 1 : 0"
          label="En cours"
          color="orange"
          :pulse="interventionStore.hasActiveIntervention"
          @click="goToActiveIntervention"
        />
        <StatCard
          icon="mdi:receipt-text"
          :value="Math.round(interventionStore.totalSpentYear)"
          label="Dépenses 2024"
          color="gray"
          suffix="€"
        />
      </div>

      <!-- Active Intervention (if exists) -->
      <ActiveInterventionCard
        v-if="interventionStore.activeIntervention"
        :intervention="interventionStore.activeIntervention"
        @click="goToActiveIntervention"
        class="mb-4 md:mb-6"
      />

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
        <QuickActionCard
          icon="mdi:calendar-plus"
          title="Réserver une intervention"
          description="Trouvez un créneau disponible"
          cta="Réserver"
          @click="goToServices"
        />
        <QuickActionCard
          icon="mdi:car-wrench"
          title="Ajouter un véhicule"
          description="Enregistrez un nouveau véhicule"
          cta="Ajouter"
          @click="goToVehicles"
        />
        <QuickActionCard
          icon="mdi:headset"
          title="Contacter le support"
          description="Une question ? On vous aide"
          cta="Contacter"
          @click="openSupport"
        />
      </div>

      <!-- Main Content -->
      <div class="grid lg:grid-cols-3 gap-4 md:gap-6">
        <!-- Main (2/3) -->
        <div class="lg:col-span-2 space-y-4 md:space-y-6">
          <!-- Upcoming Appointments -->
          <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
            <h2 class="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
              <Icon icon="mdi:calendar-clock" class="w-5 h-5 md:w-6 md:h-6 text-blue-primary" />
              Prochains rendez-vous
            </h2>

            <!-- Empty State -->
            <div v-if="interventionStore.upcomingInterventions.length === 0" class="text-center py-8">
              <Icon icon="mdi:calendar-blank" class="w-16 h-16 mx-auto text-gray-300 mb-2" />
              <p class="text-sm text-gray-500 mb-4">Aucun rendez-vous prévu</p>
              <button @click="goToServices" class="btn-primary">
                Réserver une intervention
              </button>
            </div>

            <!-- Appointments List -->
            <div v-else class="space-y-3">
              <div
                v-for="intervention in interventionStore.upcomingInterventions"
                :key="intervention.id"
                class="border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                @click="router.push(`/account/interventions/${intervention.id}`)"
              >
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <h4 class="text-sm md:text-base font-semibold text-gray-900 mb-1">
                      {{ intervention.service.name }}
                    </h4>
                    <p class="text-xs text-gray-600">
                      {{ new Date(intervention.scheduledAt).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) }}
                    </p>
                  </div>
                  <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    {{ intervention.status === 'confirmed' ? 'Confirmé' : 'Programmé' }}
                  </span>
                </div>

                <div class="flex items-center gap-4 text-xs text-gray-600">
                  <div class="flex items-center gap-1">
                    <Icon icon="mdi:car" class="w-4 h-4" />
                    <span>{{ intervention.vehicle.make }} {{ intervention.vehicle.model }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <Icon icon="mdi:map-marker" class="w-4 h-4" />
                    <span>{{ intervention.address.city }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent History -->
          <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
            <div class="flex items-center justify-between mb-3 md:mb-4">
              <h2 class="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
                <Icon icon="mdi:history" class="w-5 h-5 md:w-6 md:h-6 text-blue-primary" />
                Historique récent
              </h2>
              <button
                @click="router.push('/account/history')"
                class="text-xs md:text-sm font-semibold text-blue-primary hover:underline"
              >
                Tout voir
              </button>
            </div>

            <!-- Empty State -->
            <div v-if="interventionStore.recentInterventions.length === 0" class="text-center py-6">
              <Icon icon="mdi:clock-outline" class="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p class="text-sm text-gray-500">Aucun historique</p>
            </div>

            <!-- History List -->
            <div v-else class="space-y-2">
              <div
                v-for="intervention in interventionStore.recentInterventions.slice(0, 3)"
                :key="intervention.id"
                class="border border-gray-200 rounded-lg p-2 md:p-3 hover:border-green-300 hover:bg-green-50 transition-all cursor-pointer"
                @click="router.push(`/account/interventions/${intervention.id}`)"
              >
                <div class="flex justify-between mb-1">
                  <h4 class="text-sm font-semibold text-gray-900">{{ intervention.service.name }}</h4>
                  <span class="text-sm font-bold text-green-primary">{{ intervention.quote.totalPrice }}€</span>
                </div>
                <div class="flex items-center gap-3 text-xs text-gray-600">
                  <span>{{ new Date(intervention.scheduledAt).toLocaleDateString('fr-FR') }}</span>
                  <span>•</span>
                  <span>{{ intervention.vehicle.make }} {{ intervention.vehicle.model }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar (1/3) -->
        <aside class="space-y-4">
          <!-- Notifications -->
          <NotificationsWidget :notifications="recentNotifications" />

          <!-- Loyalty Program -->
          <LoyaltyProgramWidget
            v-if="userStore.user"
            :points="userStore.loyaltyPoints"
          />

          <!-- Budget Alerts -->
          <div v-if="criticalAlerts.length > 0" class="space-y-3">
            <BudgetAlertCard
              v-for="alert in criticalAlerts.slice(0, 2)"
              :key="alert.id"
              :alert="alert"
              @dismiss="dismissAlert(alert.id)"
              @view-details="router.push('/account/history')"
            />
          </div>

          <!-- Quick Links -->
          <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
            <h3 class="text-sm md:text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Icon icon="mdi:link-variant" class="w-5 h-5 text-blue-primary" />
              Liens rapides
            </h3>
            <div class="space-y-2">
              <button
                @click="router.push('/account/vehicles')"
                class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-primary rounded-lg transition-all flex items-center gap-2"
              >
                <Icon icon="mdi:car" class="w-4 h-4" />
                <span>Mes véhicules</span>
              </button>
              <button
                @click="router.push('/account/history')"
                class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-primary rounded-lg transition-all flex items-center gap-2"
              >
                <Icon icon="mdi:history" class="w-4 h-4" />
                <span>Historique & Factures</span>
              </button>
              <button
                @click="router.push('/account/profile')"
                class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-primary rounded-lg transition-all flex items-center gap-2"
              >
                <Icon icon="mdi:account-edit" class="w-4 h-4" />
                <span>Mon profil</span>
              </button>
              <button
                @click="router.push('/account/payments')"
                class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-primary rounded-lg transition-all flex items-center gap-2"
              >
                <Icon icon="mdi:credit-card" class="w-4 h-4" />
                <span>Paiements</span>
              </button>
              <button
                @click="router.push('/account/settings')"
                class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-primary rounded-lg transition-all flex items-center gap-2"
              >
                <Icon icon="mdi:cog" class="w-4 h-4" />
                <span>Paramètres</span>
              </button>
              <button
                @click="router.push('/services')"
                class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-primary rounded-lg transition-all flex items-center gap-2"
              >
                <Icon icon="mdi:calendar-plus" class="w-4 h-4" />
                <span>Réserver</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </Container>

    <Footer />
  </div>
</template>