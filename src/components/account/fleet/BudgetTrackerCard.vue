<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  budget: number
  spent: number
  projected: number
}

const props = defineProps<Props>()

/**
 * Budget utilization percentage
 */
const utilizationPercentage = computed(() => {
  if (props.budget === 0) return 0
  return Math.round((props.spent / props.budget) * 100)
})

/**
 * Progress bar color
 */
const progressColor = computed(() => {
  if (utilizationPercentage.value >= 90) return 'bg-red-500'
  if (utilizationPercentage.value >= 75) return 'bg-orange-500'
  return 'bg-green-primary'
})

/**
 * Remaining budget
 */
const remaining = computed(() => props.budget - props.spent)

/**
 * Is over budget
 */
const isOverBudget = computed(() => props.spent > props.budget)

/**
 * Projected over budget
 */
const projectedOverBudget = computed(() => props.projected > props.budget)
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
    <h3 class="text-sm md:text-base font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
      <Icon icon="mdi:cash-multiple" class="w-5 h-5 text-green-primary" />
      Suivi Budget
    </h3>

    <!-- Budget Stats -->
    <div class="space-y-3 md:space-y-4">
      <!-- Spent vs Budget -->
      <div>
        <div class="flex justify-between items-baseline mb-2">
          <span class="text-xs md:text-sm text-gray-600">Dépensé ce mois</span>
          <div class="text-right">
            <span class="text-lg md:text-xl font-bold text-gray-900">{{ spent.toLocaleString() }}€</span>
            <span class="text-xs md:text-sm text-gray-500 ml-1">/ {{ budget.toLocaleString() }}€</span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="w-full h-2.5 md:h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            :class="['h-full transition-all duration-500', progressColor]"
            :style="{ width: `${Math.min(100, utilizationPercentage)}%` }"
          ></div>
        </div>

        <div class="flex justify-between mt-1.5">
          <span class="text-xs text-gray-500">{{ utilizationPercentage }}% utilisé</span>
          <span
            :class="[
              'text-xs font-semibold',
              isOverBudget ? 'text-red-600' : 'text-green-600'
            ]"
          >
            {{ isOverBudget ? '+' : '' }}{{ (remaining).toLocaleString() }}€
          </span>
        </div>
      </div>

      <!-- Projected -->
      <div class="p-2 md:p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs md:text-sm text-gray-700 flex items-center gap-1.5">
            <Icon icon="mdi:chart-line" class="w-4 h-4 text-blue-600" />
            Projection fin de mois
          </span>
          <span class="text-sm md:text-base font-bold text-gray-900">
            {{ projected.toLocaleString() }}€
          </span>
        </div>
        <p v-if="projectedOverBudget" class="text-[10px] md:text-xs text-orange-700 flex items-center gap-1">
          <Icon icon="mdi:alert" class="w-3 h-3" />
          Dépassement projeté : +{{ (projected - budget).toLocaleString() }}€
        </p>
        <p v-else class="text-[10px] md:text-xs text-green-700 flex items-center gap-1">
          <Icon icon="mdi:check-circle" class="w-3 h-3" />
          Dans les limites du budget
        </p>
      </div>

      <!-- Alert (if over budget) -->
      <div v-if="isOverBudget || utilizationPercentage >= 90" class="p-2 md:p-3 bg-red-50 rounded-lg border border-red-200">
        <div class="flex items-start gap-2">
          <Icon icon="mdi:alert-circle" class="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p class="text-xs md:text-sm font-semibold text-red-900 mb-0.5">
              {{ isOverBudget ? 'Budget dépassé' : 'Alerte budget' }}
            </p>
            <p class="text-[10px] md:text-xs text-red-700">
              {{ isOverBudget
                ? 'Le budget mensuel est dépassé'
                : 'Attention, vous approchez de la limite budgétaire'
              }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
