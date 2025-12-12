export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  avatar?: string
  role: UserRole
  createdAt: string
}

export type UserRole = 'client' | 'mechanic' | 'admin'

/**
 * Testimonial - Témoignage client sur un service
 */
export interface Testimonial {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  serviceId: string
  serviceName: string
  createdAt: string
  verified: boolean
}

/**
 * Mechanic - Profil d'un mécanicien Gomecano
 */
export interface Mechanic {
  id: string
  userId: string
  name: string
  avatar?: string
  rating: number
  reviewsCount: number
  specialties: string[]
  yearsExperience: number
  certifications: string[]
}




