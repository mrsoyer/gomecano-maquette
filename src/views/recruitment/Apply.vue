<script setup lang="ts">
import { ref } from 'vue'
import { z } from 'zod'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import { useRecruitment } from '@/composables/useRecruitment'

// Validation schema
const applicationSchema = z.object({
  firstName: z.string().min(2, 'Prénom trop court'),
  lastName: z.string().min(2, 'Nom trop court'),
  email: z.string().email('Email invalide'),
  phone: z.string().regex(/^0[1-9]\d{8}$/, 'Téléphone invalide (format: 0123456789)'),
  experience: z.string().min(1, 'Expérience requise')
})

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  experience: ''
})

const { submitApplication, isLoading, error } = useRecruitment()
const isSuccess = ref(false)
const validationErrors = ref<Record<string, string>>({})

/**
 * Handle form submission
 */
async function handleSubmit() {
  // Reset errors
  validationErrors.value = {}
  error.value = null

  // Validate
  try {
    applicationSchema.parse(form.value)
  } catch (err) {
    if (err instanceof z.ZodError) {
      err.errors.forEach(error => {
        if (error.path[0]) {
          validationErrors.value[error.path[0].toString()] = error.message
        }
      })
      return
    }
  }

  // Submit
  const result = await submitApplication({
    firstName: form.value.firstName,
    lastName: form.value.lastName,
    email: form.value.email,
    phone: form.value.phone,
    experience: form.value.experience
  })

  if (result.success) {
    isSuccess.value = true
    // Reset form
    form.value = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      experience: ''
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <Header />
    <Container class="py-12">
      <h1 class="text-4xl font-bold mb-8">Candidature Mécanicien</h1>
      <Card class="max-w-2xl mx-auto">
        <!-- Success Message -->
        <div v-if="isSuccess" class="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
          <p class="text-green-700 font-semibold">✓ Candidature envoyée avec succès !</p>
          <p class="text-green-600 text-sm mt-1">Nous vous recontacterons sous 48h.</p>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p class="text-red-700">{{ error }}</p>
        </div>

        <form v-if="!isSuccess" @submit.prevent="handleSubmit">
          <div class="mb-4">
            <Input
              v-model="form.firstName"
              label="Prénom"
              required
              :class="{ 'border-red-500': validationErrors.firstName }"
            />
            <p v-if="validationErrors.firstName" class="text-red-500 text-sm mt-1">
              {{ validationErrors.firstName }}
            </p>
          </div>

          <div class="mb-4">
            <Input
              v-model="form.lastName"
              label="Nom"
              required
              :class="{ 'border-red-500': validationErrors.lastName }"
            />
            <p v-if="validationErrors.lastName" class="text-red-500 text-sm mt-1">
              {{ validationErrors.lastName }}
            </p>
          </div>

          <div class="mb-4">
            <Input
              v-model="form.email"
              label="Email"
              type="email"
              required
              :class="{ 'border-red-500': validationErrors.email }"
            />
            <p v-if="validationErrors.email" class="text-red-500 text-sm mt-1">
              {{ validationErrors.email }}
            </p>
          </div>

          <div class="mb-4">
            <Input
              v-model="form.phone"
              label="Téléphone"
              type="tel"
              placeholder="0123456789"
              required
              :class="{ 'border-red-500': validationErrors.phone }"
            />
            <p v-if="validationErrors.phone" class="text-red-500 text-sm mt-1">
              {{ validationErrors.phone }}
            </p>
          </div>

          <div class="mb-6">
            <Input
              v-model="form.experience"
              label="Années d'expérience"
              type="number"
              required
              :class="{ 'border-red-500': validationErrors.experience }"
            />
            <p v-if="validationErrors.experience" class="text-red-500 text-sm mt-1">
              {{ validationErrors.experience }}
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            class="w-full"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Envoi en cours...' : 'Envoyer ma candidature' }}
          </Button>
        </form>

        <!-- Button to submit another application -->
        <Button
          v-if="isSuccess"
          variant="secondary"
          size="lg"
          class="w-full"
          @click="isSuccess = false"
        >
          Envoyer une autre candidature
        </Button>
      </Card>
    </Container>
    <Footer />
  </div>
</template>









