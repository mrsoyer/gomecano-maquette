<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'

const router = useRouter()

// Form data
const licensePlate = ref('')
const selectedService = ref('')
const selectedCity = ref('')

// Popular services
const popularServices = [
  { value: 'vidange', label: '🛢️ Vidange + Filtre' },
  { value: 'freins', label: '🔴 Freins (Plaquettes)' },
  { value: 'revision', label: '🔧 Révision complète' },
  { value: 'diagnostic', label: '📊 Diagnostic' },
  { value: 'batterie', label: '🔋 Batterie' },
  { value: 'climatisation', label: '❄️ Climatisation' },
  { value: 'pneus', label: '🚗 Pneus' },
  { value: 'distribution', label: '⚙️ Distribution' },
]

// Cities
const cities = [
  { value: 'paris', label: 'Paris' },
  { value: 'marseille', label: 'Marseille' },
  { value: 'lyon', label: 'Lyon' },
  { value: 'toulouse', label: 'Toulouse' },
  { value: 'bordeaux', label: 'Bordeaux' },
  { value: 'nice', label: 'Nice' },
  { value: 'nantes', label: 'Nantes' },
  { value: 'strasbourg', label: 'Strasbourg' },
  { value: 'lille', label: 'Lille' },
  { value: 'rennes', label: 'Rennes' },
]

// Form validation
const canSubmit = computed(() => {
  return licensePlate.value.length >= 7 && selectedService.value && selectedCity.value
})

// Submit handler
const handleSubmit = () => {
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

// Format license plate (AA-123-BB)
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
}
</script>

<template>
  <div class="glass rounded-2xl shadow-2xl p-6 md:p-8 border border-white/20 animate-scale-in">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 rounded-xl bg-gradient-success flex items-center justify-center shadow-lg">
        <span class="text-white text-2xl">⚡</span>
      </div>
      <div>
        <h2 class="text-2xl font-bold text-gray-900">
          Obtenez votre devis gratuit
        </h2>
        <p class="text-sm text-gray-600">
          Réponse en moins de 30 secondes
        </p>
      </div>
    </div>
    
    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-5">
      <!-- Plaque d'immatriculation -->
      <div class="animate-slide-in-up animation-delay-100">
        <label class="block text-sm font-semibold text-gray-700 mb-2">
          <span class="flex items-center gap-2">
            📋 Plaque d'immatriculation
            <span class="text-xs font-normal text-gray-500">(requis)</span>
          </span>
        </label>
        <Input
          v-model="licensePlate"
          @input="formatLicensePlate"
          placeholder="AA-123-BB"
          class="w-full text-lg transition-smooth"
          :class="{
            'border-green-primary ring-2 ring-green-primary/20': licensePlate.length >= 7,
            'border-gray-300': licensePlate.length < 7
          }"
          maxlength="9"
        />
        <p class="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
          <span v-if="licensePlate.length >= 7" class="text-green-primary">✓</span>
          <span v-else>ℹ️</span>
          Identification automatique de votre véhicule
        </p>
      </div>
      
      <!-- Service -->
      <div class="animate-slide-in-up animation-delay-200">
        <label class="block text-sm font-semibold text-gray-700 mb-2">
          <span class="flex items-center gap-2">
            🔧 Votre besoin
            <span class="text-xs font-normal text-gray-500">(requis)</span>
          </span>
        </label>
        <Select
          v-model="selectedService"
          :options="popularServices"
          placeholder="Choisissez un service"
          class="w-full"
        />
        <p class="text-xs text-gray-500 mt-1.5">
          Prix instantané pour 80% des services
        </p>
      </div>
      
      <!-- Ville -->
      <div class="animate-slide-in-up animation-delay-300">
        <label class="block text-sm font-semibold text-gray-700 mb-2">
          <span class="flex items-center gap-2">
            📍 Votre ville
            <span class="text-xs font-normal text-gray-500">(requis)</span>
          </span>
        </label>
        <Select
          v-model="selectedCity"
          :options="cities"
          placeholder="Choisissez votre ville"
          class="w-full"
        />
      </div>
      
      <!-- CTA Button -->
      <div class="animate-slide-in-up animation-delay-400 pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          class="w-full group gradient-success hover:shadow-xl transition-smooth shadow-lg"
          :class="{
            'opacity-50 cursor-not-allowed': !canSubmit,
            'hover-lift animate-pulse-glow': canSubmit
          }"
          :disabled="!canSubmit"
        >
          <span class="flex items-center justify-center gap-2 font-bold">
            <span>Voir les tarifs</span>
            <span class="group-hover:translate-x-1 transition-transform duration-300 text-xl">→</span>
          </span>
        </Button>
        
        <!-- Trust indicators -->
        <div class="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
          <span class="flex items-center gap-1">
            <span class="text-green-primary">✅</span>
            Sans engagement
          </span>
          <span class="flex items-center gap-1">
            <span class="text-green-primary">✅</span>
            Réponse en 30s
          </span>
        </div>
      </div>
    </form>
    
    <!-- Bottom note -->
    <div class="mt-6 pt-6 border-t border-gray-100">
      <p class="text-xs text-center text-gray-600">
        🔒 Vos données sont sécurisées et ne seront jamais partagées
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Additional component-specific styles */
.gradient-success {
  background: linear-gradient(90deg, #29c99e 0%, #2fecba 100%);
}

.gradient-success:hover {
  background: linear-gradient(90deg, #1fa67e 0%, #29c99e 100%);
}
</style>






