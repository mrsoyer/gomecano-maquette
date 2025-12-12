import { computed } from 'vue'
import { mockServices } from '@/mocks/services'
import { 
  mechanicAdvices, 
  serviceRecommendations,
  defaultAdvice,
  defaultRecommendations
} from '@/mocks/serviceRecommendations'
import type { Service } from '@/types/service'

/**
 * Composable to get service recommendations and mechanic advice
 * 
 * @param currentServiceId - ID du service actuellement consulté
 * @returns Advice text and recommended services
 */
export function useServiceRecommendations(currentServiceId: string) {
  /**
   * Conseil personnalisé du mécanicien pour ce service
   */
  const mechanicAdvice = computed(() => 
    mechanicAdvices[currentServiceId] || defaultAdvice
  )
  
  /**
   * Liste des 3 services recommandés (objets Service complets)
   */
  const recommendations = computed<Service[]>(() => {
    const recommendedIds = serviceRecommendations[currentServiceId] || defaultRecommendations
    
    return recommendedIds
      .map(id => mockServices.find(s => s.id === id))
      .filter(Boolean) as Service[]
  })
  
  /**
   * Vérifier si des recommandations existent
   */
  const hasRecommendations = computed(() => recommendations.value.length > 0)
  
  return {
    mechanicAdvice,
    recommendations,
    hasRecommendations
  }
}
