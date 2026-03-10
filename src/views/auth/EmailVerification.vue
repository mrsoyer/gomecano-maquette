<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const route = useRoute()
const { verifyEmail, resendVerificationEmail } = useAuth()

const loading = ref(true)
const verified = ref(false)
const error = ref<string | null>(null)
const resending = ref(false)
const resendSuccess = ref(false)

/**
 * Verify email on page load
 */
onMounted(async () => {
  const token = route.query.token as string

  if (!token) {
    error.value = 'Token de vérification manquant'
    loading.value = false
    return
  }

  try {
    const success = await verifyEmail(token)

    if (success) {
      verified.value = true
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login?verified=true')
      }, 3000)
    } else {
      error.value = 'Le lien de vérification est invalide ou expiré'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erreur lors de la vérification'
  } finally {
    loading.value = false
  }
})

/**
 * Resend verification email
 */
async function handleResend() {
  resending.value = true
  resendSuccess.value = false
  error.value = null

  try {
    const success = await resendVerificationEmail()

    if (success) {
      resendSuccess.value = true
    } else {
      error.value = 'Erreur lors de l\'envoi de l\'email'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
  } finally {
    resending.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col">
    <Header />

    <div class="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
      <Card class="w-full max-w-md p-8">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p class="text-gray-600">Vérification en cours...</p>
        </div>

        <!-- Success State -->
        <div v-else-if="verified" class="text-center py-8">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">
            Email vérifié !
          </h1>
          <p class="text-gray-600 mb-4">
            Votre adresse email a été confirmée avec succès.
          </p>
          <p class="text-sm text-gray-500">
            Redirection vers la connexion...
          </p>
        </div>

        <!-- Error State -->
        <div v-else class="py-8">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 class="text-2xl font-bold text-gray-900 mb-2 text-center">
            Vérification échouée
          </h1>

          <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {{ error }}
          </div>

          <!-- Resend Success -->
          <div
            v-if="resendSuccess"
            class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800"
          >
            <p class="font-medium">✓ Email de vérification renvoyé</p>
            <p class="text-sm mt-1">Vérifiez votre boîte de réception.</p>
          </div>

          <!-- Resend Button -->
          <div class="space-y-3">
            <Button
              variant="primary"
              :disabled="resending"
              @click="handleResend"
              class="w-full"
            >
              {{ resending ? 'Envoi...' : 'Renvoyer l\'email de vérification' }}
            </Button>

            <Button
              variant="secondary"
              @click="router.push('/auth/login')"
              class="w-full"
            >
              Retour à la connexion
            </Button>
          </div>
        </div>
      </Card>
    </div>

    <Footer />
  </div>
</template>
