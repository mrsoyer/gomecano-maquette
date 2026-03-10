import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'

interface FamilyPermissions {
  canBook: boolean
  canViewHistory: boolean
  canManageVehicles: boolean
  canManagePayments: boolean
}

interface FamilyMember {
  id: string
  profileId: string
  name: string
  email: string
  relationship: string | null
  permissions: FamilyPermissions
  status: 'active' | 'pending'
  addedAt: string | null
}

interface FamilyInvitation {
  id: string
  email: string
  permissions: FamilyPermissions
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  expiresAt: string
  createdAt: string | null
}

/**
 * Composable for family sharing management
 * Uses Supabase RPC functions with built-in RLS
 */
export function useFamilySharing() {
  const members = ref<FamilyMember[]>([])
  const invitations = ref<FamilyInvitation[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const activeMembers = computed(() =>
    members.value.filter(m => m.status === 'active')
  )

  const pendingInvitations = computed(() =>
    invitations.value.filter(i => i.status === 'pending')
  )

  /**
   * Fetch family members via RPC
   */
  async function fetchMembers(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('account_get_family_members')

      if (fetchError) throw fetchError

      members.value = (data || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        profileId: row.member_id as string,
        name: row.member_name as string || '',
        email: row.member_email as string || '',
        relationship: row.relationship as string | null,
        permissions: {
          canBook: row.can_book as boolean ?? false,
          canViewHistory: row.can_view_history as boolean ?? false,
          canManageVehicles: row.can_manage_vehicles as boolean ?? false,
          canManagePayments: row.can_manage_payments as boolean ?? false
        },
        status: row.accepted_at ? 'active' as const : 'pending' as const,
        addedAt: row.created_at as string | null
      }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch members'
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch pending invitations via RPC
   */
  async function fetchInvitations(): Promise<void> {
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('account_get_family_invitations')

      if (fetchError) throw fetchError

      invitations.value = (data || []).map((row: Record<string, unknown>) => {
        const perms = row.permissions as Record<string, boolean> | null
        return {
          id: row.id as string,
          email: row.email as string,
          permissions: {
            canBook: perms?.canBook ?? false,
            canViewHistory: perms?.canViewHistory ?? false,
            canManageVehicles: perms?.canManageVehicles ?? false,
            canManagePayments: perms?.canManagePayments ?? false
          },
          status: row.status as 'pending' | 'accepted' | 'expired' | 'cancelled',
          expiresAt: row.expires_at as string,
          createdAt: row.created_at as string | null
        }
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch invitations'
    }
  }

  /**
   * Invite a family member via RPC
   */
  async function inviteMember(
    email: string,
    permissions: FamilyPermissions
  ): Promise<{ success: boolean; invitation?: unknown; error?: string }> {
    loading.value = true
    error.value = null

    try {
      const { data, error: inviteError } = await supabase
        .rpc('account_invite_family_member', {
          p_email: email,
          p_can_book: permissions.canBook,
          p_can_view_history: permissions.canViewHistory,
          p_can_manage_vehicles: permissions.canManageVehicles,
          p_can_manage_payments: permissions.canManagePayments
        })

      if (inviteError) throw inviteError

      // Refresh invitations
      await fetchInvitations()

      return { success: true, invitation: data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to invite member'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Remove a family member via RPC
   */
  async function removeMember(
    memberId: string
  ): Promise<{ success: boolean; error?: string }> {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .rpc('account_remove_family_member', {
          p_member_id: memberId
        })

      if (deleteError) throw deleteError

      // Update local state
      members.value = members.value.filter(m => m.id !== memberId)

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to remove member'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Update member permissions via RPC
   */
  async function updatePermissions(
    memberId: string,
    permissions: Partial<FamilyPermissions>
  ): Promise<{ success: boolean; error?: string }> {
    loading.value = true
    error.value = null

    try {
      const { error: updateError } = await supabase
        .rpc('account_update_family_permissions', {
          p_member_id: memberId,
          p_can_book: permissions.canBook,
          p_can_view_history: permissions.canViewHistory,
          p_can_manage_vehicles: permissions.canManageVehicles,
          p_can_manage_payments: permissions.canManagePayments
        })

      if (updateError) throw updateError

      // Refresh members
      await fetchMembers()

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update permissions'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Cancel an invitation via RPC
   */
  async function cancelInvitation(
    invitationId: string
  ): Promise<{ success: boolean; error?: string }> {
    error.value = null

    try {
      const { error: updateError } = await supabase
        .rpc('account_cancel_family_invitation', {
          p_invitation_id: invitationId
        })

      if (updateError) throw updateError

      // Update local state
      invitations.value = invitations.value.filter(i => i.id !== invitationId)

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to cancel invitation'
      return { success: false, error: error.value }
    }
  }

  return {
    // State
    members,
    invitations,
    loading,
    error,

    // Computed
    activeMembers,
    pendingInvitations,

    // Methods
    fetchMembers,
    fetchInvitations,
    inviteMember,
    removeMember,
    updatePermissions,
    cancelInvitation
  }
}
