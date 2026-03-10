import { ref, computed, onMounted } from 'vue'
import { mockServices } from '@/mocks/services.mock'
import { callRpc } from '@/services/supabase'
import {
  mechanicAdvices,
  serviceRecommendations,
  defaultAdvice,
  defaultRecommendations
} from '@/mocks/service-recommendations.mock'
import type { Service } from '@/types/service'

// Toggle for mock vs real data
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true'

// DB Function response type
interface RecommendationData {
  id: string
  serviceId: string
  recommendedServiceId: string
  mechanicAdvice: string | null
  priority: number
}

/**
 * Composable to get service recommendations and mechanic advice
 *
 * @description Migrated to Supabase Functions-First architecture (Session 09)
 * Uses DB Function: mod_get_recommendations
 *
 * @param currentServiceId - ID du service actuellement consulté
 * @returns Advice text and recommended services
 */
export function useServiceRecommendations(currentServiceId: string) {
  const isLoading = ref(false)
  const recommendationData = ref<RecommendationData[]>([])

  /**
   * Fetch recommendations from Supabase
   */
  async function fetchRecommendations(): Promise<void> {
    if (USE_MOCK_DATA) return

    isLoading.value = true
    try {
      const result = await callRpc<RecommendationData[]>('mod_get_recommendations', {
        p_service_id: currentServiceId
      })
      recommendationData.value = result || []
      console.log('[Recommendations] Loaded', recommendationData.value.length, 'recommendations')
    } catch (err) {
      console.error('[Recommendations] Error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Conseil personnalisé du mécanicien pour ce service
   */
  const mechanicAdvice = computed(() => {
    if (USE_MOCK_DATA) {
      return mechanicAdvices[currentServiceId] || defaultAdvice
    }

    // Find first recommendation with mechanic advice
    const withAdvice = recommendationData.value.find(r => r.mechanicAdvice)
    return withAdvice?.mechanicAdvice || defaultAdvice
  })

  /**
   * Liste des 3 services recommandés (objets Service complets)
   */
  const recommendations = computed<Service[]>(() => {
    if (USE_MOCK_DATA) {
      const recommendedIds = serviceRecommendations[currentServiceId] || defaultRecommendations
      return recommendedIds
        .map(id => mockServices.find(s => s.id === id))
        .filter(Boolean) as Service[]
    }

    // Map recommendation IDs to Service objects
    return recommendationData.value
      .map(r => mockServices.find(s => s.id === r.recommendedServiceId))
      .filter(Boolean) as Service[]
  })

  /**
   * Vérifier si des recommandations existent
   */
  const hasRecommendations = computed(() => recommendations.value.length > 0)

  // Auto-fetch on mount if using Supabase
  onMounted(() => {
    if (!USE_MOCK_DATA) {
      fetchRecommendations()
    }
  })

  return {
    mechanicAdvice,
    recommendations,
    hasRecommendations,
    isLoading,
    refetch: fetchRecommendations
  }
}
