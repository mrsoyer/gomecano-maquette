<script setup lang="ts">
import { computed } from 'vue'
import type { BookingService } from '@/types/booking'

/**
 * Props
 */
interface Props {
  service: BookingService
  inCart?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  inCart: false
})

/**
 * Emits
 */
const emit = defineEmits<{
  add: []
  remove: []
}>()

/**
 * Computed - Background color based on urgency
 */
const containerClasses = computed(() => {
  if (props.service.urgency === 'high') {
    return 'bg-red-50 border-red-200'
  } else if (props.service.urgency === 'medium') {
    return 'bg-orange-50 border-orange-200'
  }
  return 'bg-gray-50 border-gray-200'
})

/**
 * Computed - Badge color
 */
const badgeClasses = computed(() => {
  if (props.service.urgency === 'high') {
    return 'bg-red-100 text-red-700 border-red-200'
  } else if (props.service.urgency === 'medium') {
    return 'bg-orange-100 text-orange-700 border-orange-200'
  }
  return 'bg-gray-100 text-gray-700 border-gray-200'
})

/**
 * Computed - Format duration
 */
const formattedDuration = computed(() => {
  const minutes = props.service.duration
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) {
    return `${remainingMinutes}min`
  } else if (remainingMinutes === 0) {
    return `${hours}h`
  } else {
    return `${hours}h${remainingMinutes}`
  }
})
</script>

<template>
  <div
    :class="[
      'rounded-lg border-2 p-6 transition-all',
      containerClasses,
      inCart ? 'ring-2 ring-green-500 ring-opacity-50' : ''
    ]"
  >
    <!-- Header with badge -->
    <div class="flex items-start justify-between gap-4 mb-4">
      <div>
        <div v-if="service.badge" class="mb-2">
          <span :class="badgeClasses" class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border">
            {{ service.badge }}
          </span>
        </div>
        <h3 class="font-bold text-gray-900 text-lg">
          {{ service.name }}
        </h3>
      </div>
      <div class="text-right">
        <p class="text-2xl font-bold text-gray-900">
          {{ service.price }}€
        </p>
        <p class="text-xs text-gray-600 mt-1">
          {{ formattedDuration }}
        </p>
      </div>
    </div>

    <!-- Reason -->
    <div v-if="service.reason" class="mb-4 p-3 bg-white rounded-lg border">
      <p class="text-sm font-medium text-gray-900 flex items-start gap-2">
        <span class="text-orange-600">💡</span>
        <span>{{ service.reason }}</span>
      </p>
    </div>

    <!-- Description -->
    <p class="text-sm text-gray-700 mb-4">
      {{ service.description }}
    </p>

    <!-- Included items (condensed) -->
    <div v-if="service.included && service.included.length > 0" class="mb-4">
      <div class="flex flex-wrap gap-2">
        <span
          v-for="(item, index) in service.included.slice(0, 2)"
          :key="index"
          class="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded border border-gray-200"
        >
          <span class="text-green-600">✓</span>
          {{ item }}
        </span>
        <span
          v-if="service.included.length > 2"
          class="inline-flex items-center text-xs text-gray-600 px-2 py-1"
        >
          +{{ service.included.length - 2 }} autres
        </span>
      </div>
    </div>

    <!-- Action Button -->
    <button
      @click="inCart ? emit('remove') : emit('add')"
      :class="[
        'w-full py-3 rounded-lg font-semibold transition-all',
        inCart
          ? 'bg-green-600 text-white hover:bg-green-700'
          : 'bg-orange-600 text-white hover:bg-orange-700 shadow-sm'
      ]"
    >
      <span v-if="inCart" class="flex items-center justify-center gap-2">
        <span>✓</span>
        <span>AJOUTÉ AU PANIER</span>
      </span>
      <span v-else class="flex items-center justify-center gap-2">
        <span>+</span>
        <span>AJOUTER AU PANIER</span>
      </span>
    </button>
  </div>
</template>
