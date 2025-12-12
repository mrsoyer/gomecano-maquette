<script setup lang="ts">
import { computed } from 'vue'
import type { Service, ServiceAnswer, ServiceTier, ServiceOption } from '@/types/service'
import { Icon } from '@iconify/vue'

interface Props {
  service: Service
  selectedTier?: string
  selectedOptions: string[]
  answers: ServiceAnswer[]
  isInCart: boolean
  hasCompleteContext: boolean
  hasConfigChanged?: boolean
  shouldShowPrice?: boolean
  // Props pour tiers/options dynamiques (pneus, etc.)
  dynamicTiers?: ServiceTier[]
  dynamicOptions?: ServiceOption[]
}

const props = withDefaults(defineProps<Props>(), {
  hasConfigChanged: false,
  shouldShowPrice: true
})

const emit = defineEmits<{
  addToCart: []
  updateCart: []
  goToCart: []
  openQuestions: []
  openContextModal: []
}>()

/**
 * Calcul du prix dynamique
 */
const dynamicPrice = computed(() => {
  let basePrice = props.service.priceFrom
  
  // Prix de la gamme sélectionnée
  // Utiliser dynamicTiers (pneus générés) si disponibles, sinon pricingTiers statiques
  if (props.selectedTier) {
    const tiersToUse = props.dynamicTiers || props.service.pricingTiers
    if (tiersToUse) {
      const tier = tiersToUse.find(t => t.id === props.selectedTier)
      if (tier) {
        // Utiliser basePrice (pneus) ou price (services classiques)
        basePrice = tier.basePrice || (tier as any).price || basePrice
      }
    }
  }
  
  // Modificateurs des réponses aux questions
  props.answers.forEach(answer => {
    const question = props.service.questions?.find(q => q.id === answer.questionId)
    if (question?.type === 'select' || question?.type === 'radio') {
      const option = question.options?.find(opt => opt.value === String(answer.value))
      if (option?.priceModifier) {
        basePrice += option.priceModifier
      }
    }
  })
  
  // Options supplémentaires
  // Utiliser dynamicOptions si disponibles, sinon options statiques
  const optionsToUse = props.dynamicOptions || props.service.options
  if (optionsToUse) {
    props.selectedOptions.forEach(optId => {
      const option = optionsToUse.find(opt => opt.id === optId)
      if (option) {
        basePrice += option.price
      }
    })
  }
  
  return basePrice
})

/**
 * Vérifie si des questions obligatoires sont manquantes
 */
const missingQuestions = computed(() => {
  if (!props.service.questions || props.service.questions.length === 0) {
    return false
  }
  
  return props.service.questions.some(q => 
    q.required && !props.answers.find(a => a.questionId === q.id)
  )
})

/**
 * Récupère le label d'une option
 */
function getOptionLabel(optId: string): string {
  const option = props.service.options?.find(opt => opt.id === optId)
  return option?.name || ''
}

/**
 * Récupère le prix d'une option
 */
function getOptionPrice(optId: string): number {
  const option = props.service.options?.find(opt => opt.id === optId)
  return option?.price || 0
}

/**
 * Durée totale calculée
 */
const totalDuration = computed(() => {
  let duration = props.service.duration
  
  // Durée de la gamme si spécifiée
  if (props.selectedTier && props.service.pricingTiers) {
    const tier = props.service.pricingTiers.find(t => t.id === props.selectedTier)
    if (tier?.duration !== undefined) {
      duration = tier.duration
    }
  }
  
  // Durées options
  props.selectedOptions.forEach(optId => {
    const option = props.service.options?.find(opt => opt.id === optId)
    if (option?.duration) {
      duration += option.duration
    }
  })
  
  return duration
})

/**
 * Durée de base
 */
const baseDuration = computed(() => props.service.duration)

/**
 * Label de la gamme sélectionnée
 */
const tierLabel = computed(() => {
  if (!props.selectedTier || !props.service.pricingTiers) return undefined
  const tier = props.service.pricingTiers.find(t => t.id === props.selectedTier)
  return tier?.label
})

