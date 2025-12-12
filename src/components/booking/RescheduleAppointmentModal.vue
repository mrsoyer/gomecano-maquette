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
  reschedule: [newDate: Date]
}>()

// State
const selectedDate = ref<Date | null>(null)
const selectedSlot = ref<string>('')
const isLoading = ref(false)

// Available slots (mock data)
const availableSlots = ref([
  { time: '08:00 - 10:00', available: true },
  { time: '10:00 - 12:00', available: true },
  { time: '14:00 - 16:00', available: false },
  { time: '16:00 - 18:00', available: true }
])

// Computed
const canReschedule = computed(() => selectedDate.value && selectedSlot.value)

/**
 * Handle reschedule submission
 */
async function handleReschedule(): Promise<void> {
  if (!canReschedule.value || !selectedDate.value) return

  isLoading.value = true
  try {
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('reschedule', selectedDate.value)
    emit('close')
  } catch (error) {
    console.error('Reschedule error:', error)
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
            <h3 class="text-lg font-semibold text-gray-900 md:text-xl">
              Reprogrammer l'intervention
            </h3>
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
              class="p-3 bg-blue-pale rounded-lg"
            >
              <p class="text-sm text-gray-600">
                Rendez-vous actuel :
              </p>
              <p class="font-medium text-gray-900">
                {{ new Date(intervention.scheduledAt).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) }}
              </p>
              <p class="text-sm text-gray-600">
                {{ intervention.timeSlot }}
              </p>
            </div>

            <!-- Date picker -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900">
                Nouvelle date
              </label>
              <input
                v-model="selectedDate"
                type="date"
                :min="new Date().toISOString().split('T')[0]"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-primary focus:border-transparent"
                :disabled="isLoading"
              />
            </div>

            <!-- Time slots -->
            <div v-if="selectedDate">
              <label class="block mb-2 text-sm font-medium text-gray-900">
                Créneau horaire
              </label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="slot in availableSlots"
                  :key="slot.time"
                  type="button"
                  :disabled="!slot.available || isLoading"
                  :class="[
                    'px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all',
                    selectedSlot === slot.time
                      ? 'bg-blue-primary text-white border-blue-primary'
                      : slot.available
                        ? 'bg-white text-gray-900 border-gray-300 hover:border-blue-primary'
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  ]"
                  @click="selectedSlot = slot.time"
                >
                  {{ slot.time }}
                  <span
                    v-if="!slot.available"
                    class="block text-xs"
                  >
                    Complet
                  </span>
                </button>
              </div>
            </div>

            <!-- Info message -->
            <div class="flex items-start gap-2 p-3 bg-orange-light rounded-lg">
              <Icon
                icon="mdi:information"
                class="flex-shrink-0 w-5 h-5 text-orange-primary"
              />
              <p class="text-sm text-gray-700">
                La reprogrammation est gratuite jusqu'à 48h avant l'intervention.
                Au-delà, des frais de 20€ peuvent s'appliquer.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex flex-col gap-2 p-4 border-t md:flex-row md:justify-end md:p-5">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              :disabled="isLoading"
              @click="handleClose"
            >
              Annuler
            </button>
            <button
              type="button"
              :disabled="!canReschedule || isLoading"
              :class="[
                'px-4 py-2 text-sm font-medium text-white rounded-lg transition-all',
                canReschedule && !isLoading
                  ? 'bg-blue-primary hover:bg-blue-dark'
                  : 'bg-gray-300 cursor-not-allowed'
              ]"
              @click="handleReschedule"
            >
              <span v-if="isLoading">Reprogrammation...</span>
              <span v-else>Confirmer</span>
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
