/**
 * Tests for useChatbot composable
 * Session 09: MODULES migration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useChatbot } from '../useChatbot'

// Mock the services
vi.mock('@/services/supabase', () => ({
  callEdgeFunction: vi.fn()
}))

// Mock environment variable
vi.stubEnv('VITE_USE_MOCK_DATA', 'true')

describe('useChatbot', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const chatbot = useChatbot()

    expect(chatbot.messages.value).toEqual([])
    expect(chatbot.isTyping.value).toBe(false)
    expect(chatbot.isOpen.value).toBe(false)
    expect(chatbot.conversationId.value).toBeNull()
  })

  it('should add welcome message on initialize', () => {
    const chatbot = useChatbot()

    chatbot.initialize()

    expect(chatbot.messages.value).toHaveLength(1)
    expect(chatbot.messages.value[0].author).toBe('bot')
    expect(chatbot.messages.value[0].id).toBe('bot-welcome')
    expect(chatbot.messages.value[0].suggestions).toBeDefined()
  })

  it('should not add duplicate welcome message', () => {
    const chatbot = useChatbot()

    chatbot.initialize()
    chatbot.initialize()

    expect(chatbot.messages.value).toHaveLength(1)
  })

  it('should open chatbot and initialize', () => {
    const chatbot = useChatbot()

    chatbot.open()

    expect(chatbot.isOpen.value).toBe(true)
    expect(chatbot.messages.value).toHaveLength(1) // Welcome message
  })

  it('should close chatbot', () => {
    const chatbot = useChatbot()

    chatbot.open()
    chatbot.close()

    expect(chatbot.isOpen.value).toBe(false)
  })

  it('should toggle chatbot state', () => {
    const chatbot = useChatbot()

    expect(chatbot.isOpen.value).toBe(false)

    chatbot.toggle()
    expect(chatbot.isOpen.value).toBe(true)

    chatbot.toggle()
    expect(chatbot.isOpen.value).toBe(false)
  })

  it('should clear conversation and reinitialize', () => {
    const chatbot = useChatbot()

    chatbot.initialize()
    chatbot.messages.value.push({
      id: 'user-1',
      author: 'user',
      content: 'Test message',
      timestamp: new Date().toISOString()
    } as never)

    expect(chatbot.messages.value).toHaveLength(2)

    chatbot.clearConversation()

    expect(chatbot.messages.value).toHaveLength(1) // Only welcome message
    expect(chatbot.conversationId.value).toBeNull()
  })

  it('should add user message when sending', async () => {
    const chatbot = useChatbot()
    chatbot.initialize()

    // Start sending (we won't wait for completion in mock mode)
    const sendPromise = chatbot.sendMessage('Hello')

    // Check user message was added immediately
    expect(chatbot.messages.value).toHaveLength(2)
    expect(chatbot.messages.value[1].author).toBe('user')
    expect(chatbot.messages.value[1].content).toBe('Hello')

    await sendPromise
  })

  it('should set isTyping while processing', async () => {
    const chatbot = useChatbot()
    chatbot.initialize()

    const sendPromise = chatbot.sendMessage('Test')

    // isTyping should be true during processing
    expect(chatbot.isTyping.value).toBe(true)

    await sendPromise

    // isTyping should be false after completion
    expect(chatbot.isTyping.value).toBe(false)
  })

  it('should have all required methods', () => {
    const chatbot = useChatbot()

    expect(typeof chatbot.initialize).toBe('function')
    expect(typeof chatbot.sendMessage).toBe('function')
    expect(typeof chatbot.open).toBe('function')
    expect(typeof chatbot.close).toBe('function')
    expect(typeof chatbot.toggle).toBe('function')
    expect(typeof chatbot.clearConversation).toBe('function')
  })

  it('should return all required state', () => {
    const chatbot = useChatbot()

    expect(chatbot.messages).toBeDefined()
    expect(chatbot.isTyping).toBeDefined()
    expect(chatbot.isOpen).toBeDefined()
    expect(chatbot.conversationId).toBeDefined()
  })
})
