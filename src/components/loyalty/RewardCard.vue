<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Reward {
  id: string
  title: string
  description: string
  pointsRequired: number
  value: number
  type: 'discount' | 'free_service' | 'gift'
  expiresAt?: string
  claimed: boolean
}

interface Props {
  reward: Reward
  userPoints: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  claim: [rewardId: string]
}>()

/**
 * Check if reward can be claimed
 */
const canClaim = computed(() => {
  return props.userPoints >= props.reward.pointsRequired && !props.reward.claimed
})

/**
 * Get reward icon
 */
const rewardIcon = computed(() => {
  const icons = {
    discount: 'mdi:tag-percent',
    free_service: 'mdi:wrench',
    gift: 'mdi:gift'
  }
  return icons[props.reward.type]
})

/**
 * Get reward color
 */
const rewardColor = computed(() => {
  const colors = {
    discount: 'text-green-primary',
    free_service: 'text-blue-primary',
    gift: 'text-orange-primary'
  }
  return colors[props.reward.type]
})

/**
 * Handle claim
 */
function handleClaim(): void {
  if (canClaim.value) {
    emit('claim', props.reward.id)
  }
}
</script>

<template>
  <div
    :class="[
      'relative p-4 bg-white border rounded-lg transition-all',
      canClaim 
        ? 'border-green-300 shadow-md' 
        : 'border-gray-200 opacity-75'
    ]"
  >
    <!-- Claimed badge -->
    <div
      v-if="reward.claimed"
      class="absolute top-2 right-2 px-2 py-1 bg-green-pale text-green-primary text-xs font-medium rounded"
    >
      Réclamée
    </div>

    <!-- Locked badge -->
    <div
      v-else-if="!canClaim"
      class="absolute top-2 right-2 p-1 bg-gray-100 rounded"
    >
      <Icon icon="mdi:lock" class="w-4 h-4 text-gray-400" />
    </div>

    <!-- Icon -->
    <div
      :class="[
        'w-12 h-12 rounded-lg flex items-center justify-center mb-3',
        canClaim ? 'bg-green-pale' : 'bg-gray-100'
      ]"
    >
      <Icon
        :icon="rewardIcon"
        :class="[
          'w-6 h-6',
          canClaim ? rewardColor : 'text-gray-400'
        ]"
      />
    </div>

    <!-- Content -->
    <h3
      :class="[
        'text-base font-semibold mb-1',
        canClaim ? 'text-gray-900' : 'text-gray-500'
      ]"
    >
      {{ reward.title }}
    </h3>

    <p
      :class="[
        'text-sm mb-3',
        canClaim ? 'text-gray-600' : 'text-gray-400'
      ]"
    >
      {{ reward.description }}
    </p>

    <!-- Points -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-1">
        <Icon icon="mdi:star-circle" class="w-4 h-4 text-yellow-500" />
        <span
          :class="[
            'text-sm font-medium',
            canClaim ? 'text-gray-900' : 'text-gray-500'
          ]"
        >
          {{ reward.pointsRequired }} points
        </span>
      </div>

      <span
        :class="[
          'text-lg font-bold',
          canClaim ? 'text-green-primary' : 'text-gray-400'
        ]"
      >
        {{ reward.value }}€
      </span>
    </div>

    <!-- Action button -->
    <button
      type="button"
      :disabled="!canClaim || reward.claimed"
      :class="[
        'w-full px-4 py-2 text-sm font-medium rounded-lg transition-all',
        canClaim && !reward.claimed
          ? 'bg-green-primary text-white hover:bg-green-600'
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
      ]"
      @click="handleClaim"
    >
      {{ reward.claimed ? 'Réclamée' : canClaim ? 'Réclamer' : `Manque ${reward.pointsRequired - userPoints} pts` }}
    </button>

    <!-- Expiry -->
    <p v-if="reward.expiresAt && !reward.claimed" class="mt-2 text-xs text-gray-500 text-center">
      Expire le {{ new Date(reward.expiresAt).toLocaleDateString('fr-FR') }}
    </p>
  </div>
</template>
