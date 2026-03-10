<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores/user.store'
import { useInterventionStore } from '@/stores/intervention.store'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import VehicleInfoCard from '@/components/account/vehicles/VehicleInfoCard.vue'
import MaintenanceLogbookCard from '@/components/account/vehicles/MaintenanceLogbookCard.vue'
import MaintenanceAlertsCard from '@/components/account/vehicles/MaintenanceAlertsCard.vue'
import VehicleStatsCard from '@/components/account/vehicles/VehicleStatsCard.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const interventionStore = useInterventionStore()

const vehicleId = route.params.id as string
const vehicle = ref<any>(null)

onMounted(async () => {
  if (!userStore.isAuthenticated) {
    await userStore.loginById('user-1')
  }
  if (userStore.user) {
    await interventionStore.fetchInterventions(userStore.user.id)
    
    // Find vehicle in interventions
    const intervention = interventionStore.userInterventions.find(i => i.vehicle.id === vehicleId)
    if (intervention) {
      vehicle.value = intervention.vehicle
    }
  }
})

// Vehicle interventions
const vehicleInterventions = computed(() =>
  interventionStore.userInterventions.filter(i => i.vehicle.id === vehicleId)
)

// Stats
const totalSpent = computed(() =>
  vehicleInterventions.value.reduce((sum, i) => sum + (i.invoice?.totalTTC || 0), 0)
)

const lastServiceDate = computed(() => {
  const completed = vehicleInterventions.value.filter(i => i.status === 'termine')
  if (completed.length === 0) return undefined
  return completed.sort((a, b) =>
    new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
  )[0].scheduledAt
})

// Mock alerts
const maintenanceAlerts = computed(() => {
  if (!vehicle.value || !vehicle.value.mileage) return []
  if (vehicle.value.mileage > 40000) {
    return [{
      id: 'alert-1',
      type: 'km',
      message: 'Révision complète recommandée dans 2000 km',
      severity: 'medium',
      recommendedService: '2'
    }]
  }
  return []
})

/**
 * Book intervention
 */
function bookIntervention(): void {
  router.push('/services')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <Container class="py-4 md:py-6">
      <!-- Back Button -->
      <button
        @click="router.push('/account/vehicles')"
        class="flex items-center gap-2 text-sm md:text-base font-semibold text-blue-primary hover:underline mb-4"
      >
        <Icon icon="mdi:arrow-left" class="w-5 h-5" />
        <span>Retour à mes véhicules</span>
      </button>

      <!-- Loading -->
      <div v-if="!vehicle" class="text-center py-12">
        <Icon icon="mdi:loading" class="w-12 h-12 mx-auto text-blue-primary animate-spin mb-3" />
        <p class="text-gray-600">Chargement...</p>
      </div>

      <!-- Vehicle Detail -->
      <div v-else class="grid lg:grid-cols-3 gap-4 md:gap-6">
        <!-- Main (2/3) -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Vehicle Info -->
          <VehicleInfoCard :vehicle="vehicle" :editable="true" />

          <!-- Maintenance Logbook -->
          <MaintenanceLogbookCard
            :interventions="vehicleInterventions"
            :vehicle="vehicle"
          />
        </div>

        <!-- Sidebar (1/3) -->
        <aside class="space-y-4">
          <!-- Stats -->
          <VehicleStatsCard
            :total-interventions="vehicleInterventions.length"
            :total-spent="totalSpent"
            :last-service="lastServiceDate"
          />

          <!-- Alerts -->
          <MaintenanceAlertsCard
            :alerts="maintenanceAlerts"
            @book="bookIntervention"
          />

          <!-- Actions -->
          <div class="space-y-2">
            <button @click="bookIntervention" class="w-full btn-primary flex items-center justify-center gap-2">
              <Icon icon="mdi:calendar-plus" class="w-5 h-5" />
              <span>Réserver une intervention</span>
            </button>
          </div>
        </aside>
      </div>
    </Container>

    <Footer />
  </div>
</template>
