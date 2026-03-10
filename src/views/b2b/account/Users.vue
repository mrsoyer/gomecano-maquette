<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores/user.store'
import { useFleetStore } from '@/stores/fleet.store'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import DataTable from '@/components/ui/DataTable.vue'

const router = useRouter()
const userStore = useUserStore()
const fleetStore = useFleetStore()

const isInviteModalOpen = ref(false)

onMounted(async () => {
  if (!userStore.isAuthenticated) {
    await userStore.loginById('user-b2b-1')
  }
  if (userStore.companyId) {
    await fleetStore.fetchCompanyData(userStore.companyId)
  }
})

// DataTable columns
const columns = [
  { key: 'email', label: 'Email', sortable: true },
  { key: 'firstName', label: 'Prénom', sortable: true },
  { key: 'lastName', label: 'Nom', sortable: true },
  { key: 'role', label: 'Rôle', sortable: true },
  { key: 'status', label: 'Statut', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false, width: '120px' }
]

/**
 * Get role badge
 */
function getRoleBadge(role: string) {
  const badges = {
    owner: { label: 'Propriétaire', color: 'bg-purple-100 text-purple-700' },
    admin: { label: 'Admin', color: 'bg-blue-100 text-blue-700' },
    fleet_manager: { label: 'Gestionnaire', color: 'bg-green-100 text-green-700' },
    accountant: { label: 'Comptable', color: 'bg-gray-100 text-gray-700' },
    driver: { label: 'Conducteur', color: 'bg-orange-100 text-orange-700' }
  }
  return badges[role] || { label: role, color: 'bg-gray-100 text-gray-700' }
}

/**
 * Get status badge
 */
function getStatusBadge(status: string) {
  const badges = {
    active: { label: 'Actif', color: 'bg-green-100 text-green-700' },
    pending: { label: 'En attente', color: 'bg-orange-100 text-orange-700' },
    suspended: { label: 'Suspendu', color: 'bg-red-100 text-red-700' }
  }
  return badges[status] || { label: status, color: 'bg-gray-100 text-gray-700' }
}

/**
 * Open invite modal
 */
function openInviteModal(): void {
  isInviteModalOpen.value = true
}

/**
 * Edit user (mock)
 */
function editUser(user: any): void {
  alert(`Modifier ${user.firstName} ${user.lastName}\n\nFonctionnalité en développement`)
}

/**
 * Suspend user (mock)
 */
function suspendUser(user: any): void {
  if (confirm(`Suspendre ${user.firstName} ${user.lastName} ?`)) {
    alert('Utilisateur suspendu (mock)')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <Container class="py-4 md:py-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            Utilisateurs & Permissions
          </h1>
          <p class="text-sm md:text-base text-gray-600">
            Gérez les accès à votre espace entreprise
          </p>
        </div>
        <button @click="openInviteModal" class="btn-primary flex items-center gap-2">
          <Icon icon="mdi:account-plus" class="w-5 h-5" />
          <span class="hidden md:inline">Inviter un utilisateur</span>
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm text-center">
          <p class="text-2xl md:text-3xl font-bold text-green-primary mb-1">{{ fleetStore.activeUsers }}</p>
          <p class="text-xs md:text-sm text-gray-600">Utilisateurs actifs</p>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm text-center">
          <p class="text-2xl md:text-3xl font-bold text-blue-primary mb-1">
            {{ fleetStore.companyUsers.filter(u => u.role === 'fleet_manager').length }}
          </p>
          <p class="text-xs md:text-sm text-gray-600">Gestionnaires</p>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm text-center">
          <p class="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            {{ fleetStore.companyUsers.filter(u => u.status === 'pending').length }}
          </p>
          <p class="text-xs md:text-sm text-gray-600">Invitations en attente</p>
        </div>
      </div>

      <!-- Users Table -->
      <DataTable
        :columns="columns"
        :data="fleetStore.companyUsers"
        :sortable="true"
        :filterable="true"
      >
        <template #role="{ value }">
          <span :class="['px-2 py-1 rounded-full text-xs font-semibold', getRoleBadge(value).color]">
            {{ getRoleBadge(value).label }}
          </span>
        </template>

        <template #status="{ value }">
          <span :class="['px-2 py-1 rounded-full text-xs font-semibold', getStatusBadge(value).color]">
            {{ getStatusBadge(value).label }}
          </span>
        </template>

        <template #actions="{ row }">
          <div class="flex items-center gap-2">
            <button
              @click="editUser(row)"
              class="p-1.5 hover:bg-blue-50 rounded-lg transition-all"
              title="Modifier"
            >
              <Icon icon="mdi:pencil" class="w-4 h-4 text-blue-600" />
            </button>
            <button
              v-if="row.role !== 'owner'"
              @click="suspendUser(row)"
              class="p-1.5 hover:bg-red-50 rounded-lg transition-all"
              title="Suspendre"
            >
              <Icon icon="mdi:account-off" class="w-4 h-4 text-red-600" />
            </button>
          </div>
        </template>
      </DataTable>

      <!-- Invite Modal (simple version) -->
      <Teleport to="body">
        <div
          v-if="isInviteModalOpen"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          @click="isInviteModalOpen = false"
        >
          <div
            @click.stop
            class="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h2 class="text-xl font-bold text-gray-900 mb-4">Inviter un utilisateur</h2>
            <p class="text-sm text-gray-600 mb-6">Fonctionnalité en développement</p>
            <button @click="isInviteModalOpen = false" class="w-full btn-primary">
              Fermer
            </button>
          </div>
        </div>
      </Teleport>
    </Container>

    <Footer />
  </div>
</template>
