/**
 * Family Sharing Types - Multi-user vehicle access
 */

export type RelationshipType = 'spouse' | 'child' | 'parent' | 'sibling' | 'other'

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired'

export interface FamilyMember {
  id: string
  name: string
  email: string
  relationship: RelationshipType
  permissions: MemberPermissions
  invitedAt: string
  acceptedAt?: string
  invitedBy: string
}

export interface MemberPermissions {
  viewInterventions: boolean
  bookInterventions: boolean
  managePayments: boolean
  viewDocuments: boolean
  editVehicles: boolean
}

export interface SharedVehicle {
  vehicleId: string
  sharedWith: string[] // FamilyMember IDs
  sharedAt: string
}

export interface Invitation {
  id: string
  email: string
  relationship: RelationshipType
  permissions: MemberPermissions
  status: InvitationStatus
  sentAt: string
  expiresAt: string
  token: string
}
