<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { TrendData } from '@/types/fleet'

interface Props {
  data: TrendData[]
}

const props = defineProps<Props>()

/**
 * Max value for chart scaling
 */
const maxValue = Math.max(...props.data.map(d => d.value))

/**
 * Get bar height percentage
 */
function getBarHeight(value: number): number {
  return (value / maxValue) * 100
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
    <h3 class="text-sm md:text-base font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
      <Icon icon="mdi:chart-line" class="w-5 h-5 text-green-primary" />
      Tendance des coûts
    </h3>

    <!-- Simple Bar Chart -->
    <div class="h-48 md:h-56 flex items-end justify-between gap-1 md:gap-2 mb-2">
      <div
        v-for="(item, index) in data"
        :key="index"
        class="flex-1 flex flex-col items-center gap-1"
      >
        <!-- Bar -->
        <div class="w-full flex flex-col justify-end" style="height: 180px;">
          <div
            class="w-full bg-gradient-to-t from-green-primary to-green-bright rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer"
            :style="{ height: `${getBarHeight(item.value)}%` }"
            :title="`${item.value.toLocaleString()}€`"
          ></div>
        </div>
        <!-- Label -->
        <span class="text-[9px] md:text-xs text-gray-600 font-medium">{{ item.label }}</span>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex items-center justify-between pt-3 border-t border-gray-200">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-green-primary rounded"></div>
        <span class="text-xs text-gray-600">Coûts mensuels</span>
      </div>
      <div class="text-right">
        <p class="text-xs text-gray-500">Moyenne</p>
        <p class="text-sm md:text-base font-bold text-gray-900">
          {{ Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length).toLocaleString() }}€
        </p>
      </div>
    </div>
  </div>
</template>
