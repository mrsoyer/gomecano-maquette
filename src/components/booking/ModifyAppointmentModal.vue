<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import type { Intervention } from '@/types/account'

interface Props {
  isOpen: boolean
  intervention: Intervention | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  modify: [updates: Partial<Intervention>]
}>()

// State
const address = ref('')
const notes = ref('')
const selectedOptions = ref<string[]>([])
const isLoading = ref(false)

// Available options (mock)
const availableOptions = [
  { id: 'express', label: 'Service Express (+30€)', price: 30 },
  { id: 'pickup', label: 'Récupération véhicule (+20€)', price: 20 },
  { id: 'return', label: 'Restitution véhicule (+20€)', price: 20 },
  { id: 'premium', label: 'Pièces Premium (+50€)', price: 50 }
]

// Computed
const hasChanges = computed(() => {
  if (!props.intervention) return false
  
  return address.value !== props.intervention.address ||
         notes.value !== (props.intervention.notes || '') ||
         JSON.stringify(selectedOptions.value.sort()) !== JSON.stringify((props.intervention.options || []).sort())
})

const additionalCost = computed(() => {
  return selectedOptions.value.reduce((total, optionId) => {
    const option = availableOptions.find(o => o.id === optionId)
    return total + (option?.price || 0)
  }, 0)
})

const newTotal = computed(() => {
  if (!props.intervention) return 0
  return props.intervention.price + additionalCost.value
})

// Watch intervention changes to update form
watch(() => props.intervention, (newIntervention) => {
  if (newIntervention) {
    address.value = newIntervention.address
    notes.value = newIntervention.notes || ''
    selectedOptions.value = newIntervention.options || []
  }
}, { immediate: true })

/**
 * Handle modification submission
 */
async function handleModify(): Promise<void> {
  if (!hasChanges.value) return

  isLoading.value = true
  try {
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const updates: Partial<Intervention> = {
      address: address.value,
      notes: notes.value,
      options: selectedOptions.value,
      price: newTotal.value
    }
    
    emit('modify', updates)
    emit('close')
  } catch (error) {
    console.error('Modify error:', error)
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

/**
 * Toggle option selection
 */
function toggleOption(optionId: string): void {
  const index = selectedOptions.value.indexOf(optionId)
  if (index > -1) {
    selectedOptions.value.splice(index, 1)
  } else {
    selectedOptions.value.push(optionId)
  }
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
          class="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b md:p-5 flex-shrink-0">
            <h3 class="text-lg font-semibold text-gray-900 md:text-xl">
              Modifier l'intervention
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

          <!-- Body - Scrollable -->
          <div class="p-4 space-y-4 overflow-y-auto flex-1 md:p-5">
            <!-- Current intervention info -->
            <div
              v-if="intervention"
              class="p-3 bg-blue-pale rounded-lg"
            >
              <div class="flex items-start justify-between">
                <div>
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
                  <p class="text-sm text-gray-600">
                    {{ intervention.vehicle }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-600">Montant initial</p>
                  <p class="text-lg font-bold text-blue-primary">
                    {{ intervention.price }}€
                  </p>
                </div>
              </div>
            </div>

            <!-- Address -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900">
                Adresse d'intervention
              </label>
              <div class="relative">
                <Icon
                  icon="mdi:map-marker"
                  class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                />
                <input
                  v-model="address"
                  type="text"
                  placeholder="Adresse complète"
                  class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-primary focus:border-transparent"
                  :disabled="isLoading"
                />
              </div>
            </div>

            <!-- Options -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900">
                Options supplémentaires
              </label>
              <div class="space-y-2">
                <label
                  v-for="option in availableOptions"
                  :key="option.id"
                  class="flex items-center justify-between p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  :class="{
                    'bg-blue-pale border-blue-primary': selectedOptions.includes(option.id)
                  }"
                >
                  <div class="flex items-center">
                    <input
                      :checked="selectedOptions.includes(option.id)"
                      type="checkbox"
                      class="w-4 h-4 text-blue-primary focus:ring-blue-primary rounded"
                      :disabled="isLoading"
                      @change="toggleOption(option.id)"
                    />
                    <span class="ml-3 text-sm text-gray-900">
                      {{ option.label }}
                    </span>
                  </div>
                  <span class="text-sm font-medium text-blue-primary">
                    +{{ option.price }}€
                  </span>
                </label>
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900">
                Notes / Instructions particulières
              </label>
              <textarea
                v-model="notes"
                rows="4"
                placeholder="Ex: Code d'accès, précisions sur le véhicule, demandes particulières..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-primary focus:border-transparent resize-none"
                :disabled="isLoading"
              />
              <p class="mt-1 text-xs text-gray-500">
                Ces informations seront transmises au mécanicien
              </p>
            </div>

            <!-- Price summary -->
            <div
              v-if="additionalCost > 0"
              class="p-3 bg-green-pale rounded-lg"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-600">Montant initial</span>
                <span class="text-sm text-gray-900">{{ intervention?.price }}€</span>
              </div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-600">Options ajoutées</span>
                <span class="text-sm font-medium text-green-primary">+{{ additionalCost }}€</span>
              </div>
              <div class="flex items-center justify-between pt-2 border-t border-green-primary/20">
                <span class="font-medium text-gray-900">Nouveau total</span>
                <span class="text-lg font-bold text-green-primary">{{ newTotal }}€</span>
              </div>
            </div>

            <!-- Info message -->
            <div class="flex items-start gap-2 p-3 bg-blue-pale rounded-lg">
              <Icon
                icon="mdi:information"
                class="flex-shrink-0 w-5 h-5 text-blue-primary"
              />
              <p class="text-sm text-gray-700">
                Les modifications sont gratuites jusqu'à 48h avant l'intervention. 
                Si vous ajoutez des options payantes, le paiement du supplément sera 
                demandé lors de la validation.
              </p>
            </div>
          </div>

          <!-- Footer - Fixed -->
          <div class="flex flex-col gap-2 p-4 border-t md:flex-row md:justify-end md:p-5 flex-shrink-0 bg-white">
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
              :disabled="!hasChanges || isLoading"
              :class="[
                'px-4 py-2 text-sm font-medium text-white rounded-lg transition-all',
                hasChanges && !isLoading
                  ? 'bg-blue-primary hover:bg-blue-dark'
                  : 'bg-gray-300 cursor-not-allowed'
              ]"
              @click="handleModify"
            >
              <span v-if="isLoading">Enregistrement...</span>
              <span v-else>Enregistrer les modifications</span>
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
