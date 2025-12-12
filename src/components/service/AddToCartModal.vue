<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import type { Service, ServiceOption } from '@/types/service'
import ServiceOptionsSelector from './ServiceOptionsSelector.vue'
import ServiceRecommendations from './ServiceRecommendations.vue'
import { useServiceRecommendations } from '@/composables/useServiceRecommendations'

interface Props {
  isOpen: boolean
  service: Service
  selectedTier?: string
  selectedOptions: string[]
  totalPrice: number
  totalDuration: number
  isInCart: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  'update:selectedOptions': [options: string[]]
  'update-cart': []
}>()

const router = useRouter()

/**
 * Étape courante (1, 2 ou 3)
 * 1 = Options supplémentaires
 * 2 = Recommandations services
 * 3 = Navigation finale
 */
const currentStep = ref<1 | 2 | 3>(1)

/**
 * Options locales (modifiables dans la modal)
 */
const localSelectedOptions = ref<string[]>([])

/**
 * Track si options ont été modifiées dans la modal
 */
const hasModifiedOptions = ref(false)

/**
 * Recommandations pour ce service
 */
const { mechanicAdvice, recommendations } = useServiceRecommendations(props.service.id)

/**
 * Vérifier si service a des options
 */
const hasOptions = computed(() => {
  return props.service.options && props.service.options.length > 0
})

/**
 * Vérifier si au moins une option est sélectionnée
 */
const hasSelectedOptions = computed(() => {
  return localSelectedOptions.value.length > 0
})

/**
 * Label de la gamme sélectionnée
 */
const tierLabel = computed(() => {
  if (!props.selectedTier || !props.service.pricingTiers) return undefined
  return props.service.pricingTiers.find(t => t.id === props.selectedTier)?.label
})

/**
 * Options sélectionnées (détails complets)
 */
const selectedOptionsDetails = computed(() => {
  return localSelectedOptions.value
    .map(optId => props.service.options?.find(opt => opt.id === optId))
    .filter(Boolean) as ServiceOption[]
})

/**
 * Titre du header selon l'étape
 */
const headerTitle = computed(() => {
  switch (currentStep.value) {
    case 1: return 'Options supplémentaires'
    case 2: return 'Services recommandés'
    case 3: return 'Récapitulatif'
    default: return ''
  }
})

/**
 * Bouton étape 1 dynamique
 */
const step1ButtonText = computed(() => {
  return hasModifiedOptions.value ? 'Modifier le devis' : 'Continuer'
})

/**
 * Initialiser la modal
 */
function initModal() {
  localSelectedOptions.value = [...props.selectedOptions]
  hasModifiedOptions.value = false
  
  // Si options déjà sélectionnées → skip étape 1 (options)
  if (hasSelectedOptions.value) {
    currentStep.value = 2 // Direct recommandations
  } else {
    currentStep.value = 1 // Options
  }
}

/**
 * Watcher pour détecter modifications d'options
 */
watch(localSelectedOptions, (newVal, oldVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
    hasModifiedOptions.value = true
  }
}, { deep: true })

/**
 * Étape 1 → Étape 2 (Recommandations)
 */
function handleStep1Continue() {
  // Si options modifiées, mettre à jour le devis
  if (hasModifiedOptions.value) {
    emit('update:selectedOptions', localSelectedOptions.value)
    emit('update-cart')
  }
  
  currentStep.value = 2 // Recommandations
}

/**
 * Étape 2 → Étape 3 (Navigation)
 */
function handleStep2Continue() {
  currentStep.value = 3 // Navigation
}

/**
 * Ajouter un service recommandé
 */
function handleAddRecommendedService(serviceId: string) {
  // Rediriger vers le service
  router.push(`/service/${serviceId}`)
  emit('close')
}

/**
 * Voir le devis (étape 3)
 */
function goToCart() {
  router.push('/devis')
  emit('close')
}

/**
 * Ajouter un autre service (étape 3)
 */
function addAnotherService() {
  router.push('/services')
  emit('close')
}

/**
 * Fermer la modal
 */
function handleClose() {
  emit('close')
}

