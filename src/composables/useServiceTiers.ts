import { ref, computed, type ComputedRef } from 'vue'
import type { ServiceTier, ServiceAnswer } from '@/types/service'
import { getTierGenerationRule, hasDynamicTiers } from '@/mocks/serviceTiersOptions'

/**
 * Composable to generate and manage service tiers (price ranges)
 * 
 * Supports both:
 * - Static tiers (from service.tiers)
 * - Dynamic tiers (generated from question answers)
 * 
 * @param serviceId - The service ID
 * @param staticTiers - Static tiers from service definition (optional)
 * @param answers - Answers to required questions (for dynamic generation) - Can be ComputedRef for reactivity
 * @returns Tiers state, loading, and generation methods
 */
export function useServiceTiers(
  serviceId: string,
  staticTiers?: ServiceTier[],
  answers?: Record<string, string | number> | ComputedRef<Record<string, string | number>>
) {
  const tiers = ref<ServiceTier[]>(staticTiers || [])
  const isGenerating = ref(false)
  const generationError = ref<string | null>(null)
  
  /**
   * Check if service has dynamic tier generation
   */
  const isDynamic = computed(() => hasDynamicTiers(serviceId))
  
  /**
   * Check if all required answers are provided
   */
  const hasRequiredAnswers = computed(() => {
    if (!isDynamic.value || !answers) return true
    
    const rule = getTierGenerationRule(serviceId)
    if (!rule) return true
    
    // Unwrap ComputedRef if needed
    const answersValue = 'value' in answers ? answers.value : answers
    
    return rule.requiredAnswers.every(qId => {
      const value = answersValue[qId]
      return value !== undefined && value !== '' && value !== null
    })
  })
  
  /**
   * Generate tiers dynamically from answers
   * 
   * @param answersData - Question answers (optional, uses composable answers if not provided)
   */
  async function generateTiers(answersData?: Record<string, string | number>): Promise<void> {
    let answersToUse = answersData
    
    // If no answersData provided, use the composable's answers
    if (!answersToUse && answers) {
      // Unwrap ComputedRef if needed
      answersToUse = 'value' in answers ? answers.value : answers
    }
    
    if (!answersToUse) {
      console.warn('No answers provided for tier generation')
      return
    }
    
    const rule = getTierGenerationRule(serviceId)
    
    if (!rule) {
      console.warn(`No tier generation rule found for service: ${serviceId}`)
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
      
      // Simulate API delay (400ms comme TireBrandSelector)
      await new Promise(resolve => setTimeout(resolve, 400))
      
      // Generate tiers using rule
      const generatedTiers = rule.generator(answersToUse)
      
      tiers.value = generatedTiers
      
      console.log(`Generated ${generatedTiers.length} tiers for ${serviceId}:`, generatedTiers)
    } catch (err) {
      generationError.value = err instanceof Error ? err.message : 'Erreur génération gammes'
      console.error('Error generating tiers:', err)
    } finally {
      isGenerating.value = false
    }
  }
  
  /**
   * Reset to static tiers
   */
  function resetToStatic(): void {
    if (staticTiers) {
      tiers.value = staticTiers
    }
  }
  
  return {
    // State
    tiers,
    isGenerating,
    generationError,
    
    // Computed
    isDynamic,
    hasRequiredAnswers,
    
    // Methods
    generateTiers,
    resetToStatic
  }
}


