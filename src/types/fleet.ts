import type { Vehicle } from './vehicle'
import type { Address } from './account'

/**
 * Company Account - B2B company account
 */
export interface CompanyAccount {
  id: string
  name: string
  sites: CompanySite[]
  subscription: CompanySubscription
  users: CompanyUser[]
  settings: CompanySettings
  createdAt: string
}

/**
 * Company User - User within a company
 */
export interface CompanyUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: CompanyRole
  permissions: Permission[]
  assignedSites: string[]
  status: 'active' | 'pending' | 'suspended'
  createdAt: string
}

/**
 * Company Role - User role in company
 */
export type CompanyRole =
  | 'owner'
  | 'admin'
  | 'fleet_manager'
  | 'accountant'
  | 'driver'

/**
 * Permission - Granular permission
 */
export type Permission = string

/**
 * Company Site - Physical company location
 */
export interface CompanySite {
  id: string
  name: string
  address: Address
  managerId: string
  vehiclesCount: number
  phone?: string
  email?: string
}

/**
 * Company Subscription - Company subscription plan
 */
export interface CompanySubscription {
  plan: 'starter' | 'professional' | 'enterprise'
  status: 'active' | 'trial' | 'cancelled' | 'expired'
  maxVehicles: number
  maxUsers: number
  startDate: string
  endDate?: string
}

/**
 * Company Settings - Company-wide settings
 */
export interface CompanySettings {
  autoApproveUnder: number
  requiresApproval: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  maintenanceAlerts: boolean
}

/**
 * Company Fleet - Complete fleet management
 */
export interface CompanyFleet {
  id: string
  companyId: string
  vehicles: FleetVehicle[]
  totalVehicles: number
  activeVehicles: number
  sites: CompanySite[]
  budget: FleetBudget
  analytics: FleetAnalytics
}

/**
 * Fleet Vehicle - Vehicle in fleet (extends base Vehicle)
 */
export interface FleetVehicle extends Vehicle {
  siteId: string
  assignedDriver?: string
  category: VehicleCategory
  acquisitionDate: string
  maintenanceCosts: number
  totalCosts: number
  status: 'active' | 'maintenance' | 'retired'
}

/**
 * Vehicle Category - Fleet vehicle category
 */
export type VehicleCategory =
  | 'utilitaire'
  | 'commercial'
  | 'service'
  | 'direction'

/**
 * Fleet Budget - Budget management
 */
export interface FleetBudget {
  monthly: number
  yearly: number
  currentMonthSpent: number
  projectedMonthSpend: number
  alerts: BudgetAlert[]
}

/**
 * Budget Alert - Budget threshold alert
 */
export interface BudgetAlert {
  id: string
  type: 'warning' | 'critical'
  threshold: number
  currentValue: number
  severity: 'low' | 'medium' | 'high'
  message: string
}

/**
 * Fleet Analytics - Fleet KPIs and analytics
 */
export interface FleetAnalytics {
  costPerKm: number
  averageMaintenanceCost: number
  maintenanceFrequency: number
  topSpendingVehicles: FleetVehicle[]
  costTrend: TrendData[]
  vehicleUtilization: number
  downtime: number
}

/**
 * Trend Data - Time series data for charts
 */
export interface TrendData {
  date: string
  value: number
  label?: string
}
