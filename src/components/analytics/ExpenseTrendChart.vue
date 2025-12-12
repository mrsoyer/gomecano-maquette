<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { ExpenseTrend } from '@/types/analytics'

interface Props {
  trend: ExpenseTrend
}

const props = defineProps<Props>()

/**
 * Get trend icon and color
 */
const trendStyle = computed(() => {
  switch (props.trend.summary.trend) {
    case 'increasing':
      return {
        icon: 'mdi:trending-up',
        color: 'text-red-500',
        bg: 'bg-red-50'
      }
    case 'decreasing':
      return {
        icon: 'mdi:trending-down',
        color: 'text-green-500',
        bg: 'bg-green-50'
      }
    case 'stable':
      return {
        icon: 'mdi:trending-neutral',
        color: 'text-gray-500',
        bg: 'bg-gray-50'
      }
    default:
      return {
        icon: 'mdi:chart-line',
        color: 'text-gray-500',
        bg: 'bg-gray-50'
      }
  }
})

/**
 * Get max expense for chart scaling
 */
const maxExpense = computed(() => {
  return Math.max(...props.trend.dataPoints.map(d => d.totalExpenses))
})

/**
 * Calculate bar height percentage
 */
function getBarHeight(amount: number): string {
  return `${(amount / maxExpense.value) * 100}%`
}

/**
 * Format month label
 */
function formatMonth(month: string): string {
  const date = new Date(month + '-01')
  return date.toLocaleDateString('fr-FR', { month: 'short' })
}

/**
 * Format currency
 */
function formatCurrency(amount: number): string {
  return `${amount}€`
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-5">
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-1">
          Tendance des dépenses
        </h3>
        <p class="text-sm text-gray-600">
          Évolution sur les 12 derniers mois
        </p>
      </div>
      
      <div
        :class="[
          'px-3 py-1.5 rounded-lg flex items-center gap-2',
          trendStyle.bg
        ]"
      >
        <Icon
          :icon="trendStyle.icon"
          :class="['w-5 h-5', trendStyle.color]"
        />
        <span
          :class="['text-sm font-medium', trendStyle.color]"
        >
          {{ trend.summary.percentageChange > 0 ? '+' : '' }}{{ trend.summary.percentageChange }}%
        </span>
      </div>
    </div>

    <!-- Chart -->
    <div class="relative h-48 mb-6">
      <!-- Grid lines -->
      <div class="absolute inset-0 flex flex-col justify-between">
        <div v-for="i in 5" :key="i" class="border-t border-gray-100" />
      </div>
      
      <!-- Bars -->
      <div class="absolute inset-0 flex items-end justify-between gap-1">
        <div
          v-for="(dataPoint, index) in trend.dataPoints"
          :key="index"
          class="flex-1 flex flex-col items-center group relative"
        >
          <!-- Bar -->
          <div
            class="w-full bg-blue-primary rounded-t transition-all hover:bg-blue-dark relative"
            :style="{ height: getBarHeight(dataPoint.totalExpenses) }"
          >
            <!-- Tooltip -->
            <div
              class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
            >
              <div class="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                <div class="font-semibold">{{ formatCurrency(dataPoint.totalExpenses) }}</div>
                <div class="text-gray-300">{{ dataPoint.interventionCount }} intervention(s)</div>
                <div class="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-gray-900" />
              </div>
            </div>
          </div>
          
          <!-- Month label -->
          <span class="text-xs text-gray-600 mt-2">
            {{ formatMonth(dataPoint.month) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
      <div>
        <div class="text-xs text-gray-600 mb-1">Total</div>
        <div class="text-base font-semibold text-gray-900">
          {{ formatCurrency(trend.summary.totalExpenses) }}
        </div>
      </div>
      
      <div>
        <div class="text-xs text-gray-600 mb-1">Moyenne mensuelle</div>
        <div class="text-base font-semibold text-gray-900">
          {{ formatCurrency(Math.round(trend.summary.averageMonthly)) }}
        </div>
      </div>
      
      <div>
        <div class="text-xs text-gray-600 mb-1">Mois le plus cher</div>
        <div class="text-base font-semibold text-gray-900">
          {{ formatMonth(trend.summary.highestMonth) }}
        </div>
      </div>
    </div>
  </div>
</template>

