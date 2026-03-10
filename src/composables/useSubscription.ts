import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'

interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  price_monthly: number
  price_yearly: number
  features: string[]
  is_popular: boolean
  is_active: boolean
  created_at: string
}

interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  status: 'active' | 'cancelled' | 'expired' | 'past_due'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
  plan?: SubscriptionPlan
}

/**
 * Composable for subscription management
 * Uses Supabase RPC functions with built-in RLS
 */
export function useSubscription() {
  const plans = ref<SubscriptionPlan[]>([])
  const userSubscription = ref<UserSubscription | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const currentPlan = computed(() => userSubscription.value?.plan || null)

  const isActive = computed(() =>
    userSubscription.value?.status === 'active'
  )

  const isPremium = computed(() =>
    currentPlan.value?.slug === 'premium' || currentPlan.value?.slug === 'platinum'
  )

  /**
   * Fetch available subscription plans via RPC
   */
  async function fetchPlans(): Promise<void> {
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('account_get_subscription_plans')

      if (fetchError) throw fetchError
      plans.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch plans'
    }
  }

  /**
   * Fetch user's current subscription via RPC
   */
  async function fetchSubscription(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('account_get_user_subscription')

      if (fetchError) throw fetchError
      userSubscription.value = data as UserSubscription | null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch subscription'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Upgrade subscription via Edge Function (Stripe checkout)
   */
  async function upgrade(
    planId: string,
    billingPeriod: 'monthly' | 'yearly' = 'monthly'
  ): Promise<{ success: boolean; checkoutUrl?: string; error?: string }> {
    isLoading.value = true
    error.value = null

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`
          },
          body: JSON.stringify({
            planId,
            billingPeriod,
            successUrl: `${window.location.origin}/account/subscription?success=true`,
            cancelUrl: `${window.location.origin}/account/subscription?cancelled=true`
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const result = await response.json()
      return { success: true, checkoutUrl: result.url }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to upgrade subscription'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Cancel subscription via RPC
   */
  async function cancelSubscription(): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true
    error.value = null

    try {
      const { error: cancelError } = await supabase
        .rpc('account_cancel_subscription')

      if (cancelError) throw cancelError

      // Refresh subscription
      await fetchSubscription()

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to cancel subscription'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reactivate a cancelled subscription via RPC
   */
  async function reactivateSubscription(): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true
    error.value = null

    try {
      const { error: reactivateError } = await supabase
        .rpc('account_reactivate_subscription')

      if (reactivateError) throw reactivateError

      // Refresh subscription
      await fetchSubscription()

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to reactivate subscription'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Initialize subscription data
   */
  async function initialize(): Promise<void> {
    await Promise.all([
      fetchPlans(),
      fetchSubscription()
    ])
  }

  return {
    // State
    plans,
    userSubscription,
    isLoading,
    error,

    // Computed
    currentPlan,
    isActive,
    isPremium,

    // Methods
    fetchPlans,
    fetchSubscription,
    upgrade,
    cancelSubscription,
    reactivateSubscription,
    initialize
  }
}
