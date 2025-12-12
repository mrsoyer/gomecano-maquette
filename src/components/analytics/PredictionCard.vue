<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { Prediction } from '@/types/analytics'

interface Props {
  prediction: Prediction
}

const props = defineProps<Props>()

/**
 * Get prediction type icon and color
 */
const predictionStyle = computed(() => {
  switch (props.prediction.type) {
    case 'maintenance':
      return {
        icon: 'mdi:wrench',
        color: 'text-blue-500',
        bg: 'bg-blue-50',
        border: 'border-blue-200'
      }
    case 'repair':
      return {
        icon: 'mdi:car-wrench',
        color: 'text-orange-500',
        bg: 'bg-orange-50',
        border: 'border-orange-200'
      }
    case 'total_expenses':
      return {
        icon: 'mdi:cash',
        color: 'text-green-500',
        bg: 'bg-green-50',
        border: 'border-green-200'
      }
    default:
      return {
        icon: 'mdi:information',
        color: 'text-gray-500',
        bg: 'bg-gray-50',
        border: 'border-gray-200'
      }
  }
})

/**
 * Get confidence badge style
 */
const confidenceBadge = computed(() => {
  switch (props.prediction.confidence) {
    case 'high':
      return {
        text: 'Confiance élevée',
        class: 'bg-green-100 text-green-800'
      }
    case 'medium':
      return {
        text: 'Confiance moyenne',
        class: 'bg-yellow-100 text-yellow-800'
      }
    case 'low':
      return {
        text: 'Confiance faible',
        class: 'bg-gray-100 text-gray-800'
      }
    default:
      return {
        text: 'Non évalué',
        class: 'bg-gray-100 text-gray-600'
      }
  }
})

/**
 * Format date
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

/**
 * Get days until prediction
 */
const daysUntil = computed(() => {
  const today = new Date()
  const predDate = new Date(props.prediction.predictedDate)
  const diffTime = predDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'Passé'
  if (diffDays === 0) return 'Aujourd\'hui'
  if (diffDays === 1) return 'Demain'
  if (diffDays <= 30) return `Dans ${diffDays} jours`
  if (diffDays <= 60) return 'Dans ~1 mois'
  if (diffDays <= 90) return 'Dans ~2 mois'
  return `Dans ${Math.round(diffDays / 30)} mois`
})

/**
 * Get based on factors
 */
const basedOnFactors = computed(() => {
  const factors: string[] = []
  if (props.prediction.basedOn.historicalData) factors.push('Historique')
  if (props.prediction.basedOn.mileage) factors.push('Kilométrage')
  if (props.prediction.basedOn.vehicleAge) factors.push('Âge véhicule')
  if (props.prediction.basedOn.manufacturerSchedule) factors.push('Constructeur')
  return factors.join(' • ')
})
</script>

<template>
  <div
    :class="[
      'rounded-lg border p-4',
      predictionStyle.bg,
      predictionStyle.border
    ]"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-start gap-3 flex-1">
        <div
          :class="[
            'w-10 h-10 rounded-lg flex items-center justify-center',
            'bg-white border',
            predictionStyle.border
          ]"
        >
          <Icon
            :icon="predictionStyle.icon"
            :class="['w-5 h-5', predictionStyle.color]"
          />
        </div>
        
        <div class="flex-1">
          <h3 class="text-base font-semibold text-gray-900 mb-1">
            {{ prediction.title }}
          </h3>
          <p class="text-sm text-gray-600">
            {{ prediction.description }}
          </p>
        </div>
      </div>
      
      <span
        :class="[
          'text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap',
          confidenceBadge.class
        ]"
      >
        {{ confidenceBadge.text }}
      </span>
    </div>

    <!-- Prediction Details -->
    <div class="grid grid-cols-2 gap-3 mb-3">
      <div class="bg-white rounded-lg p-3 border border-gray-200">
        <div class="flex items-center gap-2 mb-1">
          <Icon icon="mdi:calendar" class="w-4 h-4 text-gray-400" />
          <span class="text-xs text-gray-600">Date prévue</span>
        </div>
        <div class="text-sm font-semibold text-gray-900">
          {{ formatDate(prediction.predictedDate) }}
        </div>
        <div class="text-xs text-gray-500 mt-0.5">
          {{ daysUntil }}
        </div>
      </div>
      
      <div class="bg-white rounded-lg p-3 border border-gray-200">
        <div class="flex items-center gap-2 mb-1">
          <Icon icon="mdi:cash" class="w-4 h-4 text-gray-400" />
          <span class="text-xs text-gray-600">Coût estimé</span>
        </div>
        <div class="text-sm font-semibold text-gray-900">
          {{ prediction.predictedAmount }}€
        </div>
        <div class="text-xs text-gray-500 mt-0.5">
          ± 15€
        </div>
      </div>
    </div>

    <!-- Based On -->
    <div class="flex items-center gap-2 text-xs text-gray-500">
      <Icon icon="mdi:chart-line" class="w-4 h-4" />
      <span>Basé sur : {{ basedOnFactors }}</span>
    </div>
  </div>
</template>

