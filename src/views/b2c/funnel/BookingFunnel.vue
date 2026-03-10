<script setup lang="ts">
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />
    <Container class="py-8">
      <div class="max-w-4xl mx-auto">
        <RouterView />
      </div>
    </Container>
    <Footer />
  </div>
</template>




