<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  icon: string
  value: number | string
  label: string
  color?: 'blue' | 'green' | 'orange' | 'gray'
  suffix?: string
  trend?: number
  pulse?: boolean
  badge?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue',
  suffix: '',
  pulse: false
})

const emit = defineEmits<{
  click: []
}>()

/**
 * Color classes based on color prop
 */
const colorClasses = computed(() => {
  const colors = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-primary',
      text: 'text-blue-primary'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-primary',
      text: 'text-green-primary'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-primary',
      text: 'text-orange-primary'
    },
    gray: {
      bg: 'bg-gray-50',
      icon: 'text-gray-600',
      text: 'text-gray-900'
    }
  }
  return colors[props.color]
})

/**
 * Handle card click
 */
function handleClick(): void {
  emit('click')
}
</script>

<template>
  <div
    @click="handleClick"
    :class="[
      'bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm hover:shadow-md transition-all',
      'cursor-pointer relative',
      pulse && 'ring-2 ring-orange-400 ring-opacity-50 animate-pulse'
    ]"
  >
    <!-- Badge (optional) -->
    <div v-if="badge" class="absolute top-2 right-2">
      <span class="text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-primary text-white">
        {{ badge }}
      </span>
    </div>

    <!-- Icon -->
    <div :class="['w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-2 md:mb-3', colorClasses.bg]">
      <Icon :icon="icon" :class="['w-5 h-5 md:w-6 md:h-6', colorClasses.icon]" />
    </div>

    <!-- Value -->
    <div class="flex items-baseline gap-1 mb-1">
      <span :class="['text-xl md:text-2xl font-bold', colorClasses.text]">
        {{ value }}
      </span>
      <span v-if="suffix" class="text-sm md:text-base text-gray-600">
        {{ suffix }}
      </span>
    </div>

    <!-- Label -->
    <div class="flex items-center justify-between">
      <p class="text-xs md:text-sm text-gray-600">{{ label }}</p>
      
      <!-- Trend (optional) -->
      <div v-if="trend !== undefined" class="flex items-center gap-0.5">
        <Icon
          :icon="trend >= 0 ? 'mdi:trending-up' : 'mdi:trending-down'"
          :class="['w-3 h-3 md:w-4 md:h-4', trend >= 0 ? 'text-green-600' : 'text-red-600']"
        />
        <span :class="['text-xs font-semibold', trend >= 0 ? 'text-green-600' : 'text-red-600']">
          {{ Math.abs(trend) }}%
        </span>
      </div>
    </div>
  </div>
</template>
