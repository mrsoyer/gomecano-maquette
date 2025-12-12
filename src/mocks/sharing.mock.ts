/**
 * Family Sharing Mock Data
 */

import type { FamilyMember, Invitation, SharedVehicle } from '@/types/sharing'

export const mockFamilyMembers: FamilyMember[] = [
  {
    id: 'member-1',
    name: 'Marc Martin',
    email: 'marc.martin@email.com',
    relationship: 'spouse',
    permissions: {
      viewInterventions: true,
      bookInterventions: true,
      managePayments: true,
      viewDocuments: true,
      editVehicles: false
    },
    invitedAt: '2024-01-10',
    acceptedAt: '2024-01-11',
    invitedBy: 'user-1'
  },
  {
    id: 'member-2',
    name: 'Julie Martin',
    email: 'julie.martin@email.com',
    relationship: 'child',
    permissions: {
      viewInterventions: true,
      bookInterventions: false,
      managePayments: false,
      viewDocuments: true,
      editVehicles: false
    },
    invitedAt: '2024-02-05',
    acceptedAt: '2024-02-05',
    invitedBy: 'user-1'
  }
]

export const mockInvitations: Invitation[] = [
  {
    id: 'inv-1',
    email: 'pierre.dubois@email.com',
    relationship: 'parent',
    permissions: {
      viewInterventions: true,
      bookInterventions: false,
      managePayments: false,
      viewDocuments: false,
      editVehicles: false
    },
    status: 'pending',
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    token: 'inv-token-123'
  }
]

export const mockSharedVehicles: SharedVehicle[] = [
  {
    vehicleId: 'vehicle-1',
    sharedWith: ['member-1', 'member-2'],
    sharedAt: '2024-01-11'
  }
]

export async function getFamilyMembers(userId: string): Promise<FamilyMember[]> {
  await new Promise(resolve => setTimeout(resolve, 400))
  return mockFamilyMembers
}

export async function inviteMember(data: Partial<Invitation>): Promise<Invitation> {
  await new Promise(resolve => setTimeout(resolve, 600))
  
  const newInvitation: Invitation = {
    id: `inv-${Date.now()}`,
    email: data.email!,
    relationship: data.relationship!,
    permissions: data.permissions!,
    status: 'pending',
    sentAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    token: `inv-token-${Date.now()}`
  }
  
  mockInvitations.push(newInvitation)
  return newInvitation
}

export async function removeMember(memberId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 400))
  const index = mockFamilyMembers.findIndex(m => m.id === memberId)
  if (index !== -1) {
    mockFamilyMembers.splice(index, 1)
  }
}
