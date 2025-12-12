<script setup lang="ts">
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'

const benefits = [
  { icon: '⏱️', title: 'Zéro immobilisation', description: 'Interventions sur site' },
  { icon: '💰', title: 'Économies -30%', description: 'Prix compétitifs garantis' },
  { icon: '📊', title: 'Reporting complet', description: 'Dashboard de gestion de flotte' },
  { icon: '🔧', title: 'Mécaniciens certifiés', description: 'Qualité professionnelle' },
]
</script>

<template>
  <div class="min-h-screen bg-white">
    <Header />
    
    <section class="bg-gradient-to-br from-green-primary to-green-dark text-white py-20">
      <Container>
        <h1 class="text-5xl font-bold mb-6">Gomecano Entreprises</h1>
        <p class="text-2xl mb-8">Gestion de flotte simplifiée, zéro immobilisation</p>
        <Button variant="secondary" size="lg" class="bg-white text-green-primary" @click="$router.push('/entreprises/simulateur')">
          Calculer mes économies
        </Button>
      </Container>
    </section>
    
    <Container class="py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card v-for="benefit in benefits" :key="benefit.title">
          <div class="text-center">
            <div class="text-5xl mb-4">{{ benefit.icon }}</div>
            <h3 class="text-xl font-bold mb-2">{{ benefit.title }}</h3>
            <p class="text-gray-600">{{ benefit.description }}</p>
          </div>
        </Card>
      </div>
    </Container>
    
    <Footer />
  </div>
</template>






