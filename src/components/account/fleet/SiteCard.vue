<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { CompanySite } from '@/types/fleet'

interface Props {
  site: CompanySite
  vehiclesCount: number
  activeInterventions: number
  monthlySpend: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  view: []
  edit: []
}>()
</script>

<template>
  <div
    @click="emit('view')"
    class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm hover:shadow-md hover:border-green-300 transition-all cursor-pointer"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-2 md:gap-3">
        <div class="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-green-50 flex items-center justify-center">
          <Icon icon="mdi:office-building" class="w-5 h-5 md:w-6 md:h-6 text-green-primary" />
        </div>
        <div>
          <h3 class="text-sm md:text-base font-bold text-gray-900">{{ site.name }}</h3>
          <p class="text-xs text-gray-600">{{ site.address.city }}</p>
        </div>
      </div>
      <button
        @click.stop="emit('edit')"
        class="p-2 hover:bg-gray-100 rounded-lg transition-all"
      >
        <Icon icon="mdi:pencil" class="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
      </button>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-3 gap-2">
      <div class="text-center p-2 bg-blue-50 rounded-lg">
        <Icon icon="mdi:car-multiple" class="w-5 h-5 mx-auto text-blue-600 mb-1" />
        <p class="text-base md:text-lg font-bold text-gray-900">{{ vehiclesCount }}</p>
        <p class="text-[10px] text-gray-600">Véhicules</p>
      </div>
      <div class="text-center p-2 bg-orange-50 rounded-lg">
        <Icon icon="mdi:wrench" class="w-5 h-5 mx-auto text-orange-600 mb-1" />
        <p class="text-base md:text-lg font-bold text-gray-900">{{ activeInterventions }}</p>
        <p class="text-[10px] text-gray-600">En cours</p>
      </div>
      <div class="text-center p-2 bg-green-50 rounded-lg">
        <Icon icon="mdi:cash" class="w-5 h-5 mx-auto text-green-600 mb-1" />
        <p class="text-base md:text-lg font-bold text-gray-900">{{ monthlySpend }}€</p>
        <p class="text-[10px] text-gray-600">Ce mois</p>
      </div>
    </div>

    <!-- Address -->
    <div class="mt-3 p-2 bg-gray-50 rounded-lg">
      <div class="flex items-start gap-2">
        <Icon icon="mdi:map-marker" class="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
        <p class="text-xs text-gray-700 flex-1">
          {{ site.address.street }}, {{ site.address.postalCode }} {{ site.address.city }}
        </p>
      </div>
    </div>
  </div>
</template>
