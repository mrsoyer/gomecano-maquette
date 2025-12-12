<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuth } from '@/composables/useAuth'
import { forgotPasswordSchema } from '@/utils/validation'

const router = useRouter()
const { forgotPassword, isLoading } = useAuth()

const email = ref('')
const formError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})
const success = ref(false)

/**
 * Handle forgot password
 */
async function handleForgotPassword(): Promise<void> {
  formError.value = null
  fieldErrors.value = {}
  success.value = false

  try {
    // Validate with Zod
    const validated = forgotPasswordSchema.parse({
      email: email.value
    })

    // Request password reset
    await forgotPassword(validated.email)

    // Show success message
    success.value = true

    console.log('[ForgotPassword] Reset email sent (mock)')
  } catch (err: any) {
    if (err.errors) {
      err.errors.forEach((e: any) => {
        fieldErrors.value[e.path[0]] = e.message
      })
    } else if (err instanceof Error) {
      formError.value = err.message
    }
    console.error('[ForgotPassword] Error:', err)
  }
}

/**
 * Navigate to login
 */
function goToLogin(): void {
  router.push('/login')
}
</script>

<template>
  <div class="w-full max-w-md bg-white rounded-lg shadow-lg border border-gray-200 p-6 md:p-8">
    <!-- Header -->
    <div class="text-center mb-6">
      <div class="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
        <Icon icon="mdi:lock-reset" class="w-10 h-10 text-blue-primary" />
      </div>
      <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Mot de passe oublié</h2>
      <p class="text-sm md:text-base text-gray-600">
        Entrez votre email pour recevoir un lien de réinitialisation
      </p>
    </div>

    <!-- Success Message -->
    <div v-if="success" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div class="flex items-start gap-3">
        <Icon icon="mdi:check-circle" class="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p class="text-sm font-semibold text-green-900 mb-1">Email envoyé !</p>
          <p class="text-xs text-green-800">
            Consultez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
          </p>
          <p class="text-xs text-green-700 mt-2 italic">
            Le lien expirera dans 1 heure.
          </p>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="formError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-start gap-2">
        <Icon icon="mdi:alert-circle" class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <p class="text-sm text-red-700">{{ formError }}</p>
      </div>
    </div>

    <!-- Form -->
    <form v-if="!success" @submit.prevent="handleForgotPassword" class="space-y-4">
      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
          Email
        </label>
        <div class="relative">
          <Icon icon="mdi:email-outline" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="votreemail@exemple.com"
            :class="[
              'w-full pl-10 pr-4 py-3 border rounded-lg',
              'focus:outline-none focus:border-blue-primary focus:ring-2 focus:ring-blue-200',
              fieldErrors.email && 'border-red-500'
            ]"
            autocomplete="email"
            required
          />
        </div>
        <p v-if="fieldErrors.email" class="mt-1 text-xs text-red-600">{{ fieldErrors.email }}</p>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="isLoading"
        :class="[
          'w-full py-3 px-4 rounded-lg font-semibold text-white transition-all',
          'bg-blue-primary hover:bg-blue-light',
          'focus:outline-none focus:ring-2 focus:ring-blue-primary focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'flex items-center justify-center gap-2'
        ]"
      >
        <Icon v-if="isLoading" icon="mdi:loading" class="w-5 h-5 animate-spin" />
        <span>{{ isLoading ? 'Envoi...' : 'Envoyer le lien' }}</span>
      </button>
    </form>

    <!-- Back to Login Button (always visible) -->
    <div class="mt-6">
      <button
        type="button"
        @click="goToLogin"
        class="w-full py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
      >
        <Icon icon="mdi:arrow-left" class="w-5 h-5" />
        <span>Retour à la connexion</span>
      </button>
    </div>

    <!-- Demo Info -->
    <div class="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <p class="text-xs font-semibold text-blue-900 mb-1 flex items-center gap-2">
        <Icon icon="mdi:information" class="w-4 h-4" />
        Mode Démo
      </p>
      <p class="text-xs text-blue-800">
        Le lien de réinitialisation sera affiché dans la console (mock).
      </p>
    </div>
  </div>
</template>
