<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { VehicleComparison } from '@/types/analytics'

interface Props {
  comparison: VehicleComparison
}

const props = defineProps<Props>()

/**
 * Get efficiency badge style
 */
function getEfficiencyBadge(efficiency: string) {
  switch (efficiency) {
    case 'excellent':
      return { text: 'Excellent', class: 'bg-green-100 text-green-800' }
    case 'good':
      return { text: 'Bon', class: 'bg-blue-100 text-blue-800' }
    case 'average':
      return { text: 'Moyen', class: 'bg-yellow-100 text-yellow-800' }
    case 'poor':
      return { text: 'Faible', class: 'bg-red-100 text-red-800' }
    default:
      return { text: efficiency, class: 'bg-gray-100 text-gray-800' }
  }
}

/**
 * Sort vehicles by total expenses
 */
const sortedVehicles = computed(() => {
  return [...props.comparison.vehicles].sort((a, b) => b.totalExpenses - a.totalExpenses)
})

/**
 * Format date
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-5">
    <!-- Header -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-1">
        Comparaison des véhicules
      </h3>
      <p class="text-sm text-gray-600">
        Analyse comparative sur {{ comparison.period === 'year' ? 'l\'année' : 'la période' }}
      </p>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
              Véhicule
            </th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
              Dépenses totales
            </th>
            <th class="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">
              Interventions
            </th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
              Moyenne / intervention
            </th>
            <th class="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">
              Efficience
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
              Dernière intervention
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="vehicle in sortedVehicles"
            :key="vehicle.vehicleId"
            :class="[
              'transition-colors',
              vehicle.vehicleId === comparison.insights.mostExpensive
                ? 'bg-red-50'
                : vehicle.vehicleId === comparison.insights.mostEfficient
                ? 'bg-green-50'
                : 'hover:bg-gray-50'
            ]"
          >
            <!-- Vehicle name -->
            <td class="px-4 py-4">
              <div class="flex items-center gap-2">
                <Icon icon="mdi:car" class="w-5 h-5 text-gray-400" />
                <span class="font-medium text-gray-900">
                  {{ vehicle.vehicleName }}
                </span>
                <Icon
                  v-if="vehicle.vehicleId === comparison.insights.mostExpensive"
                  icon="mdi:alert-circle"
                  class="w-4 h-4 text-red-500"
                  title="Plus coûteux"
                />
                <Icon
                  v-if="vehicle.vehicleId === comparison.insights.mostEfficient"
                  icon="mdi:check-circle"
                  class="w-4 h-4 text-green-500"
                  title="Plus efficient"
                />
              </div>
            </td>
            
            <!-- Total expenses -->
            <td class="px-4 py-4 text-right">
              <span class="font-semibold text-gray-900">
                {{ vehicle.totalExpenses }}€
              </span>
            </td>
            
            <!-- Intervention count -->
            <td class="px-4 py-4 text-center">
              <span class="text-gray-700">
                {{ vehicle.interventionCount }}
              </span>
            </td>
            
            <!-- Average per intervention -->
            <td class="px-4 py-4 text-right">
              <span class="text-gray-700">
                {{ vehicle.averagePerIntervention }}€
              </span>
            </td>
            
            <!-- Efficiency -->
            <td class="px-4 py-4 text-center">
              <span
                :class="[
                  'inline-block px-2.5 py-1 rounded-full text-xs font-medium',
                  getEfficiencyBadge(vehicle.efficiency).class
                ]"
              >
                {{ getEfficiencyBadge(vehicle.efficiency).text }}
              </span>
            </td>
            
            <!-- Last intervention -->
            <td class="px-4 py-4">
              <span class="text-sm text-gray-600">
                {{ formatDate(vehicle.lastInterventionDate) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Insights -->
    <div
      v-if="comparison.insights.recommendations.length > 0"
      class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
    >
      <div class="flex items-start gap-3">
        <Icon icon="mdi:lightbulb-on" class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div class="flex-1">
          <h4 class="text-sm font-semibold text-gray-900 mb-2">Insights</h4>
          <ul class="space-y-1.5">
            <li
              v-for="(rec, index) in comparison.insights.recommendations"
              :key="index"
              class="text-sm text-gray-700"
            >
              • {{ rec }}
            </li>
          </ul>
          
          <div
            v-if="comparison.insights.totalSavingsPotential > 0"
            class="mt-3 p-2 bg-white rounded border border-blue-200"
          >
            <div class="flex items-center gap-2">
              <Icon icon="mdi:cash" class="w-4 h-4 text-green-500" />
              <span class="text-sm font-medium text-gray-900">
                Économie potentielle : {{ comparison.insights.totalSavingsPotential }}€/an
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

