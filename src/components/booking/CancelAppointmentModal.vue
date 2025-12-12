<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { Intervention } from '@/types/account'

interface Props {
  isOpen: boolean
  intervention: Intervention | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  cancel: [reason: string]
}>()

// State
const selectedReason = ref<string>('')
const otherReason = ref<string>('')
const isLoading = ref(false)

// Cancel reasons
const cancelReasons = [
  { id: 'schedule', label: 'Problème de planning' },
  { id: 'price', label: 'Tarif trop élevé' },
  { id: 'solved', label: 'Problème résolu autrement' },
  { id: 'mechanic', label: 'Mécanicien non disponible' },
  { id: 'other', label: 'Autre raison' }
]

// Computed
const canCancel = computed(() => {
  if (!selectedReason.value) return false
  if (selectedReason.value === 'other' && !otherReason.value.trim()) return false
  return true
})

const cancellationFee = computed(() => {
  if (!props.intervention) return 0
  
  const scheduledDate = new Date(props.intervention.scheduledAt)
  const now = new Date()
  const hoursUntil = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  if (hoursUntil > 48) return 0
  if (hoursUntil > 24) return 20
  return 50
})

/**
 * Handle cancellation submission
 */
async function handleCancel(): Promise<void> {
  if (!canCancel.value) return

  isLoading.value = true
  try {
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const reason = selectedReason.value === 'other' 
      ? otherReason.value 
      : cancelReasons.find(r => r.id === selectedReason.value)?.label || ''
    
    emit('cancel', reason)
    emit('close')
  } catch (error) {
    console.error('Cancel error:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * Handle modal close
 */
function handleClose(): void {
  if (isLoading.value) return
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="handleClose"
      >
        <div
          class="relative w-full max-w-lg bg-white rounded-lg shadow-xl"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b md:p-5">
            <div class="flex items-center gap-2">
              <Icon
                icon="mdi:alert-circle"
                class="w-6 h-6 text-orange-primary"
              />
              <h3 class="text-lg font-semibold text-gray-900 md:text-xl">
                Annuler l'intervention
              </h3>
            </div>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600 transition-colors"
              :disabled="isLoading"
              @click="handleClose"
            >
              <Icon icon="mdi:close" class="w-6 h-6" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-4 space-y-4 md:p-5">
            <!-- Current appointment info -->
            <div
              v-if="intervention"
              class="p-3 bg-gray-50 rounded-lg"
            >
              <p class="text-sm text-gray-600">
                Intervention à annuler :
              </p>
              <p class="font-medium text-gray-900">
                {{ intervention.service }}
              </p>
              <p class="text-sm text-gray-600">
                {{ new Date(intervention.scheduledAt).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) }} - {{ intervention.timeSlot }}
              </p>
            </div>

            <!-- Warning about cancellation fee -->
            <div
              v-if="cancellationFee > 0"
              class="flex items-start gap-2 p-3 bg-orange-light rounded-lg"
            >
              <Icon
                icon="mdi:alert"
                class="flex-shrink-0 w-5 h-5 text-orange-primary"
              />
              <div class="flex-1">
                <p class="font-medium text-gray-900">
                  Frais d'annulation : {{ cancellationFee }}€
                </p>
                <p class="text-sm text-gray-700">
                  L'annulation à moins de {{ cancellationFee === 50 ? '24h' : '48h' }} 
                  entraîne des frais.
                </p>
              </div>
            </div>

            <!-- Info about free cancellation -->
            <div
              v-else
              class="flex items-start gap-2 p-3 bg-green-pale rounded-lg"
            >
              <Icon
                icon="mdi:check-circle"
                class="flex-shrink-0 w-5 h-5 text-green-primary"
              />
              <p class="text-sm text-gray-700">
                Annulation gratuite (plus de 48h avant l'intervention)
              </p>
            </div>

            <!-- Cancellation reason -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900">
                Motif d'annulation <span class="text-red-500">*</span>
              </label>
              <div class="space-y-2">
                <label
                  v-for="reason in cancelReasons"
                  :key="reason.id"
                  class="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  :class="{
                    'bg-blue-pale border-blue-primary': selectedReason === reason.id
                  }"
                >
                  <input
                    v-model="selectedReason"
                    type="radio"
                    :value="reason.id"
                    class="w-4 h-4 text-blue-primary focus:ring-blue-primary"
                    :disabled="isLoading"
                  />
                  <span class="ml-3 text-sm text-gray-900">
                    {{ reason.label }}
                  </span>
                </label>
              </div>
            </div>

            <!-- Other reason text area -->
            <div v-if="selectedReason === 'other'">
              <label class="block mb-2 text-sm font-medium text-gray-900">
                Précisez la raison <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="otherReason"
                rows="3"
                placeholder="Décrivez la raison de l'annulation..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-primary focus:border-transparent resize-none"
                :disabled="isLoading"
              />
            </div>

            <!-- Help text -->
            <p class="text-sm text-gray-600">
              Votre retour nous aide à améliorer nos services. 
              Vous recevrez une confirmation par email et SMS.
            </p>
          </div>

          <!-- Footer -->
          <div class="flex flex-col gap-2 p-4 border-t md:flex-row md:justify-end md:p-5">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              :disabled="isLoading"
              @click="handleClose"
            >
              Garder le rendez-vous
            </button>
            <button
              type="button"
              :disabled="!canCancel || isLoading"
              :class="[
                'px-4 py-2 text-sm font-medium text-white rounded-lg transition-all',
                canCancel && !isLoading
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gray-300 cursor-not-allowed'
              ]"
              @click="handleCancel"
            >
              <span v-if="isLoading">Annulation...</span>
              <span v-else>Confirmer l'annulation</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
