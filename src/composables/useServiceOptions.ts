import { ref, computed, type ComputedRef } from 'vue'
import type { ServiceOption, ServiceAnswer } from '@/types/service'
import { getOptionGenerationRule, hasDynamicOptions } from '@/mocks/serviceTiersOptions'

/**
 * Composable to generate and manage service options
 * 
 * Supports both:
 * - Static options (from service.options)
 * - Dynamic options (generated from question answers)
 * 
 * @param serviceId - The service ID
 * @param staticOptions - Static options from service definition (optional)
 * @param answers - Answers to required questions (for dynamic generation) - Can be ComputedRef for reactivity
 * @returns Options state, loading, and generation methods
 */
export function useServiceOptions(
  serviceId: string,
  staticOptions?: ServiceOption[],
  answers?: Record<string, string | number> | ComputedRef<Record<string, string | number>>
) {
  const options = ref<ServiceOption[]>(staticOptions || [])
  const isGenerating = ref(false)
  const generationError = ref<string | null>(null)
  
  /**
   * Check if service has dynamic option generation
   */
  const isDynamic = computed(() => hasDynamicOptions(serviceId))
  
  /**
   * Check if all required answers are provided
   */
  const hasRequiredAnswers = computed(() => {
    if (!isDynamic.value || !answers) return true
    
    const rule = getOptionGenerationRule(serviceId)
    if (!rule) return true
    
    // Unwrap ComputedRef if needed
    const answersValue = 'value' in answers ? answers.value : answers
    
    return rule.requiredAnswers.every(qId => {
      const value = answersValue[qId]
      return value !== undefined && value !== '' && value !== null
    })
  })
  
  /**
   * Generate options dynamically from answers
   * 
   * @param answersData - Question answers (optional, uses composable answers if not provided)
   */
  async function generateOptions(answersData?: Record<string, string | number>): Promise<void> {
    let answersToUse = answersData
    
    // If no answersData provided, use the composable's answers
    if (!answersToUse && answers) {
      // Unwrap ComputedRef if needed
      answersToUse = 'value' in answers ? answers.value : answers
    }
    
    if (!answersToUse) {
      console.warn('No answers provided for option generation')
      return
    }
    
    const rule = getOptionGenerationRule(serviceId)
    
    if (!rule) {
      console.warn(`No option generation rule found for service: ${serviceId}`)
      return
    }
    
    // Check required answers
    const missingAnswers = rule.requiredAnswers.filter(qId => {
      const value = answersToUse![qId]
      return value === undefined || value === '' || value === null
    })
    
    if (missingAnswers.length > 0) {
      generationError.value = `Questions manquantes: ${missingAnswers.join(', ')}`
      console.warn('Missing required answers:', missingAnswers)
      return
    }
    
    try {
      isGenerating.value = true
      generationError.value = null
      
      // Simulate API delay (200ms, plus court que tiers)
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Generate options using rule
      const generatedOptions = rule.generator(answersToUse)
      
      options.value = generatedOptions
      
      console.log(`Generated ${generatedOptions.length} options for ${serviceId}:`, generatedOptions)
    } catch (err) {
      generationError.value = err instanceof Error ? err.message : 'Erreur génération options'
      console.error('Error generating options:', err)
    } finally {
      isGenerating.value = false
    }
  }
  
  /**
   * Reset to static options
   */
  function resetToStatic(): void {
    if (staticOptions) {
      options.value = staticOptions
    }
  }
  
  /**
   * Filter options recommended for a specific tier
   * 
   * @param tierId - The tier ID
   * @returns Options recommended for this tier
   */
  function getRecommendedForTier(tierId: string): ServiceOption[] {
    return options.value.filter(opt => 
      !opt.recommendedFor || 
      opt.recommendedFor.length === 0 || 
      opt.recommendedFor.includes(tierId)
    )
  }
  
  return {
    // State
    options,
    isGenerating,
    generationError,
    
    // Computed
    isDynamic,
    hasRequiredAnswers,
    
    // Methods
    generateOptions,
    resetToStatic,
    getRecommendedForTier
  }
}


