/**
 * Booking Slots Composable
 * Simulates fetching available time slots for appointments
 */

import { ref } from 'vue'
import { mockBookingSlots } from '@/mocks/bookingData'
import { delay } from '@/utils/helpers'
import type { BookingSlot } from '@/types/booking'

/**
 * Get available booking slots for a specific postal code
 * In production, this would call a real API to check mechanic availability
 */
export function useBookingSlots(postalCode?: string) {
  const availableSlots = ref<BookingSlot[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch available slots
   */
  async function fetchAvailableSlots(): Promise<BookingSlot[]> {
    isLoading.value = true
    error.value = null

    try {
      // Simulate API delay
      await delay(600)

      // In production, this would filter based on postal code and mechanic availability
      // For now, return all mock slots
      availableSlots.value = mockBookingSlots

      return availableSlots.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la récupération des créneaux'
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Check if a specific slot is available
   */
  function isSlotAvailable(date: string, slot: string): boolean {
    const daySlots = availableSlots.value.find(s => s.date === date)
    return daySlots ? daySlots.slots.includes(slot) : false
  }

  /**
   * Get slots for a specific date
   */
  function getSlotsForDate(date: string): string[] {
    const daySlots = availableSlots.value.find(s => s.date === date)
    return daySlots ? daySlots.slots : []
  }

  return {
    availableSlots,
    isLoading,
    error,
    fetchAvailableSlots,
    isSlotAvailable,
    getSlotsForDate
  }
}
