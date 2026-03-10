<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { InterventionEvent } from '@/types/account'

interface Props {
  events: InterventionEvent[]
}

const props = defineProps<Props>()

/**
 * Get icon for event type
 */
function getEventIcon(type: InterventionEvent['type']): string {
  const icons = {
    status_change: 'mdi:sync',
    message: 'mdi:message-text',
    photo: 'mdi:camera',
    checklist_update: 'mdi:checkbox-marked-circle',
    note: 'mdi:note-text'
  }
  return icons[type] || 'mdi:circle'
}

/**
 * Get color for actor
 */
function getActorColor(actor: InterventionEvent['actor']): string {
  const colors = {
    client: 'text-blue-600',
    mechanic: 'text-green-600',
    system: 'text-gray-600'
  }
  return colors[actor] || 'text-gray-600'
}

/**
 * Format timestamp
 */
function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Sorted events (most recent first)
 */
const sortedEvents = computed(() => {
  return [...props.events].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
})
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
    <h3 class="text-sm md:text-base font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
      <Icon icon="mdi:timeline-text" class="w-5 h-5 text-blue-primary" />
      Historique de l'intervention
    </h3>

    <!-- Empty State -->
    <div v-if="events.length === 0" class="text-center py-6">
      <Icon icon="mdi:timeline-clock-outline" class="w-12 h-12 mx-auto text-gray-300 mb-2" />
      <p class="text-sm text-gray-500">Aucun événement pour le moment</p>
    </div>

    <!-- Timeline -->
    <div v-else class="space-y-3 md:space-y-4">
      <div
        v-for="(event, index) in sortedEvents"
        :key="event.id"
        class="flex gap-3 relative"
      >
        <!-- Timeline Line -->
        <div
          v-if="index < sortedEvents.length - 1"
          class="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200"
        ></div>

        <!-- Icon -->
        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center z-10">
          <Icon :icon="getEventIcon(event.type)" :class="['w-4 h-4', getActorColor(event.actor)]" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0 pt-0.5">
          <p class="text-xs md:text-sm text-gray-900 font-medium mb-0.5">
            {{ event.description }}
          </p>
          <div class="flex items-center gap-2 text-[10px] md:text-xs text-gray-500">
            <span>{{ formatTime(event.timestamp) }}</span>
            <span>•</span>
            <span class="capitalize">{{ event.actor }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
