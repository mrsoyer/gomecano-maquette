<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Props {
  icon: string
  title: string
  description: string
  cta: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: []
}>()

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
    class="bg-white rounded-lg border-2 border-gray-200 p-3 md:p-4 hover:border-orange-500 hover:shadow-lg transition-all cursor-pointer group"
  >
    <!-- Icon -->
    <div class="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center mb-3 transition-colors">
      <Icon :icon="icon" class="w-6 h-6 md:w-7 md:h-7 text-orange-primary" />
    </div>

    <!-- Title -->
    <h3 class="text-sm md:text-base font-bold text-gray-900 mb-1.5">
      {{ title }}
    </h3>

    <!-- Description -->
    <p class="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
      {{ description }}
    </p>

    <!-- CTA -->
    <button
      class="w-full py-2 md:py-2.5 px-4 bg-orange-primary group-hover:bg-orange-hover text-white font-semibold rounded-lg transition-all text-xs md:text-sm flex items-center justify-center gap-2"
    >
      <span>{{ cta }}</span>
      <Icon icon="mdi:arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </button>
  </div>
</template>
