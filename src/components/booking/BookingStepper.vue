<script setup lang="ts">
import { computed } from 'vue'

/**
 * Props
 */
interface Props {
  currentStep: number
  totalSteps?: number
  theme?: 'dark' | 'light'
}

const props = withDefaults(defineProps<Props>(), {
  totalSteps: 4,
  theme: 'dark'
})

/**
 * Step labels
 */
const steps = [
  { number: 1, label: 'Prestation' },
  { number: 2, label: 'Collecte & Restitution' },
  { number: 3, label: 'Confirmation' },
  { number: 4, label: 'Paiement' }
]

/**
 * Get step status
 */
function getStepStatus(stepNumber: number): 'completed' | 'active' | 'upcoming' {
  if (stepNumber < props.currentStep) return 'completed'
  if (stepNumber === props.currentStep) return 'active'
  return 'upcoming'
}

/**
 * Get step classes
 */
function getStepClasses(stepNumber: number): string {
  const status = getStepStatus(stepNumber)
  const baseClasses = 'flex items-center'
  
  if (props.theme === 'light') {
    // Light theme (for dark backgrounds)
    if (status === 'completed') {
      return `${baseClasses} text-green-400`
    } else if (status === 'active') {
      return `${baseClasses} text-white`
    } else {
      return `${baseClasses} text-orange-300`
    }
  } else {
    // Dark theme (for light backgrounds)
    if (status === 'completed') {
      return `${baseClasses} text-green-600`
    } else if (status === 'active') {
      return `${baseClasses} text-orange-600`
    } else {
      return `${baseClasses} text-orange-400`
    }
  }
}

/**
 * Get circle classes
 */
function getCircleClasses(stepNumber: number): string {
  const status = getStepStatus(stepNumber)
  const baseClasses = 'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs'
  
  if (props.theme === 'light') {
    // Light theme
    if (status === 'completed') {
      return `${baseClasses} bg-green-500 text-white`
    } else if (status === 'active') {
      return `${baseClasses} bg-white text-orange-900 ring-2 ring-white`
    } else {
      return `${baseClasses} bg-orange-700/50 text-orange-300`
    }
  } else {
    // Dark theme
    if (status === 'completed') {
      return `${baseClasses} bg-green-600 text-white`
    } else if (status === 'active') {
      return `${baseClasses} bg-orange-600 text-white ring-2 ring-orange-600`
    } else {
      return `${baseClasses} bg-orange-100 text-orange-500`
    }
  }
}

/**
 * Get connector classes
 */
function getConnectorClasses(stepNumber: number): string {
  const status = getStepStatus(stepNumber)
  const baseClasses = 'flex-1 h-0.5 mx-2'
  
  if (props.theme === 'light') {
    // Light theme
    if (status === 'completed') {
      return `${baseClasses} bg-green-400`
    } else {
      return `${baseClasses} bg-orange-700/30`
    }
  } else {
    // Dark theme
    if (status === 'completed') {
      return `${baseClasses} bg-green-600`
    } else {
      return `${baseClasses} bg-orange-200`
    }
  }
}
</script>

<template>
  <div class="w-full">
    <div class="flex items-center justify-between">
      <template v-for="(step, index) in steps" :key="step.number">
        <!-- Step -->
        <div :class="getStepClasses(step.number)" class="flex-col items-center">
          <div :class="getCircleClasses(step.number)" class="flex-shrink-0">
            <span v-if="getStepStatus(step.number) === 'completed'">✓</span>
            <span v-else>{{ step.number }}</span>
          </div>
          <div class="mt-1 text-[11px] font-medium text-center whitespace-nowrap hidden md:block leading-tight">
            {{ step.label }}
          </div>
        </div>

        <!-- Connector (not after last step) -->
        <div
          v-if="index < steps.length - 1"
          :class="getConnectorClasses(step.number)"
          class="self-center"
        />
      </template>
    </div>

    <!-- Mobile: Current step label -->
    <div class="mt-4 text-center md:hidden">
      <p class="text-sm font-semibold text-gray-900">
        {{ steps.find(s => s.number === currentStep)?.label }}
      </p>
      <p class="text-xs text-gray-500 mt-1">
        Étape {{ currentStep }} sur {{ totalSteps }}
      </p>
    </div>
  </div>
</template>


