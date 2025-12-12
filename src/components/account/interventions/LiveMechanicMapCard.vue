<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { GeoCoordinates } from '@/composables/useGeolocation'

interface Props {
  mechanicLocation: GeoCoordinates
  clientLocation: { street: string; city: string; postalCode: string }
  eta: number
}

const props = defineProps<Props>()
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
    <h3 class="text-sm md:text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
      <Icon icon="mdi:map-marker-radius" class="w-5 h-5 text-orange-primary" />
      Localisation en temps réel
    </h3>

    <!-- Mock Map Placeholder -->
    <div class="relative bg-gray-100 rounded-lg overflow-hidden mb-3" style="height: 250px;">
      <!-- Map placeholder -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-center">
          <Icon icon="mdi:map" class="w-16 h-16 text-gray-400 mb-2 mx-auto" />
          <p class="text-sm text-gray-500">Carte GPS temps réel</p>
          <p class="text-xs text-gray-400 mt-1">
            (Production: Google Maps API)
          </p>
        </div>
      </div>

      <!-- Mechanic Marker (mock position) -->
      <div class="absolute top-4 left-4 bg-green-600 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 text-xs md:text-sm font-semibold">
        <div class="w-2 h-2 rounded-full bg-white animate-pulse"></div>
        <span>Mécanicien</span>
      </div>

      <!-- Client Marker -->
      <div class="absolute bottom-4 right-4 bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 text-xs md:text-sm font-semibold">
        <Icon icon="mdi:map-marker" class="w-4 h-4" />
        <span>Vous</span>
      </div>
    </div>

    <!-- ETA Info -->
    <div class="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
      <div class="flex items-center gap-2">
        <Icon icon="mdi:clock-fast" class="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
        <div>
          <p class="text-xs md:text-sm text-gray-600">Arrivée estimée</p>
          <p class="text-base md:text-lg font-bold text-gray-900">Dans {{ eta }} min</p>
        </div>
      </div>
      <Icon icon="mdi:navigation" class="w-6 h-6 text-orange-primary" />
    </div>

    <!-- Coordinates Debug (dev only) -->
    <details class="mt-2 text-[10px] text-gray-400">
      <summary class="cursor-pointer">Debug GPS</summary>
      <div class="mt-1 font-mono">
        <p>Mécanicien: {{ mechanicLocation.lat.toFixed(4) }}, {{ mechanicLocation.lng.toFixed(4) }}</p>
        <p>Client: {{ clientLocation.city }} {{ clientLocation.postalCode }}</p>
      </div>
    </details>
  </div>
</template>
