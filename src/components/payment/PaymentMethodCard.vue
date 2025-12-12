<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

interface PaymentMethod {
  id: string
  type: 'card'
  last4: string
  brand: string
  expiryMonth: number
  expiryYear: number
  isDefault: boolean
  holderName: string
}

interface Props {
  method: PaymentMethod
}

const props = defineProps<Props>()

const emit = defineEmits<{
  setDefault: [methodId: string]
  delete: [methodId: string]
}>()

const showMenu = ref(false)

/**
 * Get card brand icon
 */
function getBrandIcon(brand: string): string {
  const icons: Record<string, string> = {
    'Visa': 'mdi:credit-card',
    'Mastercard': 'mdi:credit-card',
    'Amex': 'mdi:credit-card',
    'Discover': 'mdi:credit-card'
  }
  return icons[brand] || 'mdi:credit-card'
}

/**
 * Get card brand color
 */
function getBrandColor(brand: string): string {
  const colors: Record<string, string> = {
    'Visa': 'from-blue-500 to-blue-600',
    'Mastercard': 'from-orange-500 to-red-500',
    'Amex': 'from-blue-400 to-indigo-500',
    'Discover': 'from-orange-400 to-orange-600'
  }
  return colors[brand] || 'from-gray-500 to-gray-600'
}

/**
 * Handle set as default
 */
function handleSetDefault(): void {
  emit('setDefault', props.method.id)
  showMenu.value = false
}

/**
 * Handle delete
 */
function handleDelete(): void {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce moyen de paiement ?')) {
    emit('delete', props.method.id)
  }
  showMenu.value = false
}
</script>

<template>
  <div class="relative p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
    <!-- Card visual -->
    <div
      :class="[
        'relative h-32 p-4 rounded-lg bg-gradient-to-br shadow-lg',
        getBrandColor(method.brand)
      ]"
    >
      <!-- Brand icon -->
      <div class="flex items-start justify-between">
        <Icon :icon="getBrandIcon(method.brand)" class="w-8 h-8 text-white" />
        
        <!-- Default badge -->
        <span
          v-if="method.isDefault"
          class="px-2 py-1 text-xs font-medium text-white bg-white/20 rounded"
        >
          Par défaut
        </span>
      </div>

      <!-- Card number -->
      <div class="mt-4">
        <p class="text-sm text-white/80">
          •••• •••• ••••
        </p>
        <p class="text-lg font-mono font-bold text-white">
          {{ method.last4 }}
        </p>
      </div>

      <!-- Expiry -->
      <div class="absolute bottom-4 left-4 right-4 flex items-end justify-between">
        <div>
          <p class="text-xs text-white/80">Expire le</p>
          <p class="text-sm font-medium text-white">
            {{ String(method.expiryMonth).padStart(2, '0') }}/{{ method.expiryYear }}
          </p>
        </div>
        <p class="text-xs font-medium text-white">
          {{ method.brand }}
        </p>
      </div>
    </div>

    <!-- Holder name -->
    <div class="mt-3">
      <p class="text-sm text-gray-600">Titulaire</p>
      <p class="font-medium text-gray-900">{{ method.holderName }}</p>
    </div>

    <!-- Actions menu -->
    <div class="absolute top-2 right-2">
      <button
        type="button"
        class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        @click="showMenu = !showMenu"
      >
        <Icon icon="mdi:dots-vertical" class="w-5 h-5" />
      </button>

      <!-- Dropdown menu -->
      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="showMenu"
          v-click-outside="() => showMenu = false"
          class="absolute right-0 z-10 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          <button
            v-if="!method.isDefault"
            type="button"
            class="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            @click="handleSetDefault"
          >
            <Icon icon="mdi:star" class="w-4 h-4" />
            Définir par défaut
          </button>
          <button
            type="button"
            class="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            @click="handleDelete"
          >
            <Icon icon="mdi:delete" class="w-4 h-4" />
            Supprimer
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
/* Click outside directive simulation via @click.outside in Vue 3 */
</style>
