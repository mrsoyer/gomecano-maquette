import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useLoyalty } from '../useLoyalty'
import { supabase } from '@/services/supabase'

// Mock Supabase with RPC support
vi.mock('@/services/supabase', () => ({
  supabase: {
    rpc: vi.fn()
  }
}))

describe('useLoyalty', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchLoyaltyAccount', () => {
    it('should fetch loyalty account via RPC', async () => {
      const mockAccount = {
        id: 'account-1',
        user_id: 'user-123',
        points: 450,
        tier_id: 'silver',
        referral_code: 'ABC123',
        referrals_count: 3,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockAccount,
        error: null
      } as never)

      const { fetchLoyaltyAccount, account, points, referralCode, referralsCount } = useLoyalty()

      await fetchLoyaltyAccount()

      expect(supabase.rpc).toHaveBeenCalledWith('account_get_loyalty_account')
      expect(account.value).toEqual(mockAccount)
      expect(points.value).toBe(450)
      expect(referralCode.value).toBe('ABC123')
      expect(referralsCount.value).toBe(3)
    })

    it('should handle fetch error gracefully', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error', code: 'PGRST301' }
      } as never)

      const { fetchLoyaltyAccount, error, account } = useLoyalty()

      await fetchLoyaltyAccount()

      expect(error.value).toBe('Failed to fetch loyalty account')
      expect(account.value).toBe(null)
    })

    it('should set loading state during fetch', async () => {
      vi.mocked(supabase.rpc).mockImplementationOnce(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({ data: null, error: null } as never), 100)
        )
      )

      const { fetchLoyaltyAccount, loading } = useLoyalty()

      const fetchPromise = fetchLoyaltyAccount()
      expect(loading.value).toBe(true)

      await fetchPromise
      expect(loading.value).toBe(false)
    })
  })

  describe('fetchTiers', () => {
    it('should fetch loyalty tiers via RPC', async () => {
      const mockTiers = [
        { id: 'bronze', name: 'Bronze', slug: 'bronze', min_points: 0 },
        { id: 'silver', name: 'Silver', slug: 'silver', min_points: 500 },
        { id: 'gold', name: 'Gold', slug: 'gold', min_points: 1000 }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockTiers,
        error: null
      } as never)

      const { fetchTiers, tiers } = useLoyalty()

      await fetchTiers()

      expect(supabase.rpc).toHaveBeenCalledWith('account_get_loyalty_tiers')
      expect(tiers.value).toEqual(mockTiers)
    })

    it('should handle empty tiers list', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [],
        error: null
      } as never)

      const { fetchTiers, tiers } = useLoyalty()

      await fetchTiers()

      expect(tiers.value).toEqual([])
    })
  })

  describe('fetchTransactions', () => {
    it('should fetch transactions via RPC with default limit', async () => {
      const mockTransactions = [
        {
          id: 'tx-1',
          account_id: 'account-1',
          type: 'earning',
          points: 100,
          description: 'Service completed',
          created_at: '2024-01-15T00:00:00Z'
        },
        {
          id: 'tx-2',
          account_id: 'account-1',
          type: 'redemption',
          points: -50,
          description: 'Reward redeemed',
          created_at: '2024-01-10T00:00:00Z'
        }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockTransactions,
        error: null
      } as never)

      const { fetchTransactions, transactions } = useLoyalty()

      await fetchTransactions()

      expect(supabase.rpc).toHaveBeenCalledWith('account_get_loyalty_transactions', { p_limit: 50 })
      expect(transactions.value).toEqual(mockTransactions)
    })

    it('should fetch transactions with custom limit', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [],
        error: null
      } as never)

      const { fetchTransactions } = useLoyalty()

      await fetchTransactions(10)

      expect(supabase.rpc).toHaveBeenCalledWith('account_get_loyalty_transactions', { p_limit: 10 })
    })
  })

  describe('fetchRewards', () => {
    it('should fetch available rewards via RPC', async () => {
      const mockRewards = [
        {
          id: 'reward-1',
          title: 'Discount 10€',
          description: '10€ off your next service',
          points_required: 200,
          reward_type: 'discount',
          is_active: true
        },
        {
          id: 'reward-2',
          title: 'Free oil change',
          description: null,
          points_required: 500,
          reward_type: 'service',
          is_active: true
        }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockRewards,
        error: null
      } as never)

      const { fetchRewards, rewards } = useLoyalty()

      await fetchRewards()

      expect(supabase.rpc).toHaveBeenCalledWith('account_get_loyalty_rewards')
      expect(rewards.value).toEqual(mockRewards)
    })
  })

  describe('fetchRedemptions', () => {
    it('should fetch user redemptions via RPC', async () => {
      const mockRedemptions = [
        {
          id: 'red-1',
          account_id: 'account-1',
          reward_id: 'reward-1',
          points_spent: 200,
          status: 'completed',
          code: 'DISC10-ABC',
          created_at: '2024-01-20T00:00:00Z'
        }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockRedemptions,
        error: null
      } as never)

      const { fetchRedemptions, redemptions } = useLoyalty()

      await fetchRedemptions()

      expect(supabase.rpc).toHaveBeenCalledWith('account_get_loyalty_redemptions')
      expect(redemptions.value).toEqual(mockRedemptions)
    })
  })

  describe('points computed', () => {
    it('should return 0 if no account', () => {
      const { points, account } = useLoyalty()

      expect(account.value).toBe(null)
      expect(points.value).toBe(0)
    })

    it('should return account points when loaded', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { id: 'acc-1', points: 750 },
        error: null
      } as never)

      const { fetchLoyaltyAccount, points } = useLoyalty()

      await fetchLoyaltyAccount()

      expect(points.value).toBe(750)
    })
  })

  describe('currentTier and nextTier', () => {
    it('should calculate current tier based on points', async () => {
      const mockTiers = [
        { id: 'bronze', name: 'Bronze', slug: 'bronze', min_points: 0 },
        { id: 'silver', name: 'Silver', slug: 'silver', min_points: 500 },
        { id: 'gold', name: 'Gold', slug: 'gold', min_points: 1000 }
      ]

      const mockAccount = { id: 'acc-1', points: 750 }

      // Mock fetchTiers
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockTiers,
        error: null
      } as never)

      // Mock fetchLoyaltyAccount
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockAccount,
        error: null
      } as never)

      const { fetchTiers, fetchLoyaltyAccount, currentTier, nextTier, pointsToNextTier } = useLoyalty()

      await fetchTiers()
      await fetchLoyaltyAccount()

      expect(currentTier.value).toEqual(mockTiers[1]) // Silver (500 points)
      expect(nextTier.value).toEqual(mockTiers[2]) // Gold (1000 points)
      expect(pointsToNextTier.value).toBe(250) // 1000 - 750
    })

    it('should return null for nextTier when at max tier', async () => {
      const mockTiers = [
        { id: 'bronze', name: 'Bronze', slug: 'bronze', min_points: 0 },
        { id: 'gold', name: 'Gold', slug: 'gold', min_points: 1000 }
      ]

      const mockAccount = { id: 'acc-1', points: 1500 }

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockTiers,
        error: null
      } as never)

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockAccount,
        error: null
      } as never)

      const { fetchTiers, fetchLoyaltyAccount, currentTier, nextTier, pointsToNextTier } = useLoyalty()

      await fetchTiers()
      await fetchLoyaltyAccount()

      expect(currentTier.value).toEqual(mockTiers[1]) // Gold
      expect(nextTier.value).toBe(null)
      expect(pointsToNextTier.value).toBe(0)
    })

    it('should return null for currentTier when no tiers loaded', () => {
      const { currentTier, nextTier } = useLoyalty()

      expect(currentTier.value).toBe(null)
      expect(nextTier.value).toBe(null)
    })
  })

  describe('availableRewards', () => {
    it('should filter rewards based on points and active status', async () => {
      const mockRewards = [
        { id: 'r1', title: 'Cheap', points_required: 100, is_active: true },
        { id: 'r2', title: 'Medium', points_required: 300, is_active: true },
        { id: 'r3', title: 'Expensive', points_required: 500, is_active: true },
        { id: 'r4', title: 'Inactive', points_required: 50, is_active: false }
      ]

      const mockAccount = { id: 'acc-1', points: 250 }

      // Mock fetchRewards
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockRewards,
        error: null
      } as never)

      // Mock fetchLoyaltyAccount
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockAccount,
        error: null
      } as never)

      const { fetchRewards, fetchLoyaltyAccount, availableRewards } = useLoyalty()

      await fetchRewards()
      await fetchLoyaltyAccount()

      expect(availableRewards.value).toHaveLength(1)
      expect(availableRewards.value[0].id).toBe('r1')
    })
  })

  describe('claimedRewards', () => {
    it('should filter redemptions with completed status', async () => {
      const mockRedemptions = [
        { id: 'red-1', status: 'completed', points_spent: 100 },
        { id: 'red-2', status: 'pending', points_spent: 200 },
        { id: 'red-3', status: 'completed', points_spent: 150 },
        { id: 'red-4', status: 'cancelled', points_spent: 50 }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockRedemptions,
        error: null
      } as never)

      const { fetchRedemptions, claimedRewards } = useLoyalty()

      await fetchRedemptions()

      expect(claimedRewards.value).toHaveLength(2)
      expect(claimedRewards.value.map(r => r.id)).toEqual(['red-1', 'red-3'])
    })
  })

  describe('redeemReward', () => {
    it('should redeem reward via RPC', async () => {
      // First load account
      const mockAccount = { id: 'acc-1', points: 500 }
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockAccount,
        error: null
      } as never)

      // Mock redeem RPC call
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { success: true, redemption_id: 'red-1', remaining_points: 300 },
        error: null
      } as never)

      // Mock refresh calls (account, transactions, redemptions)
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [],
        error: null
      } as never)

      const { fetchLoyaltyAccount, redeemReward } = useLoyalty()

      await fetchLoyaltyAccount()
      const result = await redeemReward('reward-1')

      expect(result).toBe(true)
      expect(supabase.rpc).toHaveBeenCalledWith('account_redeem_loyalty_reward', {
        p_reward_id: 'reward-1'
      })
    })

    it('should fail if no account loaded', async () => {
      const { redeemReward, error } = useLoyalty()

      const result = await redeemReward('reward-1')

      expect(result).toBe(false)
      expect(error.value).toBe('No loyalty account found')
    })

    it('should handle redemption error', async () => {
      // Load account first
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { id: 'acc-1', points: 100 },
        error: null
      } as never)

      // Mock redeem error
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Insufficient points' }
      } as never)

      const { fetchLoyaltyAccount, redeemReward, error } = useLoyalty()

      await fetchLoyaltyAccount()
      const result = await redeemReward('reward-1')

      expect(result).toBe(false)
      expect(error.value).toBe('Failed to redeem reward')
    })
  })

  describe('addPoints', () => {
    it('should add points via RPC', async () => {
      // Load account first
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { id: 'acc-1', points: 100 },
        error: null
      } as never)

      // Mock addPoints RPC
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { success: true, new_points: 150, tier_upgraded: false },
        error: null
      } as never)

      // Mock refresh calls
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [],
        error: null
      } as never)

      const { fetchLoyaltyAccount, addPoints } = useLoyalty()

      await fetchLoyaltyAccount()
      const result = await addPoints(50, 'Service completed', 'appointment', 'apt-123')

      expect(result).toBe(true)
      expect(supabase.rpc).toHaveBeenCalledWith('account_add_loyalty_points', {
        p_amount: 50,
        p_description: 'Service completed',
        p_ref_type: 'appointment',
        p_ref_id: 'apt-123'
      })
    })

    it('should add points without reference', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { id: 'acc-1', points: 100 },
        error: null
      } as never)

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { success: true },
        error: null
      } as never)

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [],
        error: null
      } as never)

      const { fetchLoyaltyAccount, addPoints } = useLoyalty()

      await fetchLoyaltyAccount()
      await addPoints(25, 'Bonus points')

      expect(supabase.rpc).toHaveBeenCalledWith('account_add_loyalty_points', {
        p_amount: 25,
        p_description: 'Bonus points',
        p_ref_type: null,
        p_ref_id: null
      })
    })

    it('should fail if no account loaded', async () => {
      const { addPoints, error } = useLoyalty()

      const result = await addPoints(50, 'Test')

      expect(result).toBe(false)
      expect(error.value).toBe('No loyalty account found')
    })
  })

  describe('initialize', () => {
    it('should fetch all loyalty data', async () => {
      // Mock all RPC calls in order
      // 1. fetchTiers
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [{ id: 'tier-1', name: 'Bronze' }],
        error: null
      } as never)

      // 2. fetchLoyaltyAccount
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { id: 'acc-1', points: 100 },
        error: null
      } as never)

      // 3. fetchRewards
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [],
        error: null
      } as never)

      // 4. fetchTransactions
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [],
        error: null
      } as never)

      // 5. fetchRedemptions
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [],
        error: null
      } as never)

      const { initialize, tiers, account } = useLoyalty()

      await initialize()

      expect(tiers.value).toHaveLength(1)
      expect(account.value).not.toBe(null)
      expect(supabase.rpc).toHaveBeenCalledWith('account_get_loyalty_tiers')
      expect(supabase.rpc).toHaveBeenCalledWith('account_get_loyalty_account')
      expect(supabase.rpc).toHaveBeenCalledWith('account_get_loyalty_rewards')
      expect(supabase.rpc).toHaveBeenCalledWith('account_get_loyalty_transactions', { p_limit: 50 })
      expect(supabase.rpc).toHaveBeenCalledWith('account_get_loyalty_redemptions')
    })
  })

  describe('checkTierUpgrade', () => {
    it('should refresh account data', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { id: 'acc-1', points: 600, tier_id: 'silver' },
        error: null
      } as never)

      const { checkTierUpgrade, account } = useLoyalty()

      await checkTierUpgrade()

      expect(supabase.rpc).toHaveBeenCalledWith('account_get_loyalty_account')
      expect(account.value?.tier_id).toBe('silver')
    })
  })
})
