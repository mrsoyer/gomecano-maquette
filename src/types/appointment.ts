/**
 * Appointment Interface - Représente un rendez-vous d'intervention
 */
export interface Appointment {
  id: string
  clientId: string
  mechanicId?: string
  vehicleId: string
  serviceId: string
  scheduledAt: string
  address: string
  city: string
  zipCode: string
  status: AppointmentStatus
  price: number
  duration: number
  notes?: string
  createdAt: string
}

/**
 * Appointment Status - États possibles d'un rendez-vous
 */
export type AppointmentStatus = 
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

/**
 * Quote - Devis pour un service spécifique
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




