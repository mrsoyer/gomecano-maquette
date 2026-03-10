import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'

export interface Notification {
  id: string
  userId: string
  type: 'appointment' | 'payment' | 'marketing' | 'system' | 'loyalty' | 'emergency'
  title: string
  message: string
  read: boolean
  readAt: string | null
  actionUrl: string | null
  actionLabel: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

/**
 * Notification store - Manages user notifications via Supabase RPC
 */
export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref<Notification[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  const unreadNotifications = computed(() => {
    return notifications.value.filter(n => !n.read)
  })

  const recentNotifications = computed(() => {
    return [...notifications.value]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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

      notifications.value = (data || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        userId: row.user_id as string,
        type: row.type as Notification['type'],
        title: row.title as string,
        message: row.message as string,
        read: row.read as boolean,
        readAt: row.read_at as string | null,
        actionUrl: row.action_url as string | null,
        actionLabel: row.action_label as string | null,
        metadata: row.metadata as Record<string, unknown> | null,
        createdAt: row.created_at as string
      }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch notifications'
      console.error('Error fetching notifications:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Mark notification as read via RPC
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
        notification.readAt = new Date().toISOString()
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
        n.readAt = now
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
   * Clear all notifications via RPC
   */
  async function clearAll(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .rpc('account_clear_all_notifications')

      if (deleteError) throw deleteError

      // Update local state
      notifications.value = []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to clear notifications'
      console.error('Error clearing notifications:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Add new notification (for real-time updates)
   */
  function addNotification(notification: Notification): void {
    notifications.value.unshift(notification)
  }

  /**
   * Subscribe to realtime notifications
   * Returns cleanup function
   */
  function subscribeToNotifications(
    onNewNotification?: (notification: Notification) => void
  ): () => void {
    const channel = supabase
      .channel('notifications-store')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>
          const newNotification: Notification = {
            id: row.id as string,
            userId: row.user_id as string,
            type: row.type as Notification['type'],
            title: row.title as string,
            message: row.message as string,
            read: row.read as boolean,
            readAt: row.read_at as string | null,
            actionUrl: row.action_url as string | null,
            actionLabel: row.action_label as string | null,
            metadata: row.metadata as Record<string, unknown> | null,
            createdAt: row.created_at as string
          }
          addNotification(newNotification)
          onNewNotification?.(newNotification)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  /**
   * Initialize store
   */
  async function initialize(): Promise<void> {
    await fetchNotifications()
  }

  return {
    // State
    notifications,
    isLoading,
    error,

    // Getters
    unreadCount,
    unreadNotifications,
    recentNotifications,

    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
    subscribeToNotifications,
    initialize
  }
})
