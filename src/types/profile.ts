import type { Address } from './account'

/**
 * Profile Update - User profile modifications
 */
export interface ProfileUpdate {
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
}

/**
 * Address Book Entry
 */
export interface AddressBookEntry extends Address {
  id: string
  userId: string
  label: string // 'Domicile', 'Travail', etc.
  isDefault: boolean
  createdAt: string
}

/**
 * Notification Preferences - Per channel and type
 */
export interface NotificationPreferences {
  userId: string
  channels: {
    email: boolean
    sms: boolean
    push: boolean
  }
  types: {
    interventionReminders: boolean
    interventionUpdates: boolean
    maintenanceAlerts: boolean
    promotionalOffers: boolean
    loyaltyRewards: boolean
    newsletter: boolean
  }
  updatedAt: string
}

/**
 * Privacy Settings
 */
export interface PrivacySettings {
  userId: string
  shareDataWithPartners: boolean
  allowPersonalizedAds: boolean
  showProfilePublic: boolean
  allowReviewsDisplay: boolean
  updatedAt: string
}

/**
 * Password Change Request
 */
export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

/**
 * Email Change Request
 */
export interface EmailChangeRequest {
  newEmail: string
  password: string
}

