/**
 * Analytics Composable - Expense tracking, predictions, budget management
 *
 * @description Migrated to Supabase Functions-First architecture (Session 09)
 * Uses DB Functions: mod_get_analytics_dashboard, mod_get_budget_alerts,
 * mod_get_predictions, mod_get_vehicle_comparison, mod_get_annual_report,
 * mod_update_budget_config, mod_dismiss_alert
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
import { callRpc } from '@/services/supabase'

// Import mocks for fallback
import {
  getAnalyticsDashboard as getAnalyticsDashboardMock,
  getBudgetAlerts as getBudgetAlertsMock,
  dismissBudgetAlert as dismissBudgetAlertMock,
  getPredictions as getPredictionsMock,
  getVehicleComparison as getVehicleComparisonMock,
  getAnnualReport as getAnnualReportMock,
  updateBudgetConfig as updateBudgetConfigMock
} from '@/mocks/analytics.mock'

// Toggle for mock vs real data
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true'

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

      let data: AnalyticsDashboard

      if (USE_MOCK_DATA) {
        data = await getAnalyticsDashboardMock(userId)
      } else {
        // Call Supabase RPC
        const result = await callRpc<AnalyticsDashboard>('mod_get_analytics_dashboard', {
          p_profile_id: userId
        })

        // Transform response to match expected format
        data = {
          currentMonthExpenses: result.currentMonthExpenses || 0,
          alerts: result.alerts || [],
          predictions: result.predictions || [],
          trends: result.trends || { currentMonth: 0, previousMonth: 0, trend: 'stable' },
          budgetConfig: result.budgetConfig || null,
          comparison: null
        }
      }

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
      if (USE_MOCK_DATA) {
        alerts.value = await getBudgetAlertsMock(userId)
      } else {
        const result = await callRpc<BudgetAlert[]>('mod_get_budget_alerts', {
          p_profile_id: userId
        })
        alerts.value = result || []
      }
    } catch (err) {
      console.error('[Analytics] Error fetching alerts:', err)
    }
  }

  /**
   * Dismiss an alert
   */
  async function dismissAlert(alertId: string): Promise<void> {
    try {
      if (USE_MOCK_DATA) {
        await dismissBudgetAlertMock(alertId)
      } else {
        await callRpc('mod_dismiss_alert', {
          p_alert_id: alertId,
          p_user_id: userId
        })
      }

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
      if (USE_MOCK_DATA) {
        predictions.value = await getPredictionsMock(userId)
      } else {
        const result = await callRpc<Prediction[]>('mod_get_predictions', {
          p_profile_id: userId
        })
        predictions.value = result || []
      }
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
      if (USE_MOCK_DATA) {
        comparison.value = await getVehicleComparisonMock(userId, period)
      } else {
        const result = await callRpc<VehicleComparison>('mod_get_vehicle_comparison', {
          p_profile_id: userId,
          p_period: period
        })
        comparison.value = result
      }
      console.log('[Analytics] Comparison loaded:', comparison.value?.vehicles?.length || 0, 'vehicles')
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
      if (USE_MOCK_DATA) {
        annualReport.value = await getAnnualReportMock(userId, year)
      } else {
        const result = await callRpc<AnnualReport>('mod_get_annual_report', {
          p_profile_id: userId,
          p_year: year
        })
        annualReport.value = result
      }
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
      if (USE_MOCK_DATA) {
        budgetConfig.value = await updateBudgetConfigMock(userId, config)
      } else {
        const result = await callRpc<BudgetConfig>('mod_update_budget_config', {
          p_profile_id: userId,
          p_monthly_limit: config.monthlyLimit,
          p_alert_threshold: config.alertThreshold
        })
        budgetConfig.value = result
      }
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




