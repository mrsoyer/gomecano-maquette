<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { mockServices } from '@/mocks/services'
import type { Service, ServiceCategory } from '@/types/service'

/**
 * Props
 */
interface Props {
  selectedService?: string
  isCompleted?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectedService: '',
  isCompleted: false
})

/**
 * Emits
 */
const emit = defineEmits<{
  select: [service: string]
}>()

/**
 * Services populaires (pour les sections existantes)
 */
const popularServices = [
  { value: 'vidange', label: '🛢️ Vidange + Filtre' },
  { value: 'freins', label: '🔴 Freins (Plaquettes)' },
  { value: 'revision', label: 'Révision & Vidange' },
  { value: 'pneus', label: 'Changer vos pneus' },
  { value: 'courroie', label: 'Courroie de distribution' },
  { value: 'clim', label: 'Compresseur de climatisation' },
  { value: 'embrayage', label: 'Embrayage' },
  { value: 'plaquettes', label: 'Plaquettes de frein' },
  { value: 'amortisseurs', label: 'Amortisseurs' },
  { value: 'radiateur', label: 'Radiateur' },
  { value: 'autres', label: 'Autres prestations' },
]

/**
 * Get display label for selected service
 */
const selectedServiceLabel = computed(() => {
  const service = popularServices.find(s => s.value === props.selectedService)
  return service ? service.label : ''
})

/**
 * Handle service selection (pour les sections existantes)
 */
function selectService(service: string) {
  emit('select', service)
}

/**
 * Menu open/close state (pour "Autres prestations")
 */
const isMenuOpen = ref(false)

/**
 * Reference to dropdown menu element for scrolling
 */
const dropdownMenuRef = ref<HTMLElement | null>(null)

/**
 * Search query
 */
const searchQuery = ref('')

/**
 * Expanded categories state
 */
const expandedCategories = ref<Set<ServiceCategory>>(new Set())

/**
 * Category labels mapping
 */
const categoryLabels: Record<ServiceCategory, string> = {
  entretien: 'ENTRETIEN',
  freinage: 'FREINAGE',
  distribution: 'DISTRIBUTION',
  pneus: 'PNEUMATIQUES',
  climatisation: 'CLIMATISATION',
  mecanique: 'MÉCANIQUE',
  electricite: 'ÉLECTRICITÉ',
  carrosserie: 'CARROSSERIE',
  diagnostic: 'DIAGNOSTIC',
}

/**
 * Filter services based on search query
 */
const filteredServices = computed(() => {
  if (!searchQuery.value.trim()) {
    return mockServices
  }

  const query = searchQuery.value.toLowerCase().trim()
  return mockServices.filter(service =>
    service.name.toLowerCase().includes(query) ||
    service.description.toLowerCase().includes(query) ||
    categoryLabels[service.category].toLowerCase().includes(query)
  )
})

/**
 * Group filtered services by category
 */
const servicesByCategory = computed(() => {
  const grouped: Record<ServiceCategory, Service[]> = {} as Record<ServiceCategory, Service[]>

  filteredServices.value.forEach(service => {
    if (!grouped[service.category]) {
      grouped[service.category] = []
    }
    grouped[service.category].push(service)
  })

  return grouped
})

/**
 * Categories that have filtered results
 */
const categoriesWithResults = computed(() => {
  return Object.keys(servicesByCategory.value) as ServiceCategory[]
})

/**
 * Auto-expand categories when searching
 */
watch(searchQuery, (newQuery) => {
  if (newQuery.trim()) {
    // Expand all categories that have results
    expandedCategories.value = new Set(categoriesWithResults.value)
  } else {
    // Collapse all when search is cleared
    expandedCategories.value.clear()
  }
})

/**
 * Auto-scroll to dropdown menu when it opens
 */
watch(isMenuOpen, async (isOpen) => {
  if (isOpen) {
    // Wait for DOM to update
    await nextTick()
    // Scroll to dropdown menu
    if (dropdownMenuRef.value) {
      dropdownMenuRef.value.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      })
    }
  }
})

/**
 * Toggle menu open/close
 */
function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
  if (!isMenuOpen.value) {
    // Reset search and collapse categories when closing
    searchQuery.value = ''
    expandedCategories.value.clear()
  }
}

/**
 * Toggle category expansion
 */
function toggleCategory(category: ServiceCategory) {
  if (expandedCategories.value.has(category)) {
    expandedCategories.value.delete(category)
  } else {
    expandedCategories.value.add(category)
  }
}

/**
 * Handle service selection from dropdown menu
 */
function selectServiceFromMenu(serviceId: string) {
  emit('select', serviceId)
  // Close menu after selection
  isMenuOpen.value = false
  searchQuery.value = ''
  expandedCategories.value.clear()
}

/**
 * Format price
 */
function formatPrice(price: number): string {
  return `${price} €`
}
</script>

