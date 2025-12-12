<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores/user.store'
import { useInterventionStore } from '@/stores/intervention.store'
import { useAnalytics } from '@/composables/useAnalytics'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import StatCard from '@/components/account/dashboard/StatCard.vue'
import ExpenseTrendChart from '@/components/analytics/ExpenseTrendChart.vue'
import PredictionCard from '@/components/analytics/PredictionCard.vue'

const router = useRouter()
const userStore = useUserStore()
const interventionStore = useInterventionStore()

const filterYear = ref<string>('all')
const filterStatus = ref<string>('all')

// Analytics
const { trends, predictions, fetchDashboard } = useAnalytics('user-1')

onMounted(async () => {
  if (!userStore.isAuthenticated) {
    await userStore.loginById('user-1')
  }
  if (userStore.user) {
    await interventionStore.fetchInterventions(userStore.user.id)
    await fetchDashboard()
  }
})

// Filtered interventions
const filteredInterventions = computed(() => {
  let result = [...interventionStore.userInterventions]

  if (filterYear.value !== 'all') {
    result = result.filter(i =>
      new Date(i.scheduledAt).getFullYear() === Number(filterYear.value)
    )
  }

  if (filterStatus.value !== 'all') {
    result = result.filter(i => i.status === filterStatus.value)
  }

  return result.sort((a, b) =>
    new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
  )
})

// Current year stats
const currentYear = new Date().getFullYear()
const yearlyInterventions = computed(() =>
  interventionStore.userInterventions.filter(i =>
    new Date(i.scheduledAt).getFullYear() === currentYear
  )
)

const yearlyTotal = computed(() =>
  yearlyInterventions.value.reduce((sum, i) => sum + (i.invoice?.totalTTC || 0), 0)
)

const averageCost = computed(() => {
  const paid = yearlyInterventions.value.filter(i => i.invoice)
  if (paid.length === 0) return 0
  return Math.round(yearlyTotal.value / paid.length)
})

/**
 * Get status badge
 */
function getStatusBadge(status: string) {
  const badges = {
    termine: { label: 'Terminé', color: 'bg-green-100 text-green-700' },
    en_cours: { label: 'En cours', color: 'bg-orange-100 text-orange-700' },
    confirmed: { label: 'Confirmé', color: 'bg-blue-100 text-blue-700' },
    cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-700' }
  }
  return badges[status] || { label: status, color: 'bg-gray-100 text-gray-700' }
}

/**
 * Export to PDF (mock)
 */
function exportToPDF(): void {
  alert('Export PDF - Fonctionnalité en développement\n\nEn production : Génération PDF côté serveur')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <Container class="py-4 md:py-6">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
        Historique & Factures
      </h1>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3 mb-4 md:mb-6">
        <select
          v-model="filterYear"
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-primary"
        >
          <option value="all">Toutes les années</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
        </select>

        <select
          v-model="filterStatus"
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-primary"
        >
          <option value="all">Tous les statuts</option>
          <option value="termine">Terminé</option>
          <option value="confirmed">Confirmé</option>
          <option value="cancelled">Annulé</option>
        </select>

        <button @click="exportToPDF" class="ml-auto px-4 py-2 text-sm font-semibold text-blue-primary border-2 border-blue-primary hover:bg-blue-50 rounded-lg transition-all flex items-center gap-2">
          <Icon icon="mdi:download" class="w-4 h-4 md:w-5 md:h-5" />
          <span>Exporter PDF</span>
        </button>
      </div>

      <!-- Interventions Timeline -->
      <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm mb-6">
        <h2 class="text-base md:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Icon icon="mdi:history" class="w-5 h-5 md:w-6 md:h-6 text-blue-primary" />
          Interventions ({{ filteredInterventions.length }})
        </h2>

        <!-- Empty State -->
        <div v-if="filteredInterventions.length === 0" class="text-center py-8">
          <Icon icon="mdi:calendar-blank" class="w-16 h-16 mx-auto text-gray-300 mb-2" />
          <p class="text-sm text-gray-500">Aucune intervention trouvée</p>
        </div>

        <!-- Timeline -->
        <div v-else class="space-y-3">
          <div
            v-for="intervention in filteredInterventions"
            :key="intervention.id"
            class="border border-gray-200 rounded-lg p-3 md:p-4 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
            @click="router.push(`/account/interventions/${intervention.id}`)"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1">
                <h4 class="text-sm md:text-base font-semibold text-gray-900 mb-1">
                  {{ intervention.service.name }}
                </h4>
                <p class="text-xs md:text-sm text-gray-600">
                  {{ new Date(intervention.scheduledAt).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) }}
                </p>
              </div>
              <div class="flex flex-col items-end gap-2">
                <span :class="['px-2 md:px-3 py-1 rounded-full text-xs font-semibold', getStatusBadge(intervention.status).color]">
                  {{ getStatusBadge(intervention.status).label }}
                </span>
                <span v-if="intervention.invoice" class="text-base md:text-lg font-bold text-green-primary">
                  {{ intervention.invoice.totalTTC }}€
                </span>
              </div>
            </div>

            <div class="flex flex-wrap gap-3 md:gap-4 text-xs text-gray-600">
              <div class="flex items-center gap-1">
                <Icon icon="mdi:car" class="w-4 h-4" />
                <span>{{ intervention.vehicle.make }} {{ intervention.vehicle.model }}</span>
              </div>
              <div class="flex items-center gap-1">
                <Icon icon="mdi:account-wrench" class="w-4 h-4" />
                <span>{{ intervention.mechanic.name }}</span>
              </div>
              <div class="flex items-center gap-1">
                <Icon icon="mdi:map-marker" class="w-4 h-4" />
                <span>{{ intervention.address.city }}</span>
              </div>
              <div v-if="intervention.invoice" class="flex items-center gap-1">
                <Icon icon="mdi:receipt-text" class="w-4 h-4" />
                <span>{{ intervention.invoice.number }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Analytics Section -->
      <div v-if="trends || predictions.length > 0" class="mb-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Icon icon="mdi:chart-box" class="w-6 h-6 text-blue-primary" />
          Analytics
        </h2>
        
        <div class="grid gap-6">
          <!-- Expense Trend Chart -->
          <ExpenseTrendChart
            v-if="trends"
            :trend="trends"
          />
          
          <!-- Predictions -->
          <div v-if="predictions.length > 0">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Prédictions</h3>
            <div class="grid md:grid-cols-2 gap-4">
              <PredictionCard
                v-for="prediction in predictions.slice(0, 2)"
                :key="prediction.id"
                :prediction="prediction"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Yearly Stats -->
      <div class="grid md:grid-cols-3 gap-4">
        <StatCard
          icon="mdi:cash"
          :value="Math.round(yearlyTotal)"
          label="Total 2024"
          suffix="€"
          color="green"
        />
        <StatCard
          icon="mdi:wrench"
          :value="yearlyInterventions.length"
          label="Interventions 2024"
          color="blue"
        />
        <StatCard
          icon="mdi:chart-line"
          :value="averageCost"
          label="Coût moyen"
          suffix="€"
          color="gray"
        />
      </div>
    </Container>

    <Footer />
  </div>
</template>
