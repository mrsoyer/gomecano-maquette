/**
 * Analytics Mock Data - Expense trends, predictions, budget alerts
 */

import type {
  ExpenseTrend,
  ExpenseTrendDataPoint,
  BudgetAlert,
  Prediction,
  VehicleComparison,
  VehicleComparisonMetric,
  AnnualReport,
  BudgetConfig,
  AnalyticsDashboard
} from '@/types/analytics'

/**
 * Generate monthly data points (last 12 months)
 */
function generateMonthlyDataPoints(): ExpenseTrendDataPoint[] {
  const dataPoints: ExpenseTrendDataPoint[] = []
  const now = new Date()
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const month = date.toISOString().slice(0, 7) // YYYY-MM
    
    // Simulate realistic expenses with some variation
    const baseExpense = 150 + Math.random() * 200
    const interventionCount = Math.floor(1 + Math.random() * 3)
    
    dataPoints.push({
      month,
      totalExpenses: Math.round(baseExpense * interventionCount),
      interventionCount,
      averagePerIntervention: Math.round(baseExpense),
      categories: {
        maintenance: Math.round(baseExpense * 0.4 * interventionCount),
        repair: Math.round(baseExpense * 0.3 * interventionCount),
        diagnostic: Math.round(baseExpense * 0.2 * interventionCount),
        parts: Math.round(baseExpense * 0.1 * interventionCount)
      }
    })
  }
  
  return dataPoints
}

/**
 * Mock expense trend
 */
export const mockExpenseTrend: ExpenseTrend = {
  userId: 'user-1',
  vehicleId: undefined, // All vehicles
  period: 'year',
  dataPoints: generateMonthlyDataPoints(),
  summary: {
    totalExpenses: 2850,
    averageMonthly: 237.5,
    highestMonth: '2024-08',
    lowestMonth: '2024-02',
    trend: 'increasing',
    percentageChange: 12.5
  }
}

/**
 * Mock budget alerts
 */
