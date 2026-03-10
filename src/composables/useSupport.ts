import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'

interface SupportTicket {
  id: string
  profile_id: string
  subject: string
  description: string
  category: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'
  assigned_to: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

interface TicketMessage {
  id: string
  ticket_id: string
  sender_id: string
  message: string
  is_internal: boolean
  created_at: string
  sender?: {
    first_name: string
    last_name: string
    avatar_url: string | null
  }
}

/**
 * Composable for support ticket management
 * Uses Supabase RPC functions with built-in RLS
 */
export function useSupport() {
  const tickets = ref<SupportTicket[]>([])
  const currentTicket = ref<SupportTicket | null>(null)
  const messages = ref<TicketMessage[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const openTickets = computed(() =>
    tickets.value.filter(t => t.status === 'open' || t.status === 'in_progress')
  )

  const resolvedTickets = computed(() =>
    tickets.value.filter(t => t.status === 'resolved' || t.status === 'closed')
  )

  /**
   * Fetch user's support tickets via RPC
   */
  async function fetchTickets(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('account_get_support_tickets')

      if (fetchError) throw fetchError
      tickets.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch tickets'
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch a single ticket with messages via RPC
   */
  async function fetchTicket(ticketId: string): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('account_get_support_ticket', {
          p_ticket_id: ticketId
        })

      if (fetchError) throw fetchError

      if (data) {
        currentTicket.value = data.ticket as SupportTicket
        messages.value = (data.messages || []) as TicketMessage[]
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch ticket'
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new support ticket via RPC
   */
  async function createTicket(ticket: {
    subject: string
    description: string
    category?: string
    priority?: string
  }): Promise<{ success: boolean; ticket?: SupportTicket; error?: string }> {
    loading.value = true
    error.value = null

    try {
      const { data, error: createError } = await supabase
        .rpc('account_create_support_ticket', {
          p_subject: ticket.subject,
          p_description: ticket.description,
          p_category: ticket.category || 'general',
          p_priority: ticket.priority || 'normal'
        })

      if (createError) throw createError

      const newTicket = data as SupportTicket
      tickets.value = [newTicket, ...tickets.value]

      return { success: true, ticket: newTicket }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create ticket'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Send a message on a ticket via RPC
   */
  async function sendMessage(
    ticketId: string,
    message: string
  ): Promise<{ success: boolean; message?: TicketMessage; error?: string }> {
    error.value = null

    try {
      const { data, error: sendError } = await supabase
        .rpc('account_send_ticket_message', {
          p_ticket_id: ticketId,
          p_message: message
        })

      if (sendError) throw sendError

      const newMessage = data as TicketMessage
      messages.value = [...messages.value, newMessage]

      return { success: true, message: newMessage }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to send message'
      return { success: false, error: error.value }
    }
  }

  /**
   * Close a ticket via RPC
   */
  async function closeTicket(
    ticketId: string
  ): Promise<{ success: boolean; error?: string }> {
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
      }
      if (currentTicket.value?.id === ticketId) {
        currentTicket.value.status = 'closed'
      }

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to close ticket'
      return { success: false, error: error.value }
    }
  }

  /**
   * Subscribe to real-time ticket updates
   * Returns cleanup function
   */
  function subscribeToTicket(ticketId: string): () => void {
    const channel = supabase
      .channel(`ticket:${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${ticketId}`
        },
        (payload) => {
          messages.value = [...messages.value, payload.new as TicketMessage]
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'support_tickets',
          filter: `id=eq.${ticketId}`
        },
        (payload) => {
          currentTicket.value = payload.new as SupportTicket
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  return {
    // State
    tickets,
    currentTicket,
    messages,
    loading,
    error,

    // Computed
    openTickets,
    resolvedTickets,

    // Methods
    fetchTickets,
    fetchTicket,
    createTicket,
    sendMessage,
    closeTicket,
    subscribeToTicket
  }
}
