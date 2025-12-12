import { ref, computed, watch } from 'vue'
import type { Service, ServiceAnswer, ServiceTier, ServiceOption } from '@/types/service'
import { useServiceTiers } from './useServiceTiers'
import { useServiceOptions } from './useServiceOptions'

/**
 * Composable pour gérer le pricing dynamique d'un service
 * 
 * @param service - Le service dont on calcule le prix
 * @returns État et méthodes pour gérer le pricing
 */
export function useServicePricing(service: Service) {
  const STORAGE_KEY = `service-config-${service.id}`

  // État local
  const selectedTier = ref<string | undefined>(undefined)
  const selectedOptions = ref<string[]>([])
  const answers = ref<ServiceAnswer[]>([])
  const isQuestionsModalOpen = ref(false)
  
  // Convertir answers pour les composables (Record<string, string | number>)
  const answersRecord = computed(() => {
    const record: Record<string, string | number> = {}
    answers.value.forEach(answer => {
      record[answer.questionId] = answer.value
    })
    return record
  })
  
  // Init composables génération dynamique AVANT dynamicTiers
  // IMPORTANT: Utiliser service.slug (pas service.id) car les règles sont indexées par slug
  const tiersGenerator = useServiceTiers(
    service.slug,
    service.pricingTiers,
    answersRecord
  )
  
  const optionsGenerator = useServiceOptions(
    service.slug,
    service.options,
    answersRecord
  )
  
  // Gammes et options dynamiques
  // Si service a génération dynamique, initialiser vide pour forcer génération
  // Sinon utiliser tiers/options statiques (services classiques)
  const dynamicTiers = ref<ServiceTier[]>(
    tiersGenerator.isDynamic.value ? [] : (service.pricingTiers || [])
  )
  const dynamicOptions = ref<ServiceOption[]>(
    optionsGenerator.isDynamic.value ? [] : (service.options || [])
  )

  /**
   * Initialise la gamme par défaut (recommandée ou standard)
   */
  function initializeDefaultTier() {
    if (service.pricingTiers && service.pricingTiers.length > 0) {
      const recommended = service.pricingTiers.find(t => t.recommended)
      const standard = service.pricingTiers.find(t => t.name === 'standard')
      selectedTier.value = (recommended || standard || service.pricingTiers[0]).id
    }
  }

  /**
   * Charge la configuration sauvegardée depuis localStorage
   */
  function loadSavedConfiguration() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const config = JSON.parse(saved)
        selectedTier.value = config.tierId
        selectedOptions.value = config.selectedOptions || []
        answers.value = config.answers || []
        console.log(`Loaded saved configuration for ${service.name}`)
        return true
      }
    } catch (error) {
      console.error('Error loading saved configuration:', error)
    }
    return false
  }

  /**
   * Sauvegarde la configuration dans localStorage
   */
  function saveConfiguration() {
    try {
      const config = {
        tierId: selectedTier.value,
        selectedOptions: selectedOptions.value,
        answers: answers.value,
        savedAt: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
      console.log(`Saved configuration for ${service.name}`)
    } catch (error) {
      console.error('Error saving configuration:', error)
    }
  }

  // Charger la config sauvegardée ou initialiser par défaut
  if (!loadSavedConfiguration()) {
    initializeDefaultTier()
  }
  
  // Auto-génération si questions déjà répondues (depuis localStorage)
  // et si service a génération dynamique
  console.log('🔍 DEBUG - Checking auto-generation conditions:', {
    answersLength: answers.value.length,
    hasRequiredAnswers: tiersGenerator.hasRequiredAnswers.value,
    isDynamic: tiersGenerator.isDynamic.value,
    serviceId: service.id,
    serviceSlug: service.slug  // ← C'est ça qu'on utilise !
  })
  
  if (answers.value.length > 0 && tiersGenerator.hasRequiredAnswers.value) {
    console.log('✅ Auto-generating tiers and options from saved answers...')
    console.log('📝 Answers:', answers.value)
    console.log('📊 AnswersRecord:', answersRecord.value)
    // Délai pour laisser le temps au composant de monter
    setTimeout(async () => {
      // Génération en parallèle
      await Promise.all([
        tiersGenerator.isDynamic.value 
          ? tiersGenerator.generateTiers(answersRecord.value)
          : Promise.resolve(),
        optionsGenerator.isDynamic.value
          ? optionsGenerator.generateOptions(answersRecord.value)
          : Promise.resolve()
      ])
      
      // Mettre à jour les tiers et options dynamiques
      console.log('🔍 After generation - tiersGenerator.tiers:', tiersGenerator.tiers.value)
      
      if (tiersGenerator.isDynamic.value && tiersGenerator.tiers.value.length > 0) {
        dynamicTiers.value = tiersGenerator.tiers.value
        console.log('✅ Auto-generated dynamic tiers:', dynamicTiers.value)
        
        // Sélectionner automatiquement la gamme recommandée si pas déjà sélectionnée
        if (!selectedTier.value) {
          const recommended = dynamicTiers.value.find(t => t.recommended)
          if (recommended) {
            selectedTier.value = recommended.id
          }
        }
      }
      
      if (optionsGenerator.isDynamic.value && optionsGenerator.options.value.length > 0) {
        dynamicOptions.value = optionsGenerator.options.value
        console.log('Auto-generated dynamic options:', dynamicOptions.value)
      }
    }, 100)
  }

  // Sauvegarder automatiquement à chaque modification
  watch(
    [selectedTier, selectedOptions, answers],
    () => {
      saveConfiguration()
    },
    { deep: true }
  )

  /**
   * Calcule le prix dynamique total
   */
  const totalPrice = computed(() => {
    let price = service.priceFrom

    // Prix de la gamme sélectionnée (utiliser dynamicTiers au lieu de service.pricingTiers)
    if (selectedTier.value && dynamicTiers.value) {
      const tier = dynamicTiers.value.find(t => t.id === selectedTier.value)
      if (tier) {
        price = tier.basePrice || (tier as any).price || price
      }
    }

    // Modificateurs des réponses aux questions
    answers.value.forEach(answer => {
      const question = service.questions?.find(q => q.id === answer.questionId)
      if (question?.type === 'select' || question?.type === 'radio') {
        const option = question.options?.find(opt => opt.value === String(answer.value))
        if (option?.priceModifier) {
          price += option.priceModifier
        }
      }
    })

    // Prix des options supplémentaires sélectionnées (utiliser dynamicOptions)
    if (dynamicOptions.value) {
      dynamicOptions.value.forEach(option => {
        if (selectedOptions.value.includes(option.id)) {
          price += option.price
        }
      })
    }

    return price
  })

  /**
   * Calcule la durée totale (avec gamme + options)
   */
  const totalDuration = computed(() => {
    let duration = service.duration

    // Durée de la gamme sélectionnée (utiliser dynamicTiers)
    if (selectedTier.value && dynamicTiers.value) {
      const tier = dynamicTiers.value.find(t => t.id === selectedTier.value)
      if (tier) {
        duration = tier.duration
      }
    }

    // Durée des options supplémentaires (utiliser dynamicOptions)
    if (dynamicOptions.value) {
      dynamicOptions.value.forEach(option => {
        if (selectedOptions.value.includes(option.id)) {
          duration += option.duration
        }
      })
    }

    return duration
  })

  /**
   * Breakdown détaillé de la durée
   */
  const durationBreakdown = computed(() => {
    const breakdown: {
      base: number
      tierLabel?: string
      tierExtra?: number
      options: Array<{ name: string; duration: number }>
      total: number
    } = {
      base: service.duration,
      options: [],
      total: totalDuration.value
    }

    // Durée de la gamme si différente
    if (selectedTier.value && service.pricingTiers) {
      const tier = service.pricingTiers.find(t => t.id === selectedTier.value)
      if (tier?.duration !== undefined && tier.duration !== service.duration) {
        breakdown.tierLabel = tier.label
        breakdown.tierExtra = tier.duration - service.duration
      }
    }

    // Durées des options
    selectedOptions.value.forEach(optId => {
      const option = service.options?.find(opt => opt.id === optId)
      if (option?.duration) {
        breakdown.options.push({
          name: option.name,
          duration: option.duration
        })
      }
    })

    return breakdown
  })

  /**
   * Vérifie si toutes les questions requises ont une réponse
   */
  const hasAnsweredRequiredQuestions = computed(() => {
    if (!service.questions || service.questions.length === 0) {
      return true
    }

    return service.questions
      .filter(q => q.required)
      .every(q => answers.value.find(a => a.questionId === q.id))
  })

  /**
   * Vérifie si le prix peut être affiché
   * (Questions avec hidePriceUntilAnswered doivent être répondues)
   */
  const shouldShowPrice = computed(() => {
    if (!service.questions || service.questions.length === 0) {
      return true
    }

    const questionsWithHidePrice = service.questions.filter(q => q.hidePriceUntilAnswered)
    if (questionsWithHidePrice.length === 0) {
      return true // Pas de restriction
    }

    // Toutes les questions avec hidePriceUntilAnswered doivent être répondues
    return questionsWithHidePrice.every(q => 
      answers.value.find(a => a.questionId === q.id)
    )
  })

  /**
   * Ouvre la modal de questions
   */
  function openQuestionsModal() {
    isQuestionsModalOpen.value = true
  }

  /**
   * Ferme la modal de questions
   */
  function closeQuestionsModal() {
    isQuestionsModalOpen.value = false
  }

  /**
   * Soumet les réponses aux questions
   * 
   * @param newAnswers - Nouvelles réponses
   * @param shouldGenerate - Déclencher génération dynamique tiers/options
   */
  async function submitAnswers(newAnswers: ServiceAnswer[], shouldGenerate: boolean = false) {
    answers.value = newAnswers
    
    // Générer tiers et options dynamiques si demandé
    if (shouldGenerate) {
      console.log('Generating dynamic tiers and options...')
      
      // Génération en parallèle
      await Promise.all([
        tiersGenerator.isDynamic.value 
          ? tiersGenerator.generateTiers(answersRecord.value)
          : Promise.resolve(),
        optionsGenerator.isDynamic.value
          ? optionsGenerator.generateOptions(answersRecord.value)
          : Promise.resolve()
      ])
      
      // Mettre à jour les tiers et options dynamiques
      if (tiersGenerator.isDynamic.value && tiersGenerator.tiers.value.length > 0) {
        dynamicTiers.value = tiersGenerator.tiers.value
        console.log('Updated dynamic tiers:', dynamicTiers.value)
        
        // Sélectionner automatiquement la gamme recommandée
        const recommended = dynamicTiers.value.find(t => t.recommended)
        if (recommended) {
          selectedTier.value = recommended.id
        }
      }
      
      if (optionsGenerator.isDynamic.value && optionsGenerator.options.value.length > 0) {
        dynamicOptions.value = optionsGenerator.options.value
        console.log('Updated dynamic options:', dynamicOptions.value)
      }
    }
    
    closeQuestionsModal()
  }

  /**
   * Sélectionne une gamme de prix
   */
  function selectTier(tierId: string) {
    selectedTier.value = tierId
  }

  /**
   * Toggle une option supplémentaire
   */
  function toggleOption(optionId: string) {
    const index = selectedOptions.value.indexOf(optionId)
    if (index > -1) {
      selectedOptions.value.splice(index, 1)
    } else {
      selectedOptions.value.push(optionId)
    }
  }

  /**
   * Réinitialise toutes les sélections
   */
  function reset() {
    selectedOptions.value = []
    answers.value = []
    initializeDefaultTier()
  }

  /**
   * Récupère la configuration complète pour le panier
   */
  const cartConfiguration = computed(() => ({
    serviceId: service.id,
    tierId: selectedTier.value,
    options: selectedOptions.value,
    answers: answers.value,
    totalPrice: totalPrice.value,
    totalDuration: totalDuration.value
  }))

  return {
    // État
    selectedTier,
    selectedOptions,
    answers,
    isQuestionsModalOpen,
    dynamicTiers,
    dynamicOptions,

    // Computed
    totalPrice,
    totalDuration,
    durationBreakdown,
    hasAnsweredRequiredQuestions,
    shouldShowPrice,
    cartConfiguration,
    
    // États génération
    isGeneratingTiers: tiersGenerator.isGenerating,
    isGeneratingOptions: optionsGenerator.isGenerating,

    // Méthodes
    openQuestionsModal,
    closeQuestionsModal,
    submitAnswers,
    selectTier,
    toggleOption,
    reset
  }
}



