<script setup lang="ts">
import { ref, computed } from 'vue'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'

const hoursPerWeek = ref(20)
const avgPricePerHour = ref(60)

const monthlyRevenue = computed(() => hoursPerWeek.value * 4 * avgPricePerHour.value)
</script>

<template>
  <div class="min-h-screen bg-white">
    <Header />
    <Container class="py-12">
      <h1 class="text-4xl font-bold mb-8">Simulateur de revenus</h1>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h2 class="text-2xl font-bold mb-6">Votre activité</h2>
          <Input v-model.number="hoursPerWeek" label="Heures / semaine" type="number" class="mb-4" />
          <Input v-model.number="avgPricePerHour" label="Prix moyen / heure (€)" type="number" />
        </Card>
        <Card>
          <h2 class="text-2xl font-bold mb-6">Vos revenus estimés</h2>
          <div class="text-5xl font-bold text-orange-primary mb-4">{{ monthlyRevenue }}€</div>
          <div class="text-gray-600">par mois</div>
        </Card>
      </div>
    </Container>
    <Footer />
  </div>
</template>






