<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { ChecklistItem } from '@/types/account'

interface Props {
  items: ChecklistItem[]
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: true
})

/**
 * Progress percentage
 */
const progressPercentage = computed(() => {
  if (props.items.length === 0) return 0
  const checked = props.items.filter(item => item.checked).length
  return Math.round((checked / props.items.length) * 100)
})

/**
 * Checked items count
 */
const checkedCount = computed(() =>
  props.items.filter(item => item.checked).length
)
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
    <h3 class="text-sm md:text-base font-bold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
      <Icon icon="mdi:clipboard-check" class="w-5 h-5 text-green-primary" />
      Checklist technique
    </h3>

    <!-- Progress -->
    <div class="mb-3 md:mb-4">
      <div class="flex justify-between text-xs md:text-sm mb-1.5">
        <span class="text-gray-600">Progression</span>
        <span class="font-semibold text-gray-900">
          {{ checkedCount }}/{{ items.length }} ({{ progressPercentage }}%)
        </span>
      </div>
      <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-green-primary transition-all duration-500"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
    </div>

    <!-- Checklist Items -->
    <div class="space-y-2">
      <div
        v-for="item in items"
        :key="item.id"
        :class="[
          'flex items-start gap-2 md:gap-3 p-2 md:p-2.5 rounded-lg border transition-all',
          item.checked ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
        ]"
      >
        <!-- Checkbox Icon -->
        <div class="flex-shrink-0 pt-0.5">
          <Icon
            :icon="item.checked ? 'mdi:checkbox-marked-circle' : 'mdi:checkbox-blank-circle-outline'"
            :class="[
              'w-5 h-5 md:w-6 md:h-6',
              item.checked ? 'text-green-600' : 'text-gray-300'
            ]"
          />
        </div>

        <!-- Label -->
        <div class="flex-1 min-w-0">
          <p
            :class="[
              'text-xs md:text-sm font-medium',
              item.checked ? 'text-gray-700 line-through' : 'text-gray-900'
            ]"
          >
            {{ item.label }}
          </p>
          
          <!-- Notes -->
          <p v-if="item.notes" class="text-[10px] md:text-xs text-gray-600 mt-0.5">
            {{ item.notes }}
          </p>

          <!-- Checked time -->
          <p v-if="item.checked && item.checkedAt" class="text-[10px] text-green-600 mt-0.5">
            ✓ Fait à {{ new Date(item.checkedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Info Message -->
    <div v-if="readonly" class="mt-3 p-2 md:p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div class="flex items-start gap-2">
        <Icon icon="mdi:information" class="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p class="text-[10px] md:text-xs text-blue-900">
          Checklist mise à jour en temps réel par le mécanicien
        </p>
      </div>
    </div>
  </div>
</template>
