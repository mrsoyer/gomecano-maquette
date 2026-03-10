<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { Vehicle } from '@/types/vehicle'

interface MaintenanceAlert {
  type: 'km' | 'date'
  message: string
  severity: 'low' | 'medium' | 'high'
}

interface Props {
  vehicle: Vehicle
  maintenanceAlerts?: MaintenanceAlert[]
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maintenanceAlerts: () => [],
  showActions: true
})

const emit = defineEmits<{
  click: []
  edit: []
  delete: []
}>()

/**
 * Has alerts
 */
const hasAlerts = computed(() => props.maintenanceAlerts && props.maintenanceAlerts.length > 0)

/**
 * Alert severity color
 */
const alertColor = computed(() => {
  if (!hasAlerts.value) return ''
  const maxSeverity = props.maintenanceAlerts!.reduce((max, alert) => {
    const severities = { low: 1, medium: 2, high: 3 }
    return severities[alert.severity] > severities[max.severity] ? alert : max
  })
  return maxSeverity.severity === 'high' ? 'border-red-500' : maxSeverity.severity === 'medium' ? 'border-orange-500' : 'border-yellow-500'
})
</script>

<template>
  <div
    @click="emit('click')"
    :class="[
      'bg-white rounded-lg border-2 p-3 md:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer relative',
      hasAlerts ? alertColor : 'border-gray-200'
    ]"
  >
    <!-- Alert Badge -->
    <div v-if="hasAlerts" class="absolute top-2 right-2">
      <div class="px-2 py-0.5 bg-orange-500 text-white rounded-full flex items-center gap-1">
        <Icon icon="mdi:alert" class="w-3 h-3" />
        <span class="text-[10px] font-bold">{{ maintenanceAlerts!.length }}</span>
      </div>
    </div>

    <!-- Vehicle Icon -->
    <div class="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
      <Icon icon="mdi:car" class="w-6 h-6 md:w-7 md:h-7 text-blue-primary" />
    </div>

    <!-- Vehicle Info -->
    <h3 class="text-base md:text-lg font-bold text-gray-900 mb-1">
      {{ vehicle.make }} {{ vehicle.model }}
    </h3>
    <p class="text-xs md:text-sm text-gray-600 mb-2">
      {{ vehicle.year }} • {{ vehicle.fuelType }}
    </p>

    <!-- Details Grid -->
    <div class="grid grid-cols-2 gap-2 mb-3">
      <div class="flex items-center gap-1.5">
        <Icon icon="mdi:card-account-details" class="w-4 h-4 text-gray-500" />
        <span class="text-xs text-gray-700 font-mono">{{ vehicle.plate }}</span>
      </div>
      <div class="flex items-center gap-1.5">
        <Icon icon="mdi:counter" class="w-4 h-4 text-gray-500" />
        <span class="text-xs text-gray-700">{{ vehicle.mileage?.toLocaleString() }} km</span>
      </div>
    </div>

    <!-- Maintenance Alerts -->
    <div v-if="hasAlerts" class="mb-3 space-y-1.5">
      <div
        v-for="(alert, index) in maintenanceAlerts!.slice(0, 2)"
        :key="index"
        class="flex items-start gap-1.5 p-2 bg-orange-50 rounded-lg border border-orange-200"
      >
        <Icon icon="mdi:alert-circle" class="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
        <p class="text-[10px] md:text-xs text-orange-900">{{ alert.message }}</p>
      </div>
      <p v-if="maintenanceAlerts!.length > 2" class="text-[10px] text-gray-500 text-center">
        +{{ maintenanceAlerts!.length - 2 }} autre(s) alerte(s)
      </p>
    </div>

    <!-- Actions -->
    <div v-if="showActions" class="flex gap-2 pt-3 border-t border-gray-200">
      <button
        @click.stop="emit('edit')"
        class="flex-1 py-2 px-3 text-xs md:text-sm font-semibold text-blue-primary hover:bg-blue-50 rounded-lg transition-all flex items-center justify-center gap-1"
      >
        <Icon icon="mdi:pencil" class="w-4 h-4" />
        <span>Modifier</span>
      </button>
      <button
        @click.stop="emit('delete')"
        class="flex-1 py-2 px-3 text-xs md:text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center justify-center gap-1"
      >
        <Icon icon="mdi:delete" class="w-4 h-4" />
        <span>Supprimer</span>
      </button>
    </div>
  </div>
</template>
