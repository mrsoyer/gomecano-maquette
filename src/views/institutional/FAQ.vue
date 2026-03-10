<script setup lang="ts">
import { onMounted } from 'vue'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import Accordion from '@/components/ui/Accordion.vue'
import Loader from '@/components/ui/Loader.vue'
import { useContent } from '@/composables/useContent'

const { faqCategories, loading, error, fetchFAQs } = useContent()

onMounted(() => {
  fetchFAQs()
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <Header />
    <Container class="py-12">
      <h1 class="text-4xl font-bold mb-8">Questions fréquentes</h1>

      <div v-if="loading" class="flex justify-center py-12">
        <Loader size="lg" />
      </div>

      <div v-else-if="error" class="text-center py-12 text-red-500">
        {{ error }}
      </div>

      <div v-else class="space-y-8 max-w-3xl">
        <div v-for="category in faqCategories" :key="category.id">
          <h2 class="text-2xl font-semibold mb-4">{{ category.name }}</h2>
          <div class="space-y-4">
            <Accordion v-for="faq in category.items" :key="faq.id" :title="faq.question">
              <p class="text-gray-700">{{ faq.answer }}</p>
            </Accordion>
          </div>
        </div>
      </div>
    </Container>
    <Footer />
  </div>
</template>









