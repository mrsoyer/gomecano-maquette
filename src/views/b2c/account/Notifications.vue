<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores/user.store'
import { useNotificationStore } from '@/stores/notification.store'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import NotificationCard from '@/components/notifications/NotificationCard.vue'
import NotificationFilters from '@/components/notifications/NotificationFilters.vue'

const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

// State
const selectedFilter = ref<'all' | 'unread' | 'appointment' | 'payment' | 'marketing'>('all')

// Auto-login user for demo
onMounted(async () => {
  if (!userStore.isAuthenticated) {
    await userStore.loginById('user-1')
  }
  if (userStore.user) {
    await notificationStore.fetchNotifications(userStore.user.id)
  }
})

// Computed
const filteredNotifications = computed(() => {
  let notifications = notificationStore.notifications

  if (selectedFilter.value === 'unread') {
    notifications = notifications.filter(n => !n.read)
  } else if (selectedFilter.value !== 'all') {
    notifications = notifications.filter(n => n.type === selectedFilter.value)
  }

  return notifications
})

const unreadCount = computed(() => {
  return notificationStore.notifications.filter(n => !n.read).length
})

/**
 * Mark notification as read
 */
function handleMarkAsRead(notificationId: string): void {
  notificationStore.markAsRead(notificationId)
}

/**
 * Delete notification
 */
function handleDelete(notificationId: string): void {
  notificationStore.deleteNotification(notificationId)
}

/**
 * Mark all as read
 */
function handleMarkAllAsRead(): void {
  notificationStore.markAllAsRead()
}

/**
 * Clear all notifications
 */
function handleClearAll(): void {
  if (confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
    notificationStore.clearAll()
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <Container class="py-4 md:py-6">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm mb-4">
        <router-link
          to="/account/dashboard"
          class="text-gray-600 hover:text-blue-primary transition-colors"
        >
          Mon compte
        </router-link>
        <Icon icon="mdi:chevron-right" class="w-4 h-4 text-gray-400" />
        <span class="text-gray-900 font-medium">Notifications</span>
      </nav>

      <!-- Header -->
      <div class="flex flex-col gap-3 mb-4 md:mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 md:text-3xl">
            Notifications
            <span v-if="unreadCount > 0" class="ml-2 text-lg text-orange-primary">
              ({{ unreadCount }})
            </span>
          </h1>
          <p class="mt-1 text-sm text-gray-600 md:text-base">
            Restez informé de vos interventions et de l'actualité Gomecano
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button
            v-if="unreadCount > 0"
            type="button"
            class="px-3 py-2 text-sm font-medium text-blue-primary border border-blue-primary rounded-lg hover:bg-blue-pale transition-colors"
            @click="handleMarkAllAsRead"
          >
            <Icon icon="mdi:check-all" class="w-4 h-4 inline mr-1" />
            Tout marquer comme lu
          </button>
          <button
            v-if="notificationStore.notifications.length > 0"
            type="button"
            class="px-3 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            @click="handleClearAll"
          >
            <Icon icon="mdi:delete-sweep" class="w-4 h-4 inline mr-1" />
            Tout effacer
          </button>
        </div>
      </div>

      <!-- Filters -->
      <NotificationFilters
        v-model="selectedFilter"
        :unread-count="unreadCount"
        class="mb-4"
      />

      <!-- Notifications List -->
      <div v-if="filteredNotifications.length > 0" class="space-y-3">
        <NotificationCard
          v-for="notification in filteredNotifications"
          :key="notification.id"
          :notification="notification"
          @mark-read="handleMarkAsRead"
          @delete="handleDelete"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="p-8 text-center bg-white border border-gray-200 rounded-lg md:p-12">
        <Icon icon="mdi:bell-outline" class="w-12 h-12 mx-auto text-gray-400 md:w-16 md:h-16" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">
          {{ selectedFilter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification' }}
        </h3>
        <p class="mt-2 text-sm text-gray-600">
          {{ selectedFilter === 'unread' 
            ? 'Vous êtes à jour ! Toutes vos notifications ont été lues.' 
            : 'Vous recevrez ici les notifications concernant vos interventions.' 
          }}
        </p>
        <button
          v-if="selectedFilter !== 'all'"
          type="button"
          class="mt-4 px-4 py-2 text-sm font-medium text-blue-primary hover:underline"
          @click="selectedFilter = 'all'"
        >
          Voir toutes les notifications
        </button>
      </div>

      <!-- Info banner -->
      <div class="mt-6 flex items-start gap-3 p-4 bg-blue-pale rounded-lg">
        <Icon icon="mdi:information" class="flex-shrink-0 w-5 h-5 text-blue-primary" />
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-900">
            Préférences de notifications
          </p>
          <p class="mt-1 text-xs text-gray-600">
            Vous pouvez gérer vos préférences de notifications (email, SMS, push) 
            depuis la page 
            <router-link to="/account/settings" class="text-blue-primary hover:underline">
              Paramètres
            </router-link>.
          </p>
        </div>
      </div>
    </Container>

    <Footer />
  </div>
</template>
