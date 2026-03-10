import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import type { Tables } from '@/types/database.types'

type Notification = Tables<'notifications'>

/**
 * Composable for notifications with Supabase (realtime enabled)
 */
export function useNotificationsSupabase() {
  const notifications = ref<Notification[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const unreadCount = computed(() =>
    notifications.value.filter(n => !n.is_read).length
  )

  const unreadNotifications = computed(() =>
    notifications.value.filter(n => !n.is_read)
  )

  /**
   * Fetch notifications for current user
   */
  async function fetchNotifications(limit = 50) {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (fetchError) throw fetchError

      notifications.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch notifications'
    } finally {
      loading.value = false
    }
  }

  /**
   * Mark notification as read
   */
  async function markAsRead(notificationId: string) {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)

      if (updateError) throw updateError

      notifications.value = notifications.value.map(n =>
        n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
      )

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to mark as read'
      return { success: false, error: error.value }
    }
  }

  /**
   * Mark all notifications as read
   */
  async function markAllAsRead() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('profile_id', user.id)
        .eq('is_read', false)

      if (updateError) throw updateError

      notifications.value = notifications.value.map(n => ({
        ...n,
        is_read: true,
        read_at: n.read_at || new Date().toISOString()
      }))

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to mark all as read'
      return { success: false, error: error.value }
    }
  }

  /**
   * Delete a notification
   */
  async function deleteNotification(notificationId: string) {
    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (deleteError) throw deleteError

      notifications.value = notifications.value.filter(n => n.id !== notificationId)

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete notification'
      return { success: false, error: error.value }
    }
  }

  /**
   * Subscribe to new notifications (realtime)
   */
  function subscribeToNotifications() {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          notifications.value = [payload.new as Notification, ...notifications.value]
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  return {
    notifications,
    unreadCount,
    unreadNotifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    subscribeToNotifications
  }
}
