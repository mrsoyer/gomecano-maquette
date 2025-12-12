<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface Props {
  badge: Badge
}

const props = defineProps<Props>()

/**
 * Get rarity colors
 */
function getRarityConfig(rarity: string) {
  const configs = {
    common: {
      gradient: 'from-gray-300 to-gray-400',
      glow: 'shadow-gray-300',
      border: 'border-gray-300'
    },
    rare: {
      gradient: 'from-blue-400 to-blue-500',
      glow: 'shadow-blue-300',
      border: 'border-blue-400'
    },
    epic: {
      gradient: 'from-purple-400 to-purple-500',
      glow: 'shadow-purple-300',
      border: 'border-purple-400'
    },
    legendary: {
      gradient: 'from-yellow-400 to-orange-500',
      glow: 'shadow-yellow-300',
      border: 'border-yellow-400'
    }
  }
  return configs[rarity] || configs.common
}
</script>

<template>
  <div
    :class="[
      'p-4 bg-white border-2 rounded-lg text-center transition-all',
      badge.unlocked 
        ? `${getRarityConfig(badge.rarity).border} ${getRarityConfig(badge.rarity).glow} shadow-lg` 
        : 'border-gray-200 opacity-50'
    ]"
  >
    <!-- Badge icon -->
    <div
      :class="[
        'w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 transition-all',
        badge.unlocked 
          ? `bg-gradient-to-br ${getRarityConfig(badge.rarity).gradient}` 
          : 'bg-gray-200'
      ]"
    >
      <Icon
        :icon="badge.unlocked ? badge.icon : 'mdi:lock'"
        :class="[
          'w-8 h-8',
          badge.unlocked ? 'text-white' : 'text-gray-400'
        ]"
      />
    </div>

    <!-- Badge name -->
    <h3
      :class="[
        'text-sm font-bold mb-1',
        badge.unlocked ? 'text-gray-900' : 'text-gray-500'
      ]"
    >
      {{ badge.name }}
    </h3>

    <!-- Badge description -->
    <p
      :class="[
        'text-xs mb-2',
        badge.unlocked ? 'text-gray-600' : 'text-gray-400'
      ]"
    >
      {{ badge.description }}
    </p>

    <!-- Rarity badge -->
    <div
      v-if="badge.unlocked"
      :class="[
        'inline-block px-2 py-0.5 text-xs font-medium rounded-full',
        `bg-gradient-to-r ${getRarityConfig(badge.rarity).gradient} text-white`
      ]"
    >
      {{ badge.rarity === 'common' ? 'Commun' : badge.rarity === 'rare' ? 'Rare' : badge.rarity === 'epic' ? 'Épique' : 'Légendaire' }}
    </div>

    <!-- Unlocked date -->
    <p v-if="badge.unlocked && badge.unlockedAt" class="mt-2 text-xs text-gray-500">
      Débloqué le {{ new Date(badge.unlockedAt).toLocaleDateString('fr-FR') }}
    </p>

    <!-- Locked message -->
    <p v-if="!badge.unlocked" class="mt-2 text-xs text-gray-400">
      <Icon icon="mdi:lock" class="w-3 h-3 inline" />
      Badge verrouillé
    </p>
  </div>
</template>
