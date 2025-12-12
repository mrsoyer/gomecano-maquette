<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  icon: string
  value: number | string
  label: string
  suffix?: string
  trend?: number
  alert?: boolean
  showProgressBar?: boolean
  progress?: number
  maxValue?: number
}

const props = withDefaults(defineProps<Props>(), {
  suffix: '',
  alert: false,
  showProgressBar: false,
  progress: 0
})

/**
 * Progress percentage for budget bar
 */
const progressPercentage = computed(() => {
  if (!props.showProgressBar) return 0
  if (props.maxValue && props.maxValue > 0) {
    return Math.min(100, (Number(props.value) / props.maxValue) * 100)
  }
  return Math.min(100, props.progress)
})

/**
 * Progress bar color based on utilization
 */
const progressColor = computed(() => {
  if (progressPercentage.value >= 90) return 'bg-red-500'
  if (progressPercentage.value >= 75) return 'bg-orange-500'
  return 'bg-green-primary'
})
</script>

<template>
  <div
    :class="[
      'bg-white rounded-lg border-2 p-3 md:p-4 shadow-sm hover:shadow-md transition-all',
      alert ? 'border-orange-500' : 'border-gray-200'
    ]"
  >
    <div class="flex items-start justify-between mb-2 md:mb-3">
      <!-- Icon -->
      <div class="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gray-100 flex items-center justify-center">
        <Icon :icon="icon" class="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
      </div>

      <!-- Trend -->
      <div v-if="trend !== undefined" class="flex items-center gap-0.5">
        <Icon
          :icon="trend >= 0 ? 'mdi:trending-up' : 'mdi:trending-down'"
          :class="['w-4 h-4 md:w-5 md:h-5', trend >= 0 ? 'text-green-600' : 'text-red-600']"
        />
        <span :class="['text-xs md:text-sm font-bold', trend >= 0 ? 'text-green-600' : 'text-red-600']">
          {{ Math.abs(trend) }}%
        </span>
      </div>

      <!-- Alert Badge -->
      <div v-else-if="alert" class="flex items-center gap-1 px-2 py-0.5 bg-orange-100 rounded-full">
        <Icon icon="mdi:alert" class="w-3 h-3 md:w-4 md:h-4 text-orange-600" />
        <span class="text-xs font-semibold text-orange-600">Alerte</span>
      </div>
    </div>

    <!-- Value -->
    <div class="flex items-baseline gap-1 mb-1">
      <span class="text-2xl md:text-3xl font-bold text-gray-900">
        {{ value }}
      </span>
      <span v-if="suffix" class="text-sm md:text-base text-gray-600">
        {{ suffix }}
      </span>
    </div>

    <!-- Label -->
    <p class="text-xs md:text-sm text-gray-600 mb-2">{{ label }}</p>

    <!-- Progress Bar (optional - for budgets) -->
    <div v-if="showProgressBar" class="mt-3">
      <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          :class="['h-full transition-all duration-500', progressColor]"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
      <div class="flex justify-between mt-1">
        <span class="text-[10px] md:text-xs text-gray-500">
          {{ progressPercentage.toFixed(0) }}% utilisé
        </span>
        <span v-if="maxValue" class="text-[10px] md:text-xs text-gray-500">
          {{ maxValue }}{{ suffix }} max
        </span>
      </div>
    </div>
  </div>
</template>
