/**
 * Mechanic Types
 * Types métier pour les mécaniciens
 */

import type { ServiceCategory } from './booking'

// Profil mécanicien public
export interface MechanicPublicProfile {
  id: string
  name: string
  avatarUrl?: string
  rating: number
  reviewsCount: number
  completedJobs: number
  yearsExperience: number
  specialties: ServiceCategory[]
  certifications: string[]
  bio?: string
  isAvailable: boolean
  responseTime?: string // "Répond en moins de 2h"
}

// Disponibilités mécanicien
export interface MechanicAvailability {
  mechanicId: string
  slots: AvailableSlot[]
}

export interface AvailableSlot {
  date: string // ISO date
  times: TimeSlot[]
}

export interface TimeSlot {
  id: string
  startTime: string // HH:mm
  endTime: string // HH:mm
  isAvailable: boolean
}

// Dashboard mécanicien
export interface MechanicDashboard {
  profile: MechanicProfile
  stats: MechanicStats
  todayAppointments: MechanicAppointment[]
  upcomingAppointments: MechanicAppointment[]
  pendingReviews: number
}

export interface MechanicProfile {
  id: string
  profileId: string
  name: string
  email: string
  phone: string
  avatarUrl?: string
  companyName?: string
  siret?: string
  isVerified: boolean
  rating: number
  reviewsCount: number
}

export interface MechanicStats {
  completedThisMonth: number
  revenueThisMonth: number
  averageRating: number
  acceptanceRate: number
  onTimeRate: number
}

export interface MechanicAppointment {
  id: string
  clientName: string
  clientPhone: string
  vehicleInfo: string // "Renault Clio - AB-123-CD"
  serviceName: string
  scheduledDate: string
  scheduledTime: string
  address: string
  city: string
  status: MechanicAppointmentStatus
  estimatedDuration: number
  estimatedPrice: number
  clientNotes?: string
  canAccept: boolean
  canStart: boolean
  canComplete: boolean
}

export type MechanicAppointmentStatus =
  | 'pending_acceptance'
  | 'accepted'
  | 'en_route'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

// Recherche mécanicien (matching)
export interface MechanicSearchParams {
  serviceId: string
  date: string
  latitude: number
  longitude: number
  radius?: number // km, default 30
}

export interface MechanicSearchResult {
  mechanic: MechanicPublicProfile
  distance: number // km
  nextAvailableSlot: AvailableSlot
  estimatedPrice: number
}

// Review du mécanicien
export interface MechanicReview {
  id: string
  authorName: string
  authorAvatar?: string
  rating: number
  comment: string
  serviceName: string
  createdAt: string
  response?: MechanicReviewResponse
}

export interface MechanicReviewResponse {
  content: string
  respondedAt: string
}

// Zone de couverture
export interface CoverageZone {
  id: string
  mechanicId: string
  center: {
    lat: number
    lng: number
  }
  radiusKm: number
  zipCodes: string[]
  isActive: boolean
}

// Certifications
export interface MechanicCertification {
  id: string
  name: string
  issuer: string
  issuedAt: string
  expiresAt?: string
  documentUrl?: string
  isVerified: boolean
}
