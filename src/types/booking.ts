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

/**
 * Booking Flow Types
 */

/**
 * Booking State - Complete booking flow state
 */
export interface BookingState {
  step: BookingStep
  vehicle: BookingVehicle | null
  service: BookingService | null
  options: BookingOption[]
  answers: BookingAnswer[]
  slot: BookingSlot | null
  address: BookingAddress | null
  quote: BookingQuote | null
  payment: BookingPayment | null
}

export type BookingStep =
  | 'vehicle'
  | 'service'
  | 'options'
  | 'quote'
  | 'slot'
  | 'address'
  | 'payment'
  | 'confirmation'

/**
 * Booking Vehicle - Vehicle selected during booking
 */
export interface BookingVehicle {
  id?: string // Si véhicule existant
  plate: string
  makeId?: string
  makeName: string
  modelName: string
  year: number
  fuelType: string
  mileage?: number
}

/**
 * Booking Service - Service selected during booking
 */
export interface BookingService {
  id: string
  name: string
  slug: string
  category: ServiceCategory
  basePrice: number
  estimatedDuration: number
  description?: string
}

export type ServiceCategory =
  | 'entretien'
  | 'freinage'
  | 'pneus'
  | 'diagnostic'
  | 'climatisation'
  | 'batterie'
  | 'vidange'
  | 'revision'
  | 'autre'

/**
 * Booking Option - Additional option during booking
 */
export interface BookingOption {
  id: string
  name: string
  price: number
  isSelected: boolean
}

/**
 * Booking Answer - Answer to service question
 */
export interface BookingAnswer {
  questionId: string
  question: string
  answer: string | number | boolean | string[]
  priceImpact: number
}

/**
 * Booking Slot - Time slot selected during booking
 */
export interface BookingSlot {
  mechanicId: string
  mechanicName: string
  date: string // ISO date
  startTime: string // HH:mm
  endTime: string // HH:mm
}

/**
 * Booking Address - Intervention address
 */
export interface BookingAddress {
  id?: string // Si adresse existante
  street: string
  complement?: string
  city: string
  zipCode: string
  instructions?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

/**
 * Booking Quote - Calculated quote
 */
export interface BookingQuote {
  partsPrice: number
  laborPrice: number
  optionsPrice: number
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  validUntil: string // ISO date
  lineItems: QuoteLineItem[]
}

/**
 * Quote Line Item - Individual quote line
 */
export interface QuoteLineItem {
  name: string
  quantity: number
  unitPrice: number
  total: number
  type: 'labor' | 'parts' | 'option'
}

/**
 * Booking Payment - Payment information
 */
export interface BookingPayment {
  method: PaymentMethod
  status: PaymentStatus
  stripePaymentIntentId?: string
  amount: number
}

export type PaymentMethod = 'card' | 'apple_pay' | 'google_pay'
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed'

/**
 * Booking Actions - Store actions interface
 */
export interface BookingActions {
  setVehicle: (vehicle: BookingVehicle) => void
  setService: (service: BookingService) => void
  toggleOption: (optionId: string) => void
  setAnswer: (answer: BookingAnswer) => void
  setSlot: (slot: BookingSlot) => void
  setAddress: (address: BookingAddress) => void
  calculateQuote: () => Promise<BookingQuote>
  submitBooking: () => Promise<string> // Returns appointment ID
  reset: () => void
  goToStep: (step: BookingStep) => void
}

/**
 * Create initial booking state
 */
export function createInitialBookingState(): BookingState {
  return {
    step: 'vehicle',
    vehicle: null,
    service: null,
    options: [],
    answers: [],
    slot: null,
    address: null,
    quote: null,
    payment: null
  }
}
