<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  currentStep: number
  steps: string[]
}

const props = defineProps<Props>()

/**
 * Get step status
 */
function getStepStatus(index: number): 'completed' | 'current' | 'upcoming' {
  if (index < props.currentStep) return 'completed'
  if (index === props.currentStep) return 'current'
  return 'upcoming'
}

/**
 * Get step icon
 */
function getStepIcon(index: number): string {
  const status = getStepStatus(index)
  if (status === 'completed') return 'mdi:check-circle'
  if (status === 'current') return 'mdi:clock-outline'
  return 'mdi:circle-outline'
}

/**
 * Progress percentage
 */
const progressPercentage = computed(() => {
  return Math.round((props.currentStep / (props.steps.length - 1)) * 100)
})
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm mb-4 md:mb-6">
    <!-- Mobile: Compact view -->
    <div class="md:hidden">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold text-gray-700">Étape {{ currentStep + 1 }}/{{ steps.length }}</span>
        <span class="text-xs text-gray-600">{{ progressPercentage }}%</span>
      </div>
      <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div
          class="h-full bg-green-primary transition-all duration-500"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
      <p class="text-sm font-semibold text-gray-900">{{ steps[currentStep] }}</p>
    </div>

    <!-- Desktop: Full stepper -->
    <div class="hidden md:block">
      <div class="flex items-center justify-between">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="flex items-center flex-1"
        >
          <!-- Step Circle -->
          <div class="flex flex-col items-center">
            <div
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all',
                getStepStatus(index) === 'completed' && 'bg-green-primary text-white',
                getStepStatus(index) === 'current' && 'bg-orange-primary text-white ring-4 ring-orange-200',
                getStepStatus(index) === 'upcoming' && 'bg-gray-200 text-gray-500'
              ]"
            >
              <Icon :icon="getStepIcon(index)" class="w-5 h-5" />
            </div>
            <span
              :class="[
                'mt-2 text-xs font-semibold text-center',
                getStepStatus(index) === 'current' ? 'text-orange-primary' : 'text-gray-600'
              ]"
            >
              {{ step }}
            </span>
          </div>

          <!-- Connector Line -->
          <div
            v-if="index < steps.length - 1"
            :class="[
              'flex-1 h-1 mx-2',
              index < currentStep ? 'bg-green-primary' : 'bg-gray-200'
            ]"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>
