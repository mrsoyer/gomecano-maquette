<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { Intervention } from '@/types/account'

interface Props {
  intervention: Intervention
}

const props = defineProps<Props>()

/**
 * Status display info
 */
const statusInfo = computed(() => {
  const statuses = {
    en_route: {
      icon: 'mdi:car-arrow-right',
      label: 'En route',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300'
    },
    sur_place: {
      icon: 'mdi:map-marker-check',
      label: 'Sur place',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300'
    },
    en_cours: {
      icon: 'mdi:wrench',
      label: 'En cours',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300'
    }
  }
  return statuses[props.intervention.status] || statuses.en_cours
})

/**
 * Format date
 */
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div
    :class="[
      'bg-white rounded-lg border-2 p-3 md:p-4 shadow-lg relative overflow-hidden',
      statusInfo.borderColor
    ]"
  >
    <!-- Animated Background Gradient -->
    <div :class="['absolute top-0 right-0 w-32 h-32 opacity-10 blur-2xl', statusInfo.bgColor]"></div>

    <!-- Header -->
    <div class="relative flex items-start justify-between mb-3">
      <div class="flex items-center gap-2 md:gap-3">
        <div :class="['w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center', statusInfo.bgColor]">
          <Icon :icon="statusInfo.icon" :class="['w-5 h-5 md:w-6 md:h-6', statusInfo.color]" />
        </div>
        <div>
          <div class="flex items-center gap-2 mb-1">
            <h3 class="text-sm md:text-base font-bold text-gray-900">
              Intervention en cours
            </h3>
            <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
          <p class="text-xs md:text-sm text-gray-600">{{ intervention.service.name }}</p>
        </div>
      </div>

      <!-- Status Badge -->
      <div :class="['px-2 md:px-3 py-1 md:py-1.5 rounded-lg flex items-center gap-1 md:gap-1.5', statusInfo.bgColor]">
        <Icon :icon="statusInfo.icon" :class="['w-3 h-3 md:w-4 md:h-4', statusInfo.color]" />
        <span :class="['text-xs md:text-sm font-bold', statusInfo.color]">
          {{ statusInfo.label }}
        </span>
      </div>
    </div>

    <!-- Info Grid -->
    <div class="relative grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4">
      <!-- Mechanic -->
      <div class="flex items-center gap-2">
        <Icon icon="mdi:account-wrench" class="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
        <div class="flex-1 min-w-0">
          <p class="text-[10px] md:text-xs text-gray-500">Mécanicien</p>
          <p class="text-xs md:text-sm font-semibold text-gray-900 truncate">{{ intervention.mechanic.name }}</p>
        </div>
      </div>

      <!-- Vehicle -->
      <div class="flex items-center gap-2">
        <Icon icon="mdi:car" class="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
        <div class="flex-1 min-w-0">
          <p class="text-[10px] md:text-xs text-gray-500">Véhicule</p>
          <p class="text-xs md:text-sm font-semibold text-gray-900 truncate">
            {{ intervention.vehicle.make }} {{ intervention.vehicle.model }}
          </p>
        </div>
      </div>

      <!-- Scheduled At -->
      <div class="flex items-center gap-2">
        <Icon icon="mdi:calendar-clock" class="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
        <div class="flex-1 min-w-0">
          <p class="text-[10px] md:text-xs text-gray-500">Programmée</p>
          <p class="text-xs md:text-sm font-semibold text-gray-900">{{ formatDate(intervention.scheduledAt) }}</p>
        </div>
      </div>

      <!-- Address -->
      <div class="flex items-center gap-2">
        <Icon icon="mdi:map-marker" class="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
        <div class="flex-1 min-w-0">
          <p class="text-[10px] md:text-xs text-gray-500">Lieu</p>
          <p class="text-xs md:text-sm font-semibold text-gray-900 truncate">{{ intervention.address.city }}</p>
        </div>
      </div>
    </div>

    <!-- CTA Button -->
    <button
      class="relative w-full py-2.5 md:py-3 bg-gradient-to-r from-blue-primary to-blue-light hover:from-blue-dark hover:to-blue-primary text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg group"
    >
      <Icon icon="mdi:eye" class="w-4 h-4 md:w-5 md:h-5" />
      <span class="text-xs md:text-sm">Suivre l'intervention</span>
      <Icon icon="mdi:arrow-right" class="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
    </button>
  </div>
</template>
