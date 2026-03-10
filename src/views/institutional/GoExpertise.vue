<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'

// State for phone CTA
const phoneNumber = '09 78 46 68 57'
const showPhoneTooltip = ref(false)

/**
 * Handle CTA click - scroll to booking form
 */
function handleCTAClick() {
  const element = document.getElementById('booking-section')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

/**
 * Copy phone number to clipboard
 */
function copyPhoneNumber() {
  navigator.clipboard.writeText(phoneNumber.replace(/\s/g, ''))
  showPhoneTooltip.value = true
  setTimeout(() => {
    showPhoneTooltip.value = false
  }, 2000)
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <Header />
    
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-blue-dark via-blue-primary to-blue-light text-white overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"></div>
      </div>
      
      <div class="container mx-auto px-4 py-12 md:py-20 lg:py-24 relative z-10">
        <div class="max-w-4xl mx-auto text-center">
          <!-- Logo GOEXPERTISE -->
          <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Icon icon="mdi:shield-check" class="w-6 h-6 text-green-primary" />
            <span class="text-base md:text-lg font-semibold">GOEXPERTISE</span>
            <span class="text-xs md:text-sm opacity-90">par GOMECANO</span>
          </div>
          
          <!-- Main Title -->
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">
            Votre Expert en Inspection<br class="hidden md:block" />
            de Véhicules d'Occasion
          </h1>
          
          <!-- Subtitle -->
          <p class="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 opacity-95 font-medium">
            <span class="text-green-bright">205 points de contrôle</span> vérifiés pour vous
          </p>
          
          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-6 md:mb-8">
            <button
              @click="handleCTAClick"
              class="w-full sm:w-auto bg-orange-primary hover:bg-orange-hover text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Icon icon="mdi:calendar-check" class="w-5 h-5 md:w-6 md:h-6" />
              Prendre rendez-vous
            </button>
            
            <div class="relative">
              <button
                @click="copyPhoneNumber"
                class="w-full sm:w-auto bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Icon icon="mdi:phone" class="w-5 h-5 md:w-6 md:h-6" />
                {{ phoneNumber }}
              </button>
              
              <!-- Tooltip copié -->
              <Transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 translate-y-1"
              >
                <div
                  v-if="showPhoneTooltip"
                  class="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-green-primary text-white px-3 py-1 rounded text-sm whitespace-nowrap"
                >
                  Numéro copié !
                </div>
              </Transition>
            </div>
          </div>
          
          <!-- Trust Badge -->
          <p class="text-sm md:text-base opacity-90">
            <Icon icon="mdi:star" class="inline w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
            Appel gratuit · Intervention sous 48h · Rapport instantané
          </p>
        </div>
      </div>
    </section>

    <!-- Trust Bar -->
    <div class="bg-blue-pale border-b border-blue-primary/10">
      <div class="container mx-auto px-4 py-3 md:py-4">
        <div class="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-xs md:text-sm text-blue-dark">
          <div class="flex items-center gap-2">
            <Icon icon="mdi:shield-check" class="w-4 h-4 md:w-5 md:h-5 text-green-primary" />
            <span class="font-medium">Mécaniciens professionnels</span>
          </div>
          <div class="flex items-center gap-2">
            <Icon icon="mdi:file-document-check" class="w-4 h-4 md:w-5 md:h-5 text-orange-primary" />
            <span class="font-medium">Rapport détaillé</span>
          </div>
          <div class="flex items-center gap-2">
            <Icon icon="mdi:map-marker-radius" class="w-4 h-4 md:w-5 md:h-5 text-blue-primary" />
            <span class="font-medium">Partout en France</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Achetez Serein Section -->
    <section class="py-8 md:py-12 lg:py-16 bg-white">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <div class="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
            <!-- Image -->
            <div class="order-2 md:order-1">
              <div class="relative rounded-xl overflow-hidden shadow-xl">
                <img
                  src="/images/camionnette_gomecanicien_intervention_mecanique_auto_sur_site.jpg"
                  alt="Mécanicien GOEXPERTISE inspectant un véhicule"
                  class="w-full h-auto"
                  loading="lazy"
                />
                <div class="absolute top-4 right-4 bg-green-primary text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  <Icon icon="mdi:check-circle" class="inline w-4 h-4 mr-1" />
                  Certifié
                </div>
              </div>
            </div>
            
            <!-- Content -->
            <div class="order-1 md:order-2">
              <h2 class="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-dark mb-4 md:mb-6">
                Achetez serein.
              </h2>
              <p class="text-base md:text-lg text-gray-700 mb-4 leading-relaxed">
                Un mécanicien professionnel vérifie la mécanique avant votre achat.
              </p>
              <p class="text-base md:text-lg text-gray-700 mb-6 leading-relaxed">
                N'ayez plus peur au moment d'acheter votre voiture d'occasion : <strong class="text-blue-primary">soyez accompagnés par un professionnel</strong> qui vérifie avec vous le véhicule.
              </p>
              
              <!-- CTA -->
              <div class="flex flex-col sm:flex-row gap-3">
                <button
                  @click="handleCTAClick"
                  class="bg-orange-primary hover:bg-orange-hover text-white px-6 py-3 rounded-lg font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Icon icon="mdi:calendar-check" class="w-5 h-5" />
                  Je prends rendez-vous
                </button>
                <a
                  :href="`tel:${phoneNumber.replace(/\s/g, '')}`"
                  class="bg-white hover:bg-gray-50 text-blue-primary border-2 border-blue-primary px-6 py-3 rounded-lg font-bold text-base transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Icon icon="mdi:phone" class="w-5 h-5" />
                  Appeler (gratuit)
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-8 md:py-12 lg:py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-dark text-center mb-8 md:mb-12">
            Achetez en toute confiance<br class="hidden md:block" />
            avec GOEXPERTISE
          </h2>
          
          <div class="grid md:grid-cols-3 gap-4 md:gap-6">
            <!-- Feature 1 -->
            <div class="bg-white rounded-lg p-4 md:p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div class="w-12 h-12 md:w-16 md:h-16 bg-blue-pale rounded-full flex items-center justify-center mb-4">
                <Icon icon="mdi:account-tie" class="w-6 h-6 md:w-8 md:h-8 text-blue-primary" />
              </div>
              <h3 class="text-lg md:text-xl font-bold text-blue-dark mb-3">
                Expertise Professionnelle
              </h3>
              <p class="text-sm md:text-base text-gray-700 leading-relaxed">
                Nos mécaniciens <strong>diplômés et qualifiés</strong> possèdent une vaste expérience dans l'inspection de véhicules d'occasion. Ils repèrent les moindres détails, des éléments mécaniques à la carrosserie.
              </p>
            </div>
            
            <!-- Feature 2 -->
            <div class="bg-white rounded-lg p-4 md:p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div class="w-12 h-12 md:w-16 md:h-16 bg-orange-light rounded-full flex items-center justify-center mb-4">
                <Icon icon="mdi:file-document-check" class="w-6 h-6 md:w-8 md:h-8 text-orange-primary" />
              </div>
              <h3 class="text-lg md:text-xl font-bold text-blue-dark mb-3">
                Rapport Détaillé
              </h3>
              <p class="text-sm md:text-base text-gray-700 leading-relaxed">
                Après chaque inspection, vous recevrez un <strong>rapport détaillé</strong> couvrant l'état de chaque composant du véhicule. Clair et compréhensible, même pour les non-experts.
              </p>
            </div>
            
            <!-- Feature 3 -->
            <div class="bg-white rounded-lg p-4 md:p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div class="w-12 h-12 md:w-16 md:h-16 bg-green-pale rounded-full flex items-center justify-center mb-4">
                <Icon icon="mdi:shield-check" class="w-6 h-6 md:w-8 md:h-8 text-green-primary" />
              </div>
              <h3 class="text-lg md:text-xl font-bold text-blue-dark mb-3">
                Transparence Totale
              </h3>
              <p class="text-sm md:text-base text-gray-700 leading-relaxed">
                La <strong>transparence est au cœur de notre service</strong>. Nous vous fournissons des informations honnêtes et objectives sur l'état du véhicule pour une décision éclairée.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Process Section -->
    <section class="py-8 md:py-12 lg:py-16 bg-white">
      <div class="container mx-auto px-4">
        <div class="max-w-5xl mx-auto">
          <div class="text-center mb-8 md:mb-12">
            <h2 class="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-dark mb-4">
              Comment fonctionne GOEXPERTISE ?
            </h2>
            <p class="text-base md:text-lg text-gray-700">
              Nous vous accompagnons, que vous soyez sur place ou non
            </p>
          </div>
          
          <!-- Process Steps -->
          <div class="relative">
            <!-- Connecting Line (Desktop) -->
            <div class="hidden md:block absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-blue-primary via-orange-primary to-green-primary" style="width: calc(100% - 96px); margin: 0 48px;"></div>
            
            <div class="grid md:grid-cols-3 gap-6 md:gap-8 relative z-10">
              <!-- Step 1 -->
              <div class="text-center">
                <div class="w-16 h-16 md:w-24 md:h-24 bg-blue-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span class="text-2xl md:text-4xl font-bold">1</span>
                </div>
                <h3 class="text-lg md:text-xl font-bold text-blue-dark mb-3">
                  Planification
                </h3>
                <p class="text-sm md:text-base text-gray-700 leading-relaxed">
                  Contactez-nous pour planifier une inspection à l'emplacement du véhicule, <strong>avec ou sans vous</strong>. Nous nous adaptons à vos horaires.
                </p>
              </div>
              
              <!-- Step 2 -->
              <div class="text-center">
                <div class="w-16 h-16 md:w-24 md:h-24 bg-orange-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span class="text-2xl md:text-4xl font-bold">2</span>
                </div>
                <h3 class="text-lg md:text-xl font-bold text-blue-dark mb-3">
                  Inspection Complète
                </h3>
                <p class="text-sm md:text-base text-gray-700 leading-relaxed">
                  Nos inspecteurs passent en revue <strong>chaque aspect du véhicule</strong>, de la mécanique à l'esthétique, sans rien laisser au hasard.
                </p>
              </div>
              
              <!-- Step 3 -->
              <div class="text-center">
                <div class="w-16 h-16 md:w-24 md:h-24 bg-green-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span class="text-2xl md:text-4xl font-bold">3</span>
                </div>
                <h3 class="text-lg md:text-xl font-bold text-blue-dark mb-3">
                  Rapport Instantané
                </h3>
                <p class="text-sm md:text-base text-gray-700 leading-relaxed">
                  Recevez un <strong>rapport détaillé après l'inspection</strong>, vous permettant de discuter des résultats avec le vendeur si nécessaire.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="py-8 md:py-12 lg:py-16 bg-gradient-to-br from-blue-pale to-white">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <div class="bg-white rounded-xl shadow-xl p-6 md:p-8 lg:p-10 border border-blue-primary/10">
            <h2 class="text-2xl md:text-3xl font-bold text-blue-dark mb-6 text-center">
              Des Services Adaptés à Vos Besoins
            </h2>
            
            <div class="space-y-4 text-base md:text-lg text-gray-700 leading-relaxed">
              <p>
                Que vous ayez l'intention d'acheter une <strong>voiture d'occasion, un camion utilitaire ou un SUV</strong>, GOEXPERTISE met à votre disposition des inspections spécialement adaptées à chaque type de véhicule.
              </p>
              
              <p>
                Notre équipe d'experts chevronnés est spécialement formée pour évaluer tous les aspects d'un véhicule, que ce soit au niveau <strong>mécanique, esthétique ou de sécurité</strong>.
              </p>
              
              <p class="bg-blue-pale rounded-lg p-4 border-l-4 border-blue-primary">
                <Icon icon="mdi:map-marker-radius" class="inline w-5 h-5 text-blue-primary mr-2" />
                Le véhicule peut être <strong>à l'autre bout de la France</strong>, nous avons forcément un mécanicien membre de notre réseau pour venir l'inspecter pour vous !
              </p>
              
              <p>
                En vous fournissant des informations <strong>précises et objectives</strong> sur l'état du véhicule, nous vous donnons les moyens de négocier le meilleur prix et de faire un choix éclairé.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="booking-section" class="py-8 md:py-12 lg:py-16 bg-white scroll-mt-20">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-8 md:mb-12">
            <h2 class="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-dark mb-4">
              Prenez RDV et faites inspecter<br class="hidden md:block" />
              votre prochaine voiture
            </h2>
            <p class="text-lg md:text-xl text-gray-700">
              Et au fait, combien coûte ce super service ?
            </p>
          </div>
          
          <!-- Pricing Card -->
          <div class="bg-gradient-to-br from-blue-primary to-blue-dark text-white rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300">
            <div class="p-6 md:p-8 lg:p-10">
              <!-- Price -->
              <div class="text-center mb-6 md:mb-8">
                <div class="inline-flex items-baseline gap-2">
                  <span class="text-5xl md:text-6xl lg:text-7xl font-bold">199€</span>
                </div>
                <p class="text-xl md:text-2xl font-bold text-green-bright mt-2">
                  TOUT COMPRIS
                </p>
              </div>
              
              <!-- What's Included -->
              <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 mb-6 md:mb-8">
                <h3 class="text-lg md:text-xl font-bold mb-4 text-center">
                  Pour quoi exactement ?
                </h3>
                <ul class="space-y-3">
                  <li class="flex items-start gap-3">
                    <Icon icon="mdi:check-circle" class="w-5 h-5 md:w-6 md:h-6 text-green-bright flex-shrink-0 mt-0.5" />
                    <span class="text-sm md:text-base">Un mécanicien professionnel dédié pendant <strong>1h</strong></span>
                  </li>
                  <li class="flex items-start gap-3">
                    <Icon icon="mdi:check-circle" class="w-5 h-5 md:w-6 md:h-6 text-green-bright flex-shrink-0 mt-0.5" />
                    <span class="text-sm md:text-base"><strong>205 points de contrôle</strong> mécaniques et électriques</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <Icon icon="mdi:check-circle" class="w-5 h-5 md:w-6 md:h-6 text-green-bright flex-shrink-0 mt-0.5" />
                    <span class="text-sm md:text-base">1 rapport d'inspection envoyé par <strong>e-mail</strong></span>
                  </li>
                  <li class="flex items-start gap-3">
                    <Icon icon="mdi:check-circle" class="w-5 h-5 md:w-6 md:h-6 text-green-bright flex-shrink-0 mt-0.5" />
                    <span class="text-sm md:text-base">Une équipe disponible <strong>avant, pendant et après</strong> l'inspection</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <Icon icon="mdi:check-circle" class="w-5 h-5 md:w-6 md:h-6 text-green-bright flex-shrink-0 mt-0.5" />
                    <span class="text-sm md:text-base">La certitude d'acheter en connaissant <strong>l'état réel du véhicule</strong></span>
                  </li>
                </ul>
              </div>
              
              <!-- CTA Buttons -->
              <div class="flex flex-col gap-3">
                <button
                  @click="handleCTAClick"
                  class="w-full bg-orange-primary hover:bg-orange-hover text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Icon icon="mdi:calendar-check" class="w-5 h-5 md:w-6 md:h-6" />
                  Prendre rendez-vous maintenant
                </button>
                <a
                  :href="`tel:${phoneNumber.replace(/\s/g, '')}`"
                  class="w-full bg-white hover:bg-gray-100 text-blue-primary px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Icon icon="mdi:phone" class="w-5 h-5 md:w-6 md:h-6" />
                  Ou appelez-nous (gratuit)
                </a>
              </div>
            </div>
          </div>
          
          <!-- Trust Badges -->
          <div class="mt-8 md:mt-12 text-center">
            <div class="flex flex-wrap justify-center items-center gap-4 md:gap-6 text-sm md:text-base text-gray-600">
              <div class="flex items-center gap-2">
                <Icon icon="mdi:shield-check" class="w-5 h-5 text-green-primary" />
                <span>Paiement sécurisé</span>
              </div>
              <div class="flex items-center gap-2">
                <Icon icon="mdi:clock-fast" class="w-5 h-5 text-orange-primary" />
                <span>Intervention sous 48h</span>
              </div>
              <div class="flex items-center gap-2">
                <Icon icon="mdi:star" class="w-5 h-5 text-yellow-400" />
                <span>Satisfaction garantie</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA Section -->
    <section class="py-8 md:py-12 bg-gradient-to-r from-blue-dark to-blue-primary text-white">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-2xl md:text-3xl font-bold mb-4">
            Prêt à acheter votre véhicule en toute confiance ?
          </h2>
          <p class="text-base md:text-lg mb-6 opacity-90">
            Contactez-nous dès maintenant pour planifier votre inspection GOEXPERTISE
          </p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              @click="handleCTAClick"
              class="bg-orange-primary hover:bg-orange-hover text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Icon icon="mdi:calendar-check" class="w-5 h-5 md:w-6 md:h-6" />
              Prendre rendez-vous
            </button>
            <a
              :href="`tel:${phoneNumber.replace(/\s/g, '')}`"
              class="bg-white hover:bg-gray-100 text-blue-primary px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Icon icon="mdi:phone" class="w-5 h-5 md:w-6 md:h-6" />
              {{ phoneNumber }}
            </a>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<style scoped>
/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Hover effects */
@media (hover: hover) {
  .hover\:scale-105:hover {
    transform: scale(1.05);
  }
}
</style>
