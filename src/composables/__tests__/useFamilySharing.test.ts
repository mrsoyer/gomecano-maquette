import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useFamilySharing } from '../useFamilySharing'
import { supabase } from '@/services/supabase'

// Mock Supabase with RPC support
vi.mock('@/services/supabase', () => ({
  supabase: {
    rpc: vi.fn()
  }
}))

describe('useFamilySharing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchMembers', () => {
    it('should fetch family members via RPC', async () => {
      const mockMembers = [
        {
          id: 'fm-1',
          member_id: 'profile-1',
          member_name: 'Marie Dupont',
          member_email: 'marie@example.com',
          relationship: 'spouse',
          can_book: true,
          can_view_history: true,
          can_manage_vehicles: false,
          can_manage_payments: false,
          accepted_at: '2024-01-01T10:00:00Z',
          created_at: '2024-01-01T09:00:00Z'
        },
        {
          id: 'fm-2',
          member_id: 'profile-2',
          member_name: 'Lucas Dupont',
          member_email: 'lucas@example.com',
          relationship: 'child',
          can_book: true,
          can_view_history: false,
          can_manage_vehicles: false,
          can_manage_payments: false,
          accepted_at: null, // pending
          created_at: '2024-01-10T09:00:00Z'
        }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockMembers,
        error: null
      } as never)

      const { fetchMembers, members, loading, error } = useFamilySharing()

      expect(loading.value).toBe(false)

      await fetchMembers()

      expect(loading.value).toBe(false)
      expect(error.value).toBe(null)
      expect(members.value).toHaveLength(2)
      expect(members.value[0]).toEqual({
        id: 'fm-1',
        profileId: 'profile-1',
        name: 'Marie Dupont',
        email: 'marie@example.com',
        relationship: 'spouse',
        permissions: {
          canBook: true,
          canViewHistory: true,
          canManageVehicles: false,
          canManagePayments: false
        },
        status: 'active',
        addedAt: '2024-01-01T09:00:00Z'
      })
      expect(members.value[1].status).toBe('pending')
      expect(supabase.rpc).toHaveBeenCalledWith('account_get_family_members')
    })

    it('should handle fetch error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      } as never)

      const { fetchMembers, error } = useFamilySharing()

      await fetchMembers()

      expect(error.value).toBe('Failed to fetch members')
    })

    it('should set loading state during fetch', async () => {
      vi.mocked(supabase.rpc).mockImplementationOnce(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({ data: [], error: null } as never), 100)
        )
      )

      const { fetchMembers, loading } = useFamilySharing()

      const promise = fetchMembers()
      expect(loading.value).toBe(true)

      await promise
      expect(loading.value).toBe(false)
    })
  })

  describe('fetchInvitations', () => {
    it('should fetch invitations via RPC', async () => {
      const mockInvitations = [
        {
          id: 'inv-1',
          email: 'new@example.com',
          permissions: {
            canBook: true,
            canViewHistory: true,
            canManageVehicles: false,
            canManagePayments: false
          },
          status: 'pending',
          expires_at: '2024-02-15T00:00:00Z',
          created_at: '2024-01-15T10:00:00Z'
        }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockInvitations,
        error: null
      } as never)

      const { fetchInvitations, invitations, error } = useFamilySharing()

      await fetchInvitations()

      expect(error.value).toBe(null)
      expect(invitations.value).toHaveLength(1)
      expect(invitations.value[0]).toEqual({
        id: 'inv-1',
        email: 'new@example.com',
        permissions: {
          canBook: true,
          canViewHistory: true,
          canManageVehicles: false,
          canManagePayments: false
        },
        status: 'pending',
        expiresAt: '2024-02-15T00:00:00Z',
        createdAt: '2024-01-15T10:00:00Z'
      })
      expect(supabase.rpc).toHaveBeenCalledWith('account_get_family_invitations')
    })

    it('should handle fetch error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Failed to fetch invitations' }
      } as never)

      const { fetchInvitations, error } = useFamilySharing()

      await fetchInvitations()

      expect(error.value).toBe('Failed to fetch invitations')
    })
  })

  describe('activeMembers', () => {
    it('should return only active members', async () => {
      const mockMembers = [
        {
          id: 'fm-1',
          member_id: 'p-1',
          member_name: 'Active',
          member_email: 'active@test.com',
          relationship: null,
          can_book: true,
          can_view_history: false,
          can_manage_vehicles: false,
          can_manage_payments: false,
          accepted_at: '2024-01-01T10:00:00Z',
          created_at: '2024-01-01T09:00:00Z'
        },
        {
          id: 'fm-2',
          member_id: 'p-2',
          member_name: 'Pending',
          member_email: 'pending@test.com',
          relationship: null,
          can_book: true,
          can_view_history: false,
          can_manage_vehicles: false,
          can_manage_payments: false,
          accepted_at: null,
          created_at: '2024-01-10T09:00:00Z'
        }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockMembers,
        error: null
      } as never)

      const { fetchMembers, activeMembers } = useFamilySharing()

      await fetchMembers()

      expect(activeMembers.value).toHaveLength(1)
      expect(activeMembers.value[0].name).toBe('Active')
    })
  })

  describe('pendingInvitations', () => {
    it('should return only pending invitations', async () => {
      const mockInvitations = [
        {
          id: 'inv-1',
          email: 'pending@test.com',
          permissions: { canBook: true },
          status: 'pending',
          expires_at: '2024-02-15T00:00:00Z',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 'inv-2',
          email: 'accepted@test.com',
          permissions: { canBook: true },
          status: 'accepted',
          expires_at: '2024-02-15T00:00:00Z',
          created_at: '2024-01-10T10:00:00Z'
        }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockInvitations,
        error: null
      } as never)

      const { fetchInvitations, pendingInvitations } = useFamilySharing()

      await fetchInvitations()

      expect(pendingInvitations.value).toHaveLength(1)
      expect(pendingInvitations.value[0].email).toBe('pending@test.com')
    })
  })

  describe('inviteMember', () => {
    it('should invite member via RPC', async () => {
      const mockInvitation = {
        id: 'inv-new',
        email: 'newmember@example.com',
        status: 'pending',
        expires_at: '2024-02-15T00:00:00Z',
        created_at: '2024-01-15T10:00:00Z'
      }

      // Mock invite RPC call
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockInvitation,
        error: null
      } as never)

      // Mock refresh invitations
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [mockInvitation],
        error: null
      } as never)

      const { inviteMember, error, invitations } = useFamilySharing()

      const result = await inviteMember('newmember@example.com', {
        canBook: true,
        canViewHistory: true,
        canManageVehicles: false,
        canManagePayments: false
      })

      expect(result.success).toBe(true)
      expect(result.invitation).toEqual(mockInvitation)
      expect(error.value).toBe(null)
      expect(supabase.rpc).toHaveBeenCalledWith('account_invite_family_member', {
        p_email: 'newmember@example.com',
        p_can_book: true,
        p_can_view_history: true,
        p_can_manage_vehicles: false,
        p_can_manage_payments: false
      })
    })

    it('should handle invite error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Email already invited' }
      } as never)

      const { inviteMember, error } = useFamilySharing()

      const result = await inviteMember('existing@example.com', {
        canBook: true,
        canViewHistory: false,
        canManageVehicles: false,
        canManagePayments: false
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to invite member')
      expect(error.value).toBe('Failed to invite member')
    })

    it('should set loading state during invite', async () => {
      vi.mocked(supabase.rpc).mockImplementationOnce(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({ data: { id: 'inv-1' }, error: null } as never), 100)
        )
      )
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [],
        error: null
      } as never)

      const { inviteMember, loading } = useFamilySharing()

      const promise = inviteMember('test@example.com', {
        canBook: true,
        canViewHistory: false,
        canManageVehicles: false,
        canManagePayments: false
      })
      expect(loading.value).toBe(true)

      await promise
      expect(loading.value).toBe(false)
    })
  })

  describe('removeMember', () => {
    it('should remove member via RPC', async () => {
      // First load members
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [{
          id: 'fm-1',
          member_id: 'p-1',
          member_name: 'Test',
          member_email: 'test@test.com',
          relationship: null,
          can_book: true,
          can_view_history: false,
          can_manage_vehicles: false,
          can_manage_payments: false,
          accepted_at: '2024-01-01T10:00:00Z',
          created_at: '2024-01-01T09:00:00Z'
        }],
        error: null
      } as never)

      const { fetchMembers, removeMember, members, error } = useFamilySharing()

      await fetchMembers()
      expect(members.value).toHaveLength(1)

      // Now remove the member
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { success: true },
        error: null
      } as never)

      const result = await removeMember('fm-1')

      expect(result.success).toBe(true)
      expect(error.value).toBe(null)
      expect(members.value).toHaveLength(0)
      expect(supabase.rpc).toHaveBeenCalledWith('account_remove_family_member', {
        p_member_id: 'fm-1'
      })
    })

    it('should handle remove error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Cannot remove member' }
      } as never)

      const { removeMember, error } = useFamilySharing()

      const result = await removeMember('fm-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to remove member')
      expect(error.value).toBe('Failed to remove member')
    })
  })

  describe('updatePermissions', () => {
    it('should update permissions via RPC', async () => {
      // Mock update RPC call
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { success: true },
        error: null
      } as never)

      // Mock refresh members
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [{
          id: 'fm-1',
          member_id: 'p-1',
          member_name: 'Test',
          member_email: 'test@test.com',
          relationship: null,
          can_book: true,
          can_view_history: true,
          can_manage_vehicles: true,
          can_manage_payments: false,
          accepted_at: '2024-01-01T10:00:00Z',
          created_at: '2024-01-01T09:00:00Z'
        }],
        error: null
      } as never)

      const { updatePermissions, members, error } = useFamilySharing()

      const result = await updatePermissions('fm-1', {
        canBook: true,
        canViewHistory: true,
        canManageVehicles: true,
        canManagePayments: false
      })

      expect(result.success).toBe(true)
      expect(error.value).toBe(null)
      expect(supabase.rpc).toHaveBeenCalledWith('account_update_family_permissions', {
        p_member_id: 'fm-1',
        p_can_book: true,
        p_can_view_history: true,
        p_can_manage_vehicles: true,
        p_can_manage_payments: false
      })
      // Verify members were refreshed
      expect(members.value[0].permissions.canManageVehicles).toBe(true)
    })

    it('should handle partial permissions update', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { success: true },
        error: null
      } as never)
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [],
        error: null
      } as never)

      const { updatePermissions } = useFamilySharing()

      await updatePermissions('fm-1', {
        canBook: false
      })

      expect(supabase.rpc).toHaveBeenCalledWith('account_update_family_permissions', {
        p_member_id: 'fm-1',
        p_can_book: false,
        p_can_view_history: undefined,
        p_can_manage_vehicles: undefined,
        p_can_manage_payments: undefined
      })
    })

    it('should handle update error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Failed to update permissions' }
      } as never)

      const { updatePermissions, error } = useFamilySharing()

      const result = await updatePermissions('fm-1', { canBook: false })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to update permissions')
      expect(error.value).toBe('Failed to update permissions')
    })
  })

  describe('cancelInvitation', () => {
    it('should cancel invitation via RPC', async () => {
      // First load invitations
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [{
          id: 'inv-1',
          email: 'test@test.com',
          permissions: { canBook: true },
          status: 'pending',
          expires_at: '2024-02-15T00:00:00Z',
          created_at: '2024-01-15T10:00:00Z'
        }],
        error: null
      } as never)

      const { fetchInvitations, cancelInvitation, invitations, error } = useFamilySharing()

      await fetchInvitations()
      expect(invitations.value).toHaveLength(1)

      // Now cancel the invitation
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { success: true },
        error: null
      } as never)

      const result = await cancelInvitation('inv-1')

      expect(result.success).toBe(true)
      expect(error.value).toBe(null)
      expect(invitations.value).toHaveLength(0)
      expect(supabase.rpc).toHaveBeenCalledWith('account_cancel_family_invitation', {
        p_invitation_id: 'inv-1'
      })
    })

    it('should handle cancel error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Invitation already cancelled' }
      } as never)

      const { cancelInvitation, error } = useFamilySharing()

      const result = await cancelInvitation('inv-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to cancel invitation')
      expect(error.value).toBe('Failed to cancel invitation')
    })
  })
})
