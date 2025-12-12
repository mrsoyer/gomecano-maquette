<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores/user.store'
import { useSupport } from '@/composables/useSupport'
import { useChatbot } from '@/composables/useChatbot'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'

const userStore = useUserStore()
const { tickets, faqArticles, faqCategories, isLoading, fetchTickets, searchFAQ } = useSupport('user-1')
const { messages, isTyping, sendMessage, initialize } = useChatbot()

const activeTab = ref<'tickets' | 'chatbot' | 'faq'>('chatbot')
const selectedCategory = ref<string>('all')
const searchQuery = ref('')
const userMessage = ref('')

onMounted(async () => {
  if (!userStore.isAuthenticated) {
    await userStore.loginById('user-1')
  }
  
  // Init data
  await fetchTickets()
  await searchFAQ()
  initialize()
})

// Filtered FAQ
const filteredFAQ = computed(() => {
  let results = [...faqArticles.value]
  
  if (selectedCategory.value !== 'all') {
    results = results.filter(a => a.category === selectedCategory.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    results = results.filter(a =>
      a.question.toLowerCase().includes(query) ||
      a.answer.toLowerCase().includes(query)
    )
  }
  
  return results
})

// Handle send message
async function handleSendMessage(): void {
  if (!userMessage.value.trim()) return
  
  await sendMessage(userMessage.value)
  userMessage.value = ''
}

// Handle suggestion click
function handleSuggestionClick(suggestion: string): void {
  userMessage.value = suggestion
  handleSendMessage()
}

// Get status badge
function getStatusBadge(status: string) {
  const badges = {
    open: { label: 'Ouvert', class: 'bg-blue-100 text-blue-800' },
    in_progress: { label: 'En cours', class: 'bg-orange-100 text-orange-800' },
    resolved: { label: 'Résolu', class: 'bg-green-100 text-green-800' },
    closed: { label: 'Fermé', class: 'bg-gray-100 text-gray-800' }
  }
  return badges[status] || badges.open
}

// Get priority badge
function getPriorityBadge(priority: string) {
  const badges = {
    low: { label: 'Faible', class: 'bg-gray-100 text-gray-700' },
    medium: { label: 'Moyenne', class: 'bg-yellow-100 text-yellow-700' },
    high: { label: 'Haute', class: 'bg-orange-100 text-orange-700' },
    urgent: { label: 'Urgent', class: 'bg-red-100 text-red-700' }
  }
  return badges[priority] || badges.medium
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <Container class="py-6">
      <h1 class="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
        Support & Aide
      </h1>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6 border-b border-gray-200">
        <button
          @click="activeTab = 'chatbot'"
          :class="[
            'px-4 py-3 font-medium transition-colors relative',
            activeTab === 'chatbot'
              ? 'text-blue-primary'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          Assistant virtuel
          <div
            v-if="activeTab === 'chatbot'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-primary"
          />
        </button>
        
        <button
          @click="activeTab = 'tickets'"
          :class="[
            'px-4 py-3 font-medium transition-colors relative',
            activeTab === 'tickets'
              ? 'text-blue-primary'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          Mes tickets ({{ tickets.length }})
          <div
            v-if="activeTab === 'tickets'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-primary"
          />
        </button>
        
        <button
          @click="activeTab = 'faq'"
          :class="[
            'px-4 py-3 font-medium transition-colors relative',
            activeTab === 'faq'
              ? 'text-blue-primary'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          FAQ
          <div
            v-if="activeTab === 'faq'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-primary"
          />
        </button>
      </div>

      <!-- Chatbot Tab -->
      <div v-if="activeTab === 'chatbot'" class="max-w-2xl mx-auto">
        <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
          <!-- Messages -->
          <div class="h-96 overflow-y-auto p-4 space-y-4">
            <div
              v-for="msg in messages"
              :key="msg.id"
              :class="[
                'flex',
                msg.author === 'user' ? 'justify-end' : 'justify-start'
              ]"
            >
              <div
                :class="[
                  'max-w-[80%] px-4 py-2 rounded-lg',
                  msg.author === 'user'
                    ? 'bg-blue-primary text-white'
                    : 'bg-gray-100 text-gray-900'
                ]"
              >
                <p class="text-sm">{{ msg.content }}</p>
                
                <!-- Suggestions -->
                <div
                  v-if="msg.suggestions && msg.suggestions.length > 0"
                  class="mt-3 flex flex-wrap gap-2"
                >
                  <button
                    v-for="(suggestion, index) in msg.suggestions"
                    :key="index"
                    @click="handleSuggestionClick(suggestion)"
                    class="px-3 py-1 text-xs bg-white text-blue-primary border border-blue-200 rounded-full hover:bg-blue-50 transition-colors"
                  >
                    {{ suggestion }}
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Typing indicator -->
            <div v-if="isTyping" class="flex justify-start">
              <div class="bg-gray-100 px-4 py-2 rounded-lg">
                <span class="text-sm text-gray-600">...</span>
              </div>
            </div>
          </div>

          <!-- Input -->
          <div class="border-t border-gray-200 p-4">
            <form @submit.prevent="handleSendMessage" class="flex gap-2">
              <input
                v-model="userMessage"
                type="text"
                placeholder="Tapez votre message..."
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-primary"
              />
              <button
                type="submit"
                :disabled="!userMessage.trim()"
                class="px-6 py-2 bg-blue-primary text-white rounded-lg hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Envoyer
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Tickets Tab -->
      <div v-if="activeTab === 'tickets'">
        <div v-if="isLoading" class="text-center py-8">
          <Icon icon="mdi:loading" class="w-8 h-8 animate-spin text-blue-primary mx-auto" />
        </div>
        
        <div v-else-if="tickets.length === 0" class="text-center py-12">
          <Icon icon="mdi:ticket-outline" class="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-600">Aucun ticket</p>
        </div>
        
        <div v-else class="space-y-4">
          <div
            v-for="ticket in tickets"
            :key="ticket.id"
            class="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">
                  {{ ticket.subject }}
                </h3>
                <p class="text-sm text-gray-600 line-clamp-2">
                  {{ ticket.description }}
                </p>
              </div>
              
              <div class="flex flex-col items-end gap-2">
                <span
                  :class="[
                    'px-2.5 py-1 rounded-full text-xs font-medium',
                    getStatusBadge(ticket.status).class
                  ]"
                >
                  {{ getStatusBadge(ticket.status).label }}
                </span>
                <span
                  :class="[
                    'px-2.5 py-1 rounded-full text-xs font-medium',
                    getPriorityBadge(ticket.priority).class
                  ]"
                >
                  {{ getPriorityBadge(ticket.priority).label }}
                </span>
              </div>
            </div>
            
            <div class="flex items-center gap-4 text-xs text-gray-500">
              <span>Créé le {{ new Date(ticket.createdAt).toLocaleDateString('fr-FR') }}</span>
              <span>•</span>
              <span>{{ ticket.messages.length }} message(s)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQ Tab -->
      <div v-if="activeTab === 'faq'">
        <!-- Search -->
        <div class="mb-6">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher dans la FAQ..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-primary"
          />
        </div>

        <!-- Categories -->
        <div class="flex flex-wrap gap-2 mb-6">
          <button
            @click="selectedCategory = 'all'"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              selectedCategory === 'all'
                ? 'bg-blue-primary text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-300'
            ]"
          >
            Tous
          </button>
          <button
            v-for="category in faqCategories"
            :key="category.id"
            @click="selectedCategory = category.id"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2',
              selectedCategory === category.id
                ? 'bg-blue-primary text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-300'
            ]"
          >
            <Icon :icon="category.icon" class="w-4 h-4" />
            {{ category.name }}
          </button>
        </div>

        <!-- Articles -->
        <div class="space-y-4">
          <details
            v-for="article in filteredFAQ"
            :key="article.id"
            class="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors"
          >
            <summary class="font-semibold text-gray-900 cursor-pointer flex items-center gap-2">
              <Icon icon="mdi:help-circle" class="w-5 h-5 text-blue-primary" />
              {{ article.question }}
            </summary>
            <div class="mt-3 pl-7 text-sm text-gray-700 whitespace-pre-line">
              {{ article.answer }}
            </div>
            <div class="mt-3 pl-7 flex items-center gap-4 text-xs text-gray-500">
              <span>👍 {{ article.helpful }}</span>
              <span>👎 {{ article.notHelpful }}</span>
            </div>
          </details>
        </div>
      </div>
    </Container>

    <Footer />
  </div>
</template>