/**
 * Extra durée de la gamme (si différente de base)
 */
const tierDurationExtra = computed(() => {
  if (!props.selectedTier || !props.service.pricingTiers) return undefined
  const tier = props.service.pricingTiers.find(t => t.id === props.selectedTier)
  if (tier?.duration !== undefined && tier.duration !== props.service.duration) {
    return tier.duration - props.service.duration
  }
  return undefined
})

/**
 * Options avec durée
 */
const optionsWithDuration = computed(() => {
  return props.selectedOptions
    .map(optId => {
      const option = props.service.options?.find(opt => opt.id === optId)
      if (option?.duration) {
        return {
          id: option.id,
          name: option.name,
          duration: option.duration
        }
      }
      return null
    })
    .filter(Boolean) as Array<{ id: string; name: string; duration: number }>
})

/**
 * Vérifie si on a des détails de durée à afficher
 */
const hasDurationDetails = computed(() => {
  return tierDurationExtra.value !== undefined || optionsWithDuration.value.length > 0
})

/**
 * Texte du bouton adaptatif
 */
const buttonText = computed(() => {
  if (missingQuestions.value) {
    return 'RÉPONDRE AUX QUESTIONS'
  }
  if (!props.hasCompleteContext) {
    return 'CHOISIR MON VÉHICULE'
  }
  if (props.isInCart) {
    if (props.hasConfigChanged) {
      return 'MODIFIER LE DEVIS'
    }
    return 'VOIR LE DEVIS'
  }
  return 'AJOUTER AU DEVIS'
})

/**
 * Icône du bouton
 */
const buttonIcon = computed(() => {
  if (missingQuestions.value) return 'mdi:help-circle'
  if (!props.hasCompleteContext) return 'mdi:car'
  if (props.isInCart && !props.hasConfigChanged) return 'mdi:eye'
  if (props.isInCart && props.hasConfigChanged) return 'mdi:pencil'
  return 'mdi:cart-plus'
})

/**
 * Couleur du bouton
 */
const buttonColor = computed(() => {
  if (missingQuestions.value || !props.hasCompleteContext) {
    return 'bg-blue-500 hover:bg-blue-600'
  }
  if (props.isInCart && !props.hasConfigChanged) {
    return 'bg-green-600 hover:bg-green-700'
  }
  if (props.isInCart && props.hasConfigChanged) {
    return 'bg-blue-600 hover:bg-blue-700'
  }
  return 'bg-orange-primary hover:bg-orange-hover'
})

/**
 * Handle bouton principal
 */
function handleMainAction() {
  if (missingQuestions.value) {
    emit('openQuestions')
  } else if (!props.hasCompleteContext) {
    emit('openContextModal')
  } else if (props.isInCart) {
    if (props.hasConfigChanged) {
      emit('updateCart')
    } else {
      emit('goToCart')
    }
  } else {
    emit('addToCart')
  }
}
</script>

