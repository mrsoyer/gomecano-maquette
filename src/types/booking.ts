import type { Intervention } from './account'

/**
 * Booking Modification Types
 */

export interface BookingModification {
  id: string
  interventionId: string
  userId: string
  type: ModificationType
  requestedAt: string
  status: ModificationStatus
  previousData: Partial<Intervention>
  newData: Partial<Intervention>
  reason?: string
  processedAt?: string
  processedBy?: string
}

export type ModificationType = 'reschedule' | 'change_service' | 'change_address' | 'cancel'

export type ModificationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface CancellationPolicy {
  id: string
  minHoursBeforeAppointment: number
  refundPercentage: number
  cancellationFee: number
  description: string
}

export interface RescheduleOptions {
  id: string
  interventionId: string
  availableSlots: TimeSlot[]
  rescheduleFee: number
  minHoursNotice: number
}

export interface TimeSlot {
  date: string
  time: string
  available: boolean
  mechanicId?: string
}

export interface CancellationRequest {
  interventionId: string
  reason: string
  requestRefund: boolean
}

export interface RescheduleRequest {
  interventionId: string
  newDate: string
  newTime: string
  reason?: string
}
