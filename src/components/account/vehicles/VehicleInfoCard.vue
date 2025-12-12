<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { Vehicle } from '@/types/vehicle'

interface Props {
  vehicle: Vehicle
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editable: false
})

const emit = defineEmits<{
  edit: []
}>()
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
    <div class="flex items-center justify-between mb-3 md:mb-4">
      <h3 class="text-sm md:text-base font-bold text-gray-900 flex items-center gap-2">
        <Icon icon="mdi:car-info" class="w-5 h-5 text-blue-primary" />
        Informations du véhicule
      </h3>
      <button
        v-if="editable"
        @click="emit('edit')"
        class="px-3 py-1.5 text-xs md:text-sm font-semibold text-blue-primary hover:bg-blue-50 rounded-lg transition-all flex items-center gap-1"
      >
        <Icon icon="mdi:pencil" class="w-4 h-4" />
        <span>Modifier</span>
      </button>
    </div>

    <!-- Info Grid -->
    <div class="grid md:grid-cols-2 gap-3 md:gap-4">
      <!-- Make -->
      <div>
        <label class="block text-xs md:text-sm font-semibold text-gray-700 mb-1">Marque</label>
        <div class="flex items-center gap-2 p-2 md:p-2.5 bg-gray-50 rounded-lg">
          <Icon icon="mdi:car" class="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
          <span class="text-sm md:text-base text-gray-900">{{ vehicle.make }}</span>
        </div>
      </div>

      <!-- Model -->
      <div>
        <label class="block text-xs md:text-sm font-semibold text-gray-700 mb-1">Modèle</label>
        <div class="flex items-center gap-2 p-2 md:p-2.5 bg-gray-50 rounded-lg">
          <Icon icon="mdi:car-info" class="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
          <span class="text-sm md:text-base text-gray-900">{{ vehicle.model }}</span>
        </div>
      </div>

      <!-- Year -->
      <div>
        <label class="block text-xs md:text-sm font-semibold text-gray-700 mb-1">Année</label>
        <div class="flex items-center gap-2 p-2 md:p-2.5 bg-gray-50 rounded-lg">
          <Icon icon="mdi:calendar" class="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
          <span class="text-sm md:text-base text-gray-900">{{ vehicle.year }}</span>
        </div>
      </div>

      <!-- Fuel Type -->
      <div>
        <label class="block text-xs md:text-sm font-semibold text-gray-700 mb-1">Carburant</label>
        <div class="flex items-center gap-2 p-2 md:p-2.5 bg-gray-50 rounded-lg">
          <Icon icon="mdi:gas-station" class="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
          <span class="text-sm md:text-base text-gray-900 capitalize">{{ vehicle.fuelType }}</span>
        </div>
      </div>

      <!-- Plate -->
      <div>
        <label class="block text-xs md:text-sm font-semibold text-gray-700 mb-1">Plaque</label>
        <div class="flex items-center gap-2 p-2 md:p-2.5 bg-gray-50 rounded-lg">
          <Icon icon="mdi:card-account-details" class="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
          <span class="text-sm md:text-base text-gray-900 font-mono">{{ vehicle.plate }}</span>
        </div>
      </div>

      <!-- Mileage -->
      <div>
        <label class="block text-xs md:text-sm font-semibold text-gray-700 mb-1">Kilométrage</label>
        <div class="flex items-center gap-2 p-2 md:p-2.5 bg-gray-50 rounded-lg">
          <Icon icon="mdi:counter" class="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
          <span class="text-sm md:text-base text-gray-900">{{ vehicle.mileage?.toLocaleString() }} km</span>
        </div>
      </div>

      <!-- VIN (if available) -->
      <div v-if="vehicle.vin" class="md:col-span-2">
        <label class="block text-xs md:text-sm font-semibold text-gray-700 mb-1">VIN</label>
        <div class="flex items-center gap-2 p-2 md:p-2.5 bg-gray-50 rounded-lg">
          <Icon icon="mdi:barcode" class="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
          <span class="text-sm md:text-base text-gray-900 font-mono">{{ vehicle.vin }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
