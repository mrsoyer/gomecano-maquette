import { supabase } from '@/services/supabase'
import type { AddressBookEntry, NotificationPreferences, PrivacySettings } from '@/types/profile'

// ============================================
// Types for Supabase RPC responses
// ============================================

interface SupabaseAddress {
  id: string
  profile_id: string
  label: string | null
  street: string
  complement: string | null
  city: string
  zip_code: string
  country: string | null
  is_default: boolean | null
  instructions: string | null
  created_at: string
  updated_at: string | null
}

interface SupabaseNotificationPreferences {
  id: string
  profile_id: string
  email_marketing: boolean
  email_reminders: boolean
  email_updates: boolean
  sms_reminders: boolean
  sms_promotions: boolean
  push_enabled: boolean
  push_appointments: boolean
  push_promotions: boolean
  created_at: string
  updated_at: string
}

interface SupabasePrivacySettings {
  id: string
  profile_id: string
  share_location: boolean
  share_vehicle_data: boolean
  analytics_enabled: boolean
  personalized_ads: boolean
  created_at: string
  updated_at: string
}

// ============================================
// Transform functions: Backend → Frontend
// ============================================

/**
 * Transform Supabase address to frontend AddressBookEntry
 */
function transformAddress(addr: SupabaseAddress): AddressBookEntry {
  return {
    id: addr.id,
    userId: addr.profile_id,
    label: addr.label || 'Adresse',
    street: addr.street,
    complement: addr.complement || undefined,
    city: addr.city,
    postalCode: addr.zip_code,
    country: addr.country || 'France',
    isDefault: addr.is_default || false,
    createdAt: addr.created_at
  }
}

/**
 * Transform Supabase notification preferences to frontend NotificationPreferences
 */
function transformNotificationPreferences(prefs: SupabaseNotificationPreferences): NotificationPreferences {
  return {
    userId: prefs.profile_id,
    channels: {
      email: prefs.email_marketing || prefs.email_reminders || prefs.email_updates,
      sms: prefs.sms_reminders || prefs.sms_promotions,
      push: prefs.push_enabled
    },
    types: {
      interventionReminders: prefs.email_reminders || prefs.sms_reminders,
      interventionUpdates: prefs.email_updates,
      maintenanceAlerts: prefs.push_appointments,
      promotionalOffers: prefs.sms_promotions || prefs.push_promotions,
      loyaltyRewards: prefs.email_marketing,
      newsletter: prefs.email_marketing
    },
    updatedAt: prefs.updated_at
  }
}

/**
 * Transform Supabase privacy settings to frontend PrivacySettings
 */
function transformPrivacySettings(settings: SupabasePrivacySettings): PrivacySettings {
  return {
    userId: settings.profile_id,
    shareDataWithPartners: settings.share_vehicle_data,
    allowPersonalizedAds: settings.personalized_ads,
    showProfilePublic: settings.analytics_enabled,
    allowReviewsDisplay: settings.share_location,
    updatedAt: settings.updated_at
  }
}

// ============================================
// Transform functions: Frontend → Backend
// ============================================

interface AddressInput {
  label?: string
  street?: string
  complement?: string
  city?: string
  postalCode?: string
  country?: string
  isDefault?: boolean
}

/**
 * Transform frontend address data to Supabase format
 */
function toSupabaseAddressData(data: AddressInput): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  if (data.label !== undefined) result.label = data.label
  if (data.street !== undefined) result.street = data.street
  if (data.complement !== undefined) result.complement = data.complement
  if (data.city !== undefined) result.city = data.city
  if (data.postalCode !== undefined) result.zip_code = data.postalCode
  if (data.country !== undefined) result.country = data.country
  if (data.isDefault !== undefined) result.is_default = data.isDefault

  return result
}

/**
 * Transform frontend notification preferences to Supabase format
 */
function toSupabaseNotificationData(prefs: NotificationPreferences): Record<string, unknown> {
  return {
    email_marketing: prefs.types.newsletter || prefs.types.loyaltyRewards,
    email_reminders: prefs.types.interventionReminders && prefs.channels.email,
    email_updates: prefs.types.interventionUpdates && prefs.channels.email,
    sms_reminders: prefs.types.interventionReminders && prefs.channels.sms,
    sms_promotions: prefs.types.promotionalOffers && prefs.channels.sms,
    push_enabled: prefs.channels.push,
    push_appointments: prefs.types.maintenanceAlerts && prefs.channels.push,
    push_promotions: prefs.types.promotionalOffers && prefs.channels.push
  }
}

