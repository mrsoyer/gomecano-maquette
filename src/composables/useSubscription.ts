/**
 * Subscription Composable
 */

import { ref } from 'vue'
import type { SubscriptionPlan, UserSubscription } from '@/types/subscription'
import { mockSubscriptionPlans, getUserSubscription, upgradePlan } from '@/mocks/subscriptions.mock'

export function useSubscription(userId: string) {
  const plans = ref<SubscriptionPlan[]>(mockSubscriptionPlans)
  const userSubscription = ref<UserSubscription | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSubscription(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      userSubscription.value = await getUserSubscription(userId)
    } catch (err) {
      error.value = 'Erreur lors du chargement'
    } finally {
      isLoading.value = false
    }
  }

  async function upgrade(newPlan: 'premium' | 'platinum'): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      userSubscription.value = await upgradePlan(userId, newPlan)
    } catch (err) {
      error.value = 'Erreur lors de la mise à niveau'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    plans,
    userSubscription,
    isLoading,
    error,
    fetchSubscription,
    upgrade
  }
}

