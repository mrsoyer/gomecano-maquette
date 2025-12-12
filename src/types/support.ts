/**
 * Support Types - Tickets, chatbot, FAQ
 */

/**
 * Support ticket priority
 */
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

/**
 * Support ticket status
 */
export type TicketStatus = 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed'

/**
 * Support ticket category
 */
export type TicketCategory =
  | 'intervention'
  | 'payment'
  | 'vehicle'
  | 'account'
  | 'technical'
  | 'other'

/**
 * Support ticket
 */
export interface SupportTicket {
  id: string
  userId: string
  subject: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  assignedTo?: string // Support agent ID
  interventionId?: string // Related intervention if any
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  messages: TicketMessage[]
}

/**
 * Ticket message
 */
export interface TicketMessage {
  id: string
  ticketId: string
  author: 'user' | 'agent' | 'system'
  authorName: string
  content: string
  attachments?: TicketAttachment[]
  createdAt: string
}

/**
 * Ticket attachment
 */
export interface TicketAttachment {
  id: string
  name: string
  url: string
  type: string // MIME type
  size: number // bytes
}

/**
 * Chatbot message
 */
export interface ChatbotMessage {
  id: string
  author: 'user' | 'bot'
  content: string
  timestamp: string
  suggestions?: string[] // Quick reply suggestions
  isTyping?: boolean
}

/**
 * Chatbot conversation
 */
export interface ChatbotConversation {
  id: string
  userId: string
  messages: ChatbotMessage[]
  context: ChatbotContext
  createdAt: string
  updatedAt: string
}

/**
 * Chatbot context - tracks conversation state
 */
export interface ChatbotContext {
  intent?: string // Current intent (greeting, booking, question, etc.)
  entities?: Record<string, any> // Extracted entities
  lastInterventionId?: string
  lastVehicleId?: string
  previousIntents?: string[]
}

/**
 * Chatbot intent
 */
export type ChatbotIntent =
  | 'greeting'
  | 'booking_inquiry'
  | 'price_inquiry'
  | 'intervention_status'
  | 'cancel_booking'
  | 'reschedule_booking'
  | 'payment_question'
  | 'technical_support'
  | 'general_question'
  | 'faq'
  | 'goodbye'
  | 'unknown'

/**
 * Chatbot NLP pattern
 */
export interface ChatbotPattern {
  intent: ChatbotIntent
  patterns: string[] // Regex patterns
  responses: string[]
  requiresContext?: boolean
  followUpQuestions?: string[]
}

/**
 * FAQ article
 */
export interface FAQArticle {
  id: string
  category: string
  question: string
  answer: string
  tags: string[]
  helpful: number
  notHelpful: number
  relatedArticles: string[] // FAQ IDs
  lastUpdated: string
}

/**
 * FAQ category
 */
export interface FAQCategory {
  id: string
  name: string
  description: string
  icon: string
  articleCount: number
  order: number
}

/**
 * Knowledge base article
 */
export interface KnowledgeBaseArticle {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  author: string
  createdAt: string
  updatedAt: string
  views: number
  helpful: number
  notHelpful: number
}

/**
 * Support statistics
 */
export interface SupportStatistics {
  totalTickets: number
  openTickets: number
  resolvedTickets: number
  averageResponseTime: number // minutes
  averageResolutionTime: number // hours
  satisfactionRate: number // percentage
}

/**
 * Create ticket form data
 */
export interface CreateTicketData {
  subject: string
  description: string
  category: TicketCategory
  priority?: TicketPriority
  interventionId?: string
  attachments?: File[]
}

/**
 * Chatbot analytics
 */
export interface ChatbotAnalytics {
  totalConversations: number
  averageMessagesPerConversation: number
  intentDistribution: Record<ChatbotIntent, number>
  resolutionRate: number // percentage of conversations that resolved user's issue
  escalationRate: number // percentage that created a support ticket
}

