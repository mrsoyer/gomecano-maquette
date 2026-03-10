<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Service } from '@/types/service'
import { Icon } from '@iconify/vue'

interface Props {
  service: Service
  price: number
  duration: number
  tierLabel?: string
  canAddToCart: boolean
  isInCart: boolean
  hasConfigChanged: boolean
  shouldShowPrice?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  shouldShowPrice: true
})
const emit = defineEmits<{
  addToCart: []
  updateCart: []
  goToCart: []
}>()

/**
 * Détecte si la sidebar complète est visible
 */
const isSidebarVisible = ref(false)
const sidebarObserver = ref<IntersectionObserver | null>(null)

/**
 * Vérifie si on est sur mobile
 */
const isMobile = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 1024 // lg breakpoint
})

/**
 * Affiche la mini bar seulement sur mobile ET si sidebar pas visible
 */
const shouldShow = computed(() => {
  return isMobile.value && !isSidebarVisible.value
})

/**
 * Texte du bouton
 */
const buttonText = computed(() => {
  if (props.isInCart) {
    return props.hasConfigChanged ? 'MODIFIER' : 'VOIR DEVIS'
  }
  return 'AJOUTER'
})

/**
 * Couleur du bouton
 */
const buttonColor = computed(() => {
  if (props.isInCart && !props.hasConfigChanged) {
    return 'bg-green-600 hover:bg-green-700'
  }
  if (props.isInCart && props.hasConfigChanged) {
    return 'bg-blue-600 hover:bg-blue-700'
  }
  return 'bg-orange-primary hover:bg-orange-hover'
})

/**
 * Handle click bouton
 */
function handleClick() {
  if (props.isInCart) {
    if (props.hasConfigChanged) {
      emit('updateCart')
    } else {
      emit('goToCart')
    }
  } else {
    emit('addToCart')
  }
}

/**
 * Setup Intersection Observer pour détecter la sidebar
 */
onMounted(() => {
  // Observer la sidebar complète
  const sidebarElement = document.querySelector('[data-mobile-price-trigger]')
  
  if (sidebarElement) {
    sidebarObserver.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Si la sidebar est visible à 50%+, on cache la mini bar
          isSidebarVisible.value = entry.intersectionRatio > 0.5
        })
      },
      {
        threshold: [0, 0.5, 1],
        rootMargin: '0px 0px -100px 0px' // Trigger un peu avant qu'elle soit visible
      }
    )
    
    sidebarObserver.value.observe(sidebarElement)
  }
})

/**
 * Cleanup
 */
onUnmounted(() => {
  if (sidebarObserver.value) {
    sidebarObserver.value.disconnect()
  }
})
</script>

<template>
  <Transition name="slide-up">
    <div 
      v-if="shouldShow"
      class="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-gray-200 shadow-lg px-3 py-2 safe-area-bottom"
    >
      <div class="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        <!-- Prix + infos -->
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <!-- Prix ou "Sur devis" -->
          <span 
            v-if="shouldShowPrice"
            class="text-xl font-black text-orange-primary whitespace-nowrap"
          >
            {{ price }}€
          </span>
          <span 
            v-else
            class="text-base font-bold text-gray-600 whitespace-nowrap"
          >
            Prix sur devis
          </span>
          
          <!-- Gamme -->
          <span 
            v-if="tierLabel" 
            class="text-[10px] text-gray-600 capitalize truncate"
          >
            {{ tierLabel }}
          </span>
          
          <!-- Durée -->
          <span class="text-[10px] text-blue-600 flex items-center gap-0.5 whitespace-nowrap">
            <Icon icon="mdi:clock-outline" class="w-3 h-3" />
            {{ duration }}min
          </span>
        </div>
        
        <!-- CTA -->
        <button
          @click="handleClick"
          :disabled="!canAddToCart && !isInCart"
          class="px-4 py-2 text-white text-sm font-bold rounded-lg transition-all shadow-md whitespace-nowrap disabled:opacity-50"
          :class="buttonColor"
        >
          {{ buttonText }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Animation slide up */
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

/* Safe area pour iPhone avec encoche */
.safe-area-bottom {
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
}
</style>


