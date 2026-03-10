<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { Mechanic } from '@/types/user'

interface Props {
  mechanic: Mechanic
  showCallButton?: boolean
  showChatButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showCallButton: false,
  showChatButton: false
})

const emit = defineEmits<{
  call: []
  chat: []
}>()
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
    <h3 class="text-sm md:text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
      <Icon icon="mdi:account-wrench" class="w-5 h-5 text-blue-primary" />
      Votre mécanicien
    </h3>

    <!-- Mechanic Info -->
    <div class="flex items-center gap-3 md:gap-4 mb-3">
      <div class="w-14 h-14 md:w-16 md:h-16 rounded-full bg-blue-primary text-white flex items-center justify-center font-bold text-lg md:text-xl">
        {{ mechanic.name.split(' ').map(n => n[0]).join('') }}
      </div>
      <div class="flex-1 min-w-0">
        <h4 class="text-base md:text-lg font-bold text-gray-900 mb-0.5">
          {{ mechanic.name }}
        </h4>
        <div class="flex items-center gap-1 mb-1">
          <Icon icon="mdi:star" class="w-4 h-4 text-yellow-500" />
          <span class="text-sm font-semibold text-gray-900">{{ mechanic.rating }}</span>
          <span class="text-xs text-gray-500">({{ mechanic.reviewsCount }} avis)</span>
        </div>
        <p class="text-xs text-gray-600">{{ mechanic.yearsExperience }} ans d'expérience</p>
      </div>
    </div>

    <!-- Specialties -->
    <div class="mb-3">
      <p class="text-xs font-semibold text-gray-700 mb-1.5">Spécialités :</p>
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="specialty in mechanic.specialties.slice(0, 3)"
          :key="specialty"
          class="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] md:text-xs font-medium rounded-full"
        >
          {{ specialty }}
        </span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div v-if="showCallButton || showChatButton" class="flex gap-2">
      <button
        v-if="showCallButton"
        @click="emit('call')"
        class="flex-1 py-2 md:py-2.5 px-3 bg-blue-primary hover:bg-blue-dark text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs md:text-sm"
      >
        <Icon icon="mdi:phone" class="w-4 h-4 md:w-5 md:h-5" />
        <span>Appeler</span>
      </button>
      <button
        v-if="showChatButton"
        @click="emit('chat')"
        class="flex-1 py-2 md:py-2.5 px-3 bg-white hover:bg-gray-50 text-blue-primary border-2 border-blue-primary font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs md:text-sm"
      >
        <Icon icon="mdi:message-text" class="w-4 h-4 md:w-5 md:h-5" />
        <span>Message</span>
      </button>
    </div>
  </div>
</template>
