<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { mockServices, getRecommendedServices } from '@/mocks/services'
import { mockTestimonials } from '@/mocks/testimonials'
import { useMousePosition } from '@/composables/useMousePosition'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'
import Avatar from '@/components/ui/Avatar.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import TrustSignalsSection from '@/components/sections/TrustSignalsSection.vue'
import FaqSection from '@/components/sections/FaqSection.vue'
import CtaIntermediateSection from '@/components/sections/CtaIntermediateSection.vue'
import BookingAccordionModal from '@/components/booking/BookingAccordionModal.vue'

const router = useRouter()

// Mouse position for spotlight effect (0.04 = plus de retard fluide)
const { x: mouseX, y: mouseY } = useMousePosition(0.04)

// Booking form data
const licensePlate = ref('')
const selectedService = ref('')
const selectedCity = ref('')
const isPlateValid = ref(false)

// Modal state
const isFormExpanded = ref(false)

// Auto-format license plate
const formatLicensePlate = () => {
  let value = licensePlate.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  
  if (value.length > 2) {
    value = value.substring(0, 2) + '-' + value.substring(2)
  }
  if (value.length > 6) {
    value = value.substring(0, 6) + '-' + value.substring(6)
  }
  if (value.length > 9) {
    value = value.substring(0, 9)
  }
  
  licensePlate.value = value
  isPlateValid.value = value.length >= 9
}

const popularServices = [
  { value: 'vidange', label: 'Vidange + Filtre', icon: 'mdi:oil' },
  { value: 'freins', label: 'Freins (Plaquettes)', icon: 'mdi:car-brake-abs' },
  { value: 'revision', label: 'Révision complète', icon: 'mdi:wrench' },
  { value: 'diagnostic', label: 'Diagnostic', icon: 'mdi:chart-line' },
  { value: 'batterie', label: 'Batterie', icon: 'mdi:car-battery' },
  { value: 'climatisation', label: 'Climatisation', icon: 'mdi:snowflake' },
  { value: 'pneus', label: 'Pneus', icon: 'mdi:car-tire-alert' },
]

const cities = [
  { value: 'paris', label: 'Paris' },
  { value: 'marseille', label: 'Marseille' },
  { value: 'lyon', label: 'Lyon' },
  { value: 'toulouse', label: 'Toulouse' },
  { value: 'bordeaux', label: 'Bordeaux' },
]

const canSubmit = computed(() => {
  return licensePlate.value.length >= 7 && selectedService.value && selectedCity.value
})

// Open accordion modal
const openFormAccordion = () => {
  isFormExpanded.value = true
}

// Close accordion modal
const closeFormAccordion = () => {
  isFormExpanded.value = false
}

// Handle form submission from modal
const handleModalSubmit = () => {
  if (canSubmit.value) {
    router.push({
      name: 'booking-service',
      query: {
        plate: licensePlate.value,
        service: selectedService.value,
        city: selectedCity.value,
      },
    })
  }
}

const scrollToForm = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const recommendedServices = getRecommendedServices().slice(0, 6)
const clientTestimonials = mockTestimonials
  .filter(t => t.userId.startsWith('user-'))
  .slice(0, 3)

// Avatar URLs from Pravatar
const avatarUrls = [
  'https://i.pravatar.cc/150?img=12',
  'https://i.pravatar.cc/150?img=47',
  'https://i.pravatar.cc/150?img=33',
]

const howItWorks = [
  {
    number: '01',
    title: 'Votre véhicule',
    description: 'Plaque d\'immatriculation ou carte grise',
    icon: 'mdi:car',
  },
  {
    number: '02',
    title: 'Votre besoin',
    description: 'Prix instantané pour 80% des services',
    icon: 'mdi:wrench',
  },
  {
    number: '03',
    title: 'Votre rendez-vous',
    description: 'Où et quand vous voulez',
    icon: 'mdi:calendar',
  },
  {
    number: '04',
    title: 'On s\'occupe de tout',
    description: 'Intervention pro à domicile',
    icon: 'mdi:check-circle',
  },
]

const stats = [
  { value: '15 000+', label: 'Clients satisfaits' },
  { value: '4,9/5', label: 'Note moyenne' },
  { value: '50 000+', label: 'Interventions' },
  { value: '200+', label: 'Mécaniciens certifiés' },
]

