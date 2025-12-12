<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  points: number
}

const props = defineProps<Props>()

/**
 * Next reward threshold
 */
const nextRewardThreshold = computed(() => {
  const thresholds = [100, 250, 500, 1000, 2000]
  return thresholds.find(t => t > props.points) || 2000
})

/**
 * Progress to next reward
 */
const progressPercentage = computed(() => {
  const previousThreshold = [0, 100, 250, 500, 1000].reverse().find(t => t <= props.points) || 0
  const range = nextRewardThreshold.value - previousThreshold
  const progress = props.points - previousThreshold
  return Math.round((progress / range) * 100)
})

/**
 * Points to next reward
 */
const pointsToNext = computed(() => nextRewardThreshold.value - props.points)

/**
 * Current tier
 */
const currentTier = computed(() => {
  if (props.points >= 1000) return { name: 'Gold', color: 'text-yellow-600 bg-yellow-50' }
  if (props.points >= 500) return { name: 'Silver', color: 'text-gray-600 bg-gray-100' }
  if (props.points >= 100) return { name: 'Bronze', color: 'text-orange-700 bg-orange-100' }
  return { name: 'Member', color: 'text-blue-600 bg-blue-50' }
})
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
    <h3 class="text-sm md:text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
      <Icon icon="mdi:trophy" class="w-5 h-5 text-orange-primary" />
      Programme Fidélité
    </h3>

    <!-- Current Tier -->
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs md:text-sm text-gray-600">Statut</span>
      <div :class="['px-3 py-1 rounded-full text-xs md:text-sm font-bold', currentTier.color]">
        {{ currentTier.name }}
      </div>
    </div>

    <!-- Points -->
    <div class="text-center mb-4">
      <div class="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-2">
        <div class="text-center">
          <p class="text-2xl md:text-3xl font-bold text-white">{{ points }}</p>
          <p class="text-[10px] text-orange-100">points</p>
        </div>
      </div>
    </div>

    <!-- Progress to Next Reward -->
    <div class="mb-3">
      <div class="flex justify-between text-xs mb-1.5">
        <span class="text-gray-600">Prochaine récompense</span>
        <span class="font-semibold text-gray-900">{{ nextRewardThreshold }} pts</span>
      </div>
      <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
      <p class="text-[10px] md:text-xs text-gray-500 mt-1 text-center">
        Plus que {{ pointsToNext }} points
      </p>
    </div>

    <!-- Benefits -->
    <div class="space-y-1.5 text-xs">
      <div class="flex items-center gap-2 text-gray-700">
        <Icon icon="mdi:check-circle" class="w-4 h-4 text-green-600" />
        <span>-10% sur prochaine intervention</span>
      </div>
      <div class="flex items-center gap-2 text-gray-700">
        <Icon icon="mdi:check-circle" class="w-4 h-4 text-green-600" />
        <span>Priorité sur les créneaux</span>
      </div>
      <div class="flex items-center gap-2 text-gray-700">
        <Icon icon="mdi:check-circle" class="w-4 h-4 text-green-600" />
        <span>Rappels entretien gratuits</span>
      </div>
    </div>
  </div>
</template>
