<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import type { Notification } from '@/types/account'

interface Props {
  notifications: Notification[]
}

const props = defineProps<Props>()

const router = useRouter()

/**
 * Unread count
 */
const unreadCount = computed(() =>
  props.notifications.filter(n => !n.read).length
)

/**
 * Get icon for notification type
 */
function getNotificationIcon(type: Notification['type']): string {
  const icons = {
    intervention: 'mdi:wrench',
    vehicle: 'mdi:car-wrench',
    payment: 'mdi:cash',
    system: 'mdi:bell'
  }
  return icons[type] || 'mdi:bell'
}

/**
 * Format time ago
 */
function formatTimeAgo(date: string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffMins < 1440) return `Il y a ${Math.floor(diffMins / 60)}h`
  return `Il y a ${Math.floor(diffMins / 1440)}j`
}

/**
 * Navigate to notification action
 */
function handleNotificationClick(notification: Notification): void {
  if (notification.actionUrl) {
    router.push(notification.actionUrl)
  }
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm md:text-base font-bold text-gray-900 flex items-center gap-2">
        <Icon icon="mdi:bell" class="w-5 h-5 text-blue-primary" />
        Notifications
      </h3>
      <div v-if="unreadCount > 0" class="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
        {{ unreadCount }}
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="notifications.length === 0" class="text-center py-6">
      <Icon icon="mdi:bell-off" class="w-12 h-12 mx-auto text-gray-300 mb-2" />
      <p class="text-sm text-gray-500">Aucune notification</p>
    </div>

    <!-- Notifications List -->
    <div v-else class="space-y-2">
      <div
        v-for="notif in notifications.slice(0, 5)"
        :key="notif.id"
        @click="handleNotificationClick(notif)"
        :class="[
          'p-2 md:p-2.5 rounded-lg border transition-all cursor-pointer',
          notif.read
            ? 'border-gray-200 bg-white hover:bg-gray-50'
            : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
        ]"
      >
        <div class="flex items-start gap-2">
          <Icon
            :icon="getNotificationIcon(notif.type)"
            :class="[
              'w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-0.5',
              notif.read ? 'text-gray-500' : 'text-blue-primary'
            ]"
          />
          <div class="flex-1 min-w-0">
            <p :class="['text-xs md:text-sm mb-0.5', notif.read ? 'text-gray-700' : 'text-gray-900 font-semibold']">
              {{ notif.title }}
            </p>
            <p class="text-[10px] md:text-xs text-gray-600 mb-1">
              {{ notif.message }}
            </p>
            <span class="text-[9px] md:text-[10px] text-gray-500">
              {{ formatTimeAgo(notif.createdAt) }}
            </span>
          </div>
          <div v-if="!notif.read" class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"></div>
        </div>
      </div>

      <!-- View All -->
      <button
        v-if="notifications.length > 5"
        class="w-full py-2 text-xs md:text-sm font-semibold text-blue-primary hover:bg-blue-50 rounded-lg transition-all"
      >
        Voir toutes les notifications
      </button>
    </div>
  </div>
</template>