const advantages = [
  {
    icon: 'mdi:home',
    title: 'À domicile ou au bureau',
    description: 'Le mécanicien vient où vous voulez',
  },
  {
    icon: 'mdi:clock',
    title: 'RDV 7j/7',
    description: 'Disponible même le week-end',
  },
  {
    icon: 'mdi:cash',
    title: 'Prix transparents',
    description: 'Devis gratuit et sans engagement',
  },
  {
    icon: 'mdi:check-circle',
    title: 'Garantie 24 mois',
    description: 'Pièces et main d\'œuvre',
  },
]
</script>

<template>
  <div class="min-h-screen bg-white">
    <Header />
    
    <!-- Hero Section avec Formulaire Intégré + Photo réelle -->
    <section class="relative text-white overflow-hidden min-h-[70vh] md:min-h-[80vh]">
      <!-- Photo de fond (mécanicien Gomecano - FULL WIDTH sans zoom) -->
      <div class="absolute inset-0 flex items-start justify-center bg-gray-900 z-0">
        <img 
          src="/images/hero-mechanic.jpg" 
          alt="Mécanicien Gomecano en intervention à domicile"
          class="w-full h-auto object-contain"
          loading="eager"
          fetchpriority="high"
        />
      </div>
      
      <!-- Fond blanc sous la vague -->
      <div class="absolute bottom-0 left-0 right-0 h-[25%] bg-white z-10"></div>
      
      <!-- Overlay gradient bleu par-dessus la photo -->
      <div class="absolute inset-0 bg-gradient-to-br from-blue-dark/90 via-blue-primary/85 to-blue-light/80 z-5"></div>
      
      <!-- Background Pattern avec effets lumineux -->
      <div class="absolute inset-0 z-5">
        <!-- Spotlight effet qui suit la souris -->
        <div 
          class="absolute inset-0 opacity-30 transition-opacity duration-300 pointer-events-none"
          :style="{
            background: `radial-gradient(circle 700px at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.25), transparent 60%)`
          }"
        ></div>
        
        <!-- Effets lumineux glassmorphism (réduits pour ne pas masquer la photo) -->
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-20 left-10 w-96 h-96 bg-white/40 rounded-full blur-3xl animate-pulse-slow"></div>
          <div class="absolute bottom-20 right-10 w-[600px] h-[600px] bg-orange-primary/40 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
        </div>
      </div>
      
      <Container class="relative py-6 md:py-12 z-30">
        <div class="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <!-- Left: Content (aligné en haut) -->
          <div class="space-y-4 md:space-y-6 z-30">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-orange-light border border-orange-primary rounded-full text-sm font-semibold text-orange-dark">
              <span class="inline-block w-2 h-2 bg-orange-primary rounded-full animate-pulse"></span>
              Prix instantanés • Sans engagement
            </div>
            
            <h1 class="text-4xl md:text-6xl font-bold leading-tight">
              Le garage vient à vous,
              <span class="text-orange-primary">sans frais</span>
            </h1>
            
            <p class="text-lg md:text-xl text-blue-pale max-w-xl">
              Devis gratuit et RDV immédiat.<br>
              Réparation et entretien automobile directement chez vous ou au bureau.
            </p>
            
            <!-- Stats Mini avec effet glass (compact sur mobile) -->
            <div class="grid grid-cols-2 md:flex md:flex-wrap gap-4 md:gap-6 pt-2">
              <div class="flex items-center gap-2 md:gap-3 group">
                <div class="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white/15">
                  <Icon icon="mdi:star" class="w-8 h-8 text-orange-primary" />
                </div>
                <div>
                  <div class="font-bold text-xl md:text-2xl text-orange-primary">4,9/5</div>
                  <div class="text-xs md:text-sm text-blue-pale">15 000+ avis</div>
                </div>
              </div>
              <div class="flex items-center gap-2 md:gap-3 group">
                <div class="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white/15">
                  <Icon icon="mdi:account-wrench" class="w-8 h-8 text-orange-primary" />
                </div>
                <div>
                  <div class="font-bold text-xl md:text-2xl text-orange-primary">200+</div>
                  <div class="text-xs md:text-sm text-blue-pale">Mécaniciens pros</div>
                </div>
              </div>
            </div>
            
          </div>
          
          <!-- Right: Booking Form (AU-DESSUS de la vague) -->
          <div class="relative animate-scale-in z-40">
            <!-- Badge Promo Orange (Floating - adapté mobile) -->
            <div class="absolute -top-3 -right-2 md:-top-4 md:-right-4 bg-gradient-to-r from-orange-primary to-orange-hover text-white px-3 py-1.5 md:px-6 md:py-3 rounded-full shadow-xl md:shadow-2xl transform rotate-6 md:rotate-12 z-10 animate-wiggle">
              <div class="text-[10px] md:text-sm font-bold flex items-center gap-1 md:gap-2">
                <span class="whitespace-nowrap">-30% 1ère résa !</span>
                <Icon icon="mdi:party-popper" class="w-3 h-3 md:w-5 md:h-5 animate-bounce" />
              </div>
            </div>
            
            <!-- Card avec effet glassmorphism - CLIQUABLE -->
            <div 
              @click="openFormAccordion"
              class="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-3 md:p-4 border border-white/20 cursor-pointer hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] group"
            >
              <div class="flex items-center gap-2 mb-2 pointer-events-none">
                <div class="relative w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-orange-primary to-orange-hover flex items-center justify-center shadow-md animate-pulse-glow">
                  <Icon icon="mdi:lightning-bolt" class="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h2 class="text-lg md:text-xl font-bold text-gray-900">
                    <span class="text-orange-primary">Devis gratuit</span> en 2 min
                  </h2>
                  <p class="text-xs md:text-sm text-gray-600">Réponse en 30 secondes</p>
                </div>
              </div>
              
              <div class="space-y-2">
                <!-- Étape 1 : Service -->
                <div class="animate-slide-in-up animation-delay-100">
                  <div class="flex items-center gap-2">
                    <!-- Badge numéroté -->
                    <div class="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#2f6883] flex items-center justify-center text-white font-bold text-sm shadow-md pointer-events-none">
                      1
                    </div>
                    <!-- Fake Select (div qui ressemble à un select) -->
                    <div class="flex-1">
                      <div class="w-full text-center font-semibold text-sm h-9 md:h-10 px-3 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-[#2f6883] hover:shadow-md transition-all bg-white flex items-center justify-center text-gray-900">
                        Votre besoin ?
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Étape 2 : Ville -->
                <div class="animate-slide-in-up animation-delay-200">
                  <div class="flex items-center gap-2">
                    <!-- Badge numéroté -->
                    <div class="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#2f6883] flex items-center justify-center text-white font-bold text-sm shadow-md pointer-events-none">
                      2
                    </div>
                    <!-- Fake Select (div qui ressemble à un select) -->
                    <div class="flex-1">
                      <div class="w-full text-center font-semibold text-sm h-9 md:h-10 px-3 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-[#2f6883] hover:shadow-md transition-all bg-white flex items-center justify-center text-gray-900">
                        Votre ville ?
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Étape 3 : Voiture -->
                <div class="animate-slide-in-up animation-delay-300">
                  <div class="flex items-center gap-2">
                    <!-- Badge numéroté -->
                    <div class="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#2f6883] flex items-center justify-center text-white font-bold text-sm shadow-md pointer-events-none">
                      3
                    </div>
                    <!-- Fake Input (div qui ressemble à un input) -->
                    <div class="flex-1">
                      <div class="w-full text-center font-semibold text-sm h-9 md:h-10 px-3 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-[#2f6883] hover:shadow-md transition-all bg-white flex items-center justify-center text-gray-900">
                        Votre voiture ?
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- CTA Button -->
                <div class="pt-1.5">
                  <button
                    type="button"
                    tabindex="-1"
                    @click.prevent="openFormAccordion"
                    class="w-full px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl font-bold text-base md:text-lg text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group focus:outline-none bg-[#29c99e] hover:bg-[#2fecba] hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/50"
                    aria-label="Obtenir un devis gratuit en 2 minutes"
                  >
                    <span>VOIR LES TARIFS</span>
                    <span class="transition-transform text-lg md:text-xl group-hover:translate-x-1" aria-hidden="true">→</span>
                  </button>
                  
                  <!-- Trust indicators (compacts sur mobile) -->
                  <div class="flex flex-wrap items-center justify-center gap-1.5 md:gap-3 mt-2 md:mt-3 text-[10px] md:text-xs text-gray-600">
                    <span class="flex items-center gap-0.5 md:gap-1">
                      <Icon icon="mdi:check" class="w-3 h-3 md:w-4 md:h-4 text-orange-primary" />
                      <span class="whitespace-nowrap">Sans engagement</span>
                    </span>
                    <span class="text-gray-300">•</span>
                    <span class="flex items-center gap-0.5 md:gap-1">
                      <Icon icon="mdi:check" class="w-3 h-3 md:w-4 md:h-4 text-orange-primary" />
                      <span class="whitespace-nowrap">Réponse en 30s</span>
                    </span>
                    <span class="text-gray-300">•</span>
                    <span class="flex items-center gap-0.5 md:gap-1">
                      <Icon icon="mdi:check" class="w-3 h-3 md:w-4 md:h-4 text-orange-primary" />
                      <span class="whitespace-nowrap">Garantie 1 an</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Bottom security note (compact sur mobile) -->
              <div class="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-gray-100">
                <p class="text-[10px] md:text-xs text-center text-gray-600 flex items-center justify-center gap-1 md:gap-2">
                  <span class="text-xs md:text-sm">🔒</span>
                  <span>Vos données sont sécurisées et ne seront jamais partagées</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
      
      <!-- Wave divider (coupe la photo, blanc en dessous) -->
      <div class="absolute bottom-[15%] md:bottom-[20%] left-0 right-0 z-20 pointer-events-none">
        <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
          <path fill="#ffffff" d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
        </svg>
      </div>
    </section>
    
    <!-- LIGHTBOX ACCORDION FORMULAIRE (Composant séparé) -->
    <BookingAccordionModal
      :is-open="isFormExpanded"
      v-model:license-plate="licensePlate"
      v-model:selected-service="selectedService"
      v-model:selected-city="selectedCity"
      @close="closeFormAccordion"
      @submit="handleModalSubmit"
    />
    
    <!-- Trust Signals / USP (optimisé) -->
    <TrustSignalsSection />
    
    <!-- Témoignages (repositionné en #3 pour social proof) -->
    <section class="py-16 md:py-24 bg-gradient-to-br from-white via-orange-light/20 to-blue-pale/20">
      <Container>
        <div class="text-center mb-12">
          <span class="text-sm uppercase tracking-wide text-orange-primary font-bold mb-2 block">
            ILS NOUS FONT CONFIANCE
          </span>
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Les avis de nos clients
          </h2>
          <div class="h-1 w-20 bg-gradient-to-r from-orange-primary to-orange-hover mx-auto mb-6"></div>
          <div class="flex items-center justify-center gap-4">
            <img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_74x24dp.png" alt="Google" class="h-6" />
            <div class="flex items-center gap-2">
              <div class="flex gap-1">
                <span class="text-orange-primary text-xl">★★★★★</span>
              </div>
              <span class="text-gray-600 font-semibold">4,9/5 • Excellent</span>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="testimonial in clientTestimonials"
            :key="testimonial.id"
            class="group bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-100 hover:border-orange-primary"
          >
            <!-- Rating Stars -->
            <div class="flex gap-1 mb-4">
              <span
                v-for="i in 5"
                :key="i"
                class="text-2xl"
                :class="i <= testimonial.rating ? 'text-orange-primary' : 'text-gray-200'"
              >
                ★
              </span>
            </div>
            
            <!-- Title -->
            <h3 class="font-bold text-gray-900 mb-2">{{ testimonial.serviceName }}</h3>
            
            <!-- Testimonial Text -->
            <p class="text-gray-700 mb-6 italic leading-relaxed text-sm">
              {{ testimonial.comment }}
            </p>
            
            <!-- Author Info -->
            <div class="flex items-center gap-3 pt-4 border-t border-gray-100">
              <div class="relative">
                <img 
                  :src="avatarUrls[clientTestimonials.indexOf(testimonial)]" 
                  :alt="`Avatar de ${testimonial.userName}`"
                  class="w-12 h-12 rounded-full object-cover ring-2 ring-orange-primary/20"
                  loading="lazy"
                />
                <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-primary rounded-full border-2 border-white flex items-center justify-center">
                  <span class="text-white text-xs">✓</span>
                </div>
              </div>
              <div class="flex-1">
                <div class="font-bold text-gray-900">{{ testimonial.userName }}</div>
                <div class="text-sm text-gray-600">Client vérifié</div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
    
    <!-- Services populaires (avec prix) -->
    <section class="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white">
      <Container>
        <div class="text-center mb-12">
          <span class="text-sm uppercase tracking-wide text-orange-primary font-bold mb-2 block">
            NOS PRESTATIONS
          </span>
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Services les plus demandés
          </h2>
          <div class="h-1 w-20 bg-gradient-to-r from-orange-primary to-orange-hover mx-auto mb-4"></div>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Tarifs transparents, tout compris (main d'œuvre + pièces)
          </p>
        </div>
        
        <!-- Cartes services populaires avec prix -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <!-- Vidange -->
          <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-100 hover:border-orange-primary group">
            <div class="flex items-start justify-between mb-4">
              <Icon icon="mdi:oil" class="w-16 h-16 text-blue-primary" />
              <span class="bg-orange-light text-orange-primary text-xs font-bold px-3 py-1 rounded-full">POPULAIRE</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Vidange complète</h3>
            <p class="text-sm text-gray-600 mb-4">Huile moteur + filtre à huile</p>
            <div class="mb-4">
              <div class="text-3xl font-bold text-orange-primary">À partir de 89€</div>
              <div class="text-sm text-gray-500">selon véhicule</div>
            </div>
            <button 
              @click="openFormAccordion"
              class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-primary hover:bg-orange-hover text-white font-semibold rounded-lg shadow-sm transition-all"
            >
              <Icon icon="mdi:lightning-bolt" class="w-4 h-4" />
              <span class="text-sm">Devis gratuit en 2 minutes</span>
            </button>
          </div>
          
          <!-- Freins -->
          <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-100 hover:border-orange-primary group">
            <div class="flex items-start justify-between mb-4">
              <Icon icon="mdi:car-brake-abs" class="w-16 h-16 text-red-500" />
              <span class="bg-orange-light text-orange-primary text-xs font-bold px-3 py-1 rounded-full">POPULAIRE</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Plaquettes de freins</h3>
            <p class="text-sm text-gray-600 mb-4">Essieu avant ou arrière</p>
            <div class="mb-4">
              <div class="text-3xl font-bold text-orange-primary">À partir de 120€</div>
              <div class="text-sm text-gray-500">selon véhicule</div>
            </div>
            <button 
              @click="openFormAccordion"
              class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-primary hover:bg-orange-hover text-white font-semibold rounded-lg shadow-sm transition-all"
            >
              <Icon icon="mdi:lightning-bolt" class="w-4 h-4" />
              <span class="text-sm">Devis gratuit en 2 minutes</span>
            </button>
          </div>
          
          <!-- Révision -->
          <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-100 hover:border-orange-primary group">
            <div class="flex items-start justify-between mb-4">
              <Icon icon="mdi:wrench" class="w-16 h-16 text-blue-primary" />
              <span class="bg-orange-light text-orange-primary text-xs font-bold px-3 py-1 rounded-full">POPULAIRE</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Révision complète</h3>
            <p class="text-sm text-gray-600 mb-4">Contrôle + vidange + filtres</p>
            <div class="mb-4">
              <div class="text-3xl font-bold text-orange-primary">À partir de 150€</div>
              <div class="text-sm text-gray-500">selon véhicule</div>
            </div>
            <button 
              @click="openFormAccordion"
              class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-primary hover:bg-orange-hover text-white font-semibold rounded-lg shadow-sm transition-all"
            >
              <Icon icon="mdi:lightning-bolt" class="w-4 h-4" />
              <span class="text-sm">Devis gratuit en 2 minutes</span>
            </button>
          </div>
        </div>
        
        <!-- Autres services (liste compacte) -->
        <div class="bg-white rounded-2xl p-8 shadow-md">
          <h3 class="text-xl font-bold text-gray-900 mb-6 text-center">+ de 30 autres services disponibles</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-6">
            <div class="flex items-center gap-2 text-gray-700">
              <span class="text-orange-primary">•</span>
              <span>Batterie</span>
            </div>
            <div class="flex items-center gap-2 text-gray-700">
              <span class="text-orange-primary">•</span>
              <span>Climatisation</span>
            </div>
            <div class="flex items-center gap-2 text-gray-700">
              <span class="text-orange-primary">•</span>
              <span>Pneus</span>
            </div>
            <div class="flex items-center gap-2 text-gray-700">
              <span class="text-orange-primary">•</span>
              <span>Diagnostic</span>
            </div>
            <div class="flex items-center gap-2 text-gray-700">
              <span class="text-orange-primary">•</span>
              <span>Échappement</span>
            </div>
            <div class="flex items-center gap-2 text-gray-700">
              <span class="text-orange-primary">•</span>
              <span>Amortisseurs</span>
            </div>
            <div class="flex items-center gap-2 text-gray-700">
              <span class="text-orange-primary">•</span>
              <span>Embrayage</span>
            </div>
            <div class="flex items-center gap-2 text-gray-700">
              <span class="text-orange-primary">•</span>
              <span>Géométrie</span>
            </div>
          </div>
          <div class="text-center">
            <button
              @click="scrollToForm"
              class="inline-flex items-center gap-2 px-8 py-3 bg-orange-primary hover:bg-orange-hover text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg group"
            >
              <span>Voir tous nos services</span>
              <span class="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>
      </Container>
    </section>
    
    <!-- Section Recrutement -->
    <section class="py-16 bg-gradient-to-r from-blue-primary to-blue-dark text-white">
      <Container>
        <div class="text-center max-w-3xl mx-auto">
          <h2 class="text-3xl md:text-4xl font-bold mb-6">
            Vous êtes mécanicien à votre compte<br>
            ou vous souhaitez l'être ?
          </h2>
          <p class="text-lg text-blue-pale mb-8">
            Exercez votre expertise dans un cadre moderne et flexible. Rejoignez le réseau GOMECANO et profitez 
            d'un accompagnement complet, d'outils professionnels fournis et d'une clientèle qualifiée.
          </p>
          <button
            class="inline-flex items-center gap-2 px-8 py-4 bg-orange-primary hover:bg-orange-hover text-white font-bold rounded-lg shadow-xl hover:shadow-orange-500/50 hover:-translate-y-1 transition-all group"
          >
            <span>Toutes les informations par ici</span>
            <span class="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </Container>
    </section>
    
    <!-- Comment ça marche ? (fusionné + optimisé) -->
    <section class="py-16 md:py-24 bg-white">
      <Container>
        <div class="text-center mb-12">
          <span class="text-sm uppercase tracking-wide text-orange-primary font-bold mb-2 block">
            SIMPLE ET RAPIDE
          </span>
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Comment ça marche ?
          </h2>
          <div class="h-1 w-20 bg-gradient-to-r from-orange-primary to-orange-hover mx-auto mb-4"></div>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            <strong>GOMECANO.com</strong> est un service de réparation automobile complet, sans frais de déplacement. 
            Réservation en 3 clics pour un RDV avec un mécanicien qualifié à l'adresse que VOUS choisissez.
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <!-- Step 1 -->
          <div class="text-center group">
            <div class="mb-6">
              <div class="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-2xl bg-orange-light border-2 border-orange-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span class="text-5xl md:text-6xl">📋</span>
              </div>
              <div class="text-6xl md:text-7xl font-bold text-orange-primary mb-2">01</div>
            </div>
            <h3 class="text-xl font-bold mb-3 text-gray-900">Choisissez votre service</h3>
            <p class="text-gray-600">
              Saisissez votre immatriculation, indiquez votre besoin. <strong class="text-gray-900">Devis gratuit en 30 secondes !</strong>
            </p>
          </div>
          
          <!-- Step 2 -->
          <div class="text-center group">
            <div class="mb-6">
              <div class="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-2xl bg-orange-light border-2 border-orange-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icon icon="mdi:calendar" class="w-16 h-16 text-orange-primary" />
              </div>
              <div class="text-6xl md:text-7xl font-bold text-orange-primary mb-2">02</div>
            </div>
            <h3 class="text-xl font-bold mb-3 text-gray-900">Réservez votre créneau</h3>
            <p class="text-gray-600">
              Choisissez la date, l'heure et le lieu (domicile ou bureau). Votre Gomécanicien vient à vous !
            </p>
          </div>
          
          <!-- Step 3 -->
          <div class="text-center group">
            <div class="mb-6">
              <div class="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-2xl bg-green-pale border-2 border-green-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icon icon="mdi:check-circle" class="w-16 h-16 text-green-primary" />
              </div>
              <div class="text-6xl md:text-7xl font-bold text-orange-primary mb-2">03</div>
            </div>
            <h3 class="text-xl font-bold mb-3 text-gray-900">C'est terminé !</h3>
            <p class="text-gray-600">
              Intervention réalisée, carnet tamponné, <strong class="text-gray-900">garantie 1 an incluse</strong>. Repartez sereinement !
            </p>
          </div>
        </div>
      </Container>
    </section>
    
    <!-- Chiffres clés / Impact (Effet WAHOU optimisé) -->
    <section class="py-16 md:py-24 bg-gradient-to-br from-blue-dark to-blue-primary text-white relative overflow-hidden">
      <!-- Motif décoratif en arrière-plan -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>
      
      <Container class="relative z-10">
        <div class="text-center mb-12">
          <div class="inline-block bg-orange-primary/90 backdrop-blur-sm px-6 py-2 rounded-full text-sm font-bold mb-4 animate-pulse flex items-center gap-2">
            <Icon icon="mdi:party-popper" class="w-5 h-5" />
            EFFET WAHOU !
          </div>
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Des chiffres qui parlent d'eux-mêmes
          </h2>
          <div class="h-1 w-20 bg-orange-primary mx-auto"></div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Stat 1 -->
          <div class="text-center group">
            <div class="text-6xl md:text-7xl font-black mb-2 text-orange-primary drop-shadow-lg">
              15k+
            </div>
            <div class="text-xl font-semibold text-white">Clients satisfaits</div>
            <div class="text-sm text-blue-pale mt-1">depuis 2018</div>
          </div>
          
          <!-- Stat 2 -->
          <div class="text-center group">
            <div class="text-6xl md:text-7xl font-black mb-2 text-orange-primary drop-shadow-lg">
              200+
            </div>
            <div class="text-xl font-semibold text-white">Mécaniciens certifiés</div>
            <div class="text-sm text-blue-pale mt-1">partout en France</div>
          </div>
          
          <!-- Stat 3 -->
          <div class="text-center group">
            <div class="text-6xl md:text-7xl font-black mb-2 text-orange-primary drop-shadow-lg">
              4,9/5
            </div>
            <div class="text-xl font-semibold text-white">Note moyenne</div>
            <div class="text-sm text-blue-pale mt-1">sur Google Reviews</div>
          </div>
          
          <!-- Stat 4 -->
          <div class="text-center group">
            <div class="text-6xl md:text-7xl font-black mb-2 text-orange-primary drop-shadow-lg">
              -30%
            </div>
            <div class="text-xl font-semibold text-white">Économies moyennes</div>
            <div class="text-sm text-blue-pale mt-1">vs garage traditionnel</div>
          </div>
        </div>
        
        <!-- CTA secondaire -->
        <div class="text-center mt-12">
          <button
            @click="scrollToForm"
            class="inline-flex items-center gap-2 px-10 py-4 bg-orange-primary hover:bg-orange-hover text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-orange-500/50 hover:-translate-y-1 transition-all group"
          >
            <span>Je veux économiser aussi !</span>
            <span class="group-hover:translate-x-2 transition-transform">→</span>
          </button>
        </div>
      </Container>
    </section>
    
    <!-- CTA Intermédiaire -->
    <CtaIntermediateSection />
    
    <!-- FAQ (NOUVEAU - CRITIQUE) -->
    <FaqSection />
    
    <Footer />
    
    <!-- Sticky CTA Mobile (visible uniquement sur mobile) -->
    <div class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-2 shadow-2xl">
      <button
        @click="openFormAccordion"
        class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-primary hover:bg-orange-hover text-white font-semibold rounded-lg shadow-sm transition-all"
      >
        <Icon icon="mdi:lightning-bolt" class="w-4 h-4" />
        <span class="text-sm">Devis gratuit en 2 minutes</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Animations personnalisées Hero */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Gradient Success pour CTA */
.gradient-success {
  background: linear-gradient(135deg, #29c99e 0%, #2fecba 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.gradient-success:hover:not(:disabled) {
  background: linear-gradient(135deg, #1fa67e 0%, #29c99e 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(41, 201, 158, 0.4) !important;
}

/* Animation delays */
.animation-delay-100 {
  animation-delay: 100ms;
}

.animation-delay-200 {
  animation-delay: 200ms;
}

.animation-delay-300 {
  animation-delay: 300ms;
}

.animation-delay-400 {
  animation-delay: 400ms;
}

/* Responsive Hero adjustments */
@media (max-width: 1023px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-form {
    order: 2;
  }
  
  .hero-content {
    order: 1;
    text-align: center;
  }
}

@media (max-width: 767px) {
  h1 {
    font-size: 2rem !important;
    line-height: 1.2;
  }
  
  .stats-container {
    justify-content: center;
  }
}

/* Badge numéroté animation hover */
.flex-shrink-0:hover {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}
</style>

