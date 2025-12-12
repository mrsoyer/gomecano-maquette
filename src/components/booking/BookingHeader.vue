<script setup lang="ts">
import { computed } from 'vue'
import BookingStepper from './BookingStepper.vue'

/**
 * Props
 */
interface Props {
  currentStep: number
  totalSteps?: number
}

const props = withDefaults(defineProps<Props>(), {
  totalSteps: 4
})
</script>

<template>
  <header class="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
    <div class="container-custom">
      <div class="relative flex items-center justify-between h-16 lg:h-20">
        <!-- Logo Gomecano (Gauche) -->
        <RouterLink 
          to="/" 
          class="flex items-center gap-3 group flex-shrink-0 relative z-10"
        >
          <div class="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-blue-primary to-green-primary flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
            <span class="text-white font-bold text-xl lg:text-2xl">G</span>
          </div>
          <span class="text-2xl lg:text-3xl font-bold text-blue-primary group-hover:text-green-primary transition-colors">
            Gomecano
          </span>
        </RouterLink>
        
        <!-- Stepper (Droite - masqué sur mobile) -->
        <div class="hidden md:block">
          <BookingStepper :current-step="currentStep" :total-steps="totalSteps" theme="dark" />
        </div>
      </div>
    </div>
  </header>
</template>


