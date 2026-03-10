<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const route = useRoute()
const { updatePassword } = useAuth()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

/**
 * Handle password reset form submission
 */
async function handleSubmit() {
  error.value = null

  // Validation
  if (password.value.length < 8) {
    error.value = 'Le mot de passe doit contenir au moins 8 caractères'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }

  loading.value = true

  try {
    const success = await updatePassword(password.value)

    if (success) {
      success.value = true
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } else {
      error.value = 'Erreur lors de la réinitialisation du mot de passe'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col">
    <Header />

    <div class="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
      <Card class="w-full max-w-md p-8">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">
            Nouveau mot de passe
          </h1>
          <p class="text-gray-600">
            Choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        <!-- Success Message -->
        <div
          v-if="success"
          class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800"
        >
          <p class="font-medium">✓ Mot de passe réinitialisé avec succès!</p>
          <p class="text-sm mt-1">Redirection vers la connexion...</p>
        </div>

        <!-- Error Message -->
        <div
          v-if="error"
          class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800"
        >
          {{ error }}
        </div>

        <!-- Reset Form -->
        <form v-if="!success" @submit.prevent="handleSubmit" class="space-y-4">
          <!-- New Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              minlength="8"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Minimum 8 caractères"
            >
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              minlength="8"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Retapez votre mot de passe"
            >
          </div>

          <!-- Submit Button -->
          <Button
            type="submit"
            variant="primary"
            :disabled="loading"
            class="w-full"
          >
            {{ loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe' }}
          </Button>
        </form>

        <!-- Back to Login -->
        <div class="mt-6 text-center">
          <router-link
            to="/auth/login"
            class="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Retour à la connexion
          </router-link>
        </div>
      </Card>
    </div>

    <Footer />
  </div>
</template>
