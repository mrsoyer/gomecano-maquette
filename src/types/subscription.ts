/**
 * Subscription Types - Premium features
 */

export type SubscriptionTier = 'free' | 'premium' | 'platinum'

export interface SubscriptionPlan {
  id: string
  tier: SubscriptionTier
  name: string
  price: number // monthly in euros
  yearlyPrice: number // yearly in euros
  features: string[]
  limits: {
    interventionsPerMonth: number
    vehiclesMax: number
    prioritySupport: boolean
    advancedAnalytics: boolean
    emergencySOS: boolean
    familySharing: boolean
  }
  popular?: boolean
}

export interface UserSubscription {
  userId: string
  currentPlan: SubscriptionTier
  startDate: string
  renewalDate: string
  paymentMethod?: string
  autoRenew: boolean
  billingHistory: BillingEntry[]
}

export interface BillingEntry {
  id: string
  date: string
  amount: number
  plan: SubscriptionTier
  status: 'paid' | 'pending' | 'failed'
  invoiceUrl?: string
}

export interface UpgradePath {
  from: SubscriptionTier
  to: SubscriptionTier
  discount?: number // percentage
  message: string
}
