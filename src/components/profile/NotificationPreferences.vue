<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores/user.store'
import type { NotificationPreferences as NotificationPrefs } from '@/types/profile'

const userStore = useUserStore()

const preferences = ref<NotificationPrefs | null>(null)
const success = ref(false)

onMounted(() => {
  if (userStore.notificationPreferences) {
    preferences.value = { ...userStore.notificationPreferences }
  } else if (userStore.user) {
    // Default preferences
    preferences.value = {
      userId: userStore.user.id,
      channels: { email: true, sms: true, push: true },
      types: {
        interventionReminders: true,
        interventionUpdates: true,
        maintenanceAlerts: true,
        promotionalOffers: false,
        loyaltyRewards: true,
        newsletter: false
      },
      updatedAt: new Date().toISOString()
    }
  }
})

/**
 * Save preferences
 */
async function savePreferences(): Promise<void> {
  if (!preferences.value) return

  try {
    await userStore.updateNotificationPreferences(preferences.value)
    success.value = true
    setTimeout(() => {
      success.value = false
    }, 3000)
  } catch (err) {
    console.error('[NotificationPreferences] Error:', err)
  }
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
    <h3 class="text-base md:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
      <Icon icon="mdi:bell-cog" class="w-5 h-5 md:w-6 md:h-6 text-blue-primary" />
      Préférences de notifications
    </h3>

    <div v-if="success" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
      <div class="flex items-center gap-2">
        <Icon icon="mdi:check-circle" class="w-5 h-5 text-green-600" />
        <p class="text-sm text-green-800 font-semibold">Préférences enregistrées</p>
      </div>
    </div>

    <div v-if="preferences" class="space-y-6">
      <!-- Channels -->
      <div>
        <h4 class="text-sm font-bold text-gray-900 mb-3">Canaux de communication</h4>
        <div class="space-y-2">
          <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all">
            <input v-model="preferences.channels.email" type="checkbox" class="w-5 h-5 text-blue-primary border-gray-300 rounded" />
            <Icon icon="mdi:email" class="w-5 h-5 text-gray-600" />
            <span class="text-sm font-semibold text-gray-900">Email</span>
          </label>
          <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all">
            <input v-model="preferences.channels.sms" type="checkbox" class="w-5 h-5 text-blue-primary border-gray-300 rounded" />
            <Icon icon="mdi:message-text" class="w-5 h-5 text-gray-600" />
            <span class="text-sm font-semibold text-gray-900">SMS</span>
          </label>
          <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all">
            <input v-model="preferences.channels.push" type="checkbox" class="w-5 h-5 text-blue-primary border-gray-300 rounded" />
            <Icon icon="mdi:cellphone" class="w-5 h-5 text-gray-600" />
            <span class="text-sm font-semibold text-gray-900">Notifications push</span>
          </label>
        </div>
      </div>

      <!-- Types -->
      <div>
        <h4 class="text-sm font-bold text-gray-900 mb-3">Types de notifications</h4>
        <div class="space-y-2">
          <label class="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all">
            <span class="text-sm text-gray-900">Rappels de rendez-vous</span>
            <input v-model="preferences.types.interventionReminders" type="checkbox" class="w-5 h-5 text-blue-primary border-gray-300 rounded" />
          </label>
          <label class="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all">
            <span class="text-sm text-gray-900">Mises à jour interventions</span>
            <input v-model="preferences.types.interventionUpdates" type="checkbox" class="w-5 h-5 text-blue-primary border-gray-300 rounded" />
          </label>
          <label class="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all">
            <span class="text-sm text-gray-900">Alertes maintenance</span>
            <input v-model="preferences.types.maintenanceAlerts" type="checkbox" class="w-5 h-5 text-blue-primary border-gray-300 rounded" />
          </label>
          <label class="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all">
            <span class="text-sm text-gray-900">Offres promotionnelles</span>
            <input v-model="preferences.types.promotionalOffers" type="checkbox" class="w-5 h-5 text-blue-primary border-gray-300 rounded" />
          </label>
          <label class="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all">
            <span class="text-sm text-gray-900">Récompenses fidélité</span>
            <input v-model="preferences.types.loyaltyRewards" type="checkbox" class="w-5 h-5 text-blue-primary border-gray-300 rounded" />
          </label>
          <label class="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all">
            <span class="text-sm text-gray-900">Newsletter</span>
            <input v-model="preferences.types.newsletter" type="checkbox" class="w-5 h-5 text-blue-primary border-gray-300 rounded" />
          </label>
        </div>
      </div>

      <button
        @click="savePreferences"
        :disabled="userStore.isLoading"
        class="w-full py-2.5 px-4 bg-blue-primary hover:bg-blue-light text-white font-semibold rounded-lg disabled:opacity-50 text-sm"
      >
        {{ userStore.isLoading ? 'Enregistrement...' : 'Enregistrer les préférences' }}
      </button>
    </div>
  </div>

  <!-- Add/Edit Address Modal -->
  <div v-if="isAddModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="closeModal">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
      <h4 class="text-lg font-bold mb-4">{{ editingAddress ? 'Modifier' : 'Ajouter' }} une adresse</h4>

      <div v-if="formError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-700">{{ formError }}</p>
      </div>

      <form @submit.prevent="saveAddress" class="space-y-3">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Label</label>
          <input v-model="label" type="text" placeholder="Domicile, Travail..." :class="['w-full px-3 py-2 border rounded-lg text-sm', fieldErrors.label && 'border-red-500']" required />
          <p v-if="fieldErrors.label" class="mt-1 text-xs text-red-600">{{ fieldErrors.label }}</p>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Adresse</label>
          <input v-model="street" type="text" placeholder="15 rue de la République" :class="['w-full px-3 py-2 border rounded-lg text-sm', fieldErrors.street && 'border-red-500']" required />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Complément</label>
          <input v-model="complement" type="text" placeholder="Bât. A, Appt 12..." class="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Code postal</label>
            <input v-model="postalCode" type="text" placeholder="75001" :class="['w-full px-3 py-2 border rounded-lg text-sm', fieldErrors.postalCode && 'border-red-500']" required />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Ville</label>
            <input v-model="city" type="text" placeholder="Paris" :class="['w-full px-3 py-2 border rounded-lg text-sm', fieldErrors.city && 'border-red-500']" required />
          </div>
        </div>

        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="isDefault" type="checkbox" class="w-4 h-4 text-blue-primary border-gray-300 rounded" />
          <span class="text-sm text-gray-700">Adresse par défaut</span>
        </label>

        <div class="flex gap-3 pt-2">
          <button type="button" @click="closeModal" class="flex-1 py-2 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 text-sm">Annuler</button>
          <button type="submit" :disabled="userStore.isLoading" class="flex-1 py-2 px-4 bg-blue-primary hover:bg-blue-light text-white font-semibold rounded-lg disabled:opacity-50 text-sm">
            {{ userStore.isLoading ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

