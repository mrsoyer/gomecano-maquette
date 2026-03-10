import type { DaySlots, TimeSlotDetailed, WeekSlots, SlotGenerationConfig, SlotStatus } from '@/types/booking'

/**
 * Generate all time slots for a specific day (8h-18h by 30min intervals)
 * 
 * @param date - Date string (YYYY-MM-DD)
 * @param serviceDuration - Total service duration in minutes
 * @param fullSlotsPercentage - Percentage of slots to mark as "full" (default 30%)
 * @returns DaySlots object with all slots and their statuses
 * 
 * @example
 * generateDaySlots('2025-12-15', 120, 30)
 * // Returns 20 slots: 08:00-08:30, 08:30-09:00, ..., 17:30-18:00
 */
export function generateDaySlots(
  date: string,
  serviceDuration: number,
  fullSlotsPercentage: number = 30
): DaySlots {
  const dateObj = new Date(date)
  const now = new Date()
  const isWithin24Hours = (dateObj.getTime() - now.getTime()) < 24 * 60 * 60 * 1000
  
  const slots: TimeSlotDetailed[] = []
  
  // Generate slots from 8h to 18h by 30min intervals
  for (let hour = 8; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const startHour = hour
      const startMinute = minute
      const endMinute = minute + 30
      const endHour = endMinute >= 60 ? hour + 1 : hour
      const finalEndMinute = endMinute >= 60 ? 0 : endMinute
      
      const timeString = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`
      const endTimeString = `${String(endHour).padStart(2, '0')}:${String(finalEndMinute).padStart(2, '0')}`
      
      // Determine slot status
      let status: SlotStatus = 'available'
      let reason: string | undefined
      
      // Rule 1: Less than 24h = full
      if (isWithin24Hours) {
        status = 'full'
        reason = 'Délai trop court'
      }
      // Rule 2: Mark some slots as "full" (popularity effect)
      else if (Math.random() * 100 < fullSlotsPercentage) {
        status = 'full'
        reason = 'Créneau réservé'
      }
      
      slots.push({
        time: `${timeString}-${endTimeString}`,
        date: date, // Ajout de la date à chaque créneau
        startHour,
        startMinute,
        endHour,
        endMinute: finalEndMinute,
        status,
        reason
      })
    }
  }
  
  // Apply logic to mark slots without enough consecutive available slots
  applyConsecutiveSlotsCheck(slots, serviceDuration)
  
  return {
    date,
    dayName: dateObj.toLocaleDateString('fr-FR', { weekday: 'long' }),
    slots,
    hasAvailableSlots: slots.some(s => s.status === 'available'),
    isWithin24Hours
  }
}

/**
 * Check if each available slot has enough consecutive available slots
 * Mark slots as unavailable if they don't have enough consecutive slots
 * 
 * @param slots - Array of time slots to modify
 * @param serviceDuration - Total service duration in minutes
 * 
 * @example
 * If serviceDuration = 210 min (7 slots) and we have 20 slots total (8h-18h),
 * then slots 14-20 (last 6 slots) become UNAVAILABLE because they don't have
 * 7 consecutive available slots after them.
 * 
 * IMPORTANT: We use a snapshot of the ORIGINAL statuses to avoid cascade effects.
 */
function applyConsecutiveSlotsCheck(
  slots: TimeSlotDetailed[],
  serviceDuration: number
): void {
  const serviceSlotsNeeded = Math.ceil(serviceDuration / 30) // Number of 30min slots needed
  
  // Create a snapshot of original statuses to avoid cascade effects
  const originalStatuses = slots.map(s => s.status)
  
  // Iterate through all slots
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i]
    
    // Only check slots that were originally available
    if (originalStatuses[i] === 'available') {
      // Check if there are enough consecutive slots available (including current slot)
      let hasEnoughConsecutiveSlots = true
      
      // Check the current slot + (serviceSlotsNeeded - 1) following slots
      // Use ORIGINAL statuses to check, not modified ones
      for (let j = 0; j < serviceSlotsNeeded; j++) {
        const nextSlotIndex = i + j
        
        // If we're beyond the array or the ORIGINAL slot status is not available
        if (nextSlotIndex >= slots.length || originalStatuses[nextSlotIndex] !== 'available') {
          hasEnoughConsecutiveSlots = false
          break
        }
      }
      
      // If not enough consecutive slots, mark as unavailable
      if (!hasEnoughConsecutiveSlots) {
        slot.status = 'unavailable'
        slot.reason = `Chevauchement - ${serviceSlotsNeeded} créneaux consécutifs requis`
      }
    }
  }
}

/**
 * Generate a full week of slots
 * 
 * @param weekOffset - Week offset (0 = current week, 1 = next week, etc.)
 * @param serviceDuration - Total service duration in minutes
 * @param config - Optional configuration overrides
 * @returns WeekSlots object with all days and their slots
 */
export function generateWeekSlots(
  weekOffset: number,
  serviceDuration: number,
  config: Partial<SlotGenerationConfig> = {}
): WeekSlots {
  const defaultConfig: SlotGenerationConfig = {
    startHour: 8,
    endHour: 18,
    slotDuration: 30,
    serviceDuration,
    fullSlotsPercentage: 30,
    excludeWeekends: true,
    ...config
  }
  
  const today = new Date()
  const startOfWeek = new Date(today)
  
  // Calculate start of week based on offset
  startOfWeek.setDate(today.getDate() + (weekOffset * 7))
  // Set to Monday (getDay() returns 0 for Sunday, 1 for Monday, etc.)
  const dayOfWeek = startOfWeek.getDay()
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  startOfWeek.setDate(startOfWeek.getDate() + daysToMonday)
  
  const days: DaySlots[] = []
  
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(startOfWeek)
    dayDate.setDate(startOfWeek.getDate() + i)
    
    // Exclude weekends if configured
    const dayOfWeek = dayDate.getDay()
    if (defaultConfig.excludeWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
      continue
    }
    
    const dateString = dayDate.toISOString().split('T')[0]
    const daySlots = generateDaySlots(
      dateString,
      serviceDuration,
      defaultConfig.fullSlotsPercentage
    )
    
    days.push(daySlots)
  }
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  
  return {
    weekNumber: weekOffset,
    startDate: startOfWeek.toISOString().split('T')[0],
    endDate: endOfWeek.toISOString().split('T')[0],
    days
  }
}
