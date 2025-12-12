/**
 * Analytics Composable - Expense tracking, predictions, budget management
 */

import { ref, computed } from 'vue'
import type {
  ExpenseTrend,
  BudgetAlert,
  Prediction,
  VehicleComparison,
  AnnualReport,
  BudgetConfig,
  AnalyticsDashboard
} from '@/types/analytics'
import {
  getAnalyticsDashboard,
  getBudgetAlerts,
  dismissBudgetAlert,
  getPredictions,
  getVehicleComparison,
  getAnnualReport,
  updateBudgetConfig
} from '@/mocks/analytics.mock'

/**
 * Analytics composable for expense tracking and predictions
 * 
 * @param userId - User ID
 * @returns Analytics state and methods
 */
export function useAnalytics(userId: string) {
  // State
  const dashboard = ref<AnalyticsDashboard | null>(null)
  const trends = ref<ExpenseTrend | null>(null)
  const alerts = ref<BudgetAlert[]>([])
  const predictions = ref<Prediction[]>([])
  const comparison = ref<VehicleComparison | null>(null)
  const annualReport = ref<AnnualReport | null>(null)
  const budgetConfig = ref<BudgetConfig | null>(null)
  
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const unreadAlertsCount = computed(() => 
    alerts.value.filter(a => !a.isRead && !a.isDismissed).length
  )

  const criticalAlerts = computed(() =>
    alerts.value.filter(a => a.severity === 'critical' && !a.isDismissed)
  )

  const activeAlerts = computed(() =>
    alerts.value.filter(a => !a.isDismissed)
  )

  const upcomingPredictions = computed(() =>
    predictions.value
      .filter(p => new Date(p.predictedDate) > new Date())
      .sort((a, b) => new Date(a.predictedDate).getTime() - new Date(b.predictedDate).getTime())
  )

  const budgetStatus = computed(() => {
    if (!dashboard.value || !dashboard.value.budgetConfig) return null
    
    const { currentMonthExpenses, budgetConfig } = dashboard.value
    const percentageUsed = (currentMonthExpenses / budgetConfig.monthlyLimit) * 100
    
    return {
      used: currentMonthExpenses,
      limit: budgetConfig.monthlyLimit,
      remaining: budgetConfig.monthlyLimit - currentMonthExpenses,
      percentageUsed: Math.round(percentageUsed),
      status: percentageUsed >= 100 ? 'exceeded' : 
              percentageUsed >= budgetConfig.alertThreshold ? 'warning' : 'good'
    }
  })

  /**
   * Fetch complete analytics dashboard
   */
  async function fetchDashboard(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      console.log('[Analytics] Fetching dashboard...')
      const data = await getAnalyticsDashboard(userId)
      
      dashboard.value = data
      trends.value = data.trends
      alerts.value = data.alerts
      predictions.value = data.predictions
      comparison.value = data.comparison || null
      budgetConfig.value = data.budgetConfig || null
      
      console.log('[Analytics] Dashboard loaded:', {
        alertsCount: alerts.value.length,
        predictionsCount: predictions.value.length,
        currentExpenses: data.currentMonthExpenses
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load analytics'
      console.error('[Analytics] Error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch budget alerts only
   */
  async function fetchAlerts(): Promise<void> {
    try {
      alerts.value = await getBudgetAlerts(userId)
    } catch (err) {
      console.error('[Analytics] Error fetching alerts:', err)
    }
  }

  /**
   * Dismiss an alert
   */
  async function dismissAlert(alertId: string): Promise<void> {
    try {
      await dismissBudgetAlert(alertId)
      
      const alert = alerts.value.find(a => a.id === alertId)
      if (alert) {
        alert.isDismissed = true
      }
      
      console.log('[Analytics] Alert dismissed:', alertId)
    } catch (err) {
      console.error('[Analytics] Error dismissing alert:', err)
      throw err
    }
  }

  /**
   * Mark alert as read
   */
  function markAlertRead(alertId: string): void {
    const alert = alerts.value.find(a => a.id === alertId)
    if (alert) {
      alert.isRead = true
    }
  }

  /**
   * Fetch predictions
   */
  async function fetchPredictions(): Promise<void> {
    try {
      predictions.value = await getPredictions(userId)
      console.log('[Analytics] Predictions loaded:', predictions.value.length)
    } catch (err) {
      console.error('[Analytics] Error fetching predictions:', err)
    }
  }

  /**
   * Fetch vehicle comparison
   */
  async function fetchComparison(period: 'month' | 'quarter' | 'year' | 'all' = 'year'): Promise<void> {
    try {
      comparison.value = await getVehicleComparison(userId, period)
      console.log('[Analytics] Comparison loaded:', comparison.value.vehicles.length, 'vehicles')
    } catch (err) {
      console.error('[Analytics] Error fetching comparison:', err)
    }
  }

  /**
   * Fetch annual report
   */
  async function fetchAnnualReport(year: number): Promise<void> {
    isLoading.value = true
    
    try {
      annualReport.value = await getAnnualReport(userId, year)
      console.log('[Analytics] Annual report loaded for', year)
    } catch (err) {
      error.value = 'Failed to load annual report'
      console.error('[Analytics] Error fetching annual report:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update budget configuration
   */
  async function saveBudgetConfig(config: Partial<BudgetConfig>): Promise<void> {
    try {
      budgetConfig.value = await updateBudgetConfig(userId, config)
      console.log('[Analytics] Budget config updated')
      
      // Refresh dashboard to update budget status
      await fetchDashboard()
    } catch (err) {
      console.error('[Analytics] Error updating budget config:', err)
      throw err
    }
  }

  /**
   * Download annual report PDF
   */
  function downloadAnnualReport(): void {
    if (annualReport.value?.downloadUrl) {
      // Simulate PDF download
      window.alert(`Téléchargement du rapport annuel ${annualReport.value.year}...\n\nURL: ${annualReport.value.downloadUrl}`)
    }
  }

  return {
    // State
    dashboard,
    trends,
    alerts,
    predictions,
    comparison,
    annualReport,
    budgetConfig,
    isLoading,
    error,
    
    // Computed
    unreadAlertsCount,
    criticalAlerts,
    activeAlerts,
    upcomingPredictions,
    budgetStatus,
    
    // Methods
    fetchDashboard,
    fetchAlerts,
    dismissAlert,
    markAlertRead,
    fetchPredictions,
    fetchComparison,
    fetchAnnualReport,
    saveBudgetConfig,
    downloadAnnualReport
  }
}

