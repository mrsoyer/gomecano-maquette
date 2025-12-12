<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface MaintenanceAlert {
  id: string
  type: 'km' | 'date'
  message: string
  severity: 'low' | 'medium' | 'high'
  recommendedService?: string
}

interface Props {
  alerts: MaintenanceAlert[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  book: [serviceId: string]
}>()

/**
 * Get severity color
 */
function getSeverityColor(severity: MaintenanceAlert['severity']): string {
  const colors = {
    low: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    medium: 'text-orange-600 bg-orange-50 border-orange-200',
    high: 'text-red-600 bg-red-50 border-red-200'
  }
  return colors[severity]
}

/**
 * Get severity icon
 */
function getSeverityIcon(severity: MaintenanceAlert['severity']): string {
  const icons = {
    low: 'mdi:alert',
    medium: 'mdi:alert-circle',
    high: 'mdi:alert-octagon'
  }
  return icons[severity]
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
    <h3 class="text-sm md:text-base font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
      <Icon icon="mdi:calendar-alert" class="w-5 h-5 text-orange-primary" />
      Rappels d'entretien
    </h3>

    <!-- Empty State -->
    <div v-if="alerts.length === 0" class="text-center py-6">
      <Icon icon="mdi:check-circle" class="w-12 h-12 md:w-16 md:h-16 mx-auto text-green-300 mb-2" />
      <p class="text-sm text-gray-500 mb-1">Aucun rappel</p>
      <p class="text-xs text-gray-400">Votre véhicule est à jour</p>
    </div>

    <!-- Alerts List -->
    <div v-else class="space-y-2 md:space-y-3">
      <div
        v-for="alert in alerts"
        :key="alert.id"
        :class="['border rounded-lg p-2 md:p-3', getSeverityColor(alert.severity)]"
      >
        <div class="flex items-start gap-2 mb-2">
          <Icon
            :icon="getSeverityIcon(alert.severity)"
            class="w-5 h-5 md:w-6 md:h-6 flex-shrink-0"
          />
          <div class="flex-1 min-w-0">
            <p class="text-xs md:text-sm font-semibold mb-1">
              {{ alert.message }}
            </p>
            <p v-if="alert.recommendedService" class="text-[10px] md:text-xs opacity-80">
              Service recommandé : {{ alert.recommendedService }}
            </p>
          </div>
        </div>

        <!-- CTA Button -->
        <button
          v-if="alert.recommendedService"
          @click="emit('book', alert.recommendedService)"
          class="w-full py-2 px-3 mt-2 bg-white hover:bg-opacity-50 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs md:text-sm font-semibold"
        >
          <Icon icon="mdi:calendar-plus" class="w-4 h-4" />
          <span>Réserver maintenant</span>
        </button>
      </div>
    </div>
  </div>
</template>
