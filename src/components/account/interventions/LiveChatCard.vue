<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import type { ChatMessage } from '@/types/account'
import type { Mechanic } from '@/types/user'

interface Props {
  messages: ChatMessage[]
  mechanic: Mechanic
}

const props = defineProps<Props>()

const emit = defineEmits<{
  sendMessage: [content: string]
}>()

const newMessage = ref('')
const messagesContainer = ref<HTMLDivElement | null>(null)

/**
 * Format timestamp
 */
function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Send message
 */
async function handleSendMessage(): Promise<void> {
  if (!newMessage.value.trim()) return

  emit('sendMessage', newMessage.value.trim())
  newMessage.value = ''

  // Scroll to bottom
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

/**
 * Sorted messages (chronological)
 */
const sortedMessages = computed(() => {
  return [...props.messages].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
})
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="bg-blue-50 border-b border-blue-200 p-3 md:p-4">
      <div class="flex items-center gap-2 md:gap-3">
        <div class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-primary text-white flex items-center justify-center font-bold text-sm">
          {{ mechanic.name.split(' ').map(n => n[0]).join('') }}
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-sm md:text-base font-bold text-gray-900">{{ mechanic.name }}</h3>
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 rounded-full bg-green-500"></div>
            <span class="text-xs text-gray-600">En ligne</span>
          </div>
        </div>
        <Icon icon="mdi:message-text" class="w-5 h-5 md:w-6 md:h-6 text-blue-primary" />
      </div>
    </div>

    <!-- Messages -->
    <div
      ref="messagesContainer"
      class="p-3 md:p-4 space-y-2 md:space-y-3 overflow-y-auto"
      style="height: 300px;"
    >
      <!-- Empty State -->
      <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center">
        <Icon icon="mdi:message-outline" class="w-12 h-12 md:w-16 md:h-16 text-gray-300 mb-2" />
        <p class="text-sm text-gray-500">Aucun message</p>
        <p class="text-xs text-gray-400">Commencez la conversation</p>
      </div>

      <!-- Messages List -->
      <div
        v-for="message in sortedMessages"
        :key="message.id"
        :class="[
          'flex',
          message.sender === 'client' ? 'justify-end' : 'justify-start'
        ]"
      >
        <div
          :class="[
            'max-w-[75%] px-3 py-2 rounded-lg text-xs md:text-sm',
            message.sender === 'client'
              ? 'bg-blue-primary text-white rounded-br-none'
              : 'bg-gray-100 text-gray-900 rounded-bl-none'
          ]"
        >
          <p class="mb-1">{{ message.content }}</p>
          <span
            :class="[
              'text-[10px]',
              message.sender === 'client' ? 'text-blue-100' : 'text-gray-500'
            ]"
          >
            {{ formatTime(message.timestamp) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="border-t border-gray-200 p-3 md:p-4 bg-gray-50">
      <form @submit.prevent="handleSendMessage" class="flex gap-2">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Écrivez votre message..."
          class="flex-1 px-3 py-2 md:py-2.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-primary focus:ring-2 focus:ring-blue-200"
        />
        <button
          type="submit"
          :disabled="!newMessage.trim()"
          class="px-4 py-2 md:py-2.5 bg-blue-primary hover:bg-blue-dark disabled:bg-gray-300 text-white rounded-lg transition-all disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <Icon icon="mdi:send" class="w-4 h-4 md:w-5 md:h-5" />
          <span class="hidden md:inline text-sm font-semibold">Envoyer</span>
        </button>
      </form>
    </div>
  </div>
</template>
