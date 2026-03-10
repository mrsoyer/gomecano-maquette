/**
 * B2B Data Transformations
 * Transforms snake_case DB responses to camelCase frontend types
 */

import type {
  CompanyAccount,
  CompanyUser,
  CompanySite,
  CompanySubscription,
  CompanySettings,
  FleetVehicle,
  FleetBudget,
  FleetAnalytics,
  BudgetAlert,
  TrendData,
  CompanyRole
} from '@/types/fleet'
import type { Address } from '@/types/account'

// ============================================
// Company Transformations
// ============================================

/**
 * Transform company data from DB to frontend type
 */
export function transformCompanyFromDB(data: Record<string, unknown>): CompanyAccount {
  return {
    id: data.id as string,
    name: data.name as string,
    sites: Array.isArray(data.sites)
      ? data.sites.map(transformSiteFromDB)
      : [],
    subscription: transformSubscriptionFromDB(data),
    users: Array.isArray(data.users)
      ? data.users.map(transformUserFromDB)
      : [],
    settings: transformSettingsFromDB(data),
    createdAt: data.created_at as string
  }
}

/**
 * Transform subscription from DB response
 */
function transformSubscriptionFromDB(data: Record<string, unknown>): CompanySubscription {
  return {
    plan: (data.subscription_plan as CompanySubscription['plan']) || 'starter',
    status: (data.subscription_status as CompanySubscription['status']) || 'active',
    maxVehicles: (data.max_vehicles as number) || 0,
    maxUsers: (data.max_users as number) || 0,
    startDate: (data.start_date as string) || new Date().toISOString(),
    endDate: data.end_date as string | undefined
  }
}

/**
 * Transform settings from DB response
 */
function transformSettingsFromDB(data: Record<string, unknown>): CompanySettings {
  return {
    autoApproveUnder: (data.auto_approve_under as number) || 0,
    requiresApproval: (data.requires_approval as boolean) ?? true,
    emailNotifications: (data.email_notifications as boolean) ?? true,
    smsNotifications: (data.sms_notifications as boolean) ?? false,
    maintenanceAlerts: (data.maintenance_alerts as boolean) ?? true
  }
}

// ============================================
// User Transformations
// ============================================

/**
 * Transform company user from DB to frontend type
 */
export function transformUserFromDB(data: Record<string, unknown>): CompanyUser {
  return {
    id: data.id as string,
    email: data.email as string,
    firstName: data.first_name as string,
    lastName: data.last_name as string,
    role: (data.role as CompanyRole) || 'driver',
    permissions: Array.isArray(data.permissions) ? data.permissions : [],
    assignedSites: Array.isArray(data.assigned_sites) ? data.assigned_sites : [],
    status: (data.status as CompanyUser['status']) || 'active',
    createdAt: data.created_at as string
  }
}

/**
 * Transform company user to DB format
 */
export function transformUserToDB(user: Partial<CompanyUser>): Record<string, unknown> {
  return {
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    role: user.role,
    permissions: user.permissions,
    assigned_sites: user.assignedSites,
    status: user.status
  }
}

// ============================================
// Site Transformations
// ============================================

/**
 * Transform company site from DB to frontend type
 */
export function transformSiteFromDB(data: Record<string, unknown>): CompanySite {
  const address = data.address as Record<string, unknown> | undefined

  return {
    id: data.id as string,
    name: data.name as string,
    address: address ? transformAddressFromDB(address) : {
      street: '',
      city: '',
      postalCode: '',
      country: 'France'
    },
    managerId: data.manager_id as string,
    vehiclesCount: (data.vehicles_count as number) || 0,
    phone: data.phone as string | undefined,
    email: data.email as string | undefined
  }
}

/**
 * Transform address from DB format
 */
function transformAddressFromDB(data: Record<string, unknown>): Address {
  return {
    street: data.street as string,
    city: data.city as string,
    postalCode: data.postal_code as string,
    country: (data.country as string) || 'France'
  }
}

/**
 * Transform site to DB format
 */
