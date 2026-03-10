<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { useB2BSimulator } from '@/composables/useB2BSimulator'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const simulator = useB2BSimulator()

const showResults = ref(false)

/**
 * Calculate savings
 */
function calculate() {
  showResults.value = true
}

/**
 * Request quote (redirect to contact)
 */
function requestQuote() {
  const quoteData = simulator.getQuoteData()
  console.log('Quote data:', quoteData)
  router.push({
    path: '/entreprises/contact',
    query: {
      fleet: simulator.fleetSize.value.toString(),
      savings: Math.round(simulator.annualSavings.value).toString()
    }
  })
}

/**
 * Export results as PDF (mock)
 */
function exportPDF() {
  console.log('Export PDF:', simulator.getQuoteData())
  alert('Export PDF en cours de développement')
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <Header />

    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-green-primary to-green-dark text-white py-16">
      <Container>
        <div class="max-w-3xl mx-auto text-center">
          <Icon icon="mdi:calculator" class="w-16 h-16 mx-auto mb-4" />
          <h1 class="text-5xl font-bold mb-4">Calculez vos économies</h1>
          <p class="text-xl">Découvrez combien vous pourriez économiser avec Gomecano sur votre flotte</p>
        </div>
      </Container>
    </section>

    <Container class="py-12">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Inputs -->
        <div>
          <Card class="p-6">
            <h2 class="text-2xl font-bold mb-6">Informations Flotte</h2>

            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de véhicules
                </label>
                <Input
                  v-model.number="simulator.fleetSize.value"
                  type="number"
                  min="1"
                  max="1000"
                  placeholder="10"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Kilométrage moyen par an (par véhicule)
                </label>
                <Input
                  v-model.number="simulator.averageKmPerYear.value"
                  type="number"
                  min="1000"
                  max="100000"
                  placeholder="15000"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Coût maintenance actuel par véhicule/an
                </label>
                <Input
                  v-model.number="simulator.currentMaintenanceCostPerVehicle.value"
                  type="number"
                  min="100"
                  max="5000"
                  placeholder="800"
                />
                <p class="text-xs text-gray-500 mt-1">En euros (€)</p>
              </div>

              <Button variant="primary" size="lg" class="w-full" @click="calculate">
                <Icon icon="mdi:calculator" class="w-5 h-5 mr-2" />
                Calculer mes économies
              </Button>

              <Button variant="ghost" size="sm" class="w-full" @click="simulator.reset()">
                Réinitialiser
              </Button>
            </div>
          </Card>
        </div>

        <!-- Results -->
        <div>
          <Card v-if="!showResults" class="p-6 bg-gray-50">
            <div class="text-center py-12">
              <Icon icon="mdi:chart-line" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p class="text-gray-600">Remplissez le formulaire et calculez vos économies</p>
            </div>
          </Card>

          <div v-else class="space-y-6">
            <!-- Économies Principales -->
            <Card class="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500">
              <div class="text-center mb-6">
                <p class="text-sm font-medium text-gray-700 mb-2">Économies Annuelles</p>
                <div class="text-5xl font-bold text-green-primary mb-1">
                  {{ simulator.totalAnnualSavings.value.toLocaleString() }} €
                </div>
                <p class="text-lg text-green-700">
                  soit {{ simulator.savingsPercent.value }}% d'économies
                </p>
              </div>

              <div class="grid grid-cols-2 gap-4 pt-6 border-t border-green-200">
                <div class="text-center">
                  <p class="text-sm text-gray-600 mb-1">Coût actuel</p>
                  <p class="text-2xl font-bold text-gray-700">
                    {{ simulator.currentAnnualCost.value.toLocaleString() }} €
                  </p>
                </div>
                <div class="text-center">
                  <p class="text-sm text-gray-600 mb-1">Avec Gomecano</p>
                  <p class="text-2xl font-bold text-green-600">
                    {{ simulator.gomecanoAnnualCost.value.toLocaleString() }} €
                  </p>
                </div>
              </div>
            </Card>

            <!-- Détails Économies -->
            <Card class="p-6">
              <h3 class="text-lg font-bold mb-4">Détails des Économies</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center gap-3">
                    <Icon icon="mdi:tools" class="w-5 h-5 text-blue-600" />
                    <span class="text-sm">Maintenance (-30%)</span>
                  </div>
                  <span class="font-bold text-green-600">
                    {{ simulator.annualSavings.value.toLocaleString() }} €/an
                  </span>
                </div>

                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center gap-3">
                    <Icon icon="mdi:clock-alert" class="w-5 h-5 text-orange-600" />
                    <span class="text-sm">Zéro immobilisation</span>
                  </div>
                  <span class="font-bold text-green-600">
                    {{ simulator.downtimeSavings.value.toLocaleString() }} €/an
                  </span>
                </div>

                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center gap-3">
                    <Icon icon="mdi:leaf" class="w-5 h-5 text-green-600" />
                    <span class="text-sm">CO2 économisé</span>
                  </div>
                  <span class="font-bold text-green-600">
                    {{ simulator.co2Savings.value }} kg/an
                  </span>
                </div>

                <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div class="flex items-center gap-3">
                    <Icon icon="mdi:speedometer" class="w-5 h-5 text-blue-600" />
                    <span class="text-sm font-medium">ROI Gomecano</span>
                  </div>
                  <span class="font-bold text-blue-600">
                    {{ simulator.roiMonths.value }} mois
                  </span>
                </div>
              </div>
            </Card>

            <!-- Paiement Mensuel -->
            <Card class="p-6 bg-blue-50 border-2 border-blue-300">
              <div class="text-center">
                <p class="text-sm text-gray-700 mb-2">Paiement Mensuel avec Gomecano</p>
                <div class="text-4xl font-bold text-blue-600 mb-4">
                  {{ simulator.monthlyPaymentGomecano.value.toLocaleString() }} €
                </div>
                <p class="text-sm text-gray-600">
                  Au lieu de {{ Math.round(simulator.currentAnnualCost.value / 12).toLocaleString() }} € actuellement
                </p>
              </div>
            </Card>

            <!-- Actions -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="primary" size="lg" class="w-full" @click="requestQuote">
                <Icon icon="mdi:email" class="w-5 h-5 mr-2" />
                Demander un Devis
              </Button>
              <Button variant="outline" size="lg" class="w-full" @click="exportPDF">
                <Icon icon="mdi:file-pdf" class="w-5 h-5 mr-2" />
                Exporter en PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Avantages -->
      <div class="mt-16">
        <h2 class="text-3xl font-bold text-center mb-8">Pourquoi choisir Gomecano ?</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card class="p-6 text-center">
            <Icon icon="mdi:clock-fast" class="w-12 h-12 mx-auto mb-4 text-green-primary" />
            <h3 class="text-xl font-bold mb-2">Zéro Immobilisation</h3>
            <p class="text-gray-600">Intervention sur site, vos véhicules restent opérationnels</p>
          </Card>

          <Card class="p-6 text-center">
            <Icon icon="mdi:chart-line-variant" class="w-12 h-12 mx-auto mb-4 text-green-primary" />
            <h3 class="text-xl font-bold mb-2">-30% d'Économies</h3>
            <p class="text-gray-600">Prix compétitifs garantis sur tous vos services</p>
          </Card>

          <Card class="p-6 text-center">
            <Icon icon="mdi:clipboard-check" class="w-12 h-12 mx-auto mb-4 text-green-primary" />
            <h3 class="text-xl font-bold mb-2">Reporting Complet</h3>
            <p class="text-gray-600">Dashboard de gestion avec analytics détaillés</p>
          </Card>
        </div>
      </div>
    </Container>

    <Footer />
  </div>
</template>









