<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { BudgetAlert } from '@/types/analytics'

interface Props {
  alert: BudgetAlert
}

const props = defineProps<Props>()

const emit = defineEmits<{
  dismiss: []
  viewDetails: []
}>()

/**
 * Get severity icon
 */
const severityIcon = computed(() => {
  switch (props.alert.severity) {
    case 'critical':
      return 'mdi:alert-circle'
    case 'warning':
      return 'mdi:alert'
    case 'info':
      return 'mdi:information'
    default:
      return 'mdi:information'
  }
})

/**
 * Get severity color classes
 */
const severityClasses = computed(() => {
  switch (props.alert.severity) {
    case 'critical':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: 'text-red-500',
        badge: 'bg-red-100 text-red-800'
      }
    case 'warning':
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        icon: 'text-orange-500',
        badge: 'bg-orange-100 text-orange-800'
      }
    case 'info':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'text-blue-500',
        badge: 'bg-blue-100 text-blue-800'
      }
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        icon: 'text-gray-500',
        badge: 'bg-gray-100 text-gray-800'
      }
  }
})

/**
 * Format percentage
 */
function formatPercentage(value: number): string {
  return `${value}%`
}

/**
 * Handle dismiss
 */
function handleDismiss(): void {
  emit('dismiss')
}
</script>

<template>
  <div
    :class="[
      'rounded-lg border p-4 transition-all',
      severityClasses.bg,
      severityClasses.border
    ]"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-start gap-3 flex-1">
        <Icon
          :icon="severityIcon"
          :class="['w-6 h-6 mt-0.5', severityClasses.icon]"
        />
        <div class="flex-1">
          <h3 class="text-base font-semibold text-gray-900 mb-1">
            {{ alert.title }}
          </h3>
          <p class="text-sm text-gray-600">
            {{ alert.message }}
          </p>
        </div>
      </div>
      
      <button
        @click="handleDismiss"
        class="text-gray-400 hover:text-gray-600 transition-colors"
        title="Ignorer"
      >
        <Icon icon="mdi:close" class="w-5 h-5" />
      </button>
    </div>

    <!-- Budget Progress (if applicable) -->
    <div
      v-if="alert.budgetLimit && alert.percentageUsed"
      class="mb-3"
    >
      <div class="flex items-center justify-between text-sm mb-1.5">
        <span class="text-gray-600">Budget utilisé</span>
        <span class="font-semibold text-gray-900">
          {{ alert.currentAmount }}€ / {{ alert.budgetLimit }}€
        </span>
      </div>
      
      <!-- Progress bar -->
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div
          :class="[
            'h-2.5 rounded-full transition-all',
            alert.percentageUsed >= 100
              ? 'bg-red-500'
              : alert.percentageUsed >= 80
              ? 'bg-orange-500'
              : 'bg-green-500'
          ]"
          :style="{ width: `${Math.min(alert.percentageUsed, 100)}%` }"
        />
      </div>
      
      <div class="text-right mt-1">
        <span
          :class="[
            'text-xs font-medium px-2 py-0.5 rounded',
            severityClasses.badge
          ]"
        >
          {{ formatPercentage(alert.percentageUsed) }}
        </span>
      </div>
    </div>

    <!-- Recommendations -->
    <div
      v-if="alert.recommendations && alert.recommendations.length > 0"
      class="bg-white rounded-lg p-3 border border-gray-200"
    >
      <div class="flex items-center gap-2 mb-2">
        <Icon icon="mdi:lightbulb-on" class="w-4 h-4 text-orange-primary" />
        <span class="text-sm font-medium text-gray-900">Recommandations</span>
      </div>
      
      <ul class="space-y-1.5">
        <li
          v-for="(rec, index) in alert.recommendations"
          :key="index"
          class="text-sm text-gray-600 flex items-start gap-2"
        >
          <Icon icon="mdi:check" class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
          <span>{{ rec }}</span>
        </li>
      </ul>
    </div>

    <!-- Action -->
    <button
      v-if="alert.type !== 'overspending'"
      @click="emit('viewDetails')"
      class="mt-3 text-sm font-medium text-blue-primary hover:text-blue-dark transition-colors flex items-center gap-1"
    >
      <span>Voir les détails</span>
      <Icon icon="mdi:chevron-right" class="w-4 h-4" />
    </button>
  </div>
</template>

