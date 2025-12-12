<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores/user.store'
import type { AddressBookEntry } from '@/types/profile'
import { addressSchema } from '@/utils/validation'

const userStore = useUserStore()

const isAddModalOpen = ref(false)
const editingAddress = ref<AddressBookEntry | null>(null)

// Form fields
const label = ref('')
const street = ref('')
const complement = ref('')
const city = ref('')
const postalCode = ref('')
const isDefault = ref(false)

const formError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})

onMounted(() => {
  if (userStore.user && userStore.addresses.length === 0) {
    userStore.fetchUserData()
  }
})

/**
 * Open add modal
 */
function openAddModal(): void {
  resetForm()
  editingAddress.value = null
  isAddModalOpen.value = true
}

/**
 * Open edit modal
 */
function openEditModal(address: AddressBookEntry): void {
  editingAddress.value = address
  label.value = address.label
  street.value = address.street
  complement.value = address.complement || ''
  city.value = address.city
  postalCode.value = address.postalCode
  isDefault.value = address.isDefault
  isAddModalOpen.value = true
}

/**
 * Reset form
 */
function resetForm(): void {
  label.value = ''
  street.value = ''
  complement.value = ''
  city.value = ''
  postalCode.value = ''
  isDefault.value = false
  formError.value = null
  fieldErrors.value = {}
}

/**
 * Close modal
 */
function closeModal(): void {
  isAddModalOpen.value = false
  resetForm()
  editingAddress.value = null
}

/**
 * Save address
 */
async function saveAddress(): Promise<void> {
  formError.value = null
  fieldErrors.value = {}

  try {
    const validated = addressSchema.parse({
      label: label.value,
      street: street.value,
      complement: complement.value,
      city: city.value,
      postalCode: postalCode.value,
      isDefault: isDefault.value
    })

    if (editingAddress.value) {
      await userStore.updateExistingAddress(editingAddress.value.id, validated)
    } else {
      await userStore.addNewAddress({
        ...validated,
        country: 'France'
      })
    }

    closeModal()
  } catch (err: any) {
    if (err.errors) {
      err.errors.forEach((e: any) => {
        fieldErrors.value[e.path[0]] = e.message
      })
    } else if (err instanceof Error) {
      formError.value = err.message
    }
  }
}

/**
 * Delete address
 */
async function deleteAddressHandler(id: string): Promise<void> {
  if (confirm('Supprimer cette adresse ?')) {
    await userStore.deleteExistingAddress(id)
  }
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
        <Icon icon="mdi:map-marker" class="w-5 h-5 md:w-6 md:h-6 text-blue-primary" />
        Carnet d'adresses
      </h3>
      <button @click="openAddModal" class="text-sm text-blue-primary hover:underline font-semibold flex items-center gap-1">
        <Icon icon="mdi:plus" class="w-4 h-4" />
        Ajouter
      </button>
    </div>

    <!-- Addresses List -->
    <div class="space-y-3">
      <div
        v-for="address in userStore.addresses"
        :key="address.id"
        class="p-3 border rounded-lg hover:bg-gray-50 transition-all"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <p class="text-sm font-semibold text-gray-900">{{ address.label }}</p>
              <span v-if="address.isDefault" class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                Par défaut
              </span>
            </div>
            <p class="text-xs text-gray-600">{{ address.street }}</p>
            <p v-if="address.complement" class="text-xs text-gray-500">{{ address.complement }}</p>
            <p class="text-xs text-gray-600">{{ address.postalCode }} {{ address.city }}</p>
          </div>
          <div class="flex gap-2">
            <button
              @click="openEditModal(address)"
              class="text-gray-600 hover:text-blue-primary transition-colors"
            >
              <Icon icon="mdi:pencil" class="w-5 h-5" />
            </button>
            <button
              v-if="!address.isDefault"
              @click="deleteAddressHandler(address.id)"
              class="text-gray-600 hover:text-red-600 transition-colors"
            >
              <Icon icon="mdi:delete" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="userStore.addresses.length === 0" class="text-center py-8">
        <Icon icon="mdi:map-marker-off" class="w-12 h-12 mx-auto text-gray-300 mb-2" />
        <p class="text-sm text-gray-500">Aucune adresse enregistrée</p>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="isAddModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="closeModal">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
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
            <p v-if="fieldErrors.street" class="mt-1 text-xs text-red-600">{{ fieldErrors.street }}</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Complément (optionnel)</label>
            <input v-model="complement" type="text" placeholder="Bât. A, Appt 12..." class="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Code postal</label>
              <input v-model="postalCode" type="text" placeholder="75001" :class="['w-full px-3 py-2 border rounded-lg text-sm', fieldErrors.postalCode && 'border-red-500']" required />
              <p v-if="fieldErrors.postalCode" class="mt-1 text-xs text-red-600">{{ fieldErrors.postalCode }}</p>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Ville</label>
              <input v-model="city" type="text" placeholder="Paris" :class="['w-full px-3 py-2 border rounded-lg text-sm', fieldErrors.city && 'border-red-500']" required />
              <p v-if="fieldErrors.city" class="mt-1 text-xs text-red-600">{{ fieldErrors.city }}</p>
            </div>
          </div>

          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="isDefault" type="checkbox" class="w-4 h-4 text-blue-primary border-gray-300 rounded" />
            <span class="text-sm text-gray-700">Définir comme adresse par défaut</span>
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
  </div>
</template>

