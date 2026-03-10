import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'

interface Notification {
  id: string
  user_id: string
  type: 'appointment' | 'payment' | 'marketing' | 'system' | 'loyalty' | 'emergency'
  title: string
  message: string
  read: boolean
  read_at: string | null
  action_url: string | null
  action_label: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

/**
 * Notifications management composable
 * Manages user notifications with read/unread states
 * Uses Supabase RPC functions with built-in RLS
 *
 * @returns Notifications data and management functions
 */
export function useNotifications() {
  const notifications = ref<Notification[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

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
    return [...notifications.value]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  })

  /**
   * Fetch notifications via RPC
   */
  async function fetchNotifications(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('account_get_notifications_v2')

      if (fetchError) throw fetchError
      notifications.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch notifications'
      console.error('Error fetching notifications:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Mark notification as read via RPC
   *
   * @param notificationId - Notification ID
   */
  async function markAsRead(notificationId: string): Promise<void> {
    error.value = null

    try {
      const { error: updateError } = await supabase
        .rpc('account_mark_notification_read', {
          p_notification_id: notificationId
        })

      if (updateError) throw updateError

      // Update local state
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.read = true
        notification.read_at = new Date().toISOString()
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to mark as read'
      console.error('Error marking notification as read:', err)
    }
  }

  /**
   * Mark all notifications as read via RPC
   */
  async function markAllAsRead(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const { error: updateError } = await supabase
        .rpc('account_mark_all_notifications_read')

      if (updateError) throw updateError

      // Update local state
      const now = new Date().toISOString()
      notifications.value.forEach(n => {
        n.read = true
        n.read_at = now
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to mark all as read'
      console.error('Error marking all notifications as read:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete notification via RPC
   *
   * @param notificationId - Notification ID
   */
  async function deleteNotification(notificationId: string): Promise<void> {
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .rpc('account_delete_notification', {
          p_notification_id: notificationId
        })

      if (deleteError) throw deleteError

      // Update local state
      const index = notifications.value.findIndex(n => n.id === notificationId)
      if (index !== -1) {
        notifications.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete notification'
      console.error('Error deleting notification:', err)
    }
  }

  /**
   * Refresh notifications (alias for fetchNotifications)
   */
  async function refreshNotifications(): Promise<void> {
    await fetchNotifications()
  }

  /**
   * Subscribe to realtime notifications
   * Returns cleanup function
   */
  function subscribeToNotifications(
    onNewNotification?: (notification: Notification) => void
  ): () => void {
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          const newNotification = payload.new as Notification
          // Add to beginning of list
          notifications.value.unshift(newNotification)
          // Callback for custom handling (e.g., toast)
          onNewNotification?.(newNotification)
        }
      )
      .subscribe()

    // Return cleanup function
    return () => {
      supabase.removeChannel(channel)
    }
  }

  return {
    // State
    notifications,
    isLoading,
    error,

    // Computed
    unreadCount,
    unreadNotifications,
    recentNotifications,

    // Methods
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    subscribeToNotifications
  }
}
