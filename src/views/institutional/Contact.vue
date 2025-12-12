<script setup lang="ts">
import { ref } from 'vue'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Textarea from '@/components/ui/Textarea.vue'
import Button from '@/components/ui/Button.vue'

const form = ref({ name: '', email: '', subject: '', message: '' })
</script>

<template>
  <div class="min-h-screen bg-white">
    <Header />
    <Container class="py-12">
      <h1 class="text-4xl font-bold mb-8">Contact</h1>
      <Card class="max-w-2xl mx-auto">
        <form @submit.prevent>
          <Input v-model="form.name" label="Nom" required class="mb-4" />
          <Input v-model="form.email" label="Email" type="email" required class="mb-4" />
          <Input v-model="form.subject" label="Sujet" required class="mb-4" />
          <Textarea v-model="form.message" label="Message" required class="mb-6" />
          <Button type="submit" variant="primary" size="lg" class="w-full">Envoyer</Button>
        </form>
      </Card>
    </Container>
    <Footer />
  </div>
</template>