export const mockBudgetAlerts: BudgetAlert[] = [
  {
    id: 'alert-1',
    userId: 'user-1',
    severity: 'warning',
    type: 'approaching_limit',
    title: 'Budget mensuel à 85%',
    message: 'Vous avez dépensé 255€ sur un budget de 300€ ce mois-ci. Il reste 45€ disponibles.',
    currentAmount: 255,
    budgetLimit: 300,
    percentageUsed: 85,
    recommendations: [
      'Reporter la vidange au mois prochain',
      'Comparer les prix pour les prochaines interventions',
      'Envisager un forfait entretien pour économiser'
    ],
    createdAt: new Date().toISOString(),
    isRead: false,
    isDismissed: false
  },
  {
    id: 'alert-2',
    userId: 'user-1',
    vehicleId: 'vehicle-1',
    severity: 'info',
    type: 'recommendation',
    title: 'Économies possibles détectées',
    message: 'Vous pourriez économiser ~80€/an en passant à un forfait entretien annuel.',
    currentAmount: 450,
    recommendations: [
      'Forfait Sérénité : 399€/an (au lieu de 480€)',
      'Inclut 2 vidanges + révision + contrôle freins',
      'Économie de 81€ + priorité sur les créneaux'
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    isDismissed: false
  },
  {
    id: 'alert-3',
    userId: 'user-1',
    vehicleId: 'vehicle-2',
    severity: 'critical',
    type: 'overspending',
    title: 'Budget dépassé - Renault Clio',
    message: 'Les dépenses pour la Clio ont dépassé la limite mensuelle de 150€.',
    currentAmount: 185,
    budgetLimit: 150,
    percentageUsed: 123,
    recommendations: [
      'Revoir la limite budgétaire pour ce véhicule',
      'Analyser les causes (réparation imprévue ?)',
      'Activer les alertes à 50% du budget'
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    isDismissed: false
  }
]

/**
 * Mock predictions
 */
export const mockPredictions: Prediction[] = [
  {
    id: 'pred-1',
    userId: 'user-1',
    vehicleId: 'vehicle-1',
    type: 'maintenance',
    title: 'Vidange recommandée',
    description: 'Basé sur votre kilométrage actuel (18,500 km) et la dernière vidange il y a 8 mois, une vidange est recommandée dans les 2 prochains mois.',
    predictedDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    predictedAmount: 89,
    confidence: 'high',
    basedOn: {
      historicalData: true,
      mileage: true,
      vehicleAge: false,
      manufacturerSchedule: true
    },
    relatedServices: ['service-1'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'pred-2',
    userId: 'user-1',
    vehicleId: 'vehicle-1',
    type: 'maintenance',
    title: 'Remplacement plaquettes de frein',
    description: 'Vos plaquettes avant ont été changées il y a 18 mois. Basé sur votre utilisation, un remplacement sera nécessaire dans ~4 mois.',
    predictedDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    predictedAmount: 165,
    confidence: 'medium',
    basedOn: {
      historicalData: true,
      mileage: true,
      vehicleAge: false,
      manufacturerSchedule: false
    },
    relatedServices: ['service-5'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'pred-3',
    userId: 'user-1',
    vehicleId: 'vehicle-2',
    type: 'total_expenses',
    title: 'Budget prévisionnel - Décembre 2024',
    description: 'Basé sur vos dépenses historiques, nous estimons un budget de ~220€ pour décembre (révision annuelle).',
    predictedDate: '2024-12-15',
    predictedAmount: 220,
    confidence: 'high',
    basedOn: {
      historicalData: true,
      mileage: false,
      vehicleAge: true,
      manufacturerSchedule: true
    },
    relatedServices: ['service-2', 'service-6'],
    createdAt: new Date().toISOString()
  }
]

/**
 * Mock vehicle comparison
 */
export const mockVehicleComparison: VehicleComparison = {
  userId: 'user-1',
  period: 'year',
  vehicles: [
    {
      vehicleId: 'vehicle-1',
      vehicleName: 'Peugeot 308 (2020)',
      totalExpenses: 1650,
      interventionCount: 8,
      averagePerIntervention: 206,
      lastInterventionDate: '2024-10-15',
      nextMaintenanceDate: '2025-01-15',
      efficiency: 'good'
    },
    {
      vehicleId: 'vehicle-2',
      vehicleName: 'Renault Clio (2018)',
      totalExpenses: 1200,
      interventionCount: 6,
      averagePerIntervention: 200,
      lastInterventionDate: '2024-09-20',
      nextMaintenanceDate: '2024-12-20',
      efficiency: 'excellent'
    }
  ],
  insights: {
    mostExpensive: 'vehicle-1',
    mostEfficient: 'vehicle-2',
    totalSavingsPotential: 150,
    recommendations: [
      'La Peugeot 308 a des frais 37% plus élevés que la Clio',
      'Envisager un forfait entretien pour la 308',
      'La Clio est très efficiente malgré son âge (2018)'
    ]
  }
}

/**
 * Mock annual report
 */
export const mockAnnualReport: AnnualReport = {
  userId: 'user-1',
  year: 2024,
  summary: {
    totalExpenses: 2850,
    interventionCount: 14,
    vehicleCount: 2,
    averagePerVehicle: 1425,
    comparedToPreviousYear: {
      percentage: 8.5,
      trend: 'increased'
    }
  },
  byCategory: [
    {
      name: 'Maintenance',
      amount: 1140,
      percentage: 40,
      count: 7
    },
    {
      name: 'Réparation',
      amount: 855,
      percentage: 30,
      count: 4
    },
    {
      name: 'Diagnostic',
      amount: 570,
      percentage: 20,
      count: 2
    },
    {
      name: 'Pièces',
      amount: 285,
      percentage: 10,
      count: 1
    }
  ],
  byVehicle: [
    {
      vehicleId: 'vehicle-1',
      vehicleName: 'Peugeot 308 (2020)',
      expenses: 1650,
      interventions: 8
    },
    {
      vehicleId: 'vehicle-2',
      vehicleName: 'Renault Clio (2018)',
      expenses: 1200,
      interventions: 6
    }
  ],
  monthlyBreakdown: generateMonthlyDataPoints().map(dp => ({
    month: dp.month,
    expenses: dp.totalExpenses,
    interventions: dp.interventionCount
  })),
  topServices: [
    {
      serviceId: 'service-1',
      serviceName: 'Vidange',
      count: 4,
      totalAmount: 356
    },
    {
      serviceId: 'service-2',
      serviceName: 'Révision complète',
      count: 2,
      totalAmount: 440
    },
    {
      serviceId: 'service-5',
      serviceName: 'Freins',
      count: 2,
      totalAmount: 330
    }
  ],
  insights: [
    '📈 Vos dépenses ont augmenté de 8.5% par rapport à 2023',
    '🎯 Vous avez respecté votre budget mensuel 9 mois sur 12',
    '💡 Économie potentielle de 150€ avec un forfait annuel',
    '🚗 La Clio est votre véhicule le plus rentable (-27% de frais)',
    '⚠️ Augmentation des frais de réparation (+15% vs 2023)'
  ],
  downloadUrl: '/api/reports/annual-2024.pdf'
}

/**
 * Mock budget config
 */
export const mockBudgetConfig: BudgetConfig = {
  userId: 'user-1',
  monthlyLimit: 300,
  alertThreshold: 80,
  categories: {
    maintenance: 150,
    repair: 100,
    diagnostic: 50
  },
  vehicleLimits: [
    {
      vehicleId: 'vehicle-1',
      limit: 180
    },
    {
      vehicleId: 'vehicle-2',
      limit: 120
    }
  ]
}

/**
 * Mock analytics dashboard
 */
export const mockAnalyticsDashboard: AnalyticsDashboard = {
  trends: mockExpenseTrend,
  alerts: mockBudgetAlerts,
  predictions: mockPredictions,
  comparison: mockVehicleComparison,
  currentMonthExpenses: 255,
  budgetRemaining: 45,
  budgetConfig: mockBudgetConfig
}

/**
 * Get analytics dashboard for user
 */
export async function getAnalyticsDashboard(userId: string): Promise<AnalyticsDashboard> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  return mockAnalyticsDashboard
}

/**
 * Get budget alerts for user
 */
export async function getBudgetAlerts(userId: string): Promise<BudgetAlert[]> {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return mockBudgetAlerts.filter(alert => alert.userId === userId)
}

/**
 * Dismiss budget alert
 */
export async function dismissBudgetAlert(alertId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const alert = mockBudgetAlerts.find(a => a.id === alertId)
  if (alert) {
    alert.isDismissed = true
  }
}

/**
 * Get predictions for user
 */
export async function getPredictions(userId: string): Promise<Prediction[]> {
  await new Promise(resolve => setTimeout(resolve, 600))
  
  return mockPredictions.filter(pred => pred.userId === userId)
}

/**
 * Get vehicle comparison
 */
export async function getVehicleComparison(userId: string, period: 'month' | 'quarter' | 'year' | 'all' = 'year'): Promise<VehicleComparison> {
  await new Promise(resolve => setTimeout(resolve, 700))
  
  return {
    ...mockVehicleComparison,
    period
  }
}

/**
 * Get annual report
 */
export async function getAnnualReport(userId: string, year: number): Promise<AnnualReport> {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    ...mockAnnualReport,
    year
  }
}

/**
 * Update budget config
 */
export async function updateBudgetConfig(userId: string, config: Partial<BudgetConfig>): Promise<BudgetConfig> {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return {
    ...mockBudgetConfig,
    ...config,
    userId
  }
}

