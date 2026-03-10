/**
 * Booking Slots Composable
 * Fetches available time slots for appointments from Supabase
 * Falls back to mock data for maquette mode
 */

import { ref } from 'vue'
import { mockBookingSlots } from '@/mocks/booking-data.mock'
import { delay } from '@/utils/helpers'
import { supabase } from '@/services/supabase'
import type { BookingSlot } from '@/types/booking'

/**
 * Configuration - Toggle between mock and real API
 */
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

/**
 * Slot from Supabase RPC (production format)
 */
interface SupabaseSlot {
  mechanic_id: string
  mechanic_name: string
  date: string
  start_time: string
  end_time: string
  is_available: boolean
}

/**
 * Legacy mock slot format for backward compatibility
 */
interface LegacySlot {
  date: string
  slots: string[]
}

/**
 * Get available booking slots for a specific postal code
 *
 * @param postalCode - Postal code for zone filtering
 * @param serviceId - Optional service ID for duration-based filtering
 * @returns Booking slots state and methods
 */
export function useBookingSlots(postalCode?: string, serviceId?: string) {
  const availableSlots = ref<BookingSlot[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Transform Supabase slots to BookingSlot format
   */
  function transformSupabaseSlots(slots: SupabaseSlot[]): BookingSlot[] {
    return slots.map(slot => ({
      mechanicId: slot.mechanic_id,
      mechanicName: slot.mechanic_name,
      date: slot.date,
      startTime: slot.start_time,
      endTime: slot.end_time
    }))
  }

  /**
   * Transform legacy mock slots to BookingSlot format
   */
  function transformLegacySlots(legacySlots: LegacySlot[]): BookingSlot[] {
    const result: BookingSlot[] = []
    for (const day of legacySlots) {
      for (const timeRange of day.slots) {
        const [startTime, endTime] = timeRange.split('-')
        result.push({
          mechanicId: 'mock-mechanic-1',
          mechanicName: 'Mécanicien disponible',
          date: day.date,
          startTime,
          endTime
        })
      }
    }
    return result
  }

  /**
   * Fetch available slots from Supabase or mock
   *
   * @param date - Optional specific date (defaults to next 7 days)
   */
  async function fetchAvailableSlots(date?: string): Promise<BookingSlot[]> {
    isLoading.value = true
    error.value = null

    try {
      if (USE_MOCK_DATA) {
        // MAQUETTE: Use mock data with simulated delay
        await delay(600)
        availableSlots.value = transformLegacySlots(mockBookingSlots as unknown as LegacySlot[])
        return availableSlots.value
      }

      // PRODUCTION: Call Supabase RPC
      const targetDate = date || new Date().toISOString().split('T')[0]

      const { data, error: rpcError } = await supabase.rpc('booking_get_available_slots', {
        p_date: targetDate,
        p_postal_code: postalCode || null,
        p_service_id: serviceId || null
      })

      if (rpcError) {
        throw new Error(rpcError.message)
      }

      availableSlots.value = transformSupabaseSlots(data || [])
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
   *
   * @param date - The date to check
   * @param startTime - The start time to check
   */
  function isSlotAvailable(date: string, startTime: string): boolean {
    return availableSlots.value.some(
      slot => slot.date === date && slot.startTime === startTime
    )
  }

  /**
   * Get slots for a specific date
   *
   * @param date - The date to get slots for
   */
  function getSlotsForDate(date: string): BookingSlot[] {
    return availableSlots.value.filter(slot => slot.date === date)
  }

  /**
   * Get unique dates that have available slots
   */
  function getAvailableDates(): string[] {
    const dates = new Set(availableSlots.value.map(slot => slot.date))
    return Array.from(dates).sort()
  }

  return {
    availableSlots,
    isLoading,
    error,
    fetchAvailableSlots,
    isSlotAvailable,
    getSlotsForDate,
    getAvailableDates
  }
}
