<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores/user.store'
import { useFamilySharing } from '@/composables/useFamilySharing'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import type { Invitation, RelationshipType, MemberPermissions } from '@/types/sharing'

const userStore = useUserStore()
const { members, invitations, isLoading, fetchMembers, invite, remove } = useFamilySharing('user-1')

const showInviteModal = ref(false)
const newInvite = ref<Partial<Invitation>>({
  email: '',
  relationship: 'spouse',
  permissions: {
    viewInterventions: true,
    bookInterventions: false,
    managePayments: false,
    viewDocuments: true,
    editVehicles: false
  }
})

onMounted(async () => {
  if (!userStore.isAuthenticated) {
    await userStore.loginById('user-1')
  }
  await fetchMembers()
})

async function sendInvite(): Promise<void> {
  if (!newInvite.value.email) return
  
  try {
    await invite(newInvite.value)
    showInviteModal.value = false
    newInvite.value.email = ''
    window.alert('✓ Invitation envoyée !')
  } catch (err) {
    window.alert('❌ Erreur lors de l\'envoi')
  }
}

async function removeMember(memberId: string): Promise<void> {
  if (!confirm('Supprimer ce membre ?')) return
  
  try {
    await remove(memberId)
    window.alert('✓ Membre supprimé')
  } catch (err) {
    window.alert('❌ Erreur')
  }
}

function getRelationshipLabel(rel: string): string {
  const labels = {
    spouse: 'Conjoint(e)',
    child: 'Enfant',
    parent: 'Parent',
    sibling: 'Frère/Sœur',
    other: 'Autre'
  }
  return labels[rel] || rel
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <Container class="py-4 md:py-8">
      <div class="flex items-center justify-between mb-4 md:mb-8">
        <div>
          <h1 class="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Famille
          </h1>
          <p class="text-gray-600">
            Partagez l'accès à vos véhicules
          </p>
        </div>
        <button
          @click="showInviteModal = true"
          class="px-4 py-2 bg-blue-primary text-white rounded-lg hover:bg-blue-dark transition-colors flex items-center gap-2"
        >
          <Icon icon="mdi:account-plus" class="w-5 h-5" />
          Inviter un membre
        </button>
      </div>

      <!-- Members List -->
      <div class="mb-4 md:mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">
          Membres ({{ members.length }})
        </h2>

        <div v-if="members.length === 0" class="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Icon icon="mdi:account-group" class="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-600">Aucun membre</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="member in members"
            :key="member.id"
            class="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-start gap-3">
                <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Icon icon="mdi:account" class="w-6 h-6 text-blue-primary" />
                </div>
                <div>
                  <div class="font-semibold text-gray-900">
                    {{ member.name }}
                  </div>
                  <div class="text-sm text-gray-600">
                    {{ member.email }}
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ getRelationshipLabel(member.relationship) }} • Ajouté le {{ new Date(member.invitedAt).toLocaleDateString('fr-FR') }}
                  </div>
                </div>
              </div>
              <button
                @click="removeMember(member.id)"
                class="text-red-500 hover:text-red-700"
                title="Supprimer"
              >
                <Icon icon="mdi:delete" class="w-5 h-5" />
              </button>
            </div>

            <!-- Permissions -->
            <div class="flex flex-wrap gap-2">
              <span
                v-if="member.permissions.viewInterventions"
                class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
              >
                Voir interventions
              </span>
              <span
                v-if="member.permissions.bookInterventions"
                class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
              >
                Réserver
              </span>
              <span
                v-if="member.permissions.managePayments"
                class="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs"
              >
                Gérer paiements
              </span>
              <span
                v-if="member.permissions.viewDocuments"
                class="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
              >
                Voir documents
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pending Invitations -->
      <div v-if="invitations.length > 0">
        <h2 class="text-xl font-bold text-gray-900 mb-4">
          Invitations en attente ({{ invitations.length }})
        </h2>

        <div class="space-y-4">
          <div
            v-for="inv in invitations"
            :key="inv.id"
            class="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="font-semibold text-gray-900">
                  {{ inv.email }}
                </div>
                <div class="text-sm text-gray-600">
                  {{ getRelationshipLabel(inv.relationship) }} • Envoyé le {{ new Date(inv.sentAt).toLocaleDateString('fr-FR') }}
                </div>
              </div>
              <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                En attente
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Invite Modal -->
      <div
        v-if="showInviteModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="showInviteModal = false"
      >
        <div class="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 class="text-xl font-bold text-gray-900 mb-4">
            Inviter un membre
          </h3>

          <div class="space-y-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                v-model="newInvite.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-primary"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Relation
              </label>
              <select
                v-model="newInvite.relationship"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-primary"
              >
                <option value="spouse">Conjoint(e)</option>
                <option value="child">Enfant</option>
                <option value="parent">Parent</option>
                <option value="sibling">Frère/Sœur</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Permissions
              </label>
              <div class="space-y-2">
                <label class="flex items-center gap-2 text-sm">
                  <input
                    v-model="newInvite.permissions!.viewInterventions"
                    type="checkbox"
                    class="rounded"
                  />
                  Voir les interventions
                </label>
                <label class="flex items-center gap-2 text-sm">
                  <input
                    v-model="newInvite.permissions!.bookInterventions"
                    type="checkbox"
                    class="rounded"
                  />
                  Réserver des interventions
                </label>
                <label class="flex items-center gap-2 text-sm">
                  <input
                    v-model="newInvite.permissions!.viewDocuments"
                    type="checkbox"
                    class="rounded"
                  />
                  Voir les documents
                </label>
              </div>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="showInviteModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              @click="sendInvite"
              :disabled="isLoading || !newInvite.email"
              class="flex-1 px-4 py-2 bg-blue-primary text-white rounded-lg hover:bg-blue-dark disabled:opacity-50"
            >
              {{ isLoading ? 'Envoi...' : 'Envoyer' }}
            </button>
          </div>
        </div>
      </div>
    </Container>

    <Footer />
  </div>
</template>

