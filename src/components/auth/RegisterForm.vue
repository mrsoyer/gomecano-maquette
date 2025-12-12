<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuth } from '@/composables/useAuth'
import {
  registerStep1Schema,
  registerStep2Schema,
  type RegisterStep1Data,
  type RegisterStep2Data
} from '@/utils/validation'

const router = useRouter()
const { register, checkPasswordStrength, isLoading } = useAuth()

const currentStep = ref<1 | 2>(1)
const formError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})

// Step 1 fields
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)

// Step 2 fields
const firstName = ref('')
const lastName = ref('')
const phone = ref('')
const acceptTerms = ref(false)
const acceptMarketing = ref(false)

/**
 * Password strength indicator
 */
const passwordStrength = computed(() => {
  if (!password.value) return null
  return checkPasswordStrength(password.value)
})

/**
 * Password strength color
 */
const strengthColor = computed(() => {
  if (!passwordStrength.value) return 'gray'
  const score = passwordStrength.value.score
  if (score >= 4) return 'green'
  if (score >= 3) return 'blue'
  if (score >= 2) return 'orange'
  return 'red'
})

/**
 * Password strength label
 */
const strengthLabel = computed(() => {
  if (!passwordStrength.value) return ''
  const score = passwordStrength.value.score
  if (score >= 4) return 'Très fort'
  if (score >= 3) return 'Fort'
  if (score >= 2) return 'Moyen'
  if (score >= 1) return 'Faible'
  return 'Très faible'
})

/**
 * Validate and go to step 2
 */
function goToStep2(): void {
  formError.value = null
  fieldErrors.value = {}

  try {
    registerStep1Schema.parse({
      email: email.value,
      password: password.value,
      confirmPassword: confirmPassword.value
    })

    currentStep.value = 2
  } catch (err: any) {
    if (err.errors) {
      err.errors.forEach((e: any) => {
        fieldErrors.value[e.path[0]] = e.message
      })
    }
  }
}

/**
 * Go back to step 1
 */
function goToStep1(): void {
  currentStep.value = 1
  formError.value = null
  fieldErrors.value = {}
}

/**
 * Handle registration
 */
