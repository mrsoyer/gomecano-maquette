<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'

interface Props {
  /** Heures initiales */
  initialHours?: number
  /** Tarif initial */
  initialRate?: number
  /** Mode d'affichage */
  variant?: 'full' | 'compact'
  /** Afficher le label "par mois" */
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialHours: 20,
  initialRate: 60,
  variant: 'full',
  showLabel: true
})

const emit = defineEmits<{
  update: [{
    hoursPerWeek: number
    avgPricePerHour: number
    monthlyRevenue: number
    yearlyRevenue: number
  }]
}>()

const hoursPerWeek = ref(props.initialHours)
const avgPricePerHour = ref(props.initialRate)

const monthlyRevenue = computed(() =>
  hoursPerWeek.value * 4 * avgPricePerHour.value
)

const yearlyRevenue = computed(() =>
  monthlyRevenue.value * 12
)

// Émettre à chaque changement
watch([hoursPerWeek, avgPricePerHour], () => {
  emit('update', {
    hoursPerWeek: hoursPerWeek.value,
    avgPricePerHour: avgPricePerHour.value,
    monthlyRevenue: monthlyRevenue.value,
    yearlyRevenue: yearlyRevenue.value
  })
}, { immediate: true })
</script>

<template>
  <!-- Variant Full -->
  <div v-if="variant === 'full'" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <Card>
      <h2 class="text-2xl font-bold mb-6">Votre activité</h2>
      <Input
        v-model.number="hoursPerWeek"
        label="Heures / semaine"
        type="number"
        class="mb-4"
      />
      <Input
        v-model.number="avgPricePerHour"
        label="Prix moyen / heure (€)"
        type="number"
      />
    </Card>
    <Card>
      <h2 class="text-2xl font-bold mb-6">Vos revenus estimés</h2>
      <div class="text-5xl font-bold text-orange-primary mb-4">
        {{ monthlyRevenue }}€
      </div>
      <div v-if="showLabel" class="text-gray-600">par mois</div>
    </Card>
  </div>

  <!-- Variant Compact -->
  <div v-else class="flex items-center gap-4 flex-wrap">
    <Input
      v-model.number="hoursPerWeek"
      label="H/sem"
      type="number"
      class="w-24"
    />
    <span class="text-gray-500">×</span>
    <Input
      v-model.number="avgPricePerHour"
      label="€/h"
      type="number"
      class="w-24"
    />
    <span class="text-gray-500">=</span>
    <div class="flex flex-col">
      <div class="text-2xl font-bold text-orange-primary">{{ monthlyRevenue }}€</div>
      <div v-if="showLabel" class="text-sm text-gray-600">par mois</div>
    </div>
  </div>
</template>
