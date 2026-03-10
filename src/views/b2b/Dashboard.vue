<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.store'
import { useFleetStore } from '@/stores/fleet.store'
import { useCompany } from '@/composables/useCompany'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const userStore = useUserStore()
const fleetStore = useFleetStore()
const { company, fetchCompany } = useCompany()

// KPIs
const kpis = computed(() => [
  {
    label: 'Véhicules Total',
    value: fleetStore.fleetVehicles.length || 0,
    icon: 'mdi:car-multiple',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    label: 'Interventions en Cours',
    value: 3,
    icon: 'mdi:wrench-clock',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    label: 'Budget Mensuel',
    value: '2,400 €',
    icon: 'mdi:currency-eur',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    label: 'Économies ce mois',
    value: '720 €',
    icon: 'mdi:trending-up',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  }
])

// Interventions en cours
const activeInterventions = computed(() => [
  { id: '1', vehicle: 'Renault Kangoo - AB-123-CD', service: 'Vidange', mechanic: 'Jean M.', status: 'en_route' },
  { id: '2', vehicle: 'Peugeot Expert - EF-456-GH', service: 'Freins', mechanic: 'Marie L.', status: 'in_progress' },
  { id: '3', vehicle: 'Citroën Berlingo - IJ-789-KL', service: 'Pneus', mechanic: 'Paul D.', status: 'confirmed' }
])

// Alertes maintenance
const alerts = computed(() => [
  { type: 'warning', message: '3 véhicules nécessitent un entretien', action: 'Voir' },
  { type: 'info', message: '2 contrôles techniques à venir ce mois', action: 'Planifier' }
])

// Actions rapides
const quickActions = [
  { label: 'Planifier Intervention', icon: 'mdi:calendar-plus', route: '/entreprises/nouveau-rdv' },
  { label: 'Ajouter Véhicule', icon: 'mdi:car-plus', route: '/entreprises/vehicules/nouveau' },
  { label: 'Exporter Rapport', icon: 'mdi:file-export', action: 'export' },
  { label: 'Support', icon: 'mdi:help-circle', route: '/contact' }
]

/**
 * Handle action click
 */
function handleAction(action: any) {
  if (action.route) {
    router.push(action.route)
  } else if (action.action === 'export') {
    console.log('Export rapport...')
  }
}

onMounted(() => {
  if (userStore.companyId) {
    fetchCompany(userStore.companyId)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <Container class="py-12">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-4xl font-bold mb-2">Dashboard Flotte</h1>
          <p class="text-gray-600">{{ company?.name || 'Entreprise' }}</p>
        </div>
        <Button variant="primary" @click="router.push('/entreprises/compte/flotte')">
          <Icon icon="mdi:view-dashboard" class="w-5 h-5 mr-2" />
          Dashboard Détaillé
        </Button>
      </div>

      <!-- KPIs Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card v-for="kpi in kpis" :key="kpi.label" class="p-6">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-2">{{ kpi.label }}</p>
              <p class="text-3xl font-bold">{{ kpi.value }}</p>
            </div>
            <div :class="[kpi.bgColor, 'p-3 rounded-lg']">
              <Icon :icon="kpi.icon" :class="[kpi.color, 'w-6 h-6']" />
            </div>
          </div>
        </Card>
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Interventions en Cours -->
        <Card class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold">Interventions en Cours</h2>
            <Button variant="ghost" size="sm" @click="router.push('/entreprises/compte/flotte')">
              Voir tout
            </Button>
          </div>

          <div v-if="activeInterventions.length === 0" class="text-center py-8 text-gray-500">
            Aucune intervention en cours
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="intervention in activeInterventions"
              :key="intervention.id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <p class="font-medium">{{ intervention.vehicle }}</p>
                <p class="text-sm text-gray-600">{{ intervention.service }} • {{ intervention.mechanic }}</p>
              </div>
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-medium',
                  intervention.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  intervention.status === 'en_route' ? 'bg-orange-100 text-orange-700' :
                  'bg-green-100 text-green-700'
                ]"
              >
                {{ intervention.status === 'in_progress' ? 'En cours' :
                   intervention.status === 'en_route' ? 'En route' : 'Confirmé' }}
              </span>
            </div>
          </div>
        </Card>

        <!-- Alertes Maintenance -->
        <Card class="p-6">
          <h2 class="text-xl font-bold mb-4">Alertes Maintenance</h2>

          <div v-if="alerts.length === 0" class="text-center py-8 text-gray-500">
            Aucune alerte
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(alert, index) in alerts"
              :key="index"
              class="flex items-start justify-between p-4 rounded-lg"
              :class="alert.type === 'warning' ? 'bg-yellow-50' : 'bg-blue-50'"
            >
              <div class="flex items-start gap-3">
                <Icon
                  :icon="alert.type === 'warning' ? 'mdi:alert-circle' : 'mdi:information'"
                  :class="[
                    'w-5 h-5 mt-0.5',
                    alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                  ]"
                />
                <p class="text-sm">{{ alert.message }}</p>
              </div>
              <Button variant="ghost" size="sm">{{ alert.action }}</Button>
            </div>
          </div>
        </Card>
      </div>

      <!-- Actions Rapides -->
      <Card class="p-6 mt-8">
        <h2 class="text-xl font-bold mb-4">Actions Rapides</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            v-for="action in quickActions"
            :key="action.label"
            @click="handleAction(action)"
            class="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <Icon :icon="action.icon" class="w-8 h-8 text-blue-600" />
            <span class="text-sm font-medium text-center">{{ action.label }}</span>
          </button>
        </div>
      </Card>
    </Container>

    <Footer />
  </div>
</template>









