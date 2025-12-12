<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { FleetVehicle } from '@/types/fleet'
import type { Intervention } from '@/types/account'

interface Props {
  vehicles: FleetVehicle[]
  interventions?: Intervention[]
  showRoutes?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  interventions: () => [],
  showRoutes: false
})
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
    <h3 class="text-sm md:text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
      <Icon icon="mdi:map-marker-multiple" class="w-5 h-5 text-green-primary" />
      Carte de la flotte
    </h3>

    <!-- Mock Map -->
    <div class="relative bg-gray-100 rounded-lg overflow-hidden mb-3" style="height: 400px;">
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-center">
          <Icon icon="mdi:map" class="w-20 h-20 text-gray-400 mb-3 mx-auto" />
          <p class="text-sm text-gray-500 font-semibold mb-1">Carte Flotte Temps Réel</p>
          <p class="text-xs text-gray-400">
            (Production: Google Maps API avec clusters)
          </p>
        </div>
      </div>

      <!-- Mock Vehicle Markers -->
      <div class="absolute top-4 left-4 space-y-2">
        <div
          v-for="(vehicle, index) in vehicles.slice(0, 3)"
          :key="vehicle.id"
          class="px-3 py-1.5 bg-green-600 text-white rounded-lg shadow-lg flex items-center gap-1.5 text-xs font-semibold"
        >
          <Icon icon="mdi:car" class="w-4 h-4" />
          <span>{{ vehicle.plate }}</span>
        </div>
      </div>

      <!-- Legend -->
      <div class="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-2 md:p-3 text-xs">
        <div class="space-y-1.5">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-green-600"></div>
            <span>Active ({{ vehicles.filter(v => v.status === 'active').length }})</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Maintenance ({{ vehicles.filter(v => v.status === 'maintenance').length }})</span>
          </div>
          <div v-if="interventions.length > 0" class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-blue-600"></div>
            <span>Intervention ({{ interventions.length }})</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-3 gap-2 md:gap-3">
      <div class="text-center p-2 bg-green-50 rounded-lg">
        <p class="text-lg md:text-xl font-bold text-green-primary">{{ vehicles.length }}</p>
        <p class="text-[10px] md:text-xs text-gray-600">Véhicules</p>
      </div>
      <div class="text-center p-2 bg-blue-50 rounded-lg">
        <p class="text-lg md:text-xl font-bold text-blue-primary">{{ interventions.length }}</p>
        <p class="text-[10px] md:text-xs text-gray-600">En intervention</p>
      </div>
      <div class="text-center p-2 bg-gray-50 rounded-lg">
        <p class="text-lg md:text-xl font-bold text-gray-900">
          {{ Math.round((vehicles.filter(v => v.status === 'active').length / vehicles.length) * 100) }}%
        </p>
        <p class="text-[10px] md:text-xs text-gray-600">Disponibilité</p>
      </div>
    </div>
  </div>
</template>