<template>
  <div class="mt-1 p-1.5 md:p-3 bg-white rounded-lg border border-gray-200">
    <!-- Entretien fréquent -->
    <div class="mb-1.5 md:mb-3">
      <h3 class="text-xs md:text-sm font-bold text-gray-900 mb-1 md:mb-2 flex items-center gap-1">
        <Icon icon="mdi:cog" class="w-4 h-4 md:w-5 md:h-5 text-blue-primary" />
        <span>Entretien fréquent</span>
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-2">
        <button 
          @click="selectService('revision')" 
          class="group p-2 md:p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-orange-primary hover:shadow-lg transition-all text-left"
        >
          <div class="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-1.5">
            <div class="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:cog" class="w-5 h-5 md:w-6 md:h-6 text-blue-primary" />
            </div>
            <h4 class="font-bold text-xs md:text-sm group-hover:text-orange-primary transition-colors">Révision & Vidange</h4>
          </div>
          <p class="text-[10px] md:text-xs text-gray-600">À partir de <span class="font-bold text-orange-primary">69 €</span></p>
        </button>

        <button 
          @click="selectService('pneus')" 
          class="group p-2 md:p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-orange-primary hover:shadow-lg transition-all text-left"
        >
          <div class="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-1.5">
            <div class="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:car-tire-alert" class="w-5 h-5 md:w-6 md:h-6 text-blue-primary" />
            </div>
            <h4 class="font-bold text-xs md:text-sm group-hover:text-orange-primary transition-colors">Changer vos pneus</h4>
          </div>
          <p class="text-[10px] md:text-xs text-gray-600">À partir de <span class="font-bold text-orange-primary">84 €</span></p>
        </button>
      </div>
    </div>

    <!-- Nos réparations les plus populaires -->
    <div>
      <h3 class="text-xs md:text-sm font-bold text-gray-900 mb-1 md:mb-2">Nos réparations les plus populaires</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-1.5 md:gap-2">
        <button 
          @click="selectService('courroie')" 
          class="group p-1.5 md:p-2 bg-white border-2 border-gray-200 rounded-lg hover:border-orange-primary hover:shadow-md transition-all text-center"
        >
          <div class="mb-0.5 md:mb-1 flex justify-center">
            <Icon icon="mdi:engine" class="w-6 h-6 md:w-8 md:h-8 text-blue-primary" />
          </div>
          <p class="text-[10px] md:text-xs font-semibold group-hover:text-orange-primary transition-colors leading-tight">Courroie de distribution</p>
        </button>

        <button 
          @click="selectService('clim')" 
          class="group p-1.5 md:p-2 bg-white border-2 border-gray-200 rounded-lg hover:border-orange-primary hover:shadow-md transition-all text-center"
        >
          <div class="mb-0.5 md:mb-1 flex justify-center">
            <Icon icon="mdi:snowflake" class="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
          </div>
          <p class="text-[10px] md:text-xs font-semibold group-hover:text-orange-primary transition-colors leading-tight">Compresseur de climatisation</p>
        </button>

        <button 
          @click="selectService('embrayage')" 
          class="group p-1.5 md:p-2 bg-white border-2 border-gray-200 rounded-lg hover:border-orange-primary hover:shadow-md transition-all text-center"
        >
          <div class="mb-0.5 md:mb-1 flex justify-center">
            <Icon icon="mdi:car-clutch" class="w-6 h-6 md:w-8 md:h-8 text-blue-primary" />
          </div>
          <p class="text-[10px] md:text-xs font-semibold group-hover:text-orange-primary transition-colors leading-tight">Embrayage</p>
        </button>

        <button 
          @click="selectService('plaquettes')" 
          class="group p-1.5 md:p-2 bg-white border-2 border-gray-200 rounded-lg hover:border-orange-primary hover:shadow-md transition-all text-center"
        >
          <div class="mb-0.5 md:mb-1 flex justify-center">
            <Icon icon="mdi:car-brake-abs" class="w-6 h-6 md:w-8 md:h-8 text-red-500" />
          </div>
          <p class="text-[10px] md:text-xs font-semibold group-hover:text-orange-primary transition-colors leading-tight">Plaquettes de frein</p>
        </button>

        <button 
          @click="selectService('amortisseurs')" 
          class="group p-1.5 md:p-2 bg-white border-2 border-gray-200 rounded-lg hover:border-orange-primary hover:shadow-md transition-all text-center"
        >
          <div class="mb-0.5 md:mb-1 flex justify-center">
            <Icon icon="mdi:car-shift-pattern" class="w-6 h-6 md:w-8 md:h-8 text-orange-primary" />
          </div>
          <p class="text-[10px] md:text-xs font-semibold group-hover:text-orange-primary transition-colors leading-tight">Amortisseurs</p>
        </button>

        <button 
          @click="selectService('radiateur')" 
          class="group p-1.5 md:p-2 bg-white border-2 border-gray-200 rounded-lg hover:border-orange-primary hover:shadow-md transition-all text-center"
        >
          <div class="mb-0.5 md:mb-1 flex justify-center">
            <Icon icon="mdi:radiator" class="w-6 h-6 md:w-8 md:h-8 text-red-400" />
          </div>
          <p class="text-[10px] md:text-xs font-semibold group-hover:text-orange-primary transition-colors leading-tight">Radiateur</p>
        </button>
      </div>
    </div>

    <!-- Menu déroulant Autres prestations -->
    <div class="mt-1.5 md:mt-3 relative">
      <!-- Button to open menu -->
      <button
        v-if="!isMenuOpen"
        @click="toggleMenu"
        type="button"
        class="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-sm rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
      >
        <span>Autres prestations</span>
        <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Dropdown menu -->
      <div
        v-if="isMenuOpen"
        ref="dropdownMenuRef"
        class="absolute left-0 right-0 z-50 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl"
      >
        <!-- Search bar -->
        <div class="p-4 border-b border-gray-200">
          <div class="flex w-full overflow-hidden border border-gray-300 rounded-lg">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher"
              class="w-full h-14 pl-4 focus:outline-none"
              autofocus
            />
            <div class="flex items-center pr-4 pl-1">
              <svg viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0">
                <rect width="1.76471" height="7.05882" rx="0.882353" transform="matrix(0.716719 -0.697362 0.716719 0.697362 9.5564 10.6829)" fill="#2f6883"></rect>
                <ellipse cx="6.45932" cy="6.47745" rx="4.98764" ry="4.85294" stroke="#2f6883" stroke-width="1.5"></ellipse>
              </svg>
            </div>
          </div>
        </div>

        <!-- Categories list -->
        <div class="max-h-96 overflow-y-auto">
          <ul class="w-full">
            <li v-for="category in categoriesWithResults" :key="category">
              <button
                type="button"
                @click="toggleCategory(category)"
                class="w-full py-2 px-4 h-11 flex items-center hover:bg-gray-50 transition-colors"
              >
                <div class="flex justify-between w-full items-center text-left">
                  <span class="font-semibold text-sm">{{ categoryLabels[category] }}</span>
                  <div>
                    <svg
                      width="18"
                      height="10"
                      viewBox="0 0 18 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      class="shrink-0 transition-transform"
                      :class="{ 'rotate-180': expandedCategories.has(category) }"
                    >
                      <path
                        d="M1.2854 0.756104L8.7854 8.2561L16.2854 0.756104"
                        stroke="#2f6883"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      ></path>
                    </svg>
                  </div>
                </div>
              </button>

              <!-- Services in category -->
              <div
                v-if="expandedCategories.has(category)"
                class="px-4 pb-2 space-y-1 bg-gray-50"
              >
                <button
                  v-for="service in servicesByCategory[category]"
                  :key="service.id"
                  @click="selectServiceFromMenu(service.id)"
                  class="w-full text-left py-2 px-3 rounded-lg hover:bg-blue-50 hover:text-blue-primary transition-colors"
                  :class="{ 'bg-blue-50 text-blue-primary': props.selectedService === service.id }"
                >
                  <div class="flex justify-between items-center">
                    <span class="font-medium text-sm">{{ service.name }}</span>
                    <span class="text-xs text-gray-600 ml-2" v-if="service.isInstantQuote">
                      À partir de {{ formatPrice(service.priceFrom) }}
                    </span>
                  </div>
                </button>
              </div>
            </li>
          </ul>

          <!-- Empty state -->
          <div v-if="filteredServices.length === 0 && searchQuery.trim()" class="py-8 text-center text-gray-500">
            <p>Aucun service trouvé pour "{{ searchQuery }}"</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Rendez-vous diagnostic avec image -->
    <div class="mt-3">
      <button
        @click="selectService('diagnostic')"
        class="w-full group bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-orange-primary hover:shadow-xl transition-all"
      >
        <!-- Image -->
        <div class="relative h-48 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
          <img
            src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=400&fit=crop&q=80"
            alt="Mécanicien avec outil de diagnostic"
            class="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
            loading="lazy"
            @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
          />
          <div class="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/40 to-transparent"></div>
          <div class="absolute top-0 left-0 right-0 p-4 text-white">
            <h3 class="text-lg font-bold mb-1">Un problème avec votre voiture ?</h3>
            <p class="text-sm opacity-90">Prenez rendez-vous avec un de nos mécaniciens</p>
          </div>
        </div>
        <!-- Prix -->
        <div class="p-3 bg-white flex items-center justify-between">
          <span class="text-sm font-semibold text-gray-700 group-hover:text-orange-primary transition-colors">
            Diagnostic complet
          </span>
          <span class="text-lg font-bold text-orange-primary">
            59 €
          </span>
        </div>
      </button>
    </div>
  </div>
</template>
