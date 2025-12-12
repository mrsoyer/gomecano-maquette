<script setup lang="ts">
import { ref, computed, watch, nextTick, type ComponentPublicInstance } from 'vue'
import type { ServiceQuestion, ServiceAnswer } from '@/types/service'
import { Icon } from '@iconify/vue'
import { useBookingContext } from '@/composables/useBookingContext'
import { getTireDimensionsForVehicle } from '@/mocks/tireDimensions'
import TireDimensionSelector from './TireDimensionSelector.vue'
import TireBrandSelector from './TireBrandSelector.vue'

interface Props {
  isOpen: boolean
  questions: ServiceQuestion[]
  initialAnswers?: ServiceAnswer[]
  serviceName: string
  serviceId: string  // Pour générer tiers/options dynamiques
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  submit: [answers: ServiceAnswer[], shouldGenerate: boolean]
}>()

// Contexte booking (véhicule)
const { savedVehicle } = useBookingContext()

// État local des réponses
const answers = ref<Record<string, string | number>>({})

// Refs pour les questions (pour le scroll automatique)
const questionRefs = ref<Record<string, HTMLElement>>({})

// Ref pour le conteneur scrollable
const scrollContainer = ref<HTMLElement | null>(null)

// Pré-remplir si modification OU valeurs par défaut
watch(() => props.initialAnswers, (newAnswers) => {
  if (newAnswers) {
    const answerMap: Record<string, string | number> = {}
    newAnswers.forEach(answer => {
      answerMap[answer.questionId] = answer.value
    })
    answers.value = answerMap
  } else {
    // Initialiser les valeurs par défaut des questions
    const defaultAnswers: Record<string, string | number> = {}
    props.questions.forEach(question => {
      if (question.defaultValue) {
        defaultAnswers[question.id] = question.defaultValue
      }
    })
    answers.value = defaultAnswers
  }
}, { immediate: true })

/**
 * Scroll automatique vers la prochaine question non répondue
 * IMPORTANT: Scroll uniquement le conteneur interne, PAS la page
 */
watch(answers, async (newAnswers, oldAnswers) => {
  // Éviter le scroll initial (quand on ouvre la modal)
  if (!oldAnswers || Object.keys(oldAnswers).length === 0) return
  
  await nextTick()
  
  // Trouver la première question non répondue (en ignorant celles avec defaultValue)
  const nextUnansweredQuestion = props.questions.find(q => {
    const value = answers.value[q.id]
    const isUnanswered = value === undefined || value === '' || value === null
    // Si la question a une defaultValue, on ne scroll pas vers elle
    const hasDefaultValue = q.defaultValue !== undefined
    
    return isUnanswered && !hasDefaultValue
  })
  
  // Scroller vers cette question en utilisant UNIQUEMENT le scroll du conteneur
  if (nextUnansweredQuestion && questionRefs.value[nextUnansweredQuestion.id] && scrollContainer.value) {
    scrollToQuestion(nextUnansweredQuestion.id)
  }
}, { deep: true })

/**
 * Scroll vers une question spécifique
 */
function scrollToQuestion(questionId: string) {
  const element = questionRefs.value[questionId]
  const container = scrollContainer.value
  
  if (!element || !container) return
  
  // Calculer la position de l'élément par rapport au conteneur
  const elementTop = element.offsetTop
  const containerHeight = container.clientHeight
  const elementHeight = element.clientHeight
  
  // Centrer l'élément dans le conteneur
  const scrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2)
  
  // Scroller UNIQUEMENT le conteneur, pas la page
  container.scrollTo({
    top: scrollTop,
    behavior: 'smooth'
  })
}

/**
 * Handle dropdown ouvert (marques) - scroll vers la question
 */
function handleBrandDropdownOpened() {
  // Scroller vers la question marque quand dropdown s'ouvre
  nextTick(() => {
    scrollToQuestion('marque')
  })
}

/**
 * Setter pour les refs de questions
 */
