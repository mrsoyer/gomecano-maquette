<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  total: number
  serviceCount: number
  totalDuration: number
  hasServices: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  validate: []
}>()

const isSummaryVisible = ref(false)
const summaryObserver = ref<IntersectionObserver | null>(null)

const isMobile = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 1024 // lg breakpoint
})

const shouldShow = computed(() => {
  return isMobile.value && !isSummaryVisible.value && props.hasServices
})

onMounted(() => {
  const summaryElement = document.querySelector('[data-devis-summary-trigger]')
  if (summaryElement) {
    summaryObserver.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isSummaryVisible.value = entry.intersectionRatio > 0.5
        })
      },
      {
        threshold: [0, 0.5, 1],
        rootMargin: '0px 0px -100px 0px'
      }
    )
    summaryObserver.value.observe(summaryElement)
  }
})

onUnmounted(() => {
  if (summaryObserver.value) {
    summaryObserver.value.disconnect()
  }
})
</script>

<template>
  <Transition name="slide-up">
    <div 
      v-if="shouldShow"
      class="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-gray-200 shadow-lg px-3 py-2 safe-area-bottom lg:hidden"
    >
      <div class="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <span class="text-xl font-black text-orange-primary whitespace-nowrap">
            {{ total }}€
          </span>
          <span class="text-[10px] text-gray-600 truncate">
            {{ serviceCount }} service{{ serviceCount > 1 ? 's' : '' }}
          </span>
          <span class="text-[10px] text-blue-600 flex items-center gap-0.5 whitespace-nowrap">
            <Icon icon="mdi:clock-outline" class="w-3 h-3" />
            {{ totalDuration }}min
          </span>
        </div>
        <button
          @click="emit('validate')"
          class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-all shadow-md whitespace-nowrap flex items-center gap-1"
        >
          <Icon icon="mdi:calendar-clock" class="w-3.5 h-3.5" />
          PROGRAMMER
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.safe-area-bottom {
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
}
</style>


