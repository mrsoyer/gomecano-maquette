<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Tier {
  id: string
  name: string
  color: string
  minPoints: number
}

interface Props {
  currentPoints: number
  currentTier: Tier
  nextTier: Tier | null
  pointsToNext: number
}

const props = defineProps<Props>()

/**
 * Calculate progress percentage
 */
const progressPercentage = computed(() => {
  if (!props.nextTier) return 100
  
  const totalNeeded = props.nextTier.minPoints - props.currentTier.minPoints
  const currentProgress = props.currentPoints - props.currentTier.minPoints
  
  return Math.min(Math.round((currentProgress / totalNeeded) * 100), 100)
})

/**
 * Get tier gradient class
 */
function getTierGradient(color: string): string {
  const gradients: Record<string, string> = {
    bronze: 'from-orange-600 to-orange-400',
    silver: 'from-gray-400 to-gray-300',
    gold: 'from-yellow-500 to-yellow-300',
    platinum: 'from-blue-400 to-purple-400'
  }
  return gradients[color] || 'from-gray-500 to-gray-400'
}
</script>

<template>
  <div class="relative p-4 md:p-6 bg-white border border-gray-200 rounded-lg overflow-hidden">
    <!-- Background decoration -->
    <div
      :class="[
        'absolute top-0 right-0 w-48 h-48 opacity-10 blur-3xl',
        `bg-gradient-to-br ${getTierGradient(currentTier.color)}`
      ]"
    />

    <div class="relative">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <Icon icon="mdi:star-circle" class="w-6 h-6 text-yellow-500" />
            <h3 class="text-lg font-bold text-gray-900">
              Niveau {{ currentTier.name }}
            </h3>
          </div>
          <p class="text-sm text-gray-600">
            {{ currentPoints }} points
          </p>
        </div>

        <!-- Points badge -->
        <div class="px-4 py-2 bg-blue-pale rounded-lg">
          <p class="text-2xl font-bold text-blue-primary">
            {{ currentPoints }}
          </p>
          <p class="text-xs text-gray-600">Points</p>
        </div>
      </div>

      <!-- Progress bar -->
      <div v-if="nextTier" class="mb-2">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">
            Prochain niveau : {{ nextTier.name }}
          </span>
          <span class="text-sm text-gray-600">
            {{ pointsToNext }} points restants
          </span>
        </div>
        
        <div class="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            :class="[
              'absolute top-0 left-0 h-full transition-all duration-500',
              `bg-gradient-to-r ${getTierGradient(currentTier.color)}`
            ]"
            :style="{ width: `${progressPercentage}%` }"
          />
        </div>

        <p class="mt-1 text-xs text-gray-500">
          {{ progressPercentage }}% complété
        </p>
      </div>

      <!-- Max tier reached -->
      <div v-else class="flex items-center gap-2 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
        <Icon icon="mdi:crown" class="w-5 h-5 text-yellow-600" />
        <p class="text-sm font-medium text-gray-900">
          Niveau maximum atteint ! Continuez à cumuler des points pour des récompenses exclusives.
        </p>
      </div>

      <!-- Tier benefits -->
      <div class="mt-4 grid grid-cols-2 gap-3">
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <Icon icon="mdi:tag-percent" class="w-4 h-4 text-green-primary" />
          <span>-{{ currentTier.name === 'Bronze' ? '5' : currentTier.name === 'Silver' ? '10' : currentTier.name === 'Gold' ? '15' : '20' }}% sur services</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <Icon icon="mdi:calendar-star" class="w-4 h-4 text-blue-primary" />
          <span>Priorité booking</span>
        </div>
      </div>
    </div>
  </div>
</template>
