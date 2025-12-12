/**
 * Subscriptions Mock Data
 */

import type { SubscriptionPlan, UserSubscription, BillingEntry } from '@/types/subscription'

export const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan-free',
    tier: 'free',
    name: 'Gratuit',
    price: 0,
    yearlyPrice: 0,
    features: [
      '2 interventions par mois',
      '1 véhicule',
      'Support standard (email)',
      'Historique 3 mois',
      'Notifications de base'
    ],
    limits: {
      interventionsPerMonth: 2,
      vehiclesMax: 1,
      prioritySupport: false,
      advancedAnalytics: false,
      emergencySOS: false,
      familySharing: false
    }
  },
  {
    id: 'plan-premium',
    tier: 'premium',
    name: 'Premium',
    price: 9.90,
    yearlyPrice: 99,
    features: [
      '10 interventions par mois',
      '3 véhicules',
      'Support prioritaire (chat)',
      'Analytics avancés',
      'Historique illimité',
      'Rappels maintenance',
      'Réductions partenaires (-10%)'
    ],
    limits: {
      interventionsPerMonth: 10,
      vehiclesMax: 3,
      prioritySupport: true,
      advancedAnalytics: true,
      emergencySOS: false,
      familySharing: false
    },
    popular: true
  },
  {
    id: 'plan-platinum',
    tier: 'platinum',
    name: 'Platinum',
    price: 19.90,
    yearlyPrice: 199,
    features: [
      'Interventions illimitées',
      'Véhicules illimités',
      'Support 24/7 (téléphone)',
      'SOS Urgence inclus',
      'Partage famille (5 membres)',
      'Analytics + prédictions IA',
      'Réductions partenaires (-20%)',
      'Garantie satisfaction 30j'
    ],
    limits: {
      interventionsPerMonth: 999,
      vehiclesMax: 10,
      prioritySupport: true,
      advancedAnalytics: true,
      emergencySOS: true,
      familySharing: true
    }
  }
]

export const mockUserSubscription: UserSubscription = {
  userId: 'user-1',
  currentPlan: 'free',
  startDate: '2024-01-15',
  renewalDate: '2025-01-15',
  autoRenew: true,
  billingHistory: [
    {
      id: 'bill-1',
      date: '2024-01-15',
      amount: 0,
      plan: 'free',
      status: 'paid'
    }
  ]
}

export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockUserSubscription
}

export async function upgradePlan(userId: string, newPlan: 'premium' | 'platinum'): Promise<UserSubscription> {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    ...mockUserSubscription,
    currentPlan: newPlan,
    renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  }
}
