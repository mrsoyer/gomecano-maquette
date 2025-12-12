import type { UserAccount, UserProfile } from '@/types/account'

/**
 * Mock User Accounts - B2C users
 */
export const mockUserAccounts: UserAccount[] = [
  {
    id: 'user-1',
    email: 'sophie.martin@email.com',
    profile: {
      firstName: 'Sophie',
      lastName: 'Martin',
      phone: '0612345678',
      avatar: '/avatars/sophie.jpg',
      address: {
        street: '15 rue de la République',
        city: 'Paris',
        postalCode: '75001',
        country: 'France'
      },
      preferences: {
        notifications: {
          email: true,
          sms: true,
          push: true
        },
        language: 'fr',
        currency: 'EUR'
      },
      loyaltyPoints: 450
    },
    accountType: 'b2c',
    subscription: {
      plan: 'premium',
      status: 'active',
      startDate: '2024-01-15T00:00:00Z'
    },
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'user-2',
    email: 'thomas.dubois@email.com',
    profile: {
      firstName: 'Thomas',
      lastName: 'Dubois',
      phone: '0623456789',
      avatar: '/avatars/thomas.jpg',
      address: {
        street: '42 avenue des Champs',
        complement: 'Appt 12',
        city: 'Lyon',
        postalCode: '69001',
        country: 'France'
      },
      preferences: {
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        language: 'fr',
        currency: 'EUR'
      },
      loyaltyPoints: 120
    },
    accountType: 'b2c',
    createdAt: '2024-03-20T14:30:00Z'
  },
  {
    id: 'user-3',
    email: 'marie.laurent@email.com',
    profile: {
      firstName: 'Marie',
      lastName: 'Laurent',
      phone: '0634567890',
      avatar: '/avatars/marie.jpg',
      address: {
        street: '8 rue Victor Hugo',
        city: 'Marseille',
        postalCode: '13001',
        country: 'France'
      },
      preferences: {
        notifications: {
          email: true,
          sms: true,
          push: false
        },
        language: 'fr',
        currency: 'EUR'
      },
      loyaltyPoints: 890
    },
    accountType: 'b2c',
    subscription: {
      plan: 'premium',
      status: 'active',
      startDate: '2023-11-01T00:00:00Z'
    },
    createdAt: '2023-11-01T09:15:00Z'
  },
  {
    id: 'user-b2b-1',
    email: 'admin@rapidelogistics.fr',
    profile: {
      firstName: 'Pierre',
      lastName: 'Rousseau',
      phone: '0145678901',
      preferences: {
        notifications: {
          email: true,
          sms: true,
          push: true
        },
        language: 'fr',
        currency: 'EUR'
      },
      loyaltyPoints: 0
    },
    accountType: 'b2b',
    companyId: 'company-1',
    subscription: {
      plan: 'business',
      status: 'active',
      startDate: '2024-01-01T00:00:00Z'
    },
    createdAt: '2024-01-01T08:00:00Z'
  },
  {
    id: 'user-b2b-2',
    email: 'admin@greentransport.fr',
    profile: {
      firstName: 'Claire',
      lastName: 'Moreau',
      phone: '0156789012',
      preferences: {
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        language: 'fr',
        currency: 'EUR'
      },
      loyaltyPoints: 0
    },
    accountType: 'b2b',
    companyId: 'company-2',
    subscription: {
      plan: 'business',
      status: 'active',
      startDate: '2023-09-01T00:00:00Z'
    },
    createdAt: '2023-09-01T10:00:00Z'
  }
]

/**
 * Get user account by ID
 * 
 * @param id - User ID
 * @returns User account or undefined
 */
export function getUserById(id: string): UserAccount | undefined {
  return mockUserAccounts.find(u => u.id === id)
}

/**
 * Get user account by email
 * 
 * @param email - User email
 * @returns User account or undefined
 */
export function getUserByEmail(email: string): UserAccount | undefined {
  return mockUserAccounts.find(u => u.email === email)
}

/**
 * Get B2C users only
 * 
 * @returns Array of B2C user accounts
 */
export function getB2CUsers(): UserAccount[] {
  return mockUserAccounts.filter(u => u.accountType === 'b2c')
}

/**
 * Get B2B users only
 * 
 * @returns Array of B2B user accounts
 */
export function getB2BUsers(): UserAccount[] {
  return mockUserAccounts.filter(u => u.accountType === 'b2b')
}
