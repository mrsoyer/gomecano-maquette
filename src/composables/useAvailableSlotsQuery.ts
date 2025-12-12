import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { mockBookingSlots } from '@/mocks/bookingData'
import type { BookingSlot } from '@/types/booking'
// import { supabase } from '@/services/supabase'  // Pour /website/

/**
 * Configuration - Toggle between mock and real API
 */
const USE_MOCK_DATA = true

/**
 * Fetch available slots for a given postal code
 * 
 * @param postalCode - Postal code to fetch slots for
 * @returns Promise<BookingSlot[]>
 */
async function fetchAvailableSlots(postalCode: string): Promise<BookingSlot[]> {
  if (USE_MOCK_DATA) {
    // MAQUETTE : Mock data avec délai simulé
    await new Promise(resolve => setTimeout(resolve, 800))
    return mockBookingSlots
  }
  
  // WEBSITE : Supabase Edge Function
  // const { data, error } = await supabase.functions.invoke('get-available-slots', {
  //   body: { 
  //     postalCode,
  //     serviceIds: [], // Pass service IDs from cart
  //     vehicleId: ''   // Pass vehicle ID
  //   }
  // })
  // 
  // if (error) throw new Error(error.message)
  // return data as BookingSlot[]
  
  return []
}

/**
 * Composable to fetch available booking slots
 * Uses TanStack Query for caching and automatic refetching
 * 
 * @param postalCode - Postal code (reactive)
 * @returns Query result with available slots
 */
export function useAvailableSlotsQuery(postalCode: Ref<string>) {
  return useQuery({
    queryKey: ['available-slots', postalCode],
    queryFn: () => fetchAvailableSlots(postalCode.value),
    enabled: computed(() => postalCode.value.length === 5),
    staleTime: 2 * 60 * 1000,  // Cache 2 minutes (données changent souvent)
    refetchInterval: 5 * 60 * 1000  // Refetch toutes les 5 min si page active
  })
}
