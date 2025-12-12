<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title: string
  defaultOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: false,
})

const isOpen = ref(props.defaultOpen)

const toggle = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden">
    <button
      type="button"
      class="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
      @click="toggle"
    >
      <span class="text-left font-medium text-gray-900">
        {{ props.title }}
      </span>
      <svg
        :class="[
          'h-5 w-5 text-gray-500 transition-transform',
          { 'rotate-180': isOpen }
        ]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <Transition name="accordion">
      <div v-if="isOpen" class="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.2s ease;
}

.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.accordion-enter-to,
.accordion-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>




