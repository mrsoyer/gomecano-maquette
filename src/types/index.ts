// Database types (generated from Supabase)
export * from './database.types'

// Business types
export * from './account'
export * from './booking'
export * from './appointment'
export * from './auth'
export * from './user'
export * from './profile'
export * from './vehicle'
export * from './service'
export * from './support'
export * from './emergency'
export * from './analytics'
export * from './fleet'
export * from './subscription'
export * from './sharing'
export * from './video'
export * from './parts'

// Helper types
export * from './mechanic.types'
export * from './content.types'
export * from './api.types'
export * from './composables.types'
export * from './storage.types'

// Re-export specific types for easier imports
export type {
  // Tables
  Profile,
  Vehicle,
  Service,
  Appointment,
  Mechanic,
  Review,
  Invoice,
  Quote,
  Address,
  Notification,

  // Insert types
  ProfileInsert,
  VehicleInsert,
  AppointmentInsert,
  AddressInsert,

  // Update types
  ProfileUpdate,
  VehicleUpdate,
  AppointmentUpdate,

  // Enums
  UserRole,
  AccountType,
  AppointmentStatus,
  FuelType,
  SubscriptionStatus,

  // Relations
  AppointmentWithRelations,
  VehicleWithMake,
  ReviewWithDetails,
  MechanicWithProfile,
} from './database.types'
