<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores/user.store'
import { useFleetStore } from '@/stores/fleet.store'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import SiteCard from '@/components/account/fleet/SiteCard.vue'
import { getFleetVehiclesBySite } from '@/mocks/companies'

const router = useRouter()
const userStore = useUserStore()
const fleetStore = useFleetStore()

onMounted(async () => {
  if (!userStore.isAuthenticated) {
    await userStore.loginById('user-b2b-1')
  }
  if (userStore.companyId) {
    await fleetStore.fetchAllFleetData(userStore.companyId)
  }
})

/**
 * Get vehicles count by site
 */
function getVehiclesCountBySite(siteId: string): number {
  return getFleetVehiclesBySite(siteId).length
}

/**
 * View site detail
 */
function viewSite(site: any): void {
  router.push(`/account/fleet/sites/${site.id}`)
}

/**
 * Edit site (mock)
 */
function editSite(site: any): void {
  alert(`Modifier ${site.name}\n\nFonctionnalité en développement`)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <Container class="py-4 md:py-6">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
        Sites & Localisations
      </h1>

      <div class="grid lg:grid-cols-3 gap-6">
        <!-- Sites List (2/3) -->
        <div class="lg:col-span-2 space-y-4">
          <SiteCard
            v-for="site in fleetStore.sites"
            :key="site.id"
            :site="site"
            :vehicles-count="getVehiclesCountBySite(site.id)"
            :active-interventions="0"
            :monthly-spend="2500"
            @view="viewSite(site)"
            @edit="editSite(site)"
          />
        </div>

        <!-- Map (1/3) -->
        <aside>
          <div class="sticky top-20 bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
            <h3 class="text-sm md:text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Icon icon="mdi:map" class="w-5 h-5 text-green-primary" />
              Carte des sites
            </h3>
            <div class="bg-gray-100 rounded-lg flex items-center justify-center" style="height: 300px;">
              <div class="text-center">
                <Icon icon="mdi:map-marker-multiple" class="w-16 h-16 text-gray-400 mb-2 mx-auto" />
                <p class="text-sm text-gray-500">Carte sites</p>
                <p class="text-xs text-gray-400">(Google Maps API)</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </Container>

    <Footer />
  </div>
</template>
