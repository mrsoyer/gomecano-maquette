import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Notification {
  id: string
  type: 'appointment' | 'payment' | 'marketing' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  actionLabel?: string
}

/**
 * Notification store - Manages user notifications
 */
export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref<Notification[]>([])
  const isLoading = ref(false)

  // Getters
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  const unreadNotifications = computed(() => {
    return notifications.value.filter(n => !n.read)
  })

  const recentNotifications = computed(() => {
    return notifications.value.slice(0, 5)
  })

  /**
   * Fetch notifications for a user
   */
  async function fetchNotifications(userId: string): Promise<void> {
    isLoading.value = true
    try {
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Mock notifications
      notifications.value = [
        {
          id: 'notif-1',
          type: 'appointment',
          title: 'Intervention confirmée',
          message: 'Votre vidange est confirmée pour le 20 mars à 14h00',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          actionUrl: '/account/interventions/1',
          actionLabel: 'Voir détails'
        },
        {
          id: 'notif-2',
          type: 'payment',
          title: 'Paiement reçu',
          message: 'Votre paiement de 189,90€ a été confirmé',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          read: false,
          actionUrl: '/account/payments'
        },
        {
          id: 'notif-3',
          type: 'appointment',
          title: 'Rappel intervention',
          message: 'Votre intervention est prévue demain à 14h00',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          read: true
        },
        {
          id: 'notif-4',
          type: 'marketing',
          title: 'Offre exclusive',
          message: '-20% sur votre prochaine révision ce mois-ci',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          actionUrl: '/services'
        },
        {
          id: 'notif-5',
          type: 'system',
          title: 'Mise à jour profil',
          message: 'Pensez à mettre à jour vos informations de contact',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          actionUrl: '/account/profile'
        },
        {
          id: 'notif-6',
          type: 'appointment',
          title: 'Intervention terminée',
          message: 'Votre vidange a été réalisée avec succès',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          actionUrl: '/account/history'
        }
      ]
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Mark notification as read
   */
  function markAsRead(notificationId: string): void {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  }

  /**
   * Mark all notifications as read
   */
  function markAllAsRead(): void {
    notifications.value.forEach(n => {
      n.read = true
    })
  }

  /**
   * Delete notification
   */
  function deleteNotification(notificationId: string): void {
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  /**
   * Clear all notifications
   */
  function clearAll(): void {
    notifications.value = []
  }

  /**
   * Add new notification (for real-time updates)
   */
  function addNotification(notification: Notification): void {
    notifications.value.unshift(notification)
  }

  return {
    // State
    notifications,
    isLoading,
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
    addNotification
  }
})
