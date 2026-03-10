<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Props {
  totalInterventions: number
  totalSpent: number
  lastService?: string
}

const props = defineProps<Props>()

/**
 * Format date
 */
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
    <h3 class="text-sm md:text-base font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
      <Icon icon="mdi:chart-box" class="w-5 h-5 text-blue-primary" />
      Statistiques
    </h3>

    <div class="space-y-3">
      <!-- Total Interventions -->
      <div class="flex items-center justify-between p-2 md:p-3 bg-blue-50 rounded-lg">
        <div class="flex items-center gap-2">
          <Icon icon="mdi:wrench" class="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          <span class="text-xs md:text-sm text-gray-700">Interventions</span>
        </div>
        <span class="text-lg md:text-xl font-bold text-blue-primary">{{ totalInterventions }}</span>
      </div>

      <!-- Total Spent -->
      <div class="flex items-center justify-between p-2 md:p-3 bg-green-50 rounded-lg">
        <div class="flex items-center gap-2">
          <Icon icon="mdi:cash" class="w-5 h-5 md:w-6 md:h-6 text-green-600" />
          <span class="text-xs md:text-sm text-gray-700">Total dépensé</span>
        </div>
        <span class="text-lg md:text-xl font-bold text-green-primary">{{ totalSpent }}€</span>
      </div>

      <!-- Last Service -->
      <div v-if="lastService" class="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
        <div class="flex items-center gap-2">
          <Icon icon="mdi:calendar-check" class="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
          <span class="text-xs md:text-sm text-gray-700">Dernier entretien</span>
        </div>
        <span class="text-xs md:text-sm font-semibold text-gray-900">{{ formatDate(lastService) }}</span>
      </div>
      <div v-else class="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
        <div class="flex items-center gap-2">
          <Icon icon="mdi:calendar-remove" class="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
          <span class="text-xs md:text-sm text-gray-500">Aucun entretien</span>
        </div>
      </div>
    </div>
  </div>
</template>