async function handleRegister(): Promise<void> {
  formError.value = null
  fieldErrors.value = {}

  try {
    // Validate step 2
    registerStep2Schema.parse({
      firstName: firstName.value,
      lastName: lastName.value,
      phone: phone.value,
      acceptTerms: acceptTerms.value,
      acceptMarketing: acceptMarketing.value
    })

    // Attempt registration
    await register({
      email: email.value,
      password: password.value,
      firstName: firstName.value,
      lastName: lastName.value,
      phone: phone.value,
      acceptTerms: acceptTerms.value,
      acceptMarketing: acceptMarketing.value
    })

    // Redirect to dashboard on success
    router.push('/account/dashboard')
  } catch (err: any) {
    if (err.errors) {
      err.errors.forEach((e: any) => {
        fieldErrors.value[e.path[0]] = e.message
      })
    } else if (err instanceof Error) {
      formError.value = err.message
    }
    console.error('[RegisterForm] Register error:', err)
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
      <div class="w-16 h-16 mx-auto mb-4 bg-orange-50 rounded-full flex items-center justify-center">
        <Icon icon="mdi:account-plus" class="w-10 h-10 text-orange-primary" />
      </div>
      <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Créer un compte</h2>
      <p class="text-sm md:text-base text-gray-600">
        Rejoignez Gomecano et gérez vos interventions en ligne
      </p>
    </div>

    <!-- Progress Stepper -->
    <div class="flex items-center justify-center mb-8">
      <div class="flex items-center gap-2">
        <div
          :class="[
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
            currentStep >= 1 ? 'bg-orange-primary text-white' : 'bg-gray-200 text-gray-500'
          ]"
        >
          1
        </div>
        <div class="w-12 h-1" :class="currentStep >= 2 ? 'bg-orange-primary' : 'bg-gray-200'"></div>
        <div
          :class="[
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
            currentStep >= 2 ? 'bg-orange-primary text-white' : 'bg-gray-200 text-gray-500'
          ]"
        >
          2
        </div>
      </div>
    </div>

    <!-- Global Error -->
    <div v-if="formError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-start gap-2">
        <Icon icon="mdi:alert-circle" class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <p class="text-sm text-red-700">{{ formError }}</p>
      </div>
    </div>

    <!-- STEP 1: Email + Password -->
    <form v-if="currentStep === 1" @submit.prevent="goToStep2" class="space-y-4">
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
              'focus:outline-none focus:border-orange-primary focus:ring-2 focus:ring-orange-200',
              fieldErrors.email && 'border-red-500'
            ]"
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
            placeholder="Minimum 8 caractères"
            :class="[
              'w-full pl-10 pr-12 py-3 border rounded-lg',
              'focus:outline-none focus:border-orange-primary focus:ring-2 focus:ring-orange-200',
              fieldErrors.password && 'border-red-500'
            ]"
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

        <!-- Password Strength Indicator -->
        <div v-if="password" class="mt-2">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs text-gray-600">Force du mot de passe</span>
            <span :class="['text-xs font-semibold', `text-${strengthColor}-600`]">
              {{ strengthLabel }}
            </span>
          </div>
          <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              :class="[
                'h-full transition-all duration-300',
                `bg-${strengthColor}-500`
              ]"
              :style="{ width: `${(passwordStrength?.score || 0) * 25}%` }"
            ></div>
          </div>
          <div v-if="passwordStrength && passwordStrength.feedback.length > 0" class="mt-2 space-y-1">
            <p
              v-for="(fb, idx) in passwordStrength.feedback"
              :key="idx"
              class="text-xs text-gray-600 flex items-center gap-1"
            >
              <Icon icon="mdi:circle-small" class="w-4 h-4" />
              {{ fb }}
            </p>
          </div>
        </div>
        <p v-if="fieldErrors.password" class="mt-1 text-xs text-red-600">{{ fieldErrors.password }}</p>
      </div>

      <!-- Confirm Password -->
      <div>
        <label for="confirmPassword" class="block text-sm font-semibold text-gray-700 mb-2">
          Confirmer le mot de passe
        </label>
        <div class="relative">
          <Icon icon="mdi:lock-check-outline" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Confirmez votre mot de passe"
            :class="[
              'w-full pl-10 pr-4 py-3 border rounded-lg',
              'focus:outline-none focus:border-orange-primary focus:ring-2 focus:ring-orange-200',
              fieldErrors.confirmPassword && 'border-red-500'
            ]"
            required
          />
        </div>
        <p v-if="fieldErrors.confirmPassword" class="mt-1 text-xs text-red-600">{{ fieldErrors.confirmPassword }}</p>
      </div>

      <!-- Next Button -->
      <button
        type="submit"
        class="w-full py-3 px-4 bg-orange-primary hover:bg-orange-hover text-white font-semibold rounded-lg transition-all"
      >
        Continuer
      </button>
    </form>

    <!-- STEP 2: Personal Info -->
    <form v-if="currentStep === 2" @submit.prevent="handleRegister" class="space-y-4">
      <!-- First Name -->
      <div>
        <label for="firstName" class="block text-sm font-semibold text-gray-700 mb-2">
          Prénom
        </label>
        <input
          id="firstName"
          v-model="firstName"
          type="text"
          placeholder="Votre prénom"
          :class="[
            'w-full px-4 py-3 border rounded-lg',
            'focus:outline-none focus:border-orange-primary focus:ring-2 focus:ring-orange-200',
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
          placeholder="Votre nom"
          :class="[
            'w-full px-4 py-3 border rounded-lg',
            'focus:outline-none focus:border-orange-primary focus:ring-2 focus:ring-orange-200',
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
        <div class="relative">
          <Icon icon="mdi:phone-outline" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="phone"
            v-model="phone"
            type="tel"
            placeholder="0612345678"
            :class="[
              'w-full pl-10 pr-4 py-3 border rounded-lg',
              'focus:outline-none focus:border-orange-primary focus:ring-2 focus:ring-orange-200',
              fieldErrors.phone && 'border-red-500'
            ]"
            required
          />
        </div>
        <p v-if="fieldErrors.phone" class="mt-1 text-xs text-red-600">{{ fieldErrors.phone }}</p>
      </div>

      <!-- Accept Terms -->
      <div>
        <label class="flex items-start gap-3 cursor-pointer">
          <input
            v-model="acceptTerms"
            type="checkbox"
            :class="[
              'w-5 h-5 text-orange-primary border-gray-300 rounded mt-0.5',
              'focus:ring-orange-200',
              fieldErrors.acceptTerms && 'border-red-500'
            ]"
            required
          />
          <span class="text-sm text-gray-700">
            J'accepte les
            <a href="/legal/cgu" target="_blank" class="text-blue-primary hover:underline font-semibold">
              Conditions Générales d'Utilisation
            </a>
            et la
            <a href="/legal/privacy" target="_blank" class="text-blue-primary hover:underline font-semibold">
              Politique de confidentialité
            </a>
          </span>
        </label>
        <p v-if="fieldErrors.acceptTerms" class="mt-1 text-xs text-red-600 ml-8">{{ fieldErrors.acceptTerms }}</p>
      </div>

      <!-- Accept Marketing -->
      <div>
        <label class="flex items-start gap-3 cursor-pointer">
          <input
            v-model="acceptMarketing"
            type="checkbox"
            class="w-5 h-5 text-orange-primary border-gray-300 rounded mt-0.5 focus:ring-orange-200"
          />
          <span class="text-sm text-gray-700">
            J'accepte de recevoir des offres promotionnelles par email et SMS
            <span class="text-gray-500">(optionnel)</span>
          </span>
        </label>
      </div>

      <!-- Buttons -->
      <div class="flex gap-3">
        <button
          type="button"
          @click="goToStep1"
          class="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
        >
          Retour
        </button>
        <button
          type="submit"
          :disabled="isLoading"
          :class="[
            'flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-all',
            'bg-orange-primary hover:bg-orange-hover',
            'focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'flex items-center justify-center gap-2'
          ]"
        >
          <Icon v-if="isLoading" icon="mdi:loading" class="w-5 h-5 animate-spin" />
          <span>{{ isLoading ? 'Création...' : 'Créer mon compte' }}</span>
        </button>
      </div>
    </form>

    <!-- Login Link -->
    <div class="mt-6 text-center">
      <p class="text-sm text-gray-600">
        Vous avez déjà un compte ?
        <button
          type="button"
          @click="goToLogin"
          class="text-blue-primary hover:underline font-semibold ml-1"
        >
          Se connecter
        </button>
      </p>
    </div>
  </div>
</template>
