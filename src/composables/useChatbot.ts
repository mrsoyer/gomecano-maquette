/**
 * Chatbot Composable - AI chat simulation with NLP
 */

import { ref } from 'vue'
import type { ChatbotMessage, ChatbotConversation } from '@/types/support'
import {
  generateChatbotResponse,
  getQuickStartSuggestions
} from '@/mocks/chatbot.mock'

/**
 * Chatbot composable
 * 
 * @returns Chatbot state and methods
 */
export function useChatbot() {
  const messages = ref<ChatbotMessage[]>([])
  const isTyping = ref(false)
  const isOpen = ref(false)

  /**
   * Initialize chatbot with welcome message
   */
  function initialize(): void {
    if (messages.value.length === 0) {
      const welcomeMessage: ChatbotMessage = {
        id: 'bot-welcome',
        author: 'bot',
        content: 'Bonjour ! Je suis l\'assistant virtuel Gomecano. Comment puis-je vous aider aujourd\'hui ?',
        timestamp: new Date().toISOString(),
        suggestions: getQuickStartSuggestions()
      }
      messages.value.push(welcomeMessage)
    }
  }

  /**
   * Send user message
   */
  async function sendMessage(content: string): Promise<void> {
    // Add user message
    const userMessage: ChatbotMessage = {
      id: `user-${Date.now()}`,
      author: 'user',
      content,
      timestamp: new Date().toISOString()
    }
    messages.value.push(userMessage)

    // Show typing indicator
    isTyping.value = true

    try {
      // Generate bot response
      const botResponse = await generateChatbotResponse(content)
      messages.value.push(botResponse)
      
      console.log('[Chatbot] Message sent and response received')
    } catch (error) {
      console.error('[Chatbot] Error generating response:', error)
      
      // Fallback error message
      const errorMessage: ChatbotMessage = {
        id: `bot-error-${Date.now()}`,
        author: 'bot',
        content: 'Désolé, je rencontre un problème technique. Pouvez-vous réessayer ou contacter notre support ?',
        timestamp: new Date().toISOString(),
        suggestions: ['Contacter le support', 'Réessayer']
      }
      messages.value.push(errorMessage)
    } finally {
      isTyping.value = false
    }
  }

  /**
   * Open chatbot
   */
  function open(): void {
    isOpen.value = true
    if (messages.value.length === 0) {
      initialize()
    }
  }

  /**
   * Close chatbot
   */
  function close(): void {
    isOpen.value = false
  }

  /**
   * Toggle chatbot
   */
  function toggle(): void {
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }

  /**
   * Clear conversation
   */
  function clearConversation(): void {
    messages.value = []
    initialize()
  }

  return {
    // State
    messages,
    isTyping,
    isOpen,
    
    // Methods
    initialize,
    sendMessage,
    open,
    close,
    toggle,
    clearConversation
  }
}