<template>
  <div class="sticky top-20 bg-white rounded-lg border-2 border-gray-200 p-3 shadow-lg">
    <!-- Prix dynamique -->
    <div class="text-center mb-3">
      <div class="text-xs text-gray-600 mb-0.5">Prix total</div>
      
      <!-- Prix affiché si shouldShowPrice === true -->
      <template v-if="shouldShowPrice">
        <div class="text-3xl md:text-4xl font-black text-orange-primary">
          {{ dynamicPrice }}€
        </div>
        <div v-if="selectedTier && service.pricingTiers" class="text-[10px] text-gray-500 mt-0.5 capitalize">
          Gamme {{ service.pricingTiers.find(t => t.id === selectedTier)?.label || selectedTier }}
        </div>
      </template>
      
      <!-- Prix sur devis si shouldShowPrice === false -->
      <template v-else>
        <div class="text-2xl md:text-3xl font-bold text-gray-600">
          Prix sur devis
        </div>
        <div class="text-[10px] md:text-xs text-gray-500 mt-0.5">
          Répondez aux questions pour calculer le prix
        </div>
      </template>
    </div>
    
    <!-- Temps de main d'œuvre -->
    <div class="border-t border-gray-200 pt-2 mb-2">
      <div class="flex items-center justify-between mb-1.5">
        <div class="flex items-center gap-1.5">
          <Icon icon="mdi:clock-outline" class="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
          <span class="text-[10px] md:text-xs text-gray-600 font-semibold">Temps d'intervention</span>
        </div>
        <span class="text-xs md:text-sm font-bold text-blue-600">{{ totalDuration }} min</span>
      </div>
      
      <!-- Breakdown durée (si détails disponibles) -->
      <div v-if="hasDurationDetails" class="space-y-0.5 text-[10px] md:text-xs pl-5">
        <div class="flex justify-between items-center text-gray-600">
          <span>Base</span>
          <span>{{ baseDuration }} min</span>
        </div>
        
        <!-- Extra durée gamme -->
        <div v-if="tierDurationExtra" class="flex justify-between items-center text-gray-700">
          <span>{{ tierLabel }}</span>
          <span class="text-blue-600">+{{ tierDurationExtra }} min</span>
        </div>
        
        <!-- Durées options -->
        <div 
          v-for="opt in optionsWithDuration" 
          :key="opt.id"
          class="flex justify-between items-center text-gray-700"
        >
          <span>{{ opt.name }}</span>
          <span class="text-blue-600">+{{ opt.duration }} min</span>
        </div>
      </div>
    </div>
    
    <!-- Détails config -->
    <div v-if="answers.length > 0 || selectedOptions.length > 0" class="border-t border-gray-200 pt-2 mb-3">
      <div class="text-[10px] md:text-xs text-gray-600 mb-1.5 font-semibold">Configuration</div>
      <div class="space-y-1 text-[10px] md:text-xs">
        <!-- Réponses aux questions -->
        <div v-for="answer in answers" :key="answer.questionId" class="flex justify-between items-start gap-2">
          <span class="text-gray-600">{{ answer.label }}</span>
        </div>
        
        <!-- Options supplémentaires -->
        <div v-for="optId in selectedOptions" :key="optId" class="flex justify-between items-start gap-2">
          <span class="text-gray-700">{{ getOptionLabel(optId) }}</span>
          <span class="font-semibold text-orange-primary">+{{ getOptionPrice(optId) }}€</span>
        </div>
      </div>
    </div>
    
    <!-- Bouton principal adaptatif -->
    <button
      @click="handleMainAction"
      class="w-full py-2.5 md:py-3 font-bold text-white rounded-lg transition-all shadow-md hover:shadow-lg"
      :class="buttonColor"
    >
      <span class="flex items-center justify-center gap-2">
        <Icon :icon="buttonIcon" class="w-4 h-4 md:w-5 md:h-5" />
        {{ buttonText }}
      </span>
    </button>
    
    <!-- Garanties & Infos -->
    <div class="mt-3 pt-3 border-t border-gray-200 space-y-1.5 text-[10px] md:text-xs">
      <div class="flex items-center gap-2 text-gray-700">
        <Icon icon="mdi:shield-check" class="w-3 h-3 md:w-4 md:h-4 text-green-600 flex-shrink-0" />
        <span>Garantie 24 mois pièces et main d'œuvre</span>
      </div>
      <div class="flex items-center gap-2 text-gray-700">
        <Icon icon="mdi:home-map-marker" class="w-3 h-3 md:w-4 md:h-4 text-blue-600 flex-shrink-0" />
        <span>Intervention à domicile ou sur votre lieu de travail</span>
      </div>
      <div class="flex items-center gap-2 text-gray-700">
        <Icon icon="mdi:clock-outline" class="w-3 h-3 md:w-4 md:h-4 text-orange-primary flex-shrink-0" />
        <span>Durée : {{ service.duration }} minutes</span>
      </div>
    </div>
  </div>
</template>



