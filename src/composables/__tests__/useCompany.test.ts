import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the modules before importing the composable
vi.mock('@/services/supabase', () => ({
  supabase: {
    rpc: vi.fn()
  }
}))

vi.mock('@/mocks/companies.mock', () => ({
  getCompanyById: vi.fn((id: string) => {
    if (id === 'company-1') {
      return {
        id: 'company-1',
        name: 'Test Transport SARL',
        siret: '12345678901234',
        subscription: {
          plan: 'pro',
          status: 'active',
          maxVehicles: 50,
          maxUsers: 10
        },
        sites: [
          { id: 'site-1', name: 'Site Paris', vehiclesCount: 10 },
          { id: 'site-2', name: 'Site Lyon', vehiclesCount: 5 }
        ],
        users: [
          { id: 'user-1', email: 'admin@test.com' },
          { id: 'user-2', email: 'manager@test.com' }
        ],
        settings: {
          autoApproveUnder: 500,
          requiresApproval: true,
          emailNotifications: true,
          smsNotifications: false,
          maintenanceAlerts: true
        }
      }
    }
    return null
  })
}))

vi.mock('@/utils/b2b-transforms', () => ({
  transformCompanyFromDB: vi.fn((data) => ({
    id: data.id,
    name: data.name,
    siret: data.siret,
    subscription: {
      plan: data.subscription_plan,
      status: data.subscription_status,
      maxVehicles: data.max_vehicles,
      maxUsers: data.max_users
    },
    sites: data.sites || [],
    users: data.users || [],
    settings: {
      autoApproveUnder: data.auto_approve_under,
      requiresApproval: data.requires_approval,
      emailNotifications: data.email_notifications,
      smsNotifications: data.sms_notifications,
      maintenanceAlerts: data.maintenance_alerts
    }
  }))
}))

import { supabase } from '@/services/supabase'
import { getCompanyById } from '@/mocks/companies.mock'

describe('useCompany', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('with mock data (default)', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_USE_MOCK_DATA', 'true')
    })

    it('should fetch company from mock data', async () => {
      const { useCompany } = await import('../useCompany')
      const { company, fetchCompany, loading, error } = useCompany()

      expect(company.value).toBeNull()
      expect(loading.value).toBe(false)

      await fetchCompany('company-1')

      expect(getCompanyById).toHaveBeenCalledWith('company-1')
      expect(supabase.rpc).not.toHaveBeenCalled()
      expect(company.value).not.toBeNull()
      expect(company.value?.name).toBe('Test Transport SARL')
      expect(error.value).toBeNull()
    })

    it('should handle company not found', async () => {
      const { useCompany } = await import('../useCompany')
      const { error, fetchCompany } = useCompany()

      await fetchCompany('non-existent')

      expect(error.value).toBe('Company not found')
    })

    it('should compute isLoaded correctly', async () => {
      const { useCompany } = await import('../useCompany')
      const { isLoaded, fetchCompany } = useCompany()

      expect(isLoaded.value).toBe(false)

      await fetchCompany('company-1')

      expect(isLoaded.value).toBe(true)
    })

    it('should compute subscription getters correctly', async () => {
      const { useCompany } = await import('../useCompany')
      const {
        fetchCompany,
        subscriptionPlan,
        isSubscriptionActive,
        maxVehicles,
        maxUsers
      } = useCompany()

      await fetchCompany('company-1')

      expect(subscriptionPlan.value).toBe('pro')
      expect(isSubscriptionActive.value).toBe(true)
      expect(maxVehicles.value).toBe(50)
      expect(maxUsers.value).toBe(10)
    })

    it('should compute vehicle and user counts from sites', async () => {
      const { useCompany } = await import('../useCompany')
      const { fetchCompany, currentVehicleCount, currentUserCount } = useCompany()

      await fetchCompany('company-1')

      expect(currentVehicleCount.value).toBe(15) // 10 + 5
      expect(currentUserCount.value).toBe(2)
    })

    it('should update company in mock mode', async () => {
      const { useCompany } = await import('../useCompany')
      const { company, fetchCompany, updateCompany } = useCompany()

      await fetchCompany('company-1')
      await updateCompany({ name: 'Updated Name' })

      expect(supabase.rpc).not.toHaveBeenCalled()
      expect(company.value?.name).toBe('Updated Name')
    })

    it('should clear company state', async () => {
      const { useCompany } = await import('../useCompany')
      const { company, fetchCompany, clearCompany, isLoaded } = useCompany()

      await fetchCompany('company-1')
      expect(isLoaded.value).toBe(true)

      clearCompany()

      expect(company.value).toBeNull()
      expect(isLoaded.value).toBe(false)
    })
  })

  describe('with Supabase (USE_MOCK_DATA=false)', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_USE_MOCK_DATA', 'false')
    })

    it('should call supabase.rpc for b2b_get_company', async () => {
      const mockResponse = {
        id: 'company-1',
        name: 'DB Company',
        siret: '99999999999999',
        subscription_plan: 'enterprise',
        subscription_status: 'active',
        max_vehicles: 100,
        max_users: 20,
        sites: [],
        users: []
      }

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockResponse,
        error: null
      } as never)

      const { useCompany } = await import('../useCompany')
      const { fetchCompany, company } = useCompany()

      await fetchCompany('company-1')

      expect(supabase.rpc).toHaveBeenCalledWith('b2b_get_company', {
        p_company_id: 'company-1'
      })
      expect(company.value).not.toBeNull()
    })

    it('should handle Supabase error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      } as never)

      const { useCompany } = await import('../useCompany')
      const { fetchCompany, error } = useCompany()

      await fetchCompany('company-1')

      expect(error.value).toBe('Database error')
    })

    it('should handle null response from Supabase', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: null
      } as never)

      const { useCompany } = await import('../useCompany')
      const { fetchCompany, error } = useCompany()

      await fetchCompany('company-1')

      expect(error.value).toBe('Company not found')
    })

    it('should call supabase.rpc for b2b_update_company', async () => {
      // First fetch
      const mockCompany = {
        id: 'company-1',
        name: 'Original Name',
        siret: '99999999999999',
        subscription_plan: 'pro',
        subscription_status: 'active',
        max_vehicles: 50,
        max_users: 10,
        sites: [],
        users: []
      }

      vi.mocked(supabase.rpc)
        .mockResolvedValueOnce({ data: mockCompany, error: null } as never)
        .mockResolvedValueOnce({
          data: { ...mockCompany, name: 'Updated Name' },
          error: null
        } as never)

      const { useCompany } = await import('../useCompany')
      const { fetchCompany, updateCompany } = useCompany()

      await fetchCompany('company-1')
      await updateCompany({ name: 'Updated Name' })

      expect(supabase.rpc).toHaveBeenCalledWith('b2b_update_company', {
        p_company_id: 'company-1',
        p_updates: { name: 'Updated Name' }
      })
    })
  })
})
