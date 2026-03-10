<script setup lang="ts">
import { onMounted } from 'vue'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Loader from '@/components/ui/Loader.vue'
import { useContent } from '@/composables/useContent'

const { testimonials, loading, error, fetchTestimonials } = useContent()

onMounted(() => {
  fetchTestimonials('mechanic')
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <Header />
    
    <section class="bg-gradient-to-br from-orange-primary to-orange-hover text-white py-20">
      <Container>
        <h1 class="text-5xl font-bold mb-6">Devenez Gomécanicien</h1>
        <p class="text-2xl mb-8">Liberté, revenus x3, autonomie totale</p>
        <Button variant="secondary" size="lg" class="bg-white text-orange-primary" @click="$router.push('/devenir-mecanicien/simulateur')">
          Calculer mes revenus
        </Button>
      </Container>
    </section>
    
    <Container class="py-16">
      <div v-if="loading" class="flex justify-center py-12">
        <Loader size="lg" />
      </div>

      <div v-else-if="error" class="text-center py-12 text-red-500">
        {{ error }}
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card v-for="testimonial in testimonials" :key="testimonial.id">
          <div class="flex gap-1 mb-3">
            <span v-for="i in testimonial.rating" :key="i" class="text-orange-primary">★</span>
          </div>
          <p class="italic mb-3">"{{ testimonial.content }}"</p>
          <div class="font-semibold">{{ testimonial.authorName }}</div>
          <div v-if="testimonial.authorRole" class="text-sm text-gray-500">{{ testimonial.authorRole }}</div>
        </Card>
      </div>
    </Container>
    
    <Footer />
  </div>
</template>




