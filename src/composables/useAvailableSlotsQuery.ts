import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { mockBookingSlots } from '@/mocks/booking-data.mock'
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
 * Legacy mock slot format
 */
interface LegacySlot {
  date: string
  slots: string[]
}

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
 * Fetch available slots for a given postal code and date
 *
 * @param postalCode - Postal code to fetch slots for
 * @param date - Date to fetch slots for (defaults to today)
 * @param serviceId - Optional service ID for duration filtering
 * @returns Promise<BookingSlot[]>
 */
async function fetchAvailableSlots(
  postalCode: string,
  date?: string,
  serviceId?: string
): Promise<BookingSlot[]> {
  if (USE_MOCK_DATA) {
    // MAQUETTE: Mock data with simulated delay
    await new Promise(resolve => setTimeout(resolve, 800))
    return transformLegacySlots(mockBookingSlots as unknown as LegacySlot[])
  }

  // PRODUCTION: Call Supabase RPC
  const targetDate = date || new Date().toISOString().split('T')[0]

  const { data, error } = await supabase.rpc('booking_get_available_slots', {
    p_date: targetDate,
    p_postal_code: postalCode || null,
    p_service_id: serviceId || null
  })

  if (error) {
    throw new Error(error.message)
  }

  return transformSupabaseSlots(data || [])
}

/**
 * Composable to fetch available booking slots
 * Uses TanStack Query for caching and automatic refetching
 *
 * @param postalCode - Postal code (reactive)
 * @param date - Optional date (reactive)
 * @param serviceId - Optional service ID (reactive)
 * @returns Query result with available slots
 */
export function useAvailableSlotsQuery(
  postalCode: Ref<string>,
  date?: Ref<string>,
  serviceId?: Ref<string>
) {
  return useQuery({
    queryKey: ['available-slots', postalCode, date, serviceId],
    queryFn: () => fetchAvailableSlots(
      postalCode.value,
      date?.value,
      serviceId?.value
    ),
    enabled: computed(() => postalCode.value.length === 5),
    staleTime: 2 * 60 * 1000,  // Cache 2 minutes (data changes often)
    refetchInterval: 5 * 60 * 1000  // Refetch every 5 min if page active
  })
}
