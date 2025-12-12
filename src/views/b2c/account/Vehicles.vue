<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores/user.store'
import { useInterventionStore } from '@/stores/intervention.store'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import VehicleCard from '@/components/account/vehicles/VehicleCard.vue'

const router = useRouter()
const userStore = useUserStore()
const interventionStore = useInterventionStore()

// Mock vehicles (extracted from interventions)
const vehicles = ref<any[]>([])

onMounted(async () => {
  if (!userStore.isAuthenticated) {
    await userStore.loginById('user-1')
  }
  if (userStore.user) {
    await interventionStore.fetchInterventions(userStore.user.id)
    
    // Extract unique vehicles from interventions
    const uniqueVehicles = new Map()
    interventionStore.userInterventions.forEach(i => {
      if (!uniqueVehicles.has(i.vehicle.id)) {
        uniqueVehicles.set(i.vehicle.id, i.vehicle)
      }
    })
    vehicles.value = Array.from(uniqueVehicles.values())
  }
})

/**
 * Mock maintenance alerts
 */
function getMaintenanceAlerts(vehicle: any) {
  if (vehicle.mileage && vehicle.mileage > 40000) {
    return [
      { type: 'km', message: 'Révision recommandée dans 2000 km', severity: 'medium' }
    ]
  }
  return []
}

/**
 * Open add vehicle modal (mock)
 */
function openAddVehicleModal(): void {
  alert('Ajout véhicule - Fonctionnalité en développement\n\nEn production : Modal avec formulaire ou API RMI')
}

/**
 * Edit vehicle (mock)
 */
function editVehicle(vehicle: any): void {
  alert(`Modifier ${vehicle.make} ${vehicle.model}\n\nFonctionnalité en développement`)
}

/**
 * Delete vehicle (mock)
 */
function deleteVehicle(vehicle: any): void {
  if (confirm(`Supprimer ${vehicle.make} ${vehicle.model} ?`)) {
    const index = vehicles.value.findIndex(v => v.id === vehicle.id)
    if (index !== -1) {
      vehicles.value.splice(index, 1)
    }
  }
}

/**
 * Go to vehicle detail
 */
function goToVehicleDetail(vehicle: any): void {
  router.push(`/account/vehicles/${vehicle.id}`)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <Container class="py-4 md:py-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Mes Véhicules</h1>
          <p class="text-sm md:text-base text-gray-600">Gérez votre parc automobile</p>
        </div>
        <button @click="openAddVehicleModal" class="btn-primary flex items-center gap-2">
          <Icon icon="mdi:plus" class="w-5 h-5" />
          <span class="hidden md:inline">Ajouter un véhicule</span>
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="vehicles.length === 0" class="bg-white rounded-xl border-2 border-gray-200 p-8 md:p-12 text-center">
        <Icon icon="mdi:car-off" class="w-20 h-20 md:w-24 md:h-24 mx-auto text-gray-300 mb-4" />
        <h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-2">Aucun véhicule enregistré</h2>
        <p class="text-sm md:text-base text-gray-600 mb-6">
          Ajoutez votre premier véhicule pour commencer à suivre son entretien
        </p>
        <button @click="openAddVehicleModal" class="btn-primary inline-flex items-center gap-2">
          <Icon icon="mdi:car-plus" class="w-5 h-5" />
          <span>Ajouter mon véhicule</span>
        </button>
      </div>

      <!-- Vehicles Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <VehicleCard
          v-for="vehicle in vehicles"
          :key="vehicle.id"
          :vehicle="vehicle"
          :maintenance-alerts="getMaintenanceAlerts(vehicle)"
          :show-actions="true"
          @click="goToVehicleDetail(vehicle)"
          @edit="editVehicle(vehicle)"
          @delete="deleteVehicle(vehicle)"
        />
      </div>
    </Container>

    <Footer />
  </div>
</template>
