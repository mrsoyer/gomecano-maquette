<script setup lang="ts">
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import { mockBlogPosts } from '@/mocks'
</script>

<template>
  <div class="min-h-screen bg-white">
    <Header />
    <Container class="py-12">
      <h1 class="text-4xl font-bold mb-8">Blog</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card v-for="post in mockBlogPosts" :key="post.id" :hover="true">
          <div class="text-sm text-gray-500 mb-2">{{ post.category }} • {{ post.readTime }} min</div>
          <h3 class="text-xl font-bold mb-2">{{ post.title }}</h3>
          <p class="text-gray-600 mb-4">{{ post.excerpt }}</p>
          <Button variant="ghost" size="sm" @click="$router.push(`/blog/${post.slug}`)">Lire la suite</Button>
        </Card>
      </div>
    </Container>
    <Footer />
  </div>
</template>






