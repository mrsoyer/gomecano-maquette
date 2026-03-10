/**
 * Analytics Types - Expense tracking, predictions, budget alerts
 */

/**
 * Expense trend data point
 */
export interface ExpenseTrendDataPoint {
  month: string // YYYY-MM
  totalExpenses: number
  interventionCount: number
  averagePerIntervention: number
  categories: {
    maintenance: number
    repair: number
    diagnostic: number
    parts: number
  }
}

/**
 * Expense trend analysis
 */
export interface ExpenseTrend {
  userId: string
  vehicleId?: string // If null, all vehicles
  period: 'month' | 'quarter' | 'year' | 'all'
  dataPoints: ExpenseTrendDataPoint[]
  summary: {
    totalExpenses: number
    averageMonthly: number
    highestMonth: string
    lowestMonth: string
    trend: 'increasing' | 'decreasing' | 'stable'
    percentageChange: number // vs previous period
  }
}

/**
 * Budget alert severity
 */
export type BudgetAlertSeverity = 'info' | 'warning' | 'critical'

/**
 * Budget alert
 */
export interface BudgetAlert {
  id: string
  userId: string
  vehicleId?: string
  severity: BudgetAlertSeverity
  type: 'overspending' | 'approaching_limit' | 'unusual_expense' | 'recommendation'
  title: string
  message: string
  currentAmount: number
  budgetLimit?: number
  percentageUsed?: number
  recommendations: string[]
  createdAt: string
  isRead: boolean
  isDismissed: boolean
}

/**
 * Prediction type
 */
export type PredictionType = 'maintenance' | 'repair' | 'total_expenses'

/**
 * Prediction confidence level
 */
export type PredictionConfidence = 'low' | 'medium' | 'high'

/**
 * Maintenance/expense prediction
 */
export interface Prediction {
  id: string
  userId: string
  vehicleId: string
  type: PredictionType
  title: string
  description: string
  predictedDate: string // ISO date
  predictedAmount: number
  confidence: PredictionConfidence
  basedOn: {
    historicalData: boolean
    mileage: boolean
    vehicleAge: boolean
    manufacturerSchedule: boolean
  }
  relatedServices: string[] // Service IDs
  createdAt: string
}

/**
 * Vehicle comparison metric
 */
export interface VehicleComparisonMetric {
  vehicleId: string
  vehicleName: string // "Peugeot 308 (2020)"
  totalExpenses: number
  interventionCount: number
  averagePerIntervention: number
  lastInterventionDate: string
  nextMaintenanceDate?: string
  efficiency: 'excellent' | 'good' | 'average' | 'poor' // Cost efficiency
}

/**
 * Multi-vehicle comparison
 */
export interface VehicleComparison {
  userId: string
  period: 'month' | 'quarter' | 'year' | 'all'
  vehicles: VehicleComparisonMetric[]
  insights: {
    mostExpensive: string // Vehicle ID
    mostEfficient: string // Vehicle ID
    totalSavingsPotential: number
    recommendations: string[]
  }
}

/**
 * Annual report category
 */
export interface AnnualReportCategory {
  name: string
  amount: number
  percentage: number
  count: number
}

/**
 * Annual report
 */
export interface AnnualReport {
  userId: string
  year: number
  summary: {
    totalExpenses: number
    interventionCount: number
    vehicleCount: number
    averagePerVehicle: number
    comparedToPreviousYear: {
      percentage: number
      trend: 'increased' | 'decreased' | 'stable'
    }
  }
  byCategory: AnnualReportCategory[]
  byVehicle: {
    vehicleId: string
    vehicleName: string
    expenses: number
    interventions: number
  }[]
  monthlyBreakdown: {
    month: string
    expenses: number
    interventions: number
  }[]
  topServices: {
    serviceId: string
    serviceName: string
    count: number
    totalAmount: number
  }[]
  insights: string[]
  downloadUrl?: string // PDF report URL
}

/**
 * Budget configuration
 */
export interface BudgetConfig {
  userId: string
  monthlyLimit: number
  alertThreshold: number // Percentage (e.g., 80 = alert at 80%)
  categories: {
    maintenance: number
    repair: number
    diagnostic: number
  }
  vehicleLimits?: {
    vehicleId: string
    limit: number
  }[]
}

/**
 * Analytics dashboard data
 */
export interface AnalyticsDashboard {
  trends: ExpenseTrend
  alerts: BudgetAlert[]
  predictions: Prediction[]
  comparison?: VehicleComparison
  currentMonthExpenses: number
  budgetRemaining: number
  budgetConfig?: BudgetConfig
}
