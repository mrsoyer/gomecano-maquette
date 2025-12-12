<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Mission {
  id: string
  title: string
  description: string
  points: number
  progress: number
  target: number
  completed: boolean
  type: 'booking' | 'review' | 'referral' | 'profile'
}

interface Props {
  mission: Mission
}

const props = defineProps<Props>()

/**
 * Calculate progress percentage
 */
const progressPercentage = computed(() => {
  return Math.min(Math.round((props.mission.progress / props.mission.target) * 100), 100)
})

/**
 * Get mission icon
 */
const missionIcon = computed(() => {
  const icons = {
    booking: 'mdi:calendar-check',
    review: 'mdi:star',
    referral: 'mdi:account-multiple',
    profile: 'mdi:account-edit'
  }
  return icons[props.mission.type]
})

/**
 * Get mission color
 */
const missionColor = computed(() => {
  const colors = {
    booking: 'text-blue-primary',
    review: 'text-yellow-600',
    referral: 'text-green-primary',
    profile: 'text-orange-primary'
  }
  return colors[props.mission.type]
})
</script>

<template>
  <div
    :class="[
      'p-4 bg-white border rounded-lg',
      mission.completed 
        ? 'border-green-300 bg-green-50/30' 
        : 'border-gray-200'
    ]"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-start gap-3 flex-1">
        <!-- Icon -->
        <div
          :class="[
            'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
            mission.completed ? 'bg-green-pale' : 'bg-blue-pale'
          ]"
        >
          <Icon
            :icon="mission.completed ? 'mdi:check-circle' : missionIcon"
            :class="[
              'w-5 h-5',
              mission.completed ? 'text-green-primary' : missionColor
            ]"
          />
        </div>

        <!-- Content -->
        <div class="flex-1">
          <h3
            :class="[
              'text-base font-semibold mb-1',
              mission.completed ? 'text-green-primary' : 'text-gray-900'
            ]"
          >
            {{ mission.title }}
          </h3>
          <p class="text-sm text-gray-600">
            {{ mission.description }}
          </p>
        </div>
      </div>

      <!-- Points badge -->
      <div
        :class="[
          'flex items-center gap-1 px-2 py-1 rounded-lg',
          mission.completed ? 'bg-green-pale' : 'bg-orange-light'
        ]"
      >
        <Icon icon="mdi:star-circle" class="w-4 h-4 text-yellow-500" />
        <span
          :class="[
            'text-sm font-bold',
            mission.completed ? 'text-green-primary' : 'text-orange-primary'
          ]"
        >
          +{{ mission.points }}
        </span>
      </div>
    </div>

    <!-- Progress -->
    <div v-if="!mission.completed">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs text-gray-600">
          Progression
        </span>
        <span class="text-xs font-medium text-gray-900">
          {{ mission.progress }} / {{ mission.target }}
        </span>
      </div>

      <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-blue-primary to-blue-light transition-all duration-500"
          :style="{ width: `${progressPercentage}%` }"
        />
      </div>

      <p class="mt-1 text-xs text-gray-500">
        {{ progressPercentage }}% complété
      </p>
    </div>

    <!-- Completed -->
    <div v-else class="flex items-center gap-2 p-2 bg-green-pale rounded-lg">
      <Icon icon="mdi:check-circle" class="w-5 h-5 text-green-primary" />
      <span class="text-sm font-medium text-green-primary">
        Mission accomplie !
      </span>
    </div>
  </div>
</template>
