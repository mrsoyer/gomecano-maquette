<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Notification {
  id: string
  type: 'appointment' | 'payment' | 'marketing' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  actionLabel?: string
}

interface Props {
  notification: Notification
}

const props = defineProps<Props>()

const emit = defineEmits<{
  markRead: [id: string]
  delete: [id: string]
}>()

/**
 * Get notification icon and colors based on type
 */
const notificationConfig = computed(() => {
  const configs = {
    appointment: {
      icon: 'mdi:calendar-check',
      bgClass: 'bg-blue-pale',
      iconClass: 'text-blue-primary'
    },
    payment: {
      icon: 'mdi:credit-card',
      bgClass: 'bg-green-pale',
      iconClass: 'text-green-primary'
    },
    marketing: {
      icon: 'mdi:bullhorn',
      bgClass: 'bg-orange-light',
      iconClass: 'text-orange-primary'
    },
    system: {
      icon: 'mdi:information',
      bgClass: 'bg-gray-100',
      iconClass: 'text-gray-600'
    }
  }
  return configs[props.notification.type]
})

/**
 * Format relative time
 */
const relativeTime = computed(() => {
  const now = new Date()
  const timestamp = new Date(props.notification.timestamp)
  const diffMs = now.getTime() - timestamp.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`
  
  return timestamp.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: 'short' 
  })
})

/**
 * Handle mark as read
 */
function handleMarkAsRead(): void {
  if (!props.notification.read) {
    emit('markRead', props.notification.id)
  }
}

/**
 * Handle delete
 */
function handleDelete(event: Event): void {
  event.stopPropagation()
  emit('delete', props.notification.id)
}
</script>

<template>
  <div
    :class="[
      'relative p-4 bg-white border rounded-lg transition-all cursor-pointer',
      notification.read 
        ? 'border-gray-200 hover:border-gray-300' 
        : 'border-blue-300 bg-blue-50/50 hover:border-blue-400'
    ]"
    @click="handleMarkAsRead"
  >
    <!-- Unread indicator -->
    <div
      v-if="!notification.read"
      class="absolute top-4 left-0 w-1 h-8 bg-blue-primary rounded-r"
    />

    <div class="flex items-start gap-3">
      <!-- Icon -->
      <div
        :class="[
          'flex-shrink-0 p-2 rounded-lg',
          notificationConfig.bgClass
        ]"
      >
        <Icon
          :icon="notificationConfig.icon"
          :class="['w-5 h-5', notificationConfig.iconClass]"
        />
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2 mb-1">
          <h3
            :class="[
              'text-sm font-medium',
              notification.read ? 'text-gray-700' : 'text-gray-900'
            ]"
          >
            {{ notification.title }}
          </h3>
          <button
            type="button"
            class="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
            title="Supprimer"
            @click="handleDelete"
          >
            <Icon icon="mdi:close" class="w-4 h-4" />
          </button>
        </div>

        <p
          :class="[
            'text-sm mb-2',
            notification.read ? 'text-gray-500' : 'text-gray-700'
          ]"
        >
          {{ notification.message }}
        </p>

        <div class="flex items-center gap-3">
          <span class="text-xs text-gray-500">
            {{ relativeTime }}
          </span>

          <!-- Action button -->
          <a
            v-if="notification.actionUrl"
            :href="notification.actionUrl"
            class="text-xs font-medium text-blue-primary hover:underline"
            @click.stop
          >
            {{ notification.actionLabel || 'Voir détails' }}
            <Icon icon="mdi:arrow-right" class="w-3 h-3 inline ml-1" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
