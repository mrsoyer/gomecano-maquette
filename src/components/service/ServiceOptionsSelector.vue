<script setup lang="ts">
import type { ServiceOption } from '@/types/service'
import { Icon } from '@iconify/vue'

interface Props {
  options: ServiceOption[]
  selectedOptions: string[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:selectedOptions': [optionIds: string[]]
}>()

function toggleOption(optionId: string) {
  const currentSelection = [...props.selectedOptions]
  const index = currentSelection.indexOf(optionId)
  
  if (index > -1) {
    // Retirer l'option
    currentSelection.splice(index, 1)
  } else {
    // Ajouter l'option
    currentSelection.push(optionId)
  }
  
  emit('update:selectedOptions', currentSelection)
}

function isSelected(optionId: string): boolean {
  return props.selectedOptions.includes(optionId)
}
</script>

<template>
  <div v-if="options.length > 0" class="mb-3">
    <h3 class="text-sm md:text-base font-bold text-gray-900 mb-2">Options supplémentaires</h3>
    
    <div class="space-y-1.5">
      <button
        v-for="option in options"
        :key="option.id"
        @click="toggleOption(option.id)"
        class="w-full p-3 border-2 rounded-lg text-left transition-all hover:shadow-sm"
        :class="isSelected(option.id)
          ? 'border-orange-primary bg-orange-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'"
      >
        <div class="flex items-start gap-2">
          <!-- Checkbox -->
          <div
            class="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
            :class="isSelected(option.id)
              ? 'border-orange-primary bg-orange-primary'
              : 'border-gray-300 bg-white'"
          >
            <Icon 
              v-if="isSelected(option.id)" 
              icon="mdi:check" 
              class="w-3 h-3 md:w-4 md:h-4 text-white" 
            />
          </div>
          
          <div class="flex-1 min-w-0">
            <!-- Header -->
            <div class="flex items-start gap-1.5 mb-0.5">
              <div class="flex-1 min-w-0">
                <!-- Nom + Badge recommandé -->
                <div class="flex items-center gap-1.5 flex-wrap mb-0.5">
                  <span class="text-sm md:text-base font-semibold text-gray-900">
                    {{ option.name }}
                  </span>
                  <span
                    v-if="option.recommended"
                    class="inline-flex items-center px-1.5 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold rounded-full whitespace-nowrap flex-shrink-0"
                  >
                    <Icon icon="mdi:star" class="w-3 h-3 mr-0.5" />
                    Recommandé
                  </span>
                </div>
                <p class="text-xs md:text-sm text-gray-600 mt-0">{{ option.description }}</p>
              </div>
              
              <!-- Prix -->
              <div class="text-right flex-shrink-0 ml-auto">
                <div class="text-base md:text-lg font-bold text-orange-primary whitespace-nowrap">+{{ option.price }}€</div>
                <div v-if="option.duration" class="text-[10px] md:text-xs text-gray-500 whitespace-nowrap">+{{ option.duration }} min</div>
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>



