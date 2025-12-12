import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserAccount } from '@/types/account'
import type { AddressBookEntry, NotificationPreferences, PrivacySettings } from '@/types/profile'
import { getUserById, getUserByEmail, mockUserAccounts } from '@/mocks/users'
import {
  getAddressBook,
  getNotificationPreferences,
  getPrivacySettings,
  addAddress,
  updateAddress,
  deleteAddress,
  mockNotificationPreferences,
  mockPrivacySettings
} from '@/mocks/profile.mock'
import { mockUserPasswords } from '@/mocks/auth.mock'

/**
 * User Store - Manages user authentication and profile
 */
export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<UserAccount | null>(null)
  const addresses = ref<AddressBookEntry[]>([])
  const notificationPreferences = ref<NotificationPreferences | null>(null)
  const privacySettings = ref<PrivacySettings | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userType = computed(() => user.value?.accountType || null)
  const isB2C = computed(() => user.value?.accountType === 'b2c')
  const isB2B = computed(() => user.value?.accountType === 'b2b')
  const userName = computed(() => {
    if (!user.value) return 'Guest'
    return `${user.value.profile.firstName} ${user.value.profile.lastName}`
  })
  const userFirstName = computed(() => user.value?.profile.firstName || 'Guest')
  const userEmail = computed(() => user.value?.email || '')
  const userAvatar = computed(() => user.value?.profile.avatar || null)
  const loyaltyPoints = computed(() => user.value?.profile.loyaltyPoints || 0)
  const companyId = computed(() => user.value?.companyId || null)

  /**
   * Login user (mock authentication)
   * 
   * @param email - User email
   * @param password - User password (not used in mock)
   */
  async function login(email: string, password: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      const foundUser = getUserByEmail(email)
      if (!foundUser) {
        throw new Error('User not found')
      }

      user.value = foundUser
      console.log('[Auth] User logged in:', userName.value, '(' + userType.value + ')')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      console.error('[Auth] Login error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Login by user ID (direct mock login)
   * 
   * @param userId - User ID
   */
  async function loginById(userId: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await new Promise(resolve => setTimeout(resolve, 200))

      const foundUser = getUserById(userId)
      if (!foundUser) {
        throw new Error('User not found')
      }

      user.value = foundUser
      console.log('[Auth] User logged in:', userName.value, '(' + userType.value + ')')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      console.error('[Auth] Login error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout user
   */
  function logout(): void {
    user.value = null
    error.value = null
    console.log('[Auth] User logged out')
  }

  /**
   * Update user profile
   * 
   * @param updates - Profile updates
   */
  async function updateProfile(updates: Partial<UserAccount['profile']>): Promise<void> {
    if (!user.value) return

    isLoading.value = true
    error.value = null

    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      user.value.profile = {
        ...user.value.profile,
        ...updates
      }

      console.log('[User] Profile updated')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Update failed'
      console.error('[User] Update error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch user data (refresh from backend)
   */
  async function fetchUserData(): Promise<void> {
    if (!user.value) return

    isLoading.value = true
    error.value = null

    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      const refreshedUser = getUserById(user.value.id)
      if (refreshedUser) {
        user.value = refreshedUser
      }

      // Fetch related data
      addresses.value = getAddressBook(user.value.id)
      notificationPreferences.value = getNotificationPreferences(user.value.id)
      privacySettings.value = getPrivacySettings(user.value.id)

      console.log('[User] Data refreshed')
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
   * @param currentPassword - Current password
   * @param newPassword - New password
   */
  async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!user.value) return

    isLoading.value = true
    error.value = null

    try {
      await new Promise(resolve => setTimeout(resolve, 800))

      // Verify current password (mock)
      const storedPassword = mockUserPasswords[user.value.id]
      if (!storedPassword) {
        throw new Error('Mot de passe actuel incorrect')
      }

      // Update password (mock)
      mockUserPasswords[user.value.id] = `mock_hash_${newPassword}`

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
   * 
   * @param addressData - Address data
   */
  async function addNewAddress(addressData: Omit<AddressBookEntry, 'id' | 'userId' | 'createdAt'>): Promise<void> {
    if (!user.value) return

    isLoading.value = true
    error.value = null

    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      const newAddress = addAddress(user.value.id, addressData)
      addresses.value.push(newAddress)

      console.log('[User] Address added:', newAddress.label)
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
      await new Promise(resolve => setTimeout(resolve, 500))

      const updated = updateAddress(addressId, updates)
      if (!updated) {
        throw new Error('Address not found')
      }

      // Refresh addresses
      if (user.value) {
        addresses.value = getAddressBook(user.value.id)
      }

      console.log('[User] Address updated:', addressId)
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
   * 
   * @param addressId - Address ID
   */
  async function deleteExistingAddress(addressId: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await new Promise(resolve => setTimeout(resolve, 400))

      deleteAddress(addressId)

      // Refresh addresses
      if (user.value) {
        addresses.value = getAddressBook(user.value.id)
      }

      console.log('[User] Address deleted:', addressId)
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
   * 
   * @param preferences - Notification preferences
   */
  async function updateNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
    if (!user.value) return

    isLoading.value = true
    error.value = null

    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      // Update in mock data
      const existing = mockNotificationPreferences.find(p => p.userId === user.value!.id)
      if (existing) {
        Object.assign(existing, { ...preferences, updatedAt: new Date().toISOString() })
      } else {
        mockNotificationPreferences.push({
          ...preferences,
          userId: user.value.id,
          updatedAt: new Date().toISOString()
        })
      }

      notificationPreferences.value = preferences

      console.log('[User] Notification preferences updated')
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
   * 
   * @param settings - Privacy settings
   */
  async function updatePrivacySettings(settings: PrivacySettings): Promise<void> {
    if (!user.value) return

    isLoading.value = true
    error.value = null

    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      // Update in mock data
      const existing = mockPrivacySettings.find(s => s.userId === user.value!.id)
      if (existing) {
        Object.assign(existing, { ...settings, updatedAt: new Date().toISOString() })
      } else {
        mockPrivacySettings.push({
          ...settings,
          userId: user.value.id,
          updatedAt: new Date().toISOString()
        })
      }

      privacySettings.value = settings

      console.log('[User] Privacy settings updated')
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
    login,
    loginById,
    logout,
    updateProfile,
    fetchUserData,
    changePassword,
    addNewAddress,
    updateExistingAddress,
    deleteExistingAddress,
    updateNotificationPreferences,
    updatePrivacySettings
  }
})
