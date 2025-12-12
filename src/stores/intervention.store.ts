import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Intervention } from '@/types/account'
import {
  getInterventionsByUser,
  getActiveInterventions,
  getUpcomingInterventions,
  getRecentInterventions
} from '@/mocks/interventions'

/**
 * Intervention Store - Manages user interventions
 */
export const useInterventionStore = defineStore('intervention', () => {
  // State
  const currentIntervention = ref<Intervention | null>(null)
  const userInterventions = ref<Intervention[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasActiveIntervention = computed(() =>
    userInterventions.value.some(i =>
      ['en_route', 'sur_place', 'en_cours'].includes(i.status)
    )
  )

  const activeIntervention = computed(() =>
    userInterventions.value.find(i =>
      ['en_route', 'sur_place', 'en_cours'].includes(i.status)
    ) || null
  )

  const upcomingInterventions = computed(() =>
    userInterventions.value.filter(i =>
      ['scheduled', 'confirmed'].includes(i.status)
    )
  )

  const upcomingInterventionsCount = computed(() => upcomingInterventions.value.length)

  const recentInterventions = computed(() =>
    userInterventions.value
      .filter(i => i.status === 'termine')
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
      .slice(0, 5)
  )

  const completedInterventionsCount = computed(() =>
    userInterventions.value.filter(i => i.status === 'termine').length
  )

  const totalSpentYear = computed(() => {
    const currentYear = new Date().getFullYear()
    return userInterventions.value
      .filter(i => {
        const year = new Date(i.scheduledAt).getFullYear()
        return year === currentYear && i.invoice
      })
      .reduce((sum, i) => sum + (i.invoice?.totalTTC || 0), 0)
  })

  /**
   * Fetch interventions for user
   * 
   * @param userId - User ID
   */
  async function fetchInterventions(userId: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400))

      userInterventions.value = getInterventionsByUser(userId)

      console.log('[Interventions] Fetched:', userInterventions.value.length)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fetch failed'
      console.error('[Interventions] Fetch error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Set current intervention (for detail view)
   * 
   * @param intervention - Intervention to set as current
   */
  function setCurrentIntervention(intervention: Intervention | null): void {
    currentIntervention.value = intervention
  }

  /**
   * Update intervention status
   * 
   * @param interventionId - Intervention ID
   * @param status - New status
   */
  async function updateInterventionStatus(
    interventionId: string,
    status: Intervention['status']
  ): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))

      const intervention = userInterventions.value.find(i => i.id === interventionId)
      if (intervention) {
        intervention.status = status
        
        if (currentIntervention.value?.id === interventionId) {
          currentIntervention.value.status = status
        }
      }

      console.log('[Interventions] Status updated:', interventionId, status)
    } catch (err) {
      console.error('[Interventions] Update error:', err)
    }
  }

  /**
   * Get next upcoming intervention
   */
  const nextIntervention = computed(() => {
    if (upcomingInterventions.value.length === 0) return null
    
    return upcomingInterventions.value
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0]
  })

  /**
   * Get next intervention date formatted
   */
  const nextInterventionDate = computed(() => {
    if (!nextIntervention.value) return null
    
    const date = new Date(nextIntervention.value.scheduledAt)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  })

  return {
    // State
    currentIntervention,
    userInterventions,
    isLoading,
    error,

    // Getters
    hasActiveIntervention,
    activeIntervention,
    upcomingInterventions,
    upcomingInterventionsCount,
    recentInterventions,
    completedInterventionsCount,
    totalSpentYear,
    nextIntervention,
    nextInterventionDate,

    // Actions
    fetchInterventions,
    setCurrentIntervention,
    updateInterventionStatus
  }
})
