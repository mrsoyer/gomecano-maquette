<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import Loader from '@/components/ui/Loader.vue'
import { useContent } from '@/composables/useContent'
import type { BlogPost } from '@/types/composables.types'

const route = useRoute()
const router = useRouter()
const { fetchBlogPost } = useContent()

const post = ref<BlogPost | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

async function loadPost() {
  loading.value = true
  error.value = null
  try {
    const result = await fetchBlogPost(route.params.slug as string)
    if (result) {
      post.value = {
        id: result.id,
        slug: result.slug,
        title: result.title,
        excerpt: result.excerpt || '',
        content: result.content,
        coverImage: result.cover_image,
        category: result.category,
        author: result.author,
        tags: [],
        publishedAt: result.published_at,
        readingTime: result.reading_time || 5,
        viewCount: result.view_count || 0
      }
    } else {
      router.push('/404')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erreur de chargement'
  } finally {
    loading.value = false
  }
}

onMounted(loadPost)
watch(() => route.params.slug, loadPost)
</script>

<template>
  <div class="min-h-screen bg-white">
    <Header />

    <div v-if="loading" class="flex justify-center py-24">
      <Loader size="lg" />
    </div>

    <div v-else-if="error" class="text-center py-24 text-red-500">
      {{ error }}
    </div>

    <Container v-else-if="post" class="py-12 max-w-4xl">
      <div class="mb-6">
        <div class="text-sm text-gray-500 mb-2">{{ post.category?.name || 'Article' }} • {{ post.readingTime }} min</div>
        <h1 class="text-4xl font-bold mb-4">{{ post.title }}</h1>
        <div class="flex items-center gap-3">
          <div class="font-medium">{{ post.author?.name || 'Gomecano' }}</div>
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









