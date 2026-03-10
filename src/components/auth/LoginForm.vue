<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuth } from '@/composables/useAuth'
import { loginSchema, type LoginFormData } from '@/utils/validation'

const router = useRouter()
const { login, isLoading, error: authError } = useAuth()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const formError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})

/**
 * Handle login
 */
async function handleLogin(): Promise<void> {
  formError.value = null
  fieldErrors.value = {}

  try {
    // Validate with Zod
    const validated = loginSchema.parse({
      email: email.value,
      password: password.value,
      rememberMe: rememberMe.value
    })

    // Attempt login
    await login(validated)

    // Redirect to dashboard on success
    router.push('/account/dashboard')
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes('email')) {
        fieldErrors.value.email = err.message
      } else if (err.message.includes('password') || err.message.includes('mot de passe')) {
        formError.value = err.message
      } else {
        formError.value = err.message
      }
    }
    console.error('[LoginForm] Login error:', err)
  }
}

/**
 * Navigate to register
 */
function goToRegister(): void {
  router.push('/register')
}

/**
 * Navigate to forgot password
 */
function goToForgotPassword(): void {
  router.push('/forgot-password')
}
</script>

<template>
  <div class="w-full max-w-md bg-white rounded-lg shadow-lg border border-gray-200 p-6 md:p-8">
    <!-- Header -->
    <div class="text-center mb-6">
      <div class="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
        <Icon icon="mdi:account-circle" class="w-10 h-10 text-blue-primary" />
      </div>
      <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Connexion</h2>
      <p class="text-sm md:text-base text-gray-600">
        Accédez à votre espace client Gomecano
      </p>
    </div>

    <!-- Global Error -->
    <div v-if="formError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-start gap-2">
        <Icon icon="mdi:alert-circle" class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <p class="text-sm text-red-700">{{ formError }}</p>
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleLogin" class="space-y-4">
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
              'w-full pl-10 pr-4 py-3 border rounded-lg text-sm md:text-base',
              'focus:outline-none focus:border-blue-primary focus:ring-2 focus:ring-blue-200',
              'transition-all',
              fieldErrors.email && 'border-red-500 focus:border-red-500 focus:ring-red-200'
            ]"
            autocomplete="email"
            required
          />
        </div>
        <p v-if="fieldErrors.email" class="mt-1 text-xs text-red-600">{{ fieldErrors.email }}</p>
      </div>

      <!-- Password -->
      <div>
        <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
          Mot de passe
        </label>
        <div class="relative">
          <Icon icon="mdi:lock-outline" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            class="w-full pl-10 pr-12 py-3 border rounded-lg text-sm md:text-base focus:outline-none focus:border-blue-primary focus:ring-2 focus:ring-blue-200 transition-all"
            autocomplete="current-password"
            required
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <Icon :icon="showPassword ? 'mdi:eye-off' : 'mdi:eye'" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Remember Me + Forgot Password -->
      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="rememberMe"
            type="checkbox"
            class="w-4 h-4 text-blue-primary border-gray-300 rounded focus:ring-blue-200"
          />
          <span class="text-sm text-gray-700">Se souvenir de moi</span>
        </label>
        <button
          type="button"
          @click="goToForgotPassword"
          class="text-sm text-blue-primary hover:underline font-semibold"
        >
          Mot de passe oublié ?
        </button>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="isLoading"
        :class="[
          'w-full py-3 px-4 rounded-lg font-semibold text-white transition-all',
          'bg-orange-primary hover:bg-orange-hover',
          'focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'flex items-center justify-center gap-2'
        ]"
      >
        <Icon v-if="isLoading" icon="mdi:loading" class="w-5 h-5 animate-spin" />
        <span>{{ isLoading ? 'Connexion...' : 'Se connecter' }}</span>
      </button>
    </form>

    <!-- Separator -->
    <div class="relative my-6">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-200"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="px-4 bg-white text-gray-500">ou</span>
      </div>
    </div>

    <!-- Register Link -->
    <div class="text-center">
      <p class="text-sm text-gray-600">
        Pas encore de compte ?
        <button
          type="button"
          @click="goToRegister"
          class="text-blue-primary hover:underline font-semibold ml-1"
        >
          Créer un compte
        </button>
      </p>
    </div>

    <!-- Demo Credentials -->
    <div class="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <p class="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-2">
        <Icon icon="mdi:information" class="w-4 h-4" />
        Démo - Comptes de test
      </p>
      <div class="space-y-1 text-xs text-blue-800">
        <p><strong>B2C:</strong> sophie.martin@email.com</p>
        <p><strong>B2B:</strong> fleet@transports-leclerc.fr</p>
        <p class="text-blue-600 italic">Mot de passe: n'importe quoi (mock)</p>
      </div>
    </div>
  </div>
</template>
