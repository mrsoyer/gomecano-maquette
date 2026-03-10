/**
 * Chatbot Composable - AI chat with OpenAI integration
 *
 * @description Migrated to Supabase Functions-First architecture (Session 09)
 * Uses Edge Function: modules (action: chatbot_respond)
 */

import { ref } from 'vue'
import type { ChatbotMessage } from '@/types/support'
import { callEdgeFunction } from '@/services/supabase'

// Import mocks for fallback
import {
  generateChatbotResponse as generateChatbotResponseMock,
  getQuickStartSuggestions
} from '@/mocks/chatbot.mock'

// Toggle for mock vs real data
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true'

// Edge Function response types
interface ChatbotEdgeResponse {
  message: {
    id: string
    content: string
    suggestions?: string[]
  }
  conversation_id: string
  intent: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

/**
 * Chatbot composable
 *
 * @returns Chatbot state and methods
 */
export function useChatbot() {
  const messages = ref<ChatbotMessage[]>([])
  const isTyping = ref(false)
  const isOpen = ref(false)
  const conversationId = ref<string | null>(null)

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
      let botResponse: ChatbotMessage

      if (USE_MOCK_DATA) {
        // Use mock response
        botResponse = await generateChatbotResponseMock(content)
      } else {
        // Call Edge Function
        const response = await callEdgeFunction<ChatbotEdgeResponse>('modules', {
          action: 'chatbot_respond',
          message: content,
          conversation_id: conversationId.value
        })

        // Store conversation ID for context continuity
        if (response.conversation_id) {
          conversationId.value = response.conversation_id
        }

        // Transform to ChatbotMessage format
        botResponse = {
          id: response.message.id,
          author: 'bot',
          content: response.message.content,
          timestamp: new Date().toISOString(),
          suggestions: response.message.suggestions
        }

        console.log('[Chatbot] OpenAI response received, intent:', response.intent)
      }

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
    conversationId.value = null
    initialize()
  }

  return {
    // State
    messages,
    isTyping,
    isOpen,
    conversationId,

    // Methods
    initialize,
    sendMessage,
    open,
    close,
    toggle,
    clearConversation
  }
}




