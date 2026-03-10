<script setup lang="ts">
import { computed } from 'vue'
import type { BookingService } from '@/types/booking'

/**
 * Props
 */
interface Props {
  service: BookingService
  inCart?: boolean
  selected?: boolean
  showReason?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  inCart: false,
  selected: false,
  showReason: true
})

/**
 * Emits
 */
const emit = defineEmits<{
  add: []
  remove: []
}>()

/**
 * Computed - Badge color classes
 */
const badgeClasses = computed(() => {
  if (!props.service.badge) return ''
  
  if (props.service.badge === 'URGENT') {
    return 'bg-red-100 text-red-700 border border-red-200'
  } else if (props.service.badge === 'RECOMMANDÉ') {
    return 'bg-orange-100 text-orange-700 border border-orange-200'
  }
  
  return 'bg-gray-100 text-gray-700'
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

/**
 * Handle add/remove
 */
function handleClick() {
  if (props.inCart) {
    emit('remove')
  } else {
    emit('add')
  }
}
</script>

<template>
  <div
    :class="[
      'bg-white rounded-lg border-2 p-6 transition-all',
      selected ? 'border-green-500 shadow-md' : 'border-gray-200 hover:border-gray-300',
      inCart ? 'ring-2 ring-green-500 ring-opacity-50' : ''
    ]"
  >
    <!-- Badge -->
    <div v-if="service.badge" class="mb-3">
      <span :class="badgeClasses" class="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase">
        {{ service.badge }}
      </span>
    </div>

    <!-- Title & Price -->
    <div class="flex justify-between items-start gap-4 mb-3">
      <div class="flex-1">
        <h3 class="font-bold text-gray-900 text-lg leading-tight">
          {{ service.name }}
        </h3>
        <p class="text-sm text-gray-600 mt-1">
          {{ service.description }}
        </p>
      </div>
      <div class="text-right flex-shrink-0">
        <p class="text-2xl font-bold text-gray-900">
          {{ service.price }}€
        </p>
        <p class="text-xs text-gray-500 mt-1">
          {{ formattedDuration }}
        </p>
      </div>
    </div>

    <!-- Reason (if applicable) -->
    <div v-if="showReason && service.reason" class="mb-4">
      <p class="text-sm text-orange-600 font-medium">
        💡 {{ service.reason }}
      </p>
    </div>

    <!-- Included items -->
    <div v-if="service.included && service.included.length > 0" class="mb-4">
      <p class="text-xs font-semibold text-gray-700 mb-2">Inclus :</p>
      <ul class="space-y-1">
        <li
          v-for="(item, index) in service.included.slice(0, 3)"
          :key="index"
          class="text-xs text-gray-600 flex items-start gap-2"
        >
          <span class="text-green-600 flex-shrink-0">✓</span>
          <span>{{ item }}</span>
        </li>
      </ul>
      <button
        v-if="service.included.length > 3"
        class="text-xs text-orange-600 hover:text-orange-700 font-medium mt-2"
      >
        + {{ service.included.length - 3 }} autres éléments
      </button>
    </div>

    <!-- Action Button -->
    <button
      @click="handleClick"
      :class="[
        'w-full py-3 rounded-lg font-semibold transition-colors',
        inCart
          ? 'bg-green-600 text-white hover:bg-green-700'
          : 'bg-orange-600 text-white hover:bg-orange-700'
      ]"
    >
      <span v-if="inCart">✓ AJOUTÉ</span>
      <span v-else>+ AJOUTER</span>
    </button>
  </div>
</template>
