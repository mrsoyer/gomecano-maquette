/**
 * Mock Payment Composable
 * Simulates Stripe payment processing
 */

import { ref } from 'vue'
import { delay } from '@/utils/helpers'

export type PaymentMethod = 'card' | 'googlepay' | 'applepay'

export interface PaymentResult {
  success: boolean
  transactionId?: string
  amount?: number
  error?: string
}

/**
 * Mock payment processing
 * In production, this would integrate with Stripe
 */
export function useMockPayment() {
  const isProcessing = ref(false)
  const paymentSuccess = ref(false)
  const paymentError = ref<string | null>(null)

  /**
   * Process payment
   */
  async function processPayment(
    amount: number,
    method: PaymentMethod = 'card'
  ): Promise<PaymentResult> {
    isProcessing.value = true
    paymentError.value = null
    paymentSuccess.value = false

    try {
      // Simulate payment processing delay
      await delay(2000)

      // Simulate 95% success rate
      const shouldSucceed = Math.random() > 0.05

      if (shouldSucceed) {
        // Success
        paymentSuccess.value = true
        const transactionId = `txn_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        return {
          success: true,
          transactionId,
          amount
        }
      } else {
        // Failure (5% of the time)
        const errorMessages = [
          'Paiement refusé par votre banque',
          'Carte expirée',
          'Fonds insuffisants',
          'Erreur de connexion avec votre banque'
        ]

        paymentError.value = errorMessages[Math.floor(Math.random() * errorMessages.length)]

        return {
          success: false,
          error: paymentError.value
        }
      }
    } catch (err) {
      paymentError.value = err instanceof Error ? err.message : 'Erreur lors du paiement'
      return {
        success: false,
        error: paymentError.value
      }
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * Reset payment state
   */
  function resetPayment(): void {
    isProcessing.value = false
    paymentSuccess.value = false
    paymentError.value = null
  }

  return {
    isProcessing,
    paymentSuccess,
    paymentError,
    processPayment,
    resetPayment
  }
}
