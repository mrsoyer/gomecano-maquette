<script setup lang="ts">
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import Accordion from '@/components/ui/Accordion.vue'
import { mockFAQs } from '@/mocks'
</script>

<template>
  <div class="min-h-screen bg-white">
    <Header />
    <Container class="py-12">
      <h1 class="text-4xl font-bold mb-8">Questions fréquentes</h1>
      <div class="space-y-4 max-w-3xl">
        <Accordion v-for="faq in mockFAQs" :key="faq.id" :title="faq.question">
          <p class="text-gray-700">{{ faq.answer }}</p>
        </Accordion>
      </div>
    </Container>
    <Footer />
  </div>
</template>






