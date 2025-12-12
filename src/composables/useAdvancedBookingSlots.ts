import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart.store'
import { generateWeekSlots } from '@/utils/slotGenerator'
import type { WeekSlots, DaySlots, TimeSlotDetailed, SelectedTimeRange } from '@/types/booking'

/**
 * Advanced booking slots composable with time range selection and week navigation
 * 
 * Features:
 * - Select up to 3 preferred time RANGES (consecutive slots based on service duration)
 * - Navigate through weeks
 * - Dynamic service duration calculation from cart
 * - Smart slot availability based on duration and overlaps
 * 
 * @returns Reactive booking slots state and methods
 * 
 * @example
 * ```vue
 * <script setup>
 * const slots = useAdvancedBookingSlots()
 * 
 * // Navigate weeks
 * slots.nextWeek()
 * slots.previousWeek()
 * 
 * // Select time range (auto-selects consecutive slots)
 * slots.toggleSlot(slot, currentDate)
 * 
 * // Check selection
 * console.log(slots.selectedRanges.value) // Up to 3 time ranges
 * </script>
 * ```
 */
export function useAdvancedBookingSlots() {
  const cartStore = useCartStore()
  
  // State
  const currentWeekOffset = ref(0) // 0 = current week, 1 = next week, etc.
  const selectedDate = ref<string | null>(null)
  const selectedRanges = ref<SelectedTimeRange[]>([]) // Max 3 time ranges
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)
  
  /**
   * Total service duration from cart (in minutes)
   */
  const totalServiceDuration = computed<number>(() => {
    if (!cartStore.services || cartStore.services.length === 0) {
      return 60 // Default 1 hour if no services
    }
    return cartStore.services.reduce((sum, service) => sum + service.duration, 0)
  })
  
  /**
   * Current week with all slots generated dynamically
   */
  const currentWeek = computed<WeekSlots>(() => {
    return generateWeekSlots(currentWeekOffset.value, totalServiceDuration.value, {
      fullSlotsPercentage: 0 // 10% of slots marked as "full" (reduced to allow more bookings)
    })
  })
  
  /**
   * Available days (with at least 1 available slot)
   */
  const availableDays = computed<DaySlots[]>(() => {
    return currentWeek.value.days.filter(day => day.hasAvailableSlots)
  })
  
  /**
   * Slots for the selected day
   */
  const selectedDaySlots = computed<TimeSlotDetailed[]>(() => {
    if (!selectedDate.value) return []
    const day = currentWeek.value.days.find(d => d.date === selectedDate.value)
    return day?.slots || []
  })
  
  /**
   * Available slots only (for the selected day)
   */
  const availableSlots = computed<TimeSlotDetailed[]>(() => {
    return selectedDaySlots.value.filter(s => s.status === 'available')
  })
  
  /**
   * Can select more ranges? (max 3)
   */
  const canSelectMoreRanges = computed(() => selectedRanges.value.length < 3)
  
  /**
   * Has selected at least 1 range?
   */
  const hasSelectedRanges = computed(() => selectedRanges.value.length > 0)
  
  /**
   * Has selected exactly 3 ranges? (required)
   */
  const hasThreeRanges = computed(() => selectedRanges.value.length === 3)
  
  /**
   * Go to next week
   */
  function nextWeek(): void {
    currentWeekOffset.value++
    selectedDate.value = null
    errorMessage.value = null
    // Keep selectedRanges when changing week (multi-week selection)
  }
  
  /**
   * Go to previous week (min 0 = current week)
   */
  function previousWeek(): void {
    if (currentWeekOffset.value > 0) {
      currentWeekOffset.value--
      selectedDate.value = null
      errorMessage.value = null
      // Keep selectedRanges when changing week (multi-week selection)
    }
  }
  
  /**
   * Select a day (keep ranges if changing day in same week)
   */
  function selectDay(date: string): void {
    selectedDate.value = date
    errorMessage.value = null
    // Do NOT reset selectedRanges when changing day
  }
  
  /**
   * Toggle time range selection (add or remove entire consecutive range)
   * 
   * @param slot - The starting slot of the range
   * @param currentDate - The date of the slot
   */
  function toggleSlot(slot: TimeSlotDetailed, currentDate: string): void {
    // 1. Calculate number of slots needed for the service duration
    const slotsNeeded = Math.ceil(totalServiceDuration.value / 30)
    
    // 2. Find slot index in the day
    const daySlots = selectedDaySlots.value
    const slotIndex = daySlots.findIndex(s => s.time === slot.time)
    
    if (slotIndex === -1) {
      errorMessage.value = 'Créneau invalide'
      return
    }
    
    // 3. Check if this range is already selected (toggle off)
    const existingIndex = selectedRanges.value.findIndex(
      r => r.date === currentDate && r.startSlot.time === slot.time
    )
    
    if (existingIndex > -1) {
      // Remove the entire range
      selectedRanges.value.splice(existingIndex, 1)
      errorMessage.value = null
      return
    }
    
    // 4. Check max 3 ranges
    if (selectedRanges.value.length >= 3) {
      errorMessage.value = 'Maximum 3 plages horaires sélectionnables'
      return
    }
    
    // 5. Check if there are enough consecutive available slots
    const consecutiveSlots: TimeSlotDetailed[] = []
    for (let i = 0; i < slotsNeeded; i++) {
      const nextSlot = daySlots[slotIndex + i]
      if (!nextSlot || nextSlot.status !== 'available') {
        errorMessage.value = `Impossible : ${slotsNeeded} créneaux consécutifs requis (${totalServiceDuration.value}min). Certains créneaux sont indisponibles.`
        return
      }
      consecutiveSlots.push(nextSlot)
    }
    
    // 6. Create the time range
    const day = currentWeek.value.days.find(d => d.date === currentDate)
    if (!day) {
      errorMessage.value = 'Jour invalide'
      return
    }
    
    const startSlot = consecutiveSlots[0]
    const endSlot = consecutiveSlots[consecutiveSlots.length - 1]
    
    const range: SelectedTimeRange = {
      date: currentDate,
      dayName: day.dayName,
      startTime: `${String(startSlot.startHour).padStart(2, '0')}:${String(startSlot.startMinute).padStart(2, '0')}`,
      endTime: `${String(endSlot.endHour).padStart(2, '0')}:${String(endSlot.endMinute).padStart(2, '0')}`,
      startSlot,
      slots: consecutiveSlots,
      slotsCount: slotsNeeded
    }
    
    selectedRanges.value.push(range)
    errorMessage.value = null
  }
  
  /**
   * Check if a slot is part of a selected time range
   * 
   * @param slot - The slot to check
   * @param date - The date of the slot
   * @returns true if this slot is part of any selected range
   */
  function isSlotPartOfSelectedRange(slot: TimeSlotDetailed, date: string): boolean {
    return selectedRanges.value.some(range => 
      range.date === date && 
      range.slots.some(s => s.time === slot.time)
    )
  }
  
  /**
   * Reset selection
   */
  function resetSelection(): void {
    selectedRanges.value = []
    selectedDate.value = null
    errorMessage.value = null
  }
  
  /**
   * Format date for display (e.g., "MER. 10")
   */
  function formatDateDisplay(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'short', 
      day: 'numeric'
    }).toUpperCase()
  }
  
  return {
    // State
    currentWeekOffset,
    selectedDate,
    selectedRanges,
    isLoading,
    errorMessage,
    
    // Computed
    currentWeek,
    availableDays,
    selectedDaySlots,
    availableSlots,
    canSelectMoreRanges,
    hasSelectedRanges,
    hasThreeRanges,
    totalServiceDuration,
    
    // Methods
    nextWeek,
    previousWeek,
    selectDay,
    toggleSlot,
    isSlotPartOfSelectedRange,
    resetSelection,
    formatDateDisplay
  }
}
