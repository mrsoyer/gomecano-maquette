<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

/**
 * Props
 */
interface Props {
  message: string
  variant?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  position?: 'top' | 'bottom'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  duration: 3000,
  position: 'top'
})

/**
 * Emits
 */
const emit = defineEmits<{
  close: []
}>()

/**
 * Auto-dismiss timer
 */
let timer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  if (props.duration > 0) {
    timer = setTimeout(() => {
      emit('close')
    }, props.duration)
  }
})

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer)
  }
})

/**
 * Handle close
 */
function handleClose() {
  emit('close')
}

/**
 * Get variant styles
 */
function getVariantStyles() {
  switch (props.variant) {
    case 'success':
      return {
        bg: 'bg-green-50',
        border: 'border-green-500',
        text: 'text-green-900',
        icon: '✓',
        iconBg: 'bg-green-500'
      }
    case 'error':
      return {
        bg: 'bg-red-50',
        border: 'border-red-500',
        text: 'text-red-900',
        icon: '✕',
        iconBg: 'bg-red-500'
      }
    case 'warning':
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-500',
        text: 'text-orange-900',
        icon: '⚠',
        iconBg: 'bg-orange-500'
      }
    case 'info':
    default:
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-500',
        text: 'text-blue-900',
        icon: 'ℹ',
        iconBg: 'bg-blue-500'
      }
  }
}

const styles = getVariantStyles()
</script>

<template>
  <div
    class="flex items-start gap-3 min-w-[300px] max-w-md px-4 py-3 rounded-lg border-2 shadow-lg transition-all animate-slide-in"
    :class="[styles.bg, styles.border, styles.text]"
    role="alert"
      >
    <!-- Icon -->
    <div
      class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm"
      :class="styles.iconBg"
    >
      {{ styles.icon }}
    </div>

    <!-- Message -->
    <p class="flex-1 text-sm font-medium leading-relaxed pt-0.5">
      {{ message }}
        </p>

    <!-- Close button -->
        <button
      @click="handleClose"
      class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      aria-label="Fermer"
        >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
</template>

<style scoped>
@keyframes slide-in {
  from {
  opacity: 0;
    transform: translateY(-1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-in {
  animation: slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
