/**
 * Types for composables - Helper types for Supabase composables
 */

import type { Tables } from './database.types'

// Vehicle types
export interface VehicleSummary {
  id: string
  displayName: string
  makeName: string
  modelName: string
  plate: string
  year: number
  mileage?: number
  isPrimary: boolean
}

// Appointment filter types
export interface AppointmentFilters {
  status?: string | string[]
  dateFrom?: string
  dateTo?: string
  vehicleId?: string
  limit?: number
}

export interface AppointmentSummary {
  id: string
  serviceName: string
  vehicleName: string
  scheduledDate: string
  scheduledTime: string
  status: string
  price: number
}

// Content types
export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  coverImage: string | null
  category: BlogCategory | null
  author: BlogAuthor | null
  tags: string[]
  publishedAt: string
  readingTime: number
  viewCount: number
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
}

export interface BlogAuthor {
  id: string
  name: string
  bio: string | null
  avatar_url: string | null
}

export interface BlogListParams {
  category?: string
  search?: string
  limit?: number
  offset?: number
}

export interface FAQCategory {
  id: string
  name: string
  slug: string
  icon: string | null
  items: FAQItem[]
}

export interface FAQItem {
  id: string
  question: string
  answer: string
  isFeatured: boolean
  helpfulCount: number
  notHelpfulCount: number
}

export interface Testimonial {
  id: string
  type: 'b2c' | 'b2b' | 'mechanic'
  authorName: string
  authorRole: string | null
  authorCompany: string | null
  authorAvatar: string | null
  rating: number
  content: string
  isFeatured: boolean
}