function setQuestionRef(questionId: string) {
  return (el: Element | ComponentPublicInstance | null) => {
    if (el && el instanceof HTMLElement) {
      questionRefs.value[questionId] = el
    }
  }
}

/**
 * Dimensions suggérées pour le véhicule actuel
 */
const suggestedTireDimensions = computed(() => {
  if (!savedVehicle.value) return []
  return getTireDimensionsForVehicle(savedVehicle.value.make, savedVehicle.value.model)
})

/**
 * Validation - toutes les questions requises sont répondues
 */
const canSubmit = computed(() => {
  return props.questions
    .filter(q => q.required)
    .every(q => {
      const value = answers.value[q.id]
      return value !== undefined && value !== '' && value !== null
    })
})

/**
 * Soumet les réponses et déclenche génération tiers/options si applicable
 */
async function handleSubmit() {
  const serviceAnswers: ServiceAnswer[] = props.questions
    .filter(q => answers.value[q.id] !== undefined && answers.value[q.id] !== '')
    .map(q => ({
      questionId: q.id,
      value: answers.value[q.id],
      label: formatAnswerLabel(q, answers.value[q.id])
    }))
  
  // Afficher loader pendant génération
  isGenerating.value = true
  
  // Simuler délai génération (600ms = 400ms tiers + 200ms options)
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // Émettre avec flag de génération
  // Le parent (ServiceDetail) gérera la génération via composables
  emit('submit', serviceAnswers, true)
  
  isGenerating.value = false
}

/**
 * Formate le label de la réponse pour affichage
 */
function formatAnswerLabel(question: ServiceQuestion, value: string | number): string {
  if (question.type === 'select' || question.type === 'radio' || question.type === 'radio-icons') {
    const option = question.options?.find(opt => opt.value === String(value))
    return option?.label || String(value)
  }
  if (question.type === 'number' && question.unit) {
    return `${value} ${question.unit}`
  }
  if (question.type === 'checkbox') {
    const selectedOptions = question.options?.filter(opt => 
      String(value).split(',').includes(opt.value)
    )
    return selectedOptions?.map(opt => opt.label).join(', ') || String(value)
  }
  if (question.type === 'tire-dimension') {
    return String(value) // Déjà formaté (ex: '205/55 R16 91 V')
  }
  return String(value)
}

/**
 * Message d'alerte si tentative fermeture sans répondre
 */
const showAlert = ref(false)

/**
 * Loading state pendant génération tiers/options
 */
const isGenerating = ref(false)

/**
 * Ferme la modal seulement si questions requises répondues
 */
