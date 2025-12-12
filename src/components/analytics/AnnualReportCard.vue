<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { AnnualReport } from '@/types/analytics'

interface Props {
  report: AnnualReport
}

const props = defineProps<Props>()

const emit = defineEmits<{
  download: []
}>()

/**
 * Get trend icon and style
 */
const trendStyle = computed(() => {
  switch (props.report.summary.comparedToPreviousYear.trend) {
    case 'increased':
      return {
        icon: 'mdi:trending-up',
        color: 'text-red-500',
        text: 'Augmentation'
      }
    case 'decreased':
      return {
        icon: 'mdi:trending-down',
        color: 'text-green-500',
        text: 'Diminution'
      }
    case 'stable':
      return {
        icon: 'mdi:trending-neutral',
        color: 'text-gray-500',
        text: 'Stable'
      }
    default:
      return {
        icon: 'mdi:chart-line',
        color: 'text-gray-500',
        text: 'N/A'
      }
  }
})

/**
 * Get category color
 */
function getCategoryColor(index: number): string {
  const colors = ['bg-blue-500', 'bg-orange-500', 'bg-green-500', 'bg-purple-500']
  return colors[index % colors.length]
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-5">
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <Icon icon="mdi:file-document" class="w-6 h-6 text-blue-primary" />
          <h3 class="text-lg font-semibold text-gray-900">
            Rapport Annuel {{ report.year }}
          </h3>
        </div>
        <p class="text-sm text-gray-600">
          Synthèse complète de vos dépenses automobiles
        </p>
      </div>
      
      <button
        @click="emit('download')"
        class="px-4 py-2 bg-blue-primary text-white rounded-lg hover:bg-blue-dark transition-colors flex items-center gap-2"
      >
        <Icon icon="mdi:download" class="w-5 h-5" />
        <span class="text-sm font-medium">Télécharger PDF</span>
      </button>
    </div>

    <!-- Summary Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="p-4 bg-gray-50 rounded-lg">
        <div class="text-xs text-gray-600 mb-1">Total dépenses</div>
        <div class="text-2xl font-bold text-gray-900">
          {{ report.summary.totalExpenses }}€
        </div>
      </div>
      
      <div class="p-4 bg-gray-50 rounded-lg">
        <div class="text-xs text-gray-600 mb-1">Interventions</div>
        <div class="text-2xl font-bold text-gray-900">
          {{ report.summary.interventionCount }}
        </div>
      </div>
      
      <div class="p-4 bg-gray-50 rounded-lg">
        <div class="text-xs text-gray-600 mb-1">Véhicules</div>
        <div class="text-2xl font-bold text-gray-900">
          {{ report.summary.vehicleCount }}
        </div>
      </div>
      
      <div class="p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center gap-2 mb-1">
          <div class="text-xs text-gray-600">vs {{ report.year - 1 }}</div>
          <Icon
            :icon="trendStyle.icon"
            :class="['w-4 h-4', trendStyle.color]"
          />
        </div>
        <div :class="['text-2xl font-bold', trendStyle.color]">
          {{ report.summary.comparedToPreviousYear.percentage > 0 ? '+' : '' }}{{ report.summary.comparedToPreviousYear.percentage }}%
        </div>
      </div>
    </div>

    <!-- Categories Breakdown -->
    <div class="mb-6">
      <h4 class="text-sm font-semibold text-gray-900 mb-3">Répartition par catégorie</h4>
      
      <div class="space-y-3">
        <div
          v-for="(category, index) in report.byCategory"
          :key="category.name"
        >
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-sm text-gray-700">{{ category.name }}</span>
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-600">{{ category.count }} fois</span>
              <span class="text-sm font-semibold text-gray-900">{{ category.amount }}€</span>
              <span class="text-xs text-gray-500 w-10 text-right">{{ category.percentage }}%</span>
            </div>
          </div>
          
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              :class="['h-2 rounded-full', getCategoryColor(index)]"
              :style="{ width: `${category.percentage}%` }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Top Services -->
    <div class="mb-6">
      <h4 class="text-sm font-semibold text-gray-900 mb-3">Services les plus fréquents</h4>
      
      <div class="space-y-2">
        <div
          v-for="service in report.topServices"
          :key="service.serviceId"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center gap-3">
            <Icon icon="mdi:wrench" class="w-5 h-5 text-gray-400" />
            <span class="text-sm font-medium text-gray-900">{{ service.serviceName }}</span>
          </div>
          
          <div class="flex items-center gap-4 text-sm">
            <span class="text-gray-600">{{ service.count }}x</span>
            <span class="font-semibold text-gray-900">{{ service.totalAmount }}€</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Insights -->
    <div
      v-if="report.insights.length > 0"
      class="p-4 bg-blue-50 border border-blue-200 rounded-lg"
    >
      <div class="flex items-start gap-3">
        <Icon icon="mdi:chart-bar" class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div class="flex-1">
          <h4 class="text-sm font-semibold text-gray-900 mb-2">Analyse et recommandations</h4>
          <ul class="space-y-1.5">
            <li
              v-for="(insight, index) in report.insights"
              :key="index"
              class="text-sm text-gray-700"
            >
              {{ insight }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

