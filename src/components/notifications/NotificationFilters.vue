<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

type FilterType = 'all' | 'unread' | 'appointment' | 'payment' | 'marketing'

interface Props {
  modelValue: FilterType
  unreadCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: FilterType]
}>()

interface Filter {
  id: FilterType
  label: string
  icon: string
  count?: number
}

const filters = computed<Filter[]>(() => [
  { 
    id: 'all', 
    label: 'Toutes', 
    icon: 'mdi:bell' 
  },
  { 
    id: 'unread', 
    label: 'Non lues', 
    icon: 'mdi:bell-badge',
    count: props.unreadCount 
  },
  { 
    id: 'appointment', 
    label: 'Rendez-vous', 
    icon: 'mdi:calendar-check' 
  },
  { 
    id: 'payment', 
    label: 'Paiements', 
    icon: 'mdi:credit-card' 
  },
  { 
    id: 'marketing', 
    label: 'Promotions', 
    icon: 'mdi:bullhorn' 
  }
])

/**
 * Handle filter change
 */
function handleFilterChange(filterId: FilterType): void {
  emit('update:modelValue', filterId)
}
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-lg p-3">
    <div class="flex items-center gap-2 overflow-x-auto">
      <button
        v-for="filter in filters"
        :key="filter.id"
        type="button"
        :class="[
          'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all',
          modelValue === filter.id
            ? 'bg-blue-primary text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
        @click="handleFilterChange(filter.id)"
      >
        <Icon :icon="filter.icon" class="w-4 h-4" />
        {{ filter.label }}
        <span
          v-if="filter.count && filter.count > 0"
          :class="[
            'px-2 py-0.5 text-xs font-bold rounded-full',
            modelValue === filter.id
              ? 'bg-white/20 text-white'
              : 'bg-orange-primary text-white'
          ]"
        >
          {{ filter.count }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Hide scrollbar but keep functionality */
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
