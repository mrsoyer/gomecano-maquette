import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useNotifications } from '../useNotifications'
import { supabase } from '@/services/supabase'

// Mock Supabase with RPC support
vi.mock('@/services/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis()
    })),
    removeChannel: vi.fn()
  }
}))

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchNotifications', () => {
    it('should fetch notifications via RPC', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          user_id: 'user-1',
          type: 'appointment',
          title: 'Rappel RDV',
          message: 'Votre RDV est demain à 10h',
          read: false,
          read_at: null,
          action_url: '/appointments/apt-1',
          action_label: 'Voir le RDV',
          metadata: { appointment_id: 'apt-1' },
          created_at: '2024-01-15T09:00:00Z'
        },
        {
          id: 'notif-2',
          user_id: 'user-1',
          type: 'payment',
          title: 'Paiement reçu',
          message: 'Votre paiement de 150€ a été confirmé',
          read: true,
          read_at: '2024-01-14T12:00:00Z',
          action_url: '/invoices/inv-1',
          action_label: 'Voir la facture',
          metadata: { invoice_id: 'inv-1' },
          created_at: '2024-01-14T10:00:00Z'
        }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockNotifications,
        error: null
      } as never)

      const { fetchNotifications, notifications, isLoading, error } = useNotifications()

      expect(isLoading.value).toBe(false)

      await fetchNotifications()

      expect(isLoading.value).toBe(false)
      expect(error.value).toBe(null)
      expect(notifications.value).toEqual(mockNotifications)
      expect(supabase.rpc).toHaveBeenCalledWith('account_get_notifications_v2')
    })

    it('should handle fetch error gracefully', async () => {
      const mockError = { message: 'Database error', code: 'PGRST301' }

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: mockError
      } as never)

      const { fetchNotifications, error } = useNotifications()

      await fetchNotifications()

      expect(error.value).toBe('Failed to fetch notifications')
    })

    it('should set loading state during fetch', async () => {
      vi.mocked(supabase.rpc).mockImplementationOnce(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({ data: [], error: null } as never), 100)
        )
      )

      const { fetchNotifications, isLoading } = useNotifications()

      const fetchPromise = fetchNotifications()
      expect(isLoading.value).toBe(true)

      await fetchPromise
      expect(isLoading.value).toBe(false)
    })
  })

  describe('markAsRead', () => {
    it('should mark notification as read via RPC', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          user_id: 'user-1',
          type: 'appointment',
          title: 'Test',
          message: 'Test message',
          read: false,
          read_at: null,
          action_url: null,
          action_label: null,
          metadata: null,
          created_at: '2024-01-15T09:00:00Z'
        }
      ]

      // First fetch notifications
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockNotifications,
        error: null
      } as never)

      // Then mark as read
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { success: true },
        error: null
      } as never)

      const { fetchNotifications, markAsRead, notifications, error } = useNotifications()

      await fetchNotifications()
      expect(notifications.value[0].read).toBe(false)

      await markAsRead('notif-1')

      expect(error.value).toBe(null)
      expect(notifications.value[0].read).toBe(true)
      expect(notifications.value[0].read_at).not.toBe(null)
      expect(supabase.rpc).toHaveBeenCalledWith('account_mark_notification_read', {
        p_notification_id: 'notif-1'
      })
    })

    it('should handle mark as read error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Notification not found' }
      } as never)

      const { markAsRead, error } = useNotifications()

      await markAsRead('invalid-id')

      expect(error.value).toBe('Failed to mark as read')
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all notifications as read via RPC', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          user_id: 'user-1',
          type: 'appointment',
          title: 'Test 1',
          message: 'Message 1',
          read: false,
          read_at: null,
          action_url: null,
          action_label: null,
          metadata: null,
          created_at: '2024-01-15T09:00:00Z'
        },
        {
          id: 'notif-2',
          user_id: 'user-1',
          type: 'payment',
          title: 'Test 2',
          message: 'Message 2',
          read: false,
          read_at: null,
          action_url: null,
          action_label: null,
          metadata: null,
          created_at: '2024-01-14T10:00:00Z'
        }
      ]

      // First fetch notifications
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockNotifications,
        error: null
      } as never)

      // Then mark all as read
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { success: true },
        error: null
      } as never)

      const { fetchNotifications, markAllAsRead, notifications, error, isLoading } = useNotifications()

      await fetchNotifications()
      expect(notifications.value.every(n => !n.read)).toBe(true)

      await markAllAsRead()

      expect(error.value).toBe(null)
      expect(isLoading.value).toBe(false)
      expect(notifications.value.every(n => n.read)).toBe(true)
      expect(notifications.value.every(n => n.read_at !== null)).toBe(true)
      expect(supabase.rpc).toHaveBeenCalledWith('account_mark_all_notifications_read')
    })

    it('should handle mark all as read error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Failed to update notifications' }
      } as never)

      const { markAllAsRead, error, isLoading } = useNotifications()

      await markAllAsRead()

      expect(error.value).toBe('Failed to mark all as read')
      expect(isLoading.value).toBe(false)
    })
  })

  describe('deleteNotification', () => {
    it('should delete notification via RPC', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          user_id: 'user-1',
          type: 'appointment',
          title: 'Test 1',
          message: 'Message 1',
          read: false,
          read_at: null,
          action_url: null,
          action_label: null,
          metadata: null,
          created_at: '2024-01-15T09:00:00Z'
        },
        {
          id: 'notif-2',
          user_id: 'user-1',
          type: 'payment',
          title: 'Test 2',
          message: 'Message 2',
          read: true,
          read_at: '2024-01-14T12:00:00Z',
          action_url: null,
          action_label: null,
          metadata: null,
          created_at: '2024-01-14T10:00:00Z'
        }
      ]

      // First fetch notifications
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockNotifications,
        error: null
      } as never)

      // Then delete one
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { success: true },
        error: null
      } as never)

      const { fetchNotifications, deleteNotification, notifications, error } = useNotifications()

      await fetchNotifications()
      expect(notifications.value).toHaveLength(2)

      await deleteNotification('notif-1')

      expect(error.value).toBe(null)
      expect(notifications.value).toHaveLength(1)
      expect(notifications.value[0].id).toBe('notif-2')
      expect(supabase.rpc).toHaveBeenCalledWith('account_delete_notification', {
        p_notification_id: 'notif-1'
      })
    })

    it('should handle delete error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Cannot delete notification' }
      } as never)

      const { deleteNotification, error } = useNotifications()

      await deleteNotification('notif-1')

      expect(error.value).toBe('Failed to delete notification')
    })
  })

  describe('unreadCount', () => {
    it('should count unread notifications', async () => {
      const mockNotifications = [
        { id: '1', read: false, created_at: '2024-01-15T09:00:00Z' },
        { id: '2', read: true, created_at: '2024-01-14T10:00:00Z' },
        { id: '3', read: false, created_at: '2024-01-13T08:00:00Z' }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockNotifications,
        error: null
      } as never)

      const { fetchNotifications, unreadCount } = useNotifications()

      await fetchNotifications()

      expect(unreadCount.value).toBe(2)
    })

    it('should return 0 when all read', async () => {
      const mockNotifications = [
        { id: '1', read: true, created_at: '2024-01-15T09:00:00Z' },
        { id: '2', read: true, created_at: '2024-01-14T10:00:00Z' }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockNotifications,
        error: null
      } as never)

      const { fetchNotifications, unreadCount } = useNotifications()

      await fetchNotifications()

      expect(unreadCount.value).toBe(0)
    })

    it('should return 0 when no notifications', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [],
        error: null
      } as never)

      const { fetchNotifications, unreadCount } = useNotifications()

      await fetchNotifications()

      expect(unreadCount.value).toBe(0)
    })
  })

  describe('unreadNotifications', () => {
    it('should return only unread notifications', async () => {
      const mockNotifications = [
        { id: '1', read: false, created_at: '2024-01-15T09:00:00Z' },
        { id: '2', read: true, created_at: '2024-01-14T10:00:00Z' },
        { id: '3', read: false, created_at: '2024-01-13T08:00:00Z' }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockNotifications,
        error: null
      } as never)

      const { fetchNotifications, unreadNotifications } = useNotifications()

      await fetchNotifications()

      expect(unreadNotifications.value).toHaveLength(2)
      expect(unreadNotifications.value.every(n => !n.read)).toBe(true)
    })

    it('should return empty array when all read', async () => {
      const mockNotifications = [
        { id: '1', read: true, created_at: '2024-01-15T09:00:00Z' }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockNotifications,
        error: null
      } as never)

      const { fetchNotifications, unreadNotifications } = useNotifications()

      await fetchNotifications()

      expect(unreadNotifications.value).toHaveLength(0)
    })
  })

  describe('recentNotifications', () => {
    it('should return last 5 notifications sorted by date', async () => {
      const mockNotifications = [
        { id: '1', read: false, created_at: '2024-01-10T09:00:00Z' },
        { id: '2', read: true, created_at: '2024-01-15T10:00:00Z' },
        { id: '3', read: false, created_at: '2024-01-12T08:00:00Z' },
        { id: '4', read: true, created_at: '2024-01-14T11:00:00Z' },
        { id: '5', read: false, created_at: '2024-01-11T07:00:00Z' },
        { id: '6', read: true, created_at: '2024-01-13T06:00:00Z' },
        { id: '7', read: false, created_at: '2024-01-09T05:00:00Z' }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockNotifications,
        error: null
      } as never)

      const { fetchNotifications, recentNotifications } = useNotifications()

      await fetchNotifications()

      expect(recentNotifications.value).toHaveLength(5)
      // Should be sorted by date descending
      expect(recentNotifications.value[0].id).toBe('2') // Jan 15
      expect(recentNotifications.value[1].id).toBe('4') // Jan 14
      expect(recentNotifications.value[2].id).toBe('6') // Jan 13
      expect(recentNotifications.value[3].id).toBe('3') // Jan 12
      expect(recentNotifications.value[4].id).toBe('5') // Jan 11
    })

    it('should return all if less than 5 notifications', async () => {
      const mockNotifications = [
        { id: '1', read: false, created_at: '2024-01-15T09:00:00Z' },
        { id: '2', read: true, created_at: '2024-01-14T10:00:00Z' }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockNotifications,
        error: null
      } as never)

      const { fetchNotifications, recentNotifications } = useNotifications()

      await fetchNotifications()

      expect(recentNotifications.value).toHaveLength(2)
    })
  })

  describe('refreshNotifications', () => {
    it('should refresh notifications by calling fetch', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [{ id: '1', read: false, created_at: '2024-01-15T09:00:00Z' }],
        error: null
      } as never)

      const { refreshNotifications, notifications } = useNotifications()

      await refreshNotifications()

      expect(notifications.value).toHaveLength(1)
      expect(supabase.rpc).toHaveBeenCalledWith('account_get_notifications_v2')
    })
  })

  describe('subscribeToNotifications', () => {
    it('should set up realtime subscription', () => {
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis()
      }
      vi.mocked(supabase.channel).mockReturnValue(mockChannel as never)

      const { subscribeToNotifications } = useNotifications()

      const cleanup = subscribeToNotifications()

      expect(supabase.channel).toHaveBeenCalledWith('notifications-changes')
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        expect.any(Function)
      )
      expect(mockChannel.subscribe).toHaveBeenCalled()
      expect(typeof cleanup).toBe('function')
    })

    it('should call cleanup function to remove channel', () => {
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis()
      }
      vi.mocked(supabase.channel).mockReturnValue(mockChannel as never)

      const { subscribeToNotifications } = useNotifications()

      const cleanup = subscribeToNotifications()
      cleanup()

      expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel)
    })

    it('should add new notification when received and call callback', async () => {
      let insertCallback: ((payload: { new: unknown }) => void) | undefined

      const mockChannel = {
        on: vi.fn((event, config, callback) => {
          insertCallback = callback
          return mockChannel
        }),
        subscribe: vi.fn().mockReturnThis()
      }
      vi.mocked(supabase.channel).mockReturnValue(mockChannel as never)

      const onNewNotification = vi.fn()
      const { subscribeToNotifications, notifications } = useNotifications()

      subscribeToNotifications(onNewNotification)

      // Simulate receiving a new notification
      const newNotification = {
        id: 'new-notif',
        user_id: 'user-1',
        type: 'system',
        title: 'New notification',
        message: 'You have a new message',
        read: false,
        read_at: null,
        action_url: null,
        action_label: null,
        metadata: null,
        created_at: '2024-01-16T12:00:00Z'
      }

      // Call the captured callback
      insertCallback?.({ new: newNotification })

      expect(notifications.value).toHaveLength(1)
      expect(notifications.value[0]).toEqual(newNotification)
      expect(onNewNotification).toHaveBeenCalledWith(newNotification)
    })
  })
})
