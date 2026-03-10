/**
 * Support Store - Tickets and chatbot via Supabase RPC
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'

export interface SupportTicket {
  id: string
  userId: string
  subject: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed'
  assignedTo: string | null
  appointmentId: string | null
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
}

export interface TicketMessage {
  id: string
  ticketId: string
  senderId: string
  senderType: 'client' | 'support' | 'system'
  message: string
  attachments: string[]
  createdAt: string
}

export interface ChatbotConversation {
  id: string
  userId: string
  messages: ChatMessage[]
  resolved: boolean
  createdAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export const useSupportStore = defineStore('support', () => {
  // State
  const tickets = ref<SupportTicket[]>([])
  const currentTicket = ref<SupportTicket | null>(null)
  const messages = ref<TicketMessage[]>([])
  const chatHistory = ref<ChatbotConversation[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const openTickets = computed(() =>
    tickets.value.filter(t => t.status === 'open' || t.status === 'in_progress' || t.status === 'waiting_customer')
  )

  const resolvedTickets = computed(() =>
    tickets.value.filter(t => t.status === 'resolved' || t.status === 'closed')
  )

  const openTicketsCount = computed(() => openTickets.value.length)

  /**
   * Fetch all tickets via RPC
   */
  async function fetchTickets(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('account_get_support_tickets')

      if (fetchError) throw fetchError

      tickets.value = (data || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        userId: row.user_id as string,
        subject: row.subject as string,
        category: row.category as string,
        priority: row.priority as SupportTicket['priority'],
        status: row.status as SupportTicket['status'],
        assignedTo: row.assigned_to as string | null,
        appointmentId: row.appointment_id as string | null,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
        resolvedAt: row.resolved_at as string | null
      }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch tickets'
      console.error('Error fetching tickets:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch single ticket with messages via RPC
   */
  async function fetchTicket(ticketId: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('account_get_support_ticket', {
          p_ticket_id: ticketId
        })

      if (fetchError) throw fetchError

      if (data) {
        const ticketData = data.ticket as Record<string, unknown>
        currentTicket.value = {
          id: ticketData.id as string,
          userId: ticketData.user_id as string,
          subject: ticketData.subject as string,
          category: ticketData.category as string,
          priority: ticketData.priority as SupportTicket['priority'],
          status: ticketData.status as SupportTicket['status'],
          assignedTo: ticketData.assigned_to as string | null,
          appointmentId: ticketData.appointment_id as string | null,
          createdAt: ticketData.created_at as string,
          updatedAt: ticketData.updated_at as string,
          resolvedAt: ticketData.resolved_at as string | null
        }

        messages.value = ((data.messages || []) as Record<string, unknown>[]).map(row => ({
          id: row.id as string,
          ticketId: row.ticket_id as string,
          senderId: row.sender_id as string,
          senderType: row.sender_type as TicketMessage['senderType'],
          message: row.message as string,
          attachments: (row.attachments as string[]) || [],
          createdAt: row.created_at as string
        }))
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch ticket'
      console.error('Error fetching ticket:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new ticket via RPC
   */
  async function createTicket(ticket: {
    subject: string
    category: string
    priority?: SupportTicket['priority']
    message: string
    appointmentId?: string
  }): Promise<SupportTicket | null> {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: createError } = await supabase
        .rpc('account_create_support_ticket', {
          p_subject: ticket.subject,
          p_category: ticket.category,
          p_priority: ticket.priority || 'medium',
          p_message: ticket.message,
          p_appointment_id: ticket.appointmentId || null
        })

      if (createError) throw createError

      // Refresh tickets list
      await fetchTickets()

      if (data) {
        return {
          id: data.id,
          userId: data.user_id,
          subject: data.subject,
          category: data.category,
          priority: data.priority,
          status: data.status,
          assignedTo: data.assigned_to,
          appointmentId: data.appointment_id,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          resolvedAt: data.resolved_at
        }
      }
      return null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create ticket'
      console.error('Error creating ticket:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Send a message to a ticket via RPC
   */
  async function sendMessage(
    ticketId: string,
    message: string,
    attachments: string[] = []
  ): Promise<TicketMessage | null> {
    error.value = null

    try {
      const { data, error: sendError } = await supabase
        .rpc('account_send_ticket_message', {
          p_ticket_id: ticketId,
          p_message: message,
          p_attachments: attachments
        })

      if (sendError) throw sendError

      if (data) {
        const newMessage: TicketMessage = {
          id: data.id,
          ticketId: data.ticket_id,
          senderId: data.sender_id,
          senderType: data.sender_type,
          message: data.message,
          attachments: data.attachments || [],
          createdAt: data.created_at
        }
        messages.value.push(newMessage)
        return newMessage
      }
      return null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to send message'
      console.error('Error sending message:', err)
      return null
    }
  }

  /**
   * Close a ticket via RPC
   */
  async function closeTicket(ticketId: string): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const { error: closeError } = await supabase
        .rpc('account_close_support_ticket', {
          p_ticket_id: ticketId
        })

      if (closeError) throw closeError

      // Update local state
      const ticket = tickets.value.find(t => t.id === ticketId)
      if (ticket) {
        ticket.status = 'closed'
        ticket.resolvedAt = new Date().toISOString()
      }
      if (currentTicket.value?.id === ticketId) {
        currentTicket.value.status = 'closed'
        currentTicket.value.resolvedAt = new Date().toISOString()
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to close ticket'
      console.error('Error closing ticket:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Subscribe to realtime ticket updates
   * Returns cleanup function
   */
  function subscribeToTicket(ticketId: string): () => void {
    const channel = supabase
      .channel(`ticket:${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets',
          filter: `id=eq.${ticketId}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' && currentTicket.value?.id === ticketId) {
            const row = payload.new as Record<string, unknown>
            currentTicket.value = {
              ...currentTicket.value,
              status: row.status as SupportTicket['status'],
              assignedTo: row.assigned_to as string | null,
              updatedAt: row.updated_at as string,
              resolvedAt: row.resolved_at as string | null
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${ticketId}`
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>
          const newMessage: TicketMessage = {
            id: row.id as string,
            ticketId: row.ticket_id as string,
            senderId: row.sender_id as string,
            senderType: row.sender_type as TicketMessage['senderType'],
            message: row.message as string,
            attachments: (row.attachments as string[]) || [],
            createdAt: row.created_at as string
          }
          // Avoid duplicates
          if (!messages.value.find(m => m.id === newMessage.id)) {
            messages.value.push(newMessage)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  /**
   * Add ticket locally (for optimistic updates)
   */
  function addTicket(ticket: SupportTicket): void {
    tickets.value.unshift(ticket)
  }

  /**
   * Update ticket locally
   */
  function updateTicket(ticketId: string, updates: Partial<SupportTicket>): void {
    const index = tickets.value.findIndex(t => t.id === ticketId)
    if (index !== -1) {
      tickets.value[index] = { ...tickets.value[index], ...updates }
    }
    if (currentTicket.value?.id === ticketId) {
      currentTicket.value = { ...currentTicket.value, ...updates }
    }
  }

  /**
   * Clear current ticket
   */
  function clearCurrentTicket(): void {
    currentTicket.value = null
    messages.value = []
  }

  /**
   * Initialize store
   */
  async function initialize(): Promise<void> {
    await fetchTickets()
  }

  return {
    // State
    tickets,
    currentTicket,
    messages,
    chatHistory,
    isLoading,
    error,

    // Getters
    openTickets,
    resolvedTickets,
    openTicketsCount,

    // Actions
    fetchTickets,
    fetchTicket,
    createTicket,
    sendMessage,
    closeTicket,
    subscribeToTicket,
    addTicket,
    updateTicket,
    clearCurrentTicket,
    initialize
  }
})
