<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import Container from '@/components/layout/Container.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Modal from '@/components/ui/Modal.vue'
import { processSteps } from '@/mocks/b2b.mock'

const router = useRouter()

// TypeScript declaration for HubSpot
declare global {
  interface Window {
    hbspt?: {
      forms: {
        create: (config: {
          portalId: string
          formId: string
          region: string
          target?: string
        }) => void
      }
    }
  }
}

// Modal state for callback
const isCallbackModalOpen = ref(false)

const openCallbackModal = () => {
  isCallbackModalOpen.value = true
  
  // Load HubSpot form in modal after it opens
  setTimeout(() => {
    const modalFormContainer = document.getElementById('hubspot-form-callback-b2b')
    
    // Clear any existing form first
    if (modalFormContainer) {
      modalFormContainer.innerHTML = ''
    }
    
    // Load the form
    if (window.hbspt) {
      window.hbspt.forms.create({
        portalId: "7697508",
        formId: "4c406423-4447-4d88-8f98-44d506ff63bc",
        region: "na1",
        target: "#hubspot-form-callback-b2b"
      })
    }
  }, 300) // Wait 300ms for modal to be fully rendered
}

// Load HubSpot script on mount
onMounted(() => {
  // Load HubSpot script if not already loaded
  if (!document.querySelector('script[src*="js.hsforms.net"]')) {
    const script = document.createElement('script')
    script.src = '//js.hsforms.net/forms/embed/v2.js'
    script.charset = 'utf-8'
    script.async = true
    document.head.appendChild(script)
  }
})
</script>

<template>
  <section class="bg-gradient-to-br from-green-pale to-white py-20">
    <Container>
      <!-- Header optimisé pour la conversion -->
      <div class="text-center mb-4">
        <div class="inline-block bg-green-primary/10 text-green-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
          ✓ Déjà +150 flottes nous font confiance
        </div>
        <h2 class="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
          3 étapes pour réduire vos coûts d'entretien de 30%
        </h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
          Maintenez vos équipes et vos véhicules dans un état optimal grâce à notre service, évitant ainsi la nécessité de se rendre chez un garagiste, nous venons à vous ! Ce qui représente à la fois des économies de temps et d'argent.
        </p>
      </div>
      
      <!-- Étapes avec design orienté conversion -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
        <Card v-for="(step, index) in processSteps" :key="index" 
              class="relative overflow-hidden border-2 border-transparent hover:border-green-primary transition-all duration-300 hover:shadow-xl">
          <!-- Badge numéro -->
          <div class="absolute top-3 right-3 w-9 h-9 bg-green-primary text-white rounded-full flex items-center justify-center font-bold text-base">
            {{ index + 1 }}
          </div>
          
          <div class="text-center pt-2">
            <!-- Icône Iconify en bleu-primary -->
            <div class="flex justify-center mb-4">
              <Icon :icon="step.icon" class="w-14 h-14 lg:w-20 lg:h-20 text-blue-primary" />
            </div>
            
            <!-- Titre orienté bénéfice -->
            <h3 class="text-lg lg:text-2xl font-bold mb-4 lg:mb-6 text-gray-900 px-2 lg:px-4">
              {{ step.title }}
            </h3>
            
            <!-- Liste des bénéfices -->
            <ul class="space-y-2 lg:space-y-3 text-left px-2">
              <li v-for="item in step.items" :key="item" 
                  class="flex items-start gap-2 group">
                <Icon icon="mdi:check-circle" 
                      class="w-5 h-5 lg:w-6 lg:h-6 text-green-primary mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span class="text-sm lg:text-base text-gray-700 font-medium">{{ item }}</span>
              </li>
            </ul>
          </div>
        </Card>
      </div>

      <!-- Badges de réassurance -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <div class="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
          <Icon icon="mdi:clock-fast" class="w-10 h-10 text-green-primary mb-2" />
          <div class="text-2xl font-bold text-gray-900">24h</div>
          <div class="text-sm text-gray-600 text-center">Délai d'intervention</div>
        </div>
        <div class="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
          <Icon icon="mdi:currency-eur-off" class="w-10 h-10 text-green-primary mb-2" />
          <div class="text-2xl font-bold text-gray-900">-30%</div>
          <div class="text-sm text-gray-600 text-center">Économies moyennes</div>
        </div>
        <div class="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
          <Icon icon="mdi:shield-check" class="w-10 h-10 text-green-primary mb-2" />
          <div class="text-2xl font-bold text-gray-900">100%</div>
          <div class="text-sm text-gray-600 text-center">Garanties préservées</div>
        </div>
        <div class="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
          <Icon icon="mdi:car-multiple" class="w-10 h-10 text-green-primary mb-2" />
          <div class="text-2xl font-bold text-gray-900">+150</div>
          <div class="text-sm text-gray-600 text-center">Flottes clientes</div>
        </div>
      </div>

      <!-- CTA optimisé pour la conversion -->
      <div class="bg-gradient-to-r from-green-primary to-green-dark rounded-2xl p-8 md:p-12 text-center text-white shadow-xl">
        <h3 class="text-3xl md:text-4xl font-bold mb-4">
          Prêt à optimiser la gestion de votre flotte ?
        </h3>
        <p class="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
          Obtenez un devis personnalisé en 2 minutes et découvrez combien vous pourriez économiser
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="secondary" 
            size="lg" 
            class="bg-white text-green-primary hover:bg-gray-100 px-8 py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
            @click="router.push('/gestion-flottes-automobiles-sur-site/simulateur')"
          >
            <Icon icon="mdi:calculator" class="w-6 h-6 mr-2" />
            Calculer mes économies
          </Button>
          <Button 
            variant="secondary" 
            size="lg" 
            class="bg-transparent text-white border-2 border-white hover:bg-white/10 px-8 py-4 text-lg font-bold"
            @click="openCallbackModal"
          >
            <Icon icon="mdi:phone" class="w-6 h-6 mr-2" />
            Être rappelé
          </Button>
        </div>
        <!-- Élément de réassurance supplémentaire -->
        <p class="text-base text-white/80 mt-6">
          ✓ Sans engagement • ✓ Réponse sous 2h • ✓ Devis gratuit
        </p>
      </div>
    </Container>

    <!-- Modal de rappel HubSpot -->
    <Modal 
      v-model="isCallbackModalOpen" 
      title="Demande de rappel"
      size="lg"
    >
      <div class="space-y-4">
        <p class="text-gray-600">
          Remplissez ce formulaire et notre équipe vous rappellera dans les meilleurs délais pour discuter de vos besoins.
        </p>
        <!-- HubSpot Form Container pour la modal de rappel -->
        <div id="hubspot-form-callback-b2b"></div>
      </div>
    </Modal>
  </section>
</template>
