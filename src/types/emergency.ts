/**
 * Emergency Types - SOS & urgent assistance
 */

export type EmergencyType = 'breakdown' | 'accident' | 'tow' | 'flat_tire' | 'battery'

export type EmergencyStatus = 'pending' | 'mechanic_assigned' | 'in_progress' | 'resolved' | 'cancelled'

export interface EmergencyRequest {
  id: string
  userId: string
  type: EmergencyType
  location: {
    lat: number
    lng: number
    address: string
  }
  vehicleId: string
  description: string
  status: EmergencyStatus
  createdAt: string
  assignedMechanicId?: string
  estimatedArrival?: string
  resolvedAt?: string
}

export interface SOSSession {
  requestId: string
  mechanicLocation?: {
    lat: number
    lng: number
  }
  distance?: number // in km
  eta?: number // in minutes
  mechanicPhone?: string
  updates: SOSUpdate[]
}

export interface SOSUpdate {
  timestamp: string
  message: string
  type: 'info' | 'warning' | 'success'
}

export interface TowService {
  id: string
  name: string
  phone: string
  estimatedArrival: number // minutes
  price: number
}

