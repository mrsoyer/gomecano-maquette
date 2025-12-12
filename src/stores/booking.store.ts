/**
 * Booking Store - Manages booking flow state
 * Handles user information, promo codes, and booking confirmation
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BookingUserInfo, BillingAddress } from '@/types/booking'

export interface UserInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  createAccount?: boolean
}

export interface BookingConfirmation {
  id: string
  transactionId: string
  createdAt: Date
  confirmedAt: Date
}

export const useBookingStore = defineStore('booking', () => {
  /**
   * State
   */
  const currentStep = ref(1)
  const userInfo = ref<UserInfo | null>(null)
  const billingAddress = ref<BillingAddress | null>(null)
  const promoCode = ref('')
  const discount = ref(0)
  const confirmedBooking = ref<BookingConfirmation | null>(null)

  /**
   * Computed - Check if user info is complete
   */
  const isUserInfoComplete = computed(() => {
    if (!userInfo.value) return false
    return (
      !!userInfo.value.firstName &&
      !!userInfo.value.lastName &&
      !!userInfo.value.email &&
      !!userInfo.value.phone
    )
  })

  /**
   * Computed - Formatted discount percentage
   */
  const discountPercentage = computed(() => {
    return Math.round(discount.value * 100)
  })

  /**
   * Set current step
   */
  function setCurrentStep(step: number): void {
    currentStep.value = step
  }

  /**
   * Go to next step
   */
  function nextStep(): void {
    if (currentStep.value < 4) {
      currentStep.value++
    }
  }

  /**
   * Go to previous step
   */
  function previousStep(): void {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  /**
   * Set user information
   */
  function setUserInfo(info: UserInfo | BookingUserInfo): void {
    userInfo.value = info
  }
  
  /**
   * Set billing address (optional, if different from intervention address)
   */
  function setBillingAddress(address: BillingAddress | null): void {
    billingAddress.value = address
  }

  /**
   * Apply promo code
   */
  function applyPromoCode(code: string): boolean {
    promoCode.value = code.toUpperCase()

    // Mock promo codes
    const promoCodes: Record<string, number> = {
      'PROMO10': 0.10,
      'WELCOME20': 0.20,
      'FIRST15': 0.15
    }

    if (promoCodes[promoCode.value]) {
      discount.value = promoCodes[promoCode.value]
      return true
    }

    // Invalid promo code
    discount.value = 0
    return false
  }

  /**
   * Remove promo code
   */
  function removePromoCode(): void {
    promoCode.value = ''
    discount.value = 0
  }

  /**
   * Confirm booking
   */
  function confirmBooking(transactionId: string): void {
    confirmedBooking.value = {
      id: `BKG-${Date.now()}`,
      transactionId,
      createdAt: new Date(),
      confirmedAt: new Date()
    }
  }

  /**
   * Reset entire booking state
   */
  function resetBooking(): void {
    currentStep.value = 1
    userInfo.value = null
    billingAddress.value = null
    promoCode.value = ''
    discount.value = 0
    confirmedBooking.value = null
  }

  return {
    // State
    currentStep,
    userInfo,
    billingAddress,
    promoCode,
    discount,
    confirmedBooking,
    // Computed
    isUserInfoComplete,
    discountPercentage,
    // Methods
    setCurrentStep,
    nextStep,
    previousStep,
    setUserInfo,
    setBillingAddress,
    applyPromoCode,
    removePromoCode,
    confirmBooking,
    resetBooking
  }
})


