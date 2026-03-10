/**
 * API Types
 * Types génériques pour les réponses API et filtres
 */

// Réponses API génériques
export interface ApiResponse<T> {
  data: T
  error: null
}

export interface ApiError {
  data: null
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

export type ApiResult<T> = ApiResponse<T> | ApiError

// Type guard pour vérifier si c'est une erreur
export function isApiError<T>(result: ApiResult<T>): result is ApiError {
  return result.error !== null
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Filtres
export interface AppointmentFilters extends PaginationParams {
  status?: string | string[]
  dateFrom?: string
  dateTo?: string
  vehicleId?: string
  serviceId?: string
}

export interface ServiceFilters {
  category?: string
  isPopular?: boolean
  search?: string
  priceMin?: number
  priceMax?: number
}

export interface MechanicFilters extends PaginationParams {
  specialty?: string
  minRating?: number
  isAvailable?: boolean
  maxDistance?: number
}

export interface VehicleFilters extends PaginationParams {
  makeId?: string
  year?: number
  fuelType?: string
}

// Real-time
export interface RealtimeEvent<T> {
  type: RealtimeEventType
  table: string
  schema: string
  record: T
  old_record?: T
}

export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE'

// WebSocket messages
export interface WSMessage<T = unknown> {
  type: WSMessageType
  payload: T
}

export type WSMessageType =
  | 'appointment_update'
  | 'mechanic_location'
  | 'notification'
  | 'chat_message'

// Supabase query helpers
export interface QueryOptions {
  select?: string
  order?: {
    column: string
    ascending?: boolean
  }
  limit?: number
  offset?: number
}

// Loading states
export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function createAsyncState<T>(initialData: T | null = null): AsyncState<T> {
  return {
    data: initialData,
    loading: false,
    error: null
  }
}

// Form submission result
export interface FormSubmitResult {
  success: boolean
  message?: string
  errors?: Record<string, string[]>
}

// Search result
export interface SearchResult<T> {
  items: T[]
  query: string
  total: number
  took: number // ms
}
