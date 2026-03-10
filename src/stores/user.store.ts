import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Tables, TablesUpdate } from '@/types/database.types'
import type { AddressBookEntry, NotificationPreferences, PrivacySettings } from '@/types/profile'
// Supabase RPC functions for profile management
import {
  getAddresses as profileGetAddresses,
  addAddress as profileAddAddress,
  updateAddress as profileUpdateAddress,
  deleteAddress as profileDeleteAddress,
  getNotificationPreferences as profileGetNotificationPreferences,
  updateNotificationPreferences as profileUpdateNotificationPreferences,
  getPrivacySettings as profileGetPrivacySettings,
  updatePrivacySettings as profileUpdatePrivacySettings
} from '@/composables/useProfile'

type Profile = Tables<'profiles'>

/**
 * User Store - Manages user authentication and profile
 * Uses Supabase Auth exclusively (no mocks)
 */
export const useUserStore = defineStore('user', () => {
  // State
  const authUser = ref<SupabaseUser | null>(null)
  const profile = ref<Profile | null>(null)
  const addresses = ref<AddressBookEntry[]>([])
  const notificationPreferences = ref<NotificationPreferences | null>(null)
  const privacySettings = ref<PrivacySettings | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!authUser.value)
  const userType = computed(() => profile.value?.role || null)
  const isB2C = computed(() => profile.value?.role === 'client')
  const isB2B = computed(() => profile.value?.role === 'fleet_manager')
  const userName = computed(() => {
    if (!profile.value) return 'Guest'
    return `${profile.value.first_name || ''} ${profile.value.last_name || ''}`.trim() || 'Guest'
  })
  const userFirstName = computed(() => profile.value?.first_name || 'Guest')
  const userEmail = computed(() => authUser.value?.email || '')
  const userAvatar = computed(() => profile.value?.avatar_url || null)
  const loyaltyPoints = computed(() => profile.value?.loyalty_points || 0)
  const companyId = computed(() => profile.value?.company_id || null)

  // Legacy compatibility - user object for components expecting old format
  const user = computed(() => {
    if (!authUser.value || !profile.value) return null
    return {
      id: authUser.value.id,
      email: authUser.value.email,
      profile: {
        firstName: profile.value.first_name,
        lastName: profile.value.last_name,
        phone: profile.value.phone,
        avatar: profile.value.avatar_url,
        address: profile.value.default_address,
        preferences: {
          notifications: {
            email: true,
            sms: true,
            push: true
          },
          language: 'fr',
          currency: 'EUR'
        },
        loyaltyPoints: profile.value.loyalty_points || 0
      },
      accountType: profile.value.role === 'fleet_manager' ? 'b2b' : 'b2c',
      companyId: profile.value.company_id,
      createdAt: profile.value.created_at
    }
  })

  /**
   * Initialize auth state from Supabase session
   */
  async function initialize(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) throw sessionError

      if (session?.user) {
        authUser.value = session.user
        await fetchProfile()
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        authUser.value = session?.user ?? null

        if (event === 'SIGNED_IN' && session?.user) {
          await fetchProfile()
          await fetchUserData()
        } else if (event === 'SIGNED_OUT') {
          profile.value = null
          addresses.value = []
          notificationPreferences.value = null
          privacySettings.value = null
        }
      })

      console.log('[Auth] Initialized, authenticated:', isAuthenticated.value)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Initialization failed'
      console.error('[Auth] Initialization error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch user profile from Supabase using RPC function
   */
  async function fetchProfile(): Promise<void> {
    if (!authUser.value) return

    try {
      const { data, error: fetchError } = await supabase.rpc('auth_get_profile', {
        p_user_id: authUser.value.id
      }) as { data: Profile[] | null; error: { message: string } | null }

      if (fetchError) throw new Error(fetchError.message)

      // RPC returns SETOF, get first result
      profile.value = data?.[0] ?? null
      console.log('[User] Profile fetched:', profile.value?.first_name)
    } catch (err) {
      console.error('[User] Profile fetch error:', err)
    }
  }

  /**
   * Login user with email and password
   *
   * @param email - User email
   * @param password - User password
   */
  async function login(email: string, password: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) throw signInError

      authUser.value = data.user
      await fetchProfile()
      await fetchUserData()

      console.log('[Auth] User logged in:', userName.value)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      console.error('[Auth] Login error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout user
   */
  async function logout(): Promise<void> {
    isLoading.value = true

    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError

      authUser.value = null
      profile.value = null
      addresses.value = []
      notificationPreferences.value = null
      privacySettings.value = null
      error.value = null

      console.log('[Auth] User logged out')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Logout failed'
      console.error('[Auth] Logout error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update user profile using RPC function
   *
   * @param updates - Profile updates
   */
  async function updateProfile(updates: TablesUpdate<'profiles'>): Promise<void> {
    if (!authUser.value) return

    isLoading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase.rpc('auth_update_profile', {
        p_user_id: authUser.value.id,
        p_first_name: updates.first_name ?? null,
        p_last_name: updates.last_name ?? null,
        p_phone: updates.phone ?? null,
        p_avatar_url: updates.avatar_url ?? null,
        p_date_of_birth: updates.date_of_birth ?? null,
        p_address: updates.default_address ?? null,
        p_city: updates.city ?? null,
        p_zip_code: updates.zip_code ?? null,
        p_country: updates.country ?? null,
        p_locale: updates.locale ?? null,
        p_timezone: updates.timezone ?? null
      }) as { data: Profile[] | null; error: { message: string } | null }

      if (updateError) throw new Error(updateError.message)

      // RPC returns SETOF, get first result
      profile.value = data?.[0] ?? null
      console.log('[User] Profile updated')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Update failed'
      console.error('[User] Update error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch user data (addresses, notifications, privacy)
   * Uses Supabase RPC functions
   */
  async function fetchUserData(): Promise<void> {
    if (!authUser.value) return

    isLoading.value = true
    error.value = null

    try {
      // Fetch profile data from Supabase RPC
      const [addressesResult, notifResult, privacyResult] = await Promise.all([
        profileGetAddresses().catch(err => {
          console.warn('[User] Addresses fetch failed (using empty):', err.message)
          return [] as AddressBookEntry[]
        }),
        profileGetNotificationPreferences().catch(err => {
          console.warn('[User] Notification preferences fetch failed:', err.message)
          return null
        }),
        profileGetPrivacySettings().catch(err => {
          console.warn('[User] Privacy settings fetch failed:', err.message)
          return null
        })
      ])

      addresses.value = addressesResult
      notificationPreferences.value = notifResult
      privacySettings.value = privacyResult

      console.log('[User] Data refreshed from Supabase')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fetch failed'
      console.error('[User] Fetch error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Change user password
   *
   * @param currentPassword - Current password (not used by Supabase, but kept for API compat)
   * @param newPassword - New password
   */
  async function changePassword(_currentPassword: string, newPassword: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) throw updateError

      console.log('[User] Password changed successfully')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Password change failed'
      console.error('[User] Change password error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Add new address to address book
   * Uses Supabase RPC profile_add_address
   *
   * @param addressData - Address data
   */
  async function addNewAddress(addressData: Omit<AddressBookEntry, 'id' | 'userId' | 'createdAt'>): Promise<void> {
    if (!authUser.value) return

    isLoading.value = true
    error.value = null

    try {
      const newAddress = await profileAddAddress(addressData)
      addresses.value.push(newAddress)

      console.log('[User] Address added via Supabase:', newAddress.label)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Add address failed'
      console.error('[User] Add address error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update existing address
   * Uses Supabase RPC profile_update_address
   *
   * @param addressId - Address ID
   * @param updates - Updated fields
   */
  async function updateExistingAddress(
    addressId: string,
    updates: Partial<Omit<AddressBookEntry, 'id' | 'userId' | 'createdAt'>>
  ): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const updatedAddress = await profileUpdateAddress(addressId, updates)

      // Update local state
      const index = addresses.value.findIndex(a => a.id === addressId)
      if (index !== -1) {
        addresses.value[index] = updatedAddress
      }

      console.log('[User] Address updated via Supabase:', addressId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Update address failed'
      console.error('[User] Update address error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete address
   * Uses Supabase RPC profile_delete_address
   *
   * @param addressId - Address ID
   */
  async function deleteExistingAddress(addressId: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const success = await profileDeleteAddress(addressId)

      if (success) {
        // Remove from local state
        addresses.value = addresses.value.filter(a => a.id !== addressId)
        console.log('[User] Address deleted via Supabase:', addressId)
      } else {
        throw new Error('Failed to delete address')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Delete address failed'
      console.error('[User] Delete address error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update notification preferences
   * Uses Supabase RPC profile_update_notification_preferences
   *
   * @param preferences - Notification preferences
   */
  async function updateUserNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
    if (!authUser.value) return

    isLoading.value = true
    error.value = null

    try {
      const updated = await profileUpdateNotificationPreferences(preferences)
      notificationPreferences.value = updated

      console.log('[User] Notification preferences updated via Supabase')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Update preferences failed'
      console.error('[User] Update preferences error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update privacy settings
   * Uses Supabase RPC profile_update_privacy_settings
   *
   * @param settings - Privacy settings
   */
  async function updateUserPrivacySettings(settings: PrivacySettings): Promise<void> {
    if (!authUser.value) return

    isLoading.value = true
    error.value = null

    try {
      const updated = await profileUpdatePrivacySettings(settings)
      privacySettings.value = updated

      console.log('[User] Privacy settings updated via Supabase')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Update settings failed'
      console.error('[User] Update settings error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    user,
    authUser,
    profile,
    addresses,
    notificationPreferences,
    privacySettings,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    userType,
    isB2C,
    isB2B,
    userName,
    userFirstName,
    userEmail,
    userAvatar,
    loyaltyPoints,
    companyId,

    // Actions
    initialize,
    fetchProfile,
    login,
    logout,
    updateProfile,
    fetchUserData,
    changePassword,
    addNewAddress,
    updateExistingAddress,
    deleteExistingAddress,
    updateNotificationPreferences: updateUserNotificationPreferences,
    updatePrivacySettings: updateUserPrivacySettings
  }
})
