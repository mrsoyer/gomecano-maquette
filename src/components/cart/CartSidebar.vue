<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useCartStore } from '@/stores/cart.store'

/**
 * Props
 */
interface Props {
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false
})

/**
 * Cart store
 */
const cartStore = useCartStore()
const router = useRouter()

/**
 * Navigate to devis page
 */
function goToDevis() {
  router.push('/devis')
}

/**
 * Remove service
 */
function removeService(serviceId: string) {
  cartStore.removeService(serviceId)
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
    <h3 class="text-sm md:text-base font-bold text-gray-900 mb-1.5 flex items-center gap-2">
      <Icon icon="mdi:cart" class="w-4 h-4 md:w-5 md:h-5 text-orange-primary" />
      Mon devis
    </h3>
    
    <!-- Services list -->
    <div v-if="cartStore.services.length > 0" class="space-y-2">
      <div 
        v-for="service in cartStore.services" 
        :key="service.id"
        class="py-1.5 border-b border-gray-200 last:border-0"
      >
        <div class="flex items-start justify-between gap-2 mb-0.5">
          <div class="flex-1 min-w-0">
            <span class="text-xs md:text-sm font-medium text-gray-700 block">
              {{ service.name }}
            </span>
            
            <!-- Gamme sélectionnée -->
            <span 
              v-if="service.pricingConfig?.tierLabel && !compact" 
              class="inline-block mt-0.5 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] md:text-xs font-semibold rounded"
            >
              {{ service.pricingConfig.tierLabel }}
            </span>
            
            <!-- Durée -->
            <span v-if="!compact" class="text-[10px] text-gray-500 block mt-0.5">
              <Icon icon="mdi:clock-outline" class="w-3 h-3 inline mr-1" />
              {{ service.duration }} min
            </span>
          </div>
          
          <div class="flex items-center gap-2 flex-shrink-0">
            <span class="text-xs md:text-sm font-bold text-orange-primary whitespace-nowrap">
              {{ service.price }}€
            </span>
            <button
              v-if="!compact"
              @click="removeService(service.id)"
              class="text-red-600 hover:text-red-700 p-1"
              title="Retirer du devis"
            >
              <Icon icon="mdi:close" class="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
        </div>
        
        <!-- Options sélectionnées -->
        <div 
          v-if="service.pricingConfig?.selectedOptions && service.pricingConfig.selectedOptions.length > 0 && !compact"
          class="mt-1 ml-2 space-y-0.5"
        >
          <div 
            v-for="optId in service.pricingConfig.selectedOptions" 
            :key="optId"
            class="flex items-center gap-1 text-xs text-gray-600"
          >
            <Icon icon="mdi:plus-circle-outline" class="w-3 h-3 text-green-600" />
            <span>Option {{ optId }}</span>
          </div>
        </div>
        
        <!-- Réponses aux questions (aperçu) -->
        <div 
          v-if="service.pricingConfig?.answers && service.pricingConfig.answers.length > 0 && !compact"
          class="mt-1 ml-2"
        >
          <div class="text-xs text-gray-500 italic">
            <Icon icon="mdi:information-outline" class="w-3 h-3 inline mr-1" />
            {{ service.pricingConfig.answers.length }} question(s) répondue(s)
          </div>
        </div>
      </div>
      
      <!-- Total -->
      <div class="pt-2 border-t-2 border-gray-300">
        <div class="flex justify-between items-center">
          <span class="font-bold text-gray-900">Total TTC</span>
          <span class="text-xl md:text-2xl font-bold text-gray-900">
            {{ cartStore.total }}€
          </span>
        </div>
      </div>

      <!-- View full devis button -->
      <button
        v-if="!compact"
        @click="goToDevis"
        class="w-full py-1.5 mt-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs md:text-sm rounded-lg transition-all"
      >
        Voir le devis complet
      </button>
    </div>
    
    <!-- Empty state -->
    <div v-else class="text-center py-3 text-gray-500 text-xs md:text-sm">
      Votre devis est vide
    </div>
  </div>
</template>
