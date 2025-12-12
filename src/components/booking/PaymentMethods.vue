<script setup lang="ts">
import { ref } from 'vue'
import { useMockPayment, type PaymentMethod } from '@/composables/useMockPayment'

/**
 * Props
 */
interface Props {
  total: number
}

const props = defineProps<Props>()

/**
 * Emits
 */
const emit = defineEmits<{
  success: [transactionId: string]
  error: [error: string]
}>()

/**
 * Payment state
 */
const { isProcessing, paymentError, processPayment } = useMockPayment()

/**
 * Handle payment
 */
async function handlePayment(method: PaymentMethod): Promise<void> {
  const result = await processPayment(props.total, method)

  if (result.success && result.transactionId) {
    emit('success', result.transactionId)
  } else if (result.error) {
    emit('error', result.error)
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Payment Methods -->
    <div class="space-y-3">
      <h3 class="font-semibold text-gray-900 mb-4">Choisissez votre moyen de paiement</h3>

      <!-- Google Pay -->
      <button
        @click="handlePayment('googlepay')"
        :disabled="isProcessing"
        class="w-full flex items-center justify-center gap-3 px-6 py-4 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span class="text-xl">G</span>
        <span>Pay - Payer en 1 clic</span>
      </button>

      <!-- Apple Pay -->
      <button
        @click="handlePayment('applepay')"
        :disabled="isProcessing"
        class="w-full flex items-center justify-center gap-3 px-6 py-4 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span class="text-xl"></span>
        <span>Pay - Payer en 1 clic</span>
      </button>

      <!-- Card Payment -->
      <button
        @click="handlePayment('card')"
        :disabled="isProcessing"
        class="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span class="text-xl">💳</span>
        <span>Carte bancaire</span>
      </button>
    </div>

    <!-- Processing state -->
    <div v-if="isProcessing" class="text-center py-4">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-600 border-t-transparent"></div>
      <p class="text-gray-600 mt-3 font-medium">Traitement du paiement...</p>
    </div>

    <!-- Error message -->
    <div v-if="paymentError" class="bg-red-50 border-2 border-red-200 rounded-lg p-4">
      <p class="text-red-800 font-medium">❌ {{ paymentError }}</p>
    </div>

    <!-- Trust Signals -->
    <div class="bg-gray-50 rounded-lg p-6 space-y-3 text-sm text-gray-700">
      <div class="flex items-center gap-2">
        <span class="text-green-600">🔒</span>
        <span class="font-medium">Paiement 100% sécurisé Stripe</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-green-600">✓</span>
        <span>Satisfait ou remboursé 30 jours</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-green-600">✓</span>
        <span>Annulation gratuite jusqu'à 24h avant</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-green-600">✓</span>
        <span>Garantie 24 mois pièces & main d'œuvre</span>
      </div>
    </div>
  </div>
</template>


