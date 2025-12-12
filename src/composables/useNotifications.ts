import { ref, computed } from 'vue'
import type { Notification } from '@/types/account'
import { getUserNotifications, getUnreadNotificationsCount } from '@/mocks/interventions'

/**
 * Notifications management composable
 * Manages user notifications with read/unread states
 * 
 * @param userId - User ID
 * @returns Notifications data and management functions
 */
export function useNotifications(userId: string) {
  const notifications = ref<Notification[]>(getUserNotifications(userId))
  const isLoading = ref(false)

  /**
   * Unread notifications count
   */
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  /**
   * Unread notifications only
   */
  const unreadNotifications = computed(() => {
    return notifications.value.filter(n => !n.read)
  })

  /**
   * Recent notifications (last 5)
   */
  const recentNotifications = computed(() => {
    return notifications.value
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  })

  /**
   * Mark notification as read
   * 
   * @param notificationId - Notification ID
   */
  async function markAsRead(notificationId: string): Promise<void> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100))

      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.read = true
      }

      console.log('[Notifications] Marked as read:', notificationId)
    } catch (err) {
      console.error('[Notifications] Error marking as read:', err)
    }
  }

  /**
   * Mark all notifications as read
   */
  async function markAllAsRead(): Promise<void> {
    try {
      isLoading.value = true
      await new Promise(resolve => setTimeout(resolve, 200))

      notifications.value.forEach(n => {
        n.read = true
      })

      console.log('[Notifications] All marked as read')
    } catch (err) {
      console.error('[Notifications] Error marking all as read:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete notification
   * 
   * @param notificationId - Notification ID
   */
  async function deleteNotification(notificationId: string): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 100))

      const index = notifications.value.findIndex(n => n.id === notificationId)
      if (index !== -1) {
        notifications.value.splice(index, 1)
      }

      console.log('[Notifications] Deleted:', notificationId)
    } catch (err) {
      console.error('[Notifications] Error deleting:', err)
    }
  }

  /**
   * Refresh notifications
   */
  async function refreshNotifications(): Promise<void> {
    try {
      isLoading.value = true
      await new Promise(resolve => setTimeout(resolve, 300))

      notifications.value = getUserNotifications(userId)

      console.log('[Notifications] Refreshed')
    } catch (err) {
      console.error('[Notifications] Error refreshing:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    notifications,
    unreadCount,
    unreadNotifications,
    recentNotifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  }
}
