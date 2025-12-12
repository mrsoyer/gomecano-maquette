/**
 * Family Sharing Composable
 */

import { ref } from 'vue'
import type { FamilyMember, Invitation } from '@/types/sharing'
import { mockFamilyMembers, mockInvitations, getFamilyMembers, inviteMember, removeMember } from '@/mocks/sharing.mock'

export function useFamilySharing(userId: string) {
  const members = ref<FamilyMember[]>([...mockFamilyMembers])
  const invitations = ref<Invitation[]>([...mockInvitations])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMembers(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      members.value = await getFamilyMembers(userId)
    } catch (err) {
      error.value = 'Erreur lors du chargement'
    } finally {
      isLoading.value = false
    }
  }

  async function invite(data: Partial<Invitation>): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const newInv = await inviteMember(data)
      invitations.value.push(newInv)
    } catch (err) {
      error.value = 'Erreur lors de l\'invitation'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function remove(memberId: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      await removeMember(memberId)
      members.value = members.value.filter(m => m.id !== memberId)
    } catch (err) {
      error.value = 'Erreur lors de la suppression'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    members,
    invitations,
    isLoading,
    error,
    fetchMembers,
    invite,
    remove
  }
}