export function transformSiteToDB(site: Partial<CompanySite>): Record<string, unknown> {
  return {
    name: site.name,
    address: site.address ? {
      street: site.address.street,
      city: site.address.city,
      postal_code: site.address.postalCode,
      country: site.address.country
    } : undefined,
    manager_id: site.managerId,
    phone: site.phone,
    email: site.email
  }
}

// ============================================
// Fleet Vehicle Transformations
// ============================================

/**
 * Transform fleet vehicle from DB to frontend type
 */
export function transformFleetVehicleFromDB(data: Record<string, unknown>): FleetVehicle {
  return {
    id: data.id as string,
    make: data.make as string,
    model: data.model as string,
    year: data.year as number,
    plate: data.plate as string,
    mileage: (data.mileage as number) || 0,
    fuelType: data.fuel_type as string,
    siteId: data.site_id as string,
    assignedDriver: data.assigned_driver as string | undefined,
    category: (data.category as FleetVehicle['category']) || 'utilitaire',
    acquisitionDate: data.acquisition_date as string,
    maintenanceCosts: (data.maintenance_costs as number) || 0,
    totalCosts: (data.total_costs as number) || 0,
    status: (data.status as FleetVehicle['status']) || 'active'
  }
}

/**
 * Transform fleet vehicle to DB format
 */
export function transformFleetVehicleToDB(vehicle: Partial<FleetVehicle>): Record<string, unknown> {
  return {
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    plate: vehicle.plate,
    mileage: vehicle.mileage,
    fuel_type: vehicle.fuelType,
    site_id: vehicle.siteId,
    assigned_driver: vehicle.assignedDriver,
    category: vehicle.category,
    acquisition_date: vehicle.acquisitionDate,
    maintenance_costs: vehicle.maintenanceCosts,
    total_costs: vehicle.totalCosts,
    status: vehicle.status
  }
}

// ============================================
// Budget Transformations
// ============================================

/**
 * Transform fleet budget from DB to frontend type
 */
export function transformBudgetFromDB(data: Record<string, unknown>): FleetBudget {
  return {
    monthly: (data.monthly as number) || 0,
    yearly: (data.yearly as number) || 0,
    currentMonthSpent: (data.current_month_spent as number) || 0,
    projectedMonthSpend: (data.projected_month_spend as number) || 0,
    alerts: Array.isArray(data.alerts)
      ? data.alerts.map(transformAlertFromDB)
      : []
  }
}

/**
 * Transform budget alert from DB
 */
function transformAlertFromDB(data: Record<string, unknown>): BudgetAlert {
  return {
    id: data.id as string,
    type: (data.type as BudgetAlert['type']) || 'warning',
    threshold: (data.threshold as number) || 0,
    currentValue: (data.current_value as number) || 0,
    severity: (data.severity as BudgetAlert['severity']) || 'low',
    message: data.message as string
  }
}

/**
 * Transform budget to DB format
 */
export function transformBudgetToDB(budget: Partial<FleetBudget>): Record<string, unknown> {
  return {
    monthly: budget.monthly,
    yearly: budget.yearly
  }
}

// ============================================
// Analytics Transformations
// ============================================

/**
 * Transform fleet analytics from DB to frontend type
 */
export function transformAnalyticsFromDB(data: Record<string, unknown>): FleetAnalytics {
  return {
    costPerKm: (data.cost_per_km as number) || 0,
    averageMaintenanceCost: (data.average_maintenance_cost as number) || 0,
    maintenanceFrequency: (data.maintenance_frequency as number) || 0,
    topSpendingVehicles: Array.isArray(data.top_spending_vehicles)
      ? data.top_spending_vehicles.map(transformFleetVehicleFromDB)
      : [],
    costTrend: Array.isArray(data.cost_trend)
      ? data.cost_trend.map(transformTrendFromDB)
      : [],
    vehicleUtilization: (data.vehicle_utilization as number) || 0,
    downtime: (data.downtime as number) || 0
  }
}

/**
 * Transform trend data from DB
 */
function transformTrendFromDB(data: Record<string, unknown>): TrendData {
  return {
    date: data.date as string,
    value: (data.value as number) || 0,
    label: data.label as string | undefined
  }
}
