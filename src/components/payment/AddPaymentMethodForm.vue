<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  add: [method: PaymentMethodData]
}>()

interface PaymentMethodData {
  cardNumber: string
  holderName: string
  expiryMonth: string
  expiryYear: string
  cvv: string
}

// Form state
const cardNumber = ref('')
const holderName = ref('')
const expiryMonth = ref('')
const expiryYear = ref('')
const cvv = ref('')
const isLoading = ref(false)
const errors = ref<Record<string, string>>({})

// Computed
const formattedCardNumber = computed(() => {
  return cardNumber.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()
})

const canSubmit = computed(() => {
  return cardNumber.value.length === 16 &&
         holderName.value.trim().length > 0 &&
         expiryMonth.value.length === 2 &&
         expiryYear.value.length === 4 &&
         cvv.value.length === 3
})

/**
 * Validate form
 */
function validateForm(): boolean {
  errors.value = {}
  
  if (cardNumber.value.length !== 16) {
    errors.value.cardNumber = 'Numéro de carte invalide'
  }
  
  if (!holderName.value.trim()) {
    errors.value.holderName = 'Nom du titulaire requis'
  }
  
  const month = parseInt(expiryMonth.value)
  if (!month || month < 1 || month > 12) {
    errors.value.expiry = 'Mois invalide'
  }
  
  const year = parseInt(expiryYear.value)
  const currentYear = new Date().getFullYear()
  if (!year || year < currentYear || year > currentYear + 20) {
    errors.value.expiry = 'Année invalide'
  }
  
  if (cvv.value.length !== 3) {
    errors.value.cvv = 'CVV invalide'
  }
  
  return Object.keys(errors.value).length === 0
}

/**
 * Handle card number input
 */
function handleCardNumberInput(event: Event): void {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')
  value = value.slice(0, 16)
  cardNumber.value = value
}

/**
 * Handle expiry input
 */
function handleExpiryMonthInput(event: Event): void {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')
  value = value.slice(0, 2)
  expiryMonth.value = value
}

function handleExpiryYearInput(event: Event): void {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')
  value = value.slice(0, 4)
  expiryYear.value = value
}

/**
 * Handle CVV input
 */
function handleCvvInput(event: Event): void {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')
  value = value.slice(0, 3)
  cvv.value = value
}

/**
 * Handle form submit
 */
async function handleSubmit(): Promise<void> {
  if (!validateForm()) return
  
  isLoading.value = true
  try {
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    emit('add', {
      cardNumber: cardNumber.value,
      holderName: holderName.value,
      expiryMonth: expiryMonth.value,
      expiryYear: expiryYear.value,
      cvv: cvv.value
    })
    
    // Reset form
    resetForm()
  } catch (error) {
    console.error('Add payment method error:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * Reset form
 */
function resetForm(): void {
  cardNumber.value = ''
  holderName.value = ''
  expiryMonth.value = ''
  expiryYear.value = ''
  cvv.value = ''
  errors.value = {}
}

/**
 * Handle modal close
 */
function handleClose(): void {
  if (isLoading.value) return
  resetForm()
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
          class="relative w-full max-w-md bg-white rounded-lg shadow-xl"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b md:p-5">
            <h3 class="text-lg font-semibold text-gray-900 md:text-xl">
              Ajouter une carte bancaire
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
          <form @submit.prevent="handleSubmit">
            <div class="p-4 space-y-4 md:p-5">
              <!-- Card number -->
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-900">
                  Numéro de carte <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <Icon
                    icon="mdi:credit-card"
                    class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  />
                  <input
                    :value="formattedCardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxlength="19"
                    class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-primary focus:border-transparent"
                    :class="{ 'border-red-500': errors.cardNumber }"
                    :disabled="isLoading"
                    @input="handleCardNumberInput"
                  />
                </div>
                <p v-if="errors.cardNumber" class="mt-1 text-xs text-red-500">
                  {{ errors.cardNumber }}
                </p>
              </div>

              <!-- Holder name -->
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-900">
                  Nom du titulaire <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="holderName"
                  type="text"
                  placeholder="Jean Dupont"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-primary focus:border-transparent uppercase"
                  :class="{ 'border-red-500': errors.holderName }"
                  :disabled="isLoading"
                />
                <p v-if="errors.holderName" class="mt-1 text-xs text-red-500">
                  {{ errors.holderName }}
                </p>
              </div>

              <!-- Expiry and CVV -->
              <div class="grid grid-cols-2 gap-3">
                <!-- Expiry -->
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-900">
                    Date d'expiration <span class="text-red-500">*</span>
                  </label>
                  <div class="flex gap-2">
                    <input
                      :value="expiryMonth"
                      type="text"
                      placeholder="MM"
                      maxlength="2"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-primary focus:border-transparent text-center"
                      :class="{ 'border-red-500': errors.expiry }"
                      :disabled="isLoading"
                      @input="handleExpiryMonthInput"
                    />
                    <span class="flex items-center text-gray-400">/</span>
                    <input
                      :value="expiryYear"
                      type="text"
                      placeholder="YYYY"
                      maxlength="4"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-primary focus:border-transparent text-center"
                      :class="{ 'border-red-500': errors.expiry }"
                      :disabled="isLoading"
                      @input="handleExpiryYearInput"
                    />
                  </div>
                  <p v-if="errors.expiry" class="mt-1 text-xs text-red-500">
                    {{ errors.expiry }}
                  </p>
                </div>

                <!-- CVV -->
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-900">
                    CVV <span class="text-red-500">*</span>
                  </label>
                  <input
                    :value="cvv"
                    type="text"
                    placeholder="123"
                    maxlength="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-primary focus:border-transparent text-center"
                    :class="{ 'border-red-500': errors.cvv }"
                    :disabled="isLoading"
                    @input="handleCvvInput"
                  />
                  <p v-if="errors.cvv" class="mt-1 text-xs text-red-500">
                    {{ errors.cvv }}
                  </p>
                </div>
              </div>

              <!-- Security info -->
              <div class="flex items-start gap-2 p-3 bg-blue-pale rounded-lg">
                <Icon
                  icon="mdi:shield-lock"
                  class="flex-shrink-0 w-5 h-5 text-blue-primary"
                />
                <p class="text-xs text-gray-700">
                  Vos informations sont cryptées et sécurisées par Stripe. 
                  Nous ne stockons pas vos données de carte complètes.
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
                type="submit"
                :disabled="!canSubmit || isLoading"
                :class="[
                  'px-4 py-2 text-sm font-medium text-white rounded-lg transition-all',
                  canSubmit && !isLoading
                    ? 'bg-blue-primary hover:bg-blue-dark'
                    : 'bg-gray-300 cursor-not-allowed'
                ]"
              >
                <span v-if="isLoading">Ajout en cours...</span>
                <span v-else>Ajouter la carte</span>
              </button>
            </div>
          </form>
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
