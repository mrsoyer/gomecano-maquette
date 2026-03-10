/**
 * Vehicle Interface - Représente un véhicule client
 */
export interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  plate?: string
  mileage?: number
  vin?: string
  fuelType?: FuelType
}

/**
 * Fuel Types - Types de carburant disponibles
 */
export type FuelType = 'essence' | 'diesel' | 'electrique' | 'hybride'

export interface VehicleMake {
  id: string
  name: string
  logo?: string
}

export interface VehicleModel {
  id: string
  makeId: string
  name: string
  years: number[]
}

/**
 * Vehicle Document - Documents liés au véhicule
 */
export interface VehicleDocument {
  id: string
  vehicleId: string
  type: 'insurance' | 'registration' | 'control_technique' | 'warranty' | 'invoice' | 'other'
  title: string
  description?: string
  url: string
  fileSize?: number // bytes
  mimeType?: string
  expiresAt?: string
  uploadedAt: string
  isExpiringSoon?: boolean
}

/**
 * Maintenance Reminder - Rappels d'entretien
 */
export interface MaintenanceReminder {
  id: string
  vehicleId: string
  type: 'oil_change' | 'tires' | 'brakes' | 'control_technique' | 'distribution' | 'filters' | 'coolant' | 'battery'
  title: string
  description: string
  dueDate?: string
  dueMileage?: number
  currentMileage: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'upcoming' | 'due' | 'overdue' | 'completed'
  isCompleted: boolean
  completedAt?: string
  estimatedCost?: number
}

/**
 * Fuel Log - Journal de carburant
 */
export interface FuelLog {
  id: string
  vehicleId: string
  date: string
  mileage: number
  liters: number
  totalCost: number
  pricePerLiter: number
  fuelType: FuelType
  station?: string
  city?: string
  isFull: boolean
  tripDistance?: number
  consumption?: number // L/100km
  notes?: string
}

/**
 * Warranty Info - Informations garantie
 */
export interface WarrantyInfo {
  id: string
  vehicleId: string
  type: 'manufacturer' | 'extended' | 'parts'
  provider: string
  contractNumber?: string
  startDate: string
  endDate: string
  maxMileage?: number
  currentMileage: number
  coverage: string[]
  isActive: boolean
  isExpiringSoon: boolean
  daysRemaining?: number
  documentId?: string
}

/**
 * Carbon Footprint - Empreinte carbone
 */
export interface CarbonFootprint {
  vehicleId: string
  vehicleName: string
  totalKmYear: number
  totalKmLifetime: number
  co2EmissionPerKm: number // g/km
  totalCo2Year: number // kg
  totalCo2Lifetime: number // kg
  comparedToAverage: number // % (positif = plus polluant, négatif = moins polluant)
  ecoRating: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
  suggestions: string[]
  equivalents: {
    trees: number // arbres à planter pour compenser
    flights: number // équivalent en vols Paris-Londres
  }
}
