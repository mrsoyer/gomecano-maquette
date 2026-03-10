import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock Supabase before importing the composable
vi.mock('@/services/supabase', () => ({
  supabase: {
    rpc: vi.fn()
  }
}))

import { supabase } from '@/services/supabase'
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getNotificationPreferences,
  updateNotificationPreferences,
  getPrivacySettings,
  updatePrivacySettings
} from '../useProfile'

describe('useProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================
  // Addresses tests
  // ============================================
  describe('getAddresses', () => {
    it('should fetch and transform addresses', async () => {
      const mockData = [
        {
          id: 'addr-1',
          profile_id: 'user-1',
          label: 'Home',
          street: '123 Main St',
          complement: 'Apt 4',
          city: 'Paris',
          zip_code: '75001',
          country: 'FR',
          is_default: true,
          instructions: null,
          created_at: '2026-01-06T10:00:00Z'
        }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: mockData, error: null })

      const result = await getAddresses()

      expect(supabase.rpc).toHaveBeenCalledWith('profile_get_addresses')
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: 'addr-1',
        userId: 'user-1',
        label: 'Home',
        street: '123 Main St',
        complement: 'Apt 4',
        city: 'Paris',
        postalCode: '75001',
        country: 'FR',
        isDefault: true,
        createdAt: '2026-01-06T10:00:00Z'
      })
    })

    it('should return empty array when no addresses', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: [], error: null })

      const result = await getAddresses()

      expect(result).toEqual([])
    })

    it('should throw error on failure', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      })

      await expect(getAddresses()).rejects.toThrow('Database error')
    })
  })

  describe('addAddress', () => {
    it('should add address and return transformed result', async () => {
      const input = {
        label: 'Work',
        street: '456 Business Ave',
        city: 'Lyon',
        postalCode: '69001',
        country: 'FR',
        isDefault: false
      }

      const mockResponse = {
        id: 'addr-2',
        profile_id: 'user-1',
        label: 'Work',
        street: '456 Business Ave',
        complement: null,
        city: 'Lyon',
        zip_code: '69001',
        country: 'FR',
        is_default: false,
        instructions: null,
        created_at: '2026-01-06T11:00:00Z'
      }

      vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: mockResponse, error: null })

      const result = await addAddress(input)

      expect(supabase.rpc).toHaveBeenCalledWith('profile_add_address', {
        p_data: {
          label: 'Work',
          street: '456 Business Ave',
          city: 'Lyon',
          zip_code: '69001',
          country: 'FR',
          is_default: false
        }
      })
      expect(result.postalCode).toBe('69001')
      expect(result.isDefault).toBe(false)
    })
  })

  describe('updateAddress', () => {
    it('should update address with transformed data', async () => {
      const mockResponse = {
        id: 'addr-1',
        profile_id: 'user-1',
        label: 'Updated Home',
        street: '123 Main St',
        complement: null,
        city: 'Paris',
        zip_code: '75002',
        country: 'FR',
        is_default: true,
        instructions: null,
        created_at: '2026-01-06T10:00:00Z'
      }

      vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: mockResponse, error: null })

      const result = await updateAddress('addr-1', { label: 'Updated Home', postalCode: '75002' })

      expect(supabase.rpc).toHaveBeenCalledWith('profile_update_address', {
        p_address_id: 'addr-1',
        p_data: { label: 'Updated Home', zip_code: '75002' }
      })
      expect(result.label).toBe('Updated Home')
    })
  })

  describe('deleteAddress', () => {
    it('should delete address and return success', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: true, error: null })

      const result = await deleteAddress('addr-1')

      expect(supabase.rpc).toHaveBeenCalledWith('profile_delete_address', {
        p_address_id: 'addr-1'
      })
      expect(result).toBe(true)
    })
  })

  // ============================================
  // Notification Preferences tests
  // ============================================
  describe('getNotificationPreferences', () => {
    it('should fetch and transform notification preferences', async () => {
      const mockData = {
        id: 'notif-1',
        profile_id: 'user-1',
        email_marketing: true,
        email_reminders: true,
        email_updates: false,
        sms_reminders: true,
        sms_promotions: false,
        push_enabled: true,
        push_appointments: true,
        push_promotions: false,
        created_at: '2026-01-06T10:00:00Z',
        updated_at: '2026-01-06T12:00:00Z'
      }

      vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: mockData, error: null })

      const result = await getNotificationPreferences()

      expect(supabase.rpc).toHaveBeenCalledWith('profile_get_notification_preferences')
      expect(result).not.toBeNull()
      expect(result?.userId).toBe('user-1')
      expect(result?.channels.push).toBe(true)
    })

    it('should return null when no preferences', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: null, error: null })

      const result = await getNotificationPreferences()

      expect(result).toBeNull()
    })
  })

  describe('updateNotificationPreferences', () => {
    it('should update preferences with transformed data', async () => {
      const input = {
        userId: 'user-1',
        channels: { email: true, sms: false, push: true },
        types: {
          interventionReminders: true,
          interventionUpdates: true,
          maintenanceAlerts: true,
          promotionalOffers: false,
          loyaltyRewards: true,
          newsletter: false
        },
        updatedAt: '2026-01-06T12:00:00Z'
      }

      const mockResponse = {
        id: 'notif-1',
        profile_id: 'user-1',
        email_marketing: false,
        email_reminders: true,
        email_updates: true,
        sms_reminders: false,
        sms_promotions: false,
        push_enabled: true,
        push_appointments: true,
        push_promotions: false,
        created_at: '2026-01-06T10:00:00Z',
        updated_at: '2026-01-06T13:00:00Z'
      }

      vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: mockResponse, error: null })

      const result = await updateNotificationPreferences(input)

      expect(supabase.rpc).toHaveBeenCalledWith('profile_update_notification_preferences', {
        p_data: expect.objectContaining({
          push_enabled: true
        })
      })
      expect(result.updatedAt).toBe('2026-01-06T13:00:00Z')
    })
  })

  // ============================================
  // Privacy Settings tests
  // ============================================
  describe('getPrivacySettings', () => {
    it('should fetch and transform privacy settings', async () => {
      const mockData = {
        id: 'priv-1',
        profile_id: 'user-1',
        share_location: true,
        share_vehicle_data: false,
        analytics_enabled: true,
        personalized_ads: false,
        created_at: '2026-01-06T10:00:00Z',
        updated_at: '2026-01-06T12:00:00Z'
      }

      vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: mockData, error: null })

      const result = await getPrivacySettings()

      expect(supabase.rpc).toHaveBeenCalledWith('profile_get_privacy_settings')
      expect(result).not.toBeNull()
      expect(result?.userId).toBe('user-1')
      expect(result?.shareDataWithPartners).toBe(false)
      expect(result?.allowPersonalizedAds).toBe(false)
    })
  })

  describe('updatePrivacySettings', () => {
    it('should update settings with transformed data', async () => {
      const input = {
        userId: 'user-1',
        shareDataWithPartners: true,
        allowPersonalizedAds: true,
        showProfilePublic: false,
        allowReviewsDisplay: true,
        updatedAt: '2026-01-06T12:00:00Z'
      }

      const mockResponse = {
        id: 'priv-1',
        profile_id: 'user-1',
        share_location: true,
        share_vehicle_data: true,
        analytics_enabled: false,
        personalized_ads: true,
        created_at: '2026-01-06T10:00:00Z',
        updated_at: '2026-01-06T14:00:00Z'
      }

      vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: mockResponse, error: null })

      const result = await updatePrivacySettings(input)

      expect(supabase.rpc).toHaveBeenCalledWith('profile_update_privacy_settings', {
        p_data: {
          share_location: true,
          share_vehicle_data: true,
          analytics_enabled: false,
          personalized_ads: true
        }
      })
      expect(result.allowPersonalizedAds).toBe(true)
    })
  })
})
