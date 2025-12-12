<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Column {
  key: string
  label: string
  sortable?: boolean
  width?: string
}

interface Props {
  columns: Column[]
  data: any[]
  sortable?: boolean
  filterable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sortable: true,
  filterable: false
})

const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')
const searchQuery = ref('')

/**
 * Sort data
 */
function toggleSort(key: string): void {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

/**
 * Filtered and sorted data
 */
const processedData = computed(() => {
  let result = [...props.data]

  // Filter
  if (props.filterable && searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(query)
      )
    )
  }

  // Sort
  if (sortKey.value) {
    result.sort((a, b) => {
      const aVal = a[sortKey.value!]
      const bVal = b[sortKey.value!]
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder.value === 'asc' ? aVal - bVal : bVal - aVal
      }
      
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      return sortOrder.value === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr)
    })
  }

  return result
})
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
    <!-- Search (if filterable) -->
    <div v-if="filterable" class="p-3 md:p-4 border-b border-gray-200">
      <div class="relative">
        <Icon icon="mdi:magnify" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher..."
          class="w-full pl-9 md:pl-10 pr-3 py-2 md:py-2.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-primary focus:ring-2 focus:ring-blue-200"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :style="column.width ? { width: column.width } : {}"
              :class="[
                'px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700',
                sortable && column.sortable !== false && 'cursor-pointer hover:bg-gray-100'
              ]"
              @click="sortable && column.sortable !== false && toggleSort(column.key)"
            >
              <div class="flex items-center gap-2">
                <span>{{ column.label }}</span>
                <Icon
                  v-if="sortable && column.sortable !== false"
                  :icon="
                    sortKey === column.key
                      ? sortOrder === 'asc'
                        ? 'mdi:chevron-up'
                        : 'mdi:chevron-down'
                      : 'mdi:unfold-more-horizontal'
                  "
                  class="w-4 h-4 text-gray-400"
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in processedData"
            :key="index"
            class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-900"
            >
              <slot :name="column.key" :row="row" :value="row[column.key]">
                {{ row[column.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State (filtered) -->
    <div v-if="processedData.length === 0" class="text-center py-8 md:py-12">
      <Icon icon="mdi:database-search" class="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-300 mb-2" />
      <p class="text-sm text-gray-500">Aucun résultat</p>
    </div>
  </div>
</template>
