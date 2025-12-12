<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores/user.store'
import { useFleetStore } from '@/stores/fleet.store'
import { useFleetAnalytics } from '@/composables/useFleetAnalytics'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import WelcomeSection from '@/components/account/dashboard/WelcomeSection.vue'
import KPICard from '@/components/account/dashboard/KPICard.vue'
import FleetMapCard from '@/components/account/fleet/FleetMapCard.vue'
import BudgetTrackerCard from '@/components/account/fleet/BudgetTrackerCard.vue'
import ActiveInterventionsListCard from '@/components/account/fleet/ActiveInterventionsListCard.vue'
import CostTrendChart from '@/components/account/fleet/CostTrendChart.vue'
import { getActiveInterventions } from '@/mocks/interventions'

const router = useRouter()
const userStore = useUserStore()
const fleetStore = useFleetStore()

// Auto-login B2B user for demo
onMounted(async () => {
  if (!userStore.isAuthenticated) {
    await userStore.loginById('user-b2b-1')
  }
  if (userStore.companyId) {
    await fleetStore.fetchAllFleetData(userStore.companyId)
  }
})

// Fleet analytics
const analytics = useFleetAnalytics(
  computed(() => fleetStore.fleetVehicles)
)

// Mock active interventions
const activeInterventions = ref(getActiveInterventions())

/**
 * Has multiple sites
 */
const hasMultipleSites = computed(() => (fleetStore.sites?.length || 0) > 1)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <Container class="py-4 md:py-6">
      <!-- Welcome Section -->
      <WelcomeSection
        v-if="userStore.user && fleetStore.company"
        :user-name="userStore.userFirstName"
        :account-type="'b2b'"
        :company-name="fleetStore.company.name"
      />

      <!-- Site Selector (if multiple sites) -->
      <div v-if="hasMultipleSites" class="mb-4 md:mb-6">
        <select
          :value="fleetStore.selectedSite || 'all'"
          @change="fleetStore.selectSite(($event.target as HTMLSelectElement).value)"
          class="px-4 py-2.5 text-sm font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-primary focus:ring-2 focus:ring-green-200"
        >
          <option value="all">Tous les sites</option>
          <option
            v-for="site in fleetStore.sites"
            :key="site.id"
            :value="site.id"
          >
            {{ site.name }}
          </option>
        </select>
      </div>

      <!-- KPIs Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <KPICard
          icon="mdi:car-multiple"
          :value="fleetStore.totalVehicles"
          label="Véhicules actifs"
          :trend="5"
        />
        <KPICard
          icon="mdi:cash"
          :value="fleetStore.monthlySpend.toLocaleString()"
          label="Dépenses du mois"
          suffix="€"
          :trend="-3"
          :alert="fleetStore.hasBudgetAlert"
        />
        <KPICard
          icon="mdi:wrench"
          :value="activeInterventions.length"
          label="Interventions en cours"
          :pulse="activeInterventions.length > 0"
        />
        <KPICard
          icon="mdi:alert-circle"
          :value="fleetStore.maintenanceVehicles"
          label="Véhicules en maintenance"
          color="orange"
        />
      </div>

      <!-- Main Content -->
      <div class="grid lg:grid-cols-3 gap-6">
        <!-- Main (2/3) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Fleet Map -->
          <FleetMapCard
            :vehicles="fleetStore.filteredVehicles"
            :interventions="activeInterventions"
            :show-routes="true"
          />

          <!-- Active Interventions -->
          <ActiveInterventionsListCard
            :interventions="activeInterventions"
            group-by="site"
          />

          <!-- Charts -->
          <div class="grid md:grid-cols-2 gap-4">
            <CostTrendChart
              v-if="fleetStore.analytics"
              :data="fleetStore.analytics.costTrend"
            />
            
            <!-- Vehicle Categories -->
            <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
              <h3 class="text-sm md:text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icon icon="mdi:chart-donut" class="w-5 h-5 text-green-primary" />
                Répartition par catégorie
              </h3>
              <div class="space-y-2">
                <div
                  v-for="(count, category) in analytics.vehiclesByCategory.value"
                  :key="category"
                  class="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <span class="text-sm text-gray-700 capitalize">{{ category }}</span>
                  <span class="text-base font-bold text-gray-900">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar (1/3) -->
        <aside class="space-y-4">
          <!-- Budget Tracker -->
          <BudgetTrackerCard
            v-if="fleetStore.budget"
            :budget="fleetStore.budget.monthly"
            :spent="fleetStore.budget.currentMonthSpent"
            :projected="fleetStore.budget.projectedMonthSpend"
          />

          <!-- Analytics Summary -->
          <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
            <h3 class="text-sm md:text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Icon icon="mdi:chart-box" class="w-5 h-5 text-green-primary" />
              Analytics
            </h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                <span class="text-xs md:text-sm text-gray-700">Coût / km</span>
                <span class="text-sm md:text-base font-bold text-green-primary">{{ analytics.costPerKm.value }}€</span>
              </div>
              <div class="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                <span class="text-xs md:text-sm text-gray-700">Utilisation</span>
                <span class="text-sm md:text-base font-bold text-blue-primary">{{ analytics.vehicleUtilization.value }}%</span>
              </div>
              <div class="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <span class="text-xs md:text-sm text-gray-700">Immobilisation</span>
                <span class="text-sm md:text-base font-bold text-gray-900">{{ analytics.downtime.value }}%</span>
              </div>
            </div>
          </div>

          <!-- Top Spending Vehicles -->
          <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
            <h3 class="text-sm md:text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Icon icon="mdi:trending-up" class="w-5 h-5 text-orange-primary" />
              Top dépenses
            </h3>
            <div class="space-y-2">
              <div
                v-for="(vehicle, index) in analytics.topSpendingVehicles.value.slice(0, 5)"
                :key="vehicle.id"
                class="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-all"
              >
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-gray-400">{{ index + 1 }}.</span>
                  <span class="text-xs md:text-sm font-medium text-gray-700">{{ vehicle.plate }}</span>
                </div>
                <span class="text-sm font-bold text-orange-primary">{{ vehicle.totalCosts }}€</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="space-y-2">
            <button
              @click="router.push('/services')"
              class="w-full btn-primary flex items-center justify-center gap-2"
            >
              <Icon icon="mdi:calendar-multiple" class="w-5 h-5" />
              <span>Réserver pour la flotte</span>
            </button>
            <button
              class="w-full btn-secondary flex items-center justify-center gap-2"
            >
              <Icon icon="mdi:file-chart" class="w-5 h-5" />
              <span>Rapport mensuel</span>
            </button>
          </div>
        </aside>
      </div>
    </Container>

    <Footer />
  </div>
</template>
