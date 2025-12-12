<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores/user.store'
import { changePasswordSchema } from '@/utils/validation'

const userStore = useUserStore()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPasswords = ref(false)
const formError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})
const success = ref(false)

/**
 * Handle password change
 */
async function handleChangePassword(): Promise<void> {
  formError.value = null
  fieldErrors.value = {}
  success.value = false

  try {
    // Validate
    const validated = changePasswordSchema.parse({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
      confirmPassword: confirmPassword.value
    })

    // Change password
    await userStore.changePassword(validated.currentPassword, validated.newPassword)

    // Show success
    success.value = true

    // Reset form
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''

    // Hide success after 3s
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
    <h3 class="text-base md:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
      <Icon icon="mdi:lock-reset" class="w-5 h-5 md:w-6 md:h-6 text-blue-primary" />
      Changer le mot de passe
    </h3>

    <!-- Success -->
    <div v-if="success" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
      <div class="flex items-center gap-2">
        <Icon icon="mdi:check-circle" class="w-5 h-5 text-green-600" />
        <p class="text-sm text-green-800 font-semibold">Mot de passe modifié avec succès</p>
      </div>
    </div>

    <!-- Error -->
    <div v-if="formError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-700">{{ formError }}</p>
    </div>

    <form @submit.prevent="handleChangePassword" class="space-y-4">
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Mot de passe actuel</label>
        <input
          v-model="currentPassword"
          :type="showPasswords ? 'text' : 'password'"
          :class="['w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-blue-primary focus:ring-2 focus:ring-blue-200', fieldErrors.currentPassword && 'border-red-500']"
          required
        />
        <p v-if="fieldErrors.currentPassword" class="mt-1 text-xs text-red-600">{{ fieldErrors.currentPassword }}</p>
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Nouveau mot de passe</label>
        <input
          v-model="newPassword"
          :type="showPasswords ? 'text' : 'password'"
          :class="['w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-blue-primary focus:ring-2 focus:ring-blue-200', fieldErrors.newPassword && 'border-red-500']"
          required
        />
        <p v-if="fieldErrors.newPassword" class="mt-1 text-xs text-red-600">{{ fieldErrors.newPassword }}</p>
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Confirmer nouveau mot de passe</label>
        <input
          v-model="confirmPassword"
          :type="showPasswords ? 'text' : 'password'"
          :class="['w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-blue-primary focus:ring-2 focus:ring-blue-200', fieldErrors.confirmPassword && 'border-red-500']"
          required
        />
        <p v-if="fieldErrors.confirmPassword" class="mt-1 text-xs text-red-600">{{ fieldErrors.confirmPassword }}</p>
      </div>

      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="showPasswords" type="checkbox" class="w-4 h-4 text-blue-primary border-gray-300 rounded" />
        <span class="text-sm text-gray-700">Afficher les mots de passe</span>
      </label>

      <button
        type="submit"
        :disabled="userStore.isLoading"
        class="w-full py-2.5 px-4 bg-blue-primary hover:bg-blue-light text-white font-semibold rounded-lg disabled:opacity-50 text-sm flex items-center justify-center gap-2"
      >
        <Icon v-if="userStore.isLoading" icon="mdi:loading" class="w-5 h-5 animate-spin" />
        <span>{{ userStore.isLoading ? 'Modification...' : 'Changer le mot de passe' }}</span>
      </button>
    </form>
  </div>
</template>
