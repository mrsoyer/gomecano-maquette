<script setup lang="ts">
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import Button from '@/components/ui/Button.vue'
</script>

<template>
  <div class="min-h-screen bg-white">
    <Header />
    <Container class="py-20 text-center">
      <div class="text-6xl mb-4">404</div>
      <h1 class="text-3xl font-bold mb-4">Page non trouvée</h1>
      <p class="text-gray-600 mb-8">La page que vous recherchez n'existe pas.</p>
      <Button variant="primary" @click="$router.push('/')">Retour à l'accueil</Button>
    </Container>
    <Footer />
  </div>
</template>






