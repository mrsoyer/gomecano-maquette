<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores/user.store'
import { useEmergency } from '@/composables/useEmergency'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'

const userStore = useUserStore()
const { requests, activeSession, isLoading, createSOS, cancelSOS } = useEmergency('user-1')

const showSOSModal = ref(false)
const emergencyType = ref<'breakdown' | 'accident' | 'flat_tire'>('breakdown')
const description = ref('')

onMounted(async () => {
  if (!userStore.isAuthenticated) {
    await userStore.loginById('user-1')
  }
})

async function activateSOS(): Promise<void> {
  try {
    await createSOS({
      type: emergencyType.value,
      location: {
        lat: 48.8566,
        lng: 2.3522,
        address: '15 Rue de Rivoli, 75001 Paris'
      },
      vehicleId: 'vehicle-1',
      description: description.value
    })
    showSOSModal.value = false
  } catch (err) {
    window.alert('Erreur lors de l\'activation du SOS')
  }
}

function getStatusBadge(status: string) {
  const badges = {
    pending: { label: 'En attente', class: 'bg-yellow-100 text-yellow-800' },
    mechanic_assigned: { label: 'Mécanicien assigné', class: 'bg-blue-100 text-blue-800' },
    in_progress: { label: 'En cours', class: 'bg-orange-100 text-orange-800' },
    resolved: { label: 'Résolu', class: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Annulé', class: 'bg-gray-100 text-gray-800' }
  }
  return badges[status] || badges.pending
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <Container class="py-4 md:py-8">
      <h1 class="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
        SOS Urgence
      </h1>
      <p class="text-gray-600 mb-4 md:mb-8">
        Assistance d'urgence 24/7
      </p>

      <!-- SOS Button -->
      <div class="bg-white rounded-lg border border-gray-200 p-4 md:p-8 mb-4 md:mb-8 text-center">
        <Icon icon="mdi:alert-octagon" class="w-12 h-12 md:w-20 md:h-20 text-red-500 mx-auto mb-4" />
        <h2 class="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
          Besoin d'aide immédiate ?
        </h2>
        <p class="text-gray-600 mb-3 md:mb-6">
          Un mécanicien peut intervenir en moins de 30 minutes
        </p>
        <button
          @click="showSOSModal = true"
          class="px-8 py-4 bg-red-500 text-white rounded-lg font-bold text-lg hover:bg-red-600 transition-colors"
        >
          <Icon icon="mdi:phone-alert" class="w-6 h-6 inline-block mr-2" />
          Activer le SOS
        </button>
      </div>

      <!-- Active Session -->
      <div
        v-if="activeSession"
        class="bg-orange-50 border-2 border-orange-500 rounded-lg p-4 md:p-6 mb-4 md:mb-8"
      >
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">
              SOS en cours
            </h3>
            <p class="text-gray-700">
              Un mécanicien arrive dans <strong>{{ activeSession.eta }} minutes</strong>
            </p>
          </div>
          <button
            @click="cancelSOS"
            class="text-sm text-gray-600 hover:text-gray-900"
          >
            Annuler
          </button>
        </div>

        <div class="grid md:grid-cols-2 gap-4 mb-4">
          <div class="bg-white rounded-lg p-4">
            <div class="text-sm text-gray-600 mb-1">Distance</div>
            <div class="text-lg font-semibold text-gray-900">
              {{ activeSession.distance }} km
            </div>
          </div>
          <div class="bg-white rounded-lg p-4">
            <div class="text-sm text-gray-600 mb-1">Contact</div>
            <div class="text-lg font-semibold text-gray-900">
              {{ activeSession.mechanicPhone }}
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <div
            v-for="(update, index) in activeSession.updates"
            :key="index"
            class="flex items-start gap-3 text-sm"
          >
            <Icon
              :icon="update.type === 'success' ? 'mdi:check-circle' : 'mdi:information'"
              :class="[
                'w-5 h-5 flex-shrink-0 mt-0.5',
                update.type === 'success' ? 'text-green-500' : 'text-blue-500'
              ]"
            />
            <span class="text-gray-700">{{ update.message }}</span>
          </div>
        </div>
      </div>

      <!-- History -->
      <h2 class="text-xl font-bold text-gray-900 mb-4">
        Historique
      </h2>

      <div v-if="requests.length === 0" class="text-center py-12">
        <Icon icon="mdi:history" class="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-600">Aucune demande d'urgence</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="request in requests"
          :key="request.id"
          class="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <div class="font-semibold text-gray-900 mb-1">
                {{ request.type === 'breakdown' ? 'Panne' : request.type === 'accident' ? 'Accident' : 'Crevaison' }}
              </div>
              <div class="text-sm text-gray-600">
                {{ request.location.address }}
              </div>
            </div>
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-medium',
                getStatusBadge(request.status).class
              ]"
            >
              {{ getStatusBadge(request.status).label }}
            </span>
          </div>
          <div class="text-sm text-gray-600">
            {{ new Date(request.createdAt).toLocaleString('fr-FR') }}
          </div>
        </div>
      </div>

      <!-- SOS Modal -->
      <div
        v-if="showSOSModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="showSOSModal = false"
      >
        <div class="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 class="text-xl font-bold text-gray-900 mb-4">
            Activer le SOS
          </h3>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Type d'urgence
            </label>
            <select
              v-model="emergencyType"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-primary"
            >
              <option value="breakdown">Panne</option>
              <option value="accident">Accident</option>
              <option value="flat_tire">Crevaison</option>
            </select>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              v-model="description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-primary"
              placeholder="Décrivez brièvement le problème..."
            />
          </div>

          <div class="flex gap-3">
            <button
              @click="showSOSModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              @click="activateSOS"
              :disabled="isLoading"
              class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              {{ isLoading ? 'Activation...' : 'Activer SOS' }}
            </button>
          </div>
        </div>
      </div>
    </Container>

    <Footer />
  </div>
</template>

