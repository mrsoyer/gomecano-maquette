import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSubscription } from '../useSubscription'
import { supabase } from '@/services/supabase'

// Mock Supabase with RPC support
vi.mock('@/services/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
    auth: {
      getSession: vi.fn()
    }
  }
}))

// Mock fetch for Edge Function calls
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Mock import.meta.env
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_SUPABASE_URL: 'https://test.supabase.co'
    }
  }
})

describe('useSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchPlans', () => {
    it('should fetch subscription plans via RPC', async () => {
      const mockPlans = [
        {
          id: 'plan-1',
          name: 'Basic',
          slug: 'basic',
          price_monthly: 9.99,
          price_yearly: 99.99,
          features: ['Feature 1', 'Feature 2'],
          is_popular: false,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'plan-2',
          name: 'Premium',
          slug: 'premium',
          price_monthly: 19.99,
          price_yearly: 199.99,
          features: ['Feature 1', 'Feature 2', 'Feature 3'],
          is_popular: true,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z'
        }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockPlans,
        error: null
      } as never)

      const { fetchPlans, plans, error } = useSubscription()

      await fetchPlans()

      expect(plans.value).toEqual(mockPlans)
      expect(error.value).toBe(null)
      expect(supabase.rpc).toHaveBeenCalledWith('account_get_subscription_plans')
    })

    it('should handle fetch plans error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Failed to load plans' }
      } as never)

      const { fetchPlans, plans, error } = useSubscription()

      await fetchPlans()

      expect(plans.value).toEqual([])
      expect(error.value).toBe('Failed to fetch plans')
    })
  })

  describe('fetchSubscription', () => {
    it('should fetch user subscription via RPC', async () => {
      const mockSubscription = {
        id: 'sub-1',
        user_id: 'user-1',
        plan_id: 'plan-2',
        status: 'active' as const,
        current_period_start: '2024-01-01T00:00:00Z',
        current_period_end: '2024-02-01T00:00:00Z',
        cancel_at_period_end: false,
        stripe_subscription_id: 'sub_123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        plan: {
          id: 'plan-2',
          name: 'Premium',
          slug: 'premium',
          price_monthly: 19.99,
          price_yearly: 199.99,
          features: ['Feature 1', 'Feature 2'],
          is_popular: true,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z'
        }
      }

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockSubscription,
        error: null
      } as never)

      const { fetchSubscription, userSubscription, isLoading, error } = useSubscription()

      expect(isLoading.value).toBe(false)

      await fetchSubscription()

      expect(userSubscription.value).toEqual(mockSubscription)
      expect(error.value).toBe(null)
      expect(isLoading.value).toBe(false)
      expect(supabase.rpc).toHaveBeenCalledWith('account_get_user_subscription')
    })

    it('should handle null subscription (no active subscription)', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: null
      } as never)

      const { fetchSubscription, userSubscription } = useSubscription()

      await fetchSubscription()

      expect(userSubscription.value).toBe(null)
    })

    it('should handle fetch subscription error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      } as never)

      const { fetchSubscription, error } = useSubscription()

      await fetchSubscription()

      expect(error.value).toBe('Failed to fetch subscription')
    })

    it('should set loading state during fetch', async () => {
      vi.mocked(supabase.rpc).mockImplementationOnce(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({ data: null, error: null } as never), 100)
        )
      )

      const { fetchSubscription, isLoading } = useSubscription()

      const promise = fetchSubscription()
      expect(isLoading.value).toBe(true)

      await promise
      expect(isLoading.value).toBe(false)
    })
  })

  describe('computed properties', () => {
    it('currentPlan should return the plan from subscription', async () => {
      const mockPlan = {
        id: 'plan-2',
        name: 'Premium',
        slug: 'premium',
        price_monthly: 19.99,
        price_yearly: 199.99,
        features: [],
        is_popular: true,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z'
      }

      const mockSubscription = {
        id: 'sub-1',
        user_id: 'user-1',
        plan_id: 'plan-2',
        status: 'active' as const,
        current_period_start: '2024-01-01T00:00:00Z',
        current_period_end: '2024-02-01T00:00:00Z',
        cancel_at_period_end: false,
        stripe_subscription_id: 'sub_123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        plan: mockPlan
      }

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockSubscription,
        error: null
      } as never)

      const { fetchSubscription, currentPlan } = useSubscription()

      await fetchSubscription()

      expect(currentPlan.value).toEqual(mockPlan)
    })

    it('currentPlan should return null when no subscription', () => {
      const { currentPlan } = useSubscription()
      expect(currentPlan.value).toBe(null)
    })

    it('isActive should return true when subscription is active', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { status: 'active' },
        error: null
      } as never)

      const { fetchSubscription, isActive } = useSubscription()

      await fetchSubscription()

      expect(isActive.value).toBe(true)
    })

    it('isActive should return false when subscription is cancelled', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { status: 'cancelled' },
        error: null
      } as never)

      const { fetchSubscription, isActive } = useSubscription()

      await fetchSubscription()

      expect(isActive.value).toBe(false)
    })

    it('isPremium should return true for premium plan', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: {
          status: 'active',
          plan: { slug: 'premium' }
        },
        error: null
      } as never)

      const { fetchSubscription, isPremium } = useSubscription()

      await fetchSubscription()

      expect(isPremium.value).toBe(true)
    })

    it('isPremium should return true for platinum plan', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: {
          status: 'active',
          plan: { slug: 'platinum' }
        },
        error: null
      } as never)

      const { fetchSubscription, isPremium } = useSubscription()

      await fetchSubscription()

      expect(isPremium.value).toBe(true)
    })

    it('isPremium should return false for basic plan', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: {
          status: 'active',
          plan: { slug: 'basic' }
        },
        error: null
      } as never)

      const { fetchSubscription, isPremium } = useSubscription()

      await fetchSubscription()

      expect(isPremium.value).toBe(false)
    })
  })

  describe('upgrade', () => {
    it('should call Edge Function to create checkout session', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: {
          session: {
            access_token: 'test-token',
            refresh_token: 'refresh-token',
            expires_in: 3600,
            token_type: 'bearer',
            user: { id: 'user-1' }
          }
        },
        error: null
      } as never)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: 'https://checkout.stripe.com/session-123' })
      })

      const { upgrade, error } = useSubscription()

      const result = await upgrade('plan-2', 'monthly')

      expect(result.success).toBe(true)
      expect(result.checkoutUrl).toBe('https://checkout.stripe.com/session-123')
      expect(error.value).toBe(null)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/functions/v1/create-checkout-session'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
      // Verify body contains expected values
      const callArgs = mockFetch.mock.calls[0]
      const body = JSON.parse(callArgs[1].body)
      expect(body.planId).toBe('plan-2')
      expect(body.billingPeriod).toBe('monthly')
      expect(body.successUrl).toContain('/account/subscription?success=true')
      expect(body.cancelUrl).toContain('/account/subscription?cancelled=true')
    })

    it('should use yearly billing period when specified', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: {
          session: { access_token: 'test-token' }
        },
        error: null
      } as never)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: 'https://checkout.stripe.com/session-456' })
      })

      const { upgrade } = useSubscription()

      await upgrade('plan-2', 'yearly')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"billingPeriod":"yearly"')
        })
      )
    })

    it('should handle not authenticated error', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null
      } as never)

      const { upgrade, error } = useSubscription()

      const result = await upgrade('plan-2')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Not authenticated')
      expect(error.value).toBe('Not authenticated')
    })

    it('should handle Edge Function error response', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: {
          session: { access_token: 'test-token' }
        },
        error: null
      } as never)

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid plan selected' })
      })

      const { upgrade, error } = useSubscription()

      const result = await upgrade('invalid-plan')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid plan selected')
      expect(error.value).toBe('Invalid plan selected')
    })

    it('should set loading state during upgrade', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: {
          session: { access_token: 'test-token' }
        },
        error: null
      } as never)

      mockFetch.mockImplementationOnce(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ url: 'https://checkout.stripe.com/session-789' })
          }), 100)
        )
      )

      const { upgrade, isLoading } = useSubscription()

      const promise = upgrade('plan-2')
      expect(isLoading.value).toBe(true)

      await promise
      expect(isLoading.value).toBe(false)
    })
  })

  describe('cancelSubscription', () => {
    it('should cancel subscription via RPC and refresh', async () => {
      // Mock cancel RPC call
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { success: true },
        error: null
      } as never)

      // Mock refresh subscription call
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: {
          status: 'cancelled',
          cancel_at_period_end: true
        },
        error: null
      } as never)

      const { cancelSubscription, userSubscription, error } = useSubscription()

      const result = await cancelSubscription()

      expect(result.success).toBe(true)
      expect(error.value).toBe(null)
      expect(supabase.rpc).toHaveBeenCalledWith('account_cancel_subscription')
      expect(userSubscription.value?.cancel_at_period_end).toBe(true)
    })

    it('should handle cancel error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Cannot cancel - subscription already cancelled' }
      } as never)

      const { cancelSubscription, error } = useSubscription()

      const result = await cancelSubscription()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to cancel subscription')
      expect(error.value).toBe('Failed to cancel subscription')
    })

    it('should set loading state during cancellation', async () => {
      vi.mocked(supabase.rpc).mockImplementationOnce(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({ data: { success: true }, error: null } as never), 100)
        )
      )

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { status: 'cancelled' },
        error: null
      } as never)

      const { cancelSubscription, isLoading } = useSubscription()

      const promise = cancelSubscription()
      expect(isLoading.value).toBe(true)

      await promise
      expect(isLoading.value).toBe(false)
    })
  })

  describe('reactivateSubscription', () => {
    it('should reactivate subscription via RPC and refresh', async () => {
      // Mock reactivate RPC call
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { success: true },
        error: null
      } as never)

      // Mock refresh subscription call
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: {
          status: 'active',
          cancel_at_period_end: false
        },
        error: null
      } as never)

      const { reactivateSubscription, userSubscription, error } = useSubscription()

      const result = await reactivateSubscription()

      expect(result.success).toBe(true)
      expect(error.value).toBe(null)
      expect(supabase.rpc).toHaveBeenCalledWith('account_reactivate_subscription')
      expect(userSubscription.value?.status).toBe('active')
    })

    it('should handle reactivation error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Subscription has expired' }
      } as never)

      const { reactivateSubscription, error } = useSubscription()

      const result = await reactivateSubscription()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to reactivate subscription')
      expect(error.value).toBe('Failed to reactivate subscription')
    })

    it('should set loading state during reactivation', async () => {
      vi.mocked(supabase.rpc).mockImplementationOnce(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({ data: { success: true }, error: null } as never), 100)
        )
      )

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { status: 'active' },
        error: null
      } as never)

      const { reactivateSubscription, isLoading } = useSubscription()

      const promise = reactivateSubscription()
      expect(isLoading.value).toBe(true)

      await promise
      expect(isLoading.value).toBe(false)
    })
  })

  describe('initialize', () => {
    it('should fetch both plans and subscription in parallel', async () => {
      const mockPlans = [
        { id: 'plan-1', name: 'Basic', slug: 'basic' }
      ]
      const mockSubscription = {
        id: 'sub-1',
        status: 'active',
        plan: mockPlans[0]
      }

      // Both RPC calls happen in parallel
      vi.mocked(supabase.rpc)
        .mockResolvedValueOnce({ data: mockPlans, error: null } as never)
        .mockResolvedValueOnce({ data: mockSubscription, error: null } as never)

      const { initialize, plans, userSubscription } = useSubscription()

      await initialize()

      expect(plans.value).toEqual(mockPlans)
      expect(userSubscription.value).toEqual(mockSubscription)
      expect(supabase.rpc).toHaveBeenCalledTimes(2)
      expect(supabase.rpc).toHaveBeenCalledWith('account_get_subscription_plans')
      expect(supabase.rpc).toHaveBeenCalledWith('account_get_user_subscription')
    })

    it('should handle partial initialization failure', async () => {
      vi.mocked(supabase.rpc)
        .mockResolvedValueOnce({ data: [{ id: 'plan-1' }], error: null } as never)
        .mockResolvedValueOnce({ data: null, error: { message: 'No subscription' } } as never)

      const { initialize, plans, error } = useSubscription()

      await initialize()

      expect(plans.value).toHaveLength(1)
      expect(error.value).toBe('Failed to fetch subscription')
    })
  })
})
