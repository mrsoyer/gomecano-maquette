<script setup lang="ts">
import { ref, computed } from 'vue'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'

const vehicleCount = ref(10)
const avgInterventions = ref(3)

const savings = computed(() => ({
  timeGain: vehicleCount.value * avgInterventions.value * 2, // heures/an
  costSavings: vehicleCount.value * avgInterventions.value * 50, // €/an
}))
</script>

<template>
  <div class="min-h-screen bg-white">
    <Header />
    <Container class="py-12">
      <h1 class="text-4xl font-bold mb-8">Simulateur ROI B2B</h1>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h2 class="text-2xl font-bold mb-6">Votre flotte</h2>
          <Input v-model.number="vehicleCount" label="Nombre de véhicules" type="number" class="mb-4" />
          <Input v-model.number="avgInterventions" label="Interventions/an par véhicule" type="number" />
        </Card>
        <Card>
          <h2 class="text-2xl font-bold mb-6">Vos économies</h2>
          <div class="space-y-4">
            <div>
              <div class="text-4xl font-bold text-green-primary">{{ savings.timeGain }}h</div>
              <div class="text-gray-600">Gain de temps annuel</div>
            </div>
            <div>
              <div class="text-4xl font-bold text-orange-primary">{{ savings.costSavings }}€</div>
              <div class="text-gray-600">Économies annuelles</div>
            </div>
          </div>
        </Card>
      </div>
    </Container>
    <Footer />
  </div>
</template>






