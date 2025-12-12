<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getBlogPostBySlug } from '@/mocks'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'

const route = useRoute()
const post = computed(() => getBlogPostBySlug(route.params.slug as string))
</script>

<template>
  <div v-if="post" class="min-h-screen bg-white">
    <Header />
    <Container class="py-12 max-w-4xl">
      <div class="mb-6">
        <div class="text-sm text-gray-500 mb-2">{{ post.category }} • {{ post.readTime }} min</div>
        <h1 class="text-4xl font-bold mb-4">{{ post.title }}</h1>
        <div class="flex items-center gap-3">
          <div class="font-medium">{{ post.author.name }}</div>
          <div class="text-gray-500">{{ post.publishedAt }}</div>
        </div>
      </div>
      <div class="prose prose-lg max-w-none">
        <p>{{ post.content }}</p>
      </div>
    </Container>
    <Footer />
  </div>
</template>






