import type { Service } from './service'
import type { Vehicle } from './vehicle'
import type { Mechanic } from './user'

/**
 * User Account - Main account interface
 */
export interface UserAccount {
  id: string
  email: string
  profile: UserProfile
  accountType: 'b2c' | 'b2b'
  companyId?: string
  subscription?: Subscription
  createdAt: string
}

/**
 * User Profile - User personal information
 */
export interface UserProfile {
  firstName: string
  lastName: string
  phone: string
  avatar?: string
  address?: Address
  preferences: UserPreferences
  loyaltyPoints: number
}

/**
 * Address - Physical address
 */
export interface Address {
  street: string
  complement?: string
  city: string
  postalCode: string
  country: string
}

/**
 * User Preferences - User settings
 */
export interface UserPreferences {
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
  language: 'fr' | 'en'
  currency: 'EUR'
}

/**
 * Subscription - User subscription plan
 */
export interface Subscription {
  plan: 'free' | 'premium' | 'business'
  status: 'active' | 'cancelled' | 'expired'
  startDate: string
  endDate?: string
}

/**
 * Intervention - Complete intervention with all details
 */
export interface Intervention {
  id: string
  status: InterventionStatus
  currentStep: number
  service: Service
  vehicle: Vehicle
  mechanic: Mechanic
  scheduledAt: string
  address: Address
  quote: Quote
  timeline: InterventionEvent[]
  checklist: ChecklistItem[]
  photos: InterventionPhoto[]
  invoice?: Invoice
  review?: Review
  createdAt: string
}

/**
 * Intervention Status - All possible statuses
 */
export type InterventionStatus =
  | 'scheduled'
  | 'confirmed'
  | 'en_route'
  | 'sur_place'
  | 'en_cours'
  | 'termine'
  | 'cancelled'

/**
 * Intervention Event - Timeline event
 */
export interface InterventionEvent {
  id: string
  timestamp: string
  type: 'status_change' | 'message' | 'photo' | 'checklist_update' | 'note'
  description: string
  actor: 'client' | 'mechanic' | 'system'
  metadata?: Record<string, any>
}

/**
 * Intervention Photo - Photo uploaded during intervention
 */
export interface InterventionPhoto {
  id: string
  url: string
  caption?: string
  uploadedAt: string
  uploadedBy: 'client' | 'mechanic'
}

/**
 * Chat Message - Real-time chat message
 */
export interface ChatMessage {
  id: string
  interventionId: string
  content: string
  sender: 'client' | 'mechanic'
  timestamp: string
  read: boolean
}

/**
 * Checklist Item - Technical checklist item
 */
export interface ChecklistItem {
  id: string
  label: string
  checked: boolean
  checkedAt?: string
  notes?: string
}

/**
 * Quote - Service quote/estimate
 */
export interface Quote {
  serviceId: string
  serviceName: string
  partsPrice: number
  laborPrice: number
  totalPrice: number
  duration: number
  details: string[]
}

/**
 * Invoice - Final invoice
 */
export interface Invoice {
  id: string
  interventionId: string
  number: string
  date: string
  totalHT: number
  totalTTC: number
  tva: number
  status: 'pending' | 'paid' | 'cancelled'
  pdfUrl?: string
}

/**
 * Review - Client review after intervention
 */
export interface Review {
  id: string
  interventionId: string
  rating: number
  comment: string
  createdAt: string
  verified: boolean
}

/**
 * Notification - User notification
 */
export interface Notification {
  id: string
  userId: string
  type: 'intervention' | 'vehicle' | 'payment' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: string
  actionUrl?: string
}