function handleClose() {
  // Vérifier si questions requises sont répondues
  if (!canSubmit.value) {
    showAlert.value = true
    setTimeout(() => {
      showAlert.value = false
    }, 3000)
    return
  }
  
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <!-- Overlay -->
        <div 
          class="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          @click="handleClose"
        />
        
        <!-- Modal -->
        <div class="relative bg-white rounded-lg md:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Header sticky -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 md:px-4 md:py-3 z-10">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h2 class="text-base md:text-lg font-bold text-gray-900">Précisez votre besoin</h2>
                <p class="text-xs md:text-sm text-gray-600 mt-0.5">{{ serviceName }}</p>
              </div>
              <button
                @click="handleClose"
                class="w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0 ml-2"
                :class="{ 'opacity-50 cursor-not-allowed': !canSubmit }"
                aria-label="Fermer"
                :title="!canSubmit ? 'Veuillez répondre aux questions obligatoires' : 'Fermer'"
              >
                <Icon icon="mdi:close" class="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
              </button>
            </div>
            
            <!-- Alerte si tentative fermeture sans répondre -->
            <Transition name="alert-slide">
              <div 
                v-if="showAlert"
                class="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
              >
                <Icon icon="mdi:alert-circle" class="w-4 h-4 md:w-5 md:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div class="flex-1">
                  <p class="text-xs md:text-sm font-semibold text-red-900">Informations obligatoires manquantes</p>
                  <p class="text-[10px] md:text-xs text-red-700 mt-0.5">
                    Veuillez répondre aux questions marquées d'un astérisque (*) pour calculer le prix.
                  </p>
                </div>
              </div>
            </Transition>
          </div>
          
          <!-- Content scrollable -->
          <div ref="scrollContainer" class="flex-1 overflow-y-auto p-2 md:p-3">
            <div class="space-y-3">
              <div 
                v-for="question in questions" 
                :key="question.id" 
                :ref="setQuestionRef(question.id)"
                class="space-y-1 scroll-mt-16"
              >
                <label class="block text-xs md:text-sm font-semibold text-gray-900">
                  {{ question.label }}
                  <span v-if="question.required" class="text-red-500 ml-1">*</span>
                </label>
                
                <p v-if="question.helpText" class="text-[10px] md:text-xs text-gray-500">
                  {{ question.helpText }}
                </p>
                
                <!-- Number input -->
                <input
                  v-if="question.type === 'number'"
                  v-model.number="answers[question.id]"
                  type="number"
                  :min="question.min"
                  :max="question.max"
                  :placeholder="question.placeholder"
                  class="w-full px-2.5 py-2 md:px-3 md:py-2.5 text-xs md:text-sm border-2 border-gray-300 rounded-lg focus:border-orange-primary focus:ring-2 focus:ring-orange-primary/20 transition-colors"
                />
                
                <!-- Select -->
                <select
                  v-else-if="question.type === 'select'"
                  v-model="answers[question.id]"
                  class="w-full px-2.5 py-2 md:px-3 md:py-2.5 text-xs md:text-sm border-2 border-gray-300 rounded-lg focus:border-orange-primary focus:ring-2 focus:ring-orange-primary/20 transition-colors"
                >
                  <option value="">Choisir...</option>
                  <option 
                    v-for="opt in question.options" 
                    :key="opt.value" 
                    :value="opt.value"
                  >
                    {{ opt.label }}
                    <span v-if="opt.priceModifier"> (+{{ opt.priceModifier }}€)</span>
                  </option>
                </select>
                
                <!-- Radio -->
                <div v-else-if="question.type === 'radio'" class="space-y-1.5">
                  <label
                    v-for="opt in question.options"
                    :key="opt.value"
                    class="flex items-center gap-2 p-2 md:p-2.5 border-2 rounded-lg cursor-pointer transition-all"
                    :class="answers[question.id] === opt.value 
                      ? 'border-orange-primary bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300'"
                    @click.prevent="answers[question.id] = opt.value"
                  >
                    <input
                      :checked="answers[question.id] === opt.value"
                      type="radio"
                      :value="opt.value"
                      tabindex="-1"
                      class="w-4 h-4 text-orange-primary focus:ring-orange-primary pointer-events-none"
                    />
                    <div class="flex-1 pointer-events-none">
                      <div class="text-xs md:text-sm font-medium text-gray-900">{{ opt.label }}</div>
                      <div v-if="opt.priceModifier" class="text-[10px] md:text-xs text-gray-600 mt-0.5">
                        +{{ opt.priceModifier }}€
                      </div>
                    </div>
                  </label>
                </div>

                <!-- Checkbox (single or multiple) -->
                <div v-else-if="question.type === 'checkbox'" class="space-y-1.5">
                  <label
                    v-for="opt in question.options"
                    :key="opt.value"
                    class="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all"
                    :class="String(answers[question.id] || '').includes(opt.value)
                      ? 'border-orange-primary bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300'"
                  >
                    <input
                      v-model="answers[question.id]"
                      type="checkbox"
                      :value="opt.value"
                      class="w-4 h-4 md:w-5 md:h-5 text-orange-primary rounded focus:ring-orange-primary"
                    />
                    <div class="flex-1">
                      <div class="text-sm md:text-base font-medium text-gray-900">{{ opt.label }}</div>
                      <div v-if="opt.priceModifier" class="text-xs md:text-sm text-gray-600 mt-0.5">
                        +{{ opt.priceModifier }}€
                      </div>
                    </div>
                  </label>
                </div>

                <!-- Tire Dimension (spécial pneus) -->
                <TireDimensionSelector
                  v-else-if="question.type === 'tire-dimension'"
                  :suggested-dimensions="suggestedTireDimensions"
                  :explanation-image="question.explanationImage"
                  :explanation-text="question.explanationText"
                  v-model="answers[question.id]"
                />
                
                <!-- Tire Brand Selector (spécial pneus) -->
                <TireBrandSelector
                  v-else-if="question.type === 'tire-brand'"
                  v-model="answers[question.id]"
                  :nombre-pneus="String(answers['nombre-pneus'] || '')"
                  :dimension="String(answers['dimension'] || '')"
                  :type-pneu="String(answers['saison'] || '')"
                  @dropdown-opened="handleBrandDropdownOpened"
                />

                <!-- Radio with Icons -->
                <div v-else-if="question.type === 'radio-icons'" class="grid grid-cols-3 gap-1.5">
                  <label
                    v-for="opt in question.options"
                    :key="opt.value"
                    class="flex flex-col items-center gap-1.5 p-2 border-2 rounded-lg cursor-pointer transition-all text-center"
                    :class="answers[question.id] === opt.value 
                      ? 'border-orange-primary bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300'"
                    @click.prevent="answers[question.id] = opt.value"
                  >
                    <input
                      :checked="answers[question.id] === opt.value"
                      type="radio"
                      :value="opt.value"
                      tabindex="-1"
                      class="sr-only"
                    />
                    <Icon
                      v-if="opt.icon"
                      :icon="opt.icon"
                      class="w-8 h-8 md:w-10 md:h-10 pointer-events-none"
                      :class="answers[question.id] === opt.value ? 'text-orange-primary' : 'text-gray-400'"
                    />
                    <div class="w-full pointer-events-none">
                      <div class="text-xs md:text-sm font-bold text-gray-900">{{ opt.label }}</div>
                      <div v-if="opt.description" class="text-[9px] md:text-[10px] text-gray-600 mt-0.5 leading-tight">
                        {{ opt.description }}
                      </div>
                      <div v-if="opt.priceModifier" class="text-[10px] md:text-xs text-orange-primary font-semibold mt-0.5">
                        +{{ opt.priceModifier }}€
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Footer sticky -->
          <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-3 py-2 md:px-4 md:py-3 flex gap-2">
            <button
              @click="handleClose"
              :disabled="isGenerating"
              class="flex-1 px-4 py-2 md:px-6 md:py-3 text-sm md:text-base border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Annuler
            </button>
            <button
              @click="handleSubmit"
              :disabled="!canSubmit || isGenerating"
              class="flex-1 px-4 py-2 md:px-6 md:py-3 text-sm md:text-base bg-orange-primary text-white rounded-lg font-semibold hover:bg-orange-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Icon 
                v-if="isGenerating" 
                icon="mdi:loading" 
                class="w-5 h-5 animate-spin" 
              />
              <span>{{ isGenerating ? 'Génération...' : 'Valider' }}</span>
            </button>
          </div>
          
          <!-- Overlay de génération -->
          <Transition name="fade">
            <div 
              v-if="isGenerating"
              class="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20"
            >
              <div class="text-center px-4">
                <Icon icon="mdi:loading" class="w-12 h-12 md:w-16 md:h-16 text-orange-primary animate-spin mx-auto mb-3" />
                <p class="text-sm md:text-base font-semibold text-gray-900">Génération des options...</p>
                <p class="text-xs md:text-sm text-gray-600 mt-1">Calcul des gammes et options personnalisées</p>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Alert slide animation */
.alert-slide-enter-active,
.alert-slide-leave-active {
  transition: all 0.3s ease;
}

.alert-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.alert-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* Fade animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>



