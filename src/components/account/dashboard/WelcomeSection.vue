<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  userName: string
  accountType: 'b2c' | 'b2b'
  companyName?: string
}

const props = defineProps<Props>()

/**
 * Gradient classes based on account type
 */
const gradientClasses = computed(() => {
  if (props.accountType === 'b2b') {
    return 'bg-gradient-to-r from-green-primary to-green-bright'
  }
  return 'bg-gradient-to-r from-blue-primary to-blue-light'
})

/**
 * Welcome message based on time of day
 */
const welcomeMessage = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bonjour'
  if (hour < 18) return 'Bon après-midi'
  return 'Bonsoir'
})
</script>

<template>
  <div :class="['rounded-lg md:rounded-xl p-4 md:p-6 text-white shadow-lg mb-4 md:mb-6', gradientClasses]">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <h1 class="text-xl md:text-2xl lg:text-3xl font-bold mb-1.5 md:mb-2">
          {{ welcomeMessage }} {{ userName }}
        </h1>
        <p class="text-sm md:text-base opacity-90">
          <template v-if="accountType === 'b2b' && companyName">
            {{ companyName }} - Espace Entreprise
          </template>
          <template v-else>
            Bienvenue dans votre espace Gomecano
          </template>
        </p>
      </div>

      <!-- Account Type Badge -->
      <div class="hidden md:flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
        <Icon
          :icon="accountType === 'b2b' ? 'mdi:office-building' : 'mdi:account'"
          class="w-5 h-5"
        />
        <span class="text-sm font-semibold">
          {{ accountType === 'b2b' ? 'Entreprise' : 'Particulier' }}
        </span>
      </div>
    </div>
  </div>
</template>
