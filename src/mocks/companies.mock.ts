import type {
  CompanyAccount,
  CompanyUser,
  CompanySite,
  FleetVehicle,
  FleetBudget,
  FleetAnalytics,
  BudgetAlert,
  TrendData
} from '@/types/fleet'

/**
 * Mock Companies - B2B company accounts
 */
export const mockCompanies: CompanyAccount[] = [
  {
    id: 'company-1',
    name: 'Rapide Logistics',
    sites: [],
    subscription: {
      plan: 'professional',
      status: 'active',
      maxVehicles: 50,
      maxUsers: 10,
      startDate: '2024-01-01T00:00:00Z'
    },
    users: [],
    settings: {
      autoApproveUnder: 500,
      requiresApproval: true,
      emailNotifications: true,
      smsNotifications: false,
      maintenanceAlerts: true
    },
    createdAt: '2024-01-01T08:00:00Z'
  },
  {
    id: 'company-2',
    name: 'Green Transport SA',
    sites: [],
    subscription: {
      plan: 'enterprise',
      status: 'active',
      maxVehicles: 200,
      maxUsers: 50,
      startDate: '2023-09-01T00:00:00Z'
    },
    users: [],
    settings: {
      autoApproveUnder: 1000,
      requiresApproval: true,
      emailNotifications: true,
      smsNotifications: true,
      maintenanceAlerts: true
    },
    createdAt: '2023-09-01T10:00:00Z'
  }
]

/**
 * Mock Company Sites - Physical locations
 */
export const mockCompanySites: CompanySite[] = [
  // Rapide Logistics sites
  {
    id: 'site-1-1',
    name: 'Siège Paris',
    address: {
      street: '125 avenue de France',
      city: 'Paris',
      postalCode: '75013',
      country: 'France'
    },
    managerId: 'user-b2b-1',
    vehiclesCount: 15,
    phone: '0140000001',
    email: 'paris@rapidelogistics.fr'
  },
  {
    id: 'site-1-2',
    name: 'Agence Lyon',
    address: {
      street: '42 rue de la Part-Dieu',
      city: 'Lyon',
      postalCode: '69003',
      country: 'France'
    },
    managerId: 'comp-user-1-2',
    vehiclesCount: 8,
    phone: '0478000001',
    email: 'lyon@rapidelogistics.fr'
  },
  {
    id: 'site-1-3',
    name: 'Dépôt Marseille',
    address: {
      street: '15 boulevard Michelet',
      city: 'Marseille',
      postalCode: '13008',
      country: 'France'
    },
    managerId: 'comp-user-1-3',
    vehiclesCount: 12,
    phone: '0491000001',
    email: 'marseille@rapidelogistics.fr'
  },
  // Green Transport sites
  {
    id: 'site-2-1',
    name: 'Siège Bordeaux',
    address: {
      street: '88 cours Victor Hugo',
      city: 'Bordeaux',
      postalCode: '33000',
      country: 'France'
    },
    managerId: 'user-b2b-2',
    vehiclesCount: 45,
    phone: '0556000001',
    email: 'siege@greentransport.fr'
  },
  {
    id: 'site-2-2',
    name: 'Agence Toulouse',
    address: {
      street: '22 allée Jean Jaurès',
      city: 'Toulouse',
      postalCode: '31000',
      country: 'France'
    },
    managerId: 'comp-user-2-2',
    vehiclesCount: 28,
    phone: '0561000001',
    email: 'toulouse@greentransport.fr'
  }
]

/**
 * Mock Company Users - Users within companies
 */
