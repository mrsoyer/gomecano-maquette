<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { Service } from '@/types/service'

interface Props {
  currentService: Service
  recommendations: Service[]
  mechanicAdvice: string
}

defineProps<Props>()

const emit = defineEmits<{
  'add-service': [serviceId: string]
}>()
</script>

<template>
  <div class="space-y-4 md:space-y-5">
    <!-- Conseil mécano -->
    <div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
      <div class="flex items-start gap-2">
        <Icon icon="mdi:account-wrench" class="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 class="text-sm md:text-base font-semibold text-blue-900 mb-1">Conseil de votre mécanicien</h3>
          <p class="text-xs md:text-sm text-blue-800 leading-relaxed">{{ mechanicAdvice }}</p>
        </div>
      </div>
    </div>
    
    <!-- 3 services recommandés -->
    <div>
      <h3 class="text-sm md:text-base font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
        <Icon icon="mdi:star" class="w-4 h-4 md:w-5 md:h-5 text-orange-primary" />
        Services recommandés pour votre véhicule
      </h3>
      <div class="space-y-2">
        <button
          v-for="service in recommendations"
          :key="service.id"
          @click="$emit('add-service', service.id)"
          class="w-full p-3 border-2 border-gray-200 rounded-lg hover:border-orange-primary hover:bg-orange-50 transition-all text-left group"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <h4 class="text-sm md:text-base font-semibold text-gray-900 group-hover:text-orange-primary transition-colors">
                {{ service.name }}
              </h4>
              <p class="text-xs md:text-sm text-gray-600 mt-0.5 line-clamp-2">
                {{ service.description }}
              </p>
            </div>
            <div class="text-right flex-shrink-0">
              <div class="text-base md:text-lg font-bold text-orange-primary">{{ service.priceFrom }}€</div>
              <div class="text-[10px] md:text-xs text-gray-500">à partir de</div>
            </div>
          </div>
        </button>
      </div>
    </div>
    
    <!-- Bouton IA (désactivé) -->
    <div class="text-center pt-3 border-t border-gray-200">
      <div class="relative inline-block group">
        <button
          disabled
          class="px-4 py-2 md:px-6 md:py-3 text-sm md:text-base bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed flex items-center gap-2"
        >
          <Icon icon="mdi:robot" class="w-4 h-4 md:w-5 md:h-5" />
          Parler à notre Gomecanicien IA
        </button>
        
        <!-- Tooltip -->
        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Bientôt disponible
        </div>
      </div>
      <p class="text-[10px] md:text-xs text-gray-500 mt-2">
        Notre IA vous aidera à choisir les meilleurs services pour votre véhicule
      </p>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>


