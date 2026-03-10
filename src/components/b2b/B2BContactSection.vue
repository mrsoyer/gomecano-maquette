<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import Container from '@/components/layout/Container.vue'
import Button from '@/components/ui/Button.vue'
import Modal from '@/components/ui/Modal.vue'

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

// Modal state for contact form
const isContactModalOpen = ref(false)

const openContactModal = () => {
  isContactModalOpen.value = true
  
  // Load HubSpot form in modal after it opens
  setTimeout(() => {
    const modalFormContainer = document.getElementById('hubspot-form-contact-section-b2b')
    
    // Clear any existing form first
    if (modalFormContainer) {
      modalFormContainer.innerHTML = ''
    }
    
    // Load the form (same as hero button)
    if (window.hbspt) {
      window.hbspt.forms.create({
        portalId: "7697508",
        formId: "7dfca24f-a3be-41a9-ae9a-54fe183e3d84",
        region: "na1",
        target: "#hubspot-form-contact-section-b2b"
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
  <section class="bg-gradient-to-br from-green-primary to-green-dark text-white py-16">
    <Container>
      <div class="text-center max-w-3xl mx-auto">
        <h2 class="text-4xl md:text-5xl font-bold mb-4 text-white">
          Besoin de plus d'infos ?
        </h2>
        <p class="text-lg mb-8">
          Demandez un devis instantané et réservez un mécanicien de confiance 
          pour votre flotte automobile.
        </p>
        
        <!-- CTA Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="tel:0755536208" 
             class="bg-white text-green-primary px-6 py-4 rounded-lg font-bold text-xl
                    hover:bg-gray-100 transition flex items-center justify-center gap-2">
            <Icon icon="mdi:phone" class="text-3xl" />
            07 55 53 62 08
          </a>
          
          <Button variant="secondary" size="lg" class="bg-white text-green-primary hover:bg-gray-100 text-xl px-6 py-5"
                  @click="openContactModal">
            <Icon icon="mdi:message-text" class="mr-2 text-2xl" />
            Formulaire Contact
          </Button>
        </div>
      </div>
    </Container>

    <!-- Modal de contact HubSpot -->
    <Modal 
      v-model="isContactModalOpen" 
      title="Parlons de votre projet"
      size="lg"
    >
      <div class="space-y-4">
        <p class="text-gray-600">
          Remplissez ce formulaire et notre équipe vous recontactera sous 2h pour discuter de la gestion de votre flotte.
        </p>
        <!-- HubSpot Form Container pour la modal de contact -->
        <div id="hubspot-form-contact-section-b2b"></div>
      </div>
    </Modal>
  </section>
</template>
