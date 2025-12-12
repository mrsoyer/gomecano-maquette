<script setup lang="ts">
import { ref } from 'vue'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const form = ref({ firstName: '', lastName: '', email: '', phone: '', experience: '' })
</script>

<template>
  <div class="min-h-screen bg-white">
    <Header />
    <Container class="py-12">
      <h1 class="text-4xl font-bold mb-8">Candidature Mécanicien</h1>
      <Card class="max-w-2xl mx-auto">
        <form @submit.prevent>
          <Input v-model="form.firstName" label="Prénom" required class="mb-4" />
          <Input v-model="form.lastName" label="Nom" required class="mb-4" />
          <Input v-model="form.email" label="Email" type="email" required class="mb-4" />
          <Input v-model="form.phone" label="Téléphone" type="tel" required class="mb-4" />
          <Input v-model="form.experience" label="Années d'expérience" type="number" required class="mb-6" />
          <Button type="submit" variant="primary" size="lg" class="w-full">Envoyer ma candidature</Button>
        </form>
      </Card>
    </Container>
    <Footer />
  </div>
</template>