export const mockCompanyUsers: CompanyUser[] = [
  // Rapide Logistics users
  {
    id: 'user-b2b-1',
    email: 'admin@rapidelogistics.fr',
    firstName: 'Pierre',
    lastName: 'Rousseau',
    role: 'owner',
    permissions: ['*'],
    assignedSites: ['site-1-1', 'site-1-2', 'site-1-3'],
    status: 'active',
    createdAt: '2024-01-01T08:00:00Z'
  },
  {
    id: 'comp-user-1-2',
    email: 'manager.lyon@rapidelogistics.fr',
    firstName: 'Julie',
    lastName: 'Bernard',
    role: 'fleet_manager',
    permissions: ['view_fleet', 'manage_interventions', 'view_reports'],
    assignedSites: ['site-1-2'],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'comp-user-1-3',
    email: 'manager.marseille@rapidelogistics.fr',
    firstName: 'Marc',
    lastName: 'Petit',
    role: 'fleet_manager',
    permissions: ['view_fleet', 'manage_interventions', 'view_reports'],
    assignedSites: ['site-1-3'],
    status: 'active',
    createdAt: '2024-02-01T09:00:00Z'
  },
  {
    id: 'comp-user-1-4',
    email: 'comptable@rapidelogistics.fr',
    firstName: 'Anne',
    lastName: 'Dubois',
    role: 'accountant',
    permissions: ['view_fleet', 'view_reports', 'export_invoices'],
    assignedSites: ['site-1-1', 'site-1-2', 'site-1-3'],
    status: 'active',
    createdAt: '2024-01-10T11:00:00Z'
  },
  // Green Transport users
  {
    id: 'user-b2b-2',
    email: 'admin@greentransport.fr',
    firstName: 'Claire',
    lastName: 'Moreau',
    role: 'owner',
    permissions: ['*'],
    assignedSites: ['site-2-1', 'site-2-2'],
    status: 'active',
    createdAt: '2023-09-01T10:00:00Z'
  },
  {
    id: 'comp-user-2-2',
    email: 'manager.toulouse@greentransport.fr',
    firstName: 'Luc',
    lastName: 'Garnier',
    role: 'fleet_manager',
    permissions: ['view_fleet', 'manage_interventions', 'view_reports'],
    assignedSites: ['site-2-2'],
    status: 'active',
    createdAt: '2023-09-15T14:00:00Z'
  },
  {
    id: 'comp-user-2-3',
    email: 'admin@greentransport.fr',
    firstName: 'Sophie',
    lastName: 'Leroy',
    role: 'admin',
    permissions: ['view_fleet', 'manage_users', 'manage_interventions', 'view_reports', 'manage_sites'],
    assignedSites: ['site-2-1', 'site-2-2'],
    status: 'active',
    createdAt: '2023-10-01T09:00:00Z'
  }
]

/**
 * Mock Fleet Vehicles - Vehicles in company fleets
 */
export const mockFleetVehicles: FleetVehicle[] = [
  // Rapide Logistics - Site Paris
  {
    id: 'fleet-veh-1',
    make: 'Renault',
    model: 'Master',
    year: 2022,
    plate: 'FN-123-AB',
    mileage: 35000,
    fuelType: 'diesel',
    siteId: 'site-1-1',
    assignedDriver: 'Jean Dupont',
    category: 'utilitaire',
    acquisitionDate: '2022-03-01',
    maintenanceCosts: 1250,
    totalCosts: 3800,
    status: 'active'
  },
  {
    id: 'fleet-veh-2',
    make: 'Peugeot',
    model: 'Expert',
    year: 2021,
    plate: 'FN-124-CD',
    mileage: 52000,
    fuelType: 'diesel',
    siteId: 'site-1-1',
    assignedDriver: 'Marie Leroux',
    category: 'commercial',
    acquisitionDate: '2021-06-15',
    maintenanceCosts: 2100,
    totalCosts: 5200,
    status: 'active'
  },
  {
    id: 'fleet-veh-3',
    make: 'Citroën',
    model: 'Berlingo',
    year: 2023,
    plate: 'FN-125-EF',
    mileage: 18000,
    fuelType: 'diesel',
    siteId: 'site-1-1',
    assignedDriver: 'Paul Martin',
    category: 'service',
    acquisitionDate: '2023-01-10',
    maintenanceCosts: 450,
    totalCosts: 1200,
    status: 'active'
  },
  // Rapide Logistics - Site Lyon
  {
    id: 'fleet-veh-4',
    make: 'Renault',
    model: 'Kangoo',
    year: 2020,
    plate: 'FN-126-GH',
    mileage: 68000,
    fuelType: 'diesel',
    siteId: 'site-1-2',
    assignedDriver: 'Luc Bernard',
    category: 'utilitaire',
    acquisitionDate: '2020-09-01',
    maintenanceCosts: 3200,
    totalCosts: 7500,
    status: 'maintenance'
  },
  {
    id: 'fleet-veh-5',
    make: 'Mercedes',
    model: 'Sprinter',
    year: 2022,
    plate: 'FN-127-IJ',
    mileage: 42000,
    fuelType: 'diesel',
    siteId: 'site-1-2',
    assignedDriver: 'Sophie Petit',
    category: 'utilitaire',
    acquisitionDate: '2022-04-20',
    maintenanceCosts: 1800,
    totalCosts: 4100,
    status: 'active'
  },
  // Green Transport - Site Bordeaux
  {
    id: 'fleet-veh-6',
    make: 'Volkswagen',
    model: 'Crafter',
    year: 2021,
    plate: 'GT-201-AA',
    mileage: 55000,
    fuelType: 'diesel',
    siteId: 'site-2-1',
    assignedDriver: 'Thomas Blanc',
    category: 'utilitaire',
    acquisitionDate: '2021-07-01',
    maintenanceCosts: 2450,
    totalCosts: 5800,
    status: 'active'
  },
  {
    id: 'fleet-veh-7',
    make: 'Ford',
    model: 'Transit',
    year: 2022,
    plate: 'GT-202-BB',
    mileage: 38000,
    fuelType: 'diesel',
    siteId: 'site-2-1',
    assignedDriver: 'Julie Roux',
    category: 'commercial',
    acquisitionDate: '2022-02-15',
    maintenanceCosts: 1600,
    totalCosts: 3900,
    status: 'active'
  },
  {
    id: 'fleet-veh-8',
    make: 'Peugeot',
    model: '5008',
    year: 2023,
    plate: 'GT-203-CC',
    mileage: 15000,
    fuelType: 'hybride',
    siteId: 'site-2-1',
    assignedDriver: 'Direction',
    category: 'direction',
    acquisitionDate: '2023-03-01',
    maintenanceCosts: 320,
    totalCosts: 850,
    status: 'active'
  }
]

