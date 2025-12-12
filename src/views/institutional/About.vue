<script setup lang="ts">
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import Card from '@/components/ui/Card.vue'
</script>

<template>
  <div class="min-h-screen bg-white">
    <Header />
    <Container class="py-12">
      <h1 class="text-4xl font-bold mb-8">À propos de Gomecano</h1>
      <Card>
        <p class="text-lg text-gray-700 leading-relaxed">
          Gomecano révolutionne l'entretien automobile en France en proposant des mécaniciens professionnels qui se déplacent à domicile...
        </p>
      </Card>
    </Container>
    <Footer />
  </div>
</template>






