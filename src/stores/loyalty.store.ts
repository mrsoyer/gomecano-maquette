import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'

export interface Tier {
  id: string
  name: string
  slug: string
  color: string | null
  icon: string | null
  minPoints: number
  benefits: unknown
}

export interface Reward {
  id: string
  title: string
  description: string | null
  pointsRequired: number
  rewardType: string
  rewardValue: unknown
  isActive: boolean
  validUntil: string | null
}

export interface Redemption {
  id: string
  accountId: string
  rewardId: string
  pointsSpent: number
  status: 'pending' | 'completed' | 'cancelled'
  code: string | null
  usedAt: string | null
  createdAt: string
  reward?: Reward
}

export interface Transaction {
  id: string
  accountId: string
  type: 'earning' | 'redemption' | 'adjustment' | 'expiry'
  points: number
  description: string | null
  referenceType: string | null
  referenceId: string | null
  createdAt: string
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

interface LoyaltyAccount {
  id: string
  userId: string
  points: number
  tierId: string | null
  referralCode: string | null
  referralsCount: number
}

/**
 * Loyalty store - Manages loyalty program via Supabase RPC
 */
export const useLoyaltyStore = defineStore('loyalty', () => {
  // State
  const account = ref<LoyaltyAccount | null>(null)
  const tiers = ref<Tier[]>([])
  const rewards = ref<Reward[]>([])
  const redemptions = ref<Redemption[]>([])
  const transactions = ref<Transaction[]>([])
  const missions = ref<Mission[]>([])
  const badges = ref<Badge[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const points = computed(() => account.value?.points || 0)
  const referralCode = computed(() => account.value?.referralCode || '')
  const referralsCount = computed(() => account.value?.referralsCount || 0)

  const currentTier = computed(() => {
    if (!tiers.value.length) return null
    return tiers.value.reduce((current, tier) => {
      return points.value >= tier.minPoints ? tier : current
    }, tiers.value[0])
  })

  const nextTier = computed(() => {
    if (!currentTier.value || !tiers.value.length) return null
    const currentIndex = tiers.value.findIndex(t => t.id === currentTier.value?.id)
    return currentIndex < tiers.value.length - 1 ? tiers.value[currentIndex + 1] : null
  })

  const pointsToNextTier = computed(() => {
    if (!nextTier.value) return 0
    return nextTier.value.minPoints - points.value
  })

  const availableRewards = computed(() =>
    rewards.value.filter(r => r.pointsRequired <= points.value && r.isActive)
  )

  const claimedRewards = computed(() =>
    redemptions.value.filter(r => r.status === 'completed')
  )

  /**
   * Fetch loyalty tiers via RPC
   */
  async function fetchTiers(): Promise<void> {
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('account_get_loyalty_tiers')

      if (fetchError) throw fetchError

      tiers.value = (data || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        name: row.name as string,
        slug: row.slug as string,
        color: row.color as string | null,
        icon: row.icon as string | null,
        minPoints: row.min_points as number,
        benefits: row.benefits
      }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch tiers'
      console.error('Error fetching tiers:', err)
    }
  }

  /**
   * Fetch loyalty account via RPC
   */
  async function fetchLoyaltyAccount(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('account_get_loyalty_account')

      if (fetchError) throw fetchError

      if (data) {
        account.value = {
          id: data.id,
          userId: data.user_id,
          points: data.points,
          tierId: data.tier_id,
          referralCode: data.referral_code,
          referralsCount: data.referrals_count
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch loyalty account'
      console.error('Error fetching loyalty account:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch available rewards via RPC
   */
  async function fetchRewards(): Promise<void> {
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('account_get_loyalty_rewards')

      if (fetchError) throw fetchError

      rewards.value = (data || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        title: row.title as string,
        description: row.description as string | null,
        pointsRequired: row.points_required as number,
        rewardType: row.reward_type as string,
        rewardValue: row.reward_value,
        isActive: row.is_active as boolean,
        validUntil: row.valid_until as string | null
      }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch rewards'
      console.error('Error fetching rewards:', err)
    }
  }

  /**
   * Fetch user redemptions via RPC
   */
  async function fetchRedemptions(): Promise<void> {
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('account_get_loyalty_redemptions')

      if (fetchError) throw fetchError

      redemptions.value = (data || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        accountId: row.account_id as string,
        rewardId: row.reward_id as string,
        pointsSpent: row.points_spent as number,
        status: row.status as 'pending' | 'completed' | 'cancelled',
        code: row.code as string | null,
        usedAt: row.used_at as string | null,
        createdAt: row.created_at as string
      }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch redemptions'
      console.error('Error fetching redemptions:', err)
    }
  }

  /**
   * Fetch transactions history via RPC
   */
  async function fetchTransactions(limit = 50): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('account_get_loyalty_transactions', { p_limit: limit })

      if (fetchError) throw fetchError

      transactions.value = (data || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        accountId: row.account_id as string,
        type: row.type as 'earning' | 'redemption' | 'adjustment' | 'expiry',
        points: row.points as number,
        description: row.description as string | null,
        referenceType: row.reference_type as string | null,
        referenceId: row.reference_id as string | null,
        createdAt: row.created_at as string
      }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch transactions'
      console.error('Error fetching transactions:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch missions via RPC
   */
  async function fetchMissions(): Promise<void> {
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('account_get_loyalty_missions')

      if (fetchError) throw fetchError

      missions.value = (data || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        title: row.title as string,
        description: row.description as string,
        points: row.points as number,
        progress: row.progress as number,
        target: row.target as number,
        completed: row.completed as boolean,
        type: row.type as 'booking' | 'review' | 'referral' | 'profile'
      }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch missions'
      console.error('Error fetching missions:', err)
    }
  }

  /**
   * Fetch badges via RPC
   */
  async function fetchBadges(): Promise<void> {
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('account_get_loyalty_badges')

      if (fetchError) throw fetchError

      badges.value = (data || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        name: row.name as string,
        description: row.description as string,
        icon: row.icon as string,
        unlocked: row.unlocked as boolean,
        unlockedAt: row.unlocked_at as string | undefined,
        rarity: row.rarity as 'common' | 'rare' | 'epic' | 'legendary'
      }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch badges'
      console.error('Error fetching badges:', err)
    }
  }

  /**
   * Fetch all loyalty data
   */
  async function fetchLoyaltyData(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await fetchTiers()
      await Promise.all([
        fetchLoyaltyAccount(),
        fetchRewards(),
        fetchRedemptions(),
        fetchTransactions(),
        fetchMissions(),
        fetchBadges()
      ])
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch loyalty data'
      console.error('Error fetching loyalty data:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Redeem a reward via RPC
   */
  async function redeemReward(rewardId: string): Promise<boolean> {
    if (!account.value) {
      error.value = 'No loyalty account found'
      return false
    }

    isLoading.value = true
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
      isLoading.value = false
    }
  }

  /**
   * Add points via RPC
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
   * Initialize loyalty store
   */
  async function initialize(): Promise<void> {
    await fetchLoyaltyData()
  }

  return {
    // State
    account,
    tiers,
    rewards,
    redemptions,
    transactions,
    missions,
    badges,
    isLoading,
    error,

    // Getters
    points,
    referralCode,
    referralsCount,
    currentTier,
    nextTier,
    pointsToNextTier,
    availableRewards,
    claimedRewards,

    // Actions
    fetchTiers,
    fetchLoyaltyAccount,
    fetchRewards,
    fetchRedemptions,
    fetchTransactions,
    fetchMissions,
    fetchBadges,
    fetchLoyaltyData,
    redeemReward,
    addPoints,
    initialize
  }
})
