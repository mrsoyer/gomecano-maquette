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
 * Extended with additional fields from account management
 */
export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  avatarUrl?: string
  address?: Address
  preferences?: UserPreferences
  loyaltyPoints?: number
  dateOfBirth?: string
  locale?: string
  timezone?: string
  createdAt?: string
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

/**
 * Dashboard & Stats
 */

/**
 * User Dashboard - Main dashboard data
 */
export interface UserDashboard {
  profile: UserProfile
  stats: UserStats
  upcomingAppointments: AppointmentSummary[]
  recentVehicles: VehicleSummary[]
  unreadNotifications: number
}

/**
 * User Stats - User statistics
 */
export interface UserStats {
  totalAppointments: number
  totalSpent: number
  vehiclesCount: number
  memberSince: string
  loyaltyPoints?: number
}

/**
 * Appointment Summary - Brief appointment info for lists
 */
export interface AppointmentSummary {
  id: string
  serviceName: string
  vehicleName: string
  scheduledDate: string
  scheduledTime: string
  status: AppointmentStatusType
  mechanicName?: string
  estimatedPrice?: number
}

export type AppointmentStatusType =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

/**
 * Vehicle Summary - Brief vehicle info for lists
 */
export interface VehicleSummary {
  id: string
  displayName: string // "Renault Clio (AB-123-CD)"
  makeName: string
  modelName: string
  plate: string
  year: number
  mileage?: number
  nextMaintenanceDate?: string
  isPrimary: boolean
}

/**
 * Intervention History - Historical intervention record
 */
export interface InterventionHistory {
  id: string
  date: string
  serviceName: string
  vehicleName: string
  mechanicName: string
  status: string
  finalPrice: number
  invoiceUrl?: string
  canReview: boolean
  hasReview: boolean
}

/**
 * Account Settings
 */

/**
 * Account Settings - Complete account settings
 */
export interface AccountSettings {
  profile: ProfileSettings
  notifications: NotificationSettings
  privacy: PrivacySettings
  security: SecuritySettings
}

/**
 * Profile Settings - User profile settings
 */
export interface ProfileSettings {
  firstName: string
  lastName: string
  email: string
  phone: string
  avatarUrl?: string
  dateOfBirth?: string
  locale: string
  timezone: string
}

/**
 * Notification Settings - Notification preferences
 */
export interface NotificationSettings {
  emailMarketing: boolean
  emailReminders: boolean
  emailUpdates: boolean
  smsReminders: boolean
  smsPromotions: boolean
  pushEnabled: boolean
  pushAppointments: boolean
  pushPromotions: boolean
}

/**
 * Privacy Settings - Privacy preferences
 */
export interface PrivacySettings {
  shareLocation: boolean
  shareVehicleData: boolean
  analyticsEnabled: boolean
  personalizedAds: boolean
}

/**
 * Security Settings - Security configuration
 */
export interface SecuritySettings {
  twoFactorEnabled: boolean
  lastPasswordChange?: string
  activeSessions: SessionInfo[]
}

/**
 * Session Info - Active session information
 */
export interface SessionInfo {
  id: string
  device: string
  location: string
  lastActive: string
  isCurrent: boolean
}

/**
 * Family Sharing
 */

/**
 * Family Member - Family sharing member
 */
export interface FamilyMember {
  id: string
  profileId: string
  name: string
  email: string
  relationship?: string
  permissions: FamilyPermissions
  status: 'active' | 'pending'
  addedAt: string
}

/**
 * Family Permissions - Family member permissions
 */
export interface FamilyPermissions {
  canBook: boolean
  canViewHistory: boolean
  canManageVehicles: boolean
  canManagePayments: boolean
}

/**
 * Family Invitation - Family sharing invitation
 */
export interface FamilyInvitation {
  id: string
  email: string
  permissions: FamilyPermissions
  status: 'pending' | 'accepted' | 'expired'
  expiresAt: string
  createdAt: string
}

/**
 * Documents
 */

/**
 * User Document - User uploaded document
 */
export interface UserDocument {
  id: string
  type: DocumentType
  title: string
  fileUrl: string
  fileSize: number
  mimeType: string
  uploadedAt: string
  expiresAt?: string
}

export type DocumentType =
  | 'invoice'
  | 'quote'
  | 'report'
  | 'warranty'
  | 'insurance'
  | 'other'
