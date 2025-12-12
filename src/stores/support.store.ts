/**
 * Support Store - Tickets and chatbot history
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SupportTicket, ChatbotConversation } from '@/types/support'

export const useSupportStore = defineStore('support', () => {
  // State
  const tickets = ref<SupportTicket[]>([])
  const chatHistory = ref<ChatbotConversation[]>([])
  const isLoading = ref(false)

  // Getters
  const openTickets = computed(() =>
    tickets.value.filter(t => t.status === 'open' || t.status === 'in_progress')
  )

  const resolvedTickets = computed(() =>
    tickets.value.filter(t => t.status === 'resolved' || t.status === 'closed')
  )

  const openTicketsCount = computed(() => openTickets.value.length)

  // Actions
  function addTicket(ticket: SupportTicket): void {
    tickets.value.unshift(ticket)
  }

  function updateTicket(ticketId: string, updates: Partial<SupportTicket>): void {
    const index = tickets.value.findIndex(t => t.id === ticketId)
    if (index !== -1) {
      tickets.value[index] = { ...tickets.value[index], ...updates }
    }
  }

  return {
    // State
    tickets,
    chatHistory,
    isLoading,
    
    // Getters
    openTickets,
    resolvedTickets,
    openTicketsCount,
    
    // Actions
    addTicket,
    updateTicket
  }
})

