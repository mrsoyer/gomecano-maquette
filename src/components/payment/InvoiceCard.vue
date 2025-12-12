<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Invoice {
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  service: string
  downloadUrl: string
}

interface Props {
  invoice: Invoice
}

const props = defineProps<Props>()

const emit = defineEmits<{
  download: [invoiceId: string]
}>()

/**
 * Get status config
 */
const statusConfig = computed(() => {
  const configs = {
    paid: {
      label: 'Payée',
      icon: 'mdi:check-circle',
      bgClass: 'bg-green-pale',
      textClass: 'text-green-primary',
      iconClass: 'text-green-primary'
    },
    pending: {
      label: 'En attente',
      icon: 'mdi:clock-outline',
      bgClass: 'bg-orange-light',
      textClass: 'text-orange-primary',
      iconClass: 'text-orange-primary'
    },
    overdue: {
      label: 'En retard',
      icon: 'mdi:alert-circle',
      bgClass: 'bg-red-50',
      textClass: 'text-red-600',
      iconClass: 'text-red-600'
    }
  }
  return configs[props.invoice.status]
})

/**
 * Format date
 */
const formattedDate = computed(() => {
  return new Date(props.invoice.date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
})

/**
 * Handle download
 */
function handleDownload(): void {
  emit('download', props.invoice.id)
}
</script>

<template>
  <div class="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <!-- Left: Invoice info -->
      <div class="flex items-start gap-3 flex-1">
        <!-- Icon -->
        <div class="flex-shrink-0 p-2 bg-blue-pale rounded-lg">
          <Icon icon="mdi:file-document" class="w-6 h-6 text-blue-primary" />
        </div>

        <!-- Details -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start gap-2 mb-1">
            <p class="font-medium text-gray-900">
              {{ invoice.id }}
            </p>
            <!-- Status badge -->
            <span
              :class="[
                'px-2 py-0.5 text-xs font-medium rounded',
                statusConfig.bgClass,
                statusConfig.textClass
              ]"
            >
              {{ statusConfig.label }}
            </span>
          </div>
          
          <p class="text-sm text-gray-600 mb-1">
            {{ invoice.service }}
          </p>
          
          <p class="text-xs text-gray-500">
            {{ formattedDate }}
          </p>
        </div>
      </div>

      <!-- Right: Amount and actions -->
      <div class="flex items-center gap-3 md:gap-4">
        <!-- Amount -->
        <div class="text-right">
          <p class="text-lg font-bold text-gray-900">
            {{ invoice.amount.toFixed(2) }}€
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <!-- Download button -->
          <button
            type="button"
            class="p-2 text-blue-primary hover:bg-blue-pale rounded-lg transition-colors"
            title="Télécharger"
            @click="handleDownload"
          >
            <Icon icon="mdi:download" class="w-5 h-5" />
          </button>

          <!-- View button -->
          <a
            :href="invoice.downloadUrl"
            target="_blank"
            class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Voir"
          >
            <Icon icon="mdi:eye" class="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
