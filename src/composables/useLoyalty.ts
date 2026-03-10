import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'

interface LoyaltyAccount {
  id: string
  user_id: string
  points: number
  tier_id: string | null
  referral_code: string | null
  referrals_count: number
  created_at: string
  updated_at: string
}

interface LoyaltyTransaction {
  id: string
  account_id: string
  type: 'earning' | 'redemption' | 'adjustment' | 'expiry'
  points: number
  description: string | null
  reference_type: string | null
  reference_id: string | null
  created_at: string
}

interface LoyaltyReward {
  id: string
  title: string
  description: string | null
  points_required: number
  reward_type: string
  reward_value: unknown
  is_active: boolean
  valid_until: string | null
  created_at: string
}

interface LoyaltyTier {
  id: string
  name: string
  slug: string
  min_points: number
  benefits: unknown
  color: string | null
  icon: string | null
  created_at: string
}

interface LoyaltyRedemption {
  id: string
  account_id: string
  reward_id: string
  points_spent: number
  status: 'pending' | 'completed' | 'cancelled'
  code: string | null
  used_at: string | null
  created_at: string
  reward?: LoyaltyReward
}

export interface Mission {
  id: string
  title: string
  description: string
  points: number
  progress: number
  target: number
  completed: boolean
  type: 'booking' | 'review' | 'referral' | 'profile'
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

/**
 * Composable for loyalty program management
 *
 * Provides functionality to manage loyalty points, rewards, tiers, and gamification
 * Uses Supabase RPC functions with built-in RLS
 */
export function useLoyalty() {
  const account = ref<LoyaltyAccount | null>(null)
  const transactions = ref<LoyaltyTransaction[]>([])
  const rewards = ref<LoyaltyReward[]>([])
  const tiers = ref<LoyaltyTier[]>([])
  const redemptions = ref<LoyaltyRedemption[]>([])
  const missions = ref<Mission[]>([])
  const badges = ref<Badge[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const points = computed(() => account.value?.points || 0)
  const referralCode = computed(() => account.value?.referral_code || '')
  const referralsCount = computed(() => account.value?.referrals_count || 0)

  const currentTier = computed(() => {
    if (!account.value || !tiers.value.length) return null
    return tiers.value.reduce((current, tier) => {
      return points.value >= tier.min_points ? tier : current
    }, tiers.value[0])
  })

  const nextTier = computed(() => {
    if (!currentTier.value || !tiers.value.length) return null
    const currentIndex = tiers.value.findIndex(t => t.id === currentTier.value?.id)
    return currentIndex < tiers.value.length - 1 ? tiers.value[currentIndex + 1] : null
  })

  const pointsToNextTier = computed(() => {
    if (!nextTier.value) return 0
    return nextTier.value.min_points - points.value
  })

  const availableRewards = computed(() =>
    rewards.value.filter(r => r.points_required <= points.value && r.is_active)
  )

  const claimedRewards = computed(() =>
    redemptions.value.filter(r => r.status === 'completed')
  )

  /**
   * Fetch loyalty account for current user via RPC
   * Auto-creates account if it doesn't exist
   */
  async function fetchLoyaltyAccount(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('account_get_loyalty_account')

      if (fetchError) throw fetchError
      account.value = data as LoyaltyAccount
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch loyalty account'
      console.error('Error fetching loyalty account:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch all loyalty tiers via RPC
   */
  async function fetchTiers(): Promise<void> {
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('account_get_loyalty_tiers')

      if (fetchError) throw fetchError
      tiers.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch tiers'
      console.error('Error fetching tiers:', err)
    }
  }

  /**
   * Fetch user's loyalty transactions via RPC
   */
  async function fetchTransactions(limit = 50): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('account_get_loyalty_transactions', { p_limit: limit })

      if (fetchError) throw fetchError
      transactions.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch transactions'
      console.error('Error fetching transactions:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch available loyalty rewards via RPC
   */
  async function fetchRewards(): Promise<void> {
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('account_get_loyalty_rewards')

      if (fetchError) throw fetchError
      rewards.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch rewards'
      console.error('Error fetching rewards:', err)
    }
  }

  /**
   * Fetch user's reward redemptions via RPC
   */
  async function fetchRedemptions(): Promise<void> {
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('account_get_loyalty_redemptions')

      if (fetchError) throw fetchError
      redemptions.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch redemptions'
      console.error('Error fetching redemptions:', err)
    }
  }

  /**
   * Redeem a reward with points via RPC
   */
  async function redeemReward(rewardId: string): Promise<boolean> {
    if (!account.value) {
      error.value = 'No loyalty account found'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: redeemError } = await supabase
        .rpc('account_redeem_loyalty_reward', {
          p_reward_id: rewardId
        })

      if (redeemError) throw redeemError

      // Refresh data
      await Promise.all([
        fetchLoyaltyAccount(),
        fetchTransactions(),
        fetchRedemptions()
      ])

      return data?.success ?? true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to redeem reward'
      console.error('Error redeeming reward:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Add points via RPC (with automatic tier check)
   */
  async function addPoints(
    amount: number,
    description: string,
    referenceType?: string,
    referenceId?: string
  ): Promise<boolean> {
    if (!account.value) {
      error.value = 'No loyalty account found'
      return false
    }

    try {
      const { data, error: addError } = await supabase
        .rpc('account_add_loyalty_points', {
          p_amount: amount,
          p_description: description,
          p_ref_type: referenceType || null,
          p_ref_id: referenceId || null
        })

      if (addError) throw addError

      // Refresh data
      await Promise.all([
        fetchLoyaltyAccount(),
        fetchTransactions()
      ])

      return data?.success ?? true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add points'
      console.error('Error adding points:', err)
      return false
    }
  }

  /**
   * Check and apply tier upgrade if eligible
   * Now handled automatically by account_add_loyalty_points RPC
   */
  async function checkTierUpgrade(): Promise<void> {
    // Tier upgrade is now handled automatically by the RPC function
    // This function is kept for backward compatibility
    await fetchLoyaltyAccount()
  }

  /**
   * Initialize loyalty data
   */
  async function initialize(): Promise<void> {
    await fetchTiers()
    await Promise.all([
      fetchLoyaltyAccount(),
      fetchRewards(),
      fetchTransactions(),
      fetchRedemptions()
    ])
  }

  return {
    // State
    account,
    transactions,
    rewards,
    tiers,
    redemptions,
    missions,
    badges,
    loading,
    error,

    // Computed
    points,
    referralCode,
    referralsCount,
    currentTier,
    nextTier,
    pointsToNextTier,
    availableRewards,
    claimedRewards,

    // Methods
    fetchLoyaltyAccount,
    fetchTiers,
    fetchTransactions,
    fetchRewards,
    fetchRedemptions,
    redeemReward,
    addPoints,
    checkTierUpgrade,
    initialize
  }
}
