import type { AddressBookEntry, NotificationPreferences, PrivacySettings } from '@/types/profile'

/**
 * Mock Address Book Entries
 */
export const mockAddressBook: AddressBookEntry[] = [
  {
    id: 'addr-1',
    userId: 'user-1',
    label: 'Domicile',
    street: '15 rue de la République',
    city: 'Paris',
    postalCode: '75001',
    country: 'France',
    isDefault: true,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'addr-2',
    userId: 'user-1',
    label: 'Travail',
    street: '42 avenue des Champs-Élysées',
    city: 'Paris',
    postalCode: '75008',
    country: 'France',
    isDefault: false,
    createdAt: '2024-02-20T14:30:00Z'
  },
  {
    id: 'addr-3',
    userId: 'user-1',
    label: 'Maison de campagne',
    street: '8 chemin des Vignes',
    complement: 'Portail blanc',
    city: 'Fontainebleau',
    postalCode: '77300',
    country: 'France',
    isDefault: false,
    createdAt: '2024-06-10T09:15:00Z'
  }
]

/**
 * Mock Notification Preferences
 */
export const mockNotificationPreferences: NotificationPreferences[] = [
  {
    userId: 'user-1',
    channels: {
      email: true,
      sms: true,
      push: true
    },
    types: {
      interventionReminders: true,
      interventionUpdates: true,
      maintenanceAlerts: true,
      promotionalOffers: false,
      loyaltyRewards: true,
      newsletter: false
    },
    updatedAt: '2024-11-15T10:00:00Z'
  }
]

/**
 * Mock Privacy Settings
 */
export const mockPrivacySettings: PrivacySettings[] = [
  {
    userId: 'user-1',
    shareDataWithPartners: false,
    allowPersonalizedAds: true,
    showProfilePublic: false,
    allowReviewsDisplay: true,
    updatedAt: '2024-11-15T10:00:00Z'
  }
]

/**
 * Get address book for user
 * 
 * @param userId - User ID
 * @returns Address book entries
 */
export function getAddressBook(userId: string): AddressBookEntry[] {
  return mockAddressBook.filter(a => a.userId === userId)
}

/**
 * Get default address for user
 * 
 * @param userId - User ID
 * @returns Default address or null
 */
export function getDefaultAddress(userId: string): AddressBookEntry | null {
  return mockAddressBook.find(a => a.userId === userId && a.isDefault) || null
}

/**
 * Get notification preferences for user
 * 
 * @param userId - User ID
 * @returns Notification preferences
 */
export function getNotificationPreferences(userId: string): NotificationPreferences | null {
  return mockNotificationPreferences.find(p => p.userId === userId) || null
}

/**
 * Get privacy settings for user
 * 
 * @param userId - User ID
 * @returns Privacy settings
 */
export function getPrivacySettings(userId: string): PrivacySettings | null {
  return mockPrivacySettings.find(s => s.userId === userId) || null
}

/**
 * Add address to address book
 * 
 * @param userId - User ID
 * @param address - Address data
 * @returns Created address entry
 */
export function addAddress(
  userId: string,
  address: Omit<AddressBookEntry, 'id' | 'userId' | 'createdAt'>
): AddressBookEntry {
  const newAddress: AddressBookEntry = {
    ...address,
    id: `addr-${Date.now()}`,
    userId,
    createdAt: new Date().toISOString()
  }

  // If isDefault, unset other defaults
  if (newAddress.isDefault) {
    mockAddressBook.forEach(a => {
      if (a.userId === userId) {
        a.isDefault = false
      }
    })
  }

  mockAddressBook.push(newAddress)
  return newAddress
}

/**
 * Update address
 * 
 * @param addressId - Address ID
 * @param updates - Updated fields
 */
export function updateAddress(
  addressId: string,
  updates: Partial<Omit<AddressBookEntry, 'id' | 'userId' | 'createdAt'>>
): AddressBookEntry | null {
  const address = mockAddressBook.find(a => a.id === addressId)
  if (!address) return null

  Object.assign(address, updates)

  // If setting as default, unset other defaults
  if (updates.isDefault) {
    mockAddressBook.forEach(a => {
      if (a.userId === address.userId && a.id !== addressId) {
        a.isDefault = false
      }
    })
  }

  return address
}

/**
 * Delete address
 * 
 * @param addressId - Address ID
 */
export function deleteAddress(addressId: string): void {
  const index = mockAddressBook.findIndex(a => a.id === addressId)
  if (index !== -1) {
    mockAddressBook.splice(index, 1)
  }
}

