<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { Intervention } from '@/types/account'

interface Props {
  interventions: Intervention[]
  groupBy?: 'site' | 'vehicle' | 'none'
}

const props = withDefaults(defineProps<Props>(), {
  groupBy: 'none'
})

/**
 * Status display info
 */
function getStatusInfo(status: Intervention['status']) {
  const statuses = {
    en_route: { icon: 'mdi:car-arrow-right', label: 'En route', color: 'text-orange-600 bg-orange-50' },
    sur_place: { icon: 'mdi:map-marker-check', label: 'Sur place', color: 'text-blue-600 bg-blue-50' },
    en_cours: { icon: 'mdi:wrench', label: 'En cours', color: 'text-green-600 bg-green-50' }
  }
  return statuses[status] || statuses.en_cours
}

/**
 * Format time
 */
function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
    <h3 class="text-sm md:text-base font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
      <Icon icon="mdi:clipboard-list" class="w-5 h-5 text-green-primary" />
      Interventions actives
      <span class="ml-auto px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
        {{ interventions.length }}
      </span>
    </h3>

    <!-- Empty State -->
    <div v-if="interventions.length === 0" class="text-center py-8">
      <Icon icon="mdi:check-circle" class="w-16 h-16 mx-auto text-green-300 mb-2" />
      <p class="text-sm text-gray-500">Aucune intervention en cours</p>
    </div>

    <!-- Interventions List -->
    <div v-else class="space-y-2 md:space-y-3">
      <div
        v-for="intervention in interventions"
        :key="intervention.id"
        class="border border-gray-200 rounded-lg p-2 md:p-3 hover:border-green-300 hover:bg-green-50 transition-all cursor-pointer"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1 min-w-0">
            <h4 class="text-sm md:text-base font-semibold text-gray-900 mb-0.5">
              {{ intervention.service.name }}
            </h4>
            <p class="text-xs text-gray-600">
              {{ intervention.vehicle.make }} {{ intervention.vehicle.model }} ({{ intervention.vehicle.plate }})
            </p>
          </div>
          <div
            :class="[
              'px-2 py-1 rounded-lg flex items-center gap-1 whitespace-nowrap',
              getStatusInfo(intervention.status).color
            ]"
          >
            <Icon :icon="getStatusInfo(intervention.status).icon" class="w-3 h-3 md:w-4 md:h-4" />
            <span class="text-[10px] md:text-xs font-bold">
              {{ getStatusInfo(intervention.status).label }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div class="flex items-center gap-1">
            <Icon icon="mdi:account-wrench" class="w-3 h-3 md:w-4 md:h-4" />
            <span class="truncate">{{ intervention.mechanic.name }}</span>
          </div>
          <div class="flex items-center gap-1">
            <Icon icon="mdi:clock-outline" class="w-3 h-3 md:w-4 md:h-4" />
            <span>{{ formatTime(intervention.scheduledAt) }}</span>
          </div>
          <div class="flex items-center gap-1">
            <Icon icon="mdi:map-marker" class="w-3 h-3 md:w-4 md:h-4" />
            <span class="truncate">{{ intervention.address.city }}</span>
          </div>
          <div class="flex items-center gap-1">
            <Icon icon="mdi:cash" class="w-3 h-3 md:w-4 md:h-4" />
            <span class="font-semibold">{{ intervention.quote.totalPrice }}€</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
