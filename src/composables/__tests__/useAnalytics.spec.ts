/**
 * Tests for useAnalytics composable
 * Session 09: MODULES migration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAnalytics } from '../useAnalytics'

// Mock the services
vi.mock('@/services/supabase', () => ({
  callRpc: vi.fn()
}))

// Mock environment variable
vi.stubEnv('VITE_USE_MOCK_DATA', 'true')

describe('useAnalytics', () => {
  const mockUserId = 'test-user-123'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const analytics = useAnalytics(mockUserId)

    expect(analytics.dashboard.value).toBeNull()
    expect(analytics.alerts.value).toEqual([])
    expect(analytics.predictions.value).toEqual([])
    expect(analytics.isLoading.value).toBe(false)
    expect(analytics.error.value).toBeNull()
  })

  it('should compute unreadAlertsCount correctly', () => {
    const analytics = useAnalytics(mockUserId)

    // Set mock alerts
    analytics.alerts.value = [
      { id: '1', isRead: false, isDismissed: false, severity: 'warning' },
      { id: '2', isRead: true, isDismissed: false, severity: 'info' },
      { id: '3', isRead: false, isDismissed: true, severity: 'critical' }
    ] as never[]

    expect(analytics.unreadAlertsCount.value).toBe(1)
  })

  it('should compute criticalAlerts correctly', () => {
    const analytics = useAnalytics(mockUserId)

    analytics.alerts.value = [
      { id: '1', severity: 'critical', isDismissed: false },
      { id: '2', severity: 'warning', isDismissed: false },
      { id: '3', severity: 'critical', isDismissed: true }
    ] as never[]

    expect(analytics.criticalAlerts.value).toHaveLength(1)
    expect(analytics.criticalAlerts.value[0].id).toBe('1')
  })

  it('should compute activeAlerts correctly', () => {
    const analytics = useAnalytics(mockUserId)

    analytics.alerts.value = [
      { id: '1', isDismissed: false },
      { id: '2', isDismissed: true },
      { id: '3', isDismissed: false }
    ] as never[]

    expect(analytics.activeAlerts.value).toHaveLength(2)
  })

  it('should compute upcomingPredictions sorted by date', () => {
    const analytics = useAnalytics(mockUserId)
    const futureDate1 = new Date(Date.now() + 86400000).toISOString() // +1 day
    const futureDate2 = new Date(Date.now() + 172800000).toISOString() // +2 days
    const pastDate = new Date(Date.now() - 86400000).toISOString() // -1 day

    analytics.predictions.value = [
      { id: '1', predictedDate: futureDate2 },
      { id: '2', predictedDate: pastDate },
      { id: '3', predictedDate: futureDate1 }
    ] as never[]

    const upcoming = analytics.upcomingPredictions.value
    expect(upcoming).toHaveLength(2)
    expect(upcoming[0].id).toBe('3') // Earlier future date first
    expect(upcoming[1].id).toBe('1')
  })

  it('should compute budgetStatus correctly', () => {
    const analytics = useAnalytics(mockUserId)

    analytics.dashboard.value = {
      currentMonthExpenses: 400,
      budgetConfig: {
        monthlyLimit: 500,
        alertThreshold: 80
      }
    } as never

    const status = analytics.budgetStatus.value
    expect(status).not.toBeNull()
    expect(status?.used).toBe(400)
    expect(status?.limit).toBe(500)
    expect(status?.remaining).toBe(100)
    expect(status?.percentageUsed).toBe(80)
    expect(status?.status).toBe('warning')
  })

  it('should return null budgetStatus when no dashboard', () => {
    const analytics = useAnalytics(mockUserId)
    expect(analytics.budgetStatus.value).toBeNull()
  })

  it('should mark alert as read', () => {
    const analytics = useAnalytics(mockUserId)

    analytics.alerts.value = [
      { id: '1', isRead: false }
    ] as never[]

    analytics.markAlertRead('1')

    expect(analytics.alerts.value[0].isRead).toBe(true)
  })

  it('should have all required methods', () => {
    const analytics = useAnalytics(mockUserId)

    expect(typeof analytics.fetchDashboard).toBe('function')
    expect(typeof analytics.fetchAlerts).toBe('function')
    expect(typeof analytics.dismissAlert).toBe('function')
    expect(typeof analytics.markAlertRead).toBe('function')
    expect(typeof analytics.fetchPredictions).toBe('function')
    expect(typeof analytics.fetchComparison).toBe('function')
    expect(typeof analytics.fetchAnnualReport).toBe('function')
    expect(typeof analytics.saveBudgetConfig).toBe('function')
    expect(typeof analytics.downloadAnnualReport).toBe('function')
  })
})
