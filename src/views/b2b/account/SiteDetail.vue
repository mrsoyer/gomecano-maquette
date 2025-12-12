<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores/user.store'
import { useFleetStore } from '@/stores/fleet.store'
import { getFleetVehiclesBySite } from '@/mocks/companies'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import VehicleCard from '@/components/account/vehicles/VehicleCard.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const fleetStore = useFleetStore()

const siteId = route.params.id as string

onMounted(async () => {
  if (!userStore.isAuthenticated) {
    await userStore.loginById('user-b2b-1')
  }
  if (userStore.companyId) {
    await fleetStore.fetchAllFleetData(userStore.companyId)
  }
})

// Current site
const site = computed(() =>
  fleetStore.sites.find(s => s.id === siteId)
)

// Site vehicles
const siteVehicles = computed(() =>
  getFleetVehiclesBySite(siteId)
)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <Container class="py-4 md:py-6">
      <!-- Back Button -->
      <button
        @click="router.push('/account/fleet/sites')"
        class="flex items-center gap-2 text-sm md:text-base font-semibold text-green-primary hover:underline mb-4"
      >
        <Icon icon="mdi:arrow-left" class="w-5 h-5" />
        <span>Retour aux sites</span>
      </button>

      <!-- Site Header -->
      <div v-if="site" class="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm mb-6">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-green-50 flex items-center justify-center">
              <Icon icon="mdi:office-building" class="w-8 h-8 md:w-10 md:h-10 text-green-primary" />
            </div>
            <div>
              <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{{ site.name }}</h1>
              <p class="text-sm md:text-base text-gray-600">{{ site.address.city }}</p>
            </div>
          </div>
        </div>

        <div class="mt-4 grid md:grid-cols-2 gap-4">
          <div class="flex items-center gap-2 text-sm text-gray-700">
            <Icon icon="mdi:map-marker" class="w-5 h-5 text-gray-500" />
            <span>{{ site.address.street }}, {{ site.address.postalCode }} {{ site.address.city }}</span>
          </div>
          <div v-if="site.phone" class="flex items-center gap-2 text-sm text-gray-700">
            <Icon icon="mdi:phone" class="w-5 h-5 text-gray-500" />
            <span>{{ site.phone }}</span>
          </div>
        </div>
      </div>

      <!-- Site Vehicles -->
      <h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-4">
        Véhicules du site ({{ siteVehicles.length }})
      </h2>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <VehicleCard
          v-for="vehicle in siteVehicles"
          :key="vehicle.id"
          :vehicle="vehicle"
          :show-actions="false"
        />
      </div>
    </Container>

    <Footer />
  </div>
</template>