/**
 * Watch isOpen pour réinitialiser
 */
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    initModal()
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <!-- Overlay -->
        <div 
          class="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          @click="handleClose"
        />
        
        <!-- Modal -->
        <div class="relative bg-white rounded-lg md:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 md:px-4 md:py-3 flex items-center justify-between z-10">
            <div class="flex-1">
              <h2 class="text-base md:text-lg font-bold text-gray-900">
                {{ headerTitle }}
              </h2>
              <p class="text-xs md:text-sm text-gray-600 mt-0.5">{{ service.name }}</p>
            </div>
            <button
              @click="handleClose"
              class="w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0 ml-2"
              aria-label="Fermer"
            >
              <Icon icon="mdi:close" class="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
            </button>
          </div>
          
          <!-- Content scrollable -->
          <div class="flex-1 overflow-y-auto p-3 md:p-4">
            <!-- ÉTAPE 1 : Options supplémentaires -->
            <div v-if="currentStep === 1 && hasOptions">
              <div class="mb-3">
                <p class="text-xs md:text-sm text-gray-700">
                  Ajoutez des options pour personnaliser votre intervention :
                </p>
              </div>
              
              <ServiceOptionsSelector
                :options="service.options || []"
                :selected-options="localSelectedOptions"
                @update:selected-options="localSelectedOptions = $event"
              />
            </div>
            
            <!-- ÉTAPE 2 : Recommandations services -->
            <div v-if="currentStep === 2">
              <ServiceRecommendations
                :current-service="service"
                :recommendations="recommendations"
                :mechanic-advice="mechanicAdvice"
                @add-service="handleAddRecommendedService"
              />
            </div>
            
            <!-- ÉTAPE 3 : Navigation finale -->
            <div v-if="currentStep === 3">
              <!-- Prix total -->
              <div class="bg-orange-50 border-2 border-orange-200 rounded-lg p-3 md:p-4 mb-3 md:mb-4 text-center">
                <div class="text-xs md:text-sm text-gray-600 mb-0.5">Prix total</div>
                <div class="text-3xl md:text-4xl font-black text-orange-primary mb-1">
                  {{ totalPrice }}€
                </div>
                <div v-if="tierLabel" class="text-xs md:text-sm text-gray-600 capitalize">
                  Gamme {{ tierLabel }}
                </div>
              </div>
              
              <!-- Récapitulatif -->
              <div class="space-y-3">
                <h3 class="text-sm md:text-base font-semibold text-gray-900 flex items-center gap-1.5">
                  <Icon icon="mdi:check-circle" class="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                  Votre intervention
                </h3>
                
                <!-- Gamme -->
                <div v-if="tierLabel" class="flex items-start gap-2 pl-5 md:pl-6">
                  <Icon icon="mdi:star" class="w-4 h-4 md:w-5 md:h-5 text-orange-primary flex-shrink-0 mt-0.5" />
                  <div class="flex-1">
                    <div class="text-sm md:text-base font-medium text-gray-900">Gamme {{ tierLabel }}</div>
                  </div>
                </div>
                
                <!-- Options sélectionnées -->
                <div v-if="selectedOptionsDetails.length > 0">
                  <div 
                    v-for="option in selectedOptionsDetails" 
                    :key="option.id"
                    class="flex items-start gap-2 pl-5 md:pl-6"
                  >
                    <Icon icon="mdi:plus-circle" class="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div class="flex-1 min-w-0">
                      <div class="text-sm md:text-base font-medium text-gray-900">{{ option.name }}</div>
                      <div class="text-xs md:text-sm text-gray-600">{{ option.description }}</div>
                    </div>
                    <div class="text-xs md:text-sm font-semibold text-orange-primary whitespace-nowrap">
                      +{{ option.price }}€
                    </div>
                  </div>
                </div>
                
                <!-- Durée totale -->
                <div class="flex items-center gap-2 pl-5 md:pl-6 pt-2 border-t border-gray-200">
                  <Icon icon="mdi:clock-outline" class="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                  <div class="flex-1 text-xs md:text-sm text-gray-700">
                    Temps d'intervention
                  </div>
                  <div class="text-xs md:text-sm font-semibold text-blue-600">
                    {{ totalDuration }} min
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Footer sticky -->
          <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-3 py-2 md:px-4 md:py-3">
            <!-- ÉTAPE 1 : Bouton dynamique -->
            <div v-if="currentStep === 1" class="flex gap-2">
              <button
                @click="handleClose"
                class="flex-1 px-4 py-2 md:px-6 md:py-3 text-sm md:text-base border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
              <button
                @click="handleStep1Continue"
                class="flex-1 px-4 py-2 md:px-6 md:py-3 text-sm md:text-base bg-orange-primary text-white rounded-lg font-semibold hover:bg-orange-hover transition-colors"
              >
                {{ step1ButtonText }}
              </button>
            </div>
            
            <!-- ÉTAPE 2 : Bouton continuer -->
            <div v-if="currentStep === 2" class="flex gap-2">
              <button
                @click="handleClose"
                class="flex-1 px-4 py-2 md:px-6 md:py-3 text-sm md:text-base border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Passer
              </button>
              <button
                @click="handleStep2Continue"
                class="flex-1 px-4 py-2 md:px-6 md:py-3 text-sm md:text-base bg-orange-primary text-white rounded-lg font-semibold hover:bg-orange-hover transition-colors"
              >
                Continuer
              </button>
            </div>
            
            <!-- ÉTAPE 3 : Deux boutons navigation -->
            <div v-if="currentStep === 3" class="space-y-2">
              <button
                @click="goToCart"
                class="w-full px-4 py-2 md:px-6 md:py-3 text-sm md:text-base bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Icon icon="mdi:eye" class="w-4 h-4 md:w-5 md:h-5" />
                VOIR LE DEVIS
              </button>
              <button
                @click="addAnotherService"
                class="w-full px-4 py-2 md:px-6 md:py-3 text-sm md:text-base bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Icon icon="mdi:plus" class="w-4 h-4 md:w-5 md:h-5" />
                AJOUTER UN SERVICE
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>