/**
 * Transform frontend privacy settings to Supabase format
 */
function toSupabasePrivacyData(settings: PrivacySettings): Record<string, unknown> {
  return {
    share_location: settings.allowReviewsDisplay,
    share_vehicle_data: settings.shareDataWithPartners,
    analytics_enabled: settings.showProfilePublic,
    personalized_ads: settings.allowPersonalizedAds
  }
}

// ============================================
// Profile RPC Functions
// ============================================

/**
 * Get all addresses for current user
 * @returns Array of AddressBookEntry
 */
export async function getAddresses(): Promise<AddressBookEntry[]> {
  const { data, error } = await supabase.rpc('profile_get_addresses')

  if (error) {
    console.error('[Profile] Error fetching addresses:', error)
    throw new Error(error.message)
  }

  return (data as SupabaseAddress[] || []).map(transformAddress)
}

/**
 * Add a new address
 * @param addressData - Address data to create
 * @returns Created AddressBookEntry
 */
export async function addAddress(addressData: AddressInput): Promise<AddressBookEntry> {
  const { data, error } = await supabase.rpc('profile_add_address', {
    p_data: toSupabaseAddressData(addressData)
  })

  if (error) {
    console.error('[Profile] Error adding address:', error)
    throw new Error(error.message)
  }

  return transformAddress(data as SupabaseAddress)
}

/**
 * Update an existing address
 * @param addressId - Address UUID
 * @param updates - Fields to update
 * @returns Updated AddressBookEntry
 */
export async function updateAddress(
  addressId: string,
  updates: AddressInput
): Promise<AddressBookEntry> {
  const { data, error } = await supabase.rpc('profile_update_address', {
    p_address_id: addressId,
    p_data: toSupabaseAddressData(updates)
  })

  if (error) {
    console.error('[Profile] Error updating address:', error)
    throw new Error(error.message)
  }

  return transformAddress(data as SupabaseAddress)
}

/**
 * Delete an address
 * @param addressId - Address UUID
 * @returns True if deleted
 */
export async function deleteAddress(addressId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('profile_delete_address', {
    p_address_id: addressId
  })

  if (error) {
    console.error('[Profile] Error deleting address:', error)
    throw new Error(error.message)
  }

  return data as boolean
}

/**
 * Get notification preferences for current user
 * @returns NotificationPreferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences | null> {
  const { data, error } = await supabase.rpc('profile_get_notification_preferences')

  if (error) {
    console.error('[Profile] Error fetching notification preferences:', error)
    throw new Error(error.message)
  }

  if (!data) return null

  return transformNotificationPreferences(data as SupabaseNotificationPreferences)
}

/**
 * Update notification preferences
 * @param preferences - NotificationPreferences to save
 * @returns Updated NotificationPreferences
 */
export async function updateNotificationPreferences(
  preferences: NotificationPreferences
): Promise<NotificationPreferences> {
  const { data, error } = await supabase.rpc('profile_update_notification_preferences', {
    p_data: toSupabaseNotificationData(preferences)
  })

  if (error) {
    console.error('[Profile] Error updating notification preferences:', error)
    throw new Error(error.message)
  }

  return transformNotificationPreferences(data as SupabaseNotificationPreferences)
}

/**
 * Get privacy settings for current user
 * @returns PrivacySettings
 */
export async function getPrivacySettings(): Promise<PrivacySettings | null> {
  const { data, error } = await supabase.rpc('profile_get_privacy_settings')

  if (error) {
    console.error('[Profile] Error fetching privacy settings:', error)
    throw new Error(error.message)
  }

  if (!data) return null

  return transformPrivacySettings(data as SupabasePrivacySettings)
}

/**
 * Update privacy settings
 * @param settings - PrivacySettings to save
 * @returns Updated PrivacySettings
 */
export async function updatePrivacySettings(
  settings: PrivacySettings
): Promise<PrivacySettings> {
  const { data, error } = await supabase.rpc('profile_update_privacy_settings', {
    p_data: toSupabasePrivacyData(settings)
  })

  if (error) {
    console.error('[Profile] Error updating privacy settings:', error)
    throw new Error(error.message)
  }

  return transformPrivacySettings(data as SupabasePrivacySettings)
}
