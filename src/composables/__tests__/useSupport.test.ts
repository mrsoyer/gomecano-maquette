import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSupport } from '../useSupport'
import { supabase } from '@/services/supabase'

// Mock Supabase with RPC support
vi.mock('@/services/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis()
    })),
    removeChannel: vi.fn()
  }
}))

describe('useSupport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchTickets', () => {
    it('should fetch user support tickets via RPC', async () => {
      const mockTickets = [
        {
          id: 'ticket-1',
          profile_id: 'user-1',
          subject: 'Cannot login',
          description: 'I cannot login to my account',
          category: 'technical',
          priority: 'high' as const,
          status: 'open' as const,
          assigned_to: null,
          resolved_at: null,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 'ticket-2',
          profile_id: 'user-1',
          subject: 'Billing question',
          description: 'Question about my invoice',
          category: 'billing',
          priority: 'normal' as const,
          status: 'resolved' as const,
          assigned_to: 'agent-1',
          resolved_at: '2024-01-16T14:00:00Z',
          created_at: '2024-01-14T09:00:00Z',
          updated_at: '2024-01-16T14:00:00Z'
        }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockTickets,
        error: null
      } as never)

      const { fetchTickets, tickets, loading, error } = useSupport()

      expect(loading.value).toBe(false)

      await fetchTickets()

      expect(tickets.value).toEqual(mockTickets)
      expect(error.value).toBe(null)
      expect(loading.value).toBe(false)
      expect(supabase.rpc).toHaveBeenCalledWith('account_get_support_tickets')
    })

    it('should handle empty tickets list', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [],
        error: null
      } as never)

      const { fetchTickets, tickets } = useSupport()

      await fetchTickets()

      expect(tickets.value).toEqual([])
    })

    it('should handle fetch error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      } as never)

      const { fetchTickets, error } = useSupport()

      await fetchTickets()

      expect(error.value).toBe('Failed to fetch tickets')
    })

    it('should set loading state during fetch', async () => {
      vi.mocked(supabase.rpc).mockImplementationOnce(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({ data: [], error: null } as never), 100)
        )
      )

      const { fetchTickets, loading } = useSupport()

      const promise = fetchTickets()
      expect(loading.value).toBe(true)

      await promise
      expect(loading.value).toBe(false)
    })
  })

  describe('fetchTicket', () => {
    it('should fetch single ticket with messages via RPC', async () => {
      const mockTicketData = {
        ticket: {
          id: 'ticket-1',
          profile_id: 'user-1',
          subject: 'Technical issue',
          description: 'App is slow',
          category: 'technical',
          priority: 'normal' as const,
          status: 'in_progress' as const,
          assigned_to: 'agent-1',
          resolved_at: null,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T12:00:00Z'
        },
        messages: [
          {
            id: 'msg-1',
            ticket_id: 'ticket-1',
            sender_id: 'user-1',
            message: 'The app is running very slow',
            is_internal: false,
            created_at: '2024-01-15T10:00:00Z',
            sender: {
              first_name: 'John',
              last_name: 'Doe',
              avatar_url: null
            }
          },
          {
            id: 'msg-2',
            ticket_id: 'ticket-1',
            sender_id: 'agent-1',
            message: 'We are investigating the issue',
            is_internal: false,
            created_at: '2024-01-15T12:00:00Z',
            sender: {
              first_name: 'Support',
              last_name: 'Agent',
              avatar_url: null
            }
          }
        ]
      }

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockTicketData,
        error: null
      } as never)

      const { fetchTicket, currentTicket, messages, error } = useSupport()

      await fetchTicket('ticket-1')

      expect(currentTicket.value).toEqual(mockTicketData.ticket)
      expect(messages.value).toEqual(mockTicketData.messages)
      expect(error.value).toBe(null)
      expect(supabase.rpc).toHaveBeenCalledWith('account_get_support_ticket', {
        p_ticket_id: 'ticket-1'
      })
    })

    it('should handle ticket not found', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: null
      } as never)

      const { fetchTicket, currentTicket, messages } = useSupport()

      await fetchTicket('nonexistent')

      expect(currentTicket.value).toBe(null)
      expect(messages.value).toEqual([])
    })

    it('should handle fetch ticket error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Ticket not found' }
      } as never)

      const { fetchTicket, error } = useSupport()

      await fetchTicket('ticket-1')

      expect(error.value).toBe('Failed to fetch ticket')
    })

    it('should set loading state during fetch', async () => {
      vi.mocked(supabase.rpc).mockImplementationOnce(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            data: { ticket: { id: 'ticket-1' }, messages: [] },
            error: null
          } as never), 100)
        )
      )

      const { fetchTicket, loading } = useSupport()

      const promise = fetchTicket('ticket-1')
      expect(loading.value).toBe(true)

      await promise
      expect(loading.value).toBe(false)
    })
  })

  describe('computed properties', () => {
    it('openTickets should filter open and in_progress tickets', async () => {
      const mockTickets = [
        { id: '1', status: 'open' },
        { id: '2', status: 'in_progress' },
        { id: '3', status: 'resolved' },
        { id: '4', status: 'closed' },
        { id: '5', status: 'waiting' }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockTickets,
        error: null
      } as never)

      const { fetchTickets, openTickets } = useSupport()

      await fetchTickets()

      expect(openTickets.value).toHaveLength(2)
      expect(openTickets.value.map(t => t.id)).toEqual(['1', '2'])
    })

    it('resolvedTickets should filter resolved and closed tickets', async () => {
      const mockTickets = [
        { id: '1', status: 'open' },
        { id: '2', status: 'in_progress' },
        { id: '3', status: 'resolved' },
        { id: '4', status: 'closed' },
        { id: '5', status: 'waiting' }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockTickets,
        error: null
      } as never)

      const { fetchTickets, resolvedTickets } = useSupport()

      await fetchTickets()

      expect(resolvedTickets.value).toHaveLength(2)
      expect(resolvedTickets.value.map(t => t.id)).toEqual(['3', '4'])
    })
  })

  describe('createTicket', () => {
    it('should create a new support ticket via RPC', async () => {
      const mockNewTicket = {
        id: 'ticket-3',
        profile_id: 'user-1',
        subject: 'New issue',
        description: 'I have a new problem',
        category: 'general',
        priority: 'normal' as const,
        status: 'open' as const,
        assigned_to: null,
        resolved_at: null,
        created_at: '2024-01-17T10:00:00Z',
        updated_at: '2024-01-17T10:00:00Z'
      }

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockNewTicket,
        error: null
      } as never)

      const { createTicket, tickets, error } = useSupport()

      const result = await createTicket({
        subject: 'New issue',
        description: 'I have a new problem'
      })

      expect(result.success).toBe(true)
      expect(result.ticket).toEqual(mockNewTicket)
      expect(error.value).toBe(null)
      expect(tickets.value).toContainEqual(mockNewTicket)
      expect(supabase.rpc).toHaveBeenCalledWith('account_create_support_ticket', {
        p_subject: 'New issue',
        p_description: 'I have a new problem',
        p_category: 'general',
        p_priority: 'normal'
      })
    })

    it('should use custom category and priority', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { id: 'ticket-4', category: 'billing', priority: 'high' },
        error: null
      } as never)

      const { createTicket } = useSupport()

      await createTicket({
        subject: 'Urgent billing issue',
        description: 'I was charged twice',
        category: 'billing',
        priority: 'high'
      })

      expect(supabase.rpc).toHaveBeenCalledWith('account_create_support_ticket', {
        p_subject: 'Urgent billing issue',
        p_description: 'I was charged twice',
        p_category: 'billing',
        p_priority: 'high'
      })
    })

    it('should handle create error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Subject is required' }
      } as never)

      const { createTicket, error } = useSupport()

      const result = await createTicket({
        subject: '',
        description: 'Test'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to create ticket')
      expect(error.value).toBe('Failed to create ticket')
    })

    it('should prepend new ticket to list', async () => {
      // First, load existing tickets
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [{ id: 'ticket-1' }],
        error: null
      } as never)

      const { fetchTickets, createTicket, tickets } = useSupport()
      await fetchTickets()

      // Now create a new ticket
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { id: 'ticket-2' },
        error: null
      } as never)

      await createTicket({
        subject: 'New',
        description: 'New ticket'
      })

      expect(tickets.value[0].id).toBe('ticket-2')
      expect(tickets.value[1].id).toBe('ticket-1')
    })

    it('should set loading state during creation', async () => {
      vi.mocked(supabase.rpc).mockImplementationOnce(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({ data: { id: 'ticket-1' }, error: null } as never), 100)
        )
      )

      const { createTicket, loading } = useSupport()

      const promise = createTicket({ subject: 'Test', description: 'Test' })
      expect(loading.value).toBe(true)

      await promise
      expect(loading.value).toBe(false)
    })
  })

  describe('sendMessage', () => {
    it('should send a message on a ticket via RPC', async () => {
      const mockMessage = {
        id: 'msg-3',
        ticket_id: 'ticket-1',
        sender_id: 'user-1',
        message: 'Thanks for the update',
        is_internal: false,
        created_at: '2024-01-15T14:00:00Z',
        sender: {
          first_name: 'John',
          last_name: 'Doe',
          avatar_url: null
        }
      }

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockMessage,
        error: null
      } as never)

      const { sendMessage, messages, error } = useSupport()

      const result = await sendMessage('ticket-1', 'Thanks for the update')

      expect(result.success).toBe(true)
      expect(result.message).toEqual(mockMessage)
      expect(error.value).toBe(null)
      expect(messages.value).toContainEqual(mockMessage)
      expect(supabase.rpc).toHaveBeenCalledWith('account_send_ticket_message', {
        p_ticket_id: 'ticket-1',
        p_message: 'Thanks for the update'
      })
    })

    it('should append message to existing messages', async () => {
      // First, fetch ticket with existing messages
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: {
          ticket: { id: 'ticket-1' },
          messages: [{ id: 'msg-1', message: 'First message' }]
        },
        error: null
      } as never)

      const { fetchTicket, sendMessage, messages } = useSupport()
      await fetchTicket('ticket-1')

      expect(messages.value).toHaveLength(1)

      // Now send a new message
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { id: 'msg-2', message: 'Second message' },
        error: null
      } as never)

      await sendMessage('ticket-1', 'Second message')

      expect(messages.value).toHaveLength(2)
      expect(messages.value[1].message).toBe('Second message')
    })

    it('should handle send error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Ticket is closed' }
      } as never)

      const { sendMessage, error } = useSupport()

      const result = await sendMessage('ticket-1', 'Test')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to send message')
      expect(error.value).toBe('Failed to send message')
    })
  })

  describe('closeTicket', () => {
    it('should close a ticket via RPC', async () => {
      // First load tickets
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [{ id: 'ticket-1', status: 'open' }],
        error: null
      } as never)

      const { fetchTickets, closeTicket, tickets, error } = useSupport()
      await fetchTickets()

      // Now close the ticket
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { success: true },
        error: null
      } as never)

      const result = await closeTicket('ticket-1')

      expect(result.success).toBe(true)
      expect(error.value).toBe(null)
      expect(tickets.value[0].status).toBe('closed')
      expect(supabase.rpc).toHaveBeenCalledWith('account_close_support_ticket', {
        p_ticket_id: 'ticket-1'
      })
    })

    it('should update currentTicket status when viewing the ticket', async () => {
      // First fetch the ticket
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: {
          ticket: { id: 'ticket-1', status: 'open' },
          messages: []
        },
        error: null
      } as never)

      const { fetchTicket, closeTicket, currentTicket } = useSupport()
      await fetchTicket('ticket-1')

      expect(currentTicket.value?.status).toBe('open')

      // Now close it
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { success: true },
        error: null
      } as never)

      await closeTicket('ticket-1')

      expect(currentTicket.value?.status).toBe('closed')
    })

    it('should handle close error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Ticket already closed' }
      } as never)

      const { closeTicket, error } = useSupport()

      const result = await closeTicket('ticket-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to close ticket')
      expect(error.value).toBe('Failed to close ticket')
    })
  })

  describe('subscribeToTicket', () => {
    it('should set up realtime subscription for messages and ticket updates', () => {
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis()
      }
      vi.mocked(supabase.channel).mockReturnValue(mockChannel as never)

      const { subscribeToTicket } = useSupport()

      const cleanup = subscribeToTicket('ticket-1')

      expect(supabase.channel).toHaveBeenCalledWith('ticket:ticket-1')
      // First on() call for ticket_messages table
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: 'ticket_id=eq.ticket-1'
        },
        expect.any(Function)
      )
      // Second on() call for support_tickets table
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'support_tickets',
          filter: 'id=eq.ticket-1'
        },
        expect.any(Function)
      )
      expect(mockChannel.subscribe).toHaveBeenCalled()
      expect(typeof cleanup).toBe('function')
    })

    it('should cleanup channel on unsubscribe', () => {
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis()
      }
      vi.mocked(supabase.channel).mockReturnValue(mockChannel as never)

      const { subscribeToTicket } = useSupport()

      const cleanup = subscribeToTicket('ticket-1')
      cleanup()

      expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel)
    })

    it('should add new message when received via subscription', () => {
      let messageCallback: ((payload: { new: unknown }) => void) | undefined

      const mockChannel = {
        on: vi.fn((event, config, callback) => {
          if (config.table === 'ticket_messages') {
            messageCallback = callback
          }
          return mockChannel
        }),
        subscribe: vi.fn().mockReturnThis()
      }
      vi.mocked(supabase.channel).mockReturnValue(mockChannel as never)

      const { subscribeToTicket, messages } = useSupport()

      subscribeToTicket('ticket-1')

      // Simulate receiving a new message
      const newMessage = {
        id: 'msg-5',
        ticket_id: 'ticket-1',
        sender_id: 'agent-1',
        message: 'Realtime message',
        is_internal: false,
        created_at: '2024-01-15T15:00:00Z'
      }

      messageCallback?.({ new: newMessage })

      expect(messages.value).toContainEqual(newMessage)
    })

    it('should update currentTicket when ticket status changes', () => {
      let ticketCallback: ((payload: { new: unknown }) => void) | undefined

      const mockChannel = {
        on: vi.fn((event, config, callback) => {
          if (config.table === 'support_tickets') {
            ticketCallback = callback
          }
          return mockChannel
        }),
        subscribe: vi.fn().mockReturnThis()
      }
      vi.mocked(supabase.channel).mockReturnValue(mockChannel as never)

      const { subscribeToTicket, currentTicket } = useSupport()

      subscribeToTicket('ticket-1')

      // Simulate ticket status update
      const updatedTicket = {
        id: 'ticket-1',
        status: 'resolved',
        resolved_at: '2024-01-15T16:00:00Z'
      }

      ticketCallback?.({ new: updatedTicket })

      expect(currentTicket.value).toEqual(updatedTicket)
    })
  })
})