/**
 * Mock Fleet Budgets
 */
export const mockFleetBudgets: Record<string, FleetBudget> = {
  'company-1': {
    monthly: 8000,
    yearly: 96000,
    currentMonthSpent: 6250,
    projectedMonthSpend: 7800,
    alerts: [
      {
        id: 'alert-1-1',
        type: 'warning',
        threshold: 0.8,
        currentValue: 0.78,
        severity: 'medium',
        message: 'Budget mensuel à 78%, attention aux dépenses'
      }
    ]
  },
  'company-2': {
    monthly: 25000,
    yearly: 300000,
    currentMonthSpent: 18500,
    projectedMonthSpend: 23000,
    alerts: []
  }
}

/**
 * Mock Fleet Analytics
 */
export const mockFleetAnalytics: Record<string, FleetAnalytics> = {
  'company-1': {
    costPerKm: 0.42,
    averageMaintenanceCost: 1450,
    maintenanceFrequency: 3.2,
    topSpendingVehicles: [],
    costTrend: generateCostTrendData(),
    vehicleUtilization: 87,
    downtime: 2.3
  },
  'company-2': {
    costPerKm: 0.38,
    averageMaintenanceCost: 1280,
    maintenanceFrequency: 2.8,
    topSpendingVehicles: [],
    costTrend: generateCostTrendData(),
    vehicleUtilization: 92,
    downtime: 1.8
  }
}

/**
 * Generate mock cost trend data
 */
function generateCostTrendData(): TrendData[] {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  const data: TrendData[] = []
  
  for (let i = 0; i < 6; i++) {
    const monthIndex = new Date().getMonth() - (5 - i)
    const month = months[monthIndex < 0 ? 12 + monthIndex : monthIndex]
    data.push({
      date: `2024-${String(monthIndex + 1).padStart(2, '0')}-01`,
      value: Math.floor(5000 + Math.random() * 3000),
      label: month
    })
  }
  
  return data
}

// Update companies with sites and users
mockCompanies[0].sites = mockCompanySites.filter(s => s.id.startsWith('site-1'))
mockCompanies[0].users = mockCompanyUsers.filter(u => u.id.startsWith('comp-user-1') || u.id === 'user-b2b-1')
mockCompanies[1].sites = mockCompanySites.filter(s => s.id.startsWith('site-2'))
mockCompanies[1].users = mockCompanyUsers.filter(u => u.id.startsWith('comp-user-2') || u.id === 'user-b2b-2')

/**
 * Get company by ID
 */
export function getCompanyById(id: string): CompanyAccount | undefined {
  return mockCompanies.find(c => c.id === id)
}

/**
 * Get company users
 */
export function getCompanyUsers(companyId: string): CompanyUser[] {
  const company = getCompanyById(companyId)
  return company?.users || []
}

/**
 * Get fleet vehicles by site
 */
export function getFleetVehiclesBySite(siteId: string): FleetVehicle[] {
  return mockFleetVehicles.filter(v => v.siteId === siteId)
}

/**
 * Get all fleet vehicles for company
 */
export function getCompanyFleetVehicles(companyId: string): FleetVehicle[] {
  const company = getCompanyById(companyId)
  if (!company) return []
  
  const siteIds = company.sites.map(s => s.id)
  return mockFleetVehicles.filter(v => siteIds.includes(v.siteId))
}

/**
 * Get fleet budget for company
 */
export function getFleetBudget(companyId: string): FleetBudget | undefined {
  return mockFleetBudgets[companyId]
}

/**
 * Get fleet analytics for company
 */
export function getFleetAnalytics(companyId: string): FleetAnalytics | undefined {
  const analytics = mockFleetAnalytics[companyId]
  if (!analytics) return undefined
  
  // Calculate top spending vehicles
  const vehicles = getCompanyFleetVehicles(companyId)
  analytics.topSpendingVehicles = [...vehicles]
    .sort((a, b) => b.totalCosts - a.totalCosts)
    .slice(0, 5)
  
  return analytics
}
