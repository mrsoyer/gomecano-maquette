<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { Intervention } from '@/types/account'
import type { Vehicle } from '@/types/vehicle'

interface Props {
  interventions: Intervention[]
  vehicle: Vehicle
}

const props = defineProps<Props>()

/**
 * Sorted interventions (most recent first)
 */
const sortedInterventions = computed(() => {
  return [...props.interventions]
    .filter(i => i.vehicle.id === props.vehicle.id)
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
})

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

/**
 * Status badge info
 */
function getStatusBadge(status: Intervention['status']) {
  const badges = {
    termine: { label: 'Terminé', color: 'bg-green-100 text-green-700' },
    en_cours: { label: 'En cours', color: 'bg-orange-100 text-orange-700' },
    confirmed: { label: 'Confirmé', color: 'bg-blue-100 text-blue-700' },
    cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-700' }
  }
  return badges[status] || { label: status, color: 'bg-gray-100 text-gray-700' }
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
    <h3 class="text-sm md:text-base font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
      <Icon icon="mdi:book-open-variant" class="w-5 h-5 text-blue-primary" />
      Carnet d'entretien
    </h3>

    <!-- Empty State -->
    <div v-if="sortedInterventions.length === 0" class="text-center py-6">
      <Icon icon="mdi:wrench-clock" class="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-300 mb-2" />
      <p class="text-sm text-gray-500 mb-1">Aucune intervention enregistrée</p>
      <p class="text-xs text-gray-400">L'historique s'affichera ici</p>
    </div>

    <!-- Interventions List -->
    <div v-else class="space-y-2 md:space-y-3">
      <div
        v-for="intervention in sortedInterventions.slice(0, 5)"
        :key="intervention.id"
        class="border border-gray-200 rounded-lg p-2 md:p-3 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1 min-w-0">
            <h4 class="text-sm md:text-base font-semibold text-gray-900 mb-0.5">
              {{ intervention.service.name }}
            </h4>
            <p class="text-xs text-gray-600">{{ formatDate(intervention.scheduledAt) }}</p>
          </div>
          <span
            :class="[
              'text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap',
              getStatusBadge(intervention.status).color
            ]"
          >
            {{ getStatusBadge(intervention.status).label }}
          </span>
        </div>

        <!-- Details -->
        <div class="flex items-center gap-3 text-xs text-gray-600">
          <div class="flex items-center gap-1">
            <Icon icon="mdi:account-wrench" class="w-3 h-3 md:w-4 md:h-4" />
            <span>{{ intervention.mechanic.name }}</span>
          </div>
          <div class="flex items-center gap-1">
            <Icon icon="mdi:cash" class="w-3 h-3 md:w-4 md:h-4" />
            <span class="font-semibold">{{ intervention.quote.totalPrice }}€</span>
          </div>
        </div>
      </div>

      <!-- View More -->
      <button
        v-if="sortedInterventions.length > 5"
        class="w-full py-2 text-xs md:text-sm font-semibold text-blue-primary hover:bg-blue-50 rounded-lg transition-all"
      >
        Voir tout l'historique ({{ sortedInterventions.length }})
      </button>
    </div>
  </div>
</template>
