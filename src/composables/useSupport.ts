/**
 * Support Composable - Tickets and FAQ
 */

import { ref } from 'vue'
import type {
  SupportTicket,
  FAQArticle,
  FAQCategory,
  CreateTicketData
} from '@/types/support'
import {
  getUserTickets,
  getTicketById,
  createTicket,
  getFAQArticles,
  rateFAQArticle,
  mockFAQCategories
} from '@/mocks/support.mock'

/**
 * Support composable
 * 
 * @param userId - User ID
 * @returns Support state and methods
 */
export function useSupport(userId: string) {
  const tickets = ref<SupportTicket[]>([])
  const currentTicket = ref<SupportTicket | null>(null)
  const faqArticles = ref<FAQArticle[]>([])
  const faqCategories = ref<FAQCategory[]>(mockFAQCategories)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch user tickets
   */
  async function fetchTickets(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      console.log('[Support] Fetching tickets...')
      tickets.value = await getUserTickets(userId)
      console.log('[Support] Tickets loaded:', tickets.value.length)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load tickets'
      console.error('[Support] Error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch ticket by ID
   */
  async function fetchTicket(ticketId: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      currentTicket.value = await getTicketById(ticketId)
      console.log('[Support] Ticket loaded:', ticketId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load ticket'
      console.error('[Support] Error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create new ticket
   */
  async function submitTicket(data: CreateTicketData): Promise<SupportTicket> {
    isLoading.value = true
    error.value = null

    try {
      console.log('[Support] Creating ticket...')
      const newTicket = await createTicket(userId, data)
      tickets.value.unshift(newTicket)
      console.log('[Support] Ticket created:', newTicket.id)
      return newTicket
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create ticket'
      console.error('[Support] Error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Search FAQ
   */
  async function searchFAQ(category?: string, query?: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      console.log('[Support] Searching FAQ...', { category, query })
      faqArticles.value = await getFAQArticles(category, query)
      console.log('[Support] FAQ results:', faqArticles.value.length)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search FAQ'
      console.error('[Support] Error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Rate FAQ article as helpful/not helpful
   */
  async function rateFAQ(articleId: string, helpful: boolean): Promise<void> {
    try {
      await rateFAQArticle(articleId, helpful)
      
      // Update local article
      const article = faqArticles.value.find(a => a.id === articleId)
      if (article) {
        if (helpful) {
          article.helpful++
        } else {
          article.notHelpful++
        }
      }
      
      console.log('[Support] FAQ rated:', articleId, helpful)
    } catch (err) {
      console.error('[Support] Error rating FAQ:', err)
    }
  }

  return {
    // State
    tickets,
    currentTicket,
    faqArticles,
    faqCategories,
    isLoading,
    error,
    
    // Methods
    fetchTickets,
    fetchTicket,
    submitTicket,
    searchFAQ,
    rateFAQ
  }
}

