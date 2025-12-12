<script setup lang="ts">
import { ref, computed } from 'vue'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

// State
const isOpen = ref(false)
const messages = ref<Message[]>([
  {
    id: '1',
    text: 'Bonjour ! 👋 Comment puis-je vous aider aujourd\'hui ?',
    sender: 'bot',
    timestamp: new Date()
  }
])
const inputMessage = ref('')
const isTyping = ref(false)

// Computed
const unreadCount = computed(() => {
  // Simulate unread messages when closed
  return isOpen.value ? 0 : messages.value.filter(m => m.sender === 'bot').length
})

/**
 * Toggle chatbot visibility
 */
function toggleChat() {
  isOpen.value = !isOpen.value
}

/**
 * Send a message
 */
async function sendMessage() {
  if (!inputMessage.value.trim()) return

  // Add user message
  const userMessage: Message = {
    id: Date.now().toString(),
    text: inputMessage.value,
    sender: 'user',
    timestamp: new Date()
  }
  messages.value.push(userMessage)
  
  const messageText = inputMessage.value
  inputMessage.value = ''

  // Simulate bot typing
  isTyping.value = true
  
  // Simulate bot response after delay
  setTimeout(() => {
    const botResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: getBotResponse(messageText),
      sender: 'bot',
      timestamp: new Date()
    }
    messages.value.push(botResponse)
    isTyping.value = false
  }, 1500)
}

/**
 * Get bot response based on user input
 * 
 * @param userMessage - User's message
 * @returns Bot response text
 */
function getBotResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase()
  
  if (msg.includes('prix') || msg.includes('tarif')) {
    return 'Nos tarifs varient selon le service. Voulez-vous un devis gratuit ?'
  }
  if (msg.includes('rdv') || msg.includes('rendez-vous') || msg.includes('réservation')) {
    return 'Pour prendre rendez-vous, cliquez sur "Réserver" en haut de la page ou appelez-nous au 01 23 45 67 89.'
  }
  if (msg.includes('horaire')) {
    return 'Nous intervenons du lundi au samedi, de 8h à 19h. Dimanche sur demande.'
  }
  if (msg.includes('zone') || msg.includes('où')) {
    return 'Nous intervenons partout en Île-de-France. Quelle est votre ville ?'
  }
  
  return 'Merci pour votre message ! Un conseiller va vous répondre rapidement. Pour une réponse immédiate, appelez-nous au 01 23 45 67 89.'
}

/**
 * Format time for message display
 * 
 * @param date - Message timestamp
 * @returns Formatted time string
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
</script>

<template>
  <!-- Chatbot Container -->
  <div class="fixed bottom-6 right-6 z-50">
    <!-- Chat Window -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-95"
    >
      <div
        v-if="isOpen"
        class="mb-4 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
      >
        <!-- Header -->
        <div class="bg-gradient-to-r from-orange-primary to-orange-hover px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span class="text-2xl">💬</span>
            </div>
            <div class="text-white">
              <h3 class="font-semibold text-lg">Assistance Gomecano</h3>
              <p class="text-xs text-orange-light">En ligne</p>
            </div>
          </div>
          <button
            @click="toggleChat"
            class="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            aria-label="Fermer le chat"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Messages Container -->
        <div class="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
          <!-- Messages -->
          <div
            v-for="message in messages"
            :key="message.id"
            :class="[
              'flex',
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            ]"
          >
            <div
              :class="[
                'max-w-[75%] rounded-2xl px-4 py-3 shadow-sm',
                message.sender === 'user'
                  ? 'bg-orange-primary text-white rounded-br-sm'
                  : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
              ]"
            >
              <p class="text-sm leading-relaxed">{{ message.text }}</p>
              <p
                :class="[
                  'text-xs mt-1',
                  message.sender === 'user' ? 'text-orange-light' : 'text-gray-500'
                ]"
              >
                {{ formatTime(message.timestamp) }}
              </p>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="isTyping" class="flex justify-start">
            <div class="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-200">
              <div class="flex gap-1">
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <form
          @submit.prevent="sendMessage"
          class="p-4 bg-white border-t border-gray-200"
        >
          <div class="flex gap-2">
            <input
              v-model="inputMessage"
              type="text"
              placeholder="Écrivez votre message..."
              class="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-primary focus:border-transparent text-sm"
            />
            <button
              type="submit"
              :disabled="!inputMessage.trim()"
              class="px-6 py-3 bg-orange-primary text-white rounded-full hover:bg-orange-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-sm"
            >
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </Transition>

    <!-- Chat Button -->
    <button
      @click="toggleChat"
      class="w-16 h-16 bg-gradient-to-r from-orange-primary to-orange-hover text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center relative"
      aria-label="Ouvrir le chat"
    >
      <!-- Chat Icon -->
      <svg
        v-if="!isOpen"
        class="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      
      <!-- Close Icon -->
      <svg
        v-else
        class="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>

      <!-- Unread Badge -->
      <span
        v-if="!isOpen && unreadCount > 0"
        class="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
      >
        {{ unreadCount }}
      </span>
    </button>
  </div>
</template>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #2f6883;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #d1710f;
}
</style>
