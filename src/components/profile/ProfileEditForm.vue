<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores/user.store'
import { profileUpdateSchema } from '@/utils/validation'

const userStore = useUserStore()

const firstName = ref('')
const lastName = ref('')
const phone = ref('')
const isEditing = ref(false)
const formError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})
const success = ref(false)

// Initialize with current user data
onMounted(() => {
  if (userStore.user) {
    firstName.value = userStore.user.profile.firstName
    lastName.value = userStore.user.profile.lastName
    phone.value = userStore.user.profile.phone
  }
})

/**
 * Toggle edit mode
 */
function toggleEdit(): void {
  isEditing.value = !isEditing.value
  if (!isEditing.value) {
    // Reset to current values
    if (userStore.user) {
      firstName.value = userStore.user.profile.firstName
      lastName.value = userStore.user.profile.lastName
      phone.value = userStore.user.profile.phone
    }
  }
  formError.value = null
  fieldErrors.value = {}
  success.value = false
}

/**
 * Save profile
 */
async function saveProfile(): Promise<void> {
  formError.value = null
  fieldErrors.value = {}
  success.value = false

  try {
    // Validate
    const validated = profileUpdateSchema.parse({
      firstName: firstName.value,
      lastName: lastName.value,
      phone: phone.value
    })

    // Update profile
    await userStore.updateProfile(validated)

    // Show success
    success.value = true
    isEditing.value = false

    // Hide success message after 3s
    setTimeout(() => {
      success.value = false
    }, 3000)
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
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
        <Icon icon="mdi:account-edit" class="w-5 h-5 md:w-6 md:h-6 text-blue-primary" />
        Informations personnelles
      </h3>
      <button
        v-if="!isEditing"
        @click="toggleEdit"
        class="text-sm text-blue-primary hover:underline font-semibold"
      >
        Modifier
      </button>
    </div>

    <!-- Success Message -->
    <div v-if="success" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
      <div class="flex items-center gap-2">
        <Icon icon="mdi:check-circle" class="w-5 h-5 text-green-600" />
        <p class="text-sm text-green-800 font-semibold">Profil mis à jour avec succès</p>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="formError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-start gap-2">
        <Icon icon="mdi:alert-circle" class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <p class="text-sm text-red-700">{{ formError }}</p>
      </div>
    </div>

    <!-- Display Mode -->
    <div v-if="!isEditing" class="space-y-3">
      <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <Icon icon="mdi:account" class="w-5 h-5 text-gray-600" />
        <div>
          <p class="text-xs text-gray-500">Prénom</p>
          <p class="text-sm font-semibold text-gray-900">{{ userStore.user?.profile.firstName }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <Icon icon="mdi:account" class="w-5 h-5 text-gray-600" />
        <div>
          <p class="text-xs text-gray-500">Nom</p>
          <p class="text-sm font-semibold text-gray-900">{{ userStore.user?.profile.lastName }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <Icon icon="mdi:phone" class="w-5 h-5 text-gray-600" />
        <div>
          <p class="text-xs text-gray-500">Téléphone</p>
          <p class="text-sm font-semibold text-gray-900">{{ userStore.user?.profile.phone }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <Icon icon="mdi:email" class="w-5 h-5 text-gray-600" />
        <div>
          <p class="text-xs text-gray-500">Email</p>
          <p class="text-sm font-semibold text-gray-900">{{ userStore.userEmail }}</p>
        </div>
      </div>
    </div>

    <!-- Edit Mode -->
    <form v-else @submit.prevent="saveProfile" class="space-y-4">
      <!-- First Name -->
      <div>
        <label for="firstName" class="block text-sm font-semibold text-gray-700 mb-2">
          Prénom
        </label>
        <input
          id="firstName"
          v-model="firstName"
          type="text"
          :class="[
            'w-full px-4 py-2.5 border rounded-lg text-sm',
            'focus:outline-none focus:border-blue-primary focus:ring-2 focus:ring-blue-200',
            fieldErrors.firstName && 'border-red-500'
          ]"
          required
        />
        <p v-if="fieldErrors.firstName" class="mt-1 text-xs text-red-600">{{ fieldErrors.firstName }}</p>
      </div>

      <!-- Last Name -->
      <div>
        <label for="lastName" class="block text-sm font-semibold text-gray-700 mb-2">
          Nom
        </label>
        <input
          id="lastName"
          v-model="lastName"
          type="text"
          :class="[
            'w-full px-4 py-2.5 border rounded-lg text-sm',
            'focus:outline-none focus:border-blue-primary focus:ring-2 focus:ring-blue-200',
            fieldErrors.lastName && 'border-red-500'
          ]"
          required
        />
        <p v-if="fieldErrors.lastName" class="mt-1 text-xs text-red-600">{{ fieldErrors.lastName }}</p>
      </div>

      <!-- Phone -->
      <div>
        <label for="phone" class="block text-sm font-semibold text-gray-700 mb-2">
          Téléphone
        </label>
        <input
          id="phone"
          v-model="phone"
          type="tel"
          placeholder="0612345678"
          :class="[
            'w-full px-4 py-2.5 border rounded-lg text-sm',
            'focus:outline-none focus:border-blue-primary focus:ring-2 focus:ring-blue-200',
            fieldErrors.phone && 'border-red-500'
          ]"
          required
        />
        <p v-if="fieldErrors.phone" class="mt-1 text-xs text-red-600">{{ fieldErrors.phone }}</p>
      </div>

      <!-- Buttons -->
      <div class="flex gap-3 pt-2">
        <button
          type="button"
          @click="toggleEdit"
          class="flex-1 py-2.5 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all text-sm"
        >
          Annuler
        </button>
        <button
          type="submit"
          :disabled="userStore.isLoading"
          :class="[
            'flex-1 py-2.5 px-4 rounded-lg font-semibold text-white transition-all text-sm',
            'bg-blue-primary hover:bg-blue-light',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'flex items-center justify-center gap-2'
          ]"
        >
          <Icon v-if="userStore.isLoading" icon="mdi:loading" class="w-5 h-5 animate-spin" />
          <span>{{ userStore.isLoading ? 'Enregistrement...' : 'Enregistrer' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

