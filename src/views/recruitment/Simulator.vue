<script setup lang="ts">
import { ref, computed } from 'vue'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Inputs
const hoursPerWeek = ref(20)
const avgPricePerHour = ref(60)
const nbInterventionsPerMonth = ref(40)

// Paramètres Gomecano
const COMMISSION_RATE = 0.15 // 15%
const SOCIAL_CHARGES_RATE = 0.22 // 22% micro-entreprise

// Calculs détaillés
const monthlyRevenueGross = computed(() =>
  hoursPerWeek.value * 4 * avgPricePerHour.value
)

const monthlyRevenueFromInterventions = computed(() =>
  nbInterventionsPerMonth.value * avgPricePerHour.value * 2 // ~2h par intervention
)

const commission = computed(() =>
  monthlyRevenueGross.value * COMMISSION_RATE
)

const socialCharges = computed(() =>
  monthlyRevenueGross.value * SOCIAL_CHARGES_RATE
)

const monthlyRevenueNet = computed(() =>
  monthlyRevenueGross.value - commission.value - socialCharges.value
)

const yearlyRevenueNet = computed(() =>
  monthlyRevenueNet.value * 12
)

// Comparaison garage traditionnel
const garageMonthlyNetSalary = 1800 // Salaire moyen mécanicien garage
const gainVsGarage = computed(() =>
  monthlyRevenueNet.value - garageMonthlyNetSalary
)

const percentGainVsGarage = computed(() =>
  Math.round((gainVsGarage.value / garageMonthlyNetSalary) * 100)
)
</script>

<template>
  <div class="min-h-screen bg-white">
    <Header />
    <Container class="py-12">
      <h1 class="text-4xl font-bold mb-8">Simulateur de revenus</h1>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Inputs -->
        <Card>
          <h2 class="text-2xl font-bold mb-6">Votre activité</h2>
          <div class="space-y-4">
            <div>
              <Input
                v-model.number="hoursPerWeek"
                label="Heures / semaine"
                type="number"
                min="10"
                max="60"
              />
              <p class="text-sm text-gray-500 mt-1">Entre 10 et 60 heures</p>
            </div>

            <div>
              <Input
                v-model.number="avgPricePerHour"
                label="Prix moyen / heure (€)"
                type="number"
                min="30"
                max="100"
              />
              <p class="text-sm text-gray-500 mt-1">Tarif horaire moyen : 50-80€</p>
            </div>

            <div>
              <Input
                v-model.number="nbInterventionsPerMonth"
                label="Interventions / mois"
                type="number"
                min="10"
                max="100"
              />
              <p class="text-sm text-gray-500 mt-1">Nombre d'interventions estimées</p>
            </div>
          </div>
        </Card>

        <!-- Résultats -->
        <Card>
          <h2 class="text-2xl font-bold mb-6">Vos revenus estimés</h2>

          <div class="mb-6">
            <div class="text-sm text-gray-600 mb-1">Revenu brut mensuel</div>
            <div class="text-3xl font-bold text-gray-800">
              {{ monthlyRevenueGross.toFixed(0) }}€
            </div>
          </div>

          <div class="space-y-2 mb-6 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Commission Gomecano (15%)</span>
              <span class="text-red-600">-{{ commission.toFixed(0) }}€</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Charges sociales (22%)</span>
              <span class="text-red-600">-{{ socialCharges.toFixed(0) }}€</span>
            </div>
          </div>

          <div class="border-t pt-4">
            <div class="text-sm text-gray-600 mb-1">Revenu net mensuel</div>
            <div class="text-5xl font-bold text-orange-primary mb-2">
              {{ monthlyRevenueNet.toFixed(0) }}€
            </div>
            <div class="text-gray-600">{{ yearlyRevenueNet.toFixed(0) }}€ / an</div>
          </div>
        </Card>
      </div>

      <!-- Comparaison garage -->
      <Card class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Comparaison avec un garage traditionnel</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div class="text-sm text-gray-600 mb-1">Salaire garage moyen</div>
            <div class="text-2xl font-bold text-gray-800">{{ garageMonthlyNetSalary }}€/mois</div>
          </div>
          <div>
            <div class="text-sm text-gray-600 mb-1">Votre gain avec Gomecano</div>
            <div class="text-2xl font-bold text-green-600">
              +{{ gainVsGarage.toFixed(0) }}€/mois
              <span class="text-lg">({{ percentGainVsGarage > 0 ? '+' : '' }}{{ percentGainVsGarage }}%)</span>
            </div>
          </div>
        </div>

        <div v-if="gainVsGarage > 0" class="mt-6 p-4 bg-green-50 rounded-lg">
          <p class="text-green-700 font-semibold">
            💰 Vous gagnez {{ percentGainVsGarage }}% de plus qu'en garage !
          </p>
        </div>
      </Card>

      <!-- CTA -->
      <div class="text-center">
        <Button
          variant="primary"
          size="lg"
          @click="router.push('/devenir-mecanicien/candidature')"
        >
          Postuler maintenant
        </Button>
      </div>
    </Container>
    <Footer />
  </div>
</template>









